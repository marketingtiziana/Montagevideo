#!/usr/bin/env node
/**
 * tools/mock_inputs.js — Génère des ENTRÉES FACTICES pour tester le pipeline
 * sans consommer de crédits API (ni ElevenLabs, ni fal.ai).
 *
 * Produit, avec ffmpeg uniquement :
 *   - voice.mp3 + timestamps.json  (cadence de parole simulée, mots du script)
 *   - clips/scene_NN.mp4           (mires animées 9:16, durée = config.clips)
 *
 * Sert à valider 03_subs.js et 04_assemble.js, et à faire un run à blanc
 * complet avant de dépenser quoi que ce soit.
 *
 * Options :
 *   --clips-only   ne génère que les clips
 *   --voice-only   ne génère que la voix + timestamps
 *
 * ⚠️  Ne jamais utiliser pour un rendu final : la voix est un bourdonnement,
 *     pas une synthèse vocale.
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, dir, ensureDirs, loadScript, loadConfig, writeJson,
  log, runFfmpeg, probeDuration, fmtDuration,
} from '../lib/util.js';

// Cadence approximative d'une voix off française posée.
const SECONDS_PER_CHAR = 0.058;
const MIN_WORD = 0.16;

function fakeWordsFor(text) {
  const tokens = text.split(/\s+/).filter(Boolean);
  const words = [];
  let t = 0;
  for (const tok of tokens) {
    // Le français place une espace avant « : ; ! ? ». Comme alignmentToWords,
    // on rattache ces jetons purement ponctuation au mot précédent, sinon le
    // karaoké surligne un « : » tout seul.
    if (!/[\p{L}\p{N}]/u.test(tok) && words.length > 0) {
      words[words.length - 1].word += ` ${tok}`;
      continue;
    }
    const dur = Math.max(MIN_WORD, tok.replace(/[^\p{L}\p{N}]/gu, '').length * SECONDS_PER_CHAR);
    words.push({ word: tok, start: t, end: t + dur });
    t += dur;
    // Petite respiration après la ponctuation forte.
    if (/[.!?:,]$/.test(tok)) t += /[.!?]$/.test(tok) ? 0.22 : 0.1;
  }
  return { words, duration: t };
}

async function makeVoice(script, cfg) {
  log.step('Voix factice + timestamps');
  const gap = cfg.voice.segmentGapSeconds || 0;
  const segFiles = [];
  const built = [];

  for (const seg of script.segments) {
    const { words, duration } = fakeWordsFor(seg.text);
    const file = path.join(dir.work, `voice_seg_${String(seg.id).padStart(2, '0')}.mp3`);
    // Bourdonnement faible : audible, mais sans prétendre être une voix.
    await runFfmpeg([
      '-f', 'lavfi', '-i', `sine=frequency=180:duration=${duration.toFixed(3)}`,
      '-af', 'tremolo=f=5:d=0.6,volume=0.12',
      '-c:a', 'libmp3lame', '-b:a', cfg.audio.bitrate, '-ar', String(cfg.audio.sampleRate),
      file,
    ]);
    const real = await probeDuration(file);
    segFiles.push(file);
    built.push({ seg, words, duration: real, file });
    log.ok(`segment ${seg.id} — ${fmtDuration(real)}, ${words.length} mots`);
  }

  // Concaténation identique à celle de 01_voice.js (silences inclus).
  const inputs = [];
  const filters = [];
  let n = 0;
  for (let i = 0; i < segFiles.length; i++) {
    inputs.push('-i', segFiles[i]);
    filters.push(`[${n}:a]aresample=${cfg.audio.sampleRate}[a${n}]`);
    n++;
    if (gap > 0 && i < segFiles.length - 1) {
      inputs.push('-f', 'lavfi', '-t', String(gap), '-i', `anullsrc=r=${cfg.audio.sampleRate}:cl=mono`);
      filters.push(`[${n}:a]aresample=${cfg.audio.sampleRate}[a${n}]`);
      n++;
    }
  }
  filters.push(`${Array.from({ length: n }, (_, i) => `[a${i}]`).join('')}concat=n=${n}:v=0:a=1[out]`);

  const voiceOut = path.join(ROOT, 'voice.mp3');
  await runFfmpeg([
    ...inputs, '-filter_complex', filters.join(';'), '-map', '[out]',
    '-c:a', 'libmp3lame', '-b:a', cfg.audio.bitrate, '-ar', String(cfg.audio.sampleRate),
    voiceOut,
  ]);
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
    allWords = allWords.concat(
      b.words.map((w) => ({ word: w.word, start: w.start + offset, end: w.end + offset, segment: b.seg.id })),
    );
    offset += b.duration + (i < built.length - 1 ? gap : 0);
  }

  writeJson('timestamps.json', {
    generatedAt: new Date().toISOString(),
    mock: true,
    voiceId: 'MOCK', modelId: 'MOCK',
    segmentGapSeconds: gap,
    totalDuration: total,
    segments, words: allWords,
  });

  log.ok(`voice.mp3 (factice) — ${fmtDuration(total)}, ${allWords.length} mots`);
}

async function makeClips(script, cfg) {
  log.step('Clips factices');
  const { width, height, fps } = cfg.video;
  const d = cfg.clips.durationSeconds;

  for (const seg of script.segments) {
    const file = path.join(dir.clips, `scene_${String(seg.id).padStart(2, '0')}.mp4`);
    const hue = Math.round((360 / script.segments.length) * (seg.id - 1));

    // Le build ffmpeg-static n'embarque pas `drawtext` : le numéro de scène est
    // matérialisé par N barres blanches, et une barre mobile montre le temps.
    const bars = Array.from({ length: seg.id }, (_, i) =>
      `drawbox=x=${90 + i * 110}:y=200:w=70:h=70:color=white@0.9:t=fill`,
    ).join(',');
    const sweep = `drawbox=x='(w-120)*t/${d}':y=1750:w=120:h=18:color=white@0.75:t=fill`;

    await runFfmpeg([
      '-f', 'lavfi', '-i', `gradients=s=${width}x${height}:d=${d}:r=${fps}:speed=0.08`,
      '-vf', `hue=h=${hue}:s=0.7,${bars},${sweep},format=yuv420p`,
      '-an',
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '24', '-pix_fmt', 'yuv420p', '-t', String(d),
      file,
    ]);
    const dur = await probeDuration(file);
    log.ok(`scene_${String(seg.id).padStart(2, '0')}.mp4 — ${fmtDuration(dur)} (${seg.id} barre(s))`);
  }
}

async function main() {
  ensureDirs();
  const script = loadScript();
  const cfg = loadConfig();

  const clipsOnly = process.argv.includes('--clips-only');
  const voiceOnly = process.argv.includes('--voice-only');

  log.warn('Entrées FACTICES — pour tests uniquement, aucun appel API.');
  if (!clipsOnly) await makeVoice(script, cfg);
  if (!voiceOnly) await makeClips(script, cfg);
  log.ok('Entrées de test prêtes.');
}

main().catch((err) => {
  log.err(err.message);
  process.exit(1);
});
