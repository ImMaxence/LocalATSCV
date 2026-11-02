import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { catchError, map, of } from 'rxjs';
import { APP_VERSION } from '../../core/app-info';
import { LanguageService } from '../../core/i18n/language.service';
import { Icon, IconName } from '../../shared/icon/icon';
import { ChangeType, Release, parseChangelog } from './changelog-parser';

const TYPE_STYLES: Record<ChangeType, { icon: IconName; classes: string }> = {
  added: { icon: 'plus', classes: 'bg-accent-soft text-accent' },
  changed: { icon: 'refresh', classes: 'bg-sky-500/12 text-sky-700 dark:text-sky-300' },
  fixed: { icon: 'hammer', classes: 'bg-amber-500/15 text-amber-800 dark:text-amber-300' },
  removed: { icon: 'trash', classes: 'bg-danger/12 text-danger' },
  deprecated: { icon: 'alert', classes: 'bg-surface-2 text-muted' },
  security: { icon: 'shield', classes: 'bg-violet-500/12 text-violet-600 dark:text-violet-300' },
  other: { icon: 'list', classes: 'bg-surface-2 text-muted' },
};

/** Journal des modifications, lu depuis le CHANGELOG.md du dépôt (copié tel quel au build). */
@Component({
  selector: 'app-changelog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  templateUrl: './changelog.html',
})
export class Changelog {
  protected readonly language = inject(LanguageService);

  protected readonly releases = toSignal(
    inject(HttpClient)
      .get('/CHANGELOG.md', { responseType: 'text' })
      .pipe(
        map((markdown): Release[] | 'error' => parseChangelog(markdown)),
        catchError(() => of('error' as const)),
      ),
  );
  protected readonly failed = computed(() => this.releases() === 'error');
  /**
   * Une section « Non publié » éventuelle décrit la version en cours de développement :
   * elle est affichée sous le numéro de version actuel (package.json).
   */
  protected readonly list = computed(() => {
    const releases = this.releases();
    if (!Array.isArray(releases)) return [];
    const hasCurrent = releases.some((release) => release.version === APP_VERSION);
    return releases
      .filter((release) => release.version !== null || !hasCurrent)
      .map((release) =>
        release.version === null ? { ...release, version: APP_VERSION } : release,
      );
  });

  protected readonly currentVersion = APP_VERSION;
  protected readonly typeStyles = TYPE_STYLES;

  protected formatDate(date: string): string {
    return new Intl.DateTimeFormat(this.language.current(), {
      dateStyle: 'long',
      timeZone: 'UTC',
    }).format(new Date(`${date}T00:00:00Z`));
  }
}
