import { formatBirthDate, formatCvDate, formatDateRange, labelSeparator } from './cv-labels';

describe('formatage des dates du CV', () => {
  it('garde une année seule telle quelle', () => {
    expect(formatCvDate('2021', 'fr')).toBe('2021');
  });

  it('écrit le mois dans la langue du CV, avec une majuscule', () => {
    expect(formatCvDate('2022-03', 'fr')).toMatch(/^Mars 2022$/);
    expect(formatCvDate('2022-03', 'en')).toMatch(/^Mar 2022$/);
    expect(formatCvDate('2022-03', 'de')).toMatch(/^Mär.* 2022$/);
  });

  it('affiche « aujourd’hui » pour un poste en cours', () => {
    expect(formatDateRange('2022-03', '', true, 'fr')).toBe('Mars 2022 – aujourd’hui');
    expect(formatDateRange('2022-03', '', true, 'en')).toBe('Mar 2022 – Present');
  });

  it('gère les dates partielles', () => {
    expect(formatDateRange('2019', '2019', false, 'fr')).toBe('2019');
    expect(formatDateRange('', '2020', false, 'fr')).toBe('2020');
    expect(formatDateRange('', '', false, 'fr')).toBe('');
  });

  it('formate la date de naissance en toutes lettres', () => {
    expect(formatBirthDate('1995-03-12', 'fr')).toBe('12 mars 1995');
    expect(formatBirthDate('1995-03-12', 'en')).toBe('March 12, 1995');
  });

  it('met une espace insécable avant les deux-points en français seulement', () => {
    expect(labelSeparator('fr')).toBe(' : ');
    expect(labelSeparator('en')).toBe(': ');
  });

  it('garde seulement les années en style « années seules »', () => {
    expect(formatCvDate('2022-03', 'fr', 'year')).toBe('2022');
    expect(formatDateRange('2019-09', '2022-02', false, 'fr', 'year')).toBe('2019 – 2022');
    expect(formatDateRange('2022-03', '', true, 'fr', 'year')).toBe('2022 – aujourd’hui');
  });
});
