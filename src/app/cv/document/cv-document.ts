import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CoverLetter, DEFAULT_LAYOUT } from '../model/cv.model';
import { fontStack } from '../model/cv-fonts';
import { ResolvedCv } from '../model/resolve-cv';
import { CvAcademic } from './templates/academic/cv-academic';
import { CvArcade } from './templates/arcade/cv-arcade';
import { CvAurora } from './templates/aurora/cv-aurora';
import { CvBauhaus } from './templates/bauhaus/cv-bauhaus';
import { CvBento } from './templates/bento/cv-bento';
import { CvBlueprint } from './templates/blueprint/cv-blueprint';
import { CvBotanical } from './templates/botanical/cv-botanical';
import { CvBrutal } from './templates/brutal/cv-brutal';
import { CvCircuit } from './templates/circuit/cv-circuit';
import { CvClassic } from './templates/classic/cv-classic';
import { CvComic } from './templates/comic/cv-comic';
import { CvCompact } from './templates/compact/cv-compact';
import { CvCosmos } from './templates/cosmos/cv-cosmos';
import { CvDuotone } from './templates/duotone/cv-duotone';
import { CvEditorial } from './templates/editorial/cv-editorial';
import { CvElegant } from './templates/elegant/cv-elegant';
import { CvExecutive } from './templates/executive/cv-executive';
import { CvGazette } from './templates/gazette/cv-gazette';
import { CvHexa } from './templates/hexa/cv-hexa';
import { CvHorizon } from './templates/horizon/cv-horizon';
import { CvImpact } from './templates/impact/cv-impact';
import { CvLedger } from './templates/ledger/cv-ledger';
import { CvMemphis } from './templates/memphis/cv-memphis';
import { CvMinimal } from './templates/minimal/cv-minimal';
import { CvModern } from './templates/modern/cv-modern';
import { CvMono } from './templates/mono/cv-mono';
import { CvMosaic } from './templates/mosaic/cv-mosaic';
import { CvNocturne } from './templates/nocturne/cv-nocturne';
import { CvNotebook } from './templates/notebook/cv-notebook';
import { CvOrigami } from './templates/origami/cv-origami';
import { CvOutline } from './templates/outline/cv-outline';
import { CvPolaroid } from './templates/polaroid/cv-polaroid';
import { CvPostal } from './templates/postal/cv-postal';
import { CvPrestige } from './templates/prestige/cv-prestige';
import { CvPrism } from './templates/prism/cv-prism';
import { CvPulse } from './templates/pulse/cv-pulse';
import { CvRetro } from './templates/retro/cv-retro';
import { CvRibbon } from './templates/ribbon/cv-ribbon';
import { CvSidebar } from './templates/sidebar/cv-sidebar';
import { CvSignature } from './templates/signature/cv-signature';
import { CvSoft } from './templates/soft/cv-soft';
import { CvSorbet } from './templates/sorbet/cv-sorbet';
import { CvSwiss } from './templates/swiss/cv-swiss';
import { CvTech } from './templates/tech/cv-tech';
import { CvTerminal } from './templates/terminal/cv-terminal';
import { CvThread } from './templates/thread/cv-thread';
import { CvTicket } from './templates/ticket/cv-ticket';
import { CvTopo } from './templates/topo/cv-topo';
import { CvTypo } from './templates/typo/cv-typo';
import { CvWatercolor } from './templates/watercolor/cv-watercolor';
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
    CvHorizon,
    CvPolaroid,
    CvTerminal,
    CvRetro,
    CvMosaic,
    CvCosmos,
    CvBotanical,
    CvTicket,
    CvComic,
    CvPostal,
    CvArcade,
    CvNotebook,
    CvCircuit,
    CvGazette,
    CvTopo,
    CvWatercolor,
    CvLedger,
    CvCompact,
    CvAcademic,
    CvMono,
    CvSoft,
    CvOutline,
  ],
  host: {
    class: 'block',
    // Les langues des CV s'écrivent toutes de gauche à droite, même dans l'interface en arabe.
    dir: 'ltr',
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
      @case ('horizon') {
        <app-cv-horizon [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('polaroid') {
        <app-cv-polaroid [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('terminal') {
        <app-cv-terminal [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('retro') {
        <app-cv-retro [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('mosaic') {
        <app-cv-mosaic [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('cosmos') {
        <app-cv-cosmos [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('botanical') {
        <app-cv-botanical [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('ticket') {
        <app-cv-ticket [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('comic') {
        <app-cv-comic [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('postal') {
        <app-cv-postal [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('arcade') {
        <app-cv-arcade [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('notebook') {
        <app-cv-notebook [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('circuit') {
        <app-cv-circuit [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('gazette') {
        <app-cv-gazette [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('topo') {
        <app-cv-topo [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('watercolor') {
        <app-cv-watercolor [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('ledger') {
        <app-cv-ledger [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('compact') {
        <app-cv-compact [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('academic') {
        <app-cv-academic [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('mono') {
        <app-cv-mono [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('soft') {
        <app-cv-soft [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
      }
      @case ('outline') {
        <app-cv-outline [cv]="shown()" [photoUrl]="photoUrl()" [letter]="letter()" />
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
