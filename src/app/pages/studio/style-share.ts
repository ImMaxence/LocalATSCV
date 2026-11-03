import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { CvRepository } from '../../cv/data/cv-repository';
import { CvStyle, StyleShareError, parseStyleShare, serializeStyle } from '../../cv/model/cv-style';
import { downloadFile, slugify } from '../../shared/download';
import { Icon } from '../../shared/icon/icon';
import { ToastService } from '../../shared/toast/toast';

/** `style` : partager ce style ; sans style : importer un style partagé. */
export interface StyleShareData {
  style?: CvStyle;
}

const MAX_FILE_SIZE = 1024 * 1024;

/**
 * Partage d'un style en code JSON (copier, télécharger) et import d'un style reçu (coller ou
 * fichier). Le code ne contient que le style : aucune donnée du CV ne s'y trouve.
 */
@Component({
  selector: 'app-style-share',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon],
  template: `
    <div
      *transloco="let t; prefix: 'studio.share'"
      class="flex max-h-[90dvh] w-[min(36rem,calc(100vw-2rem))] flex-col rounded-2xl border border-line bg-surface p-6 shadow-2xl"
    >
      <div class="flex items-start justify-between gap-4">
        <h2 class="font-display text-xl font-semibold tracking-tight">
          {{ data.style ? t('title') : t('importTitle') }}
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
      <p class="mt-2 text-sm text-muted">{{ data.style ? t('text') : t('importText') }}</p>

      @if (data.style) {
        <textarea
          class="field-input mt-4 min-h-64 flex-1 resize-none font-mono text-xs leading-relaxed"
          readonly
          spellcheck="false"
          [attr.aria-label]="t('title')"
          [value]="code()"
          (focus)="$any($event.target).select()"
        ></textarea>
        <div class="mt-4 flex flex-wrap justify-end gap-2">
          <button type="button" class="btn btn-ghost" (click)="download()">
            <app-icon class="size-4" name="download" />{{ t('download') }}
          </button>
          <button type="button" class="btn btn-primary" (click)="copy()">
            <app-icon class="size-4" [name]="copied() ? 'check' : 'copy'" />{{
              copied() ? t('copied') : t('copy')
            }}
          </button>
        </div>
      } @else {
        <textarea
          class="field-input mt-4 min-h-56 flex-1 resize-none font-mono text-xs leading-relaxed"
          spellcheck="false"
          [attr.aria-label]="t('importTitle')"
          [placeholder]="t('importPlaceholder')"
          [value]="pasted()"
          (input)="pasted.set($any($event.target).value); error.set(null)"
        ></textarea>
        @if (error(); as code) {
          <p class="mt-2 flex items-start gap-2 text-sm text-danger" role="alert">
            <app-icon class="mt-0.5 size-4 shrink-0" name="alert" />{{ t('error.' + code) }}
          </p>
        }
        <div class="mt-4 flex flex-wrap items-center justify-between gap-2">
          <label class="btn btn-ghost cursor-pointer">
            <app-icon class="size-4" name="upload" />{{ t('importFile') }}
            <input
              type="file"
              accept="application/json,.json"
              class="sr-only"
              (change)="onFile($event)"
            />
          </label>
          <button
            type="button"
            class="btn btn-primary disabled:opacity-60"
            [disabled]="!pasted().trim()"
            (click)="import(pasted())"
          >
            <app-icon class="size-4" name="import" />{{ t('importAction') }}
          </button>
        </div>
      }
    </div>
  `,
})
export class StyleShare {
  protected readonly data = inject<StyleShareData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<CvStyle>>(DialogRef);
  private readonly repository = inject(CvRepository);
  private readonly toast = inject(ToastService);
  private readonly transloco = inject(TranslocoService);

  protected readonly code = computed(() =>
    this.data.style ? serializeStyle(this.data.style) : '',
  );
  protected readonly copied = signal(false);
  protected readonly pasted = signal('');
  protected readonly error = signal<StyleShareError['code'] | null>(null);

  protected async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.code());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    } catch {
      // Presse-papiers refusé : le code reste sélectionnable dans la zone de texte.
      this.toast.error(this.transloco.translate('studio.share.copyError'));
    }
  }

  protected download(): void {
    const style = this.data.style;
    if (style) downloadFile(this.code(), `style-${slugify(style.name)}.json`);
  }

  protected async onFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) return this.error.set('notAStyle');
    const text = await file.text();
    this.pasted.set(text);
    await this.import(text);
  }

  /** Le style importé est enregistré sous un nouvel identifiant, puis ouvert par l'appelant. */
  protected async import(text: string): Promise<void> {
    try {
      const style = parseStyleShare(text);
      await this.repository.saveStyle(style);
      this.toast.success(this.transloco.translate('studio.share.imported', { name: style.name }));
      this.ref.close(style);
    } catch (error) {
      this.error.set(error instanceof StyleShareError ? error.code : 'notAStyle');
    }
  }
}
