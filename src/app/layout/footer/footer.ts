import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { APP_VERSION, AUTHOR_NAME, CONTACT_EMAIL, REPO_URL } from '../../core/app-info';
import { filter, map } from 'rxjs';
import { LanguageService } from '../../core/i18n/language.service';
import {
  LANGUAGE_INFO,
  UI_LANGUAGES,
  UiLanguage,
  localizedPath,
  publicPage,
} from '../../core/i18n/languages';
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
  protected readonly language = inject(LanguageService);

  protected readonly version = APP_VERSION;
  protected readonly author = AUTHOR_NAME;
  protected readonly contactEmail = CONTACT_EMAIL;
  protected readonly repoUrl = REPO_URL;
  protected readonly year = new Date().getFullYear();

  protected readonly languages = UI_LANGUAGES;
  protected readonly info = LANGUAGE_INFO;
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  /** Page proposée dans chaque langue : celle affichée, ou l'accueil depuis l'éditeur. */
  private readonly page = computed(() => publicPage(this.url()) ?? '/');

  protected languageLink(lang: UiLanguage): string {
    return localizedPath(this.page(), lang);
  }

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
