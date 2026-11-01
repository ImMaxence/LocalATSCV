import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { linkIcon } from '../../../../cv/document/templates/cv-template-base';
import { hidesPersonalDetails } from '../../../../cv/model/resolve-cv';
import { Profile } from '../../../../cv/model/cv.model';
import { TextField } from '../../../../shared/form/text-field';
import { Icon } from '../../../../shared/icon/icon';
import { ToastService } from '../../../../shared/toast/toast';
import { CvEditorStore } from '../cv-editor.store';

@Component({
  selector: 'app-profile-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoDirective, TextField, Icon],
  template: `
    @if (store.cv(); as cv) {
      <section *transloco="let t; prefix: 'editor.profile'" class="panel">
        <header class="flex items-center gap-2 border-b border-line px-4 py-3">
          <span class="grid size-7 place-items-center rounded-lg bg-accent-soft text-accent">
            <app-icon class="size-4" name="user" />
          </span>
          <h2 class="font-semibold">{{ t('title') }}</h2>
        </header>

        <div class="grid gap-4 p-4 sm:grid-cols-2">
          <div class="flex items-center gap-4 sm:col-span-2" [class.opacity-50]="hidesDetails()">
            <div
              class="grid size-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-line bg-surface-2 text-muted"
            >
              @if (store.photoUrl(); as url) {
                <img [src]="url" alt="" class="size-full object-cover" />
              } @else {
                <app-icon class="size-7" name="image" />
              }
            </div>
            <div class="min-w-0">
              <p class="field-label mb-1.5!">
                {{ t('photo') }}
                @if (hidesDetails()) {
                  <span class="ml-1 rounded bg-surface-2 px-1.5 py-px text-[10px] font-semibold">
                    {{ t('hiddenInEnglish') }}
                  </span>
                }
              </p>
              <div class="flex flex-wrap gap-2">
                <label class="btn btn-ghost cursor-pointer px-3! py-1.5!">
                  @if (uploading()) {
                    <app-icon class="size-4 animate-spin" name="loader" />
                  } @else {
                    <app-icon class="size-4" name="upload" />
                  }
                  {{ cv.profile.photoId ? t('photoChange') : t('photoAdd') }}
                  <input type="file" accept="image/*" class="sr-only" (change)="onPhoto($event)" />
                </label>
                @if (cv.profile.photoId) {
                  <button
                    type="button"
                    class="btn btn-ghost px-3! py-1.5!"
                    (click)="store.removePhoto()"
                  >
                    <app-icon class="size-4" name="trash" />{{ t('photoRemove') }}
                  </button>
                }
              </div>
              <p class="mt-1.5 text-xs text-muted">{{ t('photoHint') }}</p>
            </div>
          </div>

          <app-text-field
            [label]="t('firstName')"
            autocomplete="given-name"
            [value]="cv.profile.firstName"
            (valueChange)="update({ firstName: $event })"
          />
          <app-text-field
            [label]="t('lastName')"
            autocomplete="family-name"
            [value]="cv.profile.lastName"
            (valueChange)="update({ lastName: $event })"
          />
          <app-text-field
            class="sm:col-span-2"
            [label]="t('headline')"
            [placeholder]="t('headlinePlaceholder')"
            [value]="cv.profile.title"
            (valueChange)="update({ title: $event })"
          />
          <app-text-field
            type="email"
            autocomplete="email"
            [label]="t('email')"
            [value]="cv.profile.email"
            (valueChange)="update({ email: $event })"
          />
          <app-text-field
            type="tel"
            autocomplete="tel"
            [label]="t('phone')"
            [value]="cv.profile.phone"
            (valueChange)="update({ phone: $event })"
          />
          <app-text-field
            class="sm:col-span-2"
            autocomplete="address-level2"
            [label]="t('location')"
            [value]="cv.profile.location"
            (valueChange)="update({ location: $event })"
          />
          <app-text-field
            type="date"
            [class.opacity-50]="hidesDetails()"
            [label]="t('birthDate')"
            [badge]="hidesDetails() ? t('hiddenInEnglish') : ''"
            [value]="cv.profile.birthDate"
            (valueChange)="update({ birthDate: $event })"
          />
          <app-text-field
            [class.opacity-50]="hidesDetails()"
            [label]="t('nationality')"
            [badge]="hidesDetails() ? t('hiddenInEnglish') : ''"
            [value]="cv.profile.nationality"
            (valueChange)="update({ nationality: $event })"
          />
          <app-text-field
            class="sm:col-span-2"
            [label]="t('drivingLicense')"
            [placeholder]="t('drivingLicensePlaceholder')"
            [value]="cv.profile.drivingLicense"
            (valueChange)="update({ drivingLicense: $event })"
          />
          <app-text-field
            class="sm:col-span-2"
            [multiline]="true"
            [label]="t('summary')"
            [placeholder]="t('summaryPlaceholder')"
            [value]="cv.profile.summary"
            (valueChange)="update({ summary: $event })"
          />

          <div class="sm:col-span-2">
            <p class="field-label">{{ t('links') }}</p>
            <ul class="space-y-1.5">
              @for (link of cv.profile.links; track link.id) {
                <li class="group flex items-center gap-1.5">
                  <app-icon class="mx-1 size-4 shrink-0 text-muted" [name]="linkIcon(link.url)" />
                  <input
                    class="field-input w-[34%] shrink-0"
                    [attr.aria-label]="t('linkLabel')"
                    [placeholder]="t('linkLabelPlaceholder')"
                    [value]="link.label"
                    (input)="store.updateLink(link.id, { label: $any($event.target).value })"
                  />
                  <input
                    class="field-input min-w-0 flex-1"
                    type="url"
                    [attr.aria-label]="t('linkUrl')"
                    [placeholder]="t('linkUrlPlaceholder')"
                    [value]="link.url"
                    (input)="store.updateLink(link.id, { url: $any($event.target).value })"
                  />
                  <button
                    type="button"
                    class="icon-btn aria-pressed:bg-accent-soft aria-pressed:text-accent"
                    [attr.aria-pressed]="cv.profile.qrLinkId === link.id"
                    [attr.aria-label]="t('qrToggle')"
                    [title]="t('qrToggle')"
                    (click)="update({ qrLinkId: cv.profile.qrLinkId === link.id ? null : link.id })"
                  >
                    <app-icon class="size-4" name="qr" />
                  </button>
                  <button
                    type="button"
                    class="icon-btn sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
                    [attr.aria-label]="t('removeLink')"
                    (click)="store.removeLink(link.id)"
                  >
                    <app-icon class="size-4" name="x" />
                  </button>
                </li>
              }
            </ul>
            <button type="button" class="add-btn mt-1.5" (click)="store.addLink()">
              <app-icon class="size-4" name="plus" />{{ t('addLink') }}
            </button>
            <p class="mt-1 text-xs text-muted">{{ t('linksHint') }}</p>
          </div>
        </div>
      </section>
    }
  `,
})
export class ProfilePanel {
  protected readonly store = inject(CvEditorStore);
  private readonly toast = inject(ToastService);
  private readonly transloco = inject(TranslocoService);

  protected readonly uploading = signal(false);
  protected readonly linkIcon = linkIcon;
  protected readonly hidesDetails = computed(() =>
    hidesPersonalDetails(this.store.cv()?.language ?? 'fr'),
  );

  protected update(patch: Partial<Profile>): void {
    this.store.updateProfile(patch);
  }

  protected async onPhoto(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploading.set(true);
    try {
      await this.store.setPhoto(file);
    } catch {
      this.toast.error(this.transloco.translate('editor.profile.photoError'));
    } finally {
      this.uploading.set(false);
    }
  }
}
