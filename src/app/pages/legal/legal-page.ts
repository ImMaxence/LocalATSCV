import { NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';
import { catchError, map, of, switchMap } from 'rxjs';
import { LanguageService } from '../../core/i18n/language.service';
import { MdBlock, parseMarkdown } from '../../shared/markdown';
import { Icon } from '../../shared/icon/icon';

/** Mentions légales, CGU et confidentialité, rédigées en Markdown dans public/legal. */
@Component({
  selector: 'app-legal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon, NgTemplateOutlet],
  template: `
    <article *transloco="let t" class="container-page max-w-3xl py-12 sm:py-16">
      @if (docLanguage() !== language.current()) {
        <p class="mb-8 flex items-center gap-2 rounded-xl bg-surface-2 p-3 text-sm text-muted">
          <app-icon class="size-4 shrink-0" name="info" />{{ t('legal.translationNote') }}
        </p>
      }
      @switch (blocks()) {
        @case (undefined) {
          <div class="grid place-items-center py-24 text-muted">
            <app-icon class="size-6 animate-spin" name="loader" />
          </div>
        }
        @case (null) {
          <p class="text-muted">{{ t('legal.error') }}</p>
        }
        @default {
          @for (block of blocks(); track $index) {
            @switch (block.type) {
              @case ('h1') {
                <h1 class="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
                  <ng-container
                    [ngTemplateOutlet]="inline"
                    [ngTemplateOutletContext]="{ $implicit: block }"
                  />
                </h1>
              }
              @case ('h2') {
                <h2 class="mt-10 font-display text-2xl font-semibold tracking-tight">
                  <ng-container
                    [ngTemplateOutlet]="inline"
                    [ngTemplateOutletContext]="{ $implicit: block }"
                  />
                </h2>
              }
              @case ('h3') {
                <h3 class="mt-6 font-semibold">
                  <ng-container
                    [ngTemplateOutlet]="inline"
                    [ngTemplateOutletContext]="{ $implicit: block }"
                  />
                </h3>
              }
              @case ('ul') {
                <ul
                  class="mt-4 list-disc space-y-1.5 ps-5 leading-relaxed text-muted marker:text-accent"
                >
                  @for (item of listItems(block); track $index) {
                    <li>
                      <ng-container
                        [ngTemplateOutlet]="inline"
                        [ngTemplateOutletContext]="{ $implicit: { inlines: item } }"
                      />
                    </li>
                  }
                </ul>
              }
              @default {
                <p class="mt-4 leading-relaxed text-muted first-of-type:mt-3">
                  <ng-container
                    [ngTemplateOutlet]="inline"
                    [ngTemplateOutletContext]="{ $implicit: block }"
                  />
                </p>
              }
            }
          }
        }
      }
    </article>

    <ng-template #inline let-block>
      @for (part of block.inlines; track $index) {
        @if (part.href) {
          <a
            class="text-accent underline underline-offset-2"
            [href]="part.href"
            [attr.target]="part.href.startsWith('http') ? '_blank' : null"
            rel="noopener"
            >{{ part.text }}</a
          >
        } @else if (part.bold) {
          <strong class="font-semibold text-ink">{{ part.text }}</strong>
        } @else {
          <ng-container>{{ part.text }}</ng-container>
        }
      }
    </ng-template>
  `,
})
export class LegalPage {
  /** Donnée de route : document à afficher. */
  readonly doc = input.required<'notice' | 'terms' | 'privacy'>();

  protected readonly language = inject(LanguageService);
  private readonly http = inject(HttpClient);

  /** Le français fait foi ; les autres langues de l'interface affichent la traduction anglaise. */
  protected readonly docLanguage = computed(() => (this.language.current() === 'fr' ? 'fr' : 'en'));
  private readonly url = computed(() => `/legal/${this.docLanguage()}/${this.doc()}.md`);

  protected readonly blocks = toSignal(
    toObservable(this.url).pipe(
      switchMap((url) =>
        this.http.get(url, { responseType: 'text' }).pipe(
          map((markdown): MdBlock[] | null => parseMarkdown(markdown)),
          catchError(() => of(null)),
        ),
      ),
    ),
  );

  protected listItems(block: MdBlock) {
    return block.type === 'ul' ? block.items : [];
  }
}
