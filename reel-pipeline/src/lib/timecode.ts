/**
 * Time <-> frame conversions and snapping helpers. All cut points are snapped
 * to whole frames (1/FPS); the pipeline is frame-accurate by construction.
 */
import { FPS } from './types.js';

export function secToFrame(sec: number, fps = FPS): number {
  return Math.round(sec * fps);
}
export function frameToSec(frame: number, fps = FPS): number {
  return frame / fps;
}
/** Snap a second value to the nearest frame boundary. */
export function snapSec(sec: number, fps = FPS): number {
  return frameToSec(secToFrame(sec, fps), fps);
}
export function frames(ms: number, fps = FPS): number {
  return Math.round((ms / 1000) * fps);
}

/** Merge intervals that overlap or sit within `gapMs` of each other. */
export interface Interval {
  start: number;
  end: number;
}
export function mergeIntervals<T extends Interval>(items: T[], gapMs: number): T[] {
  if (items.length === 0) return [];
  const gap = gapMs / 1000;
  const sorted = [...items].sort((a, b) => a.start - b.start);
  const out: T[] = [{ ...sorted[0] }];
  for (let k = 1; k < sorted.length; k++) {
    const cur = sorted[k];
    const last = out[out.length - 1];
    if (cur.start <= last.end + gap) {
      last.end = Math.max(last.end, cur.end);
    } else {
      out.push({ ...cur });
    }
  }
  return out;
}

/** Subtract a set of intervals from [0, total] -> the kept spans. */
export function invertIntervals(cuts: Interval[], total: number): Interval[] {
  const merged = mergeIntervals(cuts.map((c) => ({ ...c })), 0);
  const kept: Interval[] = [];
  let cursor = 0;
  for (const c of merged) {
    const s = Math.max(0, c.start);
    if (s > cursor) kept.push({ start: cursor, end: s });
    cursor = Math.max(cursor, c.end);
  }
  if (cursor < total) kept.push({ start: cursor, end: total });
  return kept.filter((k) => k.end > k.start);
}

/** Format seconds as HH:MM:SS.mmm for ffmpeg / logs. */
export function fmtTc(sec: number): string {
  const ms = Math.round((sec % 1) * 1000);
  const s = Math.floor(sec) % 60;
  const m = Math.floor(sec / 60) % 60;
  const h = Math.floor(sec / 3600);
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  return `${p(h)}:${p(m)}:${p(s)}.${p(ms, 3)}`;
}
