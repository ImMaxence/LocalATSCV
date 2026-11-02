import { ChangeDetectionStrategy, Component, Injectable, inject, signal } from '@angular/core';
import { Icon } from '../icon/icon';

interface Toast {
  id: number;
  message: string;
  kind: 'success' | 'error';
}

const DURATION_MS = 4500;

/** Notifications éphémères (export terminé, import réussi…). */
@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  success(message: string): void {
    this.push(message, 'success');
  }

  error(message: string): void {
    this.push(message, 'error');
  }

  dismiss(id: number): void {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private push(message: string, kind: Toast['kind']): void {
    const id = this.nextId++;
    this.toasts.update((toasts) => [...toasts, { id, message, kind }]);
    setTimeout(() => this.dismiss(id), DURATION_MS);
  }
}

@Component({
  selector: 'app-toast-outlet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-4 z-[1100] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
    >
      @for (toast of service.toasts(); track toast.id) {
        <div
          class="toast-in pointer-events-auto flex max-w-md items-center gap-2.5 rounded-full bg-inverse py-2 ps-4 pe-2 text-sm font-medium text-inverse-ink shadow-xl"
          [attr.role]="toast.kind === 'error' ? 'alert' : 'status'"
        >
          <app-icon
            class="size-4"
            [class]="toast.kind === 'error' ? 'text-inverse-danger' : 'text-inverse-accent'"
            [name]="toast.kind === 'error' ? 'alert' : 'check'"
            [strokeWidth]="2.25"
          />
          <span>{{ toast.message }}</span>
          <button
            type="button"
            class="grid size-6 place-items-center rounded-full opacity-60 hover:opacity-100"
            aria-label="OK"
            (click)="service.dismiss(toast.id)"
          >
            <app-icon class="size-3.5" name="x" />
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastOutlet {
  protected readonly service = inject(ToastService);
}
