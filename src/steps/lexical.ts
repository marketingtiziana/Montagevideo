/**
 * lexical.ts — détection lexicale des fillers (étape 3).
 *
 * Un filler n'est retiré que s'il est isolé (entouré de pauses ou en tête/fin
 * de proposition). Les connecteurs "du coup"/"en fait" ne sont retirés que
 * répétés ou isolés : "en fait" porteur de sens dans une phrase construite
 * reste en place.
 */

import type { Word, CutCandidate } from '../types.ts';
import { CLEAN } from '../config.ts';

const ISO_GAP_S = 0.15; // pause qui marque l'isolement d'un filler

function norm(t: string): string {
  return t
    .toLowerCase()
    .replace(/[.,!?;:…"«»]/g, '')
    .trim();
}

const SINGLE = new Set<string>(CLEAN.fillers.filter((f) => !f.includes(' ')));
const MULTI: string[][] = CLEAN.fillers.filter((f) => f.includes(' ')).map((f) => f.split(' '));

function gapBefore(words: Word[], k: number): number {
  if (k <= 0) return Infinity;
  const a = words[k - 1]!.end, b = words[k]!.start;
  return a != null && b != null ? b - a : Infinity;
}
function gapAfter(words: Word[], k: number): number {
  if (k >= words.length - 1) return Infinity;
  const a = words[k]!.end, b = words[k + 1]!.start;
  return a != null && b != null ? b - a : Infinity;
}

export function detectLexicalCuts(words: Word[]): CutCandidate[] {
  const cuts: CutCandidate[] = [];
  const timed = (w: Word) => w.start != null && w.end != null;

  // Occurrences de chaque phrase multi-mot (pour la règle "répété").
  const multiCounts = new Map<string, number>();
  for (let k = 0; k < words.length; k++) {
    for (const phrase of MULTI) {
      const slice = words.slice(k, k + phrase.length).map((w) => norm(w.text));
      if (slice.length === phrase.length && slice.every((s, i) => s === phrase[i])) {
        const key = phrase.join(' ');
        multiCounts.set(key, (multiCounts.get(key) ?? 0) + 1);
      }
    }
  }

  for (let k = 0; k < words.length; k++) {
    const w = words[k]!;
    if (!timed(w)) continue;
    const t = norm(w.text);

    // Fillers mono-mot isolés.
    if (SINGLE.has(t)) {
      const isolated =
        k === 0 || k === words.length - 1 || gapBefore(words, k) > ISO_GAP_S || gapAfter(words, k) > ISO_GAP_S;
      // "voilà" : surtout en fin de proposition (suivi d'une pause / fin).
      const voilaOk = t !== 'voilà' || k === words.length - 1 || gapAfter(words, k) > ISO_GAP_S;
      if (isolated && voilaOk) {
        cuts.push({ start: w.start!, end: w.end!, source: 'lexical', reason: 'filler', confidence: 0.7 });
      }
      continue;
    }

    // Fillers multi-mots : retirés si répétés OU isolés des deux côtés.
    for (const phrase of MULTI) {
      const seg = words.slice(k, k + phrase.length);
      if (seg.length !== phrase.length) continue;
      if (!seg.every((x, i) => norm(x.text) === phrase[i]) || !seg.every(timed)) continue;
      const key = phrase.join(' ');
      const repeated = (multiCounts.get(key) ?? 0) >= 2;
      const isolated = gapBefore(words, k) > ISO_GAP_S && gapAfter(words, k + phrase.length - 1) > ISO_GAP_S;
      if (repeated || isolated) {
        cuts.push({
          start: seg[0]!.start!,
          end: seg[seg.length - 1]!.end!,
          source: 'lexical',
          reason: repeated ? 'repetition' : 'filler',
          confidence: 0.65,
        });
      }
    }
  }
  return cuts;
}
