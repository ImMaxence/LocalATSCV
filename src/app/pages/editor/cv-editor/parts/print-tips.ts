import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { writeSetting } from '../../../../core/storage/local-settings';
import { Icon } from '../../../../shared/icon/icon';

export const PRINT_TIPS_SETTING = 'printTipsDismissed';

/** Conseils avant l'impression : le PDF est produit par la fenêtre d'impression du navigateur. */
@Component({
  selector: 'app-print-tips',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  template: `
    <div
      *transloco="let t; prefix: 'editor.print'"
      class="w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-6 shadow-2xl"
    >
      <div class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent">
          <app-icon class="size-5" name="printer" />
        </span>
        <h2 class="font-display text-xl font-semibold tracking-tight">{{ t('title') }}</h2>
      </div>
      <p class="mt-4 text-sm text-muted">{{ t('text') }}</p>
      <ol class="mt-4 space-y-2.5 text-sm">
        @for (tip of tips; track tip; let i = $index) {
          <li class="flex gap-3">
            <span
              class="grid size-6 shrink-0 place-items-center rounded-full bg-surface-2 text-xs font-semibold"
              >{{ i + 1 }}</span
            >
            <span class="pt-0.5">{{ t('tips.' + tip) }}</span>
          </li>
        }
      </ol>
      <label class="mt-5 flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          class="size-4 accent-accent"
          [checked]="dontShow()"
          (change)="dontShow.set($any($event.target).checked)"
        />
        {{ t('dontShow') }}
      </label>
      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="btn btn-ghost" (click)="ref.close(false)">
          {{ t('cancel') }}
        </button>
        <button type="button" class="btn btn-primary" cdkFocusInitial (click)="confirm()">
          <app-icon class="size-4" name="printer" />{{ t('print') }}
        </button>
      </div>
    </div>
  `,
})
export class PrintTips {
  protected readonly ref = inject<DialogRef<boolean>>(DialogRef);
  protected readonly dontShow = signal(false);
  protected readonly tips = ['destination', 'margins', 'headers', 'background'];

  protected confirm(): void {
    if (this.dontShow()) writeSetting(PRINT_TIPS_SETTING, '1');
    this.ref.close(true);
  }
}
