import { CvVersion, EntrySection, createVersion } from './cv.model';
import { resolveCv } from './resolve-cv';
import { createSampleCv } from './sample-cv';

describe('resolveCv', () => {
  const cv = createSampleCv('fr');
  cv.profile = {
    ...cv.profile,
    birthDate: '1995-03-12',
    nationality: 'Française',
    photoId: 'photo-1',
  };
  const experience = cv.sections[0] as EntrySection;

  const hiding = (...ids: string[]): CvVersion => ({
    ...createVersion(cv.id, 'Test'),
    hiddenIds: ids,
  });

  it('affiche tout le Master CV sans version', () => {
    const resolved = resolveCv(cv, null);
    expect(resolved.sections.length).toBe(cv.sections.length);
    expect(resolved.profile.photoId).toBe('photo-1');
    expect(resolved.profile.birthDate).toBe('1995-03-12');
  });

  it('retire les sections, entrées et puces masquées par la version', () => {
    const [firstJob, secondJob] = experience.items;
    const resolved = resolveCv(cv, hiding(cv.sections[4].id, secondJob.id, firstJob.bullets[0].id));
    const resolvedExperience = resolved.sections[0] as EntrySection;

    expect(resolved.sections.map((s) => s.kind)).not.toContain('interests');
    expect(resolvedExperience.items.map((e) => e.id)).toEqual([firstJob.id]);
    expect(resolvedExperience.items[0].bullets.length).toBe(firstJob.bullets.length - 1);
  });

  it('ne modifie jamais le Master CV', () => {
    resolveCv(cv, hiding(experience.items[0].id));
    expect(experience.items.length).toBe(2);
  });

  it('masque photo, date de naissance et nationalité en anglais', () => {
    const resolved = resolveCv({ ...cv, language: 'en' }, null);
    expect(resolved.profile.photoId).toBeNull();
    expect(resolved.profile.birthDate).toBe('');
    expect(resolved.profile.nationality).toBe('');
  });

  it('les garde dans les autres langues', () => {
    for (const language of ['fr', 'it', 'es', 'de'] as const) {
      expect(resolveCv({ ...cv, language }, null).profile.nationality).toBe('Française');
    }
  });

  it('ignore les éléments et sections vides', () => {
    const empty = createSampleCv('fr');
    empty.sections = [{ id: 's', kind: 'experience', title: '', items: [] }];
    expect(resolveCv(empty, null).sections).toEqual([]);
  });
});
