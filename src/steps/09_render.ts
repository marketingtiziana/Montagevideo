/**
 * Étape 9 — Étalonnage facecam + rendu Remotion final.
 * Étalonnage facecam (LUT/filtre ffmpeg : désat 0.75, noirs > 12 %, hautes
 * lumières < 92 %, médiane ~77/255, dominante chaude) → facecam_graded.mp4.
 * Puis composition Remotion (Reel.tsx) : facecam étalonné + sous-titres +
 * inserts (deux univers) + audio master → out/reel.mp4.
 *
 * JALON 1 : stub. Étalonnage au jalon 8, univers graphiques aux jalons 6–8.
 */

import type { Step } from '../pipeline.ts';
import { FILES } from '../config.ts';
import { writeStubOutputs } from '../util/stub.ts';

export const step09: Step = {
  id: '09',
  name: 'Étalonnage facecam + rendu Remotion (Reel.tsx)',
  version: 1,
  inputs: () => [FILES.cutMp4, FILES.audioMaster, FILES.captions, FILES.shots],
  outputs: () => [FILES.gradedMp4, FILES.finalMp4],
  async run(ctx) {
    writeStubOutputs(this.id, this.outputs(ctx));
  },
};
