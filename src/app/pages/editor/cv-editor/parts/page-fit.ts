import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { CvPreview } from '../../../../cv/document/cv-preview';
import { DEFAULT_LAYOUT, LAYOUT_LIMITS } from '../../../../cv/model/cv.model';
import { Icon } from '../../../../shared/icon/icon';
import { CvEditorStore } from '../cv-editor.store';

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

/**
 * Faire tenir le CV sur une page : nombre de pages, ajustement automatique (espacements d'abord,
 * puis taille du texte) et réglage manuel. Le texte reste du vrai texte, seule sa mise en page change.
 */
@Component({
  selector: 'app-page-fit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  template: `
    @let pages = preview().pageCount();
    <div
      *transloco="let t; prefix: 'editor.fit'"
      class="mb-4 rounded-xl border border-line bg-surface"
    >
      <div class="flex flex-wrap items-center gap-3 px-4 py-3">
        <span
          class="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums"
          [class]="
            pages > 1
              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
              : 'bg-accent-soft text-accent'
          "
          >{{ pages }}</span
        >
        <span class="min-w-0 flex-1">
          <span class="block text-sm font-semibold">
            {{ pages > 1 ? t('pages', { count: pages }) : t('onePage') }}
          </span>
          <span class="block text-xs text-muted">
            {{
              store.grayscale()
                ? t('grayscaleHint')
                : pages > 1 && atMinimum()
                  ? t('stillTooLong')
                  : pages > 1
                    ? t('hintMany')
                    : t('hintOne')
            }}
          </span>
        </span>
        @if (pages > 1 && !atMinimum()) {
          <button
            type="button"
            class="btn btn-primary px-3! py-1.5! text-sm"
            [disabled]="fitting()"
            (click)="fit()"
          >
            <app-icon
              class="size-4"
              [class.animate-spin]="fitting()"
              [name]="fitting() ? 'loader' : 'shrink'"
            />
            {{ t('fit') }}
          </button>
        }
        <button
          type="button"
          class="icon-btn aria-pressed:bg-ink aria-pressed:text-paper"
          [attr.aria-pressed]="store.grayscale()"
          [attr.aria-label]="t('grayscale')"
          [title]="t('grayscale')"
          (click)="store.grayscale.set(!store.grayscale())"
        >
          <app-icon class="size-4" name="contrast" />
        </button>
        <button
          type="button"
          class="icon-btn"
          [attr.aria-expanded]="open()"
          [attr.aria-label]="t('settings')"
          [title]="t('settings')"
          (click)="open.set(!open())"
        >
          <app-icon class="size-4" name="sliders" />
        </button>
      </div>
      @if (open()) {
        <div class="grid gap-4 border-t border-line px-4 py-3 sm:grid-cols-2">
          <label class="block text-sm">
            <span class="flex justify-between font-medium">
              {{ t('spacing') }}
              <output class="text-muted tabular-nums">{{ percent(layout().spacing) }}</output>
            </span>
            <input
              type="range"
              class="mt-2 w-full accent-accent"
              [min]="limits.spacing.min * 100"
              max="100"
              step="5"
              [value]="layout().spacing * 100"
              (input)="store.setLayout({ spacing: $any($event.target).valueAsNumber / 100 })"
            />
          </label>
          <label class="block text-sm">
            <span class="flex justify-between font-medium">
              {{ t('scale') }}
              <output class="text-muted tabular-nums">{{ percent(layout().scale) }}</output>
            </span>
            <input
              type="range"
              class="mt-2 w-full accent-accent"
              [min]="limits.scale.min * 100"
              max="100"
              step="1"
              [value]="layout().scale * 100"
              (input)="store.setLayout({ scale: $any($event.target).valueAsNumber / 100 })"
            />
          </label>
          <div class="flex flex-wrap items-center justify-between gap-2 sm:col-span-2">
            <p class="text-xs text-muted">{{ t('settingsHint') }}</p>
            <button
              type="button"
              class="btn btn-ghost px-3! py-1! text-xs"
              [disabled]="isDefault()"
              (click)="reset()"
            >
              <app-icon class="size-3.5" name="refresh" />{{ t('reset') }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class PageFit {
  readonly preview = input.required<CvPreview>();

  protected readonly store = inject(CvEditorStore);
  protected readonly limits = LAYOUT_LIMITS;
  protected readonly open = signal(false);
  protected readonly fitting = signal(false);

  protected readonly layout = computed(() => this.store.cv()?.layout ?? DEFAULT_LAYOUT);
  /** Réglages au plus serré : si le CV dépasse encore, il faut raccourcir le contenu. */
  protected readonly atMinimum = computed(
    () =>
      this.layout().spacing <= LAYOUT_LIMITS.spacing.min + 0.001 &&
      this.layout().scale <= LAYOUT_LIMITS.scale.min + 0.001,
  );
  protected readonly isDefault = computed(
    () => this.layout().spacing === 1 && this.layout().scale === 1,
  );

  protected percent(value: number): string {
    return `${Math.round(value * 100)} %`;
  }

  protected reset(): void {
    this.store.setLayout({ ...DEFAULT_LAYOUT });
  }

  /** Resserre les espacements par paliers de 5 %, puis le texte par paliers de 1 %, jusqu'à 1 page. */
  protected async fit(): Promise<void> {
    this.fitting.set(true);
    this.store.checkpoint();
    const fits = async () => {
      await nextFrame();
      await nextFrame();
      return this.preview().measurePages() <= 1;
    };
    let { spacing, scale } = this.layout();
    let done = false;
    while (!done && spacing > LAYOUT_LIMITS.spacing.min + 0.001) {
      spacing = Math.max(LAYOUT_LIMITS.spacing.min, Math.round((spacing - 0.05) * 100) / 100);
      this.store.setLayout({ spacing }, false);
      done = await fits();
    }
    while (!done && scale > LAYOUT_LIMITS.scale.min + 0.001) {
      scale = Math.max(LAYOUT_LIMITS.scale.min, Math.round((scale - 0.01) * 100) / 100);
      this.store.setLayout({ scale }, false);
      done = await fits();
    }
    this.fitting.set(false);
  }
}
