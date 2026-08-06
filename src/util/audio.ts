/**
 * audio.ts — détection acoustique du silence (étape 3).
 *
 * Deux sous-détections combinées, conformément à la spec :
 *   1. ffmpeg silencedetect=noise=-34dB:d=0.28
 *   2. enveloppe RMS par fenêtre de 20 ms, seuil adaptatif = bruit de fond
 *      médian + 8 dB. Un segment est candidat s'il est sous seuil.
 * Le filtre "aucun mot ne le chevauche" est appliqué à la fusion (étape 3).
 */

import fs from 'node:fs';
import { run } from './exec.ts';
import type { Interval } from '../types.ts';

/** Lance ffmpeg silencedetect et parse les intervalles de silence. */
export async function silenceDetect(
  wav: string,
  noiseDb: number,
  minDurationS: number,
): Promise<Interval[]> {
  const { stderr } = await run(
    'ffmpeg',
    ['-hide_banner', '-i', wav, '-af', `silencedetect=noise=${noiseDb}dB:d=${minDurationS}`, '-f', 'null', '-'],
    { quiet: true, allowFail: true },
  );
  const intervals: Interval[] = [];
  let start: number | null = null;
  for (const line of stderr.split('\n')) {
    const s = line.match(/silence_start:\s*(-?[\d.]+)/);
    const e = line.match(/silence_end:\s*(-?[\d.]+)/);
    if (s) start = parseFloat(s[1]!);
    else if (e && start !== null) {
      intervals.push({ start, end: parseFloat(e[1]!) });
      start = null;
    }
  }
  return intervals;
}

/** Échantillons mono normalisés [-1,1] + fréquence, depuis un WAV PCM s24le/s16le. */
export function readWavMono(path: string): { samples: Float32Array; sampleRate: number } {
  const buf = fs.readFileSync(path);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') {
    throw new Error(`WAV invalide : ${path}`);
  }
  let sampleRate = 48000;
  let bits = 24;
  let channels = 1;
  let dataOffset = -1;
  let dataLen = 0;
  let off = 12;
  while (off + 8 <= buf.length) {
    const id = buf.toString('ascii', off, off + 4);
    const size = buf.readUInt32LE(off + 4);
    if (id === 'fmt ') {
      channels = buf.readUInt16LE(off + 10);
      sampleRate = buf.readUInt32LE(off + 12);
      bits = buf.readUInt16LE(off + 22);
    } else if (id === 'data') {
      dataOffset = off + 8;
      dataLen = size;
      break;
    }
    off += 8 + size + (size & 1);
  }
  if (dataOffset < 0) throw new Error(`Chunk data introuvable : ${path}`);

  const bytesPerSample = bits / 8;
  const frameBytes = bytesPerSample * channels;
  const n = Math.floor(dataLen / frameBytes);
  const out = new Float32Array(n);
  const norm = 1 / (2 ** (bits - 1));
  for (let i = 0; i < n; i++) {
    const base = dataOffset + i * frameBytes; // canal 0 uniquement (mono attendu)
    let v: number;
    if (bits === 24) {
      const b0 = buf[base]!, b1 = buf[base + 1]!, b2 = buf[base + 2]!;
      v = (b0 | (b1 << 8) | (b2 << 16));
      if (v & 0x800000) v -= 0x1000000; // signe 24 bits
    } else if (bits === 16) {
      v = buf.readInt16LE(base);
    } else {
      v = buf.readInt32LE(base);
    }
    out[i] = v * norm;
  }
  return { samples: out, sampleRate };
}

const EPS = 1e-9;
function toDb(rms: number): number {
  return 20 * Math.log10(rms + EPS);
}

/**
 * Déplace un instant `t` (s) vers le zero-crossing le plus proche dans une
 * fenêtre de ±`windowMs`. Renvoie `t` inchangé si aucun n'est trouvé.
 */
export function nearestZeroCrossing(
  samples: Float32Array,
  sampleRate: number,
  t: number,
  windowMs: number,
): number {
  const center = Math.round(t * sampleRate);
  const half = Math.round((windowMs / 1000) * sampleRate);
  const lo = Math.max(1, center - half);
  const hi = Math.min(samples.length - 1, center + half);
  let bestIdx = -1;
  let bestDist = Infinity;
  for (let i = lo; i <= hi; i++) {
    const a = samples[i - 1]!;
    const b = samples[i]!;
    if ((a <= 0 && b >= 0) || (a >= 0 && b <= 0)) {
      const dist = Math.abs(i - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
  }
  return bestIdx < 0 ? t : bestIdx / sampleRate;
}

/**
 * Détection par enveloppe RMS. Fenêtres de `windowMs`, seuil adaptatif =
 * médiane du bruit de fond + `marginDb`. Renvoie les intervalles sous seuil.
 */
export function rmsSilenceWindows(
  samples: Float32Array,
  sampleRate: number,
  windowMs: number,
  marginDb: number,
): { intervals: Interval[]; noiseFloorDb: number; thresholdDb: number } {
  const win = Math.max(1, Math.round((windowMs / 1000) * sampleRate));
  const nWin = Math.floor(samples.length / win);
  const db: number[] = new Array(nWin);
  for (let w = 0; w < nWin; w++) {
    let sum = 0;
    const base = w * win;
    for (let k = 0; k < win; k++) {
      const s = samples[base + k]!;
      sum += s * s;
    }
    db[w] = toDb(Math.sqrt(sum / win));
  }
  // Bruit de fond : estimé par un percentile bas (10e), robuste que
  // l'enregistrement soit dominé par la parole ou par le silence. La médiane
  // de TOUTES les fenêtres suivrait le niveau de parole, pas le fond.
  const sorted = [...db].sort((a, b) => a - b);
  const pct = (p: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))]! : -90);
  const noiseFloorDb = pct(0.1);
  const thresholdDb = noiseFloorDb + marginDb;

  const intervals: Interval[] = [];
  let runStart = -1;
  for (let w = 0; w < nWin; w++) {
    const below = db[w]! <= thresholdDb;
    if (below && runStart < 0) runStart = w;
    else if (!below && runStart >= 0) {
      intervals.push({ start: (runStart * win) / sampleRate, end: (w * win) / sampleRate });
      runStart = -1;
    }
  }
  if (runStart >= 0) intervals.push({ start: (runStart * win) / sampleRate, end: (nWin * win) / sampleRate });
  return { intervals, noiseFloorDb, thresholdDb };
}
