/**
 * Acoustic (silencedetect + adaptive RMS) and lexical (French filler)
 * detectors used by step 03. These are two of the three sources of truth
 * (the third is Claude). Nothing here is ever used alone.
 */
import { ffmpeg } from './ffmpeg.js';
import type { Cut, Word } from './types.js';

/** ---- 5.1 acoustic ---- */

/** Parse `silencedetect` stderr into [start,end] silence intervals. */
export function parseSilenceDetect(stderr: string): Array<{ start: number; end: number }> {
  const out: Array<{ start: number; end: number }> = [];
  let curStart: number | null = null;
  for (const line of stderr.split('\n')) {
    const s = line.match(/silence_start:\s*([\d.]+)/);
    const e = line.match(/silence_end:\s*([\d.]+)/);
    if (s) curStart = parseFloat(s[1]);
    if (e && curStart !== null) {
      out.push({ start: curStart, end: parseFloat(e[1]) });
      curStart = null;
    }
  }
  return out;
}

/**
 * Run silencedetect at a fixed threshold. The fixed threshold alone fails on
 * noisy takes; the caller intersects this with the "no word overlaps" rule.
 */
export async function detectSilencesAcoustic(
  wav: string,
  noiseDb = -34,
  minDur = 0.3,
): Promise<Array<{ start: number; end: number }>> {
  const res = await ffmpeg(
    ['-i', wav, '-af', `silencedetect=noise=${noiseDb}dB:d=${minDur}`, '-f', 'null', '-'],
    '03-analyze',
  );
  return parseSilenceDetect(res.stderr);
}

/** True if any transcript word overlaps [start,end]. */
export function wordOverlaps(words: Word[], start: number, end: number): boolean {
  for (const w of words) {
    if (w.end <= start) continue;
    if (w.start >= end) break;
    return true;
  }
  return false;
}

/** Silence is a removal candidate only if no word overlaps it (5.1). */
export function acousticCuts(
  silences: Array<{ start: number; end: number }>,
  words: Word[],
): Cut[] {
  const sorted = [...words].sort((a, b) => a.start - b.start);
  return silences
    .filter((s) => !wordOverlaps(sorted, s.start, s.end))
    .map<Cut>((s) => ({
      start: s.start,
      end: s.end,
      reason: 'silence_mort',
      confidence: 0.4,
      source: 'acoustic',
    }));
}

/** ---- 5.2 lexical fillers ---- */

// Base French list with Whisper spelling variants (case-insensitive).
const SINGLE_FILLERS = new Set(
  [
    'euh', 'euhh', 'euhhh', 'heu', 'heuu', 'hum', 'hmm', 'hein',
    'bah', 'ben', 'genre', 'quoi',
  ].map((x) => x.toLowerCase()),
);
// Multi-word fillers only cut when isolated / repeated.
const PHRASE_FILLERS = [
  'du coup', 'en fait', 'tu vois', 'je veux dire', 'comment dire',
  'ouais ouais', 'bon bah', 'voilà voilà',
];

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:]/g, '')
    .trim();
}

/**
 * A filler is removed only if it is ISOLATED — surrounded by pauses or at the
 * start of a clause — so we never massacre the syntax. `en fait` carrying
 * meaning inside a built sentence is kept.
 */
export function lexicalCuts(words: Word[], gapSec = 0.25): Cut[] {
  const cuts: Cut[] = [];
  const w = words;
  for (let i = 0; i < w.length; i++) {
    const t = norm(w[i].text);
    if (!t) continue;

    // Single-token filler, isolated by pauses (or sentence start).
    if (SINGLE_FILLERS.has(t)) {
      const prevGap = i === 0 ? Infinity : w[i].start - w[i - 1].end;
      const nextGap = i === w.length - 1 ? Infinity : w[i + 1].start - w[i].end;
      const isolated = prevGap >= gapSec || nextGap >= gapSec;
      if (isolated) {
        cuts.push({
          start: w[i].start,
          end: w[i].end,
          reason: 'filler',
          confidence: 0.6 + (1 - w[i].score) * 0.3,
          text: w[i].text,
          source: 'lexical',
        });
      }
      continue;
    }

    // Two-word phrase fillers (isolated only).
    if (i + 1 < w.length) {
      const two = `${t} ${norm(w[i + 1].text)}`;
      if (PHRASE_FILLERS.includes(two)) {
        const prevGap = i === 0 ? Infinity : w[i].start - w[i - 1].end;
        const nextGap = i + 2 >= w.length ? Infinity : w[i + 2].start - w[i + 1].end;
        if (prevGap >= gapSec && nextGap >= gapSec) {
          cuts.push({
            start: w[i].start,
            end: w[i + 1].end,
            reason: 'filler',
            confidence: 0.55,
            text: two,
            source: 'lexical',
          });
          i++;
        }
      }
    }
  }
  return cuts;
}
