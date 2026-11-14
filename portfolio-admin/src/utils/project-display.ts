/* Aides d'affichage des projets — données réelles uniquement,
   jamais de contenu fabriqué. */

/** Texte injecté par la sync GitHub (services/github.ts) quand un dépôt
 *  n'a pas de description : à masquer côté rendu public. */
export const PLACEHOLDER_DESCRIPTION = 'Aucune description disponible';

export function hasRealDescription(description?: string | null): boolean {
  const d = (description || '').trim();
  return d.length > 0 && d !== PLACEHOLDER_DESCRIPTION;
}

/** "sept. 2025" / "Sep 2025" / "Eyl 2025" — dernière mise à jour d'un dépôt. */
export function formatMonthYear(date?: string | Date | null, locale: string = 'fr'): string {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const loc = locale === 'tr' ? 'tr-TR' : locale === 'en' ? 'en-US' : 'fr-FR';
    return d.toLocaleDateString(loc, { month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}
