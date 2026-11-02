import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CvPreview } from '../../../../cv/document/cv-preview';
import {
  AtsCompatibility,
  CV_TEMPLATES,
  CV_TEMPLATE_TAGS,
  CvTemplateFamily,
  CvTemplateId,
  CvTemplateTag,
  isTemplateId,
} from '../../../../cv/model/cv.model';
import { ResolvedCv, hidesPersonalDetails, resolveCv } from '../../../../cv/model/resolve-cv';
import { SAMPLE_PHOTO_URL, createShowcaseCv } from '../../../../cv/model/sample-cv';
import { suggestTemplates } from '../../../../cv/model/template-suggest';
import { templateThumbnailUrl } from '../../../../cv/model/template-thumbnails';
import { readSetting, writeSetting } from '../../../../core/storage/local-settings';
import { Icon } from '../../../../shared/icon/icon';

export interface TemplatePickerData {
  cv: ResolvedCv;
  photoUrl: string | null;
  /** Annonce en cours d'adaptation, pour suggérer des modèles adaptés au secteur. */
  jobAd?: string;
}

const ATS_BADGES: Record<AtsCompatibility, string> = {
  excellent: 'bg-accent-soft text-accent',
  good: 'bg-sky-500/12 text-sky-700 dark:text-sky-300',
  fair: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
};

const FAVORITES_KEY = 'templates.favorites';
const RECENT_KEY = 'templates.recent';
const RECENT_LIMIT = 8;
/** Au-dessus, la galerie montre le volet d'aperçu ; en dessous, un clic applique le modèle. */
const PREVIEW_PANE_QUERY = '(min-width: 1024px)';

type Filter = 'all' | 'favorites' | 'recent' | CvTemplateFamily;

/** Minuscules sans accents, pour comparer une recherche aux noms et descriptions traduits. */
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Liste d'identifiants de modèles mémorisée dans les réglages locaux (favoris, récents). */
function readIds(key: string): CvTemplateId[] {
  try {
    const value: unknown = JSON.parse(readSetting(key) ?? '[]');
    return Array.isArray(value) ? value.filter(isTemplateId) : [];
  } catch {
    return [];
  }
}

/**
 * Galerie des modèles : vignettes statiques (images, donc légères même par dizaines), filtres
 * par famille, par trait de style, favoris et récents, recherche, suggestions selon l'annonce.
 * Sur grand écran, un volet d'aperçu rend le modèle sélectionné avec le CV d'exemple ou le CV
 * en cours (couleur et polices comprises) ; un seul modèle est donc rendu à la fois.
 */
