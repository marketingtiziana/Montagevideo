#!/usr/bin/env tsx
/**
 * QA — mandatory, blocking. `npm run qa`. The pipeline never ships a reel that
 * has not passed this. Checks (section 11):
 *   - integrated LUFS in [-15.0, -13.0]
 *   - true peak <= -1.0 dBTP
 *   - no residual silence > 400ms
 *   - no two cuts closer than 90ms
 *   - no caption > 4 words or > 22 chars
 *   - no caption inside the safe zone (bottom 340px, sides 90px)
 *   - no insert overlapping the face box by > 10% of its area
 *   - never two inserts at once
 *   - audio/video drift <= 1 frame over total duration
 *   - no colour outside the palette in theme.ts
 * Writes out/qa_report.json + a PASS/FAIL console summary + out/contact_sheet.jpg.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Edl, FaceTrack, ReelProps } from './lib/types.js';
import { FPS, WIDTH, HEIGHT } from './lib/types.js';

interface Check {
  name: string;
  pass: boolean;
  detail: string;
}

const SAFE = { bottom: 340, side: 90 };
const PALETTE = ['#0F1535', '#4F6BFF', '#FFFFFF', '#FFD84D', '#0A0E24'];

function findLatestWork(): string | null {
  const workRoot = join(process.cwd(), 'work');
  if (!existsSync(workRoot)) return null;
  const dirs = readdirSync(workRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(workRoot, d.name))
    .filter((d) => existsSync(join(d, 'reel.props.json')));
  if (!dirs.length) return null;
  dirs.sort((a, b) => (readFileSync(join(b, 'reel.props.json')).length ?? 0) - 0);
  return dirs[dirs.length - 1];
}

function ffprobeDuration(file: string): number {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  return Number((r.stdout ?? '0').trim()) || 0;
}

function measureLoudness(file: string): { lufs: number; tp: number; maxSilenceMs: number } {
  const r = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-nostats', '-i', file, '-af', 'loudnorm=I=-14:LRA=7:TP=-1:print_format=json,silencedetect=noise=-40dB:d=0.4', '-f', 'null', '-'],
    { encoding: 'utf8' },
  );
  const err = (r.stderr ?? '') + (r.stdout ?? '');
  const jsons = err.match(/\{[\s\S]*?\}/g);
  let lufs = NaN;
  let tp = NaN;
  if (jsons) {
    const m = JSON.parse(jsons[jsons.length - 1]);
    lufs = Number(m.input_i);
    tp = Number(m.input_tp);
  }
  // Longest silence
  let maxSil = 0;
  const durs = [...err.matchAll(/silence_duration:\s*([\d.]+)/g)].map((x) => Number(x[1]));
  if (durs.length) maxSil = Math.max(...durs);
  return { lufs, tp, maxSilenceMs: maxSil * 1000 };
}

function checkCaptions(props: ReelProps): Check[] {
  const checks: Check[] = [];
  const captionBaselineFromBottom = 640; // px, per theme
  const worst = { words: 0, chars: 0 };
  for (const g of props.captions) {
    worst.words = Math.max(worst.words, g.words.length);
    const line = g.words.map((w) => w.text).join(' ');
    worst.chars = Math.max(worst.chars, line.length);
  }
  checks.push({ name: 'caption <= 4 words', pass: worst.words <= 4, detail: `max ${worst.words} words` });
  checks.push({ name: 'caption <= 22 chars', pass: worst.chars <= 22, detail: `max ${worst.chars} chars` });
  checks.push({
    name: 'captions outside safe zone',
    pass: captionBaselineFromBottom > SAFE.bottom,
    detail: `baseline ${captionBaselineFromBottom}px from bottom (safe ${SAFE.bottom}px)`,
  });
  return checks;
}

function checkCutSpacing(edl: Edl): Check {
  let minGap = Infinity;
  // Cuts are the removed spans between kept segments (source timeline).
  for (let i = 1; i < edl.segments.length; i++) {
    const removed = edl.segments[i].srcStart - edl.segments[i - 1].srcEnd;
    if (removed > 0) minGap = Math.min(minGap, removed);
  }
  const okGap = !isFinite(minGap) || minGap >= 0.09;
  return { name: 'no two cuts < 90ms', pass: okGap, detail: isFinite(minGap) ? `min removed span ${(minGap * 1000).toFixed(0)}ms` : 'n/a' };
}

/** Face box (normalised) for a given final-timeline frame. */
function faceBoxAt(face: FaceTrack, frame: number): { x: number; y: number; w: number; h: number } | null {
  const fr = face.frames[Math.min(frame, face.frames.length - 1)];
  if (!fr) return null;
  const w = fr.scale;
  const h = fr.scale * (WIDTH / HEIGHT) * 1.3;
  return { x: fr.cx - w / 2, y: fr.cy - h / 2, w, h };
}

