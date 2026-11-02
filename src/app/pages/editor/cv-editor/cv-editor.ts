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
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CvDocument } from '../../../cv/document/cv-document';
import { CvPreview } from '../../../cv/document/cv-preview';
import { readSetting } from '../../../core/storage/local-settings';
import {
  ACCENT_COLORS,
  CV_LANGUAGES,
  CV_TEMPLATES,
  CvTemplateId,
  SECTION_KINDS,
} from '../../../cv/model/cv.model';
import { hidesPersonalDetails } from '../../../cv/model/resolve-cv';
import { CV_FONTS, CvFontId } from '../../../cv/model/cv-fonts';
import { Icon } from '../../../shared/icon/icon';
import { CvEditorStore } from './cv-editor.store';
import { AtsCheck } from './parts/ats-check';
import { SECTION_ICONS } from './parts/editor-controls';
import { JobPanel } from './parts/job-panel';
import { LetterPanel } from './parts/letter-panel';
import { PageFit } from './parts/page-fit';
import { PRINT_TIPS_SETTING, PrintTips } from './parts/print-tips';
import { ProfilePanel } from './parts/profile-panel';
import { SectionPanel } from './parts/section-panel';
import { TemplatePicker, TemplatePickerData } from './parts/template-picker';
import { VersionSwitcher } from './parts/version-switcher';

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
    const key = event.key.toLowerCase();
    if (key !== 'z' && key !== 'y') return;
    if ((event.target as HTMLElement | null)?.closest('.cdk-overlay-container')) return;
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
        data: { cv, photoUrl: cv.profile.photoId ? this.store.photoUrl() : null },
        backdropClass: ['cdk-overlay-dark-backdrop', 'backdrop-blur-[2px]'],
        panelClass: 'dialog-in',
      });
      afterNextRender(() => this.openingTemplates.set(false), { injector: this.injector });
      ref.closed.subscribe((template) => template && this.store.setTemplate(template));
    });
  }

  protected moveSection(event: CdkDragDrop<unknown>): void {
    this.store.moveSection(event.previousIndex, event.currentIndex);
  }
}
