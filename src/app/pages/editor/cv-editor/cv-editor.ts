import { Dialog } from '@angular/cdk/dialog';
import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import {
  CdkMenu,
  CdkMenuGroup,
  CdkMenuItem,
  CdkMenuItemRadio,
  CdkMenuTrigger,
} from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CvRepository } from '../../../cv/data/cv-repository';
import { CvDocument } from '../../../cv/document/cv-document';
import { CvPreview } from '../../../cv/document/cv-preview';
import { readSetting, writeSetting } from '../../../core/storage/local-settings';
import {
  ACCENT_COLORS,
  CV_LANGUAGES,
  CV_TEMPLATES,
  CvTemplateId,
  SECTION_KINDS,
  SectionKind,
} from '../../../cv/model/cv.model';
import { hidesPersonalDetails } from '../../../cv/model/resolve-cv';
import { CV_FONTS, CvFontId } from '../../../cv/model/cv-fonts';
import { createTemplateStyle } from '../../../cv/model/cv-style';
import { Icon } from '../../../shared/icon/icon';
import { CvEditorStore } from './cv-editor.store';
import { AtsCheck } from './parts/ats-check';
import { SECTION_ICONS } from './parts/editor-controls';
import { JobPanel } from './parts/job-panel';
import { LanguageInfo } from './parts/language-info';
import { LetterPanel } from './parts/letter-panel';
import { PageFit } from './parts/page-fit';
import { PRINT_TIPS_SETTING, PrintTips } from './parts/print-tips';
import { ProfilePanel } from './parts/profile-panel';
import { SectionPanel } from './parts/section-panel';
import { TemplatePicker, TemplatePickerData } from './parts/template-picker';
import { templateThumbnailUrl } from '../../../cv/model/template-thumbnails';
import { VersionSwitcher } from './parts/version-switcher';

const GUIDED_SETTING = 'editor.guided';

interface GuidedStep {
  kind: 'profile' | 'finish' | SectionKind;
  sectionId?: string;
  /** Titre personnalisé de la rubrique ; vide = titre par défaut. */
  title?: string;
}

const NATIVE_NAMES: Record<string, string> = {
  fr: 'Français',
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  de: 'Deutsch',
};

@Component({
  selector: 'app-cv-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CvEditorStore],
  host: { class: 'block', '(document:keydown)': 'onKeydown($event)' },
  imports: [
    RouterLink,
    TranslocoDirective,
    Icon,
    CvPreview,
    CvDocument,
    AtsCheck,
    JobPanel,
    LanguageInfo,
    LetterPanel,
    PageFit,
    ProfilePanel,
    SectionPanel,
    VersionSwitcher,
    CdkDropList,
    CdkDrag,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    CdkMenuItemRadio,
    CdkMenuGroup,
  ],
  templateUrl: './cv-editor.html',
})
export class CvEditor {
  /** Paramètres de route liés par `withComponentInputBinding`. */
  readonly id = input.required<string>();
  readonly version = input<string>();

