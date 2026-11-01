import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { CoverLetter } from '../model/cv.model';
import { ResolvedCv } from '../model/resolve-cv';
import { CvDocument, PAGE_HEIGHT, PAGE_WIDTH } from './cv-document';

const pagesFor = (height: number) => Math.max(1, Math.ceil((height - 2) / PAGE_HEIGHT));

/**
 * Affiche le CV réduit à la largeur disponible. En mode aperçu, des repères
 * indiquent les sauts de page ; en mode vignette, seule la première page est visible.
 */
@Component({
  selector: 'app-cv-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CvDocument, TranslocoDirective],
  host: { class: 'block' },
  template: `
    <div #frame class="relative w-full overflow-hidden" [style.height.px]="frameHeight()">
      <div
        #paper
        class="absolute top-0 left-0 origin-top-left"
        [style.width.px]="pageWidth"
        [style.transform]="'scale(' + scale() + ')'"
      >
        <app-cv-document [cv]="cv()" [photoUrl]="photoUrl()" [letter]="letter()" />
        @if (!thumbnail()) {
          @for (page of pageBreaks(); track page) {
            <div
              *transloco="let t"
              class="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-sky-400/70"
              [style.top.px]="page * pageHeight"
              aria-hidden="true"
            >
              <span
                class="absolute -top-3 right-3 rounded-full bg-sky-500 px-2.5 py-0.5 text-[11px] font-semibold text-white"
              >
                {{ t('editor.preview.page', { n: page + 1 }) }}
              </span>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class CvPreview {
  readonly cv = input.required<ResolvedCv>();
  readonly photoUrl = input<string | null>(null);
  readonly thumbnail = input(false);
  /** Lettre de motivation à afficher avec le design du CV (voir CvDocument). */
  readonly letter = input<CoverLetter | null>(null);

  protected readonly pageWidth = PAGE_WIDTH;
  protected readonly pageHeight = PAGE_HEIGHT;

  private readonly frame = viewChild.required<ElementRef<HTMLElement>>('frame');
  private readonly paper = viewChild.required<ElementRef<HTMLElement>>('paper');

  readonly scale = signal(0.5);
  private readonly paperHeight = signal(PAGE_HEIGHT);

  protected readonly frameHeight = computed(
    () => (this.thumbnail() ? PAGE_HEIGHT : this.paperHeight()) * this.scale(),
  );
  /** Nombre de pages A4 occupées (une marge de 2 px absorbe les arrondis). */
  readonly pageCount = computed(() => pagesFor(this.paperHeight()));
  protected readonly pageBreaks = computed(() =>
    Array.from({ length: this.pageCount() - 1 }, (_, i) => i + 1),
  );

  /** Nombre de pages mesuré tout de suite, sans attendre l'observateur de redimensionnement. */
  measurePages(): number {
    return pagesFor(this.paper().nativeElement.offsetHeight);
  }

  /** Élément racine du CV rendu (sans les repères de pages), pour le contrôle ATS en direct. */
  documentElement(): HTMLElement | null {
    return this.paper().nativeElement.querySelector('app-cv-document');
  }

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observer = new ResizeObserver(() => {
        this.scale.set(this.frame().nativeElement.clientWidth / PAGE_WIDTH);
        this.paperHeight.set(Math.max(PAGE_HEIGHT, this.paper().nativeElement.offsetHeight));
      });
      observer.observe(this.frame().nativeElement);
      observer.observe(this.paper().nativeElement);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
