import { Injectable } from '@angular/core';
import { liveQuery } from 'dexie';
import { Observable, from } from 'rxjs';
import { CvVersion, MasterCv, newId } from '../model/cv.model';
import { CvStyle, normalizeStyle } from '../model/cv-style';
import { Backup, BackupPhoto, createBackup, normalizeCv } from './backup';
import { LocalAtsCvDb } from './db';
import { blobToDataUrl, dataUrlToBlob, prepareProfilePhoto } from './photo';

/** Accès aux données locales (IndexedDB). Rien ne sort jamais du navigateur. */
@Injectable({ providedIn: 'root' })
export class CvRepository {
  private readonly db = new LocalAtsCvDb();

  /** Liste des CV, la plus récemment modifiée en premier, mise à jour en direct. */
  readonly cvs$: Observable<MasterCv[]> = from(
    liveQuery(async () => {
      const cvs = await this.db.cvs.orderBy('updatedAt').reverse().toArray();
      return cvs.map(normalizeCv).filter((cv) => cv !== null);
    }),
  );

  readonly versionCounts$: Observable<Record<string, number>> = from(
    liveQuery(async () => {
      const counts: Record<string, number> = {};
      await this.db.versions.each((version) => {
        counts[version.masterId] = (counts[version.masterId] ?? 0) + 1;
      });
      return counts;
    }),
  );

  /** Styles du studio, le plus récemment modifié en premier, mis à jour en direct. */
  readonly styles$: Observable<CvStyle[]> = from(
    liveQuery(async () => {
      const styles = await this.db.styles.orderBy('updatedAt').reverse().toArray();
      return styles.map(normalizeStyle).filter((style) => style !== null);
    }),
  );

  /** Les CV enregistrés par une version antérieure sont complétés à la lecture. */
  async getCv(id: string): Promise<MasterCv | undefined> {
    return normalizeCv(await this.db.cvs.get(id)) ?? undefined;
  }

  async saveCv(cv: MasterCv): Promise<void> {
    await this.db.cvs.put(cv);
    void this.requestPersistence();
  }

  async deleteCv(id: string): Promise<void> {
    await this.deleteCvs([id]);
  }

  /** Suppression groupée : tout ou rien, avec les versions et les photos de chaque CV. */
  async deleteCvs(ids: string[]): Promise<void> {
    await this.db.transaction('rw', this.db.cvs, this.db.versions, this.db.photos, async () => {
      const cvs = await this.db.cvs.bulkGet(ids);
      await this.db.photos.bulkDelete(cvs.flatMap((cv) => cv?.profile.photoId ?? []));
      await this.db.versions.where('masterId').anyOf(ids).delete();
      await this.db.cvs.bulkDelete(ids);
    });
  }

