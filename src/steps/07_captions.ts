/**
 * Étape 7 — Sous-titres (données de timing pour Remotion).
 * Prépare les blocs cumulatifs mot-à-mot depuis le transcript recalé sur la
 * timeline coupée : ligne 1 (400) / ligne 2 (700), passage ligne 2 à 4 mots
 * ou 20 caractères, effacement à 4 mots ligne 2 / frontière de phrase / 400 ms.
 * Couleur adaptative pilotée par le type de plan. → work/captions.json.
 *
 * Le rendu visuel exact est dans remotion/components/Captions.tsx.
 * JALON 1 : stub. Découpage en blocs au jalon 5.
 */

import type { Step } from '../pipeline.ts';
import { FILES } from '../config.ts';
import { writeStubOutputs } from '../util/stub.ts';

export const step07: Step = {
  id: '07',
  name: 'Sous-titres — blocs cumulatifs (données Remotion)',
  version: 1,
  inputs: () => [FILES.transcript, FILES.edl],
  outputs: () => [FILES.captions],
  async run(ctx) {
    writeStubOutputs(this.id, this.outputs(ctx));
  },
};
