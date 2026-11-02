import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';
import { Subscription } from 'rxjs';
import { FAQ_ITEMS } from '../../pages/landing/faq';
import {
  LANGUAGE_INFO,
  UI_LANGUAGES,
  UiLanguage,
  indexedLanguages,
  isUiLanguage,
  localizedPath,
  publicPage,
} from './languages';

export const SITE_URL = 'https://localatscv.mbonnici.fr';

/**
 * Titre et balises SEO de chaque page. Le `title` des routes est une clé de traduction
 * (ex. `pages.editor`) ; la description associée est `seo.<page>`. Tout est retraduit quand la
 * langue change, et écrit dans le HTML des pages pré-générées au build (moteurs de recherche,
 * aperçus de liens, robots des IA). Chaque page publique indexée annonce ses versions dans les
 * autres langues (hreflang).
 */
@Injectable({ providedIn: 'root' })
export class TranslatedTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly transloco = inject(TranslocoService);
  private subscription?: Subscription;

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const key = this.buildTitle(snapshot) ?? 'pages.home';
    const page = key.replace(/^pages\./, '');
    const path = snapshot.url.split(/[?#]/)[0];
    const publicPath = publicPage(path);
    const languages = publicPath ? indexedLanguages(publicPath) : [];
    this.subscription?.unsubscribe();
    this.subscription = this.transloco.selectTranslation().subscribe(() => {
      const active = this.transloco.getActiveLang();
      const lang: UiLanguage = isUiLanguage(active) ? active : 'fr';
      const title = `LocalATSCV · ${this.transloco.translate(key)}`;
      const description = this.transloco.translate(`seo.${page}`);
      const url = `${SITE_URL}${path === '/' ? '/' : path}`;
      this.title.setTitle(title);
      this.meta.updateTag({ name: 'description', content: description });
      this.meta.updateTag({ property: 'og:title', content: title });
      this.meta.updateTag({ property: 'og:description', content: description });
      this.meta.updateTag({ property: 'og:url', content: url });
      this.meta.updateTag({ property: 'og:locale', content: LANGUAGE_INFO[lang].ogLocale });
      this.meta.updateTag({ name: 'twitter:title', content: title });
      this.meta.updateTag({ name: 'twitter:description', content: description });
      // Les pages de l'éditeur ne contiennent que des données locales : rien à indexer. Une page
      // sans contenu propre dans cette langue (journal en français…) ne l'est pas non plus.
      const indexed = languages.includes(lang);
      this.meta.updateTag({
        name: 'robots',
        content: indexed ? 'index, follow' : 'noindex, follow',
      });
      this.setCanonical(url);
      this.setAlternates(indexed ? publicPath : null, languages);
      this.setStructuredData(page === 'home' ? this.homeStructuredData(url, description) : null);
    });
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }
    link.href = url;
  }

  /**
   * Versions de la page dans les autres langues. x-default, proposé aux langues sans version,
   * désigne l'anglais quand il existe.
   */
  private setAlternates(page: string | null, languages: readonly UiLanguage[]): void {
    const head = this.document.head;
    head.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => link.remove());
    if (!page || languages.length < 2) return;
    const fallback: UiLanguage = languages.includes('en') ? 'en' : languages[0];
    const entries: [string, UiLanguage][] = [
      ...languages.map((lang): [string, UiLanguage] => [LANGUAGE_INFO[lang].hreflang ?? lang, lang]),
      ['x-default', fallback],
    ];
    for (const [hreflang, lang] of entries) {
      const link = this.document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = hreflang;
      link.href = `${SITE_URL}${localizedPath(page, lang)}`;
      head.appendChild(link);
    }
  }

  /** Données structurées (JSON-LD) : un bloc de données, jamais exécuté par le navigateur. */
  private setStructuredData(data: object | null): void {
    const existing = this.document.getElementById('structured-data');
    if (!data) return existing?.remove();
    const script = existing ?? this.document.createElement('script');
    script.id = 'structured-data';
    script.setAttribute('type', 'application/ld+json');
    script.textContent = JSON.stringify(data);
    if (!existing) this.document.head.appendChild(script);
  }

  private homeStructuredData(url: string, description: string): object {
    const t = (key: string) => this.transloco.translate(key);
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          name: 'LocalATSCV',
          url,
          description,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          browserRequirements: 'JavaScript',
          inLanguage: [...UI_LANGUAGES],
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
          license: 'https://opensource.org/licenses/MIT',
          author: { '@type': 'Person', name: 'Maxence Bonnici' },
          sameAs: ['https://github.com/ImMaxence/LocalATSCV'],
        },
        {
          '@type': 'FAQPage',
          mainEntity: FAQ_ITEMS.map((item) => ({
            '@type': 'Question',
            name: t(`landing.faq.items.${item}.q`),
            acceptedAnswer: { '@type': 'Answer', text: t(`landing.faq.items.${item}.a`) },
          })),
        },
      ],
    };
  }
}
