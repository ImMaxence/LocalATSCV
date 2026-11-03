// Génère src/app/cv/document/cv-document.ts à partir de CV_TEMPLATES (cv.model.ts) : un import
// et un bloc `@defer` par modèle, pour que chaque modèle soit un fichier chargé à la demande.
// À relancer après l'ajout ou le retrait d'un modèle, puis `npx prettier --write` sur le fichier.
//
//   node scripts/cv-document.mjs

import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const model = await readFile(new URL('src/app/cv/model/cv.model.ts', root), 'utf8');
const ids = [...model.matchAll(/\{ id: '([a-z0-9]+)', ats:/g)].map((match) => match[1]);
if (ids.length === 0) throw new Error('CV_TEMPLATES introuvable dans cv.model.ts');

/** Le modèle par défaut (DEFAULT_TEMPLATE) sert de cas `@default`. */
const fallback = /DEFAULT_TEMPLATE: CvTemplateId = '([a-z0-9]+)'/.exec(model)?.[1] ?? 'classic';
const className = (id) => `Cv${id.charAt(0).toUpperCase()}${id.slice(1)}`;
/** Imports par ordre alphabétique, toile du studio comprise. */
const sorted = [...ids, 'studio'].sort();

const tag = (id) => `<app-cv-${id} [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />`;
const block = (id) => `        @defer (on immediate) {\n          ${tag(id)}\n        }`;
const cases = [
  ['studio', ...ids.filter((id) => id !== fallback)]
    .map((id) => `      @case ('${id}') {\n${block(id)}\n      }`)
    .join('\n'),
  `      @default {\n${block(fallback)}\n      }`,
].join('\n');

const source = `import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { CoverLetter, DEFAULT_LAYOUT } from '../model/cv.model';
import { fontStack } from '../model/cv-fonts';
import { ResolvedCv } from '../model/resolve-cv';
import { scopeCss } from './custom-css';
import { avatarDataUrl } from './parts/avatar';
${sorted.map((id) => `import { ${className(id)} } from './templates/${id}/cv-${id}';`).join('\n')}

/** Largeur et hauteur d'une page A4 à 96 ppp. */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

/** Numéro de rendu : le CSS d'un style ne s'applique qu'au CV pour lequel il est injecté. */
let nextScope = 0;

/**
 * Ajoute une seule fois la feuille des polices de CV (bundle \`cv-fonts\` d'angular.json, non
 * injecté au démarrage pour alléger les pages qui n'affichent pas de CV).
 */
function loadCvFonts(document: Document): void {
  if (document.getElementById('cv-fonts')) return;
  const link = document.createElement('link');
  link.id = 'cv-fonts';
  link.rel = 'stylesheet';
  link.href = 'cv-fonts.css';
  document.head.appendChild(link);
}

/**
 * Rend le CV avec le modèle choisi. Utilisé par l'aperçu, les vignettes et l'export PDF.
 * Avec \`letter\`, rend la lettre de motivation : même modèle (en-tête, coordonnées, décor),
 * le corps de la lettre à la place des sections.
 *
 * Un style du studio remplace le modèle : la toile du studio (blocs et formes) ou un modèle de
 * la galerie, avec son CSS personnalisé confiné à ce CV (voir custom-css.ts).
 *
 * Chaque modèle est dans un bloc \`@defer\` : Angular en fait un fichier à part, chargé seulement
 * quand ce modèle est affiché (sinon les ${ids.length} modèles pèseraient plus de 700 Ko au premier
 * chargement). Le service worker les met tous en cache à l'installation, pour le hors-ligne.
 * Ce fichier est généré par scripts/cv-document.mjs à partir de CV_TEMPLATES.
 */
@Component({
  selector: 'app-cv-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
${sorted.map((id) => `    ${className(id)},`).join('\n')}
  ],
  host: {
    class: 'block',
    // Les langues des CV s'écrivent toutes de gauche à droite, même dans l'interface en arabe.
    dir: 'ltr',
    '[attr.data-cv-scope]': 'scope',
    '[style.--cv-heading-font]': 'headingFont()',
    '[style.--cv-body-font]': 'bodyFont()',
    '[style.--cv-space]': 'layout().spacing',
    '[style.--cv-leading]': 'leading()',
    '[style.--cv-zoom]': 'layout().scale',
  },
  template: \`
    @switch (templateId()) {
${cases}
    }
  \`,
})
export class CvDocument {
  readonly cv = input.required<ResolvedCv>();
  readonly photoUrl = input<string | null>(null);
  readonly letter = input<CoverLetter | null>(null);

  protected readonly scope = \`s\${++nextScope}\`;
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  /** Modèle affiché : celui du style s'il y en a un (toile du studio ou modèle de la galerie). */
  protected readonly templateId = computed(() => this.cv().style?.base ?? this.cv().template);

  /**
   * En mode lettre, le modèle ne garde que l'en-tête et les coordonnées. Un style à couleur
   * d'accent fixe l'impose au modèle.
   */
  protected readonly shown = computed((): ResolvedCv => {
    const cv = this.cv();
    const accentColor = cv.style?.colors.accent ?? cv.accentColor;
    return this.letter()
      ? { ...cv, accentColor, sections: [], profile: { ...cv.profile, summary: '' } }
      : { ...cv, accentColor };
  });

  /** Icône choisie à la place de la photo, dessinée à la couleur d'accent ; sinon la photo. */
  protected readonly shownPhoto = computed(() => {
    const { profile, accentColor } = this.shown();
    if (!profile.photoIcon || !this.browser) return this.photoUrl();
    return avatarDataUrl(profile.photoIcon, accentColor, profile.firstName, profile.lastName);
  });

  /** Espacements et taille du contenu (variables lues par tous les modèles). */
  protected readonly layout = computed(() => this.cv().layout ?? DEFAULT_LAYOUT);
  /** L'interligne suit les espacements, plus discrètement. */
  protected readonly leading = computed(() => 1 - (1 - this.layout().spacing) * 0.3);

  /** CSS du style, analysé seulement quand il change (pas à chaque frappe dans le CV). */
  private readonly customCss = computed(() => this.cv().style?.css ?? '');

  constructor() {
    loadCvFonts(inject(DOCUMENT));
    if (this.browser) {
      const host: HTMLElement = inject(ElementRef).nativeElement;
      const element = inject(DOCUMENT).createElement('style');
      effect(() => {
        element.textContent = scopeCss(this.customCss(), \`[data-cv-scope="\${this.scope}"]\`).css;
        if (element.textContent && !element.isConnected) host.prepend(element);
      });
    }
  }

  /** Polices choisies dans l'éditeur, sinon celles du style ; à défaut, celles du modèle. */
  protected readonly headingFont = computed(() =>
    fontStack(this.cv().fonts?.heading ?? this.cv().style?.fonts.heading ?? null),
  );
  protected readonly bodyFont = computed(() =>
    fontStack(this.cv().fonts?.body ?? this.cv().style?.fonts.body ?? null),
  );
}
`;

await writeFile(new URL('src/app/cv/document/cv-document.ts', root), source);
console.log(`cv-document.ts : ${ids.length} modèles + la toile du studio`);
