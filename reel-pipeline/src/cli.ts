#!/usr/bin/env tsx
/**
 * CLI entry point. Parses args, builds the run context, and dispatches to the
 * pipeline orchestrator.
 *
 *   npm run pipeline -- --input ./raw/interview.mp4 --lang fr \
 *     --preset reel-vertical --lufs -14 --max-duration 90 --room-tone --dry-run-edl
 *   npm run pipeline -- --input ./raw/interview.mp4 --from 06
 */
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import type { PipelineParams } from './lib/cache.js';
import { runPipeline } from './pipeline.js';

interface Flags {
  [k: string]: string | boolean;
}

function parseArgs(argv: string[]): Flags {
  const flags: Flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      flags[key] = true;
    } else {
      flags[key] = next;
      i++;
    }
  }
  return flags;
}

function usage(): never {
  console.log(`
reel-pipeline — facecam -> vertical reel (1080x1920)

Usage:
  npm run pipeline -- --input <file> [options]

Options:
  --input <path>        source video (required)
  --lang <code>         transcription language (default: fr)
  --preset <name>       render preset (default: reel-vertical)
  --lufs <n>            integrated loudness target (default: -14)
  --max-duration <s>    hard cap on final duration in seconds (default: none)
  --room-tone           reinject low room tone to mask joins
  --dry-run-edl         build + print the EDL and stats, render nothing
  --from <NN>           resume from step NN (01..08)
  --model <name>        whisper model (default: large-v3)
  --help                this message
`);
  process.exit(0);
}

function main(): void {
  const flags = parseArgs(process.argv.slice(2));
  if (flags.help || Object.keys(flags).length === 0) usage();

  const input = flags.input as string | undefined;
  if (!input || typeof input !== 'string') {
    console.error('error: --input <file> is required');
    process.exit(1);
  }
  const inputPath = resolve(String(input));
  if (!existsSync(inputPath)) {
    console.error(`error: input not found: ${inputPath}`);
    process.exit(1);
  }

  const params: PipelineParams = {
    input: inputPath,
    lang: (flags.lang as string) ?? 'fr',
    preset: (flags.preset as string) ?? 'reel-vertical',
    lufs: flags.lufs ? Number(flags.lufs) : -14,
    maxDuration: flags['max-duration'] ? Number(flags['max-duration']) : null,
    roomTone: Boolean(flags['room-tone']),
    dryRunEdl: Boolean(flags['dry-run-edl']),
    from: flags.from ? Number(flags.from) : null,
    model: (flags.model as string) ?? 'large-v3',
  };

  runPipeline(params).catch((err) => {
    console.error('\npipeline failed:', err?.message ?? err);
    process.exit(1);
  });
}

main();
