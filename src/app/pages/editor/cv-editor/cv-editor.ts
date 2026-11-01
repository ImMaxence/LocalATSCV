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
  effect,
  inject,
  input,
  signal,
  untracked,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { CvDocument } from '../../../cv/document/cv-document';
import { CvPreview } from '../../../cv/document/cv-preview';
import { readSetting } from '../../../core/storage/local-settings';
import {
  ACCENT_COLORS,
  CV_LANGUAGES,
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
  host: { class: 'block' },
  imports: [
    RouterLink,
    TranslocoDirective,
    Icon,
    CvPreview,
    CvDocument,
    AtsCheck,
    JobPanel,
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

  protected readonly mobileTab = signal<'edit' | 'preview'>('edit');
  protected readonly languages = CV_LANGUAGES;
  protected readonly nativeNames = NATIVE_NAMES;
  protected readonly accents = ACCENT_COLORS;
  protected readonly sectionKinds = SECTION_KINDS;
  protected readonly sectionIcons = SECTION_ICONS;
  protected readonly hidesPersonalDetails = hidesPersonalDetails;
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
    document.title = ['CV', name, this.store.activeVersion()?.name].filter(Boolean).join(' - ');
    addEventListener('afterprint', () => (document.title = previousTitle), { once: true });
    requestAnimationFrame(() => window.print());
  }

  protected openTemplates(): void {
    const cv = this.store.resolved();
    if (!cv) return;
    const ref = this.dialog.open<CvTemplateId, TemplatePickerData>(TemplatePicker, {
      data: { cv, photoUrl: cv.profile.photoId ? this.store.photoUrl() : null },
      backdropClass: ['cdk-overlay-dark-backdrop', 'backdrop-blur-[2px]'],
      panelClass: 'dialog-in',
    });
    ref.closed.subscribe((template) => template && this.store.setTemplate(template));
  }

  protected moveSection(event: CdkDragDrop<unknown>): void {
    this.store.moveSection(event.previousIndex, event.currentIndex);
  }
}
