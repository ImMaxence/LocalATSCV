import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Icon } from '../../shared/icon/icon';

/** Page d'attente pour les sections qui arrivent dans les prochaines versions. */
@Component({
  selector: 'app-coming-soon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoDirective, Icon],
  template: `
    <section *transloco="let t" class="container-page grid place-items-center py-28 text-center">
      <div
        class="grid size-14 place-items-center rounded-2xl border border-line bg-surface text-accent"
      >
        <app-icon class="size-7" name="hammer" />
      </div>
      <h1 class="mt-6 font-display text-4xl font-semibold tracking-tight">
        {{ t('comingSoon.title') }}
      </h1>
      <p class="mt-3 max-w-md text-muted">{{ t('comingSoon.text') }}</p>
      <a routerLink="/" class="btn btn-ghost mt-8">
        <app-icon class="size-4" name="arrowLeft" />{{ t('comingSoon.back') }}
      </a>
    </section>
  `,
})
export class ComingSoon {}
