import { BACKUP_SCHEMA_VERSION, BackupError, createBackup, parseBackup } from './backup';
import { createVersion } from '../model/cv.model';
import { createSampleCv } from '../model/sample-cv';

const codeOf = (fn: () => unknown): string | undefined => {
  try {
    fn();
  } catch (error) {
    return error instanceof BackupError ? error.code : 'other';
  }
  return undefined;
};

describe('parseBackup', () => {
  const cv = createSampleCv('fr');
  cv.profile.photoId = 'photo-1';
  const version = { ...createVersion(cv.id, 'Ciblée'), hiddenIds: ['a', 'b'] };
  const photo = { id: 'photo-1', dataUrl: 'data:image/jpeg;base64,AAAA' };

  it('relit à l’identique une sauvegarde exportée', () => {
    const backup = createBackup([cv], [version], [photo]);
    const parsed = parseBackup(JSON.stringify(backup));
    expect(parsed.cvs).toEqual([cv]);
    expect(parsed.versions).toEqual([version]);
    expect(parsed.photos).toEqual([photo]);
  });

  it('refuse un fichier qui n’est pas du JSON', () => {
    expect(codeOf(() => parseBackup('pas du json'))).toBe('invalidJson');
  });

  it('refuse un JSON qui n’est pas une sauvegarde LocalATSCV', () => {
    expect(codeOf(() => parseBackup('{"hello":"world"}'))).toBe('notABackup');
    expect(codeOf(() => parseBackup('[1,2,3]'))).toBe('notABackup');
  });

  it('refuse une sauvegarde d’une version plus récente', () => {
    const future = { ...createBackup([], [], []), schemaVersion: BACKUP_SCHEMA_VERSION + 1 };
    expect(codeOf(() => parseBackup(JSON.stringify(future)))).toBe('newerVersion');
  });

  it('complète les champs manquants et écarte les données invalides', () => {
    const raw = {
      app: 'LocalATSCV',
      schemaVersion: 1,
      cvs: [
        {
          id: 'cv-1',
          language: 'xx',
          accentColor: 'rouge',
          profile: { firstName: 'Ada' },
          sections: [
            { kind: 'inconnu', items: [] },
            { kind: 'skills', items: [{ keywords: 'TS' }] },
          ],
        },
        { name: 'sans identifiant' },
      ],
      versions: [{ id: 'v', masterId: 'cv-absent' }],
      photos: [{ id: 'x', dataUrl: 'javascript:alert(1)' }],
    };
    const parsed = parseBackup(JSON.stringify(raw));

    expect(parsed.cvs.length).toBe(1);
    const [imported] = parsed.cvs;
    expect(imported.language).toBe('fr');
    expect(imported.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
    expect(imported.profile.firstName).toBe('Ada');
    expect(imported.profile.links).toEqual([]);
    expect(imported.sections.map((s) => s.kind)).toEqual(['skills']);
    expect(imported.sections[0].items[0].id).toBeTruthy();
    expect(parsed.versions).toEqual([]);
    expect(parsed.photos).toEqual([]);
  });
});
