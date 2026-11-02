import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { suggestVersionName } from '../../../../cv/analysis/job-match';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { Icon } from '../../../../shared/icon/icon';
import { ToastService } from '../../../../shared/toast/toast';
import { CvEditorStore } from '../cv-editor.store';

/**
 * Adapter le CV à une offre : l'annonce est collée (aucun site n'est contacté),
 * ses mots-clés sont comparés au CV affiché et une version ciblée peut être générée.
 */
@Component({
  selector: 'app-job-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  template: `
    <section *transloco="let t; prefix: 'editor.job'" class="panel overflow-hidden">
      <button
        type="button"
        class="flex w-full items-center gap-3 px-4 py-3 text-start"
        [attr.aria-expanded]="isOpen()"
        (click)="open.set(!isOpen())"
      >
        <span class="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent">
          <app-icon class="size-4" name="target" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="block font-semibold">{{ t('title') }}</span>
          <span class="block truncate text-xs text-muted">{{ t('sources') }}</span>
        </span>
        @if (store.jobMatch(); as match) {
          <span
            class="rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums"
            [class]="tone(match.score)"
            >{{ match.score }}/100</span
          >
        }
        <app-icon
          class="size-4 text-muted transition-transform"
          name="chevronDown"
          [class.rotate-180]="isOpen()"
        />
      </button>

      @if (isOpen()) {
        <div class="space-y-4 border-t border-line p-4">
          <textarea
            class="field-input field-auto max-h-80 min-h-28"
            [attr.aria-label]="t('title')"
            [placeholder]="t('placeholder')"
            [value]="store.jobAd()"
            (input)="store.setJobAd($any($event.target).value)"
          ></textarea>

          @if (looksLikeUrl()) {
            <p
              class="flex gap-2 rounded-xl bg-amber-500/12 p-3 text-sm text-amber-800 dark:text-amber-200"
            >
              <app-icon class="mt-0.5 size-4 shrink-0" name="info" />{{ t('urlWarning') }}
            </p>
          }

          @if (store.jobAd().trim() && !store.jobKeywords().length) {
            <p class="text-sm text-muted">{{ t('empty') }}</p>
          }

          @if (store.jobMatch(); as match) {
            <div class="flex items-center gap-4">
              <div class="relative size-16 shrink-0">
                <svg viewBox="0 0 64 64" class="size-full -rotate-90">
                  <circle cx="32" cy="32" r="27" class="fill-none stroke-line" stroke-width="6" />
                  <circle
                    cx="32"
                    cy="32"
                    r="27"
                    class="fill-none stroke-accent transition-[stroke-dashoffset] duration-500"
                    stroke-width="6"
                    stroke-linecap="round"
                    [attr.stroke-dasharray]="circumference"
                    [attr.stroke-dashoffset]="circumference * (1 - match.score / 100)"
                  />
                </svg>
                <span
                  class="absolute inset-0 grid place-items-center text-base font-bold tabular-nums"
                  >{{ match.score }}</span
                >
              </div>
              <div class="text-sm">
                <p class="font-semibold">{{ t('score') }}</p>
                <p class="text-muted">
                  {{
                    t('summary', { found: match.found.length, total: store.jobKeywords().length })
                  }}
                </p>
              </div>
            </div>

            @if (match.found.length) {
              <div>
                <p class="field-label">{{ t('found') }}</p>
                <ul class="flex flex-wrap gap-1.5">
                  @for (keyword of match.found; track keyword.key) {
                    <li
                      class="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-medium"
                    >
                      <app-icon class="size-3 text-accent" name="check" [strokeWidth]="2.5" />{{
                        keyword.label
                      }}
                    </li>
                  }
                </ul>
              </div>
            }

            @if (match.missing.length) {
              <div>
                <p class="field-label">{{ t('missing') }}</p>
                <ul class="flex flex-wrap gap-1.5">
                  @for (keyword of match.missing; track keyword.key) {
                    <li>
                      <button
                        type="button"
                        class="inline-flex items-center gap-1 rounded-full border border-dashed border-danger/50 px-2.5 py-0.5 text-xs font-medium text-danger transition-colors hover:bg-danger/10"
                        [title]="t('addToSkills')"
                        (click)="addKeyword(keyword.label)"
                      >
                        <app-icon class="size-3" name="plus" [strokeWidth]="2.5" />{{
                          keyword.label
                        }}
                      </button>
                    </li>
                  }
                </ul>
                <p class="mt-1.5 text-xs text-muted">{{ t('missingHint') }}</p>
              </div>
            }

            @if (store.activeVersion(); as version) {
              <p class="flex items-center gap-2 text-xs text-muted">
                <app-icon class="size-3.5 text-accent" name="check" [strokeWidth]="2.5" />
                {{ t('savedInVersion', { name: version.name }) }}
              </p>
            } @else {
              <div class="rounded-xl bg-surface-2 p-3">
                <button type="button" class="btn btn-primary w-full" (click)="createVersion()">
                  <app-icon class="size-4" name="wand" />{{ t('createVersion') }}
                </button>
                <p class="mt-2 text-center text-xs text-muted">{{ t('createVersionHint') }}</p>
              </div>
            }
          }
        </div>
      }
    </section>
  `,
})
export class JobPanel {
  /** Version créée : l'éditeur l'affiche et met l'URL à jour. */
  readonly versionCreated = output<string>();

  protected readonly store = inject(CvEditorStore);
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);
  private readonly transloco = inject(TranslocoService);

  protected readonly open = signal<boolean | null>(null);
  /** Ouvert d'office quand la version affichée contient déjà une annonce. */
  protected readonly isOpen = computed(() => this.open() ?? this.store.jobAd().trim().length > 0);
  protected readonly circumference = 2 * Math.PI * 27;
  protected readonly looksLikeUrl = computed(() =>
    /^\s*https?:\/\/\S+\s*$/i.test(this.store.jobAd()),
  );

  protected tone(score: number): string {
    return score >= 70
      ? 'bg-accent-soft text-accent'
      : score >= 40
        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
        : 'bg-danger/12 text-danger';
  }

  private t(key: string, params?: Record<string, unknown>): string {
    return this.transloco.translate(`editor.job.${key}`, params);
  }

  protected addKeyword(keyword: string): void {
    this.store.addKeywordToSkills(keyword, this.t('keywordsGroup'));
    this.toast.success(this.t('added', { keyword }));
  }

  protected async createVersion(): Promise<void> {
    const name = await this.dialog.prompt({
      title: this.t('createVersion'),
      message: this.t('createVersionHint'),
      confirmLabel: this.transloco.translate('dialog.create'),
      input: {
        label: this.transloco.translate('editor.versions.nameLabel'),
        value: suggestVersionName(this.store.jobAd()),
      },
    });
    if (!name) return;
    await this.store.createVersionForJob(name);
    const id = this.store.activeVersionId();
    if (id) this.versionCreated.emit(id);
  }
}