  /** Copie complète (versions et photo comprises), par exemple pour traduire un CV. */
  async duplicateCv(id: string, name: string): Promise<MasterCv | undefined> {
    return this.db.transaction('rw', this.db.cvs, this.db.versions, this.db.photos, async () => {
      const source = await this.db.cvs.get(id);
      if (!source) return undefined;
      const timestamp = new Date().toISOString();
      const copy: MasterCv = {
        ...structuredClone(source),
        id: newId(),
        name,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      if (source.profile.photoId) {
        const photo = await this.db.photos.get(source.profile.photoId);
        copy.profile.photoId = photo
          ? await this.db.photos.add({ id: newId(), blob: photo.blob })
          : null;
      }
      const versions = await this.db.versions.where('masterId').equals(id).toArray();
      await this.db.versions.bulkAdd(
        versions.map((version) => ({ ...version, id: newId(), masterId: copy.id })),
      );
      await this.db.cvs.add(copy);
      return copy;
    });
  }

  getVersions(masterId: string): Promise<CvVersion[]> {
    return this.db.versions.where('masterId').equals(masterId).sortBy('createdAt');
  }

  async saveVersion(version: CvVersion): Promise<void> {
    await this.db.versions.put(version);
  }

  async deleteVersion(id: string): Promise<void> {
    await this.db.versions.delete(id);
  }

  async getPhoto(id: string): Promise<Blob | undefined> {
    return (await this.db.photos.get(id))?.blob;
  }

  savePhoto(blob: Blob): Promise<string> {
    return this.db.photos.add({ id: newId(), blob });
  }

  async deletePhoto(id: string): Promise<void> {
    await this.db.photos.delete(id);
  }

  // --- Styles du studio ---

  async getStyle(id: string): Promise<CvStyle | undefined> {
    return normalizeStyle(await this.db.styles.get(id)) ?? undefined;
  }

  /**
   * Chaque CV garde une copie du style qu'il utilise (sauvegardes et partages restent complets) :
   * enregistrer le style met aussi à jour ces copies, sans toucher à leur date de modification.
   */
  async saveStyle(style: CvStyle): Promise<void> {
    await this.db.transaction('rw', this.db.styles, this.db.cvs, async () => {
      await this.db.styles.put(style);
      await this.db.cvs
        .filter((cv) => cv.style?.id === style.id)
        .modify((cv) => void (cv.style = structuredClone(style)));
    });
    void this.requestPersistence();
  }

  /** Les CV qui l'utilisent gardent leur copie : leur apparence ne change pas. */
  async deleteStyle(id: string): Promise<void> {
    await this.db.styles.delete(id);
  }

  /** Nombre de CV qui utilisent chaque style. */
  readonly styleUsage$: Observable<Record<string, number>> = from(
    liveQuery(async () => {
      const usage: Record<string, number> = {};
      await this.db.cvs.each((cv) => {
        if (cv.style?.id) usage[cv.style.id] = (usage[cv.style.id] ?? 0) + 1;
      });
      return usage;
    }),
  );

  /** Sauvegarde de tous les CV, ou seulement de ceux demandés. */
  async exportBackup(cvIds?: string[]): Promise<Backup> {
    const cvs = cvIds
      ? (await this.db.cvs.bulkGet(cvIds)).filter((cv) => cv !== undefined)
      : await this.db.cvs.toArray();
    const ids = new Set(cvs.map((cv) => cv.id));
    const versions = (await this.db.versions.toArray()).filter((v) => ids.has(v.masterId));
    const photos: BackupPhoto[] = [];
    for (const cv of cvs) {
      const blob = cv.profile.photoId ? await this.getPhoto(cv.profile.photoId) : undefined;
      if (blob) photos.push({ id: cv.profile.photoId!, dataUrl: await blobToDataUrl(blob) });
    }
    // Les styles du studio ne sont joints qu'à la sauvegarde complète ; un CV seul garde sa copie.
    const styles = cvIds ? [] : await this.db.styles.toArray();
    return createBackup(cvs, versions, photos, styles);
  }

  /** Les CV de même identifiant sont remplacés, les autres sont conservés. */
  async importBackup(backup: Backup): Promise<void> {
    // Les photos d'une sauvegarde passent par le même traitement qu'un envoi : décodées puis
    // réencodées en JPEG par le navigateur. Un fichier qui n'est pas une vraie image (SVG
    // fabriqué à la main, données corrompues) n'est jamais stocké ; le CV reste sans photo.
    const photos: { id: string; blob: Blob }[] = [];
    for (const photo of backup.photos) {
      try {
        photos.push({
          id: photo.id,
          blob: await prepareProfilePhoto(dataUrlToBlob(photo.dataUrl)),
        });
      } catch {
        // Photo illisible : ignorée.
      }
    }
    const tables = [this.db.cvs, this.db.versions, this.db.photos, this.db.styles];
    await this.db.transaction('rw', tables, async () => {
      await this.db.photos.bulkPut(photos);
      await this.db.styles.bulkPut(backup.styles ?? []);
      for (const cv of backup.cvs) await this.db.versions.where('masterId').equals(cv.id).delete();
      await this.db.versions.bulkPut(backup.versions);
      await this.db.cvs.bulkPut(backup.cvs);
    });
    void this.requestPersistence();
  }

  /** Demande au navigateur de ne pas effacer ces données en cas de manque d'espace disque. */
  async requestPersistence(): Promise<boolean> {
    try {
      if (await navigator.storage?.persisted?.()) return true;
      return (await navigator.storage?.persist?.()) ?? false;
    } catch {
      return false;
    }
  }
}
