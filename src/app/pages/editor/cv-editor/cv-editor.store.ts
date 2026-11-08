import { moveItemInArray } from '@angular/cdk/drag-drop';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { readSetting, writeSetting } from '../../../core/storage/local-settings';
import { CvRepository } from '../../../cv/data/cv-repository';
import { prepareProfilePhoto } from '../../../cv/data/photo';
import {
  CoverLetter,
  CvLanguage,
  CvLayout,
  CvSection,
  CvTemplateId,
  CvVersion,
  DateStyle,
  Entry,
  MasterCv,
  Profile,
  ProfileLink,
  SectionItem,
  SectionKind,
  SkillGroup,
  DEFAULT_LAYOUT,
  createBullet,
  createLetter,
  createItem,
  createSection,
  createVersion,
  newId,
} from '../../../cv/model/cv.model';
import { AvatarIcon } from '../../../cv/model/avatar';
import { CvStyle } from '../../../cv/model/cv-style';
import { resolveCv } from '../../../cv/model/resolve-cv';
import { CvFontId } from '../../../cv/model/cv-fonts';
import { extractKeywords, hiddenIdsForJob, matchCv } from '../../../cv/analysis/job-match';

const SAVE_DELAY_MS = 400;
/** Modifications rapprochées (frappe continue) regroupées en une seule étape d'annulation. */
const HISTORY_GROUP_MS = 1000;
const HISTORY_LIMIT = 100;
const COLLAPSED_SETTING = 'editor.collapsedSections';

type SaveState = 'saved' | 'saving' | 'error';

