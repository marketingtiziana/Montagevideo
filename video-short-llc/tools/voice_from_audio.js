#!/usr/bin/env node
/**
 * tools/voice_from_audio.js — Construit voice.mp3 + timestamps.json à partir de
 * segments audio DÉJÀ générés (work/voice_raw_NN.mp3), pour les moteurs TTS qui
 * ne renvoient PAS de timestamps mot à mot (Higgsfield, et la plupart des autres).
 *
 * 01_voice.js reste la voie de référence : ElevenLabs `/with-timestamps` fournit
 * un alignement réel. Ici on l'ESTIME, avec trois précautions :
 *
 *  1. Post-traitement : les silences internes sont plafonnés et la voix est
 *     accélérée (`atempo`, hauteur préservée) pour atteindre la durée visée.
 *  2. Ancrage sur les silences : `silencedetect` découpe chaque segment en
 *     "plages de parole" réelles. Les mots sont répartis dans ces plages, jamais
 *     au travers d'un silence — la dérive reste bornée à une plage, au lieu de
 *     s'accumuler sur tout le segment.
 *  3. Poids des nombres : « 25 000 » se prononce « vingt-cinq mille ». Le poids
 *     d'un mot est calculé sur sa forme PRONONCÉE, sinon les segments chiffrés
 *     défilent trop vite.
 *
 * ⚠️ Cela reste une ESTIMATION : sur une plage de parole longue et sans pause,
 *    le mot surligné peut dériver de quelques dixièmes de seconde.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  ROOT, dir, ensureDirs, loadScript, loadConfig, writeJson,
  log, runFfmpeg, probeDuration, fmtDuration, ffmpegPath,
} from '../lib/util.js';

const execFileAsync = promisify(execFile);

const TEMPO = parseFloat(process.env.VOICE_TEMPO || '1.35');
const MAX_SILENCE = parseFloat(process.env.VOICE_MAX_SILENCE || '0.32');
const SILENCE_DB = '-40dB';

/* ---------- nombres français (pour le POIDS, pas pour l'affichage) ---------- */

const UNITS = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf'];
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante', 'quatre-vingt', 'quatre-vingt'];

function below100(n) {
  if (n < 20) return UNITS[n];
  const t = Math.floor(n / 10);
  const u = n % 10;
  if (t === 7 || t === 9) return `${TENS[t]}-${UNITS[10 + u]}`;
  return u ? `${TENS[t]}-${UNITS[u]}` : TENS[t];
}

function below1000(n) {
  const h = Math.floor(n / 100);
  const r = n % 100;
  const head = h === 0 ? '' : h === 1 ? 'cent' : `${UNITS[h]} cent`;
  return [head, r ? below100(r) : ''].filter(Boolean).join(' ');
}

/** Forme prononcée approximative d'un entier (0 … 999 999). */
function spellFr(n) {
  if (n === 0) return UNITS[0];
  if (n < 1000) return below1000(n);
  const th = Math.floor(n / 1000);
  const r = n % 1000;
  const head = th === 1 ? 'mille' : `${below1000(th)} mille`;
  return [head, r ? below1000(r) : ''].filter(Boolean).join(' ');
}

/** Longueur "prononcée" d'un mot : les chiffres comptent pour leur forme parlée. */
function spokenLength(word) {
  const spoken = word
    .replace(/(\d[\d\s  ]*\d|\d)/g, (m) => {
      const n = parseInt(m.replace(/[\s  ]/g, ''), 10);
      return Number.isFinite(n) && n < 1_000_000 ? spellFr(n) : m;
    })
    .replace(/%/g, ' pour cent')
    .replace(/[^\p{L}\p{N}]/gu, '');
  return Math.max(1, spoken.length);
}

/* ---------- détection des plages de parole ---------- */

async function speechRuns(file, duration) {
  const bin = await ffmpegPath();
  let stderr = '';
  try {
    await execFileAsync(bin, ['-hide_banner', '-i', file, '-af',
      `silencedetect=n=${SILENCE_DB}:d=0.18`, '-f', 'null', '-'], { maxBuffer: 32 * 1024 * 1024 });
  } catch (err) {
    stderr = err.stderr || '';
  }
  // ffmpeg écrit silencedetect sur stderr et sort en 0 : on relit dans les deux cas.
  if (!stderr) {
    const r = await execFileAsync(bin, ['-hide_banner', '-i', file, '-af',
      `silencedetect=n=${SILENCE_DB}:d=0.18`, '-f', 'null', '-'],
      { maxBuffer: 32 * 1024 * 1024 }).catch((e) => e);
    stderr = r.stderr || '';
  }

  const silences = [];
  const startRe = /silence_start:\s*([0-9.]+)/g;
  const endRe = /silence_end:\s*([0-9.]+)/g;
  const starts = [...stderr.matchAll(startRe)].map((m) => parseFloat(m[1]));
  const ends = [...stderr.matchAll(endRe)].map((m) => parseFloat(m[1]));
  for (let i = 0; i < starts.length; i++) {
    silences.push({ start: starts[i], end: ends[i] ?? duration });
  }

  const runs = [];
  let cursor = 0;
  for (const s of silences) {
    if (s.start > cursor + 0.05) runs.push({ start: cursor, end: Math.min(s.start, duration) });
    cursor = Math.max(cursor, s.end);
  }
  if (cursor < duration - 0.05) runs.push({ start: cursor, end: duration });
  return runs.length ? runs : [{ start: 0, end: duration }];
}

/* ---------- répartition des mots dans les plages ---------- */

