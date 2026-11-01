import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  TitleStrategy,
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { provideTransloco } from '@jsverse/transloco';
import { routes } from './app.routes';
import { AnchorScroller } from './core/anchor-scroller';
import { DEFAULT_UI_LANGUAGE, LanguageService, UI_LANGUAGES } from './core/i18n/language.service';
import { TranslatedTitleStrategy } from './core/i18n/translated-title-strategy';
import { TranslocoHttpLoader } from './core/i18n/transloco-loader';
import { skipSamePageTransitions } from './core/view-transitions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withComponentInputBinding(),
      withViewTransitions({
        skipInitialTransition: true,
        onViewTransitionCreated: skipSamePageTransitions,
      }),
    ),
    { provide: ViewportScroller, useClass: AnchorScroller },
    { provide: TitleStrategy, useClass: TranslatedTitleStrategy },
    provideHttpClient(withFetch()),
    provideTransloco({
      config: {
        availableLangs: [...UI_LANGUAGES],
        defaultLang: DEFAULT_UI_LANGUAGE,
        fallbackLang: DEFAULT_UI_LANGUAGE,
        missingHandler: { useFallbackTranslation: true },
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    provideAppInitializer(() => inject(LanguageService).init()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
