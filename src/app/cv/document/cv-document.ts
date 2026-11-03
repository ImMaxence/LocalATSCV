import { DOCUMENT, isPlatformBrowser } from '@angular/common';
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
import { CvAcademic } from './templates/academic/cv-academic';
import { CvAiry } from './templates/airy/cv-airy';
import { CvArcade } from './templates/arcade/cv-arcade';
import { CvArtdeco } from './templates/artdeco/cv-artdeco';
import { CvAurora } from './templates/aurora/cv-aurora';
import { CvBauhaus } from './templates/bauhaus/cv-bauhaus';
import { CvBento } from './templates/bento/cv-bento';
import { CvBlueprint } from './templates/blueprint/cv-blueprint';
import { CvBotanical } from './templates/botanical/cv-botanical';
import { CvBrutal } from './templates/brutal/cv-brutal';
import { CvCandy } from './templates/candy/cv-candy';
import { CvCards } from './templates/cards/cv-cards';
import { CvChrono } from './templates/chrono/cv-chrono';
import { CvCircuit } from './templates/circuit/cv-circuit';
import { CvClassic } from './templates/classic/cv-classic';
import { CvCollage } from './templates/collage/cv-collage';
import { CvComic } from './templates/comic/cv-comic';
import { CvCompact } from './templates/compact/cv-compact';
import { CvCosmos } from './templates/cosmos/cv-cosmos';
import { CvDuotone } from './templates/duotone/cv-duotone';
import { CvEditorial } from './templates/editorial/cv-editorial';
import { CvElegant } from './templates/elegant/cv-elegant';
import { CvExecutive } from './templates/executive/cv-executive';
import { CvFinance } from './templates/finance/cv-finance';
import { CvGazette } from './templates/gazette/cv-gazette';
import { CvGlass } from './templates/glass/cv-glass';
import { CvHexa } from './templates/hexa/cv-hexa';
import { CvHorizon } from './templates/horizon/cv-horizon';
import { CvImpact } from './templates/impact/cv-impact';
import { CvKraft } from './templates/kraft/cv-kraft';
import { CvLedger } from './templates/ledger/cv-ledger';
import { CvLinear } from './templates/linear/cv-linear';
import { CvLinocut } from './templates/linocut/cv-linocut';
import { CvMarble } from './templates/marble/cv-marble';
import { CvMemphis } from './templates/memphis/cv-memphis';
import { CvMetro } from './templates/metro/cv-metro';
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
import { CvRiso } from './templates/riso/cv-riso';
import { CvSidebar } from './templates/sidebar/cv-sidebar';
import { CvSignature } from './templates/signature/cv-signature';
import { CvSoft } from './templates/soft/cv-soft';
import { CvSorbet } from './templates/sorbet/cv-sorbet';
import { CvSplit } from './templates/split/cv-split';
import { CvStained } from './templates/stained/cv-stained';
import { CvSticker } from './templates/sticker/cv-sticker';
import { CvStudio } from './templates/studio/cv-studio';
import { CvSwiss } from './templates/swiss/cv-swiss';
import { CvTech } from './templates/tech/cv-tech';
import { CvTerminal } from './templates/terminal/cv-terminal';
import { CvThread } from './templates/thread/cv-thread';
import { CvTicket } from './templates/ticket/cv-ticket';
import { CvTopo } from './templates/topo/cv-topo';
import { CvTypewriter } from './templates/typewriter/cv-typewriter';
import { CvTypo } from './templates/typo/cv-typo';
import { CvWatercolor } from './templates/watercolor/cv-watercolor';
import { CvWave } from './templates/wave/cv-wave';
import { CvWireframe } from './templates/wireframe/cv-wireframe';
import { CvY2k } from './templates/y2k/cv-y2k';
import { CvZen } from './templates/zen/cv-zen';

/** Largeur et hauteur d'une page A4 à 96 ppp. */
export const PAGE_WIDTH = 794;
export const PAGE_HEIGHT = 1123;

