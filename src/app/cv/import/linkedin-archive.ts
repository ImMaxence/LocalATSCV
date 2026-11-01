import { strFromU8, unzipSync } from 'fflate';
import { normalizeText } from '../analysis/weak-phrases';
import { CvLanguage, CvSection, Entry, ProfileLink, createEmptyCv, newId } from '../model/cv.model';
import { ImportResult, findDateRange } from './cv-import';

const BOM = String.fromCharCode(0xfeff);

/** Lecture d'un CSV (RFC 4180) : guillemets, guillemets doublés et retours à la ligne dans les cellules. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  // Marque d'ordre des octets (BOM) en tête de certains exports.
  const source = text.startsWith(BOM) ? text.slice(1) : text;
  for (let i = 0; i < source.length; i++) {
    const char = source[i];
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

/**
 * Lignes d'un CSV LinkedIn sous forme d'objets. Certains fichiers commencent par des notes :
 * l'en-tête est la première ligne qui contient la colonne attendue.
 */
export function csvRecords(text: string, expectedColumn: string): Record<string, string>[] {
  const rows = parseCsv(text);
  const headerIndex = rows.findIndex((row) =>
    row.some((c) => c.trim().toLowerCase() === expectedColumn.toLowerCase()),
  );
  if (headerIndex < 0) return [];
  const header = rows[headerIndex].map((c) => c.trim());
  return rows
    .slice(headerIndex + 1)
    .map((row) => Object.fromEntries(header.map((name, i) => [name, (row[i] ?? '').trim()])));
}

const toDate = (value: string): string => (value ? (findDateRange(value)?.start ?? '') : '');

const toBullets = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s•●▪◦‣∙·■□►▸✓✔*–—-]+/, '').trim())
    .filter(Boolean)
    .map((line) => ({ id: newId(), text: line }));

function entry(fields: Partial<Entry>): Entry {
  return {
    id: newId(),
    title: '',
    subtitle: '',
    location: '',
    start: '',
    end: '',
    current: false,
    url: '',
    bullets: [],
    ...fields,
  };
}

const STOPWORDS: Record<CvLanguage, string[]> = {
  fr: ['le', 'la', 'les', 'des', 'et', 'pour', 'dans', 'avec'],
  en: ['the', 'and', 'for', 'with', 'of', 'in', 'to', 'my'],
  it: ['il', 'della', 'per', 'con', 'una', 'nel', 'dei', 'gli'],
  es: ['el', 'los', 'para', 'con', 'una', 'del', 'las', 'por'],
  de: ['der', 'die', 'und', 'für', 'mit', 'von', 'den', 'das'],
};

function detectLanguage(text: string): CvLanguage {
  const words = normalizeText(text).split(/[^a-z]+/);
  let best: CvLanguage = 'fr';
  let bestScore = 0;
  for (const [lang, list] of Object.entries(STOPWORDS) as [CvLanguage, string[]][]) {
    const set = new Set(list.map(normalizeText));
    const score = words.filter((word) => set.has(word)).length;
    if (score > bestScore) [best, bestScore] = [lang, score];
  }
  return best;
}

/**
 * Archive « Obtenir une copie de vos données » de LinkedIn (ZIP de fichiers CSV) → Master CV.
 * Disponible depuis l'application mobile comme depuis un ordinateur, plus fiable que le PDF.
 */
