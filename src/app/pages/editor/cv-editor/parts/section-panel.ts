import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import {
  CvSection,
  Entry,
  EntryKind,
  Interest,
  SkillGroup,
  SpokenLanguage,
  isEntrySection,
} from '../../../../cv/model/cv.model';
import { CV_LABELS } from '../../../../cv/model/cv-labels';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { Icon } from '../../../../shared/icon/icon';
import { CvEditorStore } from '../cv-editor.store';
import { IncludeToggle, ItemMenu, SECTION_ICONS } from './editor-controls';
import { EntryEditor } from './entry-editor';

/** Une section du CV : titre, réordonnancement, et liste d'éléments selon son type. */
@Component({
  selector: 'app-section-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgTemplateOutlet,
    TranslocoDirective,
    Icon,
    IncludeToggle,
    ItemMenu,
    EntryEditor,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
  ],
  templateUrl: './section-panel.html',
})
export class SectionPanel {
  readonly section = input.required<CvSection>();
  readonly index = input.required<number>();
  readonly isLast = input.required<boolean>();

  protected readonly store = inject(CvEditorStore);
  private readonly dialog = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  protected readonly icon = computed(() => SECTION_ICONS[this.section().kind]);
  protected readonly defaultTitle = computed(
    () => CV_LABELS[this.store.cv()?.language ?? 'fr'].sections[this.section().kind],
  );

  protected entryKind(): EntryKind | null {
    const section = this.section();
    return isEntrySection(section) ? section.kind : null;
  }

  protected entries(): Entry[] {
    const section = this.section();
    return isEntrySection(section) ? section.items : [];
  }

  protected skills(): SkillGroup[] {
    const section = this.section();
    return section.kind === 'skills' ? section.items : [];
  }

  protected languages(): SpokenLanguage[] {
    const section = this.section();
    return section.kind === 'languages' ? section.items : [];
  }

  protected interests(): Interest[] {
    const section = this.section();
    return section.kind === 'interests' ? section.items : [];
  }

  protected moveItem(event: CdkDragDrop<unknown>): void {
    this.store.moveItem(this.section().id, event.previousIndex, event.currentIndex);
  }

  protected updateItem(itemId: string, field: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.updateItem(this.section().id, itemId, { [field]: value });
  }

  protected async remove(): Promise<void> {
    const section = this.section();
    const name =
      section.title.trim() || this.transloco.translate(`editor.sections.kinds.${section.kind}`);
    const hasContent = section.items.length > 0;
    const confirmed =
      !hasContent ||
      (await this.dialog.confirm({
        title: this.transloco.translate('editor.sections.deleteTitle', { name }),
        message: this.transloco.translate('editor.sections.deleteText'),
        confirmLabel: this.transloco.translate('dialog.delete'),
        danger: true,
      }));
    if (confirmed) this.store.removeSection(section.id);
  }
}
