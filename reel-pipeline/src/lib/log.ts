/**
 * Tiny structured logger. Every step logs with a [NN-name] prefix so the
 * console reads like a build. All ffmpeg commands are also appended verbatim
 * to work/<hash>/run.log so they can be copy-pasted for debugging.
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

let runLogPath: string | null = null;

export function setRunLog(path: string): void {
  runLogPath = path;
  mkdirSync(dirname(path), { recursive: true });
}

function toRunLog(line: string): void {
  if (!runLogPath) return;
  appendFileSync(runLogPath, line + '\n');
}

const c = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
};

export function log(tag: string, msg: string): void {
  const line = `[${tag}] ${msg}`;
  console.log(c.cyan(`[${tag}]`) + ' ' + msg);
  toRunLog(line);
}
export function info(tag: string, msg: string): void {
  console.log(c.dim(`[${tag}] ${msg}`));
  toRunLog(`[${tag}] ${msg}`);
}
export function ok(tag: string, msg: string): void {
  console.log(c.green(`[${tag}] ${msg}`));
  toRunLog(`[${tag}] OK ${msg}`);
}
export function warn(tag: string, msg: string): void {
  console.log(c.yellow(`[${tag}] WARN ${msg}`));
  toRunLog(`[${tag}] WARN ${msg}`);
}
export function fail(tag: string, msg: string): never {
  console.error(c.red(`[${tag}] FAIL ${msg}`));
  toRunLog(`[${tag}] FAIL ${msg}`);
  throw new Error(`[${tag}] ${msg}`);
}

/** Log a shell command exactly as executed. */
export function logCmd(tag: string, argv: string[]): void {
  const pretty = argv.map((a) => (/[\s"']/.test(a) ? JSON.stringify(a) : a)).join(' ');
  console.log(c.dim(`  $ ${pretty}`));
  toRunLog(`$ ${pretty}`);
}
