/**
 * Étape 5 — Découpe.
 * Réencodage frame-accurate (jamais -c copy). Un seul passage filter_complex :
 * trim vidéo (coupe franche) + atrim audio avec micro-fondus de 9 ms en entrée
 * et sortie de chaque segment (anti-clic, sans chevauchement → durée et synchro
 * A/V préservées). Concat des segments. → work/cut.mp4 + work/cut.wav.
 * Vérification : durée obtenue = EDL ±1 frame, sinon échec bruyant.
 */

import type { Step } from '../pipeline.ts';
import { FILES, EDL, NORMALIZE } from '../config.ts';
import type { Edl } from '../types.ts';
import { readJson, exists } from '../util/fs.ts';
import { ffmpeg, ffprobe } from '../util/ffmpeg.ts';
import { log } from '../util/log.ts';

export const step05: Step = {
  id: '05',
  name: 'Découpe frame-accurate + concat',
  version: 2,
  inputs: () => [FILES.edl, FILES.normalizedMp4],
  outputs: () => [FILES.cutMp4, FILES.cutWav],
  async run() {
    if (!exists(FILES.edl)) throw new Error(`edl.json absent : ${FILES.edl}`);
    if (!exists(FILES.normalizedMp4)) throw new Error(`normalized.mp4 absent : ${FILES.normalizedMp4}`);
    const edl = readJson<Edl>(FILES.edl);
    const segs = edl.segments;
    if (segs.length === 0) throw new Error('EDL sans segment.');

    const fade = EDL.crossfadeMs / 1000 / 2; // 9 ms en entrée + 9 ms en sortie
    const parts: string[] = [];
    const vLabels: string[] = [];
    const aLabels: string[] = [];
    segs.forEach((s, i) => {
      const dur = s.srcEnd - s.srcStart;
      const outSt = Math.max(0, dur - fade);
      parts.push(`[0:v]trim=start=${s.srcStart}:end=${s.srcEnd},setpts=PTS-STARTPTS[v${i}]`);
      parts.push(
        `[0:a]atrim=start=${s.srcStart}:end=${s.srcEnd},asetpts=PTS-STARTPTS,` +
          `afade=t=in:st=0:d=${fade},afade=t=out:st=${outSt.toFixed(4)}:d=${fade}[a${i}]`,
      );
      vLabels.push(`[v${i}]`);
      aLabels.push(`[a${i}]`);
    });
    const concat =
      `${vLabels.join('')}concat=n=${segs.length}:v=1:a=0[v];` +
      `${aLabels.join('')}concat=n=${segs.length}:v=0:a=1[a]`;
    const filter = `${parts.join(';')};${concat}`;

    log.info(`Découpe de ${segs.length} segments (réencodage frame-accurate)…`);
    await ffmpeg([
      '-i', FILES.normalizedMp4,
      '-filter_complex', filter,
      '-map', '[v]', '-map', '[a]',
      '-r', String(NORMALIZE.fps),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
      '-c:a', 'aac', '-b:a', '256k', '-ar', String(NORMALIZE.audio.sampleRate),
      FILES.cutMp4,
    ]);

    // cut.wav (48k/24b mono) pour le mastering.
    await ffmpeg([
      '-i', FILES.cutMp4, '-vn',
      '-ac', String(NORMALIZE.audio.channels), '-ar', String(NORMALIZE.audio.sampleRate),
      '-c:a', 'pcm_s24le', FILES.cutWav,
    ]);

    // Vérification durée ±1 frame.
    const out = await ffprobe(FILES.cutMp4);
    const expected = edl.stats.finalDurationS;
    const driftFrames = Math.abs(out.durationS - expected) * NORMALIZE.fps;
    log.ok(`cut.mp4 ${out.durationS.toFixed(3)}s (EDL ${expected.toFixed(3)}s, dérive ${driftFrames.toFixed(2)} frame).`);
    if (driftFrames > 1.5) {
      throw new Error(`Dérive découpe ${driftFrames.toFixed(2)} > 1 frame — échec.`);
    }
  },
};
