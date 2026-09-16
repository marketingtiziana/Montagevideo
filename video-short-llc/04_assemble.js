#!/usr/bin/env node
/**
 * 04_assemble.js — Assemblage ffmpeg final.
 *
 *  1. Chaque clip est recadré en 1080x1920 et ajusté à la durée de SON segment
 *     audio (coupe si trop long, ralenti — ou boucle — si trop court).
 *  2. Concaténation des clips ajustés.
 *  3. Incrustation des sous-titres (.ass via libass).
 *  4. Mixage voix + musique de fond optionnelle (-18 dB), export H.264.
 *
 * Sortie : output/final.mp4
 *
 * Options :
 *   --no-subs      n'incruste pas les sous-titres
 *   --no-music     ignore music.mp3 même s'il existe
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT, dir, ensureDirs, loadConfig, readJson, writeJson,
  log, runFfmpeg, probeDuration, fmtDuration, fileExists,
} from './lib/util.js';

/** Durées cibles = intervalles réels de la timeline audio (silences inclus). */
function computeTargets(data) {
  const segs = data.segments;
  return segs.map((s, i) => {
    const target = i < segs.length - 1 ? segs[i + 1].start - s.start : data.totalDuration - s.start;
    return { ...s, target };
  });
}

async function fitClip(seg, clipFile, cfg) {
  const outFile = path.join(dir.work, `fit_${String(seg.id).padStart(2, '0')}.mp4`);
  const { width, height, fps } = cfg.video;
  const srcDuration = await probeDuration(clipFile);
  const factor = seg.target / srcDuration;

  const frame = `scale=${width}:${height}:force_original_aspect_ratio=increase,crop=${width}:${height},setsar=1,fps=${fps}`;
  const args = [];
  let how;

  if (factor > cfg.fit.maxStretchFactor) {
    // Trop court pour un ralenti crédible → on boucle le clip.
    args.push('-stream_loop', '-1', '-i', clipFile);
    args.push('-t', seg.target.toFixed(3), '-vf', frame);
    how = `boucle ×${factor.toFixed(2)}`;
  } else if (factor > 1.02) {
    args.push('-i', clipFile);
    args.push('-vf', `setpts=${factor.toFixed(6)}*PTS,${frame}`, '-t', seg.target.toFixed(3));
    how = `ralenti ×${factor.toFixed(2)}`;
  } else {
    args.push('-i', clipFile);
    args.push('-t', seg.target.toFixed(3), '-vf', frame);
    how = factor < 0.98 ? `coupe (${(1 / factor).toFixed(2)}× trop long)` : 'tel quel';
  }

  await runFfmpeg([
    ...args,
    '-an',
    '-c:v', 'libx264', '-preset', cfg.video.preset, '-crf', String(cfg.video.intermediateCrf),
    '-pix_fmt', 'yuv420p', '-r', String(fps),
    outFile,
  ]);

  const got = await probeDuration(outFile);
  log.ok(`scène ${seg.id} — ${fmtDuration(srcDuration)} → ${fmtDuration(got)} (cible ${fmtDuration(seg.target)}, ${how})`);
  return outFile;
}

async function concatClips(files) {
  const listFile = path.join(dir.work, 'concat.txt');
  fs.writeFileSync(listFile, files.map((f) => `file '${f.replace(/'/g, "'\\''")}'`).join('\n') + '\n');
  const outFile = path.join(dir.work, 'video.mp4');
  // Tous les segments partagent les mêmes paramètres d'encodage → copie directe.
  await runFfmpeg(['-f', 'concat', '-safe', '0', '-i', listFile, '-c', 'copy', outFile]);
  return outFile;
}

