/**
 * Étape 1 — Normalisation.
 * ffprobe source → conversion CFR 30 fps (-vsync cfr -r 30) même si VFR/23.976.
 * Extraction audio WAV 48 kHz 24 bit → work/source.wav.
 *
 * JALON 1 : stub. La logique ffmpeg réelle arrive au jalon 2.
 */

import type { Step } from '../pipeline.ts';
import { FILES } from '../config.ts';
import { writeStubOutputs } from '../util/stub.ts';

export const step01: Step = {
  id: '01',
  name: 'Normalisation (CFR 30 + WAV 48k/24b)',
  version: 1,
  inputs: (ctx) => [ctx.opts.input],
  outputs: () => [FILES.normalizedMp4, FILES.sourceWav],
  async run(ctx) {
    writeStubOutputs(this.id, this.outputs(ctx));
  },
};
