import { getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { authOptions } from '../pages/api/auth/[...nextauth]';

/**
 * Garde d'authentification centralisée pour les routes API.
 *
 * Règle stricte (OWASP ASVS V4.3 / Top 10 A01) :
 *   - session NextAuth valide OBLIGATOIRE
 *   - rôle `admin` OBLIGATOIRE (le simple fait d'être connecté ne suffit pas)
 *
 * Utilisation :
 *   const guard = await requireAdmin(req, res);
 *   if (!guard) return;              // 401/403 déjà envoyés
 */

export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ user: Record<string, unknown> } | null> {
  let session: { user?: Record<string, unknown> } | null;
  try {
    session = (await getServerSession(req, res, authOptions)) as { user?: Record<string, unknown> } | null;
  } catch {
    return null;
  }

  if (!session || !session.user) {
    res.status(401).json({ error: 'Non authentifié' });
    return null;
  }

  if ((session.user as { role?: string }).role !== 'admin') {
    res.status(403).json({ error: 'Accès administrateur requis' });
    return null;
  }

  return { user: session.user };
}

/** Authentification seule (sans exigence de rôle admin). */
export async function requireSession(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<{ user: Record<string, unknown> } | null> {
  let session: { user?: Record<string, unknown> } | null;
  try {
    session = (await getServerSession(req, res, authOptions)) as { user?: Record<string, unknown> } | null;
  } catch {
    return null;
  }

  if (!session || !session.user) {
    res.status(401).json({ error: 'Non authentifié' });
    return null;
  }

  return { user: session.user };
}

/**
 * Exige le rôle admin sur TOUTES les méthodes sauf celles explicitement
 * listées dans `publicMethods` (ex. ['GET'] pour un endpoint de lecture public).
 */
export function withAdmin(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<unknown> | unknown,
  options: { publicMethods?: string[] } = {}
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const method = (req.method || 'GET').toUpperCase();
    const isPublic = (options.publicMethods || []).includes(method);
    if (!isPublic) {
      const guard = await requireAdmin(req, res);
      if (!guard) return;
    }
    return handler(req, res);
  };
}

/** Restrict méthodes HTTP : renvoie true si la méthode est autorisée, sinon écrit 405. */
export function allowMethods(req: NextApiRequest, res: NextApiResponse, allowed: string[]): boolean {
  const method = (req.method || 'GET').toUpperCase();
  if (!allowed.includes(method)) {
    res.setHeader('Allow', allowed);
    res.status(405).json({ error: 'Méthode non autorisée' });
    return false;
  }
  return true;
}
