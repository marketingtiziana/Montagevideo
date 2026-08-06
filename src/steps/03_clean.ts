/**
 * Étape 3 — Nettoyage de la parole.
 * Trois détections combinées, jamais une seule :
 *   acoustique (silencedetect + enveloppe RMS, sans chevauchement de mot),
 *   lexicale (fillers isolés),
 *   éditoriale (Claude, optionnelle).
 * Fusion par priorité keep_overrides > claude > lexical > acoustique.
 * Intervalles fusionnés s'ils sont espacés de moins de 120 ms.
 * Claude renvoie aussi le plan des inserts. → work/editorial.json.
 */

import type { Step } from '../pipeline.ts';
import { FILES, CLEAN } from '../config.ts';
import type { Transcript, CutCandidate, Interval } from '../types.ts';
import { readJson, writeJson, exists } from '../util/fs.ts';
import { log } from '../util/log.ts';
import { silenceDetect, readWavMono, rmsSilenceWindows } from '../util/audio.ts';
import { mergeIntervals, overlaps, subtract } from '../util/intervals.ts';
import { detectLexicalCuts } from './lexical.ts';
import { getEditorialDecisions } from '../claude/editorial.ts';

const PRIORITY = { claude: 3, lexical: 2, acoustic: 1 } as const;

async function acousticCuts(wav: string, words: Transcript['words']): Promise<{
  cuts: CutCandidate[];
  noiseFloorDb: number;
  thresholdDb: number;
}> {
  const sd = await silenceDetect(wav, CLEAN.silencedetect.noiseDb, CLEAN.silencedetect.minDurationS);
  const { samples, sampleRate } = readWavMono(wav);
  const rms = rmsSilenceWindows(samples, sampleRate, CLEAN.rmsWindowMs, CLEAN.adaptiveMarginDb);
  const union = mergeIntervals([...sd, ...rms.intervals]);
  // "Un segment est candidat s'il est sous seuil ET qu'aucun mot ne le chevauche."
  const timedWords: Interval[] = words
    .filter((w) => w.start != null && w.end != null)
    .map((w) => ({ start: w.start!, end: w.end! }));
  // Réason 'silence' = silence toléré (clampé à 220 ms à l'étape 4), PAS
  // retiré. Seul Claude peut classer un silence en 'silence_mort' (retrait).
  const cuts = union
    .filter((iv) => !timedWords.some((w) => overlaps(iv, w)))
    .map<CutCandidate>((iv) => ({ ...iv, source: 'acoustic', reason: 'silence', confidence: 0.4 }));
  return { cuts, noiseFloorDb: rms.noiseFloorDb, thresholdDb: rms.thresholdDb };
}

/** Fusion : union des coupes, priorité au label le plus fort, gap < 120 ms. */
function fuse(all: CutCandidate[], keepOverrides: Interval[]): CutCandidate[] {
  const protectedOut = subtract(all.map((c) => ({ start: c.start, end: c.end })), keepOverrides);
  // On ré-attache le meilleur label à chaque morceau protégé.
  const labeled: CutCandidate[] = protectedOut.map((piece) => {
    const contributors = all.filter((c) => overlaps(c, piece) || (c.start <= piece.start && c.end >= piece.end));
    const best = contributors.sort((a, b) => PRIORITY[b.source] - PRIORITY[a.source] || b.confidence - a.confidence)[0];
    return {
      ...piece,
      source: best?.source ?? 'acoustic',
      reason: best?.reason ?? 'silence_mort',
      confidence: best?.confidence ?? 0.5,
    };
  });
  // Fusion des morceaux espacés de < mergeGap, en gardant le label prioritaire.
  const sorted = [...labeled].sort((a, b) => a.start - b.start);
  const gap = CLEAN.mergeGapMs / 1000;
  const out: CutCandidate[] = [];
  for (const c of sorted) {
    const last = out[out.length - 1];
    if (last && c.start <= last.end + gap) {
      last.end = Math.max(last.end, c.end);
      if (PRIORITY[c.source] > PRIORITY[last.source]) {
        last.source = c.source;
        last.reason = c.reason;
        last.confidence = c.confidence;
      }
    } else out.push({ ...c });
  }
  return out;
}

export const step03: Step = {
  id: '03',
  name: 'Nettoyage parole (acoustique + lexical + Claude) + plan inserts',
  version: 2,
  inputs: () => [FILES.transcript, FILES.sourceWav],
  outputs: () => [FILES.editorial],
  async run() {
    if (!exists(FILES.transcript)) throw new Error(`Transcript absent : ${FILES.transcript}`);
    const transcript = readJson<Transcript>(FILES.transcript);

    const ac = await acousticCuts(FILES.sourceWav, transcript.words);
    log.info(`Acoustique : ${ac.cuts.length} silences (bruit ${ac.noiseFloorDb.toFixed(1)} dB, seuil ${ac.thresholdDb.toFixed(1)} dB).`);

    const lex = detectLexicalCuts(transcript.words);
    log.info(`Lexical : ${lex.length} fillers isolés.`);

    const editorial = await getEditorialDecisions(transcript);
    const claudeCuts: CutCandidate[] = (editorial?.cuts ?? []).map((c) => ({
      start: c.start, end: c.end, source: 'claude', reason: c.reason, confidence: c.confidence,
    }));
    const keepOverrides: Interval[] = (editorial?.keep_overrides ?? []).map((k) => ({ start: k.start, end: k.end }));

    // Coupes de RETRAIT (claude + lexical), fusionnées par priorité, hors
    // keep_overrides. Les silences acoustiques restent séparés : ils sont
    // CLAMPÉS à l'étape 4 (250→220 ms), pas retirés.
    const removals = fuse([...claudeCuts, ...lex], keepOverrides);
    log.ok(`Fusion : ${removals.length} coupes de retrait (${claudeCuts.length} claude, ${lex.length} lexical ; ${keepOverrides.length} keep_overrides) + ${ac.cuts.length} silences.`);

    writeJson(FILES.editorial, {
      cuts: removals,
      silences: ac.cuts,
      keep_overrides: editorial?.keep_overrides ?? [],
      chapters: editorial?.chapters ?? [],
      inserts: editorial?.inserts ?? [],
      detection: {
        acoustic: ac.cuts.length,
        lexical: lex.length,
        claude: claudeCuts.length,
        noiseFloorDb: ac.noiseFloorDb,
        thresholdDb: ac.thresholdDb,
        claudeUsed: editorial !== null,
      },
    });
  },
};