/** Numéro de rendu : le CSS d'un style ne s'applique qu'au CV pour lequel il est injecté. */
let nextScope = 0;

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
 *
 * Un style du studio remplace le modèle : la toile du studio (blocs et formes) ou un modèle de
 * la galerie, avec son CSS personnalisé confiné à ce CV (voir custom-css.ts).
 *
 * Chaque modèle est dans un bloc `@defer` : Angular en fait un fichier à part, chargé seulement
 * quand ce modèle est affiché (sinon les 72 modèles pèseraient plus de 700 Ko au premier
 * chargement). Le service worker les met tous en cache à l'installation, pour le hors-ligne.
 * Ce fichier est généré par scripts/cv-document.mjs à partir de CV_TEMPLATES.
 */
@Component({
  selector: 'app-cv-document',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CvAcademic,
    CvAiry,
    CvArcade,
    CvArtdeco,
    CvAurora,
    CvBauhaus,
    CvBento,
    CvBlueprint,
    CvBotanical,
    CvBrutal,
    CvCandy,
    CvCards,
    CvChrono,
    CvCircuit,
    CvClassic,
    CvCollage,
    CvComic,
    CvCompact,
    CvCosmos,
    CvDuotone,
    CvEditorial,
    CvElegant,
    CvExecutive,
    CvFinance,
    CvGazette,
    CvGlass,
    CvHexa,
    CvHorizon,
    CvImpact,
    CvKraft,
    CvLedger,
    CvLinear,
    CvLinocut,
    CvMarble,
    CvMemphis,
    CvMetro,
    CvMinimal,
    CvModern,
    CvMono,
    CvMosaic,
    CvNocturne,
    CvNotebook,
    CvOrigami,
    CvOutline,
    CvPolaroid,
    CvPostal,
    CvPrestige,
    CvPrism,
    CvPulse,
    CvRetro,
    CvRibbon,
    CvRiso,
    CvSidebar,
    CvSignature,
    CvSoft,
    CvSorbet,
    CvSplit,
    CvStained,
    CvSticker,
    CvStudio,
    CvSwiss,
    CvTech,
    CvTerminal,
    CvThread,
    CvTicket,
    CvTopo,
    CvTypewriter,
    CvTypo,
    CvWatercolor,
    CvWave,
    CvWireframe,
    CvY2k,
    CvZen,
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
  template: `
    @switch (templateId()) {
      @case ('studio') {
        @defer (on immediate) {
          <app-cv-studio [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('aurora') {
        @defer (on immediate) {
          <app-cv-aurora [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('signature') {
        @defer (on immediate) {
          <app-cv-signature [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('bento') {
        @defer (on immediate) {
          <app-cv-bento [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('pulse') {
        @defer (on immediate) {
          <app-cv-pulse [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('memphis') {
        @defer (on immediate) {
          <app-cv-memphis [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('bauhaus') {
        @defer (on immediate) {
          <app-cv-bauhaus [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('brutal') {
        @defer (on immediate) {
          <app-cv-brutal [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('duotone') {
        @defer (on immediate) {
          <app-cv-duotone [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('editorial') {
        @defer (on immediate) {
          <app-cv-editorial [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('prism') {
        @defer (on immediate) {
          <app-cv-prism [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('nocturne') {
        @defer (on immediate) {
          <app-cv-nocturne [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('sorbet') {
        @defer (on immediate) {
          <app-cv-sorbet [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('wave') {
        @defer (on immediate) {
          <app-cv-wave [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('origami') {
        @defer (on immediate) {
          <app-cv-origami [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('hexa') {
        @defer (on immediate) {
          <app-cv-hexa [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('blueprint') {
        @defer (on immediate) {
          <app-cv-blueprint [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('typo') {
        @defer (on immediate) {
          <app-cv-typo [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('swiss') {
        @defer (on immediate) {
          <app-cv-swiss [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('thread') {
        @defer (on immediate) {
          <app-cv-thread [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('ribbon') {
        @defer (on immediate) {
          <app-cv-ribbon [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('zen') {
        @defer (on immediate) {
          <app-cv-zen [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('prestige') {
        @defer (on immediate) {
          <app-cv-prestige [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('impact') {
        @defer (on immediate) {
          <app-cv-impact [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('horizon') {
        @defer (on immediate) {
          <app-cv-horizon [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('polaroid') {
        @defer (on immediate) {
          <app-cv-polaroid [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('terminal') {
        @defer (on immediate) {
          <app-cv-terminal [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('retro') {
        @defer (on immediate) {
          <app-cv-retro [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('mosaic') {
        @defer (on immediate) {
          <app-cv-mosaic [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('cosmos') {
        @defer (on immediate) {
          <app-cv-cosmos [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('botanical') {
        @defer (on immediate) {
          <app-cv-botanical [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('ticket') {
        @defer (on immediate) {
          <app-cv-ticket [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('comic') {
        @defer (on immediate) {
          <app-cv-comic [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('postal') {
        @defer (on immediate) {
          <app-cv-postal [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('arcade') {
        @defer (on immediate) {
          <app-cv-arcade [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('notebook') {
        @defer (on immediate) {
          <app-cv-notebook [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('circuit') {
        @defer (on immediate) {
          <app-cv-circuit [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('gazette') {
        @defer (on immediate) {
          <app-cv-gazette [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('topo') {
        @defer (on immediate) {
          <app-cv-topo [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('watercolor') {
        @defer (on immediate) {
          <app-cv-watercolor [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('artdeco') {
        @defer (on immediate) {
          <app-cv-artdeco [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('glass') {
        @defer (on immediate) {
          <app-cv-glass [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('y2k') {
        @defer (on immediate) {
          <app-cv-y2k [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('riso') {
        @defer (on immediate) {
          <app-cv-riso [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('collage') {
        @defer (on immediate) {
          <app-cv-collage [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('marble') {
        @defer (on immediate) {
          <app-cv-marble [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('sticker') {
        @defer (on immediate) {
          <app-cv-sticker [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('kraft') {
        @defer (on immediate) {
          <app-cv-kraft [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('wireframe') {
        @defer (on immediate) {
          <app-cv-wireframe [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('chrono') {
        @defer (on immediate) {
          <app-cv-chrono [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('linocut') {
        @defer (on immediate) {
          <app-cv-linocut [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('candy') {
        @defer (on immediate) {
          <app-cv-candy [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('metro') {
        @defer (on immediate) {
          <app-cv-metro [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('stained') {
        @defer (on immediate) {
          <app-cv-stained [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('executive') {
        @defer (on immediate) {
          <app-cv-executive [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('modern') {
        @defer (on immediate) {
          <app-cv-modern [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('elegant') {
        @defer (on immediate) {
          <app-cv-elegant [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('tech') {
        @defer (on immediate) {
          <app-cv-tech [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('minimal') {
        @defer (on immediate) {
          <app-cv-minimal [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('sidebar') {
        @defer (on immediate) {
          <app-cv-sidebar [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('ledger') {
        @defer (on immediate) {
          <app-cv-ledger [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('compact') {
        @defer (on immediate) {
          <app-cv-compact [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('academic') {
        @defer (on immediate) {
          <app-cv-academic [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('mono') {
        @defer (on immediate) {
          <app-cv-mono [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('soft') {
        @defer (on immediate) {
          <app-cv-soft [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('outline') {
        @defer (on immediate) {
          <app-cv-outline [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('finance') {
        @defer (on immediate) {
          <app-cv-finance [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('split') {
        @defer (on immediate) {
          <app-cv-split [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('airy') {
        @defer (on immediate) {
          <app-cv-airy [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('cards') {
        @defer (on immediate) {
          <app-cv-cards [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('linear') {
        @defer (on immediate) {
          <app-cv-linear [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @case ('typewriter') {
        @defer (on immediate) {
          <app-cv-typewriter [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
      @default {
        @defer (on immediate) {
          <app-cv-classic [cv]="shown()" [photoUrl]="shownPhoto()" [letter]="letter()" />
        }
      }
    }
  `,
})
export class CvDocument {
  readonly cv = input.required<ResolvedCv>();
  readonly photoUrl = input<string | null>(null);
  readonly letter = input<CoverLetter | null>(null);

  protected readonly scope = `s${++nextScope}`;
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
        element.textContent = scopeCss(this.customCss(), `[data-cv-scope="${this.scope}"]`).css;
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
