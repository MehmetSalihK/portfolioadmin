import path from 'path';

/**
 * Protection contre le path traversal (OWASP Top 10 A05 / ASVS V5).
 *
 * Toute entrée utilisateur (nom de fichier, id de média, chemin d'envoi...)
 * doit passer par `resolveSafePath` qui :
 *   1. refuse les caractères de contrôle / NUL
 *   2. refuse les segments absolus
 *   3. refuse tout segment `..` (y compris avec `\`)
 *   4. vérifie après résolution que le chemin reste DANS la racine attendue
 */

const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

export function isPathInside(candidate: string, root: string): boolean {
  const rel = path.relative(root, candidate);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * Construit un chemin sûr sous `root`.
 * @returns le chemin résolu, ou `null` si l'entrée est dangereuse.
 */
export function resolveSafePath(root: string, ...segments: string[]): string | null {
  for (const seg of segments) {
    if (typeof seg !== 'string' || seg.length === 0) return null;
    if (CONTROL_CHARS.test(seg)) return null;
    if (path.isAbsolute(seg)) return null;
    if (seg.split(/[\\/]/).some((part) => part === '..')) return null;
  }

  const resolved = path.resolve(root, ...segments);
  if (!isPathInside(resolved, root)) return null;
  return resolved;
}

/** Racine standard des uploads (public/uploads). */
export function uploadsRoot(): string {
  return path.join(process.cwd(), 'public', 'uploads');
}
