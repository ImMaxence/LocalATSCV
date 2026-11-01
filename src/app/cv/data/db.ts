import Dexie, { Table } from 'dexie';
import { CvVersion, MasterCv } from '../model/cv.model';

export interface StoredPhoto {
  id: string;
  blob: Blob;
}

/**
 * Base IndexedDB locale. Toute évolution de structure passe par un nouveau
 * `this.version(n)` (avec `.upgrade()` si les données existantes doivent être transformées).
 */
export class LocalAtsCvDb extends Dexie {
  cvs!: Table<MasterCv, string>;
  versions!: Table<CvVersion, string>;
  photos!: Table<StoredPhoto, string>;

  constructor() {
    super('localatscv');
    this.version(1).stores({
      cvs: 'id, updatedAt',
      versions: 'id, masterId',
      photos: 'id',
    });
  }
}
