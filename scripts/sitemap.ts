/**
 * Génère public/sitemap.xml : chaque page publique dans chaque langue où elle est indexée,
 * avec ses versions dans les autres langues (hreflang). Lancé avant chaque build (prebuild) ;
 * à relancer avec `npm run sitemap` après l'ajout d'une langue ou d'une page.
 */
import { writeFileSync } from 'node:fs';
import {
  LANGUAGE_INFO,
  PUBLIC_PAGES,
  indexedLanguages,
  localizedPath,
} from '../src/app/core/i18n/languages.ts';

const SITE_URL = 'https://localatscv.mbonnici.fr';
const url = (page: string, lang: Parameters<typeof localizedPath>[1]) =>
  `${SITE_URL}${localizedPath(page, lang)}`;

const entries = PUBLIC_PAGES.flatMap((page) => {
  const languages = indexedLanguages(page);
  const alternates =
    languages.length < 2
      ? []
      : [
          ...languages.map((lang) => [LANGUAGE_INFO[lang].hreflang ?? lang, url(page, lang)]),
          ['x-default', url(page, languages.includes('en') ? 'en' : languages[0])],
        ].map(
          ([hreflang, href]) =>
            `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}"/>`,
        );
  return languages.map((lang) =>
    [`  <url>`, `    <loc>${url(page, lang)}</loc>`, ...alternates, `  </url>`].join('\n'),
  );
});

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml : ${entries.length} adresses`);
