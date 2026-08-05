/**
 * Disk cache keyed by (source file hash + params). Every heavy step is
 * idempotent: if its output JSON exists and the input hash is unchanged,
 * the step is skipped with a "cache hit" log line.
 *
 * Layout:  work/<sourceHash>/<name>.json
 * The <sourceHash> namespaces all artefacts for one input+params combination.
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { info } from './log.js';

export interface RunContext {
  workDir: string; // work/<hash>
  outDir: string; // out
  hash: string;
  params: PipelineParams;
}

export interface PipelineParams {
  input: string;
  lang: string;
  preset: string;
  lufs: number;
  maxDuration: number | null;
  roomTone: boolean;
  dryRunEdl: boolean;
  from: number | null;
  model: string; // whisper model
}

/** Hash the first 4MB + size + mtime of a file (fast, good enough as a key). */
export function fileHash(path: string): string {
  const h = createHash('sha256');
  const st = statSync(path);
  h.update(String(st.size));
  h.update(String(Math.floor(st.mtimeMs)));
  const fd = readFileSync(path);
  h.update(fd.subarray(0, Math.min(fd.length, 4 * 1024 * 1024)));
  return h.digest('hex').slice(0, 16);
}

/** Combined hash of the input file and the params that affect all steps. */
export function runHash(params: PipelineParams): string {
  const h = createHash('sha256');
  h.update(fileHash(params.input));
  h.update(JSON.stringify({
    lang: params.lang,
    preset: params.preset,
    lufs: params.lufs,
    maxDuration: params.maxDuration,
    roomTone: params.roomTone,
    model: params.model,
  }));
  return h.digest('hex').slice(0, 16);
}

export function artifactPath(ctx: RunContext, name: string): string {
  return join(ctx.workDir, name);
}

export function readArtifact<T>(ctx: RunContext, name: string): T | null {
  const p = artifactPath(ctx, name);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as T;
  } catch {
    return null;
  }
}

export function writeArtifact<T>(ctx: RunContext, name: string, data: T): string {
  mkdirSync(ctx.workDir, { recursive: true });
  const p = artifactPath(ctx, name);
  writeFileSync(p, JSON.stringify(data, null, 2));
  return p;
}

export function fileExists(ctx: RunContext, name: string): boolean {
  return existsSync(artifactPath(ctx, name));
}

/**
 * Run a step with JSON-artifact caching. `stepHash` is any extra key
 * (e.g. hash of upstream artefact); if the artefact exists it's returned.
 */
export function withCache<T>(
  ctx: RunContext,
  tag: string,
  artifactName: string,
  compute: () => Promise<T> | T,
): Promise<T> {
  const cached = readArtifact<T>(ctx, artifactName);
  if (cached) {
    info(tag, `cache hit, skipping (${artifactName})`);
    return Promise.resolve(cached);
  }
  return Promise.resolve(compute()).then((data) => {
    writeArtifact(ctx, artifactName, data);
    return data;
  });
}
