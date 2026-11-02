import { Pipe, PipeTransform } from '@angular/core';

/** Morceau de texte de la démo ; `kind` détermine le surlignage appliqué. */
export interface DemoSegment {
  text: string;
  kind?: 'keyword' | 'weak' | 'noise';
}

const KINDS = { k: 'keyword', w: 'weak', n: 'noise' } as const;

/**
 * Découpe un texte de l'illustration de l'accueil (clés `landing.demo.*`) en segments.
 * Les balises <k>mot-clé</k>, <w>phrase faible</w> et <n>caractères illisibles</n> marquent
 * les passages surlignés : chaque langue les place où sa grammaire le demande.
 */
export function demoSegments(text: string): DemoSegment[] {
  const segments: DemoSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(/<([kwn])>(.*?)<\/\1>/g)) {
    if (match.index > last) segments.push({ text: text.slice(last, match.index) });
    segments.push({ text: match[2], kind: KINDS[match[1] as keyof typeof KINDS] });
    last = match.index + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

@Pipe({ name: 'demoSegments' })
export class DemoSegmentsPipe implements PipeTransform {
  transform(text: string): DemoSegment[] {
    return demoSegments(text);
  }
}

/** Parties de l'illustration identiques dans toutes les langues (CV fictif, score). */
export const DEMO_NAME = 'Camille Martin';
export const DEMO_SCORE = 86;
/** Mots-clés de l'annonce fictive (clés `landing.demo.keywords.*`) : un métier que tout le monde connaît. */
export const DEMO_KEYWORDS = [
  { key: 'pastry', found: true },
  { key: 'sourdough', found: true },
  { key: 'hygiene', found: true },
  { key: 'license', found: false },
];
/** Puces du CV fictif, dans l'ordre (clés `landing.demo.bullets.*`). */
export const DEMO_BULLETS = ['production', 'opening', 'hygiene'] as const;
