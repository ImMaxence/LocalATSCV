import { moveItemInArray } from '@angular/cdk/drag-drop';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { CvRepository } from '../../../cv/data/cv-repository';
import { prepareProfilePhoto } from '../../../cv/data/photo';
import {
  CvLanguage,
  CvSection,
  CvVersion,
  Entry,
  MasterCv,
  Profile,
  ProfileLink,
  SectionItem,
  SectionKind,
  createBullet,
  createItem,
  createSection,
  createVersion,
  newId,
} from '../../../cv/model/cv.model';
import { resolveCv } from '../../../cv/model/resolve-cv';

const SAVE_DELAY_MS = 400;

type SaveState = 'saved' | 'saving' | 'error';

/**
 * État de l'éditeur d'un CV. Chaque modification produit une nouvelle copie du CV
 * (les signaux restent simples à suivre) et déclenche un enregistrement différé dans IndexedDB.
 * Le contenu est toujours modifié dans le Master ; une version ne fait que masquer des éléments.
 */
@Injectable()
export class CvEditorStore {
  private readonly repository = inject(CvRepository);

  readonly status = signal<'loading' | 'ready' | 'notFound'>('loading');
  readonly cv = signal<MasterCv | null>(null);
  readonly versions = signal<CvVersion[]>([]);
  readonly activeVersionId = signal<string | null>(null);
  readonly saveState = signal<SaveState>('saved');
  readonly photoUrl = signal<string | null>(null);
  /** Dernier élément ajouté : l'interface l'ouvre et place le curseur dedans. */
  readonly lastAddedId = signal<string | null>(null);

  readonly activeVersion = computed(
    () => this.versions().find((version) => version.id === this.activeVersionId()) ?? null,
  );
  private readonly hiddenIds = computed(() => new Set(this.activeVersion()?.hiddenIds ?? []));
  readonly resolved = computed(() => {
    const cv = this.cv();
    return cv ? resolveCv(cv, this.activeVersion()) : null;
  });

