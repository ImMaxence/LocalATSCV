/**
 * Après le build (postbuild) : écrit à côté de chaque page publique pré-générée sa version
 * Markdown (index.md), servie aussi aux requêtes « Accept: text/markdown » des assistants (voir
 * docker/nginx/default.conf), et llms-full.txt, tout le texte du site en un fichier.
 *
 * Le Markdown est tiré du HTML pré-généré : le titre et la description de la page, le contenu de
 * <main>, puis les liens du pied de page. Les éléments décoratifs (aria-hidden, icônes, boutons,
 * images, illustrations, surtitres) sont écartés.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import TurndownService from 'turndown';
import {
  PUBLIC_PAGES,
  UI_LANGUAGES,
  type UiLanguage,
  indexedLanguages,
  localizedPath,
  markdownPath,
} from '../src/app/core/i18n/languages.ts';

const SITE_URL = 'https://localatscv.mbonnici.fr';
const DIST = new URL('../dist/localatscv/browser/', import.meta.url);

const turndown = new TurndownService({
  headingStyle: 'atx',
  bulletListMarker: '-',
  codeBlockStyle: 'fenced',
  emDelimiter: '*',
});
// FAQ et méthode en <details> : la question devient un titre, la réponse le suit.
turndown.addRule('summary', {
  filter: 'summary',
  replacement: (content) => `\n\n### ${content.replace(/\s+/g, ' ').trim()}\n\n`,
});
// Puces compactes (« - texte ») plutôt que l'alignement sur quatre colonnes par défaut.
turndown.addRule('listItem', {
  filter: 'li',
  replacement: (content, node) => {
    const list = node.parentNode as HTMLElement;
    const index = Array.prototype.indexOf.call(list.children, node);
    const prefix = list.nodeName === 'OL' ? `${index + 1}. ` : '- ';
    const text = content.trim().replace(/\n/g, `\n${' '.repeat(prefix.length)}`);
    return `${prefix}${text}${node.nextSibling ? '\n' : ''}`;
  },
});

interface PageMarkdown {
  lang: UiLanguage;
  page: string;
  /** Le titre, la description et le contenu, pour llms-full.txt. */
  body: string;
  /** La même chose suivie des liens du pied de page et de l'adresse de la page, pour index.md. */
  full: string;
}

const text = (element: Element | null) => element?.textContent?.replace(/\s+/g, ' ').trim() ?? '';

/** Ce qui ne porte pas de texte utile : décor, icônes, illustrations, surtitres, contrôles. */
const DECORATION =
  'script, style, svg, img, figure, button, input, select, textarea, [aria-hidden="true"], .eyebrow';

/** Le HTML d'une page, préparé pour Turndown (dont les règles de suppression passent après les autres). */
function prepare(document: Document): void {
  document.querySelectorAll(DECORATION).forEach((element) => element.remove());
  for (const link of document.querySelectorAll('a[href^="/"]')) {
    link.setAttribute('href', SITE_URL + link.getAttribute('href'));
  }
  // Des cartes (titre et texte) plutôt qu'une liste : elles deviennent de simples sections.
  for (const list of document.querySelectorAll('main ul, main ol')) {
    if (![...list.children].some((item) => item.querySelector('h2, h3, h4'))) continue;
    const div = document.createElement('div');
    for (const item of [...list.children]) {
      const card = document.createElement('div');
      card.append(...item.childNodes);
      div.append(card);
    }
    list.replaceWith(div);
  }
}

function toMarkdown(lang: UiLanguage, page: string): PageMarkdown {
  const path = localizedPath(page, lang);
  const file = new URL(`.${path === '/' ? '' : path}/index.html`, DIST);
  const { document } = new JSDOM(readFileSync(file, 'utf8')).window;
  const main = document.querySelector('main');
  if (!main) throw new Error(`${path} : pas de <main> dans le HTML pré-généré`);
  prepare(document);

  // Le titre de la page en tête, ses lignes séparées (« Le CV qui décroche l'entretien · Prêt en… »).
  const h1 = main.querySelector('h1');
  h1?.querySelectorAll('.block').forEach((line) => line.before(' · '));
  const title = text(h1) || document.title;
  h1?.remove();
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
  const content = turndown
    .turndown(main)
    // Boutons côte à côte : un séparateur entre deux liens accolés.
    .replace(/\)(?=\[)/g, ') · ');
  const body = `# ${title}\n\n> ${description}\n\n${content}`;

  const navigation = [...document.querySelectorAll('footer nav')].map((nav) => {
    const heading = nav.querySelector('h2');
    const name = text(heading) || nav.getAttribute('aria-label');
    heading?.remove();
    return `## ${name}\n\n${turndown.turndown(nav)}`;
  });
  const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
  return {
    lang,
    page,
    body,
    full: `${[body, ...navigation, `---\n\n${canonical}`].join('\n\n')}\n`,
  };
}

const pages = UI_LANGUAGES.flatMap((lang) => PUBLIC_PAGES.map((page) => toMarkdown(lang, page)));
for (const { lang, page, full } of pages) {
  writeFileSync(new URL(`.${markdownPath(localizedPath(page, lang))}`, DIST), full);
}

// Tout le texte en un fichier : les pages en français, puis celles qui ont leur propre version
// anglaise (le journal des modifications n'est rédigé qu'en français).
const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const included = pages.filter(
  ({ lang, page }) => lang === 'fr' || (lang === 'en' && indexedLanguages(page).includes('en')),
);
const intro = `# LocalATSCV : texte intégral / full text

> Générateur de CV gratuit et open source optimisé pour les ATS, qui fonctionne entièrement dans le navigateur (version ${version}). Ci-dessous, chaque page en français puis en anglais. / Free, open source ATS-friendly resume builder that runs entirely in the browser (version ${version}). Below, every page in French, then in English.

Chaque page, dans chacune des ${UI_LANGUAGES.length} langues de l'interface, existe aussi seule en Markdown : son adresse suivie de index.md (${SITE_URL}/index.md, ${SITE_URL}/ja/analyze/index.md…), ou la même adresse demandée avec l'en-tête « Accept: text/markdown ». La liste des pages est dans ${SITE_URL}/llms.txt. / Every page in each of the ${UI_LANGUAGES.length} interface languages is also available as Markdown at its address followed by index.md, or at the same address requested with « Accept: text/markdown ».`;
writeFileSync(
  new URL('llms-full.txt', DIST),
  `${[intro, ...included.map(({ body }) => body)].join('\n\n---\n\n')}\n`,
);

console.log(`Markdown : ${pages.length} pages, llms-full.txt (${included.length} pages)`);
