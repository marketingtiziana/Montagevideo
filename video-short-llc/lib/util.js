import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const dir = {
  clips: path.join(ROOT, 'clips'),
  work: path.join(ROOT, 'work'),
  output: path.join(ROOT, 'output'),
  assets: path.join(ROOT, 'assets'),
};

export function ensureDirs() {
  for (const d of Object.values(dir)) fs.mkdirSync(d, { recursive: true });
}

export function readJson(p) {
  return JSON.parse(fs.readFileSync(path.isAbsolute(p) ? p : path.join(ROOT, p), 'utf8'));
}

export function writeJson(p, data) {
  const abs = path.isAbsolute(p) ? p : path.join(ROOT, p);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, JSON.stringify(data, null, 2) + '\n');
  return abs;
}

export const loadScript = () => readJson('script.json');
export const loadConfig = () => readJson('config.json');

/* ---------- logging ---------- */

const t0 = Date.now();
const stamp = () => `${((Date.now() - t0) / 1000).toFixed(1)}s`.padStart(7);

export const log = {
  step: (m) => console.log(`\n\x1b[1m\x1b[36m▶ ${m}\x1b[0m`),
  info: (m) => console.log(`  [${stamp()}] ${m}`),
  ok: (m) => console.log(`  [${stamp()}] \x1b[32m✓\x1b[0m ${m}`),
  warn: (m) => console.log(`  [${stamp()}] \x1b[33m!\x1b[0m ${m}`),
  err: (m) => console.error(`  [${stamp()}] \x1b[31m✗\x1b[0m ${m}`),
};

/* ---------- env ---------- */

// Minimal .env loader so the pipeline works without extra dependencies.
export function loadDotEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const raw of fs.readFileSync(p, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

export function requireEnv(name, hint) {
  loadDotEnv();
  const v = process.env[name];
  if (!v) {
    log.err(`Variable d'environnement manquante : ${name}`);
    if (hint) console.error(`     ${hint}`);
    process.exit(1);
  }
  return v;
}

/* ---------- retry ---------- */

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function withRetry(label, fn, { attempts = 3, baseDelayMs = 2000 } = {}) {
  let lastErr;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await fn(i);
    } catch (err) {
      lastErr = err;
      if (i === attempts) break;
      const delay = baseDelayMs * 2 ** (i - 1);
      log.warn(`${label} — échec ${i}/${attempts} (${err.message}). Nouvel essai dans ${delay / 1000}s`);
      await sleep(delay);
    }
  }
  throw new Error(`${label} — échec après ${attempts} tentatives : ${lastErr?.message}`);
}

/* Run async tasks with a bounded concurrency. */
export async function pool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  });
  await Promise.all(runners);
  return results;
}

/* ---------- ffmpeg ---------- */

export async function ffmpegPath() {
  const mod = await import('ffmpeg-static');
  const p = mod.default;
  if (!p || !fs.existsSync(p)) throw new Error('ffmpeg introuvable (npm install)');
  return p;
}

export async function ffprobePath() {
  const mod = await import('ffprobe-static');
  const p = mod.default.path;
  if (!p || !fs.existsSync(p)) throw new Error('ffprobe introuvable (npm install)');
  return p;
}

export async function runFfmpeg(args, { quiet = true } = {}) {
  const bin = await ffmpegPath();
  const full = ['-hide_banner', '-loglevel', quiet ? 'error' : 'info', '-y', ...args];
  try {
    const { stdout, stderr } = await execFileAsync(bin, full, { maxBuffer: 64 * 1024 * 1024 });
    return { stdout, stderr };
  } catch (err) {
    const detail = (err.stderr || err.message || '').trim().split('\n').slice(-12).join('\n');
    throw new Error(`ffmpeg a échoué:\n${detail}`);
  }
}

export async function probeDuration(file) {
  const bin = await ffprobePath();
  const { stdout } = await execFileAsync(bin, [
    '-v', 'error',
    '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1',
    file,
  ]);
  const d = parseFloat(stdout.trim());
  if (!Number.isFinite(d)) throw new Error(`Durée illisible pour ${file}`);
  return d;
}

export function fmtDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return m > 0 ? `${m}m${s.toFixed(1).padStart(4, '0')}s` : `${s.toFixed(2)}s`;
}

export function fileExists(p) {
  return fs.existsSync(path.isAbsolute(p) ? p : path.join(ROOT, p));
}
