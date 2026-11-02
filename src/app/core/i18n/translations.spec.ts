import ar from '../../../../public/i18n/ar.json';
import bg from '../../../../public/i18n/bg.json';
import bn from '../../../../public/i18n/bn.json';
import cs from '../../../../public/i18n/cs.json';
import da from '../../../../public/i18n/da.json';
import de from '../../../../public/i18n/de.json';
import el from '../../../../public/i18n/el.json';
import en from '../../../../public/i18n/en.json';
import es from '../../../../public/i18n/es.json';
import et from '../../../../public/i18n/et.json';
import fa from '../../../../public/i18n/fa.json';
import fi from '../../../../public/i18n/fi.json';
import fil from '../../../../public/i18n/fil.json';
import fr from '../../../../public/i18n/fr.json';
import he from '../../../../public/i18n/he.json';
import hi from '../../../../public/i18n/hi.json';
import hr from '../../../../public/i18n/hr.json';
import hu from '../../../../public/i18n/hu.json';
import id from '../../../../public/i18n/id.json';
import italian from '../../../../public/i18n/it.json';
import ja from '../../../../public/i18n/ja.json';
import ko from '../../../../public/i18n/ko.json';
import lt from '../../../../public/i18n/lt.json';
import lv from '../../../../public/i18n/lv.json';
import ms from '../../../../public/i18n/ms.json';
import nb from '../../../../public/i18n/nb.json';
import nl from '../../../../public/i18n/nl.json';
import pl from '../../../../public/i18n/pl.json';
import ptBR from '../../../../public/i18n/pt-BR.json';
import ptPT from '../../../../public/i18n/pt-PT.json';
import ro from '../../../../public/i18n/ro.json';
import ru from '../../../../public/i18n/ru.json';
import sk from '../../../../public/i18n/sk.json';
import sl from '../../../../public/i18n/sl.json';
import sr from '../../../../public/i18n/sr.json';
import sv from '../../../../public/i18n/sv.json';
import sw from '../../../../public/i18n/sw.json';
import th from '../../../../public/i18n/th.json';
import tr from '../../../../public/i18n/tr.json';
import uk from '../../../../public/i18n/uk.json';
import ur from '../../../../public/i18n/ur.json';
import vi from '../../../../public/i18n/vi.json';
import zhCN from '../../../../public/i18n/zh-CN.json';
import zhTW from '../../../../public/i18n/zh-TW.json';
import { UiLanguage } from './languages';

// Typé par UiLanguage : ajouter une langue sans son fichier ne compile pas.
const TRANSLATIONS: Record<UiLanguage, object> = {
  fr,
  en,
  es,
  'pt-BR': ptBR,
  'pt-PT': ptPT,
  de,
  it: italian,
  nl,
  sv,
  da,
  nb,
  fi,
  et,
  lv,
  lt,
  pl,
  cs,
  sk,
  hu,
  ro,
  bg,
  el,
  hr,
  sr,
  sl,
  uk,
  ru,
  tr,
  ar,
  he,
  fa,
  ja,
  ko,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  hi,
  bn,
  ur,
  id,
  ms,
  th,
  vi,
  fil,
  sw,
};

function flattenEntries(value: object, prefix = ''): [string, string][] {
  return Object.entries(value).flatMap(([key, child]): [string, string][] =>
    typeof child === 'object' && child !== null
      ? flattenEntries(child, `${prefix}${key}.`)
      : [[`${prefix}${key}`, String(child)]],
  );
}

const reference = new Map(flattenEntries(fr));
const english = new Map(flattenEntries(en));
const placeholders = (text: string) => [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).sort();

describe('fichiers de traduction', () => {
  for (const [lang, translation] of Object.entries(TRANSLATIONS)) {
    const entries = flattenEntries(translation);

    it(`${lang}.json contient exactement les clés du français`, () => {
      expect(entries.map(([key]) => key).sort()).toEqual([...reference.keys()].sort());
    });

    it(`${lang}.json garde les paramètres {{…}} du français`, () => {
      const offenders = entries
        .filter(([key, text]) => {
          const expected = reference.get(key);
          return expected !== undefined && placeholders(text).join() !== placeholders(expected).join();
        })
        .map(([key]) => key);
      expect(offenders).toEqual([]);
    });

    if (lang !== 'en') {
      // Garde-fou contre un fichier recopié de l'anglais et jamais traduit : seuls les noms
      // propres et termes techniques (LinkedIn, Bauhaus, FAQ…) peuvent rester identiques.
      it(`${lang}.json est traduit`, () => {
        const same = entries.filter(([key, text]) => english.get(key) === text).length;
        expect(same / entries.length).toBeLessThan(0.15);
      });
    }
  }
});

// Choix éditorial : pas de point final dans l'interface, sauf dans les pages légales (clés
// `legal.*`). Les points des écritures japonaise, chinoise, hindi et ourdoue comptent aussi.
describe('style des textes', () => {
  for (const [lang, translation] of Object.entries(TRANSLATIONS)) {
    it(`${lang}.json : aucun texte ne se termine par un point`, () => {
      const offenders = flattenEntries(translation)
        .filter(([key, text]) => !key.startsWith('legal.') && /(?:(?<!\.)\.|[。।۔])$/.test(text))
        .map(([key]) => key);
      expect(offenders).toEqual([]);
    });
  }
});

// Balises de surlignage de l'illustration de l'accueil (voir landing-demo.ts).
describe("textes de l'illustration de l'accueil", () => {
  const MARKED: [string, string][] = [
    ['landing.demo.bullets.production', '<k>'],
    ['landing.demo.bullets.opening', '<w>'],
    ['landing.demo.bullets.hygiene', '<k>'],
    ['landing.demo.robot', '<n>'],
  ];

  for (const [lang, translation] of Object.entries(TRANSLATIONS)) {
    it(`${lang}.json : balises présentes et bien fermées`, () => {
      const entries = new Map(flattenEntries(translation));
      for (const [key, tag] of MARKED) {
        const text = entries.get(key) ?? '';
        expect(text, key).toContain(tag);
        const unclosed = text.replace(/<([kwn])>.*?<\/\1>/g, '');
        expect(unclosed, key).not.toMatch(/<\/?[kwn]>/);
      }
    });
  }
});
