/**
 * Shared types for the whole pipeline. Each step reads/writes a versioned JSON
 * artifact in work/<hash>/; these interfaces are the contract between steps.
 */

export const FPS = 30 as const;
export const WIDTH = 1080 as const;
export const HEIGHT = 1920 as const;

/** Reason categories Claude is allowed to emit for a cut (section 5.3). */
export type CutReason =
  | 'filler'
  | 'faux_depart'
  | 'repetition'
  | 'bafouillage'
  | 'phrase_abandonnee'
  | 'silence_mort'
  | 'bruit_parasite'
  | 'hors_sujet';

/** ---- 01-probe ---- */
export interface Probe {
  version: 1;
  input: string;
  durationSec: number;
  fps: number;
  isVfr: boolean;
  width: number;
  height: number;
  vcodec: string;
  acodec: string;
  audioChannels: number;
  sampleRate: number;
  /** Normalised working files produced by the probe step. */
  workVideo: string; // work/source.mp4  (CFR 30, H.264 CRF16 / ProRes)
  workAudio: string; // work/source.wav  (48kHz, 24-bit)
}

/** ---- 02-transcribe ---- */
export interface Word {
  i: number;
  text: string;
  start: number;
  end: number;
  score: number;
}
export interface Transcript {
  version: 1;
  language: string;
  words: Word[];
}

/** ---- 03-analyze ---- */
export interface Cut {
  start: number;
  end: number;
  reason: CutReason;
  confidence: number;
  text?: string;
  /** which detector proposed it: acoustic | lexical | claude */
  source?: 'acoustic' | 'lexical' | 'claude';
}
export interface KeepOverride {
  start: number;
  end: number;
  reason: string;
}
export type BeatType = 'hook_end' | 'punchline' | 'chapter' | 'topic_change';
export interface Beat {
  t: number;
  type: BeatType;
}
export interface InsertPlan {
  start: number;
  duration: number;
  type: InsertType;
  props: Record<string, unknown>;
  anchor: 'top' | 'bottom' | 'left' | 'right';
  justification: string;
}
export type InsertType =
  | 'StatCard'
  | 'ComparisonBar'
  | 'LowerThird'
  | 'KeywordPop'
  | 'QuoteBlock'
  | 'ChecklistReveal'
  | 'TimelineBar'
  | 'Shape3D';

export interface Analysis {
  version: 1;
  cuts: Cut[];
  keep_overrides: KeepOverride[];
  beats: Beat[];
  inserts: InsertPlan[];
}

/** ---- 04-build-edl ---- */
export interface Segment {
  /** Kept span in the SOURCE timeline. */
  srcStart: number;
  srcEnd: number;
  srcStartFrame: number;
  srcEndFrame: number;
  /** Where it lands in the FINAL timeline (after all previous kept segments). */
  outStart: number;
  outEnd: number;
  /** J-cut: audio of this segment leads video by this many frames. */
  jCutFrames: number;
}
export interface EdlStats {
  sourceDurationSec: number;
  finalDurationSec: number;
  compressionRatio: number;
  cutCount: number;
  warnings: string[];
}
export interface Edl {
  version: 1;
  fps: number;
  segments: Segment[];
  /** Beats + inserts remapped onto the FINAL timeline (source time removed). */
  beats: Beat[];
  inserts: InsertPlan[];
  stats: EdlStats;
}

/** ---- 06-audio-master ---- */
export interface AudioReport {
  version: 1;
  inputLufs: number;
  outputLufs: number;
  inputTruePeak: number;
  outputTruePeak: number;
  lra: number;
  roomTone: boolean;
}

/** ---- 07-face-track ---- */
export interface FacePoint {
  f: number; // frame index in the FINAL (cut) timeline
  cx: number; // normalised centre x [0..1]
  cy: number; // normalised centre y [0..1]
  scale: number; // normalised box width [0..1]
  valid: boolean;
}
export interface FaceTrack {
  version: 1;
  frames: FacePoint[];
  frozenIntervals: Array<{ from: number; to: number }>;
}

/** Props handed to the Remotion composition (single source of truth). */
export interface ReelProps {
  videoSrc: string;
  audioSrc: string;
  fps: number;
  width: number;
  height: number;
  durationInFrames: number;
  captions: CaptionGroup[];
  faceTrack: FaceTrack;
  beats: Beat[];
  inserts: InsertPlan[];
  transitions: TransitionCue[];
}
export interface CaptionGroup {
  start: number; // final-timeline seconds
  end: number;
  words: Array<{ text: string; start: number; end: number; accent: boolean }>;
}
export interface TransitionCue {
  t: number; // final-timeline seconds, at the join
  kind: 'zoom_punch' | 'whip_pan' | 'geo_mask';
  removedSec: number; // how much source material was removed at this join
}
