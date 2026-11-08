/** Types de changements du format Keep a Changelog (titres anglais du fichier, français acceptés). */
export const CHANGE_TYPES = [
  'added',
  'changed',
  'fixed',
  'removed',
  'deprecated',
  'security',
] as const;
export type ChangeType = (typeof CHANGE_TYPES)[number] | 'other';

const TYPE_TITLES: Record<string, ChangeType> = {
  ajouté: 'added',
  added: 'added',
  modifié: 'changed',
  changed: 'changed',
  corrigé: 'fixed',
  fixed: 'fixed',
  supprimé: 'removed',
  removed: 'removed',
  obsolète: 'deprecated',
  deprecated: 'deprecated',
  sécurité: 'security',
  security: 'security',
};

/** Fragment de texte d'une entrée : le code `entre accents graves` est mis en forme à part. */
export interface TextPart {
  text: string;
  code: boolean;
}

export interface ChangeGroup {
  type: ChangeType;
  items: TextPart[][];
}

export interface Release {
  /** `null` pour la section « Non publié ». */
  version: string | null;
  date: string | null;
  groups: ChangeGroup[];
}

const RELEASE_HEADING = /^##\s+\[?([^\]\s]+)\]?(?:\s+-\s+(\d{4}-\d{2}-\d{2}))?/;
const UNRELEASED = /^(non publié|unreleased)$/i;

export function parseInline(text: string): TextPart[] {
  return text
    .split('`')
    .map((part, index) => ({ text: part, code: index % 2 === 1 }))
    .filter((part) => part.text.length > 0);
}

/** Lit un CHANGELOG.md au format Keep a Changelog. Les lignes non reconnues sont ignorées. */
export function parseChangelog(markdown: string): Release[] {
  const releases: Release[] = [];
  let release: Release | null = null;
  let group: ChangeGroup | null = null;

  for (const rawLine of markdown.split(/\r?\n/)) {
    const line = rawLine.trim();
    const heading = RELEASE_HEADING.exec(line);
    if (heading && !line.startsWith('###')) {
      const label = line.match(/^##\s+\[([^\]]+)\]/)?.[1] ?? heading[1];
      release = {
        version: UNRELEASED.test(label) ? null : label,
        date: heading[2] ?? null,
        groups: [],
      };
      releases.push(release);
      group = null;
    } else if (line.startsWith('### ') && release) {
      group = { type: TYPE_TITLES[line.slice(4).trim().toLowerCase()] ?? 'other', items: [] };
      release.groups.push(group);
    } else if (/^[-*]\s+/.test(line) && group) {
      group.items.push(parseInline(line.replace(/^[-*]\s+/, '')));
    }
  }

  return releases.filter((r) => r.groups.some((g) => g.items.length > 0));
}
