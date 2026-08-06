/**
 * Étape 4 — EDL. Règles calées sur la référence :
 *  - respiration : 130 ms avant le 1er mot d'un bloc, 180 ms après le dernier ;
 *  - coupe minimale 90 ms (en dessous on ne coupe pas) ;
 *  - silence max toléré 250 ms → ramené à 220 ms (sauf silence_mort) ;
 *  - points arrondis à la frame, point audio au zero-crossing (±8 ms) ;
 *  - crossfade audio 18 ms sur chaque jointure ;
 *  - max 3 coupes / 2 s (au-delà : la plus confiante, warning).
 * → work/edl.json (segments frames + secondes + stats).
 */

import type { Step } from '../pipeline.ts';
import { FILES, EDL, OUTPUT } from '../config.ts';
import type { Transcript, CutCandidate, Interval, Edl, EdlSegment } from '../types.ts';
import { readJson, writeJson, exists } from '../util/fs.ts';
import { log } from '../util/log.ts';
import { readWavMono, nearestZeroCrossing } from '../util/audio.ts';
import { ffprobe } from '../util/ffmpeg.ts';
import { invert, subtract } from '../util/intervals.ts';

const FPS = OUTPUT.fps;
const toFrame = (t: number) => Math.round(t * FPS);
const frameToS = (f: number) => f / FPS;
const snapFrame = (t: number) => frameToS(toFrame(t));

/** Densité max : 3 coupes / 2 s ; au-delà, garder les plus confiantes. */
function limitDensity(cuts: CutCandidate[], warnings: string[]): CutCandidate[] {
  const sorted = [...cuts].sort((a, b) => a.start - b.start);
  const win = EDL.maxCutsWindowS;
  const keep = new Set<CutCandidate>(sorted);
  for (let i = 0; i < sorted.length; i++) {
    const window = sorted.filter((c) => c.start >= sorted[i]!.start && c.start < sorted[i]!.start + win);
    if (window.length > EDL.maxCutsPerWindow) {
      const ranked = [...window].sort((a, b) => b.confidence - a.confidence);
      for (const drop of ranked.slice(EDL.maxCutsPerWindow)) keep.delete(drop);
      warnings.push(
        `>${EDL.maxCutsPerWindow} coupes dans ${win}s autour de ${sorted[i]!.start.toFixed(2)}s : ` +
          `gardé les ${EDL.maxCutsPerWindow} plus confiantes.`,
      );
    }
  }
  return sorted.filter((c) => keep.has(c));
}

