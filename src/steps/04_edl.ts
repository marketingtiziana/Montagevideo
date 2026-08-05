/**
 * Étape 4 — EDL.
 * Respiration 130 ms avant / 180 ms après. Coupe min 90 ms. Silence max 250 ms
 * ramené à 220 ms. Points arrondis à la frame, audio au zero-crossing (±8 ms).
 * Crossfade audio 18 ms sur chaque jointure. Max 3 coupes / 2 s.
 * → work/edl.json (segments en frames + secondes + stats).
 *
 * JALON 1 : stub. Calcul EDL au jalon 3 (livrable --dry-run-edl).
 */

import type { Step } from '../pipeline.ts';
import { FILES } from '../config.ts';
import { writeStubOutputs } from '../util/stub.ts';

export const step04: Step = {
  id: '04',
  name: 'EDL (respiration, zero-crossing, crossfade 18 ms, stats)',
  version: 1,
  inputs: () => [FILES.editorial, FILES.transcript],
  outputs: () => [FILES.edl],
  async run(ctx) {
    writeStubOutputs(this.id, this.outputs(ctx));
  },
};
