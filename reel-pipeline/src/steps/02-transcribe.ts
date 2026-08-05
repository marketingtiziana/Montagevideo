/**
 * Step 2 — word-level transcription via WhisperX (Python venv).
 *
 * Runs python/transcribe.py which emits transcript.json with per-word
 * timestamps and confidence scores. Idempotent via transcript.json.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import type { RunContext } from '../lib/cache.js';
import { readArtifact } from '../lib/cache.js';
import type { Probe, Transcript } from '../lib/types.js';
import { log, info, ok, logCmd } from '../lib/log.js';

const TAG = '02-transcribe';

function pythonBin(): string {
  // Prefer the venv created by scripts/setup.sh.
  const venv = join(process.cwd(), '.venv', 'bin', 'python');
  return existsSync(venv) ? venv : process.env.PYTHON_BIN ?? 'python3';
}

function runPython(args: string[]): Promise<void> {
  const py = pythonBin();
  logCmd(TAG, [py, ...args]);
  return new Promise((resolve, reject) => {
    const p = spawn(py, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`transcribe.py exited ${code}`))));
  });
}

export async function stepTranscribe(ctx: RunContext, probe: Probe): Promise<Transcript> {
  const cached = readArtifact<Transcript>(ctx, 'transcript.json');
  if (cached) {
    info(TAG, 'cache hit, skipping (transcript.json)');
    return cached;
  }

  const script = join(process.cwd(), 'python', 'transcribe.py');
  const out = join(ctx.workDir, 'transcript.json');
  log(TAG, `WhisperX ${ctx.params.model} lang=${ctx.params.lang}`);
  await runPython([
    script,
    '--audio', probe.workAudio,
    '--out', out,
    '--lang', ctx.params.lang,
    '--model', ctx.params.model,
  ]);

  const transcript = readArtifact<Transcript>(ctx, 'transcript.json');
  if (!transcript) throw new Error(`${TAG}: transcribe.py did not produce transcript.json`);
  ok(TAG, `${transcript.words.length} words aligned`);
  return transcript;
}