function distribute(text, runs) {
  const tokens = text.split(/\s+/).filter(Boolean);

  const merged = [];
  for (const tok of tokens) {
    const prev = merged[merged.length - 1];
    // Ponctuation isolée rattachée au mot précédent (le français espace avant « : ; ! ? »).
    if (!/[\p{L}\p{N}]/u.test(tok) && merged.length) {
      merged[merged.length - 1] += ` ${tok}`;
      continue;
    }
    // Séparateur de milliers : « 25 000 » est UN nombre, pas « 25 » puis « 000 »
    // (sinon « 000 » serait pesé comme « zéro » au lieu de « mille », et le
    // karaoké surlignerait les deux moitiés séparément).
    if (merged.length && /^\d{3}$/.test(tok) && /\d$/.test(prev)) {
      merged[merged.length - 1] += ` ${tok}`;
      continue;
    }
    merged.push(tok);
  }

  const weights = merged.map(spokenLength);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const speechTotal = runs.reduce((a, r) => a + (r.end - r.start), 0);

  // Position d'un point de la timeline "parole seule" sur la timeline réelle.
  const toReal = (speechTime) => {
    let acc = 0;
    for (const r of runs) {
      const d = r.end - r.start;
      if (speechTime <= acc + d) return r.start + (speechTime - acc);
      acc += d;
    }
    return runs[runs.length - 1].end;
  };

  const words = [];
  let acc = 0;
  for (let i = 0; i < merged.length; i++) {
    const startSpeech = (acc / totalWeight) * speechTotal;
    acc += weights[i];
    const endSpeech = (acc / totalWeight) * speechTotal;
    words.push({ word: merged[i], start: toReal(startSpeech), end: toReal(endSpeech) });
  }
  return words;
}

/* ---------- pipeline ---------- */

async function processSegment(id, cfg) {
  const raw = path.join(dir.work, `voice_raw_${String(id).padStart(2, '0')}.mp3`);
  const out = path.join(dir.work, `voice_seg_${String(id).padStart(2, '0')}.mp3`);
  if (!fs.existsSync(raw)) throw new Error(`Segment brut manquant : ${path.relative(ROOT, raw)}`);

  // Plafonne les silences internes, puis accélère (atempo préserve la hauteur).
  const filters = [
    `silenceremove=stop_periods=-1:stop_duration=${MAX_SILENCE}:stop_threshold=${SILENCE_DB}`,
    `atempo=${TEMPO.toFixed(3)}`,
    `aresample=${cfg.audio.sampleRate}`,
  ].join(',');

  await runFfmpeg([
    '-i', raw, '-af', filters,
    '-c:a', 'libmp3lame', '-b:a', cfg.audio.bitrate, '-ar', String(cfg.audio.sampleRate),
    out,
  ]);
  return out;
}

async function main() {
  ensureDirs();
  const script = loadScript();
  const cfg = loadConfig();
  const gap = cfg.voice.segmentGapSeconds || 0;

  log.step(`Voix depuis audio pré-généré — tempo ×${TEMPO}, silences ≤ ${MAX_SILENCE}s`);

  const built = [];
  for (const seg of script.segments) {
    const file = await processSegment(seg.id, cfg);
    const duration = await probeDuration(file);
    const runs = await speechRuns(file, duration);
    const words = distribute(seg.text, runs);
    built.push({ seg, file, duration, words, runs });
    log.ok(`segment ${seg.id} — ${fmtDuration(duration)}, ${words.length} mots, ${runs.length} plage(s) de parole`);
  }

  // Concaténation identique à 01_voice.js.
  const inputs = [];
  const filters = [];
  let n = 0;
  for (let i = 0; i < built.length; i++) {
    inputs.push('-i', built[i].file);
    filters.push(`[${n}:a]aresample=${cfg.audio.sampleRate}[a${n}]`);
    n++;
    if (gap > 0 && i < built.length - 1) {
      inputs.push('-f', 'lavfi', '-t', String(gap), '-i', `anullsrc=r=${cfg.audio.sampleRate}:cl=mono`);
      filters.push(`[${n}:a]aresample=${cfg.audio.sampleRate}[a${n}]`);
      n++;
    }
  }
  filters.push(`${Array.from({ length: n }, (_, i) => `[a${i}]`).join('')}concat=n=${n}:v=0:a=1[out]`);

  const voiceOut = path.join(ROOT, 'voice.mp3');
  await runFfmpeg([...inputs, '-filter_complex', filters.join(';'), '-map', '[out]',
    '-c:a', 'libmp3lame', '-b:a', cfg.audio.bitrate, '-ar', String(cfg.audio.sampleRate), voiceOut]);
  const total = await probeDuration(voiceOut);

  let offset = 0;
  const segments = [];
  let allWords = [];
  for (let i = 0; i < built.length; i++) {
    const b = built[i];
    segments.push({
      id: b.seg.id, role: b.seg.role, text: b.seg.text,
      start: offset, end: offset + b.duration, duration: b.duration,
      audioFile: path.relative(ROOT, b.file), wordCount: b.words.length,
    });
    allWords = allWords.concat(b.words.map((w) => ({
      word: w.word, start: w.start + offset, end: w.end + offset, segment: b.seg.id,
    })));
    offset += b.duration + (i < built.length - 1 ? gap : 0);
  }

  writeJson('timestamps.json', {
    generatedAt: new Date().toISOString(),
    source: 'higgsfield/text2speech_v2 (elevenlabs) — timestamps ESTIMÉS, ancrés sur les silences',
    estimated: true,
    tempo: TEMPO,
    segmentGapSeconds: gap,
    totalDuration: total,
    segments, words: allWords,
  });

  log.ok(`voice.mp3 — ${fmtDuration(total)}, ${allWords.length} mots`);
  log.warn('Timestamps estimés (pas d\'alignement réel) — vérifier le calage à l\'écran.');
}

main().catch((err) => {
  log.err(err.message);
  process.exit(1);
});
