/**
 * Formate une date en format local français
 * @param date - Date à formater (peut être un string ISO ou un objet Date)
 * @returns Date formatée en français
 */
export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Europe/Paris'
    });
}

/**
 * Formate une date en format court (sans les secondes)
 * @param date - Date à formater (peut être un string ISO ou un objet Date)
 * @returns Date formatée en français, format court
 */
export function formatDateShort(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris'
    });
}
