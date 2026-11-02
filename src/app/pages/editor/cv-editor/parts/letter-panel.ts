import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { CoverLetter } from '../../../../cv/model/cv.model';
import { DISABILITY_LABELS } from '../../../../cv/model/disability';
import { LETTER_LABELS } from '../../../../cv/model/letter-labels';
import { TextField } from '../../../../shared/form/text-field';
import { Icon } from '../../../../shared/icon/icon';
import { CvEditorStore } from '../cv-editor.store';

/**
 * Lettre de motivation : imprimée avec le modèle et la couleur du CV. Les formules d'usage de la
 * langue du CV servent de valeurs par défaut ; une version ciblée peut avoir sa propre lettre.
 */
@Component({
  selector: 'app-letter-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, TextField, Icon],
  template: `
    @let letter = store.shownLetter();
    <section *transloco="let t; prefix: 'editor.letter'" class="panel">
      <header class="flex items-center gap-2 border-b border-line px-4 py-3">
        <span class="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent">
          <app-icon class="size-4" name="mail" />
        </span>
        <h2 class="font-semibold">{{ t('title') }}</h2>
      </header>

      @if (store.activeVersion()) {
        <div
          class="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line px-4 py-2.5 text-xs text-muted"
        >
          <app-icon class="size-3.5 text-accent" name="layers" />
          <span class="flex-1">
            {{ store.versionHasLetter() ? t('versionOwn') : t('versionShared') }}
          </span>
          @if (store.versionHasLetter()) {
            <button
              type="button"
              class="font-semibold text-accent hover:underline"
              (click)="store.useMasterLetter()"
            >
              {{ t('useMaster') }}
            </button>
          }
        </div>
      }

      <div class="grid gap-4 p-4 sm:grid-cols-2">
        <app-text-field
          class="sm:col-span-2"
          [label]="t('recipient')"
          [multiline]="true"
          [placeholder]="t('recipientPlaceholder')"
          [value]="letter.recipient"
          (valueChange)="update({ recipient: $event })"
        />
        <app-text-field
          [label]="t('place')"
          [value]="letter.place"
          (valueChange)="update({ place: $event })"
        />
        <div>
          <app-text-field
            type="date"
            [label]="t('date')"
            [value]="letter.date"
            (valueChange)="update({ date: $event })"
          />
          <p class="mt-1 text-xs text-muted">{{ t('dateHint') }}</p>
        </div>
        <app-text-field
          class="sm:col-span-2"
          [label]="t('subject')"
          [placeholder]="t('subjectPlaceholder')"
          [value]="letter.subject"
          (valueChange)="update({ subject: $event })"
        />
        <app-text-field
          class="sm:col-span-2"
          [label]="t('greeting')"
          [placeholder]="defaults().greeting"
          [value]="letter.greeting"
          (valueChange)="update({ greeting: $event })"
        />
        <div class="sm:col-span-2">
          <app-text-field
            class="[&_textarea]:min-h-64"
            [label]="t('body')"
            [multiline]="true"
            [placeholder]="t('bodyPlaceholder')"
            [value]="letter.body"
            (valueChange)="update({ body: $event })"
          />
          <div class="mt-1.5 flex flex-wrap items-start justify-between gap-2">
            <p class="text-xs text-muted">{{ t('bodyHint') }}</p>
            <div class="flex flex-wrap gap-2">
              @if (!letter.body.trim()) {
                <button
                  type="button"
                  class="btn btn-ghost px-3! py-1! text-xs"
                  (click)="update({ body: defaults().outline })"
                >
                  <app-icon class="size-3.5" name="wand" />{{ t('outline') }}
                </button>
              }
              <!-- Proposé dès qu'une mention de handicap est saisie dans le profil -->
              @if (canAddDisability()) {
                <button
                  type="button"
                  class="btn btn-ghost px-3! py-1! text-xs"
                  (click)="addDisabilitySentence()"
                >
                  <app-icon class="size-3.5" name="access" />{{ t('addDisability') }}
                </button>
              }
            </div>
          </div>
        </div>
        <app-text-field
          class="sm:col-span-2"
          [label]="t('closing')"
          [multiline]="true"
          [placeholder]="defaults().closing"
          [value]="letter.closing"
          (valueChange)="update({ closing: $event })"
        />
      </div>
    </section>
  `,
})
export class LetterPanel {
  protected readonly store = inject(CvEditorStore);

  /** Formules par défaut dans la langue du CV (affichées en indication). */
  protected readonly defaults = computed(() => LETTER_LABELS[this.store.cv()?.language ?? 'fr']);

  private readonly disabilitySentence = computed(
    () => DISABILITY_LABELS[this.store.cv()?.language ?? 'fr'].letterSentence,
  );
  protected readonly canAddDisability = computed(
    () =>
      !!this.store.cv()?.profile.disability.trim() &&
      !this.store.shownLetter().body.includes(this.disabilitySentence()),
  );

  protected update(patch: Partial<CoverLetter>): void {
    this.store.updateLetter(patch);
  }

  /** Ajoute la phrase toute prête en fin de lettre, modifiable ensuite comme le reste. */
  protected addDisabilitySentence(): void {
    const body = this.store.shownLetter().body.trimEnd();
    const sentence = this.disabilitySentence();
    this.update({ body: body ? `${body}\n\n${sentence}` : sentence });
  }
}
