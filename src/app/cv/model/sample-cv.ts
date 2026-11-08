import {
  CoverLetter,
  CvLanguage,
  CvSection,
  MasterCv,
  createBullet,
  createEmptyCv,
  newId,
} from './cv.model';

interface SampleContent {
  name: string;
  title: string;
  location: string;
  email: string;
  summary: string;
  jobs: {
    title: string;
    company: string;
    location: string;
    start: string;
    end: string;
    current: boolean;
    bullets: string[];
  }[];
  school: {
    title: string;
    subtitle: string;
    location: string;
    start: string;
    end: string;
    bullets: string[];
  };
  skills: [string, string][];
  languages: [string, string][];
  interests: string[];
}

const FR: SampleContent = {
  name: 'Exemple · Camille Martin',
  title: 'Développeuse Front-end',
  location: 'Lyon',
  email: 'camille.martin@exemple.fr',
  summary:
    'Développeuse front-end avec 5 ans d’expérience sur des applications Angular à fort trafic. Attachée à la performance, à l’accessibilité et à la qualité du code, je recherche un poste de développeuse senior dans une équipe produit',
  jobs: [
    {
      title: 'Développeuse Angular',
      company: 'Société Exemple',
      location: 'Lyon',
      start: '2022-03',
      end: '',
      current: true,
      bullets: [
        'Migration de 40 écrans vers **Angular** et **TypeScript**, temps de chargement réduit de 35 %',
        'Mise en place de la stratégie de tests de bout en bout (**Playwright**), 0 régression en production depuis 12 mois',
        'Déploiement continu avec **GitLab CI** pour 3 équipes produit',
      ],
    },
    {
      title: 'Développeuse web',
      company: 'Agence Démo',
      location: 'Grenoble',
      start: '2019-09',
      end: '2022-02',
      current: false,
      bullets: [
        'Développement de 15 sites et applications pour des clients du secteur public',
        'Audit et mise en conformité RGAA de 6 sites, score moyen passé de 54 à 92 %',
      ],
    },
  ],
  school: {
    title: 'Master Informatique',
    subtitle: 'Université Exemple',
    location: 'Lyon',
    start: '2017',
    end: '2019',
    bullets: ['Spécialité génie logiciel, mention bien'],
  },
  skills: [
    ['Front-end', 'Angular, TypeScript, RxJS, HTML, CSS'],
    ['Qualité', 'Playwright, Vitest, accessibilité (RGAA)'],
    ['Outils', 'Git, GitLab CI, Docker, Figma'],
  ],
  languages: [
    ['Français', 'langue maternelle'],
    ['Anglais', 'C1, courant'],
  ],
  interests: ['Escalade', 'Photographie argentique'],
};

const EN: SampleContent = {
  name: 'Example · Camille Martin',
  title: 'Front-end Developer',
  location: 'Lyon, France',
  email: 'camille.martin@example.com',
  summary:
    'Front-end developer with 5 years of experience building high-traffic Angular applications. Focused on performance, accessibility and code quality, looking for a senior developer role in a product team',
  jobs: [
    {
      title: 'Angular Developer',
      company: 'Example Corp',
      location: 'Lyon, France',
      start: '2022-03',
      end: '',
      current: true,
      bullets: [
        'Migrated 40 screens to **Angular** and **TypeScript**, cutting load time by 35%',
        'Set up the end-to-end testing strategy (**Playwright**), with zero production regressions in 12 months',
        'Built continuous delivery with **GitLab CI** for 3 product teams',
      ],
    },
    {
      title: 'Web Developer',
      company: 'Demo Agency',
      location: 'Grenoble, France',
      start: '2019-09',
      end: '2022-02',
      current: false,
      bullets: [
        'Developed 15 websites and applications for public sector clients',
        'Audited 6 websites for accessibility compliance, raising the average score from 54% to 92%',
      ],
    },
  ],
  school: {
    title: 'MSc in Computer Science',
    subtitle: 'Example University',
    location: 'Lyon, France',
    start: '2017',
    end: '2019',
    bullets: ['Software engineering track, with honours'],
  },
  skills: [
    ['Front-end', 'Angular, TypeScript, RxJS, HTML, CSS'],
    ['Quality', 'Playwright, Vitest, accessibility (WCAG)'],
    ['Tools', 'Git, GitLab CI, Docker, Figma'],
  ],
  languages: [
    ['French', 'native'],
    ['English', 'C1, fluent'],
  ],
  interests: ['Climbing', 'Film photography'],
};

