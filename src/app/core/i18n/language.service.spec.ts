import { detectInitialLanguage } from './language.service';

describe('detectInitialLanguage', () => {
  it('garde la langue mémorisée si elle est prise en charge', () => {
    expect(detectInitialLanguage('en', ['fr-FR'])).toBe('en');
  });

  it('ignore une langue mémorisée inconnue', () => {
    expect(detectInitialLanguage('xx', ['en-US'])).toBe('en');
  });

  it('prend la première langue du navigateur prise en charge', () => {
    expect(detectInitialLanguage(null, ['de-DE', 'en-GB', 'fr'])).toBe('en');
  });

  it('se rabat sur le français par défaut', () => {
    expect(detectInitialLanguage(null, ['ja-JP'])).toBe('fr');
    expect(detectInitialLanguage(null, [])).toBe('fr');
  });
});
