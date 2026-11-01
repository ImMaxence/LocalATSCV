import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { ThemePreference, ThemeService } from '../../core/theme/theme.service';
import { Icon, IconName } from '../../shared/icon/icon';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  template: `
    <div
      *transloco="let t"
      role="group"
      class="flex items-center rounded-full border border-line bg-surface p-0.5"
      [attr.aria-label]="t('theme.label')"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          class="grid size-7 place-items-center rounded-full text-muted transition-colors hover:text-ink aria-pressed:bg-surface-2 aria-pressed:text-ink"
          [attr.aria-pressed]="theme.preference() === option.value"
          [attr.title]="t('theme.' + option.value)"
          (click)="theme.setPreference(option.value)"
        >
          <app-icon class="size-4" [name]="option.icon" />
          <span class="sr-only">{{ t('theme.' + option.value) }}</span>
        </button>
      }
    </div>
  `,
})
export class ThemeToggle {
  protected readonly theme = inject(ThemeService);

  protected readonly options: { value: ThemePreference; icon: IconName }[] = [
    { value: 'light', icon: 'sun' },
    { value: 'system', icon: 'monitor' },
    { value: 'dark', icon: 'moon' },
  ];
}
