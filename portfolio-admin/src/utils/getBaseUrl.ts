/**
 * Utilitaire pour obtenir l'URL de base selon l'environnement
 * @returns L'URL de base appropriée pour l'environnement actuel
 */
export function getBaseUrl(): string {
  // En production sur Vercel
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  // URL personnalisée définie dans les variables d'environnement
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  // Côté client - utiliser l'URL actuelle du navigateur
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // Fallback pour le développement local
  return 'http://localhost:3000';
}

/**
 * Obtient l'URL de prévisualisation pour l'interface admin
 * @returns L'URL de prévisualisation appropriée
 */
export function getPreviewUrl(): string {
  // Côté client - utiliser l'URL actuelle du navigateur sans le chemin admin
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Si on est sur une URL Vercel admin, retourner l'URL du site principal
    if (origin.includes('-admin.vercel.app')) {
      // Remplacer -admin par rien pour obtenir l'URL du site principal
      return origin.replace('-admin.vercel.app', '.vercel.app');
    }
    return origin;
  }
  
  return getBaseUrl();
}