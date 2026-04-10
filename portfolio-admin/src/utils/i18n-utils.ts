/**
 * Resolves a localized field from a database object based on the current locale.
 * 
 * @param item - The database object containing potential localized fields (e.g., title, title_en, title_tr)
 * @param field - The base field name (e.g., 'title')
 * @param locale - The current active locale (e.g., 'en', 'tr', 'fr')
 * @param fallbackLocale - The locale to use if the requested locale's field is missing. Defaults to 'fr'.
 * @returns The localized string or the fallback string.
 */
export function getLocalized(
  item: any,
  field: string,
  locale: string | undefined,
  fallbackLocale: string = 'fr'
): string {
  if (!item) return '';

  const currentLocale = locale || fallbackLocale;
  
  // If the current locale is the same as the default language (typically 'fr'), return the base field
  if (currentLocale === fallbackLocale) {
    return item[field] || '';
  }

  // Construct the localized field name (e.g., 'title_en' or 'title_tr')
  const localizedField = `${field}_${currentLocale}`;
  
  // Return the localized field if it exists and is not empty, otherwise fallback to the base field
  return (item[localizedField] && item[localizedField].trim() !== '') 
    ? item[localizedField] 
    : (item[field] || '');
}

/**
 * Maps a list of database items to their localized versions.
 * 
 * @param items - Array of database objects
 * @param fields - Array of base field names to localize
 * @param locale - Current active locale
 * @returns Localized array of objects
 */
export function localizeList<T>(
  items: T[],
  fields: string[],
  locale: string | undefined
): T[] {
  if (!items || !Array.isArray(items)) return [];
  
  return items.map((item: any) => {
    const localizedItem = { ...item };
    fields.forEach(field => {
      localizedItem[field] = getLocalized(item, field, locale);
    });
    return localizedItem;
  });
}