export const step04: Step = {
  id: '04',
  name: 'EDL (respiration, zero-crossing, crossfade 18 ms, stats)',
  version: 2,
  inputs: () => [FILES.editorial, FILES.transcript],
  outputs: () => [FILES.edl],
  async run() {
    if (!exists(FILES.editorial)) throw new Error(`editorial.json absent : ${FILES.editorial}`);
    const editorial = readJson<{ cuts: CutCandidate[]; silences?: Interval[] }>(FILES.editorial);
    const silences = editorial.silences ?? [];
    const transcript = readJson<Transcript>(FILES.transcript);
    const words = transcript.words.filter((w) => w.start != null && w.end != null);

    // Durée source (normalisé si présent, sinon dernier mot).
    let total = 0;
    if (exists(FILES.normalizedMp4)) total = (await ffprobe(FILES.normalizedMp4)).durationS;
    if (!total) total = Math.max(...words.map((w) => w.end!), 0);

    const warnings: string[] = [];

    // 1) Coupe minimale + densité.
    const minCutS = EDL.minCutMs / 1000;
    let cuts = editorial.cuts.filter((c) => c.end - c.start >= minCutS);
    const droppedShort = editorial.cuts.length - cuts.length;
    if (droppedShort > 0) warnings.push(`${droppedShort} coupe(s) < ${EDL.minCutMs} ms ignorée(s).`);
    cuts = limitDensity(cuts, warnings);

    // 2) Segments conservés bruts.
    const kept = invert(cuts.map((c) => ({ start: c.start, end: c.end })), total);

    // 3) Respiration + clamp des silences internes → sous-segments.
    const breathBefore = EDL.breathBeforeMs / 1000;
    const breathAfter = EDL.breathAfterMs / 1000;
    const maxSil = EDL.maxSilenceMs / 1000;
    const targetSil = EDL.maxSilenceTargetMs / 1000;

    const raw: Interval[] = [];
    for (const seg of kept) {
      const inWords = words.filter((w) => w.end! > seg.start && w.start! < seg.end);
      if (inWords.length === 0) {
        // Bloc sans mot (pause) : conserver, clampé à la tolérance.
        const len = seg.end - seg.start;
        raw.push({ start: seg.start, end: seg.start + Math.min(len, targetSil) });
        continue;
      }
      const first = inWords[0]!;
      const last = inWords[inWords.length - 1]!;
      // Respiration : 130 ms avant le 1er mot, 180 ms après le dernier.
      const s = Math.max(seg.start, first.start! - breathBefore);
      const e = Math.min(seg.end, last.end! + breathAfter);

      // Trous à retirer = excédent de silence au-delà de 220 ms, provenant :
      //  - des silences acoustiques (mesure -34 dB) restreints au segment,
      //  - des intervalles inter-mots > 250 ms.
      const holes: Interval[] = [];
      for (const sil of silences) {
        const a = Math.max(sil.start, s);
        const b = Math.min(sil.end, e);
        if (b - a > maxSil) holes.push({ start: a + targetSil, end: b });
      }
      for (let i = 0; i < inWords.length - 1; i++) {
        const gS = inWords[i]!.end!;
        const gE = inWords[i + 1]!.start!;
        if (gE - gS > maxSil) holes.push({ start: gS + targetSil, end: gE });
      }
      raw.push(...subtract([{ start: s, end: e }], holes));
    }

    // 4) Snap frame (vidéo) + zero-crossing (audio).
    const { samples, sampleRate } = exists(FILES.sourceWav)
      ? readWavMono(FILES.sourceWav)
      : { samples: new Float32Array(0), sampleRate: 48000 };
    const zc = (t: number) =>
      samples.length ? nearestZeroCrossing(samples, sampleRate, snapFrame(t), EDL.zeroCrossWindowMs) : snapFrame(t);

    let outCursor = 0;
    const segments: EdlSegment[] = [];
    for (const iv of raw) {
      const srcStart = snapFrame(iv.start);
      const srcEnd = snapFrame(iv.end);
      if (srcEnd - srcStart < 1 / FPS) continue; // segment nul après arrondi
      const dur = srcEnd - srcStart;
      const seg: EdlSegment = {
        srcStart,
        srcEnd,
        srcStartFrame: toFrame(srcStart),
        srcEndFrame: toFrame(srcEnd),
        outStart: outCursor,
        outEnd: outCursor + dur,
      };
      // Points audio au zero-crossing (métadonnée pour la découpe).
      (seg as EdlSegment & { audioStart: number; audioEnd: number }).audioStart = zc(iv.start);
      (seg as EdlSegment & { audioStart: number; audioEnd: number }).audioEnd = zc(iv.end);
      segments.push(seg);
      outCursor += dur;
    }

    const finalDuration = outCursor;
    const edl: Edl = {
      fps: FPS,
      crossfadeMs: EDL.crossfadeMs,
      segments,
      stats: {
        sourceDurationS: total,
        finalDurationS: finalDuration,
        compressionRatio: total > 0 ? finalDuration / total : 1,
        cutCount: cuts.length,
        segmentCount: segments.length,
        warnings,
      },
    };
    writeJson(FILES.edl, edl);

    log.ok(
      `EDL : ${segments.length} segments, ${cuts.length} coupes. ` +
        `Source ${total.toFixed(2)}s → ${finalDuration.toFixed(2)}s ` +
        `(${(edl.stats.compressionRatio * 100).toFixed(0)}%).`,
    );
    for (const w of warnings) log.warn(w);
  },
};
