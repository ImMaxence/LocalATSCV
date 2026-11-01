import de from '../../../../public/i18n/de.json';
import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';
import fr from '../../../../public/i18n/fr.json';
import italian from '../../../../public/i18n/it.json';
import { UiLanguage } from './language.service';

// Typé par UiLanguage : ajouter une langue sans son fichier ne compile pas.
const TRANSLATIONS: Record<UiLanguage, object> = { fr, en, it: italian, es, de };

function flattenKeys(value: object, prefix = ''): string[] {
  return Object.entries(value).flatMap(([key, child]) =>
    typeof child === 'object' && child !== null
      ? flattenKeys(child, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );
}

describe('fichiers de traduction', () => {
  const reference = flattenKeys(fr).sort();

  for (const [lang, translation] of Object.entries(TRANSLATIONS)) {
    it(`${lang}.json contient exactement les clés du français`, () => {
      expect(flattenKeys(translation).sort()).toEqual(reference);
    });
  }
});

function flattenEntries(value: object, prefix = ''): [string, string][] {
  return Object.entries(value).flatMap(([key, child]): [string, string][] =>
    typeof child === 'object' && child !== null
      ? flattenEntries(child, `${prefix}${key}.`)
      : [[`${prefix}${key}`, String(child)]],
  );
}

// Choix éditorial : pas de point final dans l'interface, sauf dans les pages légales (clés `legal.*`).
describe('style des textes', () => {
  for (const [lang, translation] of Object.entries(TRANSLATIONS)) {
    it(`${lang}.json : aucun texte ne se termine par un point`, () => {
      const offenders = flattenEntries(translation)
        .filter(([key, text]) => !key.startsWith('legal.') && /(?<!\.)\.$/.test(text))
        .map(([key]) => key);
      expect(offenders).toEqual([]);
    });
  }
});
