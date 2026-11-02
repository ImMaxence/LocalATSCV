import { findHealthMention, mentionsDisabilityInclusion } from './inclusion';

describe('motifs médicaux dans le CV', () => {
  it('repère un arrêt de travail, tel qu’il est écrit', () => {
    expect(findHealthMention('Arrêt maladie')).toBe('Arrêt maladie');
    expect(findHealthMention('Reprise après un congé longue maladie')).toBe('congé longue maladie');
    expect(findHealthMention('Sick leave (2021)')).toBe('Sick leave');
    expect(findHealthMention('Baja médica')).toBe('Baja médica');
    expect(findHealthMention('Krankheitsbedingte Auszeit')).toBe('Krankheitsbedingte');
  });

  it('ne signale pas un métier de la santé', () => {
    expect(findHealthMention('Infirmière en service de maladies infectieuses')).toBeNull();
    expect(findHealthMention('Accompagnement des patients en hospitalisation')).toBeNull();
    expect(findHealthMention('Gestion des arrêts de travail des salariés')).toBeNull();
  });
});

describe('annonces ouvertes aux candidats en situation de handicap', () => {
  it('reconnaît les formules des cinq langues de CV', () => {
    expect(mentionsDisabilityInclusion('Poste ouvert aux personnes en situation de handicap')).toBe(true);
    expect(mentionsDisabilityInclusion('Entreprise handi-accueillante, RQTH bienvenue')).toBe(true);
    expect(mentionsDisabilityInclusion('We are a Disability Confident employer')).toBe(true);
    expect(mentionsDisabilityInclusion('Ricerca riservata alle categorie protette (L. 68/99)')).toBe(true);
    expect(mentionsDisabilityInclusion('Oferta para personas con discapacidad')).toBe(true);
    expect(mentionsDisabilityInclusion('Schwerbehinderte Bewerber werden bevorzugt')).toBe(true);
  });

  it('ignore une annonce qui n’en parle pas', () => {
    expect(mentionsDisabilityInclusion('Développeur Angular, TypeScript, RxJS. Télétravail possible')).toBe(false);
  });
});
