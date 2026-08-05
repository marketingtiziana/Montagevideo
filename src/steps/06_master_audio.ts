/**
 * Étape 6 — Mastering audio.
 * Chaîne dans l'ordre exact : highpass 75 → afftdn → de-esser → EQ correctif →
 * acompressor → alimiter → loudnorm 2 passes. Room tone -58 dBFS en boucle.
 * Cibles : -14 LUFS (±0.5), LRA 3–4, TP -1 dBTP. Aucune musique.
 * → work/audio_master.wav + work/audio_report.json.
 *
 * JALON 1 : stub. Chaîne ffmpeg + mesures au jalon 4 (jalon critique).
 */

import type { Step } from '../pipeline.ts';
import { FILES } from '../config.ts';
import { writeStubOutputs } from '../util/stub.ts';

export const step06: Step = {
  id: '06',
  name: 'Mastering audio (chaîne complète + room tone + loudnorm 2 passes)',
  version: 1,
  inputs: () => [FILES.cutWav],
  outputs: () => [FILES.audioMaster, FILES.audioReport],
  async run(ctx) {
    writeStubOutputs(this.id, this.outputs(ctx));
  },
};
