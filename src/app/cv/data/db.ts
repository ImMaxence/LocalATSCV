import Dexie, { Table } from 'dexie';
import { CvVersion, MasterCv } from '../model/cv.model';
import { CvStyle } from '../model/cv-style';

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
  styles!: Table<CvStyle, string>;

  constructor() {
    super('localatscv');
    this.version(1).stores({
      cvs: 'id, updatedAt',
      versions: 'id, masterId',
      photos: 'id',
    });
    // 0.13.0 : styles personnels du studio.
    this.version(2).stores({ styles: 'id, updatedAt' });
  }
}
