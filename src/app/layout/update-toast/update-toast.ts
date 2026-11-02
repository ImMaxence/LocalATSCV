import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LanguageService } from '../../core/i18n/language.service';
import { AppUpdateService } from '../../core/pwa/app-update.service';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-update-toast',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoDirective, Icon],
  template: `
    @if (updates.updateReady()) {
      <div
        *transloco="let t"
        role="status"
        class="fixed start-4 end-4 bottom-4 z-50 flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-xl sm:start-auto sm:max-w-sm"
      >
        <app-icon class="mt-0.5 size-5 text-accent" name="sparkles" />
        <div class="flex-1 text-sm">
          <p class="font-semibold">{{ t('update.title') }}</p>
          <p class="mt-1 text-muted">
            {{ t('update.text') }}
            <a
              [routerLink]="language.link('/changelog')"
              class="text-accent underline underline-offset-2"
            >
              {{ t('update.changelog') }}
            </a>
          </p>
          <div class="mt-3 flex gap-2">
            <button type="button" class="btn btn-primary py-1.5!" (click)="updates.reload()">
              <app-icon class="size-4" name="refresh" />{{ t('update.reload') }}
            </button>
            <button type="button" class="btn btn-ghost py-1.5!" (click)="updates.dismiss()">
              {{ t('update.later') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class UpdateToast {
  protected readonly updates = inject(AppUpdateService);
  protected readonly language = inject(LanguageService);
}
