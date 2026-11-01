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
import { ResolvedCv } from '../model/resolve-cv';
import { CvDocument, PAGE_HEIGHT, PAGE_WIDTH } from './cv-document';

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
        <app-cv-document [cv]="cv()" [photoUrl]="photoUrl()" />
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

  protected readonly pageWidth = PAGE_WIDTH;
  protected readonly pageHeight = PAGE_HEIGHT;

  private readonly frame = viewChild.required<ElementRef<HTMLElement>>('frame');
  private readonly paper = viewChild.required<ElementRef<HTMLElement>>('paper');

  protected readonly scale = signal(0.5);
  private readonly paperHeight = signal(PAGE_HEIGHT);

  protected readonly frameHeight = computed(
    () => (this.thumbnail() ? PAGE_HEIGHT : this.paperHeight()) * this.scale(),
  );
  protected readonly pageBreaks = computed(() =>
    Array.from({ length: Math.ceil(this.paperHeight() / PAGE_HEIGHT) - 1 }, (_, i) => i + 1),
  );

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
