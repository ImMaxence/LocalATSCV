import { CvVersion, DISABILITY_ID, EntrySection, MasterCv, createVersion } from './cv.model';
import { createStyle } from './cv-style';
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

  it('garde l’icône choisie à la place de la photo sur un CV en anglais', () => {
    const english = {
      ...cv,
      language: 'en' as const,
      profile: { ...cv.profile, photoIcon: 'leaf' as const },
    };
    const resolved = resolveCv(english, null);
    expect(resolved.profile.photoId).toBeNull();
    expect(resolved.profile.photoIcon).toBe('leaf');
  });

  it('transmet le style personnel du CV', () => {
    const style = { ...createStyle('Test'), base: 'aurora' as const };
    expect(resolveCv({ ...cv, style }, null).style).toBe(style);
  });

  it('ne modifie jamais le Master CV', () => {
    resolveCv(cv, hiding(experience.items[0].id));
    expect(experience.items.length).toBe(2);
  });

  it('garde photo, date de naissance et nationalité en anglais en mode libre', () => {
    const resolved = resolveCv({ ...cv, language: 'en', freeMode: true }, null);
    expect(resolved.profile.photoId).toBe('photo-1');
    expect(resolved.profile.birthDate).toBe('1995-03-12');
    expect(resolved.profile.nationality).toBe('Française');
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

  describe('mention de handicap', () => {
    const withMention = (placement: MasterCv['profile']['disabilityPlacement']): MasterCv => ({
      ...cv,
      profile: { ...cv.profile, disability: ' RQTH ', disabilityPlacement: placement },
    });
    const customTitles = (resolved: ReturnType<typeof resolveCv>) =>
      resolved.sections.filter((section) => section.kind === 'custom');

    it('rejoint les coordonnées par défaut', () => {
      const resolved = resolveCv(withMention('contact'), null);
      expect(resolved.profile.disability).toBe('RQTH');
      expect(customTitles(resolved)).toEqual([]);
    });

    it('crée une rubrique « Autres informations » en fin de CV', () => {
      const resolved = resolveCv(withMention('section'), null);
      const last = resolved.sections.at(-1) as EntrySection;
      expect(resolved.profile.disability).toBe('');
      expect(last.kind).toBe('custom');
      expect(last.title).toBe('');
      expect(last.items.map((item) => item.title)).toEqual(['RQTH']);
    });

    it('rejoint une rubrique « Autres informations » existante au titre par défaut', () => {
      const master = withMention('section');
      master.sections = [
        ...master.sections,
        {
          id: 'other',
          kind: 'custom',
          title: '',
          items: [{ ...experience.items[0], id: 'volunteer', title: 'Bénévolat' }],
        },
      ];
      const custom = customTitles(resolveCv(master, null)) as EntrySection[];
      expect(custom.length).toBe(1);
      expect(custom[0].items.map((item) => item.title)).toEqual(['Bénévolat', 'RQTH']);
    });

    it('reste hors du CV quand elle est réservée à la lettre', () => {
      const resolved = resolveCv(withMention('letter'), null);
      expect(resolved.profile.disability).toBe('');
      expect(customTitles(resolved)).toEqual([]);
    });

    it('disparaît des versions qui la masquent', () => {
      expect(resolveCv(withMention('contact'), hiding(DISABILITY_ID)).profile.disability).toBe('');
      expect(customTitles(resolveCv(withMention('section'), hiding(DISABILITY_ID)))).toEqual([]);
    });
  });

  it('transmet le style des dates, mois et année par défaut', () => {
    expect(resolveCv(cv, null).dateStyle).toBe('month');
    expect(resolveCv({ ...cv, dateStyle: 'year' }, null).dateStyle).toBe('year');
  });
});