/** CV fictif pour découvrir l'éditeur. Contenu en français, ou en anglais pour les autres langues. */
export function createSampleCv(language: CvLanguage): MasterCv {
  const cvLanguage = language === 'fr' ? 'fr' : 'en';
  const content = cvLanguage === 'fr' ? FR : EN;
  const cv = createEmptyCv(content.name, cvLanguage);
  const linkedin = {
    id: newId(),
    label: 'LinkedIn',
    url: 'linkedin.com/in/camille-martin-exemple',
  };
  const github = { id: newId(), label: '@camille-exemple', url: 'github.com/camille-exemple' };

  cv.profile = {
    ...cv.profile,
    firstName: 'Camille',
    lastName: 'Martin',
    title: content.title,
    email: content.email,
    phone: '+33 6 12 34 56 78',
    location: content.location,
    summary: content.summary,
    drivingLicense: cvLanguage === 'fr' ? 'Permis B' : 'Driving licence',
    links: [linkedin, github],
    qrLinkId: github.id,
  };

  const sections: CvSection[] = [
    {
      id: newId(),
      kind: 'experience',
      title: '',
      items: content.jobs.map((job) => ({
        id: newId(),
        title: job.title,
        subtitle: job.company,
        location: job.location,
        start: job.start,
        end: job.end,
        current: job.current,
        url: '',
        bullets: job.bullets.map((text) => createBullet(text)),
      })),
    },
    {
      id: newId(),
      kind: 'education',
      title: '',
      items: [
        {
          id: newId(),
          ...content.school,
          current: false,
          url: '',
          bullets: content.school.bullets.map((text) => createBullet(text)),
        },
      ],
    },
    {
      id: newId(),
      kind: 'skills',
      title: '',
      items: content.skills.map(([label, keywords]) => ({ id: newId(), label, keywords })),
    },
    {
      id: newId(),
      kind: 'languages',
      title: '',
      items: content.languages.map(([name, level]) => ({ id: newId(), name, level })),
    },
    {
      id: newId(),
      kind: 'interests',
      title: '',
      items: content.interests.map((label) => ({ id: newId(), label })),
    },
  ];

  return { ...cv, template: 'aurora', sections, letter: SAMPLE_LETTERS[cvLanguage] };
}

/** Photo d'exemple (une illustration, pas une vraie personne) : galerie de modèles et CV d'exemple. */
export const SAMPLE_PHOTO_URL = '/images/photo-exemple.svg';

const SHOWCASE_EXTRAS = {
  fr: {
    bullet: "Création d'une bibliothèque de **30 composants** partagée par 4 projets",
    language: ['Espagnol', 'B1, intermédiaire'],
    interest: 'Course à pied',
  },
  en: {
    bullet: 'Built a shared library of **30 components** used across 4 projects',
    language: ['Spanish', 'B1, intermediate'],
    interest: 'Running',
  },
} as const;

/**
 * CV d'exemple plus fourni pour la galerie de modèles : chaque modèle y est montré sur une page
 * bien remplie (trois langues, une puce de plus…), quel que soit l'avancement du CV en cours.
 */
export function createShowcaseCv(language: CvLanguage): MasterCv {
  const cv = createSampleCv(language);
  const extras = SHOWCASE_EXTRAS[cv.language === 'fr' ? 'fr' : 'en'];
  for (const section of cv.sections) {
    if (section.kind === 'experience') section.items[1]?.bullets.push(createBullet(extras.bullet));
    if (section.kind === 'languages') {
      section.items.push({ id: newId(), name: extras.language[0], level: extras.language[1] });
    }
    if (section.kind === 'interests') section.items.push({ id: newId(), label: extras.interest });
  }
  return cv;
}

const SAMPLE_LETTERS: Record<'fr' | 'en', CoverLetter> = {
  fr: {
    recipient: 'Société Exemple\nService recrutement\n10 rue de la République\n69002 Lyon',
    place: 'Lyon',
    date: '',
    subject: 'Candidature au poste de développeuse front-end senior',
    greeting: '',
    body: [
      "Votre application de réservation est utilisée chaque jour par des milliers de personnes, et votre équipe produit a fait de l'accessibilité une priorité : c'est exactement le type de projet sur lequel je veux m'investir.",
      "Depuis cinq ans, je développe des applications Angular à fort trafic. Chez Société Exemple, j'ai mené la migration de **40 écrans** vers Angular et TypeScript, avec un temps de chargement réduit de **35 %**, et mis en place des tests de bout en bout qui n'ont laissé passer aucune régression en production depuis un an.",
      "Je serais ravie d'échanger avec vous sur vos prochains chantiers et sur la façon dont je pourrais y contribuer. Je suis disponible pour un entretien à votre convenance.",
    ].join('\n\n'),
    closing: '',
  },
  en: {
    recipient: 'Example Company\nTalent Acquisition\n10 Market Street\nLondon',
    place: 'Lyon',
    date: '',
    subject: 'Application for the Senior Front-end Developer position',
    greeting: '',
    body: [
      'Your booking app is used every day by thousands of people, and your product team has made accessibility a priority: this is exactly the kind of project I want to commit to.',
      'For five years I have built high-traffic Angular applications. At Example Company, I led the migration of **40 screens** to Angular and TypeScript, cutting load time by **35%**, and set up end-to-end tests that have let no regression reach production for a year.',
      'I would be glad to discuss your upcoming projects and how I could contribute. I am available for an interview at your convenience.',
    ].join('\n\n'),
    closing: '',
  },
};
