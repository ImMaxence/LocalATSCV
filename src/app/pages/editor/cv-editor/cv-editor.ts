import { CdkDrag, CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { CdkMenu, CdkMenuItem, CdkMenuItemRadio, CdkMenuTrigger } from '@angular/cdk/menu';
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
import { CvPreview } from '../../../cv/document/cv-preview';
import { ACCENT_COLORS, CV_LANGUAGES, SECTION_KINDS } from '../../../cv/model/cv.model';
import { hidesPersonalDetails } from '../../../cv/model/resolve-cv';
import { Icon } from '../../../shared/icon/icon';
import { CvEditorStore } from './cv-editor.store';
import { SECTION_ICONS } from './parts/editor-controls';
import { ProfilePanel } from './parts/profile-panel';
import { SectionPanel } from './parts/section-panel';
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
    ProfilePanel,
    SectionPanel,
    VersionSwitcher,
    CdkDropList,
    CdkDrag,
    CdkMenuTrigger,
    CdkMenu,
    CdkMenuItem,
    CdkMenuItemRadio,
  ],
  templateUrl: './cv-editor.html',
})
export class CvEditor {
  /** Paramètres de route liés par `withComponentInputBinding`. */
  readonly id = input.required<string>();
  readonly version = input<string>();

  protected readonly store = inject(CvEditorStore);
  private readonly router = inject(Router);

  protected readonly mobileTab = signal<'edit' | 'preview'>('edit');
  protected readonly languages = CV_LANGUAGES;
  protected readonly nativeNames = NATIVE_NAMES;
  protected readonly accents = ACCENT_COLORS;
  protected readonly sectionKinds = SECTION_KINDS;
  protected readonly sectionIcons = SECTION_ICONS;
  protected readonly hidesPersonalDetails = hidesPersonalDetails;

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

  protected moveSection(event: CdkDragDrop<unknown>): void {
    this.store.moveSection(event.previousIndex, event.currentIndex);
  }
}
