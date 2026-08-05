/**
 * Step 4 — build the EDL. Encodes the non-negotiable cut rules (section 6):
 *
 *  1. Respiration: 180ms kept after a block's last word, 130ms before the next
 *     block's first word — two words are never butted together.
 *  2. Minimum cut duration 90ms; shorter cuts are dropped (audible artefact).
 *  3. Max tolerated silence 350ms; longer silences trimmed (respiration leaves
 *     ~310ms). Claude `silence_mort` cuts are removed entirely.
 *  4. Frame snapping (1/30s). (Audio zero-crossing nudge happens in step 5.)
 *  5. 18ms audio crossfade at every join (applied in step 5).
 *  6. J-cut: >1.2s removed between two blocks -> next audio leads video 4 frames.
 *  7. No more than 3 cuts per 2s window; least-confident dropped + warning.
 */
import type { RunContext } from '../lib/cache.js';
import { readArtifact, writeArtifact } from '../lib/cache.js';
import type { Analysis, Beat, Cut, Edl, InsertPlan, Probe, Segment, Transcript } from '../lib/types.js';
import { FPS } from '../lib/types.js';
import { secToFrame, frameToSec, snapSec, invertIntervals } from '../lib/timecode.js';
import { log, info, ok, warn } from '../lib/log.js';

const TAG = '04-build-edl';

const RESP_HEAD = 0.13; // 130ms before first word of a block
const RESP_TAIL = 0.18; // 180ms after last word of a block
const MIN_CUT = 0.09; // 90ms
const JCUT_THRESHOLD = 1.2; // s of removed material to trigger a J-cut
const JCUT_FRAMES = 4;
const MAX_CUTS_PER_WINDOW = 3;
const WINDOW = 2.0; // s

export async function stepBuildEdl(
  ctx: RunContext,
  probe: Probe,
  transcript: Transcript,
  analysis: Analysis,
): Promise<Edl> {
  const cached = readArtifact<Edl>(ctx, 'edl.json');
  if (cached) {
    info(TAG, 'cache hit, skipping (edl.json)');
    return cached;
  }
  const warnings: string[] = [];
  const total = probe.durationSec;

  // Rule 1+2+3: apply respiration trim, keep silence_mort full, drop tiny cuts.
  let cuts = trimForRespiration(analysis.cuts);

  // Rule 7: cap cut density.
  cuts = capCutDensity(cuts, warnings);

  // Rule 4: snap cut boundaries to frames.
  cuts = cuts
    .map((c) => ({ ...c, start: snapSec(c.start), end: snapSec(c.end) }))
    .filter((c) => c.end - c.start >= MIN_CUT)
    .sort((a, b) => a.start - b.start);

  // Kept spans = source minus cuts.
  let kept = invertIntervals(cuts, total).map((k) => ({
    start: snapSec(k.start),
    end: snapSec(k.end),
  }));
  kept = kept.filter((k) => k.end - k.start >= MIN_CUT);

  // Optional hard cap on final duration.
  kept = applyMaxDuration(kept, ctx.params.maxDuration, warnings);

  // Build segments with out-timeline positions + J-cuts.
  const segments = buildSegments(kept);

  // Remap beats/inserts from source time -> final time.
  const beats = remapBeats(analysis.beats, segments);
  const inserts = remapInserts(analysis.inserts, segments);

  const finalDuration = segments.length ? segments[segments.length - 1].outEnd : 0;
  const edl: Edl = {
    version: 1,
    fps: FPS,
    segments,
    beats,
    inserts,
    stats: {
      sourceDurationSec: total,
      finalDurationSec: finalDuration,
      compressionRatio: total > 0 ? finalDuration / total : 0,
      cutCount: cuts.length,
      warnings,
    },
  };
  writeArtifact(ctx, 'edl.json', edl);
  ok(TAG, `${segments.length} segments, ${cuts.length} cuts, ${finalDuration.toFixed(2)}s final (${(edl.stats.compressionRatio * 100).toFixed(0)}% kept)`);
  for (const w of warnings) warn(TAG, w);
  return edl;
}

/** Rule 1/2/3: leave respiration around each cut; drop cuts that become tiny. */
export function trimForRespiration(cuts: Cut[]): Cut[] {
  const out: Cut[] = [];
  for (const c of cuts) {
    const isDeadSilence = c.source === 'claude' && c.reason === 'silence_mort';
    if (isDeadSilence) {
      out.push({ ...c }); // removed entirely, no respiration retained
      continue;
    }
    const start = c.start + RESP_TAIL; // keep 180ms after previous word
    const end = c.end - RESP_HEAD; // keep 130ms before next word
    if (end - start >= MIN_CUT) out.push({ ...c, start, end });
    // else: too short after respiration -> not worth cutting.
  }
  return out.sort((a, b) => a.start - b.start);
}

