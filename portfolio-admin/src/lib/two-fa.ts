import crypto from 'crypto';

/**
 * Preuve de seconde facteur (2FA) liée au serveur.
 *
 * Historique de la faille : `authorize()` acceptait le mot de passe magique
 * `verified-2fa` SANS rien vérifier → n'importe qui pouvait appeler
 * `signIn('credentials', { password: 'verified-2fa' })` et obtenir une
 * session admin (contournement total de la 2FA).
 *
 * Correctif : la preuve 2FA est maintenant un cookie HttpOnly signé par le
 * serveur (HMAC-SHA256 sur NEXTAUTH_SECRET) émis UNIQUEMENT par
 * `/api/auth/verify-2fa` après validation réelle du code à 6 chiffres.
 * `authorize()` refuse de créer une session sans cette preuve valide.
 *
 * Le cookie est :
 *   - signé (falsification impossible sans NEXTAUTH_SECRET)
 *   - à expiration courte (5 min, fenêtre de passage au 2e facteur)
 *   - lié à l'email (une preuve pour un compte ne sert pas à un autre)
 *   - HttpOnly + Secure + SameSite=Lax (non lisible/émisible côté client)
 */

export const TWOFA_COOKIE_NAME = 'msk_2fa';
export const TWOFA_TTL_MS = 5 * 60 * 1000;

function hmac(payload: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is not defined');
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function timingSafeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Crée la valeur de cookie `payload.signature` pour cet email. */
export function signTwoFaProof(email: string, ttlMs: number = TWOFA_TTL_MS): {
  value: string;
  maxAgeSeconds: number;
} {
  const exp = Date.now() + ttlMs;
  const payload = `${String(email).toLowerCase()}|${exp}`;
  return {
    value: `${payload}.${hmac(payload)}`,
    maxAgeSeconds: Math.max(60, Math.round(ttlMs / 1000)),
  };
}

/** Vérifie intégrité + appartenance à l'email + expiration. */
export function verifyTwoFaProof(rawValue: string | undefined | null, email: string): boolean {
  if (!rawValue) return false;

  let value = rawValue;
  try {
    value = decodeURIComponent(rawValue);
  } catch {
    /* valeur déjà brute */
  }

  const sep = value.lastIndexOf('.');
  if (sep <= 0) return false;

  const payload = value.slice(0, sep);
  const signature = value.slice(sep + 1);
  if (!timingSafeEqualString(signature, hmac(payload))) return false;

  const parts = payload.split('|');
  if (parts.length !== 2) return false;

  const [payloadEmail, expRaw] = parts;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp)) return false;
  if (Date.now() > exp) return false;

  return payloadEmail === String(email || '').toLowerCase();
}

/** Lit un cookie depuis l'en-tête Cookie brut (indépendant du framework). */
export function readCookieHeader(
  cookieHeader: string | string[] | undefined,
  name: string
): string | undefined {
  const raw = Array.isArray(cookieHeader) ? cookieHeader.join('; ') : cookieHeader;
  if (!raw) return undefined;
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() !== name) continue;
    return part.slice(idx + 1).trim();
  }
  return undefined;
}

/** En-tête Set-Cookie de la preuve (HttpOnly, Secure, SameSite=Lax). */
export function buildTwoFaSetCookie(email: string): string {
  const { value, maxAgeSeconds } = signTwoFaProof(email);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${TWOFA_COOKIE_NAME}=${value}; Path=/; Max-Age=${maxAgeSeconds}; HttpOnly; SameSite=Lax${secure}`;
}

/** En-tête d'effacement (appelé après création de la session admin). */
export function buildTwoFaClearCookie(): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${TWOFA_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`;
}