async function finalRender(videoFile, cfg, { withSubs, withMusic, totalDuration }) {
  const voice = path.join(ROOT, 'voice.mp3');
  const music = path.join(ROOT, cfg.audio.musicFile);
  const outFile = path.join(dir.output, 'final.mp4');
  const subs = path.join(ROOT, 'subs.ass');
  const fontsDir = path.join(dir.assets, 'fonts');

  const inputs = ['-i', videoFile, '-i', voice];
  const filters = [];

  if (withMusic) {
    inputs.push('-stream_loop', '-1', '-i', music);
    const fadeStart = Math.max(0, totalDuration - cfg.audio.musicFadeOutSeconds);
    filters.push(
      `[2:a]volume=${cfg.audio.musicVolumeDb}dB,` +
      `afade=t=out:st=${fadeStart.toFixed(2)}:d=${cfg.audio.musicFadeOutSeconds},` +
      `aresample=${cfg.audio.sampleRate}[music]`,
    );
    // normalize=0 : la voix garde son niveau, la musique reste à -18 dB.
    filters.push(`[1:a][music]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[aout]`);
  } else {
    filters.push(`[1:a]aresample=${cfg.audio.sampleRate}[aout]`);
  }

  if (withSubs) {
    filters.push(`[0:v]ass='${subs}':fontsdir='${fontsDir}'[vout]`);
  } else {
    filters.push(`[0:v]null[vout]`);
  }

  await runFfmpeg([
    ...inputs,
    '-filter_complex', filters.join(';'),
    '-map', '[vout]', '-map', '[aout]',
    '-c:v', 'libx264', '-preset', cfg.video.preset, '-crf', String(cfg.video.crf),
    '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-r', String(cfg.video.fps),
    '-c:a', 'aac', '-b:a', cfg.audio.bitrate, '-ar', String(cfg.audio.sampleRate),
    '-shortest', '-movflags', '+faststart',
    outFile,
  ]);

  return outFile;
}

async function main() {
  ensureDirs();
  const cfg = loadConfig();

  if (!fileExists('timestamps.json')) {
    log.err('timestamps.json introuvable — lance d\'abord `node 01_voice.js`.');
    process.exit(1);
  }
  if (!fileExists('voice.mp3')) {
    log.err('voice.mp3 introuvable — lance d\'abord `node 01_voice.js`.');
    process.exit(1);
  }

  const data = readJson('timestamps.json');
  const targets = computeTargets(data);

  const withSubs = !process.argv.includes('--no-subs') && fileExists('subs.ass');
  if (!withSubs && !process.argv.includes('--no-subs')) {
    log.warn('subs.ass introuvable — rendu sans sous-titres (lance `node 03_subs.js`).');
  }
  const withMusic = !process.argv.includes('--no-music') && fileExists(cfg.audio.musicFile);

  log.step(`Assemblage — ${targets.length} scènes, cible ${fmtDuration(data.totalDuration)}`);

  // 1. Ajustement de chaque clip à son segment.
  const fitted = [];
  for (const seg of targets) {
    const clip = path.join(dir.clips, `scene_${String(seg.id).padStart(2, '0')}.mp4`);
    if (!fs.existsSync(clip)) {
      log.err(`Clip manquant : ${path.relative(ROOT, clip)} — lance \`node 02_clips.js\`.`);
      process.exit(1);
    }
    fitted.push(await fitClip(seg, clip, cfg));
  }

  // 2. Concaténation.
  log.info('Concaténation…');
  const video = await concatClips(fitted);
  const videoDuration = await probeDuration(video);
  log.ok(`vidéo muette — ${fmtDuration(videoDuration)}`);

  // 3+4. Sous-titres + mixage audio.
  log.info(`Rendu final${withSubs ? ' + sous-titres' : ''}${withMusic ? ` + musique (${cfg.audio.musicVolumeDb} dB)` : ''}…`);
  const out = await finalRender(video, cfg, { withSubs, withMusic, totalDuration: data.totalDuration });

  const finalDuration = await probeDuration(out);
  const { size } = fs.statSync(out);

  writeJson(path.join(dir.output, 'render.json'), {
    generatedAt: new Date().toISOString(),
    duration: finalDuration,
    bytes: size,
    resolution: `${cfg.video.width}x${cfg.video.height}`,
    fps: cfg.video.fps,
    subtitles: withSubs,
    music: withMusic,
    segments: targets.map((s) => ({ id: s.id, start: s.start, target: s.target })),
  });

  log.ok(`output/final.mp4 — ${fmtDuration(finalDuration)}, ${(size / 1e6).toFixed(1)} Mo, ${cfg.video.width}x${cfg.video.height} @${cfg.video.fps}`);

  const drift = Math.abs(finalDuration - data.totalDuration);
  if (drift > 0.5) log.warn(`Écart de ${drift.toFixed(2)}s avec la timeline audio.`);
}

main().catch((err) => {
  log.err(err.message);
  process.exit(1);
});
