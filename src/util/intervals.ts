/** intervals.ts — algèbre d'intervalles (secondes). */

import type { Interval } from '../types.ts';

/** Trie et fusionne les intervalles se chevauchant ou espacés de < gapS. */
export function mergeIntervals(list: Interval[], gapS = 0): Interval[] {
  if (list.length === 0) return [];
  const sorted = [...list].sort((a, b) => a.start - b.start);
  const out: Interval[] = [{ ...sorted[0]! }];
  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const last = out[out.length - 1]!;
    if (cur.start <= last.end + gapS) last.end = Math.max(last.end, cur.end);
    else out.push({ ...cur });
  }
  return out;
}

/** Vrai si a et b se chevauchent (bornes strictes). */
export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}

/** Complément de `cuts` dans [0, total] : les segments conservés. */
export function invert(cuts: Interval[], total: number): Interval[] {
  const merged = mergeIntervals(cuts);
  const keep: Interval[] = [];
  let cursor = 0;
  for (const c of merged) {
    const s = Math.max(0, c.start);
    if (s > cursor) keep.push({ start: cursor, end: Math.min(s, total) });
    cursor = Math.max(cursor, Math.min(c.end, total));
  }
  if (cursor < total) keep.push({ start: cursor, end: total });
  return keep.filter((k) => k.end > k.start);
}

/** Soustrait `holes` de chaque intervalle de `base`. */
export function subtract(base: Interval[], holes: Interval[]): Interval[] {
  const merged = mergeIntervals(holes);
  const out: Interval[] = [];
  for (const seg of base) {
    let pieces: Interval[] = [{ ...seg }];
    for (const h of merged) {
      const next: Interval[] = [];
      for (const p of pieces) {
        if (!overlaps(p, h)) {
          next.push(p);
          continue;
        }
        if (h.start > p.start) next.push({ start: p.start, end: h.start });
        if (h.end < p.end) next.push({ start: h.end, end: p.end });
      }
      pieces = next;
    }
    out.push(...pieces);
  }
  return out.filter((s) => s.end > s.start);
}

export function totalDuration(list: Interval[]): number {
  return list.reduce((acc, i) => acc + (i.end - i.start), 0);
}
