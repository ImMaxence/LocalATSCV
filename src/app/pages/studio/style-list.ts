import { Dialog } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { LanguageService } from '../../core/i18n/language.service';
import { CvRepository } from '../../cv/data/cv-repository';
import { CvPreview } from '../../cv/document/cv-preview';
import { CV_LANGUAGES, newId } from '../../cv/model/cv.model';
import { CvStyle, STYLE_PRESETS, StylePreset, createStyle } from '../../cv/model/cv-style';
import { ResolvedCv, hidesPersonalDetails, resolveCv } from '../../cv/model/resolve-cv';
import { SAMPLE_PHOTO_URL, createShowcaseCv } from '../../cv/model/sample-cv';
import { DialogService } from '../../shared/dialog/dialog.service';
import { Icon } from '../../shared/icon/icon';
import { StyleShare, StyleShareData } from './style-share';

const PRESET_ICONS: Record<StylePreset, 'file' | 'layout' | 'columns' | 'sparkles' | 'history'> = {
  blank: 'file',
  band: 'layout',
  sidebar: 'columns',
  organic: 'sparkles',
  timeline: 'history',
};

/** « Studio de styles » : les styles personnels de ce navigateur, création et import. */
@Component({
  selector: 'app-style-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoDirective, Icon, CvPreview, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  template: `
    <section *transloco="let t; prefix: 'studio'" class="container-page py-10 sm:py-14">
      @if (cv()) {
        <a [routerLink]="['/editor', cv()]" class="btn btn-ghost mb-6 px-3! py-1.5!">
          <app-icon class="size-4 rtl:-scale-x-100" name="arrowLeft" />{{ t('backToCv') }}
        </a>
      }
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div class="max-w-2xl">
          <h1 class="font-display text-4xl font-semibold tracking-tight">{{ t('title') }}</h1>
          <p class="mt-2 text-muted">{{ t('subtitle') }}</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="btn btn-ghost" (click)="openImport()">
            <app-icon class="size-4" name="upload" />{{ t('share.importTitle') }}
          </button>
          <button type="button" class="btn btn-primary" [cdkMenuTriggerFor]="newMenu">
            <app-icon class="size-4" name="plus" />{{ t('list.new') }}
          </button>
          <ng-template #newMenu>
            <div cdkMenu class="menu-panel menu-in w-64">
              @for (preset of presets; track preset) {
                <button
                  cdkMenuItem
                  type="button"
                  class="menu-item"
                  (cdkMenuItemTriggered)="create(preset)"
                >
                  <app-icon class="size-4 text-accent" [name]="presetIcons[preset]" />
                  {{ t('presets.' + preset) }}
                </button>
              }
            </div>
          </ng-template>
        </div>
      </div>

      <ul class="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
        <li class="flex items-center gap-2">
          <app-icon class="size-4 text-accent" name="layout" />{{ t('points.blocks') }}
        </li>
        <li class="flex items-center gap-2">
          <app-icon class="size-4 text-accent" name="shapes" />{{ t('points.shapes') }}
        </li>
        <li class="flex items-center gap-2">
          <app-icon class="size-4 text-accent" name="code" />{{ t('points.css') }}
        </li>
        <li class="flex items-center gap-2">
          <app-icon class="size-4 text-accent" name="share" />{{ t('points.share') }}
        </li>
      </ul>

      @if (styles() === undefined) {
        <div class="grid place-items-center py-24 text-muted">
          <app-icon class="size-6 animate-spin" name="loader" />
        </div>
      } @else if (!styles()!.length) {
        <div
          class="mt-10 grid place-items-center rounded-3xl border-2 border-dashed border-line px-6 py-16 text-center"
        >
          <div class="grid size-14 place-items-center rounded-2xl bg-accent-soft text-accent">
            <app-icon class="size-7" name="palette" />
          </div>
          <h2 class="mt-5 font-display text-2xl font-semibold">{{ t('list.emptyTitle') }}</h2>
          <p class="mt-2 max-w-md text-muted">{{ t('list.emptyText') }}</p>
          <div class="mt-7 flex flex-wrap justify-center gap-3">
            @for (preset of presets; track preset) {
              <button
                type="button"
                class="btn"
                [class]="$first ? 'btn-primary' : 'btn-ghost'"
                (click)="create(preset)"
              >
                <app-icon class="size-4" [name]="presetIcons[preset]" />{{ t('presets.' + preset) }}
              </button>
            }
          </div>
        </div>
      } @else {
        <ul class="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (card of cards(); track card.style.id) {
            @let style = card.style;
            <li
              class="group panel relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
            >
              <a
                [routerLink]="['/studio', style.id]"
                [queryParams]="cv() ? { cv: cv() } : {}"
                class="block border-b border-line bg-surface-2 px-6 pt-6"
                [attr.aria-label]="t('list.open') + ' : ' + style.name"
              >
                <div
                  class="overflow-hidden rounded-t-md shadow-md transition-transform group-hover:-translate-y-1"
                >
                  <app-cv-preview
                    class="pointer-events-none"
                    aria-hidden="true"
                    [cv]="card.preview"
                    [photoUrl]="samplePhoto()"
                    [thumbnail]="true"
                  />
                </div>
              </a>
              <div class="flex items-start gap-2 p-4">
                <div class="min-w-0 flex-1">
                  <a
                    [routerLink]="['/studio', style.id]"
                    [queryParams]="cv() ? { cv: cv() } : {}"
                    class="block truncate font-semibold hover:text-accent"
                    >{{ style.name }}</a
                  >
                  <p class="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                    <span>{{ t('list.updated', { date: formatDate(style.updatedAt) }) }}</span>
                    @if (usage()[style.id]; as count) {
                      <span class="inline-flex items-center gap-1">
                        <app-icon class="size-3" name="file" />{{ t('list.usedBy', { count }) }}
                      </span>
                    }
                  </p>
                </div>
                <button
                  type="button"
                  class="icon-btn"
                  [cdkMenuTriggerFor]="cardMenu"
                  [attr.aria-label]="t('list.actions')"
                >
                  <app-icon class="size-4" name="more" />
                </button>
                <ng-template #cardMenu>
                  <div cdkMenu class="menu-panel menu-in">
                    <a
                      cdkMenuItem
                      class="menu-item"
                      [routerLink]="['/studio', style.id]"
                      [queryParams]="cv() ? { cv: cv() } : {}"
                    >
                      <app-icon class="size-4 text-muted" name="pencil" />{{ t('list.open') }}
                    </a>
                    <button
                      cdkMenuItem
                      type="button"
                      class="menu-item"
                      (cdkMenuItemTriggered)="duplicate(style)"
                    >
                      <app-icon class="size-4 text-muted" name="copy" />{{ t('list.duplicate') }}
                    </button>
                    <button
                      cdkMenuItem
                      type="button"
                      class="menu-item"
                      (cdkMenuItemTriggered)="share(style)"
                    >
                      <app-icon class="size-4 text-muted" name="share" />{{ t('toolbar.share') }}
                    </button>
                    <button
                      cdkMenuItem
                      type="button"
                      class="menu-item text-danger!"
                      (cdkMenuItemTriggered)="remove(style)"
                    >
                      <app-icon class="size-4" name="trash" />{{ t('list.delete') }}
                    </button>
                  </div>
                </ng-template>
              </div>
            </li>
          }
        </ul>
      }

      <p
        class="mt-10 flex items-start gap-2.5 rounded-2xl border border-line bg-surface p-4 text-sm text-muted"
      >
        <app-icon class="mt-0.5 size-4 shrink-0 text-accent" name="info" />
        <span>{{ t('list.hint') }}</span>
      </p>
    </section>
  `,
})
export class StyleList {
  /** CV d'où vient l'utilisateur (lien « Mes styles » de l'éditeur), pour l'y ramener. */
  readonly cv = input<string>();

  private readonly repository = inject(CvRepository);
  private readonly router = inject(Router);
  private readonly dialog = inject(DialogService);
  private readonly cdkDialog = inject(Dialog);
  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(LanguageService);

  protected readonly presets = STYLE_PRESETS;
  protected readonly presetIcons = PRESET_ICONS;
  protected readonly styles = toSignal(this.repository.styles$);
  protected readonly usage = toSignal(this.repository.styleUsage$, {
    initialValue: {} as Record<string, number>,
  });

  /** CV d'exemple dans la langue de l'interface (anglais à défaut), pour les vignettes. */
  private readonly sample = computed((): ResolvedCv => {
    const lang = this.language.current();
    const language = CV_LANGUAGES.find((cvLanguage) => cvLanguage === lang) ?? 'en';
    return resolveCv(createShowcaseCv(language), null);
  });
  protected readonly samplePhoto = computed(() =>
    hidesPersonalDetails(this.sample().language) ? null : SAMPLE_PHOTO_URL,
  );

  /** Aperçus calculés une fois par liste : le CV d'exemple habillé de chaque style. */
  protected readonly cards = computed(() =>
    (this.styles() ?? []).map((style) => ({
      style,
      preview: { ...this.sample(), style } satisfies ResolvedCv,
    })),
  );

  protected formatDate(iso: string): string {
    return new Intl.DateTimeFormat(this.language.current(), { dateStyle: 'medium' }).format(
      new Date(iso),
    );
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.transloco.translate(`studio.${key}`, params);
  }

  protected async create(preset: StylePreset): Promise<void> {
    const style = createStyle(this.t('presets.' + preset), preset);
    await this.repository.saveStyle(style);
    await this.open(style);
  }

  private open(style: CvStyle): Promise<boolean> {
    const cv = this.cv();
    return this.router.navigate(['/studio', style.id], { queryParams: cv ? { cv } : {} });
  }

  protected async duplicate(style: CvStyle): Promise<void> {
    const timestamp = new Date().toISOString();
    await this.repository.saveStyle({
      ...structuredClone(style),
      id: newId(),
      name: `${style.name} ${this.t('list.copySuffix')}`,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
  }

  protected share(style: CvStyle): void {
    this.cdkDialog.open<CvStyle, StyleShareData>(StyleShare, {
      data: { style },
      backdropClass: ['cdk-overlay-dark-backdrop', 'backdrop-blur-[2px]'],
      panelClass: 'dialog-in',
    });
  }

  protected openImport(): void {
    const ref = this.cdkDialog.open<CvStyle, StyleShareData>(StyleShare, {
      data: {},
      backdropClass: ['cdk-overlay-dark-backdrop', 'backdrop-blur-[2px]'],
      panelClass: 'dialog-in',
    });
    ref.closed.subscribe((style) => style && void this.open(style));
  }

  protected async remove(style: CvStyle): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: this.t('list.deleteTitle', { name: style.name }),
      message: this.t('list.deleteText'),
      confirmLabel: this.transloco.translate('dialog.delete'),
      danger: true,
    });
    if (confirmed) await this.repository.deleteStyle(style.id);
  }
}
