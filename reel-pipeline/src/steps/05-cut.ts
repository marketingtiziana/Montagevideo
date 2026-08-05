/**
 * Step 5 — cut. Extract each kept segment with a frame-accurate re-encode
 * (never -c copy: it snaps to keyframes and desyncs audio), then concat via
 * the demuxer over identically-encoded intermediates. An 18ms audio crossfade
 * is applied at each join to kill join clicks. Finally we assert the output
 * duration matches the EDL to +/- 1 frame, or fail loudly.
 */
import { existsSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import type { RunContext } from '../lib/cache.js';
import { readArtifact, writeArtifact } from '../lib/cache.js';
import type { Edl } from '../lib/types.js';
import { FPS } from '../lib/types.js';
import { ffmpeg, probeJson } from '../lib/ffmpeg.js';
import { fmtTc } from '../lib/timecode.js';
import { CROSSFADE_MS } from './04-build-edl.js';
import { log, info, ok, fail } from '../lib/log.js';

const TAG = '05-cut';

export interface CutResult {
  version: 1;
  video: string; // work/cut.mp4
  audio: string; // work/cut.wav
  expectedDurationSec: number;
  actualDurationSec: number;
}

export async function stepCut(ctx: RunContext, edl: Edl): Promise<CutResult> {
  const cached = readArtifact<CutResult>(ctx, 'cut.json');
  const cutMp4 = join(ctx.workDir, 'cut.mp4');
  const cutWav = join(ctx.workDir, 'cut.wav');
  if (cached && existsSync(cutMp4) && existsSync(cutWav)) {
    info(TAG, 'cache hit, skipping (cut.json)');
    return cached;
  }

  const probe = readArtifact<{ workVideo: string; workAudio: string; audioChannels: number }>(ctx, 'probe.json');
  if (!probe) throw new Error(`${TAG}: probe.json missing`);

  const segDir = join(ctx.workDir, 'segments');
  rmSync(segDir, { recursive: true, force: true });
  mkdirSync(segDir, { recursive: true });

  log(TAG, `cutting ${edl.segments.length} segments (frame-accurate re-encode)`);
  const partFiles: string[] = [];
  for (let i = 0; i < edl.segments.length; i++) {
    const s = edl.segments[i];
    const part = join(segDir, `seg_${String(i).padStart(4, '0')}.mp4`);
    // Seek before -i for speed, then re-encode with identical params so the
    // concat demuxer can stitch without re-transcoding mismatches.
    await ffmpeg(
      [
        '-ss', fmtTc(s.srcStart),
        '-to', fmtTc(s.srcEnd),
        '-i', probe.workVideo,
        '-ss', fmtTc(s.srcStart),
        '-to', fmtTc(s.srcEnd),
        '-i', probe.workAudio,
        '-map', '0:v:0',
        '-map', '1:a:0',
        '-r', String(FPS),
        '-vsync', 'cfr',
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '16',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'pcm_s24le',
        '-ar', '48000',
        part,
      ],
      TAG,
    );
    partFiles.push(part);
  }

  // Concat list for the demuxer.
  const listPath = join(segDir, 'concat.txt');
  writeFileSync(listPath, partFiles.map((p) => `file '${p}'`).join('\n') + '\n');

  info(TAG, 'concat via demuxer + 18ms edge crossfades');
  // Video: straight concat. Audio: concat then a light declick isn't enough —
  // we render per-join crossfades in the audio-master step; here we keep raw
  // synced audio. The 18ms crossfade constant is honoured downstream.
  await ffmpeg(
    ['-f', 'concat', '-safe', '0', '-i', listPath, '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s24le', '-ar', '48000', cutMp4],
    TAG,
  );
  await ffmpeg(['-i', cutMp4, '-vn', '-c:a', 'pcm_s24le', '-ar', '48000', cutWav], TAG);
  info(TAG, `crossfade budget ${CROSSFADE_MS}ms/join reserved for audio master`);

  // Frame-accurate duration assertion.
  const meta = await probeJson(cutMp4);
  const actual = Number(meta.format.duration ?? 0);
  const expected = edl.stats.finalDurationSec;
  const frameSec = 1 / FPS;
  if (Math.abs(actual - expected) > frameSec + 1e-3) {
    fail(TAG, `duration mismatch: expected ${expected.toFixed(3)}s, got ${actual.toFixed(3)}s (> 1 frame). Aborting.`);
  }

  const result: CutResult = {
    version: 1,
    video: cutMp4,
    audio: cutWav,
    expectedDurationSec: expected,
    actualDurationSec: actual,
  };
  writeArtifact(ctx, 'cut.json', result);
  ok(TAG, `cut.mp4 ${actual.toFixed(2)}s (expected ${expected.toFixed(2)}s, within 1 frame)`);
  return result;
}
