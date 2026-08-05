/**
 * Étape 3 — Nettoyage de la parole.
 * Trois détections combinées (acoustique + lexicale + éditoriale Claude),
 * fusion par priorité keep_overrides > claude > lexical > acoustique.
 * Claude renvoie aussi le plan des inserts. → work/editorial.json.
 *
 * Critère chiffré : aucun silence > 250 ms sous -38 dB dans le rendu final.
 *
 * JALON 1 : stub. Détections + API Claude au jalon 3.
 */

import type { Step } from '../pipeline.ts';
import { FILES } from '../config.ts';
import { writeStubOutputs } from '../util/stub.ts';

export const step03: Step = {
  id: '03',
  name: 'Nettoyage parole (acoustique + lexical + Claude) + plan inserts',
  version: 1,
  inputs: () => [FILES.transcript, FILES.sourceWav],
  outputs: () => [FILES.editorial],
  async run(ctx) {
    writeStubOutputs(this.id, this.outputs(ctx));
  },
};
