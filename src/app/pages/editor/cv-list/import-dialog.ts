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

/** Import d'un CV PDF existant (ou du PDF de profil LinkedIn) dans l'éditeur. */
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
        <ol class="mt-4 space-y-2.5 text-sm">
          @for (step of ['step1', 'step2', 'step3']; track step; let i = $index) {
            <li class="flex gap-3">
              <span
                class="grid size-6 shrink-0 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
                >{{ i + 1 }}</span
              >
              <span class="pt-0.5">{{ t('linkedinSteps.' + step) }}</span>
            </li>
          }
        </ol>
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
          <span class="btn btn-primary mt-4">{{ t('choose') }}</span>
          <span class="mt-2 text-xs text-muted">{{ t('hint') }}</span>
        }
        <input
          type="file"
          accept="application/pdf,.pdf"
          class="sr-only"
          (change)="onFile($event)"
        />
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

  protected readonly reading = signal(false);
  protected readonly error = signal<string | null>(null);

  protected async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.error.set(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      this.error.set('notPdf');
      return;
    }
    if (file.size > MAX_SIZE) {
      this.error.set('tooLarge');
      return;
    }
    this.reading.set(true);
    try {
      const pdf = await extractPdfText(await file.arrayBuffer());
      const { cv, items } = importCv(pdf, file.name.replace(/\.pdf$/i, ''));
      if (!items && !cv.profile.firstName) {
        this.error.set('empty');
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
}
