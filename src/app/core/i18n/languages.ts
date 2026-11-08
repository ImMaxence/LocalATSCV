/**
 * Langues de l'interface, dans l'ordre du menu. Le français, langue d'origine, est servi à la
 * racine du site ; chaque autre langue a ses pages publiques sous son propre préfixe (/en,
 * /pt-br…), pour être indexée séparément par les moteurs de recherche. La langue de chaque CV
 * est choisie à part.
 *
 * Fichier sans dépendance : il est aussi lu par scripts/sitemap.ts.
 */
export const UI_LANGUAGES = [
  'fr',
  'en',
  'es',
  'pt-BR',
  'pt-PT',
  'de',
  'it',
  'nl',
  'sv',
  'da',
  'nb',
  'fi',
  'et',
  'lv',
  'lt',
  'pl',
  'cs',
  'sk',
  'hu',
  'ro',
  'bg',
  'el',
  'hr',
  'sr',
  'sl',
  'uk',
  'ru',
  'tr',
  'ar',
  'he',
  'fa',
  'ja',
  'ko',
  'zh-CN',
  'zh-TW',
  'hi',
  'bn',
  'ur',
  'id',
  'ms',
  'th',
  'vi',
  'fil',
  'sw',
] as const;
export type UiLanguage = (typeof UI_LANGUAGES)[number];

export const DEFAULT_UI_LANGUAGE: UiLanguage = 'fr';

export interface LanguageInfo {
  /** Nom de la langue dans cette langue : chacun reconnaît la sienne dans le menu. */
  name: string;
  /** Valeur de la balise og:locale (aperçus de liens). */
  ogLocale: string;
  /** Écriture de droite à gauche. */
  rtl?: true;
  /** Code hreflang, quand il diffère du code de la langue. */
  hreflang?: string;
}

export const LANGUAGE_INFO: Record<UiLanguage, LanguageInfo> = {
  fr: { name: 'Français', ogLocale: 'fr_FR' },
  en: { name: 'English', ogLocale: 'en_US' },
  es: { name: 'Español', ogLocale: 'es_ES' },
  'pt-BR': { name: 'Português (Brasil)', ogLocale: 'pt_BR' },
  'pt-PT': { name: 'Português (Portugal)', ogLocale: 'pt_PT' },
  de: { name: 'Deutsch', ogLocale: 'de_DE' },
  it: { name: 'Italiano', ogLocale: 'it_IT' },
  nl: { name: 'Nederlands', ogLocale: 'nl_NL' },
  sv: { name: 'Svenska', ogLocale: 'sv_SE' },
  da: { name: 'Dansk', ogLocale: 'da_DK' },
  nb: { name: 'Norsk bokmål', ogLocale: 'nb_NO' },
  fi: { name: 'Suomi', ogLocale: 'fi_FI' },
  et: { name: 'Eesti', ogLocale: 'et_EE' },
  lv: { name: 'Latviešu', ogLocale: 'lv_LV' },
  lt: { name: 'Lietuvių', ogLocale: 'lt_LT' },
  pl: { name: 'Polski', ogLocale: 'pl_PL' },
  cs: { name: 'Čeština', ogLocale: 'cs_CZ' },
  sk: { name: 'Slovenčina', ogLocale: 'sk_SK' },
  hu: { name: 'Magyar', ogLocale: 'hu_HU' },
  ro: { name: 'Română', ogLocale: 'ro_RO' },
  bg: { name: 'Български', ogLocale: 'bg_BG' },
  el: { name: 'Ελληνικά', ogLocale: 'el_GR' },
  hr: { name: 'Hrvatski', ogLocale: 'hr_HR' },
  sr: { name: 'Српски', ogLocale: 'sr_RS' },
  sl: { name: 'Slovenščina', ogLocale: 'sl_SI' },
  uk: { name: 'Українська', ogLocale: 'uk_UA' },
  ru: { name: 'Русский', ogLocale: 'ru_RU' },
  tr: { name: 'Türkçe', ogLocale: 'tr_TR' },
  ar: { name: 'العربية', ogLocale: 'ar_AR', rtl: true },
  he: { name: 'עברית', ogLocale: 'he_IL', rtl: true },
  fa: { name: 'فارسی', ogLocale: 'fa_IR', rtl: true },
  ja: { name: '日本語', ogLocale: 'ja_JP' },
  ko: { name: '한국어', ogLocale: 'ko_KR' },
  'zh-CN': { name: '简体中文', ogLocale: 'zh_CN' },
  'zh-TW': { name: '繁體中文', ogLocale: 'zh_TW' },
  hi: { name: 'हिन्दी', ogLocale: 'hi_IN' },
  bn: { name: 'বাংলা', ogLocale: 'bn_BD' },
  ur: { name: 'اردو', ogLocale: 'ur_PK', rtl: true },
  id: { name: 'Bahasa Indonesia', ogLocale: 'id_ID' },
  ms: { name: 'Bahasa Melayu', ogLocale: 'ms_MY' },
  th: { name: 'ไทย', ogLocale: 'th_TH' },
  vi: { name: 'Tiếng Việt', ogLocale: 'vi_VN' },
  // hreflang n'accepte que les codes ISO 639-1 : le filipino y est noté tl (tagalog).
  fil: { name: 'Filipino', ogLocale: 'fil_PH', hreflang: 'tl' },
  sw: { name: 'Kiswahili', ogLocale: 'sw_KE' },
};

