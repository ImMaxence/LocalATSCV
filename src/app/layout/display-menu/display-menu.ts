import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { DISPLAY_OPTIONS, DisplayService, TEXT_SIZES } from '../../core/display/display.service';
import { Icon } from '../../shared/icon/icon';

/**
 * Panneau « Affichage et accessibilité » de l'en-tête : boutons radio et cases à cocher natifs,
 * dans le même calque (CDK Overlay) que le sélecteur de langue, déjà chargé sur chaque page.
 * Le bouton ne dépend d'aucun réglage : la page pré-rendue et la page hydratée restent
 * identiques ; seul le panneau, ouvert à la demande, lit les réglages enregistrés.
 */
@Component({
  selector: 'app-display-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon, CdkOverlayOrigin, CdkConnectedOverlay],
  template: `
    <ng-container *transloco="let t; prefix: 'display'">
      <button
        #trigger
        #origin="cdkOverlayOrigin"
        cdkOverlayOrigin
        type="button"
        class="grid size-8 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-ink/25 hover:text-ink aria-expanded:border-accent aria-expanded:text-accent"
        aria-haspopup="dialog"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="t('label')"
        [title]="t('label')"
        (click)="toggle()"
      >
        <app-icon class="size-4" name="access" [strokeWidth]="2" />
      </button>

      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayOpen]="open()"
        [cdkConnectedOverlayPositions]="positions"
        [cdkConnectedOverlayPush]="true"
        (attach)="focusPanel()"
        (detach)="open.set(false)"
        (overlayOutsideClick)="onOutsideClick($event)"
        (overlayKeydown)="onOverlayKeydown($event)"
      >
        <div
          #panel
          role="dialog"
          class="menu-in w-72 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-surface p-3 shadow-xl shadow-black/10"
          [attr.aria-label]="t('label')"
          (focusout)="onFocusOut($event)"
        >
          <fieldset>
            <legend class="mb-2 text-[11px] font-semibold tracking-wider text-muted uppercase">
              {{ t('textSize') }}
            </legend>
            <div class="grid grid-cols-3 gap-1.5">
              @for (size of sizes; track size) {
                <label
                  class="grid cursor-pointer place-items-center rounded-xl border border-line py-2 font-semibold transition-colors hover:bg-surface-2 has-checked:border-accent has-checked:bg-accent-soft has-checked:text-accent has-focus-visible:ring-2 has-focus-visible:ring-accent"
                  [title]="t('sizes.' + size)"
                >
                  <input
                    type="radio"
                    name="display-text-size"
                    class="sr-only"
                    [checked]="display.settings().textSize === size"
                    (change)="display.setTextSize(size)"
                  />
                  <span class="sr-only">{{ t('sizes.' + size) }}</span>
                  <span [class]="sizeClasses[size]" aria-hidden="true">A</span>
                </label>
              }
            </div>
          </fieldset>

          <div class="mt-3 space-y-0.5 border-t border-line pt-2">
            @for (option of options; track option) {
              <label
                class="flex cursor-pointer items-center gap-2.5 rounded-xl px-2 py-2 text-sm hover:bg-surface-2"
              >
                <input
                  type="checkbox"
                  class="size-4 shrink-0 accent-accent"
                  [checked]="display.has(option)"
                  (change)="display.toggle(option)"
                />
                {{ t('options.' + option) }}
              </label>
            }
          </div>

          <div class="mt-2 flex items-center justify-between gap-2 border-t border-line pt-2">
            <p class="text-xs text-muted">{{ t('note') }}</p>
            <button
              type="button"
              class="icon-btn"
              [disabled]="display.isDefault()"
              [attr.aria-label]="t('reset')"
              [title]="t('reset')"
              (click)="display.reset()"
            >
              <app-icon class="size-4" name="refresh" />
            </button>
          </div>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class DisplayMenu {
  protected readonly display = inject(DisplayService);
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly open = signal(false);
  protected readonly sizes = TEXT_SIZES;
  protected readonly options = DISPLAY_OPTIONS;
  protected readonly sizeClasses = { normal: 'text-sm', large: 'text-base', xlarge: 'text-lg' };

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  protected toggle(): void {
    if (this.open()) this.close();
    else this.open.set(true);
  }

  /** À l'ouverture, le focus va sur la taille de texte choisie. */
  protected focusPanel(): void {
    afterNextRender(
      () => this.panel()?.nativeElement.querySelector<HTMLInputElement>('input:checked')?.focus(),
      { injector: this.injector },
    );
  }

  protected onOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  /** Un clic sur le bouton est déjà géré par toggle() : sans ce garde, le panneau se rouvrirait. */
  protected onOutsideClick(event: MouseEvent): void {
    if (!this.trigger().nativeElement.contains(event.target as Node)) this.close(false);
  }

  /** Le panneau se ferme quand le focus le quitte (Tab après le dernier réglage). */
  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    if (next && !this.panel()?.nativeElement.contains(next)) this.close(false);
  }

  private close(restoreFocus = true): void {
    this.open.set(false);
    if (restoreFocus) this.trigger().nativeElement.focus();
  }
}
