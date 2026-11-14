/**
 * Rate limiting compatible serverless (OWASP ASVS V4.3 / Top 10 DDoS & bot).
 *
 * Le limiter en mémoire d'origine ne valait que pour UNE instance : sur
 * Vercel (serverless, instances éphémères) il était contournable en
 * répartissant les requêtes, et son état disparaissait à chaque cold start.
 *
 * Architecture retenue :
 *   1. Backend partagé Upstash Redis (REST) si UPSTASH_REDIS_REST_URL et
 *      UPSTASH_REDIS_REST_TOKEN sont définis → compteur global fiable.
 *   2. Sinon : fenêtre en mémoire LOCALE, documentée comme best effort
 *      (jamais présentée comme une protection distribuée).
 *
 * Identification client :
 *   - `req.ip` fourni par la plateforme (Vercel) est la source fiable.
 *   - À défaut, premier saut de `x-forwarded-for`.
 *   - Sans aucune IP exploitable : en production on bascule sur un compteur
 *     partagé « inconnu » (fail-closed) ; en développement local on n'impose
 *     pas de limite faute de signal fiable (aucun exposé en production).
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import type { NextRequest } from 'next/server';

const DEFAULT_WINDOW_MS = 60 * 1000;
const LOCAL_MAX_KEYS = 5000;

type Bucket = { count: number; resetAt: number };

const localBuckets = new Map<string, Bucket>();

function firstForwardedHop(value: string | string[] | undefined): string {
  if (!value) return '';
  const raw = Array.isArray(value) ? value[0] : value;
  const first = String(raw).split(',')[0].trim();
  // Plafond 45 = longueur max d'une IPv6 ; refuse une valeur manifestement
  // polluée (injection d'en-tête, chaîne de débordement).
  return first.length > 0 && first.length <= 45 ? first : '';
}

/** IP client : source plateforme d'abord, sinon x-forwarded-for. */
export function resolveClientIp(req: {
  ip?: string;
  headers: NextApiRequest['headers'] | NextRequest['headers'] | Headers;
}): string {
  if (req.ip) return req.ip;

  const headers = req.headers as
    | Record<string, string | string[] | undefined>
    | Headers
    | undefined;

  let forwarded: string | string[] | undefined;
  let realIp: string | string[] | undefined;

  if (headers && typeof (headers as Headers).get === 'function') {
    // Middleware : instance Headers (API fetch/web).
    forwarded = (headers as Headers).get('x-forwarded-for') ?? undefined;
    realIp = (headers as Headers).get('x-real-ip') ?? undefined;
  } else {
    // Routes API Pages : objet d'en-têtes de Node.
    const record = (headers || {}) as Record<string, string | string[] | undefined>;
    forwarded = record['x-forwarded-for'];
    realIp = record['x-real-ip'];
  }

  return firstForwardedHop(forwarded) || firstForwardedHop(realIp);
}

/** Clé de limitation = portée + IP (une portée = un budget indépendant). */
export function clientKey(scope: string, ip: string): string {
  return `${scope}:${ip || 'unknown'}`;
}

function upstashConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ''), token } : null;
}

async function upstashIncrement(key: string, windowMs: number): Promise<number | null> {
  const cfg = upstashConfig();
  if (!cfg) return null;

  try {
    const inc = await fetch(`${cfg.url}/incr/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      cache: 'no-store',
    });
    if (!inc.ok) return null;
    const payload = (await inc.json()) as { result?: number };
    const count = typeof payload.result === 'number' ? payload.result : null;
    if (count === null) return null;

    // Premier passage de la fenêtre : on pose l'expiration.
    if (count === 1) {
      await fetch(`${cfg.url}/pexpire/${encodeURIComponent(key)}/${windowMs}`, {
        headers: { Authorization: `Bearer ${cfg.token}` },
        cache: 'no-store',
      });
    }
    return count;
  } catch {
    // Backend indisponible : on retombe sur la fenêtre locale plutôt que
    // de laisser passer sans limite (fail-soft documenté).
    return null;
  }
}

function localIncrement(key: string, windowMs: number): { count: number; resetAt: number } {
  const now = Date.now();
  let bucket = localBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    localBuckets.set(key, bucket);

    if (localBuckets.size > LOCAL_MAX_KEYS) {
      // Évince les fenêtres expirées, puis la plus ancienne.
      localBuckets.forEach((value, key) => {
        if (value.resetAt <= now) localBuckets.delete(key);
      });
      while (localBuckets.size > LOCAL_MAX_KEYS) {
        const oldest = localBuckets.keys().next().value;
        if (oldest === undefined) break;
        localBuckets.delete(oldest);
      }
    }
  }

  bucket.count += 1;
  return bucket;
}

export interface RateLimitResult {
  limited: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Incrémente le compteur de `key` et indique si la limite est dépassée.
 * `limit` autorisations par fenêtre glissante de `windowMs`.
 */
export async function rateLimitCheck(options: {
  key: string;
  limit: number;
  windowMs?: number;
}): Promise<RateLimitResult> {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const shared = await upstashIncrement(options.key, windowMs);

  if (shared !== null) {
    const resetAt = Date.now() + windowMs;
    return {
      limited: shared > options.limit,
      limit: options.limit,
      remaining: Math.max(0, options.limit - shared),
      resetAt,
    };
  }

  const bucket = localIncrement(options.key, windowMs);
  return {
    limited: bucket.count > options.limit,
    limit: options.limit,
    remaining: Math.max(0, options.limit - bucket.count),
    resetAt: bucket.resetAt,
  };
}

/** Ajoute les en-têtes standard de limitation sur la réponse. */
export function applyRateLimitHeaders(res: NextApiResponse, result: RateLimitResult): void {
  if (!res || typeof res.setHeader !== 'function') return;
  res.setHeader('X-RateLimit-Limit', String(result.limit));
  res.setHeader('X-RateLimit-Remaining', String(result.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(result.resetAt / 1000)));
}

export async function tooManyRequests(res: NextApiResponse, result: RateLimitResult): Promise<void> {
  applyRateLimitHeaders(res, result);
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000));
  res.setHeader('Retry-After', String(retryAfter));
  res.status(429).json({ error: 'Trop de requêtes, veuillez réessayer plus tard.' });
}

/**
 * Garde compacte pour une route API :
 *   const guard = await enforceRateLimit(req, res, 'auth:login', 10);
 *   if (guard) return;               // 429 déjà envoyé
 *
 * Retourne `true` si la requête doit être BLOQUÉE.
 */
export async function enforceRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  scope: string,
  limit: number,
  windowMs: number = DEFAULT_WINDOW_MS
): Promise<boolean> {
  const ip = resolveClientIp(req);

  // Développement local sans IP exploitable : pas de limite (le vrai garde
  // reste le garde de session ; la protection active vit en production).
  if (!ip && process.env.NODE_ENV !== 'production') return false;

  const result = await rateLimitCheck({
    key: clientKey(scope, ip || 'unknown'),
    limit,
    windowMs,
  });

  if (result.limited) {
    await tooManyRequests(res, result);
    return true;
  }

  applyRateLimitHeaders(res, result);
  return false;
}

const rateLimitApi = { rateLimitCheck, enforceRateLimit, resolveClientIp, clientKey };
export default rateLimitApi;
