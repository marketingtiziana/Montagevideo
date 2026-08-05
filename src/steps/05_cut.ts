/**
 * Étape 5 — Découpe.
 * Réencodage frame-accurate (jamais -c copy). Concat par le demuxer concat.
 * → work/cut.mp4 + work/cut.wav. Vérif durée ±1 frame vs EDL sinon échec bruyant.
 *
 * JALON 1 : stub. Découpe ffmpeg au jalon 4.
 */

import type { Step } from '../pipeline.ts';
import { FILES } from '../config.ts';
import { writeStubOutputs } from '../util/stub.ts';

export const step05: Step = {
  id: '05',
  name: 'Découpe frame-accurate + concat',
  version: 1,
  inputs: () => [FILES.edl, FILES.normalizedMp4],
  outputs: () => [FILES.cutMp4, FILES.cutWav],
  async run(ctx) {
    writeStubOutputs(this.id, this.outputs(ctx));
  },
};
