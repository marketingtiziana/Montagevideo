#!/usr/bin/env node
/**
 * 01_voice.js — Voix off ElevenLabs + timestamps mot à mot.
 *
 * Un appel `/with-timestamps` PAR SEGMENT : chaque segment a ainsi sa propre
 * durée audio, qui pilotera ensuite l'étirement du clip vidéo correspondant.
 * Les segments sont concaténés (avec un court silence entre eux) en voice.mp3,
 * et les timestamps sont réexprimés sur la timeline globale.
 *
 * Sorties : voice.mp3, timestamps.json, work/voice_seg_NN.mp3
 *
 * Options :
 *   --list-voices   liste les voix du compte ElevenLabs puis quitte
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, dir, ensureDirs, loadScript, loadConfig, writeJson,
  log, requireEnv, withRetry, runFfmpeg, probeDuration, fmtDuration,
} from './lib/util.js';
import { alignmentToWords, offsetWords } from './lib/words.js';

const API = 'https://api.elevenlabs.io/v1';

async function listVoices(apiKey) {
  const res = await fetch(`${API}/voices`, { headers: { 'xi-api-key': apiKey } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const { voices } = await res.json();
  console.log(`\n${voices.length} voix disponibles :\n`);
  for (const v of voices) {
    const labels = Object.values(v.labels || {}).join(', ');
    console.log(`  ${v.voice_id}  ${v.name.padEnd(22)} ${labels}`);
  }
  console.log('\nRenseigne la voix choisie dans config.json (voice.voiceId) ou via ELEVENLABS_VOICE_ID.\n');
}

async function synthesizeSegment(segment, { apiKey, voiceId, cfg }) {
  const url = `${API}/text-to-speech/${voiceId}/with-timestamps?output_format=${cfg.voice.outputFormat}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      text: segment.text,
      model_id: cfg.voice.modelId,
      voice_settings: cfg.voice.voiceSettings,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    // 401/403 = clé invalide, inutile de réessayer.
    if (res.status === 401 || res.status === 403) {
      throw Object.assign(new Error(`ElevenLabs ${res.status} : clé refusée. ${body.slice(0, 200)}`), { fatal: true });
    }
    throw new Error(`ElevenLabs ${res.status} : ${body.slice(0, 300)}`);
  }

  const payload = await res.json();
  if (!payload.audio_base64) throw new Error('Réponse ElevenLabs sans audio_base64');

  // `normalized_alignment` suit le texte normalisé (nombres développés, etc.),
  // ce qui colle mieux à ce qui est réellement prononcé.
  const alignment = payload.normalized_alignment || payload.alignment;
  return {
    audio: Buffer.from(payload.audio_base64, 'base64'),
    words: alignmentToWords(alignment),
  };
}

/** Concatène les segments avec un silence inter-segment, en un seul passage ffmpeg. */
async function concatWithGaps(files, gapSeconds, outFile, cfg) {
  const inputs = [];
  const filters = [];
  let n = 0;

  for (let i = 0; i < files.length; i++) {
    inputs.push('-i', files[i]);
    filters.push(`[${n}:a]aresample=${cfg.audio.sampleRate}[a${n}]`);
    n++;
    if (gapSeconds > 0 && i < files.length - 1) {
      inputs.push('-f', 'lavfi', '-t', String(gapSeconds), '-i', `anullsrc=r=${cfg.audio.sampleRate}:cl=mono`);
      filters.push(`[${n}:a]aresample=${cfg.audio.sampleRate}[a${n}]`);
      n++;
    }
  }

  const chain = Array.from({ length: n }, (_, i) => `[a${i}]`).join('');
  filters.push(`${chain}concat=n=${n}:v=0:a=1[out]`);

  await runFfmpeg([
    ...inputs,
    '-filter_complex', filters.join(';'),
    '-map', '[out]',
    '-c:a', 'libmp3lame', '-b:a', cfg.audio.bitrate, '-ar', String(cfg.audio.sampleRate),
    outFile,
  ]);
}

async function main() {
  ensureDirs();
  const apiKey = requireEnv('ELEVENLABS_API_KEY', 'export ELEVENLABS_API_KEY=... (ou renseigne .env)');

  if (process.argv.includes('--list-voices')) {
    await listVoices(apiKey);
    return;
  }

  const script = loadScript();
  const cfg = loadConfig();
  const voiceId = process.env.ELEVENLABS_VOICE_ID || cfg.voice.voiceId;

  log.step(`Voix off — ${script.segments.length} segments (voix ${voiceId}, ${cfg.voice.modelId})`);

  const segFiles = [];
  const perSegment = [];

  // Séquentiel : ElevenLabs limite fortement la concurrence, et l'ordre compte.
  for (const seg of script.segments) {
    const label = `segment ${seg.id}`;
    const { audio, words } = await withRetry(label, async () => {
      try {
        return await synthesizeSegment(seg, { apiKey, voiceId, cfg });
      } catch (err) {
        if (err.fatal) {
          log.err(err.message);
          process.exit(1);
        }
        throw err;
      }
    }, { attempts: 3 });

    const file = path.join(dir.work, `voice_seg_${String(seg.id).padStart(2, '0')}.mp3`);
    fs.writeFileSync(file, audio);
    const duration = await probeDuration(file);

    segFiles.push(file);
    perSegment.push({ id: seg.id, role: seg.role, text: seg.text, file, duration, words });
    log.ok(`${label} — ${fmtDuration(duration)}, ${words.length} mots`);
  }

  // Timeline globale : offset cumulé = somme des durées réelles + silences.
  const gap = cfg.voice.segmentGapSeconds || 0;
  let offset = 0;
  const segments = [];
  let allWords = [];

  for (let i = 0; i < perSegment.length; i++) {
    const s = perSegment[i];
    const words = offsetWords(s.words, offset);
    segments.push({
      id: s.id,
      role: s.role,
      text: s.text,
      start: offset,
      end: offset + s.duration,
      duration: s.duration,
      audioFile: path.relative(ROOT, s.file),
      wordCount: words.length,
    });
    allWords = allWords.concat(words.map((w) => ({ ...w, segment: s.id })));
    offset += s.duration + (i < perSegment.length - 1 ? gap : 0);
  }

  log.info('Concaténation des segments…');
  const voiceOut = path.join(ROOT, 'voice.mp3');
  await concatWithGaps(segFiles, gap, voiceOut, cfg);
  const total = await probeDuration(voiceOut);

  writeJson('timestamps.json', {
    generatedAt: new Date().toISOString(),
    voiceId,
    modelId: cfg.voice.modelId,
    segmentGapSeconds: gap,
    totalDuration: total,
    segments,
    words: allWords,
  });

  log.ok(`voice.mp3 — ${fmtDuration(total)}`);
  log.ok(`timestamps.json — ${allWords.length} mots`);

  if (Math.abs(total - offset) > 0.35) {
    log.warn(`Écart durée concaténée (${fmtDuration(total)}) vs timeline calculée (${fmtDuration(offset)}).`);
  }
}

main().catch((err) => {
  log.err(err.message);
  process.exit(1);
});
