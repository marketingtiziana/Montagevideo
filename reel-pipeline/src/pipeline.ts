/**
 * Orchestrator: chains the 8 steps, each idempotent and cached. Steps read
 * their inputs from work/<hash>/ and write a versioned JSON artefact there.
 * `--from NN` resumes at a step; earlier artefacts are reused from cache.
 * `--dry-run-edl` stops after the EDL is built and prints the stats.
 */
import { join } from 'node:path';
import { mkdirSync, rmSync, existsSync } from 'node:fs';
import type { PipelineParams, RunContext } from './lib/cache.js';
import { runHash } from './lib/cache.js';
import { setRunLog, log, ok, info } from './lib/log.js';

/** Artefact JSON produced by each step, in order, so `--from N` can invalidate. */
const STEP_ARTIFACTS: Record<number, string[]> = {
  1: ['probe.json'],
  2: ['transcript.json'],
  3: ['analysis.json'],
  4: ['edl.json'],
  5: ['cut.json'],
  6: ['audio_report.json'],
  7: ['face_track.json'],
  8: ['render.json'],
};

/** Remove artefacts for steps >= from so they recompute on resume. */
function invalidateFrom(workDir: string, from: number): void {
  for (let s = from; s <= 8; s++) {
    for (const name of STEP_ARTIFACTS[s] ?? []) {
      const p = join(workDir, name);
      if (existsSync(p)) rmSync(p);
    }
  }
}

import { stepProbe } from './steps/01-probe.js';
import { stepTranscribe } from './steps/02-transcribe.js';
import { stepAnalyze } from './steps/03-analyze.js';
import { stepBuildEdl } from './steps/04-build-edl.js';
import { stepCut } from './steps/05-cut.js';
import { stepAudioMaster } from './steps/06-audio-master.js';
import { stepFaceTrack } from './steps/07-face-track.js';
import { stepRender } from './steps/08-render.js';

export async function runPipeline(params: PipelineParams): Promise<void> {
  const hash = runHash(params);
  const workDir = join(process.cwd(), 'work', hash);
  const outDir = join(process.cwd(), 'out');
  mkdirSync(workDir, { recursive: true });
  mkdirSync(outDir, { recursive: true });
  setRunLog(join(workDir, 'run.log'));

  const ctx: RunContext = { workDir, outDir, hash, params };
  const from = params.from ?? 1;
  if (params.from) invalidateFrom(workDir, from);

  log('pipeline', `run hash ${hash}  work=work/${hash}`);
  info('pipeline', `input=${params.input} lang=${params.lang} preset=${params.preset} lufs=${params.lufs}`);

  // Step 1 — probe & normalise
  const probe = await stepProbe(ctx);

  // Step 2 — word-level transcription
  const transcript = await stepTranscribe(ctx, probe);

  // Step 3 — editorial analysis (silences, fillers, Claude)
  const analysis = await stepAnalyze(ctx, probe, transcript);

  // Step 4 — EDL
  const edl = await stepBuildEdl(ctx, probe, transcript, analysis);

  if (params.dryRunEdl) {
    printEdlStats(edl.stats);
    ok('pipeline', 'dry-run-edl complete — nothing rendered');
    return;
  }

  if (from > 5 && from <= 8) info('pipeline', `resuming from step ${from}`);

  // Step 5 — cut
  const cut = await stepCut(ctx, edl);

  // Step 6 — audio master
  const audio = await stepAudioMaster(ctx, edl);
  info('pipeline', `loudness ${audio.inputLufs.toFixed(1)} -> ${audio.outputLufs.toFixed(1)} LUFS, TP ${audio.outputTruePeak.toFixed(1)} dBTP`);

  // Step 7 — face tracking
  const face = await stepFaceTrack(ctx, cut, edl);

  // Step 8 — Remotion render
  const outFile = await stepRender(ctx, { probe, edl, transcript, audio, face });

  ok('pipeline', `rendered ${outFile}`);
  info('pipeline', 'run `npm run qa` before publishing — QA is mandatory.');
}

function printEdlStats(stats: { sourceDurationSec: number; finalDurationSec: number; compressionRatio: number; cutCount: number; warnings: string[] }): void {
  console.log('\n──────── EDL ────────');
  console.log(`  source duration : ${stats.sourceDurationSec.toFixed(2)}s`);
  console.log(`  final duration  : ${stats.finalDurationSec.toFixed(2)}s`);
  console.log(`  compression     : ${(stats.compressionRatio * 100).toFixed(1)}% kept`);
  console.log(`  cuts            : ${stats.cutCount}`);
  if (stats.warnings.length) {
    console.log('  warnings:');
    for (const w of stats.warnings) console.log(`    - ${w}`);
  }
  console.log('─────────────────────\n');
}
