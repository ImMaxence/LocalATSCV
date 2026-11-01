import { CdkDragHandle } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { Entry, EntryKind } from '../../../../cv/model/cv.model';
import { formatDateRange } from '../../../../cv/model/cv-labels';
import { MonthYearField } from '../../../../shared/form/month-year-field';
import { TextField } from '../../../../shared/form/text-field';
import { Icon } from '../../../../shared/icon/icon';
import { CvEditorStore } from '../cv-editor.store';
import { BulletList } from './bullet-list';
import { IncludeToggle, ItemMenu } from './editor-controls';

/** Une entrée datée (expérience, formation, projet…), repliable pour faciliter le tri. */
@Component({
  selector: 'app-entry-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoDirective,
    Icon,
    TextField,
    MonthYearField,
    BulletList,
    IncludeToggle,
    ItemMenu,
    CdkDragHandle,
  ],
  template: `
    <div
      *transloco="let t; prefix: 'editor'"
      class="rounded-xl border border-line bg-surface transition-opacity"
      [class.opacity-45]="store.isHidden(entry().id)"
    >
      <div class="flex items-center gap-1.5 px-2 py-1.5">
        <button
          cdkDragHandle
          type="button"
          class="drag-handle"
          [attr.aria-label]="t('actions.drag')"
        >
          <app-icon class="size-4" name="grip" />
        </button>
        <app-include-toggle [itemId]="entry().id" />
        <button
          type="button"
          class="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1.5 py-1 text-left hover:bg-surface-2"
          [attr.aria-expanded]="expanded()"
          (click)="expanded.set(!expanded())"
        >
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold">
              {{ entry().title || t('entry.untitled') }}
            </span>
            @if (summary()) {
              <span class="block truncate text-xs text-muted">{{ summary() }}</span>
            }
          </span>
          <app-icon
            class="size-4 text-muted transition-transform"
            name="chevronDown"
            [class.rotate-180]="expanded()"
          />
        </button>
        <app-item-menu
          [canMoveUp]="index() > 0"
          [canMoveDown]="!isLast()"
          [canDuplicate]="true"
          (moveUp)="store.moveItem(sectionId(), index(), index() - 1)"
          (moveDown)="store.moveItem(sectionId(), index(), index() + 1)"
          (duplicate)="store.duplicateItem(sectionId(), entry().id)"
          (remove)="store.removeItem(sectionId(), entry().id)"
        />
      </div>

      @if (expanded()) {
        <div class="grid gap-3 border-t border-line p-3 sm:grid-cols-2">
          <app-text-field
            [label]="t('entry.fields.' + kind() + '.title')"
            [value]="entry().title"
            (valueChange)="update({ title: $event })"
          />
          <app-text-field
            [label]="t('entry.fields.' + kind() + '.subtitle')"
            [value]="entry().subtitle"
            (valueChange)="update({ subtitle: $event })"
          />
          <app-text-field
            [label]="t('entry.location')"
            [value]="entry().location"
            (valueChange)="update({ location: $event })"
          />
          @if (hasUrl()) {
            <app-text-field
              type="url"
              [label]="t('entry.url')"
              [value]="entry().url"
              (valueChange)="update({ url: $event })"
            />
          }
          @if (kind() === 'certifications') {
            <app-month-year-field
              [label]="t('entry.date')"
              [value]="entry().start"
              (valueChange)="update({ start: $event })"
            />
          } @else {
            <div class="grid grid-cols-1 gap-3 min-[440px]:grid-cols-2 sm:col-span-2">
              <app-month-year-field
                [label]="t('entry.start')"
                [value]="entry().start"
                (valueChange)="update({ start: $event })"
              />
              <app-month-year-field
                [label]="t('entry.end')"
                [value]="entry().end"
                [disabled]="entry().current"
                (valueChange)="update({ end: $event })"
              />
            </div>
            <label class="flex items-center gap-2 text-sm sm:col-span-2">
              <input
                type="checkbox"
                class="size-4 accent-accent"
                [checked]="entry().current"
                (change)="update({ current: $any($event.target).checked })"
              />
              {{ t('entry.current') }}
            </label>
          }
          <app-bullet-list class="sm:col-span-2" [sectionId]="sectionId()" [entry]="entry()" />
        </div>
      }
    </div>
  `,
})
export class EntryEditor implements OnInit {
  readonly sectionId = input.required<string>();
  readonly kind = input.required<EntryKind>();
  readonly entry = input.required<Entry>();
  readonly index = input.required<number>();
  readonly isLast = input.required<boolean>();

  protected readonly store = inject(CvEditorStore);
  protected readonly expanded = signal(false);

  protected readonly hasUrl = computed(() =>
    ['projects', 'certifications', 'custom'].includes(this.kind()),
  );
  protected readonly summary = computed(() => {
    const entry = this.entry();
    const language = this.store.cv()?.language ?? 'fr';
    const dates = formatDateRange(entry.start, entry.end, entry.current, language);
    return [entry.subtitle, dates].filter(Boolean).join(' · ');
  });

  ngOnInit(): void {
    // Une entrée tout juste ajoutée s'ouvre directement.
    if (this.store.lastAddedId() === this.entry().id) this.expanded.set(true);
  }

  protected update(patch: Partial<Entry>): void {
    this.store.updateItem(this.sectionId(), this.entry().id, patch);
  }
}