  private saveTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    const onPageHide = () => void this.flush();
    addEventListener('pagehide', onPageHide);
    inject(DestroyRef).onDestroy(() => {
      removeEventListener('pagehide', onPageHide);
      void this.flush();
      this.revokePhotoUrl();
    });
  }

  async load(id: string): Promise<void> {
    const cv = await this.repository.getCv(id);
    if (!cv) {
      this.status.set('notFound');
      return;
    }
    this.cv.set(cv);
    this.versions.set(await this.repository.getVersions(id));
    await this.refreshPhoto();
    this.status.set('ready');
  }

  // --- Enregistrement ---

  private mutate(change: (draft: MasterCv) => void): void {
    const current = this.cv();
    if (!current) return;
    const draft = structuredClone(current);
    change(draft);
    draft.updatedAt = new Date().toISOString();
    this.cv.set(draft);
    this.saveState.set('saving');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.flush(), SAVE_DELAY_MS);
  }

  async flush(): Promise<void> {
    if (this.saveTimer === undefined) return;
    clearTimeout(this.saveTimer);
    this.saveTimer = undefined;
    const cv = this.cv();
    if (!cv) return;
    try {
      await this.repository.saveCv(cv);
      if (this.saveTimer === undefined) this.saveState.set('saved');
    } catch {
      this.saveState.set('error');
    }
  }

  // --- Réglages du CV ---

  rename(name: string): void {
    this.mutate((cv) => (cv.name = name));
  }

  setLanguage(language: CvLanguage): void {
    this.mutate((cv) => (cv.language = language));
  }

  setAccent(color: string): void {
    this.mutate((cv) => (cv.accentColor = color));
  }

  // --- Profil ---

  updateProfile(patch: Partial<Profile>): void {
    this.mutate((cv) => Object.assign(cv.profile, patch));
  }

  async setPhoto(file: File): Promise<void> {
    const blob = await prepareProfilePhoto(file);
    const previous = this.cv()?.profile.photoId;
    const photoId = await this.repository.savePhoto(blob);
    this.updateProfile({ photoId });
    await this.flush();
    if (previous) await this.repository.deletePhoto(previous);
    await this.refreshPhoto();
  }

  async removePhoto(): Promise<void> {
    const photoId = this.cv()?.profile.photoId;
    if (!photoId) return;
    this.updateProfile({ photoId: null });
    await this.flush();
    await this.repository.deletePhoto(photoId);
    await this.refreshPhoto();
  }

  private async refreshPhoto(): Promise<void> {
    this.revokePhotoUrl();
    const photoId = this.cv()?.profile.photoId;
    const blob = photoId ? await this.repository.getPhoto(photoId) : undefined;
    this.photoUrl.set(blob ? URL.createObjectURL(blob) : null);
  }

  private revokePhotoUrl(): void {
    const url = this.photoUrl();
    if (url) URL.revokeObjectURL(url);
  }

  addLink(): void {
    const id = newId();
    this.mutate((cv) => cv.profile.links.push({ id, label: '', url: '' }));
    this.lastAddedId.set(id);
  }

  updateLink(id: string, patch: Partial<ProfileLink>): void {
    this.mutate((cv) =>
      Object.assign(cv.profile.links.find((link) => link.id === id) ?? {}, patch),
    );
  }

  removeLink(id: string): void {
    this.mutate((cv) => (cv.profile.links = cv.profile.links.filter((link) => link.id !== id)));
  }

  // --- Sections ---

  addSection(kind: SectionKind): void {
    const section = createSection(kind);
    section.items.push(createItem(kind) as never);
    this.mutate((cv) => cv.sections.push(section));
    this.lastAddedId.set(section.items[0].id);
  }

  removeSection(sectionId: string): void {
    this.mutate((cv) => (cv.sections = cv.sections.filter((section) => section.id !== sectionId)));
  }

  moveSection(from: number, to: number): void {
    if (from !== to) this.mutate((cv) => moveItemInArray(cv.sections, from, to));
  }

  renameSection(sectionId: string, title: string): void {
    this.withSection(sectionId, (section) => (section.title = title));
  }

  // --- Éléments d'une section ---

  addItem(sectionId: string): void {
    const kind = this.cv()?.sections.find((section) => section.id === sectionId)?.kind;
    if (!kind) return;
    const item = createItem(kind);
    this.withSection(sectionId, (section) => (section.items as SectionItem[]).push(item));
    this.lastAddedId.set(item.id);
  }

  updateItem(
    sectionId: string,
    itemId: string,
    patch: Partial<Entry> | Record<string, string>,
  ): void {
    this.withItem(sectionId, itemId, (item) => Object.assign(item, patch));
  }

  removeItem(sectionId: string, itemId: string): void {
    this.withSection(sectionId, (section) => {
      section.items = (section.items as SectionItem[]).filter(
        (item) => item.id !== itemId,
      ) as never;
    });
  }

  moveItem(sectionId: string, from: number, to: number): void {
    if (from !== to)
      this.withSection(sectionId, (section) =>
        moveItemInArray(section.items as SectionItem[], from, to),
      );
  }

  duplicateItem(sectionId: string, itemId: string): void {
    this.withSection(sectionId, (section) => {
      const items = section.items as SectionItem[];
      const index = items.findIndex((item) => item.id === itemId);
      if (index < 0) return;
      const copy = { ...structuredClone(items[index]), id: newId() };
      if ('bullets' in copy)
        copy.bullets = copy.bullets.map((bullet) => ({ ...bullet, id: newId() }));
      items.splice(index + 1, 0, copy);
    });
  }

  // --- Puces ---

  /** Ajoute une puce (après `afterIndex`, sinon à la fin) et renvoie son identifiant. */
  addBullet(sectionId: string, entryId: string, afterIndex?: number): string {
    const bullet = createBullet();
    this.withEntry(sectionId, entryId, (entry) =>
      entry.bullets.splice(
        afterIndex === undefined ? entry.bullets.length : afterIndex + 1,
        0,
        bullet,
      ),
    );
    this.lastAddedId.set(bullet.id);
    return bullet.id;
  }

  updateBullet(sectionId: string, entryId: string, bulletId: string, text: string): void {
    this.withEntry(sectionId, entryId, (entry) => {
      const bullet = entry.bullets.find((b) => b.id === bulletId);
      if (bullet) bullet.text = text;
    });
  }

  removeBullet(sectionId: string, entryId: string, bulletId: string): void {
    this.withEntry(sectionId, entryId, (entry) => {
      entry.bullets = entry.bullets.filter((bullet) => bullet.id !== bulletId);
    });
  }

  moveBullet(sectionId: string, entryId: string, from: number, to: number): void {
    if (from !== to)
      this.withEntry(sectionId, entryId, (entry) => moveItemInArray(entry.bullets, from, to));
  }

  private withSection(sectionId: string, change: (section: CvSection) => void): void {
    this.mutate((cv) => {
      const section = cv.sections.find((s) => s.id === sectionId);
      if (section) change(section);
    });
  }

  private withItem(sectionId: string, itemId: string, change: (item: SectionItem) => void): void {
    this.withSection(sectionId, (section) => {
      const item = (section.items as SectionItem[]).find((i) => i.id === itemId);
      if (item) change(item);
    });
  }

  private withEntry(sectionId: string, entryId: string, change: (entry: Entry) => void): void {
    this.withItem(sectionId, entryId, (item) => {
      if ('bullets' in item) change(item);
    });
  }

  // --- Versions ciblées ---

  async createVersion(name: string): Promise<void> {
    const cv = this.cv();
    if (!cv) return;
    const version = createVersion(cv.id, name);
    await this.repository.saveVersion(version);
    this.versions.update((versions) => [...versions, version]);
    this.activeVersionId.set(version.id);
  }

  async renameVersion(id: string, name: string): Promise<void> {
    await this.updateVersion(id, (version) => (version.name = name));
  }

  async deleteVersion(id: string): Promise<void> {
    await this.repository.deleteVersion(id);
    this.versions.update((versions) => versions.filter((version) => version.id !== id));
    if (this.activeVersionId() === id) this.activeVersionId.set(null);
  }

  isHidden(id: string): boolean {
    return this.hiddenIds().has(id);
  }

  toggleHidden(id: string): void {
    const version = this.activeVersion();
    if (!version) return;
    void this.updateVersion(version.id, (draft) => {
      draft.hiddenIds = draft.hiddenIds.includes(id)
        ? draft.hiddenIds.filter((hiddenId) => hiddenId !== id)
        : [...draft.hiddenIds, id];
    });
  }

  private async updateVersion(id: string, change: (version: CvVersion) => void): Promise<void> {
    const current = this.versions().find((version) => version.id === id);
    if (!current) return;
    const draft = structuredClone(current);
    change(draft);
    draft.updatedAt = new Date().toISOString();
    this.versions.update((versions) =>
      versions.map((version) => (version.id === id ? draft : version)),
    );
    await this.repository.saveVersion(draft);
  }
}
