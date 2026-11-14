import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimitCheck, clientKey, resolveClientIp } from '@/utils/rateLimit';
import { getToken } from 'next-auth/jwt';

/**
 * Middleware de sécurité (OWASP ASVS V4.3 / Top 10 A04, A05, DDoS).
 *
 * Deux missions :
 *  1. Rate limiting sur TOUTES les routes /api (l'ancien matcher excluait
 *     /api/* : la protection était littéralement morte) avec un compteur
 *     partagé quand un backend Upstash est configuré (voir utils/rateLimit).
 *  2. Garde de session côté serveur sur les pages /admin : le simple fait
 *     d'ouvrir /admin/projects sans session redirige vers la connexion.
 *     (Le contrôle de rôle reste dans chaque route API via requireAdmin.)
 *
 * Exemptions de la garde : les pages d'authentification elles-mêmes.
 */

const AUTH_PAGES = ['/admin/login', '/admin/verify-2fa'];
const LOCALES = ['fr', 'en', 'tr'];

function isAdminPage(pathname: string): boolean {
  // Gère le préfixe de locale éventuel : /en/admin/..., /tr/admin/...
  const segments = pathname.split('/');
  if (LOCALES.includes(segments[1])) segments.splice(1, 1);
  const rest = segments.join('/');
  if (!rest.startsWith('/admin')) return false;
  const tail = rest.slice('/admin'.length);
  return tail === '' || tail.startsWith('/');
}

function authPageExempt(pathname: string): boolean {
  const segments = pathname.split('/');
  if (LOCALES.includes(segments[1])) segments.splice(1, 1);
  const rest = segments.join('/');
  return AUTH_PAGES.some((p) => rest === p || rest.startsWith(`${p}/`));
}

function localePrefix(pathname: string): string {
  const segments = pathname.split('/');
  return LOCALES.includes(segments[1]) ? `/${segments[1]}` : '';
}

function rateLimitPolicy(pathname: string): { scope: string; limit: number } {
  // Connexion / callbacks : stricte (credential stuffing).
  if (/^\/api\/auth\/(callback|signin)(\/|$)/.test(pathname)) {
    return { scope: 'auth:signin', limit: 10 };
  }
  // Reste de l'API d'authentification (csrf, session, providers…) : souple
  // mais réelle (le navigateur rafraîchit la session régulièrement).
  if (pathname.startsWith('/api/auth/')) {
    return { scope: 'auth', limit: 60 };
  }
  // Formulaire de contact / messagerie : anti-spam.
  if (pathname.startsWith('/api/contact') || pathname.startsWith('/api/messages')) {
    return { scope: 'contact', limit: 6 };
  }
  // Écriture des événements analytics : plafonnée.
  if (pathname.startsWith('/api/analytics/')) {
    return { scope: 'analytics', limit: 60 };
  }
  return { scope: 'api', limit: 120 };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* — 1. Rate limiting (toutes les routes API) — */
  if (pathname.startsWith('/api/')) {
    const ip = resolveClientIp(request);
    const { scope, limit } = rateLimitPolicy(pathname);

    // Sans IP exploitable : en production on limite quand même (compteur
    // partagé « unknown », fail-closed) ; en local, pas de limite faute de
    // signal fiable — la protection réelle vit en production.
    const enforce = Boolean(ip) || process.env.NODE_ENV === 'production';

    if (enforce) {
      const result = await rateLimitCheck({
        key: clientKey(scope, ip || 'unknown'),
        limit,
        windowMs: 60 * 1000,
      });

      if (result.limited) {
        return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': '0',
          },
        });
      }
    }
  }

  /* — 2. Pages admin : session serveur obligatoire — */
  if (isAdminPage(pathname) && !authPageExempt(pathname)) {
    let token: Awaited<ReturnType<typeof getToken>> = null;
    try {
      token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    } catch {
      token = null;
    }

    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = `${localePrefix(pathname)}/admin/login`;
      url.search = '';
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*',
    '/en/admin/:path*',
    '/tr/admin/:path*',
  ],
};
