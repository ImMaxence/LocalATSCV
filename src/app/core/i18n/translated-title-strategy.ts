import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';

/**
 * Le `title` des routes est une clé de traduction (ex. `pages.editor`).
 * Le titre de l'onglet est retraduit automatiquement quand la langue change.
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly transloco = inject(TranslocoService);
  private subscription?: Subscription;

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot) ?? 'pages.home';
    this.subscription?.unsubscribe();
    this.subscription = this.transloco
      .selectTranslate<string>(key)
      .subscribe((label) => this.title.setTitle(`LocalATSCV · ${label}`));
  }
}