/** État restauré par Annuler / Rétablir : le Master et la version alors affichée. */
interface Snapshot {
  cv: MasterCv;
  version: CvVersion | null;
}

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
  /** Document édité et affiché : le CV ou la lettre de motivation. */
  readonly mode = signal<'cv' | 'letter'>('cv');
  /** Aperçu en niveaux de gris, pour juger d'une impression en noir et blanc (le PDF garde ses couleurs). */
  readonly grayscale = signal(false);
  /** Sections repliées : confort d'affichage de cet appareil, hors du CV et de l'historique. */
  readonly collapsedSections = signal<ReadonlySet<string>>(
    new Set(readSetting(COLLAPSED_SETTING)?.split(',').filter(Boolean)),
  );

  private readonly past = signal<Snapshot[]>([]);
  private readonly future = signal<Snapshot[]>([]);
  private lastRecordAt = 0;
  private lastGroup: string | null = null;
  readonly canUndo = computed(() => this.past().length > 0);
  readonly canRedo = computed(() => this.future().length > 0);

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
    this.past.set([]);
    this.future.set([]);
    await this.refreshPhoto();
    this.status.set('ready');
  }

  // --- Enregistrement ---

  /**
   * `group` : modifications consécutives de même nature (changements de modèle à la suite, par
   * exemple) regroupées en une seule étape d'annulation, quel que soit leur écart dans le temps.
   */
  private mutate(
    change: (draft: MasterCv) => void,
    record = true,
    group: string | null = null,
  ): void {
    const current = this.cv();
    if (!current) return;
    if (record) this.record(group);
    const draft = structuredClone(current);
    change(draft);
    this.schedule(draft);
  }

  private schedule(cv: MasterCv): void {
    cv.updatedAt = new Date().toISOString();
    this.cv.set(cv);
    this.saveState.set('saving');
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => void this.flush(), SAVE_DELAY_MS);
  }

  // --- Annuler / Rétablir ---

  /** Mémorise l'état avant une modification ; une frappe continue ne crée qu'une étape. */
  private record(group: string | null): void {
    const now = Date.now();
    const sameGroup = group !== null && group === this.lastGroup;
    if (!sameGroup && now - this.lastRecordAt > HISTORY_GROUP_MS && this.cv()) {
      this.past.update((past) => [...past.slice(1 - HISTORY_LIMIT), this.snapshot()]);
      this.future.set([]);
    }
    this.lastRecordAt = now;
    this.lastGroup = group;
  }

  undo(): void {
    const previous = this.past().at(-1);
    if (!previous) return;
    this.future.update((future) => [...future, this.snapshot(previous.version?.id ?? null)]);
    this.past.update((past) => past.slice(0, -1));
    this.restore(previous);
  }

  redo(): void {
    const next = this.future().at(-1);
    if (!next) return;
    this.past.update((past) => [...past, this.snapshot(next.version?.id ?? null)]);
    this.future.update((future) => future.slice(0, -1));
    this.restore(next);
  }

  private snapshot(versionId = this.activeVersionId()): Snapshot {
    const version = this.versions().find((v) => v.id === versionId) ?? null;
    return {
      cv: structuredClone(this.cv() as MasterCv),
      version: version ? structuredClone(version) : null,
    };
  }

  private restore(snapshot: Snapshot): void {
    const current = this.cv();
    if (!current) return;
    this.lastRecordAt = 0;
    this.lastGroup = null;
    // La photo n'est pas rejouée : l'image remplacée a déjà été supprimée du navigateur.
    const cv = structuredClone(snapshot.cv);
    cv.profile.photoId = current.profile.photoId;
    this.schedule(cv);
    const version = snapshot.version;
    if (version && this.versions().some((v) => v.id === version.id)) {
      const restored = { ...structuredClone(version), updatedAt: new Date().toISOString() };
      this.versions.update((versions) =>
        versions.map((v) => (v.id === restored.id ? restored : v)),
      );
      void this.repository.saveVersion(restored);
    }
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

  setFreeMode(freeMode: boolean): void {
    this.mutate((cv) => (cv.freeMode = freeMode));
  }

  /** Choisir un modèle de la galerie quitte le style personnel. */
  setTemplate(template: CvTemplateId): void {
    this.mutate(
      (cv) => {
        cv.template = template;
        cv.style = null;
      },
      true,
      'template',
    );
  }

  /** Le CV garde une copie du style : il reste complet dans les sauvegardes. */
  setStyle(style: CvStyle | null): void {
    this.mutate((cv) => (cv.style = style && structuredClone(style)), true, 'template');
  }

  setFont(role: 'heading' | 'body', font: CvFontId | null): void {
    this.mutate((cv) => (cv.fonts = { ...cv.fonts, [role]: font }));
  }

  setAccent(color: string): void {
    this.mutate((cv) => (cv.accentColor = color));
  }

  setDateStyle(style: DateStyle): void {
    this.mutate((cv) => (cv.dateStyle = style));
  }

  /** `record: false` pour les étapes intermédiaires de l'ajustement automatique. */
  setLayout(patch: Partial<CvLayout>, record = true): void {
    this.mutate((cv) => (cv.layout = { ...(cv.layout ?? DEFAULT_LAYOUT), ...patch }), record);
  }

  /** Point de retour unique avant une série de modifications non enregistrées dans l'historique. */
  checkpoint(): void {
    this.lastRecordAt = 0;
    this.record(null);
  }

  // --- Lettre de motivation ---

  /** Lettre de la version affichée, sinon celle du Master. */
  readonly letter = computed(() => this.activeVersion()?.letter ?? this.cv()?.letter ?? null);
  /** Lettre affichée : à défaut, une lettre vierge (formules d'usage de la langue du CV). */
  readonly shownLetter = computed(
    () => this.letter() ?? createLetter(this.cv()?.profile.location ?? ''),
  );
  /** La version affichée a sa propre lettre (sinon elle montre celle du Master). */
  readonly versionHasLetter = computed(() => !!this.activeVersion()?.letter);

  /** Une version qui modifie la lettre en prend d'abord une copie : le Master reste intact. */
  updateLetter(patch: Partial<CoverLetter>): void {
    const base = this.shownLetter();
    const version = this.activeVersion();
    if (version) {
      void this.updateVersion(version.id, (draft) => {
        draft.letter = { ...(draft.letter ?? base), ...patch };
      });
    } else {
      this.mutate((cv) => (cv.letter = { ...(cv.letter ?? base), ...patch }));
    }
  }

  /** La version abandonne sa lettre et reprend celle du Master. */
  useMasterLetter(): void {
    const version = this.activeVersion();
    if (version) void this.updateVersion(version.id, (draft) => (draft.letter = null));
  }

  // --- Profil ---

  updateProfile(patch: Partial<Profile>): void {
    this.mutate((cv) => Object.assign(cv.profile, patch));
  }

  async setPhoto(file: File): Promise<void> {
    const blob = await prepareProfilePhoto(file);
    const previous = this.cv()?.profile.photoId;
    const photoId = await this.repository.savePhoto(blob);
    this.updateProfile({ photoId, photoIcon: null });
    await this.flush();
    if (previous) await this.repository.deletePhoto(previous);
    await this.refreshPhoto();
  }

  /** L'icône remplace la photo, qui est supprimée du navigateur comme lors d'un changement de photo. */
  async setPhotoIcon(photoIcon: AvatarIcon): Promise<void> {
    const previous = this.cv()?.profile.photoId;
    this.updateProfile({ photoIcon, photoId: null });
    if (!previous) return;
    await this.flush();
    await this.repository.deletePhoto(previous);
    await this.refreshPhoto();
  }

  async removePhoto(): Promise<void> {
    if (this.cv()?.profile.photoIcon) this.updateProfile({ photoIcon: null });
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

  toggleSectionCollapsed(sectionId: string): void {
    const collapsed = new Set(this.collapsedSections());
    if (!collapsed.delete(sectionId)) collapsed.add(sectionId);
    this.collapsedSections.set(collapsed);
    writeSetting(COLLAPSED_SETTING, [...collapsed].join(','));
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

  async createVersion(name: string, preset: Partial<CvVersion> = {}): Promise<void> {
    const cv = this.cv();
    if (!cv) return;
    const version = { ...createVersion(cv.id, name), ...preset };
    await this.repository.saveVersion(version);
    this.versions.update((versions) => [...versions, version]);
    this.activeVersionId.set(version.id);
  }

  async renameVersion(id: string, name: string): Promise<void> {
    await this.updateVersion(id, (version) => (version.name = name), false);
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

  // --- Adaptation à une offre d'emploi ---

  /** Annonce du Master (non enregistrée) ; une version ciblée garde la sienne. */
  private readonly masterJobAd = signal('');

  readonly jobAd = computed(() => this.activeVersion()?.jobAd ?? this.masterJobAd());
  readonly jobKeywords = computed(() => extractKeywords(this.jobAd()));
  readonly jobMatch = computed(() => {
    const resolved = this.resolved();
    const keywords = this.jobKeywords();
    return resolved && keywords.length ? matchCv(resolved, keywords) : null;
  });

  setJobAd(text: string): void {
    const version = this.activeVersion();
    if (version) void this.updateVersion(version.id, (draft) => (draft.jobAd = text));
    else this.masterJobAd.set(text);
  }

  /** Version ciblée pré-remplie : l'annonce y est enregistrée, le hors-sujet est décoché. */
  async createVersionForJob(name: string): Promise<void> {
    const cv = this.cv();
    if (!cv) return;
    const jobAd = this.jobAd();
    await this.createVersion(name, {
      jobAd,
      hiddenIds: hiddenIdsForJob(cv, extractKeywords(jobAd)),
    });
    this.masterJobAd.set('');
  }

  /** Ajoute un mot-clé manquant à la première section Compétences (créée au besoin). */
  addKeywordToSkills(keyword: string, groupLabel: string): void {
    this.mutate((cv) => {
      let section: CvSection | undefined = cv.sections.find((s) => s.kind === 'skills');
      if (!section) {
        section = createSection('skills');
        cv.sections.push(section);
      }
      const groups = section.items as SkillGroup[];
      const group = groups.at(-1) ?? { id: newId(), label: groupLabel, keywords: '' };
      if (!groups.includes(group)) groups.push(group);
      group.keywords = group.keywords.trim() ? `${group.keywords.trim()}, ${keyword}` : keyword;
    });
  }

  private async updateVersion(
    id: string,
    change: (version: CvVersion) => void,
    record = true,
  ): Promise<void> {
    const current = this.versions().find((version) => version.id === id);
    if (!current) return;
    if (record) this.record(null);
    const draft = structuredClone(current);
    change(draft);
    draft.updatedAt = new Date().toISOString();
    this.versions.update((versions) =>
      versions.map((version) => (version.id === id ? draft : version)),
    );
    await this.repository.saveVersion(draft);
  }
}
