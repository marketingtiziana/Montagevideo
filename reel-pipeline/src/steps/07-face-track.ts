/**
 * Step 7 — face tracking. Runs python/face_track.py (MediaPipe Face Detection)
 * on work/cut.mp4. The Python side applies the mandatory One Euro smoothing,
 * gap interpolation (<12 frames) / freeze, and clamping. This wrapper also
 * asks for a debug overlay render (draws the tracked box) for milestone 5.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import type { RunContext } from '../lib/cache.js';
import { readArtifact } from '../lib/cache.js';
import type { Edl, FaceTrack } from '../lib/types.js';
import type { CutResult } from './05-cut.js';
import { log, info, ok, warn, logCmd } from '../lib/log.js';

const TAG = '07-face-track';

function pythonBin(): string {
  const venv = join(process.cwd(), '.venv', 'bin', 'python');
  return existsSync(venv) ? venv : process.env.PYTHON_BIN ?? 'python3';
}

function runPython(args: string[]): Promise<void> {
  const py = pythonBin();
  logCmd(TAG, [py, ...args]);
  return new Promise((resolve, reject) => {
    const p = spawn(py, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`face_track.py exited ${code}`))));
  });
}

export async function stepFaceTrack(ctx: RunContext, cut: CutResult, _edl: Edl): Promise<FaceTrack> {
  const cached = readArtifact<FaceTrack>(ctx, 'face_track.json');
  if (cached) {
    info(TAG, 'cache hit, skipping (face_track.json)');
    return cached;
  }

  const script = join(process.cwd(), 'python', 'face_track.py');
  const out = join(ctx.workDir, 'face_track.json');
  const debug = join(ctx.workDir, 'face_debug.mp4');
  log(TAG, 'MediaPipe face detection + One Euro smoothing');
  await runPython([
    script,
    '--video', cut.video,
    '--out', out,
    '--debug', debug,
    '--min-cutoff', '0.6',
    '--beta', '0.02',
  ]);

  const track = readArtifact<FaceTrack>(ctx, 'face_track.json');
  if (!track) throw new Error(`${TAG}: face_track.py did not produce face_track.json`);
  if (track.frozenIntervals.length) {
    for (const iv of track.frozenIntervals) {
      warn(TAG, `face lost > 12 frames, frozen ${iv.from}..${iv.to}`);
    }
  }
  ok(TAG, `${track.frames.length} frames tracked, debug overlay -> face_debug.mp4`);
  return track;
}
