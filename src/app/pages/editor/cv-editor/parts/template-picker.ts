import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CvPreview } from '../../../../cv/document/cv-preview';
import {
  AtsCompatibility,
  CV_TEMPLATES,
  CvTemplateFamily,
  CvTemplateId,
} from '../../../../cv/model/cv.model';
import { ResolvedCv, hidesPersonalDetails, resolveCv } from '../../../../cv/model/resolve-cv';
import { SAMPLE_PHOTO_URL, createShowcaseCv } from '../../../../cv/model/sample-cv';
import { Icon } from '../../../../shared/icon/icon';

export interface TemplatePickerData {
  cv: ResolvedCv;
  photoUrl: string | null;
}

const ATS_BADGES: Record<AtsCompatibility, string> = {
  excellent: 'bg-accent-soft text-accent',
  good: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  fair: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
};

/** Minuscules sans accents, pour comparer une recherche aux noms et descriptions traduits. */
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();

/**
 * Galerie des modèles, rendus avec un CV d'exemple complet ou avec le contenu du CV en cours.
 * Filtre par famille, recherche dans les noms et descriptions, tirage au sort.
 */
@Component({
  selector: 'app-template-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, CvPreview, Icon],
  template: `
    <div
      *transloco="let t; prefix: 'editor.templates'"
      class="flex max-h-[90dvh] w-[min(80rem,calc(100vw-2rem))] flex-col rounded-2xl border border-line bg-surface shadow-2xl"
    >
      <header class="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div>
          <h2 class="font-display text-xl font-semibold tracking-tight">
            {{ t('title') }}
            <span class="ms-2 text-base font-normal text-muted">{{
              t('count', { n: total })
            }}</span>
          </h2>
          <p class="mt-1 text-sm text-muted">{{ t('subtitle') }}</p>
        </div>
        <button type="button" class="icon-btn" [attr.aria-label]="t('close')" (click)="ref.close()">
          <app-icon class="size-4" name="x" />
        </button>
      </header>

      <div class="flex flex-wrap items-center gap-3 px-6 pt-4">
        <div role="radiogroup" class="flex flex-wrap gap-1.5" [attr.aria-label]="t('filter')">
          @for (option of filters; track option) {
            <button
              type="button"
              role="radio"
              class="rounded-full border border-line px-3 py-1 text-sm font-medium text-muted transition-colors hover:text-ink aria-checked:border-accent aria-checked:bg-accent-soft aria-checked:text-accent"
              [attr.aria-checked]="filter() === option"
              (click)="filter.set(option)"
            >
              {{ t('filters.' + option) }}
              <span class="ms-1 text-xs opacity-70">{{ count(option) }}</span>
            </button>
          }
        </div>
        <label class="relative min-w-0 flex-1 basis-48">
          <app-icon
            class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted"
            name="search"
          />
          <input
            type="search"
            class="h-9 w-full rounded-full border border-line bg-surface-2 ps-9 pe-3 text-sm outline-none transition-colors placeholder:text-muted focus:border-accent"
            [placeholder]="t('search')"
            [attr.aria-label]="t('search')"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
          />
        </label>
        <button
          type="button"
          class="flex h-9 items-center gap-2 rounded-full border border-line px-3 text-sm font-medium text-muted transition-colors hover:border-ink/25 hover:text-ink"
          [title]="t('randomHint')"
          (click)="pickRandom()"
        >
          <app-icon class="size-4" name="shuffle" />
          {{ t('random') }}
        </button>
        <div
          role="radiogroup"
          class="flex rounded-full border border-line bg-surface-2 p-0.5 text-xs font-semibold"
          [attr.aria-label]="t('preview.label')"
        >
          @for (option of sources; track option) {
            <button
              type="button"
              role="radio"
              class="rounded-full px-3 py-1 text-muted transition-colors hover:text-ink aria-checked:bg-surface aria-checked:text-ink aria-checked:shadow-sm"
              [attr.aria-checked]="source() === option"
              (click)="source.set(option)"
            >
              {{ t('preview.' + option) }}
            </button>
          }
        </div>
      </div>

      @if (options().length) {
        <ul class="grid gap-5 overflow-y-auto p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          @for (option of options(); track option.id) {
            <li>
              <button
                type="button"
                class="group block w-full rounded-2xl border-2 p-2 text-start transition-colors"
                [class]="
                  option.id === data.cv.template
                    ? 'border-accent bg-accent-soft/40'
                    : 'border-transparent hover:border-line'
                "
                [attr.aria-pressed]="option.id === data.cv.template"
                (click)="ref.close(option.id)"
              >
                <div class="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
                  <!-- Vignettes rendues à l'approche de l'écran : la galerie s'ouvre tout de suite. -->
                  @defer (on viewport) {
                    <app-cv-preview
                      class="pointer-events-none"
                      aria-hidden="true"
                      [cv]="option.cv"
                      [photoUrl]="photoUrl()"
                      [thumbnail]="true"
                    />
                  } @placeholder {
                    <div class="grid aspect-[794/1123] place-items-center bg-surface-2">
                      <app-icon class="size-5 animate-spin text-muted" name="loader" />
                    </div>
                  }
                </div>
                <div class="px-1.5 pt-3 pb-1">
                  <div class="flex items-center justify-between gap-2">
                    <span class="font-semibold">{{ t('names.' + option.id + '.name') }}</span>
                    @if (option.id === data.cv.template) {
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-ink"
                      >
                        <app-icon class="size-3" name="check" [strokeWidth]="3" />{{
                          t('current')
                        }}
                      </span>
                    }
                  </div>
                  <p class="mt-1 text-xs leading-relaxed text-muted">
                    {{ t('names.' + option.id + '.description') }}
                  </p>
                  <p
                    class="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    [class]="badges[option.ats]"
                  >
                    @if (option.ats !== 'excellent') {
                      <app-icon class="size-3" name="alert" [strokeWidth]="2.25" />
                    }
                    {{ t('ats') }} : {{ t('levels.' + option.ats) }}
                  </p>
                </div>
              </button>
            </li>
          }
        </ul>
      } @else {
        <p class="px-6 py-16 text-center text-sm text-muted">{{ t('noResults') }}</p>
      }

      <p class="flex items-start gap-2 border-t border-line px-6 py-3 text-xs text-muted">
        <app-icon class="mt-px size-3.5 shrink-0" name="info" />{{ t('atsHint') }}
      </p>
    </div>
  `,
})
export class TemplatePicker {
  protected readonly data = inject<TemplatePickerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<CvTemplateId>>(DialogRef);
  private readonly transloco = inject(TranslocoService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly badges = ATS_BADGES;
  protected readonly total = CV_TEMPLATES.length;

  protected readonly filters = ['all', 'graphic', 'sober'] as const;
  protected readonly filter = signal<'all' | CvTemplateFamily>('all');
  protected readonly query = signal('');

  /** Vignettes montrées avec un CV d'exemple complet (par défaut) ou avec le CV en cours. */
  protected readonly sources = ['sample', 'mine'] as const;
  protected readonly source = signal<'sample' | 'mine'>('sample');

  /** CV d'exemple aux couleurs et polices du CV en cours, mise en page du modèle. */
  private readonly sample: ResolvedCv = {
    ...resolveCv(createShowcaseCv(this.data.cv.language), null),
    accentColor: this.data.cv.accentColor,
    fonts: this.data.cv.fonts,
  };

  protected readonly photoUrl = computed(() => {
    if (this.source() === 'mine') return this.data.photoUrl;
    return hidesPersonalDetails(this.sample.language) ? null : SAMPLE_PHOTO_URL;
  });

  protected readonly options = computed(() => {
    const cv = this.source() === 'sample' ? this.sample : this.data.cv;
    const query = fold(this.query().trim());
    return CV_TEMPLATES.filter(
      (template) =>
        (this.filter() === 'all' || template.family === this.filter()) &&
        (!query || fold(this.label(template.id)).includes(query)),
    ).map((template) => ({ ...template, cv: { ...cv, template: template.id } }));
  });

  constructor() {
    // Avec une cinquantaine de modèles, le modèle en cours peut être loin : on le montre d'emblée.
    afterNextRender(() => {
      this.host.nativeElement
        .querySelector('[aria-pressed="true"]')
        ?.scrollIntoView({ block: 'center' });
    });
  }

  protected count(filter: 'all' | CvTemplateFamily): number {
    return CV_TEMPLATES.filter((template) => filter === 'all' || template.family === filter).length;
  }

  /** Un modèle au hasard parmi ceux affichés, différent du modèle en cours. */
  protected pickRandom(): void {
    const candidates = this.options().filter((option) => option.id !== this.data.cv.template);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (pick) this.ref.close(pick.id);
  }

  private label(id: CvTemplateId): string {
    const key = `editor.templates.names.${id}`;
    return `${this.transloco.translate(`${key}.name`)} ${this.transloco.translate(`${key}.description`)}`;
  }
}
