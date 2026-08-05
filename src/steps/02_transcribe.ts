/**
 * Étape 2 — Transcription mot à mot.
 * WhisperX large-v3, fr, alignement forcé → work/transcript.json.
 * Un objet par mot : { i, text, start, end, score }.
 *
 * JALON 1 : stub. Appel WhisperX (venv Python) au jalon 2.
 */

import type { Step } from '../pipeline.ts';
import { FILES } from '../config.ts';
import { writeStubOutputs } from '../util/stub.ts';

export const step02: Step = {
  id: '02',
  name: 'Transcription WhisperX (large-v3, fr, alignement forcé)',
  version: 1,
  inputs: () => [FILES.sourceWav],
  outputs: () => [FILES.transcript],
  async run(ctx) {
    writeStubOutputs(this.id, this.outputs(ctx));
  },
};
