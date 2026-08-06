/** cache.ts — cache disque par hash, pour des étapes idempotentes. */

import path from 'node:path';
import { DIRS } from '../config.ts';
import { ensureDir, exists, readJson, writeJson } from './fs.ts';

interface CacheMarker {
  hash: string;
  outputs: string[];
  at: string;
}

function markerPath(stepId: string): string {
  return path.join(DIRS.cache, `${stepId}.json`);
}

/**
 * Renvoie vrai si l'étape peut être sautée : marqueur présent, hash identique,
 * et tous les fichiers de sortie existent encore.
 */
export function isFresh(stepId: string, hash: string, outputs: string[]): boolean {
  const mp = markerPath(stepId);
  if (!exists(mp)) return false;
  const m = readJson<CacheMarker>(mp);
  if (m.hash !== hash) return false;
  return outputs.every((o) => exists(o));
}

/** Écrit le marqueur de cache après une exécution réussie. */
export function commit(stepId: string, hash: string, outputs: string[]): void {
  ensureDir(DIRS.cache);
  writeJson(markerPath(stepId), {
    hash,
    outputs,
    at: new Date().toISOString(),
  } satisfies CacheMarker);
}