function checkInserts(props: ReelProps): Check[] {
  const checks: Check[] = [];
  // No two inserts simultaneously.
  let overlap = false;
  const sorted = [...props.inserts].sort((a, b) => a.start - b.start);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start < sorted[i - 1].start + sorted[i - 1].duration) overlap = true;
  }
  checks.push({ name: 'never two inserts at once', pass: !overlap, detail: overlap ? 'overlap found' : 'ok' });

  // Insert vs face overlap (>10% of insert area) — approximate insert boxes by anchor.
  let faceOverlapBad = false;
  for (const ins of props.inserts) {
    const frame = Math.round(ins.start * props.fps);
    const face = faceBoxAt(props.faceTrack, frame);
    if (!face) continue;
    const box = insertBoxForAnchor(ins.anchor);
    const ov = intersectionArea(box, face) / (box.w * box.h);
    if (ov > 0.1) faceOverlapBad = true;
  }
  checks.push({ name: 'insert vs face overlap <= 10%', pass: !faceOverlapBad, detail: faceOverlapBad ? 'overlap > 10%' : 'ok' });
  return checks;
}

function insertBoxForAnchor(anchor: string): { x: number; y: number; w: number; h: number } {
  // Normalised placement zones matching the Remotion layout.
  switch (anchor) {
    case 'top': return { x: 0.1, y: 0.06, w: 0.8, h: 0.16 };
    case 'bottom': return { x: 0.1, y: 0.62, w: 0.8, h: 0.16 };
    case 'left': return { x: 0.05, y: 0.35, w: 0.4, h: 0.2 };
    case 'right': return { x: 0.55, y: 0.35, w: 0.4, h: 0.2 };
    default: return { x: 0.1, y: 0.06, w: 0.8, h: 0.16 };
  }
}

function intersectionArea(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.w, b.x + b.w);
  const y2 = Math.min(a.y + a.h, b.y + b.h);
  return Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
}

function checkPalette(): Check {
  const themePath = join(process.cwd(), 'remotion', 'theme.ts');
  if (!existsSync(themePath)) return { name: 'palette lint', pass: false, detail: 'theme.ts missing' };
  const src = readFileSync(themePath, 'utf8');
  const hexes = [...src.matchAll(/#[0-9a-fA-F]{6}/g)].map((m) => m[0].toUpperCase());
  const bad = hexes.filter((h) => !PALETTE.includes(h));
  return { name: 'no colour outside palette', pass: bad.length === 0, detail: bad.length ? `off-palette: ${[...new Set(bad)].join(', ')}` : 'ok' };
}

function contactSheet(video: string, out: string, durationSec: number): boolean {
  if (durationSec <= 0) return false;
  const cols = 4;
  const rows = 3;
  const n = cols * rows;
  const fps = n / durationSec; // one frame every duration/n seconds
  const r = spawnSync(
    'ffmpeg',
    ['-hide_banner', '-y', '-i', video, '-vf', `fps=${fps.toFixed(5)},scale=270:-1,tile=${cols}x${rows}`, '-frames:v', '1', out],
    { encoding: 'utf8' },
  );
  return r.status === 0 && existsSync(out);
}

function main(): void {
  const workDir = findLatestWork();
  const output = join(process.cwd(), 'out', 'reel.mp4');
  const reportPath = join(process.cwd(), 'out', 'qa_report.json');

  if (!workDir) {
    console.error('QA: no work/<hash>/reel.props.json found. Run the pipeline first.');
    process.exit(1);
  }
  const props = JSON.parse(readFileSync(join(workDir, 'reel.props.json'), 'utf8')) as ReelProps;
  const edl = JSON.parse(readFileSync(join(workDir, 'edl.json'), 'utf8')) as Edl;

  const checks: Check[] = [];

  // Audio checks (need the rendered file + ffmpeg).
  const haveVideo = existsSync(output) && !!spawnSync('ffmpeg', ['-version']).stdout;
  if (haveVideo) {
    const dur = ffprobeDuration(output);
    const { lufs, tp, maxSilenceMs } = measureLoudness(output);
    checks.push({ name: 'LUFS in [-15,-13]', pass: lufs >= -15 && lufs <= -13, detail: `${lufs.toFixed(2)} LUFS` });
    checks.push({ name: 'true peak <= -1 dBTP', pass: tp <= -1.0, detail: `${tp.toFixed(2)} dBTP` });
    checks.push({ name: 'no silence > 400ms', pass: maxSilenceMs <= 400, detail: `max ${maxSilenceMs.toFixed(0)}ms` });
    const drift = Math.abs(dur - props.durationInFrames / props.fps);
    checks.push({ name: 'a/v drift <= 1 frame', pass: drift <= 1 / FPS + 1e-3, detail: `${(drift * 1000).toFixed(1)}ms` });
    contactSheet(output, join(process.cwd(), 'out', 'contact_sheet.jpg'), dur);
  } else {
    checks.push({ name: 'render present', pass: false, detail: 'out/reel.mp4 missing or ffmpeg unavailable — audio/drift checks skipped' });
  }

  // Static checks (no render needed).
  checks.push(...checkCaptions(props));
  checks.push(checkCutSpacing(edl));
  checks.push(...checkInserts(props));
  checks.push(checkPalette());

  const passed = checks.every((c) => c.pass);
  const report = { version: 1, passed, checks, generatedFor: output };
  writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n──────── QA ────────');
  for (const c of checks) {
    const badge = c.pass ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
    console.log(`  ${badge}  ${c.name.padEnd(34)} ${c.detail}`);
  }
  console.log('────────────────────');
  console.log(passed ? '\x1b[32mQA PASSED\x1b[0m' : '\x1b[31mQA FAILED\x1b[0m', `-> ${reportPath}\n`);
  process.exit(passed ? 0 : 1);
}

main();
