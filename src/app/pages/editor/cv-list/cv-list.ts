import { Dialog } from '@angular/cdk/dialog';
import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { BackupError, parseBackup } from '../../../cv/data/backup';
import { CvRepository } from '../../../cv/data/cv-repository';
import { CvPreview } from '../../../cv/document/cv-preview';
import { CV_LANGUAGES, CvLanguage, MasterCv, createEmptyCv } from '../../../cv/model/cv.model';
import { resolveCv } from '../../../cv/model/resolve-cv';
import { createSampleCv } from '../../../cv/model/sample-cv';
import { LanguageService } from '../../../core/i18n/language.service';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { downloadFile, slugify, today } from '../../../shared/download';
import { Icon } from '../../../shared/icon/icon';
import { ToastService } from '../../../shared/toast/toast';
import { ImportDialog, ImportDialogData, ImportDialogResult } from './import-dialog';

/** « Mes CV » : liste des Master CV stockés dans ce navigateur, import et export des sauvegardes. */
@Component({
  selector: 'app-cv-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslocoDirective, Icon, CvPreview, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  templateUrl: './cv-list.html',
})
export class CvList {
  private readonly repository = inject(CvRepository);
  private readonly router = inject(Router);
  private readonly dialog = inject(DialogService);
  private readonly toast = inject(ToastService);
  private readonly transloco = inject(TranslocoService);
  private readonly language = inject(LanguageService);
  private readonly cdkDialog = inject(Dialog);

  protected readonly cvs = toSignal(this.repository.cvs$);
  protected readonly versionCounts = toSignal(this.repository.versionCounts$, {
    initialValue: {} as Record<string, number>,
  });
  protected readonly cards = computed(() =>
    (this.cvs() ?? []).map((cv) => ({ cv, resolved: resolveCv(cv, null) })),
  );

  private t(key: string, params?: Record<string, unknown>): string {
    return this.transloco.translate(`editor.list.${key}`, params);
  }

  protected formatDate(iso: string): string {
    return new Intl.DateTimeFormat(this.language.current(), {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  }

  /** Langue du nouveau CV : celle de l'interface si un CV peut l'utiliser, sinon l'anglais. */
  private uiAsCvLanguage(): CvLanguage {
    const lang = this.language.current();
    return CV_LANGUAGES.find((cvLanguage) => cvLanguage === lang) ?? 'en';
  }

  protected async createBlank(): Promise<void> {
    await this.createAndOpen(createEmptyCv(this.t('defaultName'), this.uiAsCvLanguage()));
  }

  protected openImport(mode: ImportDialogData['mode']): void {
    const ref = this.cdkDialog.open<ImportDialogResult, ImportDialogData>(ImportDialog, {
      data: { mode },
      backdropClass: ['cdk-overlay-dark-backdrop', 'backdrop-blur-[2px]'],
      panelClass: 'dialog-in',
    });
    ref.closed.subscribe((result) => {
      if (!result) return;
      this.toast.success(this.transloco.translate('import.done', { items: result.items }));
      void this.router.navigate(['/editor', result.id]);
    });
  }

  protected async createSample(): Promise<void> {
    await this.createAndOpen(createSampleCv(this.uiAsCvLanguage()));
  }

  private async createAndOpen(cv: MasterCv): Promise<void> {
    await this.repository.saveCv(cv);
    await this.router.navigate(['/editor', cv.id]);
  }

  protected async duplicate(cv: MasterCv): Promise<void> {
    await this.repository.duplicateCv(cv.id, `${cv.name} ${this.t('copySuffix')}`);
  }

  protected async remove(cv: MasterCv): Promise<void> {
    const confirmed = await this.dialog.confirm({
      title: this.t('deleteTitle', { name: cv.name }),
      message: this.t('deleteText'),
      confirmLabel: this.transloco.translate('dialog.delete'),
      danger: true,
    });
    if (confirmed) await this.repository.deleteCv(cv.id);
  }

  protected async exportAll(): Promise<void> {
    const backup = await this.repository.exportBackup();
    downloadFile(JSON.stringify(backup, null, 2), `localatscv-${today()}.json`);
    this.toast.success(this.t('exportDone'));
  }

  protected async exportOne(cv: MasterCv): Promise<void> {
    const backup = await this.repository.exportBackup([cv.id]);
    downloadFile(JSON.stringify(backup, null, 2), `localatscv-${slugify(cv.name)}-${today()}.json`);
    this.toast.success(this.t('exportDone'));
  }

  protected async import(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const backup = parseBackup(await file.text());
      const confirmed = await this.dialog.confirm({
        title: this.t('importConfirmTitle'),
        message: this.t('importConfirmText', { count: backup.cvs.length }),
        confirmLabel: this.transloco.translate('dialog.import'),
      });
      if (!confirmed) return;
      await this.repository.importBackup(backup);
      this.toast.success(this.t('importDone', { count: backup.cvs.length }));
    } catch (error) {
      const code = error instanceof BackupError ? error.code : 'notABackup';
      this.toast.error(this.t(`importError.${code}`));
    }
  }
}