@Component({
  selector: 'app-template-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, CvPreview, Icon],
  template: `
    <div
      *transloco="let t; prefix: 'editor.templates'"
      class="flex h-[92dvh] w-[min(90rem,calc(100vw-2rem))] flex-col rounded-2xl border border-line bg-surface shadow-2xl"
    >
      <header class="flex items-start justify-between gap-4 border-b border-line px-5 py-3.5">
        <div>
          <h2 class="font-display text-xl font-semibold tracking-tight">
            {{ t('title') }}
            <span class="ms-2 text-base font-normal text-muted">{{
              t('count', { n: total })
            }}</span>
          </h2>
          <!-- Le sous-titre décrit le volet d'aperçu, absent sur petit écran -->
          <p class="mt-0.5 hidden text-sm text-muted lg:block">{{ t('subtitle') }}</p>
        </div>
        <button type="button" class="icon-btn" [attr.aria-label]="t('close')" (click)="ref.close()">
          <app-icon class="size-4" name="x" />
        </button>
      </header>

      <div
        class="flex flex-col gap-2 border-b border-line px-5 py-2.5 sm:flex-row sm:flex-wrap sm:items-center"
      >
        <!-- Sur téléphone, tous les filtres tiennent sur une ligne qui défile horizontalement -->
        <div
          class="-mx-5 flex items-center gap-1.5 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
        >
          <div
            role="radiogroup"
            class="flex shrink-0 gap-1.5 sm:flex-wrap"
            [attr.aria-label]="t('filter')"
          >
            @for (option of filters; track option) {
              <button
                type="button"
                role="radio"
                class="flex shrink-0 items-center gap-1 rounded-full border border-line px-2.5 py-1 text-sm font-medium whitespace-nowrap text-muted transition-colors hover:text-ink aria-checked:border-accent aria-checked:bg-accent-soft aria-checked:text-accent"
                [attr.aria-checked]="filter() === option"
                (click)="filter.set(option)"
              >
                @if (option === 'favorites') {
                  <svg viewBox="0 0 24 24" class="size-3.5" aria-hidden="true">
                    <path [attr.d]="starPath" fill="currentColor" />
                  </svg>
                } @else if (option === 'recent') {
                  <app-icon class="size-3.5" name="history" />
                }
                {{ t('filters.' + option) }}
                <span class="text-xs opacity-70">{{ count(option) }}</span>
              </button>
            }
          </div>
          <span class="h-5 w-px shrink-0 bg-line" aria-hidden="true"></span>
          <div
            class="flex shrink-0 gap-1.5 sm:flex-wrap"
            role="group"
            [attr.aria-label]="t('tagsLabel')"
          >
            @for (tag of allTags; track tag) {
              <button
                type="button"
                class="shrink-0 rounded-full border border-dashed border-line px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-muted transition-colors hover:text-ink aria-pressed:border-solid aria-pressed:border-ink/40 aria-pressed:bg-surface-2 aria-pressed:text-ink"
                [attr.aria-pressed]="tags().has(tag)"
                (click)="toggleTag(tag)"
              >
                {{ t('tags.' + tag) }}
              </button>
            }
          </div>
        </div>
        <div class="flex min-w-0 items-center gap-2 sm:min-w-72 sm:flex-1">
          <label class="relative min-w-0 flex-1">
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
            class="flex h-9 shrink-0 items-center gap-2 rounded-full border border-line px-3 text-sm font-medium text-muted transition-colors hover:border-ink/25 hover:text-ink"
            [title]="t('randomHint')"
            [attr.aria-label]="t('random')"
            (click)="pickRandom()"
          >
            <app-icon class="size-4" name="shuffle" />
            <span class="hidden sm:inline">{{ t('random') }}</span>
          </button>
        </div>
      </div>

      <div class="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div class="min-h-0 overflow-y-auto p-4 sm:p-5" (keydown)="onListKeydown($event)">
          @if (suggestions().length) {
            <div
              class="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-accent-soft/60 px-3 py-2 text-sm"
            >
              <app-icon class="size-4 text-accent" name="sparkles" />
              <span class="font-medium">{{ t('suggested') }}</span>
              @for (id of suggestions(); track id) {
                <button
                  type="button"
                  class="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs font-semibold transition-colors hover:border-accent"
                  (click)="select(id)"
                >
                  {{ t('names.' + id + '.name') }}
                </button>
              }
            </div>
          }
          @if (options().length) {
            <ul #list class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              @for (option of options(); track option.id) {
                <li class="group relative">
                  <button
                    type="button"
                    class="block w-full rounded-xl border-2 p-1.5 text-start transition-colors"
                    [class]="
                      selected() === option.id
                        ? 'border-accent bg-accent-soft/40'
                        : 'border-transparent hover:border-line'
                    "
                    [attr.data-id]="option.id"
                    [attr.aria-pressed]="selected() === option.id"
                    [attr.aria-current]="option.id === data.cv.template ? 'true' : null"
                    (click)="select(option.id)"
                    (dblclick)="apply(option.id)"
                  >
                    <!-- Vignette décorative : le nom du modèle, juste en dessous, suffit au lecteur d'écran -->
                    <img
                      class="aspect-[794/1123] w-full rounded-md border border-line bg-white object-cover object-top"
                      [src]="thumbnail(option.id)"
                      alt=""
                      width="318"
                      height="450"
                      loading="lazy"
                      decoding="async"
                    />
                    <span class="mt-2 flex items-center gap-1.5 px-0.5">
                      <span class="min-w-0 flex-1 truncate text-sm font-semibold">{{
                        t('names.' + option.id + '.name')
                      }}</span>
                      @if (option.id === data.cv.template) {
                        <app-icon class="size-3.5 text-accent" name="check" [strokeWidth]="3" />
                      }
                      @if (option.ats !== 'excellent') {
                        <app-icon
                          class="size-3.5 text-amber-600 dark:text-amber-400"
                          name="alert"
                          [strokeWidth]="2.25"
                        />
                      }
                    </span>
                  </button>
                  <button
                    type="button"
                    class="absolute end-3 top-3 grid size-7 place-items-center rounded-full bg-surface/90 shadow-sm transition-opacity group-hover:opacity-100 hover:text-ink focus-visible:opacity-100"
                    [class]="isFavorite(option.id) ? 'text-amber-500' : 'text-muted opacity-0'"
                    [attr.aria-pressed]="isFavorite(option.id)"
                    [attr.aria-label]="isFavorite(option.id) ? t('unfavorite') : t('favorite')"
                    [title]="isFavorite(option.id) ? t('unfavorite') : t('favorite')"
                    (click)="toggleFavorite(option.id)"
                  >
                    <svg viewBox="0 0 24 24" class="size-4" aria-hidden="true">
                      <path
                        [attr.d]="starPath"
                        [attr.fill]="isFavorite(option.id) ? 'currentColor' : 'none'"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </li>
              }
            </ul>
          } @else {
            <p class="px-6 py-16 text-center text-sm text-muted">
              {{
                filter() === 'favorites'
                  ? t('noFavorites')
                  : filter() === 'recent'
                    ? t('noRecent')
                    : t('noResults')
              }}
            </p>
          }
        </div>

        <aside class="hidden min-h-0 flex-col border-s border-line bg-surface-2/60 lg:flex">
          <div class="flex items-center justify-between gap-2 px-4 pt-3">
            <div
              role="radiogroup"
              class="flex rounded-full border border-line bg-surface p-0.5 text-xs font-semibold"
              [attr.aria-label]="t('preview.label')"
            >
              @for (option of sources; track option) {
                <button
                  type="button"
                  role="radio"
                  class="rounded-full px-3 py-1 text-muted transition-colors hover:text-ink aria-checked:bg-accent-soft aria-checked:text-accent"
                  [attr.aria-checked]="source() === option"
                  (click)="source.set(option)"
                >
                  {{ t('preview.' + option) }}
                </button>
              }
            </div>
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold transition-colors hover:bg-surface"
              [class]="isFavorite(selected()) ? 'text-amber-600 dark:text-amber-400' : 'text-muted'"
              [attr.aria-pressed]="isFavorite(selected())"
              (click)="toggleFavorite(selected())"
            >
              <svg viewBox="0 0 24 24" class="size-4" aria-hidden="true">
                <path
                  [attr.d]="starPath"
                  [attr.fill]="isFavorite(selected()) ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
              </svg>
              {{ isFavorite(selected()) ? t('unfavorite') : t('favorite') }}
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-3">
            <div class="overflow-hidden rounded-lg border border-line bg-white shadow-md">
              <app-cv-preview
                class="pointer-events-none"
                aria-hidden="true"
                [cv]="previewCv()"
                [photoUrl]="photoUrl()"
                [thumbnail]="true"
              />
            </div>
            <h3 class="mt-3 font-display text-lg font-semibold">
              {{ t('names.' + selected() + '.name') }}
            </h3>
            <p class="mt-1 text-sm leading-relaxed text-muted">
              {{ t('names.' + selected() + '.description') }}
            </p>
            <div class="mt-2.5 flex flex-wrap gap-1.5">
              <span
                class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                [class]="badges[selectedTemplate().ats]"
              >
                @if (selectedTemplate().ats !== 'excellent') {
                  <app-icon class="size-3" name="alert" [strokeWidth]="2.25" />
                }
                {{ t('ats') }} : {{ t('levels.' + selectedTemplate().ats) }}
              </span>
              <span
                class="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted"
                >{{ t('filters.' + selectedTemplate().family) }}</span
              >
              @for (tag of selectedTemplate().tags; track tag) {
                <span
                  class="rounded-full bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted"
                  >{{ t('tags.' + tag) }}</span
                >
              }
            </div>
          </div>
          <div class="border-t border-line p-4">
            <button
              type="button"
              class="btn btn-primary w-full disabled:opacity-60"
              [disabled]="selected() === data.cv.template"
              (click)="apply(selected())"
            >
              @if (selected() === data.cv.template) {
                <app-icon class="size-4" name="check" [strokeWidth]="2.5" />{{ t('current') }}
              } @else {
                {{ t('use') }}
              }
            </button>
          </div>
        </aside>
      </div>

      <p
        class="hidden flex-wrap items-start gap-x-4 gap-y-1 border-t border-line px-5 py-2.5 text-xs text-muted sm:flex"
      >
        <!-- Masqué sur téléphone pour laisser la place aux vignettes ; l'icône d'alerte des
             modèles à deux colonnes reste visible sur chaque carte. -->
        <span class="flex items-start gap-2"
          ><app-icon class="mt-px size-3.5 shrink-0" name="info" />{{ t('atsHint') }}</span
        >
        <span class="hidden lg:inline">{{ t('shortcuts') }}</span>
      </p>
    </div>
  `,
})
export class TemplatePicker {
  protected readonly data = inject<TemplatePickerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<CvTemplateId>>(DialogRef);
  private readonly transloco = inject(TranslocoService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly list = viewChild<ElementRef<HTMLUListElement>>('list');

  protected readonly badges = ATS_BADGES;
  protected readonly total = CV_TEMPLATES.length;
  protected readonly allTags = CV_TEMPLATE_TAGS;
  protected readonly starPath =
    'M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9Z';

  protected readonly filters: readonly Filter[] = [
    'all',
    'favorites',
    'recent',
    'graphic',
    'sober',
  ];
  protected readonly filter = signal<Filter>('all');
  protected readonly tags = signal<ReadonlySet<CvTemplateTag>>(new Set());
  protected readonly query = signal('');
  /** Modèle mis en avant dans le volet d'aperçu (le modèle en cours à l'ouverture). */
  protected readonly selected = signal<CvTemplateId>(this.data.cv.template);
  protected readonly favorites = signal<CvTemplateId[]>(readIds(FAVORITES_KEY));
  private readonly recent = signal<CvTemplateId[]>(readIds(RECENT_KEY));

  /** Aperçu avec un CV d'exemple complet (par défaut) ou avec le CV en cours. */
  protected readonly sources = ['sample', 'mine'] as const;
  protected readonly source = signal<'sample' | 'mine'>('sample');

  /** CV d'exemple aux couleurs et polices du CV en cours, mise en page du modèle. */
  private readonly sample: ResolvedCv = {
    ...resolveCv(createShowcaseCv(this.data.cv.language), null),
    accentColor: this.data.cv.accentColor,
    fonts: this.data.cv.fonts,
  };

  protected readonly suggestions = computed(() => suggestTemplates(this.data.jobAd ?? ''));

  protected readonly photoUrl = computed(() => {
    if (this.source() === 'mine') return this.data.photoUrl;
    return hidesPersonalDetails(this.sample.language) ? null : SAMPLE_PHOTO_URL;
  });

  protected readonly previewCv = computed((): ResolvedCv => ({
    ...(this.source() === 'sample' ? this.sample : this.data.cv),
    template: this.selected(),
  }));

  protected readonly selectedTemplate = computed(
    () => CV_TEMPLATES.find((template) => template.id === this.selected()) ?? CV_TEMPLATES[0],
  );

  protected readonly options = computed(() => {
    const filter = this.filter();
    const tags = [...this.tags()];
    const query = fold(this.query().trim());
    const favorites = this.favorites();
    const recent = this.recent();
    const inFilter = (template: (typeof CV_TEMPLATES)[number]) => {
      if (filter === 'all') return true;
      if (filter === 'favorites') return favorites.includes(template.id);
      if (filter === 'recent') return recent.includes(template.id);
      return template.family === filter;
    };
    const list =
      filter === 'recent'
        ? recent.flatMap((id) => CV_TEMPLATES.filter((template) => template.id === id))
        : CV_TEMPLATES.filter(inFilter);
    return list.filter(
      (template) =>
        tags.every((tag) => (template.tags as readonly CvTemplateTag[]).includes(tag)) &&
        (!query || fold(this.label(template.id)).includes(query)),
    );
  });

  constructor() {
    // Avec des dizaines de modèles, le modèle en cours peut être loin : on le montre d'emblée.
    afterNextRender(() => {
      this.host.nativeElement
        .querySelector('[aria-pressed="true"][data-id]')
        ?.scrollIntoView({ block: 'center' });
    });
  }

  protected thumbnail(id: CvTemplateId): string {
    return templateThumbnailUrl(id, this.data.cv.language);
  }

  protected count(filter: Filter): number {
    if (filter === 'favorites') return this.favorites().length;
    if (filter === 'recent') return this.recent().length;
    return CV_TEMPLATES.filter((template) => filter === 'all' || template.family === filter).length;
  }

  protected toggleTag(tag: CvTemplateTag): void {
    this.tags.update((tags) => {
      const next = new Set(tags);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  protected isFavorite(id: CvTemplateId): boolean {
    return this.favorites().includes(id);
  }

  protected toggleFavorite(id: CvTemplateId): void {
    this.favorites.update((favorites) =>
      favorites.includes(id) ? favorites.filter((f) => f !== id) : [...favorites, id],
    );
    writeSetting(FAVORITES_KEY, JSON.stringify(this.favorites()));
  }

  /** Met un modèle en avant ; sans volet d'aperçu (petit écran), l'applique directement. */
  protected select(id: CvTemplateId, applyWithoutPane = true): void {
    this.selected.set(id);
    if (applyWithoutPane && !matchMedia(PREVIEW_PANE_QUERY).matches) this.apply(id);
  }

  protected apply(id: CvTemplateId): void {
    const recent = [id, ...this.recent().filter((r) => r !== id)].slice(0, RECENT_LIMIT);
    writeSetting(RECENT_KEY, JSON.stringify(recent));
    this.ref.close(id);
  }

  /** Un modèle au hasard parmi ceux affichés, différent du modèle en cours. */
  protected pickRandom(): void {
    const candidates = this.options().filter((option) => option.id !== this.data.cv.template);
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    if (pick) this.apply(pick.id);
  }

  /** Flèches : la sélection suit le focus dans la grille ; Entrée applique. */
  protected onListKeydown(event: KeyboardEvent): void {
    const cards = [
      ...(this.list()?.nativeElement.querySelectorAll<HTMLButtonElement>('button[data-id]') ?? []),
    ];
    const index = cards.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    const current = cards[index].dataset['id'] as CvTemplateId;
    if (event.key === 'Enter') {
      event.preventDefault();
      this.apply(current);
      return;
    }
    const columns = cards.filter((card) => card.offsetTop === cards[0].offsetTop).length || 1;
    const steps: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: columns,
      ArrowUp: -columns,
    };
    const step = steps[event.key];
    if (step === undefined) return;
    const next = cards[Math.max(0, Math.min(cards.length - 1, index + step))];
    event.preventDefault();
    next.focus();
    this.select(next.dataset['id'] as CvTemplateId, false);
  }

  private label(id: CvTemplateId): string {
    const key = `editor.templates.names.${id}`;
    return `${this.transloco.translate(`${key}.name`)} ${this.transloco.translate(`${key}.description`)}`;
  }
}
