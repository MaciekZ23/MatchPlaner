/**
 * Zamienianie pierwszego znaku na wielką literę
 * Jeśli string jest pusty lub null, zwracany jest bez zmian
 */
export function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
