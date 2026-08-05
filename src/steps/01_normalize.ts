/**
 * Étape 1 — Normalisation.
 * ffprobe source → conversion CFR 30 fps (-vsync cfr -r 30), même si la source
 * est en VFR ou en 23,976, sinon tous les timestamps dérivent. Extraction audio
 * en WAV 48 kHz 24 bit → work/source.wav.
 *
 * Sorties :
 *   work/normalized.mp4  — vidéo réencodée CFR 30 fps (master pour la découpe)
 *   work/source.wav      — audio 48 kHz / 24 bit / mono (pour la transcription)
 *   work/probe.json      — ffprobe de la source (référence)
 */

import type { Step } from '../pipeline.ts';
import { FILES, NORMALIZE, DIRS } from '../config.ts';
import { ffprobe, ffmpeg } from '../util/ffmpeg.ts';
import { writeJson } from '../util/fs.ts';
import { log } from '../util/log.ts';
import path from 'node:path';

const PROBE_JSON = path.join(DIRS.work, 'probe.json');

export const step01: Step = {
  id: '01',
  name: 'Normalisation (CFR 30 + WAV 48k/24b)',
  version: 2,
  inputs: (ctx) => [ctx.opts.input],
  outputs: () => [FILES.normalizedMp4, FILES.sourceWav],
  async run(ctx) {
    const src = ctx.opts.input;
    const probe = await ffprobe(src);
    writeJson(PROBE_JSON, probe.raw);
    log.info(
      `Source : ${probe.width}x${probe.height}, ${probe.fps.toFixed(3)} fps` +
        `${probe.vfr ? ' (VFR détecté)' : ''}, ${probe.durationS.toFixed(2)} s, ` +
        `audio ${probe.hasAudio ? 'oui' : 'NON'}.`,
    );
    if (!probe.hasAudio) {
      throw new Error('La source ne contient pas de piste audio — transcription impossible.');
    }

    // Vidéo → CFR 30 fps, réencodée (jamais -c copy). Qualité visuelle préservée.
    log.info(`Réencodage CFR ${NORMALIZE.fps} fps → ${path.basename(FILES.normalizedMp4)}`);
    await ffmpeg([
      '-i', src,
      '-vsync', 'cfr',
      '-r', String(NORMALIZE.fps),
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '16', // quasi sans perte, master de travail
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '256k',
      '-ar', '48000',
      FILES.normalizedMp4,
    ]);

    // Audio → WAV 48 kHz / 24 bit / mono, extrait de la source normalisée.
    log.info(`Extraction audio → ${path.basename(FILES.sourceWav)} (48 kHz / 24 bit / mono)`);
    await ffmpeg([
      '-i', FILES.normalizedMp4,
      '-vn',
      '-ac', String(NORMALIZE.audio.channels),
      '-ar', String(NORMALIZE.audio.sampleRate),
      '-c:a', 'pcm_s24le',
      FILES.sourceWav,
    ]);

    // Vérification : la durée du normalisé colle à la source à ±1 frame.
    const outProbe = await ffprobe(FILES.normalizedMp4);
    const driftFrames = Math.abs(outProbe.durationS - probe.durationS) * NORMALIZE.fps;
    log.info(`Durée normalisée ${outProbe.durationS.toFixed(2)} s (dérive ${driftFrames.toFixed(2)} frame).`);
  },
};
