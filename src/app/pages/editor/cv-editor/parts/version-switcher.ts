import { CdkMenu, CdkMenuItem, CdkMenuItemRadio, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { Icon } from '../../../../shared/icon/icon';
import { CvEditorStore } from '../cv-editor.store';

/** Choix entre le Master CV complet et ses versions ciblées. */
@Component({
  selector: 'app-version-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon, CdkMenuTrigger, CdkMenu, CdkMenuItem, CdkMenuItemRadio],
  template: `
    <ng-container *transloco="let t; prefix: 'editor.versions'">
      <button
        type="button"
        class="flex h-9 max-w-64 items-center gap-2 rounded-full border border-line bg-surface ps-3 pe-2.5 text-sm font-medium transition-colors hover:border-ink/25 aria-expanded:border-ink/25"
        [cdkMenuTriggerFor]="menu"
        [attr.aria-label]="t('label')"
      >
        <app-icon class="size-4 shrink-0 text-accent" name="layers" />
        <span class="truncate">{{ store.activeVersion()?.name ?? t('master') }}</span>
        <app-icon class="size-3.5 shrink-0 text-muted" name="chevronDown" [strokeWidth]="2" />
      </button>

      <ng-template #menu>
        <div cdkMenu class="menu-panel menu-in w-72">
          <p
            class="px-2.5 pt-1.5 pb-2 text-[11px] font-semibold tracking-wider text-muted uppercase"
          >
            {{ t('label') }}
          </p>
          <button
            cdkMenuItemRadio
            type="button"
            class="menu-item"
            [cdkMenuItemChecked]="!store.activeVersionId()"
            (cdkMenuItemTriggered)="select.emit(null)"
          >
            <span class="min-w-0 flex-1">
              <span class="block font-semibold">{{ t('master') }}</span>
              <span class="block text-xs text-muted">{{ t('masterHint') }}</span>
            </span>
            @if (!store.activeVersionId()) {
              <app-icon class="size-4 text-accent" name="check" [strokeWidth]="2.5" />
            }
          </button>
          @for (version of store.versions(); track version.id) {
            <button
              cdkMenuItemRadio
              type="button"
              class="menu-item"
              [cdkMenuItemChecked]="store.activeVersionId() === version.id"
              (cdkMenuItemTriggered)="select.emit(version.id)"
            >
              <span class="min-w-0 flex-1 truncate">{{ version.name }}</span>
              @if (store.activeVersionId() === version.id) {
                <app-icon class="size-4 text-accent" name="check" [strokeWidth]="2.5" />
              }
            </button>
          }
          <div class="my-1.5 border-t border-line"></div>
          <button
            cdkMenuItem
            type="button"
            class="menu-item text-accent!"
            (cdkMenuItemTriggered)="create()"
          >
            <app-icon class="size-4" name="plus" />{{ t('new') }}
          </button>
          @if (store.activeVersion(); as version) {
            <button cdkMenuItem type="button" class="menu-item" (cdkMenuItemTriggered)="rename()">
              <app-icon class="size-4 text-muted" name="pencil" />{{ t('rename') }}
            </button>
            <button
              cdkMenuItem
              type="button"
              class="menu-item text-danger!"
              (cdkMenuItemTriggered)="remove()"
            >
              <app-icon class="size-4" name="trash" />{{ t('delete') }}
            </button>
          }
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class VersionSwitcher {
  /** L'éditeur reflète la version choisie dans l'URL. */
  readonly select = output<string | null>();

  protected readonly store = inject(CvEditorStore);
  private readonly dialog = inject(DialogService);
  private readonly transloco = inject(TranslocoService);

  private t(key: string, params?: Record<string, string>): string {
    return this.transloco.translate(`editor.versions.${key}`, params);
  }

  protected async create(): Promise<void> {
    const name = await this.dialog.prompt({
      title: this.t('new'),
      message: this.t('newText'),
      confirmLabel: this.transloco.translate('dialog.create'),
      input: { label: this.t('nameLabel'), value: '', placeholder: this.t('namePlaceholder') },
    });
    if (!name) return;
    await this.store.createVersion(name);
    this.select.emit(this.store.activeVersionId());
  }

  protected async rename(): Promise<void> {
    const version = this.store.activeVersion();
    if (!version) return;
    const name = await this.dialog.prompt({
      title: this.t('rename'),
      confirmLabel: this.transloco.translate('dialog.save'),
      input: { label: this.t('nameLabel'), value: version.name },
    });
    if (name) await this.store.renameVersion(version.id, name);
  }

  protected async remove(): Promise<void> {
    const version = this.store.activeVersion();
    if (!version) return;
    const confirmed = await this.dialog.confirm({
      title: this.t('deleteTitle', { name: version.name }),
      message: this.t('deleteText'),
      confirmLabel: this.transloco.translate('dialog.delete'),
      danger: true,
    });
    if (!confirmed) return;
    await this.store.deleteVersion(version.id);
    this.select.emit(null);
  }
}
