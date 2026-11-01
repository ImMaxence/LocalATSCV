import { EntrySection } from '../model/cv.model';
import { createSampleCv } from '../model/sample-cv';
import { extractKeywords, hiddenIdsForJob, matchCv, suggestVersionName } from './job-match';

const AD_FR = `Développeur Front-end Angular H/F
Rejoignez notre équipe produit à Lyon.
Missions : développer des interfaces en Angular et TypeScript, écrire des tests unitaires,
participer aux cérémonies Scrum. Vous maîtrisez Docker et la CI/CD (GitLab CI).
Profil : 3 ans d'expérience, anglais courant, sens de l'accessibilité (RGAA).
Stack : Angular, TypeScript, RxJS, Docker, Kubernetes. Bonus : connaissance de Kubernetes.`;

describe('extractKeywords', () => {
  const keywords = extractKeywords(AD_FR);
  const labels = keywords.map((k) => k.label);

  it('repère les compétences du dictionnaire, synonymes compris', () => {
    for (const expected of [
      'Angular',
      'TypeScript',
      'Docker',
      'Kubernetes',
      'Scrum',
      'CI/CD',
      'GitLab CI',
      'Anglais',
      'Accessibilité',
      'Tests unitaires',
    ]) {
      expect(labels).toContain(expected);
    }
  });

  it('garde les termes techniques propres à l’annonce', () => {
    expect(labels).toContain('RxJS');
  });

  it('ignore les mots génériques d’annonce', () => {
    for (const generic of ['Rejoignez', 'équipe', 'Missions', 'Profil', 'expérience']) {
      expect(labels.map((l) => l.toLowerCase())).not.toContain(generic.toLowerCase());
    }
  });

  it('classe en tête les termes les plus répétés', () => {
    expect(labels.indexOf('Angular')).toBeLessThan(labels.indexOf('Scrum'));
  });
});

describe('matchCv', () => {
  const cv = createSampleCv('fr');
  const keywords = extractKeywords(AD_FR);

  it('calcule un score et sépare mots trouvés et manquants', () => {
    const match = matchCv(cv, keywords);
    const found = match.found.map((k) => k.label);
    const missing = match.missing.map((k) => k.label);
    expect(found).toEqual(expect.arrayContaining(['Angular', 'TypeScript', 'Docker', 'GitLab CI']));
    expect(missing).toEqual(expect.arrayContaining(['Kubernetes', 'Scrum']));
    expect(match.score).toBeGreaterThan(30);
    expect(match.score).toBeLessThan(100);
  });

  it('reconnaît les synonymes dans le CV (RGAA ⇔ accessibilité)', () => {
    const match = matchCv(cv, keywords);
    expect(match.found.map((k) => k.label)).toContain('Accessibilité');
  });

  it('donne 0 sans mots-clés', () => {
    expect(matchCv(cv, []).score).toBe(0);
  });
});

describe('hiddenIdsForJob', () => {
  it('masque les puces sans rapport avec l’offre, en gardant au moins deux puces et deux expériences', () => {
    const cv = createSampleCv('fr');
    const experience = cv.sections[0] as EntrySection;
    const hidden = hiddenIdsForJob(cv, extractKeywords(AD_FR));
    expect(hidden).not.toContain(experience.items[0].id);
    expect(hidden).not.toContain(experience.items[1].id);
    const keptBullets = experience.items[0].bullets.filter((b) => !hidden.includes(b.id));
    expect(keptBullets.length).toBeGreaterThanOrEqual(2);
  });
});

describe('suggestVersionName', () => {
  it('reprend la première ligne utile de l’annonce', () => {
    expect(suggestVersionName(`\nhttps://exemple.fr/offre\n${AD_FR}`)).toBe(
      'Développeur Front-end Angular H/F',
    );
  });
});
