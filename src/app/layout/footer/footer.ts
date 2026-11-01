import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { APP_VERSION, AUTHOR_NAME, CONTACT_EMAIL, REPO_URL } from '../../core/app-info';
import { LanguageService } from '../../core/i18n/language.service';
import { buildIssueUrl } from '../../core/report-issue';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoDirective, Icon],
  templateUrl: './footer.html',
})
export class Footer {
  private readonly router = inject(Router);
  private readonly language = inject(LanguageService);

  protected readonly version = APP_VERSION;
  protected readonly author = AUTHOR_NAME;
  protected readonly contactEmail = CONTACT_EMAIL;
  protected readonly repoUrl = REPO_URL;
  protected readonly year = new Date().getFullYear();

  /** Construit l'URL au clic pour embarquer la page et la langue du moment. */
  protected reportIssue(event: MouseEvent): void {
    const anchor = event.currentTarget as HTMLAnchorElement;
    anchor.href = buildIssueUrl({
      version: APP_VERSION,
      language: this.language.current(),
      page: this.router.url.split(/[?#]/)[0],
      userAgent: navigator.userAgent,
    });
  }
}
