import { CdkMenu, CdkMenuItem, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { findHealthMention } from '../../../../cv/analysis/inclusion';
import { SectionKind } from '../../../../cv/model/cv.model';
import { DISABILITY_LABELS } from '../../../../cv/model/disability';
import { Icon, IconName } from '../../../../shared/icon/icon';
import { CvEditorStore } from '../cv-editor.store';

export const SECTION_ICONS: Record<SectionKind, IconName> = {
  experience: 'briefcase',
  education: 'graduation',
  projects: 'folder',
  certifications: 'award',
  custom: 'list',
  skills: 'zap',
  languages: 'globe',
  interests: 'heart',
};

/** Case « inclure dans cette version », visible seulement quand une version ciblée est active. */
@Component({
  selector: 'app-include-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective],
  host: { class: 'contents' },
  template: `
    @if (store.activeVersion()) {
      <input
        *transloco="let t"
        type="checkbox"
        class="size-4 shrink-0 cursor-pointer accent-accent"
        [checked]="!store.isHidden(itemId())"
        [attr.aria-label]="t('editor.versions.include')"
        [title]="t('editor.versions.include')"
        (change)="store.toggleHidden(itemId())"
      />
    }
  `,
})
export class IncludeToggle {
  readonly itemId = input.required<string>();
  protected readonly store = inject(CvEditorStore);
}

/**
 * Menu d'actions d'un bloc. Monter/Descendre offrent une alternative clavier au glisser-déposer.
 */
@Component({
  selector: 'app-item-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, Icon, CdkMenuTrigger, CdkMenu, CdkMenuItem],
  template: `
    <ng-container *transloco="let t; prefix: 'editor.actions'">
      <button
        type="button"
        class="icon-btn"
        [cdkMenuTriggerFor]="menu"
        [attr.aria-label]="t('menu')"
        [title]="t('menu')"
      >
        <app-icon class="size-4" name="more" />
      </button>
      <ng-template #menu>
        <div cdkMenu class="menu-panel menu-in">
          @if (canMoveUp()) {
            <button
              cdkMenuItem
              type="button"
              class="menu-item"
              (cdkMenuItemTriggered)="moveUp.emit()"
            >
              <app-icon class="size-4 text-muted" name="arrowUp" />{{ t('moveUp') }}
            </button>
          }
          @if (canMoveDown()) {
            <button
              cdkMenuItem
              type="button"
              class="menu-item"
              (cdkMenuItemTriggered)="moveDown.emit()"
            >
              <app-icon class="size-4 text-muted" name="arrowDown" />{{ t('moveDown') }}
            </button>
          }
          @if (canDuplicate()) {
            <button
              cdkMenuItem
              type="button"
              class="menu-item"
              (cdkMenuItemTriggered)="duplicate.emit()"
            >
              <app-icon class="size-4 text-muted" name="copy" />{{ t('duplicate') }}
            </button>
          }
          <button
            cdkMenuItem
            type="button"
            class="menu-item text-danger!"
            (cdkMenuItemTriggered)="remove.emit()"
          >
            <app-icon class="size-4" name="trash" />{{ t('delete') }}
          </button>
        </div>
      </ng-template>
    </ng-container>
  `,
})
export class ItemMenu {
  readonly canMoveUp = input(false);
  readonly canMoveDown = input(false);
  readonly canDuplicate = input(false);

  readonly moveUp = output<void>();
  readonly moveDown = output<void>();
  readonly duplicate = output<void>();
  readonly remove = output<void>();
}

/**
 * Motif médical repéré dans un intitulé ou une puce (« Arrêt maladie ») : un CV n'a pas à le
 * donner. Un clic le remplace par un intitulé neutre dans la langue du CV.
 */
@Component({
  selector: 'app-health-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective],
  template: `
    @if (phrase(); as phrase) {
      <p *transloco="let t" class="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
        <span class="text-amber-700 dark:text-amber-300">{{
          t('editor.health.hint', { phrase })
        }}</span>
        <button
          type="button"
          class="rounded-full border border-line bg-surface px-2 py-0.5 font-medium hover:border-accent hover:text-accent"
          (click)="replaced.emit(replace(phrase))"
        >
          {{ neutral() }}
        </button>
      </p>
    }
  `,
})
export class HealthHint {
  readonly text = input.required<string>();
  /** Texte corrigé, à enregistrer à la place de l'original. */
  readonly replaced = output<string>();

  private readonly store = inject(CvEditorStore);
  protected readonly phrase = computed(() => findHealthMention(this.text()));
  protected readonly neutral = computed(
    () => DISABILITY_LABELS[this.store.cv()?.language ?? 'fr'].careerBreak,
  );

  protected replace(phrase: string): string {
    const text = this.text().normalize('NFC');
    const start = text.indexOf(phrase);
    if (start < 0) return text;
    // En milieu de phrase, l'intitulé perd sa majuscule (« après une pause professionnelle »).
    const neutral = this.neutral();
    const label = start > 0 ? neutral.charAt(0).toLowerCase() + neutral.slice(1) : neutral;
    return text.slice(0, start) + label + text.slice(start + phrase.length);
  }
}
