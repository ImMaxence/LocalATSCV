import { Dialog, DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { TranslocoDirective } from '@jsverse/transloco';

interface DialogData {
  title: string;
  message?: string;
  confirmLabel: string;
  danger?: boolean;
  /** Présent uniquement pour une saisie de texte. */
  input?: { label: string; value: string; placeholder?: string };
}

@Component({
  selector: 'app-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective],
  template: `
    <form
      *transloco="let t"
      class="w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-line bg-surface p-6 shadow-2xl"
      (submit)="$event.preventDefault(); submit()"
    >
      <h2 class="font-display text-xl font-semibold tracking-tight">{{ data.title }}</h2>
      @if (data.message) {
        <p class="mt-2 text-sm leading-relaxed text-muted">{{ data.message }}</p>
      }
      @if (data.input) {
        <label class="mt-4 block">
          <span class="field-label">{{ data.input.label }}</span>
          <input
            class="field-input"
            cdkFocusInitial
            [value]="value()"
            [placeholder]="data.input.placeholder ?? ''"
            (input)="value.set($any($event.target).value)"
          />
        </label>
      }
      <div class="mt-6 flex justify-end gap-2">
        <button type="button" class="btn btn-ghost" (click)="ref.close(undefined)">
          {{ t('dialog.cancel') }}
        </button>
        <button
          type="submit"
          class="btn"
          [class]="data.danger ? 'bg-danger text-white hover:opacity-90' : 'btn-primary'"
          [disabled]="data.input && !value().trim()"
        >
          {{ data.confirmLabel }}
        </button>
      </div>
    </form>
  `,
})
class AppDialog {
  protected readonly data = inject<DialogData>(DIALOG_DATA);
  protected readonly ref = inject<DialogRef<string | true | undefined>>(DialogRef);
  protected readonly value = signal(this.data.input?.value ?? '');

  protected submit(): void {
    if (this.data.input) {
      if (this.value().trim()) this.ref.close(this.value().trim());
    } else {
      this.ref.close(true);
    }
  }
}

/** Boîtes de dialogue de confirmation et de saisie (CDK Dialog : focus piégé, Échap pour fermer). */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly dialog = inject(Dialog);

  async confirm(options: Omit<DialogData, 'input'>): Promise<boolean> {
    return (await this.open(options)) === true;
  }

  async prompt(
    options: Omit<DialogData, 'input'> & { input: DialogData['input'] },
  ): Promise<string | null> {
    const result = await this.open(options);
    return typeof result === 'string' ? result : null;
  }

  private open(data: DialogData): Promise<string | true | undefined> {
    const ref = this.dialog.open<string | true | undefined, DialogData>(AppDialog, {
      data,
      backdropClass: ['cdk-overlay-dark-backdrop', 'backdrop-blur-[2px]'],
      panelClass: 'dialog-in',
    });
    return firstValueFrom(ref.closed);
  }
}
