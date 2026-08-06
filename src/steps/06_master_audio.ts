/**
 * Étape 6 — Mastering audio (jalon critique).
 * Chaîne dans l'ordre EXACT (l'inverser dégrade le résultat) :
 *   highpass 75 → afftdn → de-esser → EQ correctif → acompressor → alimiter
 *   → room tone -58 dBFS en boucle → loudnorm 2 passes.
 * Cibles : -14 LUFS (±0,5), LRA 3–4, TP -1 dBTP. Aucune musique.
 * → work/audio_master.wav + work/audio_report.json.
 */

import path from 'node:path';
import type { Step } from '../pipeline.ts';
import { FILES, AUDIO, DIRS, NORMALIZE } from '../config.ts';
import { run } from '../util/exec.ts';
import { ffmpeg } from '../util/ffmpeg.ts';
import { writeJson, exists } from '../util/fs.ts';
import { silenceDetect } from '../util/audio.ts';
import { measureLoudness } from '../util/loudness.ts';
import { log } from '../util/log.ts';

/** Chaîne de traitement (hors room tone et loudnorm), ordre imposé. */
export function buildChain(): string {
  const c = AUDIO.chain;
  return [
    `highpass=f=${c.highpassHz}`,
    `afftdn=nr=${c.afftdn.nr}:nf=${c.afftdn.nf}:tn=${c.afftdn.tn}`,
    // De-esser sur la sibilance (bande ~5,5–9 kHz).
    `deesser=i=0.4`,
    // EQ correctif : dégager la boue à 300 Hz, intelligibilité à 3 kHz, air à 11 kHz.
    `equalizer=f=300:t=q:w=1.2:g=-2.5`,
    `equalizer=f=3000:t=q:w=1.0:g=2`,
    `highshelf=f=11000:g=1.5`,
    `acompressor=threshold=${c.compressor.threshold}dB:ratio=${c.compressor.ratio}:attack=${c.compressor.attack}:release=${c.compressor.release}:makeup=${c.compressor.makeup}`,
    `alimiter=limit=${c.limiter.limit}`,
  ].join(',');
}

/** Extrait 500 ms de room tone d'un silence de la source. Renvoie le chemin ou null. */
async function extractRoomTone(src: string): Promise<{ file: string; gainDb: number } | null> {
  const silences = await silenceDetect(src, -34, 0.6);
  const seg = silences.find((s) => s.end - s.start >= AUDIO.roomTone.sampleMs / 1000 + 0.1);
  if (!seg) {
    log.warn('Aucun silence assez long pour le room tone — étape room tone ignorée.');
    return null;
  }
  const startAt = seg.start + 0.05;
  const file = path.join(DIRS.work, 'roomtone.wav');
  await ffmpeg([
    '-ss', String(startAt), '-t', String(AUDIO.roomTone.sampleMs / 1000),
    '-i', src, '-ac', '1', '-ar', String(NORMALIZE.audio.sampleRate),
    '-c:a', 'pcm_s24le', file,
  ]);
  // Niveau moyen du room tone pour le ramener à -58 dBFS.
  const { stderr } = await run('ffmpeg', ['-hide_banner', '-i', file, '-af', 'volumedetect', '-f', 'null', '-'], {
    quiet: true, allowFail: true,
  });
  const m = stderr.match(/mean_volume:\s*(-?[\d.]+)\s*dB/);
  const mean = m ? parseFloat(m[1]!) : -60;
  const gainDb = AUDIO.roomTone.levelDbFS - mean; // amène le mean à -58 dBFS
  log.info(`Room tone : ${seg.start.toFixed(2)}s (mean ${mean.toFixed(1)} dB → gain ${gainDb.toFixed(1)} dB).`);
  return { file, gainDb };
}

