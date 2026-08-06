/**
 * stub.ts — écriture de sorties "placeholder" pour les étapes non encore
 * implémentées. Permet de chaîner tout le pipeline (jalon 1) et de vérifier
 * le cache / --from avant d'avoir la logique réelle.
 *
 * Chaque placeholder est marqué `__stub__: true` : le QA et les étapes aval
 * peuvent détecter qu'il ne s'agit pas d'un vrai livrable.
 */

import path from 'node:path';
import fs from 'node:fs';
import { ensureDir, writeJson } from './fs.ts';

/** Écrit un placeholder pour chaque sortie déclarée (JSON marqué, sinon fichier note). */
export function writeStubOutputs(stepId: string, outputs: string[]): void {
  for (const out of outputs) {
    ensureDir(path.dirname(out));
    if (out.endsWith('.json')) {
      writeJson(out, { __stub__: true, step: stepId, note: 'placeholder — jalon 1' });
    } else {
      fs.writeFileSync(out, `__stub__ ${stepId} — placeholder (jalon 1)\n`);
    }
  }
}

/** Vrai si un fichier JSON est un placeholder de jalon 1. */
export function isStub(obj: unknown): boolean {
  return Boolean(obj && typeof obj === 'object' && (obj as Record<string, unknown>).__stub__);
}
