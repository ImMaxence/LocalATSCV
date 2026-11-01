import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CoverLetter, DEFAULT_LAYOUT } from '../model/cv.model';
import { fontStack } from '../model/cv-fonts';
import { ResolvedCv } from '../model/resolve-cv';
import { CvAurora } from './templates/aurora/cv-aurora';
import { CvBauhaus } from './templates/bauhaus/cv-bauhaus';
import { CvBento } from './templates/bento/cv-bento';
import { CvBlueprint } from './templates/blueprint/cv-blueprint';
import { CvBrutal } from './templates/brutal/cv-brutal';
import { CvClassic } from './templates/classic/cv-classic';
import { CvDuotone } from './templates/duotone/cv-duotone';
import { CvEditorial } from './templates/editorial/cv-editorial';
import { CvElegant } from './templates/elegant/cv-elegant';
import { CvExecutive } from './templates/executive/cv-executive';
import { CvHexa } from './templates/hexa/cv-hexa';
import { CvImpact } from './templates/impact/cv-impact';
import { CvMemphis } from './templates/memphis/cv-memphis';
import { CvMinimal } from './templates/minimal/cv-minimal';
import { CvModern } from './templates/modern/cv-modern';
import { CvNocturne } from './templates/nocturne/cv-nocturne';
import { CvOrigami } from './templates/origami/cv-origami';
import { CvPrestige } from './templates/prestige/cv-prestige';
import { CvPrism } from './templates/prism/cv-prism';
import { CvPulse } from './templates/pulse/cv-pulse';
import { CvRibbon } from './templates/ribbon/cv-ribbon';
import { CvSidebar } from './templates/sidebar/cv-sidebar';
import { CvSignature } from './templates/signature/cv-signature';
import { CvSorbet } from './templates/sorbet/cv-sorbet';
import { CvSwiss } from './templates/swiss/cv-swiss';
import { CvTech } from './templates/tech/cv-tech';
import { CvThread } from './templates/thread/cv-thread';
import { CvTypo } from './templates/typo/cv-typo';
import { CvWave } from './templates/wave/cv-wave';
import { CvZen } from './templates/zen/cv-zen';

/** Largeur et hauteur d'une page A4 à 96 ppp. */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

/**
 * Ajoute une seule fois la feuille des polices de CV (bundle `cv-fonts` d'angular.json, non
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
 * Avec `letter`, rend la lettre de motivation : même modèle (en-tête, coordonnées, décor),
 * le corps de la lettre à la place des sections.
 */
@Component({
  selector: 'app-cv-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CvDuotone,
    CvExecutive,
    CvHexa,
    CvMemphis,
    CvOrigami,
    CvRibbon,
    CvSorbet,
    CvThread,
    CvTypo,
    CvZen,
    CvBauhaus,
    CvBento,
    CvBlueprint,
    CvBrutal,
    CvEditorial,
    CvNocturne,
    CvPrestige,
    CvPrism,
    CvSwiss,
    CvWave,
    CvSignature,
    CvAurora,
    CvPulse,
    CvClassic,
    CvImpact,
    CvModern,
    CvElegant,
    CvTech,
    CvMinimal,
    CvSidebar,
  ],
  host: {
    class: 'block',
    '[style.--cv-heading-font]': 'headingFont()',
    '[style.--cv-body-font]': 'bodyFont()',
    '[style.--cv-space]': 'layout().spacing',
    '[style.--cv-leading]': 'leading()',
    '[style.--cv-zoom]': 'layout().scale',
  },
  template: `
    @switch (cv().template) {
      @case ('bauhaus') {
        <app-cv-bauhaus [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('bento') {
        <app-cv-bento [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('blueprint') {
        <app-cv-blueprint [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('brutal') {
        <app-cv-brutal [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('editorial') {
        <app-cv-editorial [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('nocturne') {
        <app-cv-nocturne [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('prestige') {
        <app-cv-prestige [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('prism') {
        <app-cv-prism [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('swiss') {
        <app-cv-swiss [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('wave') {
        <app-cv-wave [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('duotone') {
        <app-cv-duotone [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('executive') {
        <app-cv-executive [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('hexa') {
        <app-cv-hexa [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('memphis') {
        <app-cv-memphis [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('origami') {
        <app-cv-origami [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('ribbon') {
        <app-cv-ribbon [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('sorbet') {
        <app-cv-sorbet [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('thread') {
        <app-cv-thread [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('typo') {
        <app-cv-typo [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('zen') {
        <app-cv-zen [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('signature') {
        <app-cv-signature [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('aurora') {
        <app-cv-aurora [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('pulse') {
        <app-cv-pulse [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('impact') {
        <app-cv-impact [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('modern') {
        <app-cv-modern [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('elegant') {
        <app-cv-elegant [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('tech') {
        <app-cv-tech [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('minimal') {
        <app-cv-minimal [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('sidebar') {
        <app-cv-sidebar [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @default {
        <app-cv-classic [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
    }
  `,
})
export class CvDocument {
  readonly cv = input.required<ResolvedCv>();
  readonly photoUrl = input<string | null>(null);
  readonly letter = input<CoverLetter | null>(null);

  /** En mode lettre, le modèle ne garde que l'en-tête et les coordonnées. */
  protected readonly shown = computed((): ResolvedCv => {
    const cv = this.cv();
    return this.letter() ? { ...cv, sections: [], profile: { ...cv.profile, summary: '' } } : cv;
  });

  /** Espacements et taille du contenu (variables lues par tous les modèles). */
  protected readonly layout = computed(() => this.cv().layout ?? DEFAULT_LAYOUT);
  /** L'interligne suit les espacements, plus discrètement. */
  protected readonly leading = computed(() => 1 - (1 - this.layout().spacing) * 0.3);

  constructor() {
    loadCvFonts(inject(DOCUMENT));
  }

  /** Polices choisies par l'utilisateur ; sinon chaque modèle garde les siennes. */
  protected readonly headingFont = computed(() => fontStack(this.cv().fonts?.heading ?? null));
  protected readonly bodyFont = computed(() => fontStack(this.cv().fonts?.body ?? null));
}
