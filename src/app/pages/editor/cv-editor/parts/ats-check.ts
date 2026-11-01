import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { CvAnalysis, analyzeCv } from '../../../../cv/analysis/cv-analyzer';
import { extractLayoutText } from '../../../../cv/analysis/layout-text';
import { PAGE_HEIGHT, PAGE_WIDTH } from '../../../../cv/document/cv-document';
import { CvPreview } from '../../../../cv/document/cv-preview';
import { ResolvedCv } from '../../../../cv/model/resolve-cv';
import { Icon } from '../../../../shared/icon/icon';

const DELAY_MS = 600;

/**
 * Contrôle ATS en direct : la mise en page affichée est lue comme le ferait un ATS
 * (même moteur que l'analyseur de PDF), à chaque modification du CV ou du modèle.
 */
@Component({
  selector: 'app-ats-check',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  template: `
    @if (analysis(); as result) {
      <div
        *transloco="let t; prefix: 'analyze'"
        class="mb-4 rounded-xl border border-line bg-surface"
      >
        <button
          type="button"
          class="flex w-full items-center gap-3 px-4 py-3 text-left"
          [attr.aria-expanded]="open()"
          (click)="open.set(!open())"
        >
          <span
            class="grid size-10 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums"
            [class]="tone()"
            >{{ result.score }}</span
          >
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-semibold">{{ t('live.title') }}</span>
            <span class="block truncate text-xs text-muted">
              {{
                issues().length ? t('live.issues', { count: issues().length }) : t('live.allGood')
              }}
            </span>
          </span>
          <app-icon
            class="size-4 text-muted transition-transform"
            name="chevronDown"
            [class.rotate-180]="open()"
          />
        </button>
        @if (open()) {
          <div class="border-t border-line px-4 py-3">
            @if (issues().length) {
              <ul class="space-y-2.5">
                @for (check of issues(); track check.id) {
                  <li class="flex gap-2.5 text-sm">
                    <app-icon
                      class="mt-0.5 size-4 shrink-0"
                      [class]="check.status === 'fail' ? 'text-danger' : 'text-amber-600'"
                      [name]="check.status === 'fail' ? 'x' : 'alert'"
                      [strokeWidth]="2.25"
                    />
                    <span>
                      <span class="font-medium">{{ t('checks.' + check.id + '.title') }}</span>
                      <span class="text-muted">
                        · {{ t('checks.' + check.id + '.' + check.message, check.params) }}</span
                      >
                      @if (check.items.length) {
                        <span class="text-muted">
                          :
                          @for (item of check.items; track item; let last = $last) {
                            {{
                              check.id === 'sections'
                                ? t('sectionNames.' + item)
                                : '« ' + item + ' »'
                            }}{{ last ? '' : ', ' }}
                          }
                        </span>
                      }
                    </span>
                  </li>
                }
              </ul>
            }
            <details class="mt-3 text-sm">
              <summary class="cursor-pointer font-medium text-accent">
                {{ t('robot.title') }}
              </summary>
              <pre
                class="mt-2 max-h-64 overflow-auto rounded-lg border border-line bg-paper p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted"
                >{{
                  result.lines.join(
                    '
'
                  )
                }}</pre>
            </details>
            <p class="mt-3 text-xs text-muted">{{ t('live.hint') }}</p>
          </div>
        }
      </div>
    }
  `,
})
export class AtsCheck {
  readonly preview = input.required<CvPreview>();
  /** Le CV affiché : chaque changement relance le contrôle. */
  readonly cv = input.required<ResolvedCv>();

  protected readonly analysis = signal<CvAnalysis | null>(null);
  protected readonly open = signal(false);
  protected readonly issues = computed(
    () => this.analysis()?.checks.filter((check) => check.status !== 'pass') ?? [],
  );
  protected readonly tone = computed(() => {
    const score = this.analysis()?.score ?? 0;
    return score >= 85
      ? 'bg-accent-soft text-accent'
      : score >= 65
        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
        : 'bg-danger/12 text-danger';
  });

  private readonly injector = inject(Injector);

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let destroyed = false;
    effect(() => {
      this.cv();
      clearTimeout(timer);
      // Mesure une fois les polices du modèle chargées : sinon la mise en page est provisoire.
      timer = setTimeout(
        () =>
          void document.fonts.ready.then(
            () => !destroyed && afterNextRender(() => this.measure(), { injector: this.injector }),
          ),
        DELAY_MS,
      );
    });
    inject(DestroyRef).onDestroy(() => {
      destroyed = true;
      clearTimeout(timer);
    });
  }

  private measure(): void {
    const preview = this.preview();
    const root = preview.documentElement();
    if (!root || root.offsetParent === null) return;
    const pdf = extractLayoutText(root, preview.scale(), PAGE_WIDTH, PAGE_HEIGHT);
    this.analysis.set(analyzeCv(pdf));
  }
}