  protected readonly store = inject(CvEditorStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(Dialog);
  private readonly transloco = inject(TranslocoService);
  private readonly injector = inject(Injector);
  private readonly repository = inject(CvRepository);

  /** Styles créés dans le studio, proposés dans le menu « Mes styles ». */
  protected readonly styles = toSignal(this.repository.styles$, { initialValue: [] });

  protected readonly mobileTab = signal<'edit' | 'preview'>('edit');
  protected readonly languages = CV_LANGUAGES;
  protected readonly nativeNames = NATIVE_NAMES;
  protected readonly accents = ACCENT_COLORS;
  /** Couleur choisie avec le sélecteur libre, hors de la palette. */
  protected readonly isCustomAccent = computed(
    () => !ACCENT_COLORS.includes(this.store.cv()?.accentColor ?? ACCENT_COLORS[0]),
  );
  protected readonly sectionKinds = SECTION_KINDS;
  protected readonly sectionIcons = SECTION_ICONS;
  protected readonly hidesPersonalDetails = hidesPersonalDetails;
  private readonly printCopy = viewChild<ElementRef<HTMLElement>>('printCopy');

  protected readonly modes = [
    { id: 'cv', icon: 'file' },
    { id: 'letter', icon: 'mail' },
  ] as const;

  protected readonly fonts = CV_FONTS;
  protected readonly fontRoles = ['heading', 'body'] as const;

  // --- Mode pas à pas ---

  /** Une rubrique à la fois avec un conseil en langage simple ; choix mémorisé sur l'appareil. */
  protected readonly guided = signal(readSetting(GUIDED_SETTING) === '1');
  private readonly guidedTop = viewChild<ElementRef<HTMLElement>>('guidedTop');
  private readonly requestedStep = signal(0);

  /** Le profil, chaque rubrique du CV dans l'ordre, puis le choix du modèle et l'export. */
  protected readonly steps = computed((): GuidedStep[] => [
    { kind: 'profile' },
    ...(this.store.cv()?.sections ?? []).map((section) => ({
      kind: section.kind,
      sectionId: section.id,
      title: section.title.trim(),
    })),
    { kind: 'finish' },
  ]);
  /** Borné : supprimer une rubrique ne laisse pas l'étape en cours hors de la liste. */
  protected readonly stepIndex = computed(() =>
    Math.min(this.requestedStep(), this.steps().length - 1),
  );
  protected readonly currentStep = computed(() => this.steps()[this.stepIndex()]);

  protected toggleGuided(): void {
    const guided = !this.guided();
    this.guided.set(guided);
    this.requestedStep.set(0);
    writeSetting(GUIDED_SETTING, guided ? '1' : '0');
  }

  protected goToStep(index: number): void {
    this.requestedStep.set(Math.max(0, Math.min(index, this.steps().length - 1)));
    // Le haut de l'étape (titre et conseil) revient sous les yeux.
    afterNextRender(() => this.guidedTop()?.nativeElement.scrollIntoView({ block: 'start' }), {
      injector: this.injector,
    });
  }

  /** En mode pas à pas, la rubrique ajoutée devient l'étape affichée. */
  protected addSection(kind: SectionKind): void {
    this.store.addSection(kind);
    if (this.guided()) this.goToStep(this.steps().length - 2);
  }

  protected fontLabel(id: CvFontId | null): string {
    return CV_FONTS.find((font) => font.id === id)?.label ?? 'Aa';
  }

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => void this.store.load(id));
    });
    effect(() => this.store.activeVersionId.set(this.version() ?? null));
  }

  protected selectVersion(versionId: string | null): void {
    void this.router.navigate([], {
      queryParams: { version: versionId },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * Ctrl+Z / Ctrl+Y (ou Ctrl+Maj+Z) : annuler et rétablir dans tout l'éditeur. Les fenêtres
   * ouvertes par-dessus (nom de version, import…) gardent le comportement natif.
   */
  protected onKeydown(event: KeyboardEvent): void {
    if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
    const target = event.target as HTMLElement | null;
    if (target?.closest('.cdk-overlay-container')) return;
    // Ctrl+Maj+← / → : modèle précédent ou suivant, hors des champs (où ces touches sélectionnent du texte).
    if (event.shiftKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
      if (target?.closest('input, textarea, select, [contenteditable]')) return;
      event.preventDefault();
      this.shiftTemplate(event.key === 'ArrowRight' ? 1 : -1);
      return;
    }
    const key = event.key.toLowerCase();
    if (key !== 'z' && key !== 'y') return;
    event.preventDefault();
    if (key === 'y' || event.shiftKey) this.store.redo();
    else this.store.undo();
  }

  /** Le PDF est produit par la fenêtre d'impression du navigateur (texte réel, sélectionnable). */
  protected exportPdf(): void {
    if (readSetting(PRINT_TIPS_SETTING) === '1') return this.print();
    const ref = this.dialog.open<boolean>(PrintTips, {
      backdropClass: ['cdk-overlay-dark-backdrop', 'backdrop-blur-[2px]'],
      panelClass: 'dialog-in',
    });
    ref.closed.subscribe((confirmed) => confirmed && this.print());
  }

  private print(): void {
    const cv = this.store.cv();
    if (!cv) return;
    const name = [cv.profile.firstName, cv.profile.lastName].join(' ').trim() || cv.name;
    const previousTitle = document.title;
    // Le titre de la page devient le nom de fichier proposé par le navigateur.
    const kind =
      this.store.mode() === 'letter' ? this.transloco.translate('editor.letter.fileName') : 'CV';
    document.title = [kind, name, this.store.activeVersion()?.name].filter(Boolean).join(' - ');
    // Fond du modèle (sombre, ivoire, quadrillé…) prolongé dans les marges des pages suivantes.
    const page = this.printCopy()?.nativeElement.querySelector('.cv');
    const root = document.documentElement.style;
    if (page) root.setProperty('--print-page-bg', getComputedStyle(page).backgroundColor);
    addEventListener(
      'afterprint',
      () => {
        document.title = previousTitle;
        root.removeProperty('--print-page-bg');
      },
      { once: true },
    );
    requestAnimationFrame(() => window.print());
  }

  /** Galerie en cours d'ouverture : le bouton affiche un indicateur le temps du premier rendu. */
  protected readonly openingTemplates = signal(false);

  protected readonly templateCount = CV_TEMPLATES.length;
  /** Rang (1 à n) du modèle en cours, affiché dans le bouton de la barre d'outils. */
  protected readonly templatePosition = computed(
    () => CV_TEMPLATES.findIndex((template) => template.id === this.store.cv()?.template) + 1,
  );

  /** Vignette statique du modèle en cours (voir scripts/thumbnails.mjs), dans la langue du CV. */
  protected readonly templateThumbnail = computed(() => {
    const cv = this.store.cv();
    return cv ? templateThumbnailUrl(cv.template, cv.language) : '';
  });

  /** Passe au modèle précédent ou suivant de la galerie, sans l'ouvrir (en boucle). */
  protected shiftTemplate(step: 1 | -1): void {
    const cv = this.store.cv();
    if (!cv) return;
    const index = CV_TEMPLATES.findIndex((template) => template.id === cv.template);
    const next = CV_TEMPLATES[(index + step + CV_TEMPLATES.length) % CV_TEMPLATES.length];
    this.store.setTemplate(next.id);
  }

  protected openTemplates(): void {
    const cv = this.store.resolved();
    if (!cv || this.openingTemplates()) return;
    this.openingTemplates.set(true);
    // Une image pour afficher l'indicateur, puis la galerie (dont le premier rendu est lourd).
    requestAnimationFrame(() => {
      const ref = this.dialog.open<CvTemplateId, TemplatePickerData>(TemplatePicker, {
        data: {
          cv,
          photoUrl: cv.profile.photoId ? this.store.photoUrl() : null,
          jobAd: this.store.jobAd(),
        },
        backdropClass: ['cdk-overlay-dark-backdrop', 'backdrop-blur-[2px]'],
        panelClass: 'dialog-in',
      });
      afterNextRender(() => this.openingTemplates.set(false), { injector: this.injector });
      ref.closed.subscribe((template) => template && this.store.setTemplate(template));
    });
  }

  /**
   * Ouvre le CSS du style en cours dans le studio ; sans style, en crée un sur le modèle affiché
   * (même apparence, prêt à être retouché). Le studio montre ce CV et y ramène.
   */
  protected async customizeCss(): Promise<void> {
    const cv = this.store.cv();
    if (!cv) return;
    let style = cv.style;
    if (!style) {
      const name = this.transloco.translate('editor.style.cssName', {
        name: this.transloco.translate(`editor.templates.names.${cv.template}.name`),
      });
      style = createTemplateStyle(name, cv.template);
      this.store.setStyle(style);
    }
    if (!(await this.repository.getStyle(style.id))) await this.repository.saveStyle(style);
    await this.store.flush();
    await this.router.navigate(['/studio', style.id], { queryParams: { cv: cv.id, tab: 'css' } });
  }

  protected moveSection(event: CdkDragDrop<unknown>): void {
    this.store.moveSection(event.previousIndex, event.currentIndex);
  }
}
