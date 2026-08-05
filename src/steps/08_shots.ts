/**
 * Étape 8 — Plans et rythme.
 * Recadrages fixes wide/medium/close (1.00 / 1.12 / 1.26), changement uniquement
 * aux coupes, jamais deux fois la même valeur consécutivement. Coupe toutes les
 * 3–5 s, jamais > 6 s. Inserts issus du plan de Claude (35–40 % plein écran
 * graphique). → work/shots.json (timeline de plans + inserts).
 *
 * JALON 1 : stub. Calcul du plan de montage au jalon 8.
 */

import type { Step } from '../pipeline.ts';
import { FILES } from '../config.ts';
import { writeStubOutputs } from '../util/stub.ts';

export const step08: Step = {
  id: '08',
  name: 'Plans & rythme (recadrages + placement inserts)',
  version: 1,
  inputs: () => [FILES.edl, FILES.editorial],
  outputs: () => [FILES.shots],
  async run(ctx) {
    writeStubOutputs(this.id, this.outputs(ctx));
  },
};
