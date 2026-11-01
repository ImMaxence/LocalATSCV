import { CV_LANGUAGES } from './cv.model';
import { CV_LABELS } from './cv-labels';
import { languageLevel } from './language-level';

describe('languageLevel', () => {
  it('reconnaît les niveaux CECRL et les mots usuels', () => {
    expect(languageLevel('C1')).toBe(4);
    expect(languageLevel('Courant')).toBe(4);
    expect(languageLevel('Native speaker')).toBe(5);
    expect(languageLevel('Notions')).toBe(1);
    expect(languageLevel('Très bon')).toBeNull();
    expect(languageLevel('')).toBeNull();
  });

  it.each(CV_LANGUAGES)(
    'reconnaît toutes les suggestions proposées en %s, du plus fort au plus faible',
    (lang) => {
      const levels = CV_LABELS[lang].levelSuggestions.map(languageLevel);
      expect(levels).toEqual([5, 5, 4, 3, 2.5, 2, 1]);
    },
  );
});
