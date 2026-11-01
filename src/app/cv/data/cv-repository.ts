import { Injectable } from '@angular/core';
import { liveQuery } from 'dexie';
import { Observable, from } from 'rxjs';
import { CvVersion, MasterCv, newId } from '../model/cv.model';
import { Backup, BackupPhoto, createBackup } from './backup';
import { LocalAtsCvDb } from './db';
import { blobToDataUrl, dataUrlToBlob } from './photo';

/** Accès aux données locales (IndexedDB). Rien ne sort jamais du navigateur. */
@Injectable({ providedIn: 'root' })
export class CvRepository {
  private readonly db = new LocalAtsCvDb();

  /** Liste des CV, la plus récemment modifiée en premier, mise à jour en direct. */
  readonly cvs$: Observable<MasterCv[]> = from(
    liveQuery(() => this.db.cvs.orderBy('updatedAt').reverse().toArray()),
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

  getCv(id: string): Promise<MasterCv | undefined> {
    return this.db.cvs.get(id);
  }

  async saveCv(cv: MasterCv): Promise<void> {
    await this.db.cvs.put(cv);
    void this.requestPersistence();
  }

  async deleteCv(id: string): Promise<void> {
    await this.db.transaction('rw', this.db.cvs, this.db.versions, this.db.photos, async () => {
      const cv = await this.db.cvs.get(id);
      if (cv?.profile.photoId) await this.db.photos.delete(cv.profile.photoId);
      await this.db.versions.where('masterId').equals(id).delete();
      await this.db.cvs.delete(id);
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
    return createBackup(cvs, versions, photos);
  }

  /** Les CV de même identifiant sont remplacés, les autres sont conservés. */
  async importBackup(backup: Backup): Promise<void> {
    await this.db.transaction('rw', this.db.cvs, this.db.versions, this.db.photos, async () => {
      await this.db.photos.bulkPut(
        backup.photos.map((photo) => ({ id: photo.id, blob: dataUrlToBlob(photo.dataUrl) })),
      );
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
