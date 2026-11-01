import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { CvPreview } from '../../../../cv/document/cv-preview';
import { AtsCompatibility, CV_TEMPLATES, CvTemplateId } from '../../../../cv/model/cv.model';
import { ResolvedCv } from '../../../../cv/model/resolve-cv';
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

/** Galerie des modèles, chacun rendu avec le contenu réel du CV. */
@Component({
  selector: 'app-template-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, CvPreview, Icon],
  template: `
    <div
      *transloco="let t; prefix: 'editor.templates'"
      class="flex max-h-[90dvh] w-[min(68rem,calc(100vw-2rem))] flex-col rounded-2xl border border-line bg-surface shadow-2xl"
    >
      <header class="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
        <div>
          <h2 class="font-display text-xl font-semibold tracking-tight">{{ t('title') }}</h2>
          <p class="mt-1 text-sm text-muted">{{ t('subtitle') }}</p>
        </div>
        <button type="button" class="icon-btn" [attr.aria-label]="t('close')" (click)="ref.close()">
          <app-icon class="size-4" name="x" />
        </button>
      </header>

      <ul class="grid gap-5 overflow-y-auto p-6 sm:grid-cols-2 lg:grid-cols-3">
        @for (option of options(); track option.id) {
          <li>
            <button
              type="button"
              class="group block w-full rounded-2xl border-2 p-2 text-left transition-colors"
              [class]="
                option.id === data.cv.template
                  ? 'border-accent bg-accent-soft/40'
                  : 'border-transparent hover:border-line'
              "
              [attr.aria-pressed]="option.id === data.cv.template"
              (click)="ref.close(option.id)"
            >
              <div class="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
                <app-cv-preview
                  class="pointer-events-none"
                  aria-hidden="true"
                  [cv]="option.cv"
                  [photoUrl]="data.photoUrl"
                  [thumbnail]="true"
                />
              </div>
              <div class="px-1.5 pt-3 pb-1">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold">{{ t('names.' + option.id + '.name') }}</span>
                  @if (option.id === data.cv.template) {
                    <app-icon class="size-4 text-accent" name="check" [strokeWidth]="2.5" />
                  }
                </div>
                <p class="mt-1 text-xs leading-relaxed text-muted">
                  {{ t('names.' + option.id + '.description') }}
                </p>
                <p
                  class="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                  [class]="badges[option.ats]"
                >
                  @if (option.ats === 'fair') {
                    <app-icon class="size-3" name="alert" [strokeWidth]="2.25" />
                  }
                  {{ t('ats') }} : {{ t('levels.' + option.ats) }}
                </p>
              </div>
            </button>
          </li>
        }
      </ul>

      <p class="flex items-start gap-2 border-t border-line px-6 py-3 text-xs text-muted">
        <app-icon class="mt-px size-3.5 shrink-0" name="info" />{{ t('atsHint') }}
      </p>
    </div>
  `,
})
export class TemplatePicker {
  protected readonly data = inject<TemplatePickerData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<CvTemplateId>>(DialogRef);
  protected readonly badges = ATS_BADGES;

  protected readonly options = computed(() =>
    CV_TEMPLATES.map((template) => ({
      ...template,
      cv: { ...this.data.cv, template: template.id },
    })),
  );
}
