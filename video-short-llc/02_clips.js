#!/usr/bin/env node
/**
 * 02_clips.js — Génération des clips vidéo via fal.ai (file d'attente async).
 *
 * Les 7 générations partent en parallèle. Chaque clip est retenté en cas
 * d'échec, et les clips déjà présents sont ignorés (reprise sans surcoût).
 *
 * Sorties : clips/scene_01.mp4 … clips/scene_07.mp4, clips/manifest.json
 *
 * Options :
 *   --force        régénère même si le fichier existe déjà
 *   --only 3,5     ne (re)génère que ces segments
 */

import fs from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  ROOT, dir, ensureDirs, loadScript, loadConfig, writeJson,
  log, requireEnv, withRetry, pool, sleep, probeDuration, fmtDuration,
} from './lib/util.js';

const QUEUE = 'https://queue.fal.run';

const authHeaders = (key) => ({ Authorization: `Key ${key}`, 'Content-Type': 'application/json' });

function buildInput(segment, cfg) {
  const prompt = [segment.prompt, cfg.clips.promptSuffix].filter(Boolean).join(', ');
  return {
    prompt,
    duration: String(cfg.clips.durationSeconds),
    aspect_ratio: cfg.clips.aspectRatio,
    negative_prompt: cfg.clips.negativePrompt,
  };
}

async function submit(model, input, key) {
  const res = await fetch(`${QUEUE}/${model}`, {
    method: 'POST',
    headers: authHeaders(key),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.text();
    if (res.status === 401 || res.status === 403) {
      throw Object.assign(new Error(`fal.ai ${res.status} : clé refusée. ${body.slice(0, 200)}`), { fatal: true });
    }
    throw new Error(`fal.ai submit ${res.status} : ${body.slice(0, 300)}`);
  }
  return res.json();
}

async function waitForResult(job, key, cfg, label) {
  const deadline = Date.now() + cfg.clips.timeoutMs;
  const statusUrl = job.status_url || `${QUEUE}/${job.request_id}/status`;
  let lastStatus = '';

  while (Date.now() < deadline) {
    const res = await fetch(statusUrl, { headers: authHeaders(key) });
    if (!res.ok) throw new Error(`fal.ai status ${res.status} : ${(await res.text()).slice(0, 200)}`);
    const data = await res.json();

    if (data.status !== lastStatus) {
      lastStatus = data.status;
      log.info(`${label} — ${data.status}`);
    }

    if (data.status === 'COMPLETED') {
      const url = job.response_url || data.response_url;
      const out = await fetch(url, { headers: authHeaders(key) });
      if (!out.ok) throw new Error(`fal.ai response ${out.status} : ${(await out.text()).slice(0, 200)}`);
      return out.json();
    }
    if (data.status === 'FAILED' || data.status === 'ERROR') {
      throw new Error(`génération échouée : ${JSON.stringify(data).slice(0, 300)}`);
    }
    await sleep(cfg.clips.pollIntervalMs);
  }
  throw new Error(`timeout après ${cfg.clips.timeoutMs / 1000}s`);
}

function extractVideoUrl(result) {
  const v = result?.video ?? result?.videos?.[0] ?? result?.output?.video;
  const url = typeof v === 'string' ? v : v?.url;
  if (!url) throw new Error(`URL vidéo introuvable dans la réponse : ${JSON.stringify(result).slice(0, 300)}`);
  return url;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`téléchargement ${res.status}`);
  const tmp = `${dest}.part`;
  await pipeline(Readable.fromWeb(res.body), fs.createWriteStream(tmp));
  const { size } = fs.statSync(tmp);
  if (size < 10_000) {
    fs.unlinkSync(tmp);
    throw new Error(`fichier trop petit (${size} octets), génération probablement invalide`);
  }
  fs.renameSync(tmp, dest);
  return size;
}

async function generateClip(segment, { key, cfg, force }) {
  const name = `scene_${String(segment.id).padStart(2, '0')}.mp4`;
  const dest = path.join(dir.clips, name);
  const label = `scène ${segment.id}`;

  if (!force && fs.existsSync(dest)) {
    const duration = await probeDuration(dest).catch(() => null);
    if (duration) {
      log.ok(`${label} — déjà présent (${fmtDuration(duration)}), ignoré`);
      return { id: segment.id, file: path.relative(ROOT, dest), duration, skipped: true };
    }
    log.warn(`${label} — fichier existant illisible, régénération`);
  }

  return withRetry(label, async () => {
    try {
      const job = await submit(cfg.clips.model, buildInput(segment, cfg), key);
      log.info(`${label} — soumis (${job.request_id})`);
      const result = await waitForResult(job, key, cfg, label);
      const url = extractVideoUrl(result);
      const size = await download(url, dest);
      const duration = await probeDuration(dest);
      log.ok(`${label} — ${fmtDuration(duration)}, ${(size / 1e6).toFixed(1)} Mo`);
      return { id: segment.id, file: path.relative(ROOT, dest), duration, bytes: size, skipped: false };
    } catch (err) {
      if (err.fatal) {
        log.err(err.message);
        process.exit(1);
      }
      throw err;
    }
  }, { attempts: cfg.clips.maxAttempts });
}

async function main() {
  ensureDirs();
  const key = requireEnv('FAL_KEY', 'export FAL_KEY=... (ou renseigne .env)');
  const script = loadScript();
  const cfg = loadConfig();

  const force = process.argv.includes('--force');
  const onlyArg = process.argv[process.argv.indexOf('--only') + 1];
  if (process.argv.includes('--only') && !onlyArg) {
    log.err('--only attend une liste d\'identifiants, ex. --only 3,5');
    process.exit(2);
  }
  const only = onlyArg && process.argv.includes('--only')
    ? new Set(onlyArg.split(',').map((s) => parseInt(s.trim(), 10)))
    : null;

  const segments = script.segments.filter((s) => !only || only.has(s.id));

  log.step(`Clips fal.ai — ${segments.length} scènes, ${cfg.clips.model}`);
  log.info(`${cfg.clips.durationSeconds}s · ${cfg.clips.aspectRatio} · concurrence ${cfg.clips.concurrency}`);

  const results = await pool(segments, cfg.clips.concurrency, (seg) =>
    generateClip(seg, { key, cfg, force }),
  );

  writeJson(path.join(dir.clips, 'manifest.json'), {
    generatedAt: new Date().toISOString(),
    model: cfg.clips.model,
    clips: results,
  });

  const made = results.filter((r) => !r.skipped).length;
  log.ok(`${results.length} clips prêts (${made} généré(s), ${results.length - made} réutilisé(s))`);
}

main().catch((err) => {
  log.err(err.message);
  process.exit(1);
});
