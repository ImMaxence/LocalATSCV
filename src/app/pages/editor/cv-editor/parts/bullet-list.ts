import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Entry } from '../../../../cv/model/cv.model';
import { Icon } from '../../../../shared/icon/icon';
import { CvEditorStore } from '../cv-editor.store';
import { IncludeToggle } from './editor-controls';

/** Puces d'une entrée : glisser-déposer, Entrée pour en créer une, Retour arrière pour supprimer une puce vide. */
@Component({
  selector: 'app-bullet-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon, IncludeToggle, CdkDropList, CdkDrag, CdkDragHandle],
  template: `
    <div *transloco="let t; prefix: 'editor'">
      <p class="field-label">{{ t('entry.bullets') }}</p>
      <ul cdkDropList class="space-y-1.5" (cdkDropListDropped)="move($event)">
        @for (bullet of entry().bullets; track bullet.id; let i = $index) {
          <li
            cdkDrag
            cdkDragLockAxis="y"
            class="group flex items-start gap-1.5 rounded-lg bg-surface"
            [class.opacity-45]="store.isHidden(bullet.id)"
          >
            <button
              cdkDragHandle
              type="button"
              class="drag-handle mt-1"
              [attr.aria-label]="t('actions.drag')"
            >
              <app-icon class="size-4" name="grip" />
            </button>
            <span class="mt-2.5 flex"><app-include-toggle [itemId]="bullet.id" /></span>
            <textarea
              rows="1"
              class="field-input field-auto min-h-9 flex-1 resize-none py-1.5 leading-snug"
              [attr.data-bullet]="bullet.id"
              [attr.aria-label]="t('entry.bullets') + ' ' + (i + 1)"
              [value]="bullet.text"
              [placeholder]="i === 0 ? t('entry.bulletPlaceholder') : ''"
              (input)="update(bullet.id, $event)"
              (keydown)="onKeydown($event, i, bullet.id, bullet.text)"
            ></textarea>
            <button
              type="button"
              class="icon-btn mt-0.5 sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
              [attr.aria-label]="t('actions.delete')"
              (click)="store.removeBullet(sectionId(), entry().id, bullet.id)"
            >
              <app-icon class="size-4" name="x" />
            </button>
          </li>
        }
      </ul>
      <div class="mt-2 flex flex-wrap items-center justify-between gap-2">
        <button type="button" class="add-btn" (click)="add()">
          <app-icon class="size-4" name="plus" />{{ t('entry.addBullet') }}
        </button>
        <span class="text-xs text-muted">{{ t('entry.bulletHint') }}</span>
      </div>
    </div>
  `,
})
export class BulletList {
  readonly sectionId = input.required<string>();
  readonly entry = input.required<Entry>();

  protected readonly store = inject(CvEditorStore);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  protected update(bulletId: string, event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value.replace(/\n/g, ' ');
    this.store.updateBullet(this.sectionId(), this.entry().id, bulletId, text);
  }

  protected move(event: CdkDragDrop<unknown>): void {
    this.store.moveBullet(
      this.sectionId(),
      this.entry().id,
      event.previousIndex,
      event.currentIndex,
    );
  }

  protected add(afterIndex?: number): void {
    this.focus(this.store.addBullet(this.sectionId(), this.entry().id, afterIndex));
  }

  protected onKeydown(event: KeyboardEvent, index: number, bulletId: string, text: string): void {
    if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.add(index);
    } else if (event.key === 'Backspace' && text === '' && this.entry().bullets.length > 1) {
      event.preventDefault();
      const previous = this.entry().bullets[Math.max(0, index - 1)];
      this.store.removeBullet(this.sectionId(), this.entry().id, bulletId);
      if (previous.id !== bulletId) this.focus(previous.id);
    }
  }

  private focus(bulletId: string): void {
    afterNextRender(
      () => {
        const field = this.host.nativeElement.querySelector<HTMLTextAreaElement>(
          `[data-bullet="${bulletId}"]`,
        );
        field?.focus();
        field?.setSelectionRange(field.value.length, field.value.length);
      },
      { injector: this.injector },
    );
  }
}
