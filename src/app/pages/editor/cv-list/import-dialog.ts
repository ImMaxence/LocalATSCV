import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { PdfReadError, extractPdfText } from '../../../cv/analysis/pdf-text';
import { CvRepository } from '../../../cv/data/cv-repository';
import { importCv } from '../../../cv/import/cv-import';
import { Icon } from '../../../shared/icon/icon';

export interface ImportDialogData {
  mode: 'pdf' | 'linkedin';
}

export interface ImportDialogResult {
  id: string;
  items: number;
}

const MAX_SIZE = 15 * 1024 * 1024;
const DOCX_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const MAX_ARCHIVE_SIZE = 60 * 1024 * 1024;

/** Import d'un CV existant (PDF ou Word) ou d'un profil LinkedIn (PDF ou archive ZIP) dans l'éditeur. */
@Component({
  selector: 'app-import-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  template: `
    <div
      *transloco="let t; prefix: 'import'"
      class="w-[min(32rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-6 shadow-2xl"
    >
      <div class="flex items-start justify-between gap-4">
        <h2 class="font-display text-xl font-semibold tracking-tight">
          {{ data.mode === 'linkedin' ? t('linkedinTitle') : t('title') }}
        </h2>
        <button
          type="button"
          class="icon-btn -mt-1"
          [attr.aria-label]="t('close')"
          (click)="ref.close()"
        >
          <app-icon class="size-4" name="x" />
        </button>
      </div>

      @if (data.mode === 'linkedin') {
        <div class="mt-4 space-y-3">
          @for (method of linkedinMethods; track method.key) {
            <section class="rounded-xl border border-line p-3.5">
              <h3 class="flex items-center gap-2 text-sm font-semibold">
                <app-icon class="size-4 text-accent" [name]="method.icon" />
                {{ t('linkedin.' + method.key + '.title') }}
              </h3>
              <ol class="mt-2.5 space-y-1.5 text-sm text-muted">
                @for (step of method.steps; track step; let i = $index) {
                  <li class="flex gap-2.5">
                    <span
                      class="grid size-5 shrink-0 place-items-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent"
                      >{{ i + 1 }}</span
                    >
                    <span>{{ t('linkedin.' + method.key + '.' + step) }}</span>
                  </li>
                }
              </ol>
            </section>
          }
        </div>
      } @else {
        <p class="mt-3 text-sm text-muted">{{ t('text') }}</p>
      }

      <label
        class="mt-5 flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center transition-colors hover:border-accent/60"
        [class.pointer-events-none]="reading()"
      >
        @if (reading()) {
          <app-icon class="size-7 animate-spin text-accent" name="loader" />
          <span class="mt-3 text-sm font-semibold">{{ t('reading') }}</span>
        } @else {
          <app-icon class="size-7 text-accent" name="upload" />
          <span class="btn btn-primary mt-4">
            {{ data.mode === 'linkedin' ? t('chooseFile') : t('choose') }}
          </span>
          <span class="mt-2 text-xs text-muted">
            {{ data.mode === 'linkedin' ? t('hintArchive') : t('hint') }}
          </span>
        }
        <input type="file" [accept]="accept" class="sr-only" (change)="onFile($event)" />
      </label>

      @if (error(); as code) {
        <p
          class="mt-4 flex items-center gap-2 rounded-xl bg-danger/10 p-3 text-sm text-danger"
          role="alert"
        >
          <app-icon class="size-4 shrink-0" name="alert" />{{ t('errors.' + code) }}
        </p>
      }
      <p class="mt-4 flex items-center gap-2 text-xs text-muted">
        <app-icon class="size-3.5 text-accent" name="lock" />{{ t('privacy') }}
      </p>
    </div>
  `,
})
export class ImportDialog {
  protected readonly data = inject<ImportDialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<ImportDialogResult>>(DialogRef);
  private readonly repository = inject(CvRepository);

  protected readonly accept = `application/pdf,.pdf,application/zip,.zip,${DOCX_TYPE},.docx`;
  protected readonly reading = signal(false);
  protected readonly error = signal<string | null>(null);

  /** Le PDF n'existe que sur ordinateur ; l'archive de données se demande aussi depuis l'appli mobile. */
  protected readonly linkedinMethods = [
    { key: 'computer', icon: 'monitor', steps: ['step1', 'step2', 'step3'] },
    { key: 'archive', icon: 'device', steps: ['step1', 'step2', 'step3', 'step4'] },
  ] as const;

  protected async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.error.set(null);
    const name = file.name.toLowerCase();
    const isDocx = name.endsWith('.docx') || file.type === DOCX_TYPE;
    const isZip = !isDocx && (name.endsWith('.zip') || file.type.includes('zip'));
    const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
    if (!isZip && !isPdf && !isDocx) {
      this.error.set('unsupported');
      return;
    }
    if (file.size > (isZip ? MAX_ARCHIVE_SIZE : MAX_SIZE)) {
      this.error.set('tooLarge');
      return;
    }
    this.reading.set(true);
    try {
      const fallbackName = file.name.replace(/\.(pdf|zip|docx)$/i, '');
      const { cv, items } = isZip
        ? await this.importArchive(file, fallbackName)
        : isDocx
          ? await this.importWord(file, fallbackName)
          : importCv(await extractPdfText(await file.arrayBuffer()), fallbackName);
      if (!items && !cv.profile.firstName) {
        this.error.set(isZip ? 'archiveEmpty' : 'empty');
        return;
      }
      await this.repository.saveCv(cv);
      this.ref.close({ id: cv.id, items });
    } catch (error) {
      this.error.set(error instanceof PdfReadError ? error.code : 'unreadable');
    } finally {
      this.reading.set(false);
    }
  }

  /** Lecture d'un document Word (.docx), chargée seulement si besoin. */
  private async importWord(file: File, fallbackName: string) {
    const { importDocx } = await import('../../../cv/import/docx');
    return importDocx(new Uint8Array(await file.arrayBuffer()), fallbackName);
  }

  /** Lecture de l'archive LinkedIn, chargée seulement si besoin. */
  private async importArchive(file: File, fallbackName: string) {
    const { importLinkedInArchive } = await import('../../../cv/import/linkedin-archive');
    return importLinkedInArchive(new Uint8Array(await file.arrayBuffer()), fallbackName);
  }
}