export function isUiLanguage(value: string | null | undefined): value is UiLanguage {
  return UI_LANGUAGES.includes(value as UiLanguage);
}

/** Anciens codes ou variantes que les navigateurs envoient encore. */
const ALIASES: Record<string, UiLanguage> = {
  no: 'nb',
  nn: 'nb',
  tl: 'fil',
  iw: 'he',
  in: 'id',
};

/** Langue de l'interface la plus proche d'une langue du navigateur (fr-CA → fr, zh-HK → zh-TW). */
export function matchLanguage(tag: string): UiLanguage | null {
  const lower = tag.toLowerCase();
  const exact = UI_LANGUAGES.find((lang) => lang.toLowerCase() === lower);
  if (exact) return exact;
  const [base, ...subtags] = lower.split('-');
  if (base === 'pt') return subtags.length === 0 || subtags.includes('br') ? 'pt-BR' : 'pt-PT';
  if (base === 'zh') {
    const traditional = subtags.some((part) => ['hant', 'tw', 'hk', 'mo'].includes(part));
    return traditional ? 'zh-TW' : 'zh-CN';
  }
  return isUiLanguage(base) ? base : (ALIASES[base] ?? null);
}

/** Pages publiques, pré-générées dans chaque langue (chemins sans le préfixe de langue). */
export const PUBLIC_PAGES = [
  '/',
  '/analyze',
  '/changelog',
  '/legal/notice',
  '/legal/terms',
  '/legal/privacy',
  '/legal/accessibility',
] as const;

/**
 * Langues dans lesquelles une page a un contenu propre, et donc indexé. Le journal des
 * modifications n'est rédigé qu'en anglais, les documents légaux en français et en anglais :
 * dans les autres langues, ces pages restent consultables mais portent noindex.
 */
export function indexedLanguages(page: string): readonly UiLanguage[] {
  if (page === '/changelog') return ['en'];
  if (page.startsWith('/legal/')) return ['fr', 'en'];
  return UI_LANGUAGES;
}

/** Segment d'URL d'une langue (pt-br), vide pour le français servi à la racine. */
export function languageSegment(lang: UiLanguage): string {
  return lang === DEFAULT_UI_LANGUAGE ? '' : lang.toLowerCase();
}

/** Chemin d'une page publique dans une langue : ('/analyze', 'ja') → '/ja/analyze', ('/', 'ja') → '/ja'. */
export function localizedPath(page: string, lang: UiLanguage): string {
  const segment = languageSegment(lang);
  if (!segment) return page;
  return page === '/' ? `/${segment}` : `/${segment}${page}`;
}

/** Version Markdown d'une page, écrite au build à côté de son HTML : '/' → '/index.md', '/ja' → '/ja/index.md'. */
export function markdownPath(path: string): string {
  return `${path.replace(/\/$/, '')}/index.md`;
}

/** Langue portée par le préfixe d'un chemin (/pt-br/analyze → pt-BR), ou null. */
export function languageFromPath(path: string): UiLanguage | null {
  const segment = path.split(/[/?#]/)[1]?.toLowerCase();
  if (!segment) return null;
  return (
    UI_LANGUAGES.find(
      (lang) => lang !== DEFAULT_UI_LANGUAGE && languageSegment(lang) === segment,
    ) ?? null
  );
}

/**
 * Page publique désignée par une URL, sans préfixe de langue ni ancre (/ja/analyze#x →
 * /analyze), ou null pour les pages de l'application (éditeur).
 */
export function publicPage(url: string): string | null {
  const path = url.split(/[?#]/)[0] || '/';
  const lang = languageFromPath(path);
  const page = lang ? path.slice(languageSegment(lang).length + 1) || '/' : path;
  return (PUBLIC_PAGES as readonly string[]).includes(page) ? page : null;
}
