/** types.ts — types partagés du pipeline. */

/** Un mot de la transcription WhisperX. */
export interface Word {
  i: number;
  text: string;
  start: number | null;
  end: number | null;
  score: number | null;
}

export interface Transcript {
  language: string;
  model: string;
  aligned: boolean;
  words: Word[];
  segments: Array<{ start: number | null; end: number | null; text: string }>;
}

/** Intervalle temporel générique (secondes). */
export interface Interval {
  start: number;
  end: number;
}

/** Intervalle candidat à la coupe, avec provenance et confiance. */
export interface CutCandidate extends Interval {
  source: 'acoustic' | 'lexical' | 'claude';
  reason: string;
  confidence: number;
}

/** Segment conservé de l'EDL (source → sortie). */
export interface EdlSegment {
  /** Bornes dans la source normalisée (secondes). */
  srcStart: number;
  srcEnd: number;
  /** Bornes en frames (à 30 fps). */
  srcStartFrame: number;
  srcEndFrame: number;
  /** Bornes cumulées dans la sortie (secondes). */
  outStart: number;
  outEnd: number;
}

export interface EdlStats {
  sourceDurationS: number;
  finalDurationS: number;
  compressionRatio: number;
  cutCount: number;
  segmentCount: number;
  warnings: string[];
}

export interface Edl {
  fps: number;
  crossfadeMs: number;
  segments: EdlSegment[];
  stats: EdlStats;
}
