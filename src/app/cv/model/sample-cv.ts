import { CvLanguage, CvSection, MasterCv, createBullet, createEmptyCv, newId } from './cv.model';

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
        'Migration de 40 écrans vers Angular et TypeScript, temps de chargement réduit de 35 %',
        'Mise en place de la stratégie de tests de bout en bout (Playwright), 0 régression en production depuis 12 mois',
        'Déploiement continu avec GitLab CI pour 3 équipes produit',
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
        'Migrated 40 screens to Angular and TypeScript, cutting load time by 35%',
        'Set up the end-to-end testing strategy (Playwright), with zero production regressions in 12 months',
        'Built continuous delivery with GitLab CI for 3 product teams',
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

  cv.profile = {
    ...cv.profile,
    firstName: 'Camille',
    lastName: 'Martin',
    title: content.title,
    email: content.email,
    phone: '+33 6 12 34 56 78',
    location: content.location,
    summary: content.summary,
    links: [{ id: newId(), label: 'LinkedIn', url: 'linkedin.com/in/camille-martin-exemple' }],
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

  return { ...cv, sections };
}
