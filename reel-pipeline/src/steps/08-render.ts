/**
 * Step 8 — Remotion composition & render.
 *
 * Assembles the ReelProps (captions remapped to the FINAL timeline, transition
 * cues derived from EDL joins, face track, beats, inserts) into
 * work/<hash>/reel.props.json, then invokes the Remotion CLI to render
 * out/reel.mp4 at 1080x1920 / 30fps. Order of composition (10.x): framing ->
 * captions -> transitions -> inserts.
 */
import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import type { RunContext } from '../lib/cache.js';
import { readArtifact, writeArtifact } from '../lib/cache.js';
import type {
  AudioReport, Beat, CaptionGroup, Edl, FaceTrack, Probe, ReelProps, TransitionCue, Transcript,
} from '../lib/types.js';
import { FPS, WIDTH, HEIGHT } from '../lib/types.js';
import { srcToOut } from './04-build-edl.js';
import { snapSec, secToFrame } from '../lib/timecode.js';
import { log, info, ok, warn, logCmd } from '../lib/log.js';

const TAG = '08-render';

interface RenderResult {
  version: 1;
  output: string;
  durationInFrames: number;
}

export interface RenderInputs {
  probe: Probe;
  edl: Edl;
  transcript: Transcript;
  audio: AudioReport;
  face: FaceTrack;
}

export async function stepRender(ctx: RunContext, inputs: RenderInputs): Promise<string> {
  const { edl, transcript, face } = inputs;
  const output = join(ctx.outDir, 'reel.mp4');

  const cachedR = readArtifact<RenderResult>(ctx, 'render.json');
  if (cachedR && existsSync(output)) {
    info(TAG, 'cache hit, skipping (render.json)');
    return output;
  }

  const cut = readArtifact<{ video: string }>(ctx, 'cut.json');
  const master = join(ctx.workDir, 'audio_master.wav');
  if (!cut) throw new Error(`${TAG}: cut.json missing`);

  const captions = buildCaptions(transcript, edl);
  const transitions = buildTransitions(edl);
  const durationInFrames = Math.max(1, secToFrame(edl.stats.finalDurationSec));

  const props: ReelProps = {
    videoSrc: cut.video,
    audioSrc: master,
    fps: FPS,
    width: WIDTH,
    height: HEIGHT,
    durationInFrames,
    captions,
    faceTrack: face,
    beats: edl.beats,
    inserts: edl.inserts,
    transitions,
  };

  const propsPath = join(ctx.workDir, 'reel.props.json');
  writeArtifact(ctx, 'reel.props.json', props);
  info(TAG, `props: ${captions.length} caption groups, ${transitions.length} transitions, ${edl.inserts.length} inserts`);

  log(TAG, `rendering ${WIDTH}x${HEIGHT}@${FPS} (${durationInFrames} frames)`);
  await renderRemotion(propsPath, output);

  writeArtifact(ctx, 'render.json', { version: 1, output, durationInFrames } satisfies RenderResult);
  ok(TAG, `-> ${output}`);
  return output;
}

/** Remotion CLI render. Props are passed via --props (a file path). */
function renderRemotion(propsPath: string, output: string): Promise<void> {
  const entry = join(process.cwd(), 'remotion', 'Root.tsx');
  const argv = ['remotion', 'render', entry, 'Reel', output, `--props=${propsPath}`, '--codec=h264', '--crf=18'];
  logCmd(TAG, ['npx', ...argv]);
  return new Promise((resolve, reject) => {
    const p = spawn('npx', argv, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`remotion render exited ${code}`))));
  });
}

/**
 * Remap words to the final timeline and group them: 2–4 words, <=22 chars,
 * one line. One accent word per group (longest, >=5 chars).
 */
export function buildCaptions(transcript: Transcript, edl: Edl): CaptionGroup[] {
  const remapped = transcript.words
    .map((w) => {
      const s = srcToOut(w.start, edl.segments);
      const e = srcToOut(w.end, edl.segments);
      if (s === null || e === null) return null;
      return { text: displayText(w.text), start: snapSec(s), end: snapSec(e) };
    })
    .filter((w): w is { text: string; start: number; end: number } => !!w && w.text.length > 0)
    .sort((a, b) => a.start - b.start);

  const groups: CaptionGroup[] = [];
  let cur: Array<{ text: string; start: number; end: number }> = [];
  const flush = () => {
    if (!cur.length) return;
    const accentIdx = pickAccent(cur.map((c) => c.text));
    groups.push({
      start: cur[0].start,
      end: cur[cur.length - 1].end,
      words: cur.map((c, i) => ({ text: c.text, start: c.start, end: c.end, accent: i === accentIdx })),
    });
    cur = [];
  };

  for (const w of remapped) {
    const tentative = [...cur, w];
    const chars = tentative.map((c) => c.text).join(' ').length;
    const gapToPrev = cur.length ? w.start - cur[cur.length - 1].end : 0;
    if (cur.length >= 4 || chars > 22 || gapToPrev > 0.6) flush();
    cur.push(w);
    if (cur.length >= 2 && cur.map((c) => c.text).join(' ').length >= 18) flush();
  }
  flush();
  return groups;
}

/** Strip trailing punctuation except ? and ! (10.3). */
export function displayText(raw: string): string {
  return raw.replace(/[.,;:]+$/g, '').trim();
}

/** Accent the longest word (>=5 chars) in a group, or none. */
function pickAccent(words: string[]): number {
  let best = -1;
  let bestLen = 4;
  words.forEach((w, i) => {
    const len = w.replace(/[^\p{L}\p{N}]/gu, '').length;
    if (len > bestLen) {
      bestLen = len;
      best = i;
    }
  });
  return best;
}

/** Transition cues from EDL joins (>1.5s removed) mapped by nearby beat type. */
export function buildTransitions(edl: Edl): TransitionCue[] {
  const cues: TransitionCue[] = [];
  let geoMaskCount = 0;
  for (let i = 1; i < edl.segments.length; i++) {
    const removed = edl.segments[i].srcStart - edl.segments[i - 1].srcEnd;
    if (removed <= 1.5) continue; // micro-cut -> dry cut, no transition
    const t = edl.segments[i].outStart;
    const beat = nearestBeat(edl.beats, t, 0.4);
    let kind: TransitionCue['kind'] = 'zoom_punch';
    if (beat?.type === 'chapter' && geoMaskCount < 2) {
      kind = 'geo_mask';
      geoMaskCount++;
    } else if (beat?.type === 'topic_change') {
      kind = 'whip_pan';
    }
    cues.push({ t, kind, removedSec: removed });
  }
  return cues;
}

function nearestBeat(beats: Beat[], t: number, tol: number): Beat | null {
  let best: Beat | null = null;
  let bestD = tol;
  for (const b of beats) {
    const d = Math.abs(b.t - t);
    if (d <= bestD) {
      bestD = d;
      best = b;
    }
  }
  return best;
}