/** Masterise inputWav → outWav (+ rapport). Réutilisable (étape 6 ou démo). */
export async function masterAudio(
  inputWav: string,
  outWav: string,
  reportPath: string,
): Promise<void> {
  const chain = buildChain();
  const t = AUDIO.chain.loudnorm;
  const rt = await extractRoomTone(inputWav);

  // Graphe pré-loudnorm (avec ou sans room tone).
  const preGraph = rt
    ? `[0:a]${chain}[v];[1:a]volume=${rt.gainDb.toFixed(2)}dB[r];[v][r]amix=inputs=2:duration=first:normalize=0[pre]`
    : `[0:a]${chain}[pre]`;

  // Passe 1 : mesure.
  log.info('Loudnorm passe 1 (mesure)…');
  const measureArgs = ['-hide_banner', '-i', inputWav];
  if (rt) measureArgs.push('-stream_loop', '-1', '-i', rt.file);
  measureArgs.push(
    '-filter_complex', `${preGraph};[pre]loudnorm=I=${t.I}:LRA=${t.LRA}:TP=${t.TP}:print_format=json[out]`,
    '-map', '[out]', '-f', 'null', '-',
  );
  const { stderr: m1 } = await run('ffmpeg', measureArgs, { quiet: true, allowFail: true });
  const js = m1.slice(m1.lastIndexOf('{'), m1.lastIndexOf('}') + 1);
  const meas = JSON.parse(js) as Record<string, string>;

  // Passe 2 : application avec valeurs mesurées (loudnorm linéaire).
  log.info('Loudnorm passe 2 (application)…');
  const applyArgs = ['-hide_banner', '-y', '-i', inputWav];
  if (rt) applyArgs.push('-stream_loop', '-1', '-i', rt.file);
  // Marge de sécurité true-peak : loudnorm peut dépasser sa cible de ~0,05 dB.
  // On vise -0,1 dB sous la cible pour garantir le gate QA (TP <= -1,0 dBTP).
  const tpTarget = t.TP - 0.1;
  const ln =
    `loudnorm=I=${t.I}:LRA=${t.LRA}:TP=${tpTarget}:` +
    `measured_I=${meas.input_i}:measured_LRA=${meas.input_lra}:measured_TP=${meas.input_tp}:` +
    `measured_thresh=${meas.input_thresh}:offset=${meas.target_offset}:linear=true`;
  applyArgs.push(
    '-filter_complex', `${preGraph};[pre]${ln}[out]`,
    '-map', '[out]', '-ar', String(NORMALIZE.audio.sampleRate), '-c:a', 'pcm_s24le', outWav,
  );
  await run('ffmpeg', applyArgs, { quiet: true });

  // Vérification finale.
  const final = await measureLoudness(outWav);
  const report = {
    input: inputWav,
    output: outWav,
    targets: { I: AUDIO.targetLUFS, LRA: `${AUDIO.lraMin}-${AUDIO.lraMax}`, TP: AUDIO.truePeakDb },
    measured: final,
    roomTone: rt ? { levelDbFS: AUDIO.roomTone.levelDbFS, gainDb: rt.gainDb } : null,
    chain: chain.split(','),
  };
  writeJson(reportPath, report);
  log.ok(
    `Master : I=${final.I.toFixed(2)} LUFS, LRA=${final.LRA.toFixed(2)} LU, TP=${final.TP.toFixed(2)} dBTP ` +
      `(cibles -14 / 3-4 / -1).`,
  );
}

export const step06: Step = {
  id: '06',
  name: 'Mastering audio (chaîne complète + room tone + loudnorm 2 passes)',
  version: 2,
  inputs: () => [FILES.cutWav],
  outputs: () => [FILES.audioMaster, FILES.audioReport],
  async run() {
    if (!exists(FILES.cutWav)) throw new Error(`cut.wav absent : ${FILES.cutWav} (étape 5 requise).`);
    await masterAudio(FILES.cutWav, FILES.audioMaster, FILES.audioReport);
  },
};