export function importLinkedInArchive(zip: Uint8Array, fallbackName: string): ImportResult {
  const files = unzipSync(zip, { filter: (file) => file.name.toLowerCase().endsWith('.csv') });
  const byName = new Map(
    Object.entries(files).map(([path, data]) => [
      path.split('/').pop()!.toLowerCase(),
      strFromU8(data),
    ]),
  );
  const read = (names: string[], column: string) => {
    const text = names.map((name) => byName.get(name)).find((content) => content !== undefined);
    return text ? csvRecords(text, column) : [];
  };

  const [profile = {}] = read(['profile.csv'], 'First Name');
  const positions = read(['positions.csv'], 'Company Name');
  const education = read(['education.csv'], 'School Name');
  const skills = read(['skills.csv'], 'Name');
  const languages = read(['languages.csv'], 'Name');
  const certifications = read(['certifications.csv'], 'Name');
  const projects = read(['projects.csv'], 'Title');
  const emails = read(['email addresses.csv'], 'Email Address');
  const phones = read(['phonenumbers.csv', 'phone numbers.csv'], 'Number');

  const summary = profile['Summary'] ?? '';
  const language = detectLanguage(
    [summary, ...positions.map((p) => p['Description'] ?? '')].join(' '),
  );
  const name = [profile['First Name'], profile['Last Name']].filter(Boolean).join(' ');
  const cv = createEmptyCv(name || fallbackName, language);

  const links: ProfileLink[] =
    (profile['Websites'] ?? '')
      .match(/https?:\/\/[^\s,\]]+/g)
      ?.map((url) => ({ id: newId(), label: '', url })) ?? [];
  cv.profile = {
    ...cv.profile,
    firstName: profile['First Name'] ?? '',
    lastName: profile['Last Name'] ?? '',
    title: profile['Headline'] ?? '',
    summary,
    location: profile['Geo Location'] ?? '',
    email: (emails.find((e) => e['Primary'] === 'Yes') ?? emails[0])?.['Email Address'] ?? '',
    phone: phones[0]?.['Number'] ?? '',
    links,
  };

  const sections: CvSection[] = [];
  if (positions.length) {
    sections.push({
      id: newId(),
      kind: 'experience',
      title: '',
      items: positions.map((p) =>
        entry({
          title: p['Title'] ?? '',
          subtitle: p['Company Name'] ?? '',
          location: p['Location'] ?? '',
          start: toDate(p['Started On'] ?? ''),
          end: toDate(p['Finished On'] ?? ''),
          current: !p['Finished On'],
          bullets: toBullets(p['Description'] ?? ''),
        }),
      ),
    });
  }
  if (education.length) {
    sections.push({
      id: newId(),
      kind: 'education',
      title: '',
      items: education.map((e) =>
        entry({
          title: e['Degree Name'] || e['School Name'] || '',
          subtitle: e['Degree Name'] ? (e['School Name'] ?? '') : '',
          start: toDate(e['Start Date'] ?? ''),
          end: toDate(e['End Date'] ?? ''),
          bullets: toBullets([e['Notes'], e['Activities']].filter(Boolean).join('\n')),
        }),
      ),
    });
  }
  if (projects.length) {
    sections.push({
      id: newId(),
      kind: 'projects',
      title: '',
      items: projects.map((p) =>
        entry({
          title: p['Title'] ?? '',
          url: p['Url'] ?? '',
          start: toDate(p['Started On'] ?? ''),
          end: toDate(p['Finished On'] ?? ''),
          bullets: toBullets(p['Description'] ?? ''),
        }),
      ),
    });
  }
  if (certifications.length) {
    sections.push({
      id: newId(),
      kind: 'certifications',
      title: '',
      items: certifications.map((c) =>
        entry({
          title: c['Name'] ?? '',
          subtitle: c['Authority'] ?? '',
          url: c['Url'] ?? '',
          start: toDate(c['Started On'] ?? ''),
        }),
      ),
    });
  }
  if (skills.length) {
    sections.push({
      id: newId(),
      kind: 'skills',
      title: '',
      items: [
        {
          id: newId(),
          label: '',
          keywords: skills
            .map((s) => s['Name'])
            .filter(Boolean)
            .join(', '),
        },
      ],
    });
  }
  if (languages.length) {
    sections.push({
      id: newId(),
      kind: 'languages',
      title: '',
      items: languages.map((l) => ({
        id: newId(),
        name: l['Name'] ?? '',
        level: l['Proficiency'] ?? '',
      })),
    });
  }

  cv.sections = sections;
  const items = sections.reduce((sum, section) => sum + section.items.length, 0);
  return { cv, items, linkedin: true };
}