/** Rule 7: at most 3 cuts starting within any 2s window; drop least confident. */
export function capCutDensity(cuts: Cut[], warnings: string[]): Cut[] {
  const sorted = [...cuts].sort((a, b) => a.start - b.start);
  const removed = new Set<number>();
  for (let i = 0; i < sorted.length; i++) {
    if (removed.has(i)) continue;
    const windowIdx = [i];
    for (let j = i + 1; j < sorted.length; j++) {
      if (removed.has(j)) continue;
      if (sorted[j].start - sorted[i].start <= WINDOW) windowIdx.push(j);
      else break;
    }
    if (windowIdx.length > MAX_CUTS_PER_WINDOW) {
      // keep the most confident MAX_CUTS_PER_WINDOW, drop the rest
      const ranked = windowIdx.sort((a, b) => sorted[b].confidence - sorted[a].confidence);
      for (const idx of ranked.slice(MAX_CUTS_PER_WINDOW)) removed.add(idx);
      warnings.push(
        `>${MAX_CUTS_PER_WINDOW} cuts within ${WINDOW}s near ${sorted[i].start.toFixed(2)}s — dropped ${windowIdx.length - MAX_CUTS_PER_WINDOW} least-confident to avoid a choppy feel`,
      );
    }
  }
  return sorted.filter((_, i) => !removed.has(i));
}

/** Truncate kept spans to fit a hard max duration, at a segment boundary. */
function applyMaxDuration(
  kept: Array<{ start: number; end: number }>,
  maxDuration: number | null,
  warnings: string[],
): Array<{ start: number; end: number }> {
  if (!maxDuration) return kept;
  const out: Array<{ start: number; end: number }> = [];
  let acc = 0;
  for (const k of kept) {
    const len = k.end - k.start;
    if (acc + len <= maxDuration) {
      out.push(k);
      acc += len;
    } else {
      const remaining = maxDuration - acc;
      if (remaining >= MIN_CUT) out.push({ start: k.start, end: snapSec(k.start + remaining) });
      warnings.push(`final capped at ${maxDuration}s (--max-duration) — trailing material dropped`);
      break;
    }
  }
  return out;
}

/** Assemble segments on the out-timeline and mark J-cuts. */
export function buildSegments(kept: Array<{ start: number; end: number }>): Segment[] {
  const segments: Segment[] = [];
  let outCursor = 0;
  for (let i = 0; i < kept.length; i++) {
    const k = kept[i];
    const len = k.end - k.start;
    const removedBefore = i > 0 ? k.start - kept[i - 1].end : 0;
    const jCut = removedBefore > JCUT_THRESHOLD ? JCUT_FRAMES : 0;
    const seg: Segment = {
      srcStart: k.start,
      srcEnd: k.end,
      srcStartFrame: secToFrame(k.start),
      srcEndFrame: secToFrame(k.end),
      outStart: snapSec(outCursor),
      outEnd: snapSec(outCursor + len),
      jCutFrames: jCut,
    };
    segments.push(seg);
    outCursor += len;
  }
  return segments;
}

/** Map a source-time value onto the final timeline (nearest kept boundary). */
export function srcToOut(t: number, segments: Segment[]): number | null {
  for (const s of segments) {
    if (t >= s.srcStart && t <= s.srcEnd) return s.outStart + (t - s.srcStart);
  }
  return null; // falls in removed material
}

function remapBeats(beats: Beat[], segments: Segment[]): Beat[] {
  const out: Beat[] = [];
  for (const b of beats) {
    const t = srcToOut(b.t, segments);
    if (t !== null) out.push({ t: snapSec(t), type: b.type });
  }
  return out.sort((a, b) => a.t - b.t);
}

function remapInserts(inserts: InsertPlan[], segments: Segment[]): InsertPlan[] {
  const out: InsertPlan[] = [];
  for (const ins of inserts) {
    const t = srcToOut(ins.start, segments);
    if (t !== null) out.push({ ...ins, start: snapSec(t) });
  }
  return dedupeInsertDensity(out.sort((a, b) => a.start - b.start));
}

/** Enforce >=1.5s spacing between inserts (10.4 rule 3). */
function dedupeInsertDensity(inserts: InsertPlan[]): InsertPlan[] {
  const out: InsertPlan[] = [];
  for (const ins of inserts) {
    const last = out[out.length - 1];
    if (last && ins.start - (last.start + last.duration) < 1.5) continue;
    out.push(ins);
  }
  return out;
}

export const CROSSFADE_MS = 18; // rule 5, used by step 5
export { FPS, frameToSec };
