/**
 * Préférences légères de l'interface (thème, langue) stockées dans localStorage.
 * Les données du CV, elles, vivent dans IndexedDB.
 *
 * Chaque accès est protégé : localStorage peut lever une exception
 * (navigation privée stricte, stockage désactivé) et l'app doit continuer à fonctionner.
 */
const PREFIX = 'localatscv.';

export function readSetting(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function writeSetting(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // Stockage indisponible : la préférence ne sera simplement pas mémorisée.
  }
}
