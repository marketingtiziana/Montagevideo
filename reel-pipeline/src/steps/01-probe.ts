/**
 * Step 1 — probe & normalise.
 *
 * ffprobe the source, then normalise to a CFR-30 working video and a 48kHz
 * WAV. VFR is the classic trap: if detected we force CFR before anything else
 * so that word timestamps never drift. Idempotent via probe.json.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { RunContext } from '../lib/cache.js';
import { readArtifact, writeArtifact } from '../lib/cache.js';
import { ffmpeg, probeJson, parseRational, isVariableFramerate } from '../lib/ffmpeg.js';
import type { Probe } from '../lib/types.js';
import { FPS } from '../lib/types.js';
import { log, info, ok } from '../lib/log.js';

const TAG = '01-probe';

export async function stepProbe(ctx: RunContext): Promise<Probe> {
  const cached = readArtifact<Probe>(ctx, 'probe.json');
  const workVideo = join(ctx.workDir, 'source.mp4');
  const workAudio = join(ctx.workDir, 'source.wav');
  if (cached && existsSync(workVideo) && existsSync(workAudio)) {
    info(TAG, 'cache hit, skipping (probe.json)');
    return cached;
  }

  log(TAG, `probing ${ctx.params.input}`);
  const meta = await probeJson(ctx.params.input);
  const v = meta.streams.find((s) => s.codec_type === 'video');
  const a = meta.streams.find((s) => s.codec_type === 'audio');
  if (!v) throw new Error(`${TAG}: no video stream in source`);

  const rFrame = v.r_frame_rate;
  const avgFrame = v.avg_frame_rate;
  const srcFps = parseRational(avgFrame) || parseRational(rFrame) || FPS;
  const vfr = isVariableFramerate(rFrame, avgFrame);
  const channels = a?.channels ?? 1;
  const sampleRate = 48000;

  info(TAG, `src fps≈${srcFps.toFixed(3)} vfr=${vfr} res=${v.width}x${v.height} ach=${channels}`);

  // Normalise video to CFR 30, H.264 CRF16 (visually lossless intermediate).
  // -vsync cfr -r 30 forces constant framerate even from a VFR source.
  await ffmpeg([
    '-i', ctx.params.input,
    '-map', '0:v:0',
    '-vsync', 'cfr',
    '-r', String(FPS),
    '-c:v', 'libx264',
    '-preset', 'medium',
    '-crf', '16',
    '-pix_fmt', 'yuv420p',
    '-an',
    workVideo,
  ], TAG);

  // Extract audio: 48kHz, 24-bit, keep channel count of source (mono stays mono).
  await ffmpeg([
    '-i', ctx.params.input,
    '-map', '0:a:0?',
    '-ac', String(channels),
    '-ar', String(sampleRate),
    '-c:a', 'pcm_s24le',
    workAudio,
  ], TAG);

  const probe: Probe = {
    version: 1,
    input: ctx.params.input,
    durationSec: Number(meta.format.duration ?? 0),
    fps: FPS,
    isVfr: vfr,
    width: v.width ?? 0,
    height: v.height ?? 0,
    vcodec: v.codec_name ?? 'unknown',
    acodec: a?.codec_name ?? 'none',
    audioChannels: channels,
    sampleRate,
    workVideo,
    workAudio,
  };
  writeArtifact(ctx, 'probe.json', probe);
  ok(TAG, `normalised -> source.mp4 (CFR ${FPS}) + source.wav (${sampleRate}Hz/${channels}ch)`);
  return probe;
}
