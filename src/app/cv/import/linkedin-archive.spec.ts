import { strToU8, zipSync } from 'fflate';
import { EntrySection, LanguagesSection, SkillsSection } from '../model/cv.model';
import { csvRecords, importLinkedInArchive, parseCsv } from './linkedin-archive';

describe('parseCsv', () => {
  it('gère guillemets, virgules et retours à la ligne dans les cellules', () => {
    expect(parseCsv('a,b\r\n"x, y","ligne 1\nligne 2"\n"il dit ""oui""",z\n')).toEqual([
      ['a', 'b'],
      ['x, y', 'ligne 1\nligne 2'],
      ['il dit "oui"', 'z'],
    ]);
  });

  it('trouve l’en-tête après des lignes de notes', () => {
    expect(
      csvRecords(
        'Notes:\n"Fichier exporté"\n\nName,Proficiency\nAnglais,Full professional',
        'Name',
      ),
    ).toEqual([{ Name: 'Anglais', Proficiency: 'Full professional' }]);
  });
});

describe('importLinkedInArchive', () => {
  const zip = zipSync({
    'Profile.csv': strToU8(
      'First Name,Last Name,Maiden Name,Address,Birth Date,Headline,Summary,Industry,Zip Code,Geo Location,Twitter Handles,Websites\n' +
        'Camille,Martin,,,,Développeuse Front-end,"Passionnée par la qualité et les interfaces accessibles",Logiciels,,"Lyon, Auvergne-Rhône-Alpes, France",,"[PORTFOLIO:https://camille.dev]"\n',
    ),
    'Positions.csv': strToU8(
      'Company Name,Title,Description,Location,Started On,Finished On\n' +
        'Société Exemple,Développeuse Angular,"Migration de 40 écrans vers Angular\nDéploiement continu pour 3 équipes","Lyon, France",Mar 2022,\n' +
        'Agence Démo,Développeuse web,Développement de 15 sites,Grenoble,Sep 2019,Feb 2022\n',
    ),
    'Education.csv': strToU8(
      'School Name,Start Date,End Date,Notes,Degree Name,Activities\nUniversité Exemple,2017,2019,,Master Informatique,\n',
    ),
    'Skills.csv': strToU8('Name\nAngular\nTypeScript\nDocker\n'),
    'Languages.csv': strToU8('Name,Proficiency\nAnglais,Full professional proficiency\n'),
    'Email Addresses.csv': strToU8(
      'Email Address,Confirmed,Primary,Updated On\nancien@exemple.fr,Yes,No,\ncamille@exemple.fr,Yes,Yes,\n',
    ),
    'PhoneNumbers.csv': strToU8('Extension,Number,Type\n,+33 6 12 34 56 78,Mobile\n'),
    'messages.json': strToU8('{}'),
  });

  const { cv, items, linkedin } = importLinkedInArchive(zip, 'archive');

  it('reprend le profil et les coordonnées', () => {
    expect(linkedin).toBe(true);
    expect(cv.profile).toMatchObject({
      firstName: 'Camille',
      lastName: 'Martin',
      title: 'Développeuse Front-end',
      location: 'Lyon, Auvergne-Rhône-Alpes, France',
      email: 'camille@exemple.fr',
      phone: '+33 6 12 34 56 78',
    });
    expect(cv.profile.links.map((l) => l.url)).toEqual(['https://camille.dev']);
    expect(cv.language).toBe('fr');
  });

  it('reprend les postes avec leurs dates et leurs puces', () => {
    const experience = cv.sections.find((s) => s.kind === 'experience') as EntrySection;
    expect(experience.items.map((e) => [e.title, e.subtitle, e.start, e.end, e.current])).toEqual([
      ['Développeuse Angular', 'Société Exemple', '2022-03', '', true],
      ['Développeuse web', 'Agence Démo', '2019-09', '2022-02', false],
    ]);
    expect(experience.items[0].bullets.map((b) => b.text)).toEqual([
      'Migration de 40 écrans vers Angular',
      'Déploiement continu pour 3 équipes',
    ]);
  });

  it('reprend formation, compétences et langues', () => {
    const education = cv.sections.find((s) => s.kind === 'education') as EntrySection;
    expect(education.items[0]).toMatchObject({
      title: 'Master Informatique',
      subtitle: 'Université Exemple',
      start: '2017',
      end: '2019',
    });
    expect((cv.sections.find((s) => s.kind === 'skills') as SkillsSection).items[0].keywords).toBe(
      'Angular, TypeScript, Docker',
    );
    expect(
      (cv.sections.find((s) => s.kind === 'languages') as LanguagesSection).items[0],
    ).toMatchObject({
      name: 'Anglais',
      level: 'Full professional proficiency',
    });
    expect(items).toBe(5);
  });
});
