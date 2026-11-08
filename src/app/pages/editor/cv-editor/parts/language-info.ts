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
import { Icon } from '../../../../shared/icon/icon';

/** Bouton « i » de la barre d'outils : ce que la langue du CV change, et ce que fait le mode libre. */
@Component({
  selector: 'app-language-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon, CdkOverlayOrigin, CdkConnectedOverlay],
  template: `
    <ng-container *transloco="let t; prefix: 'editor.languageInfo'">
      <button
        #trigger
        #origin="cdkOverlayOrigin"
        cdkOverlayOrigin
        type="button"
        class="icon-btn rounded-full! aria-expanded:text-accent"
        aria-haspopup="dialog"
        [attr.aria-expanded]="open()"
        [attr.aria-label]="t('title')"
        [title]="t('title')"
        (click)="toggle()"
      >
        <app-icon class="size-4" name="info" />
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
          tabindex="-1"
          class="menu-in w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-line bg-surface p-4 text-sm leading-relaxed shadow-xl shadow-black/10 outline-none"
          [attr.aria-label]="t('title')"
        >
          <p class="font-semibold">{{ t('title') }}</p>
          <ul class="mt-2 space-y-2 text-muted">
            @for (key of points; track key) {
              <li>{{ t(key) }}</li>
            }
          </ul>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class LanguageInfo {
  private readonly injector = inject(Injector);
  private readonly trigger = viewChild.required<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly open = signal(false);
  protected readonly points = ['site', 'labels', 'rule', 'free'];
  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  protected toggle(): void {
    if (this.open()) this.close();
    else this.open.set(true);
  }

  protected focusPanel(): void {
    afterNextRender(() => this.panel()?.nativeElement.focus(), { injector: this.injector });
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

  private close(restoreFocus = true): void {
    this.open.set(false);
    if (restoreFocus) this.trigger().nativeElement.focus();
  }
}
