/**
 * Étape 9 — Étalonnage facecam + rendu Remotion final.
 * Étalonnage (§12) appliqué en filtre ffmpeg AVANT Remotion :
 *   désat 0.75, noirs relevés (rien < 12 % luma), hautes lumières < 92 %,
 *   image nettement sombre (médiane ~77/255), légère dominante chaude
 *   (rouge +3 %, bleu −2 %). → facecam_graded.mp4.
 * Puis composition Remotion (Reel.tsx) : facecam étalonné + sous-titres +
 * inserts + audio master → out/reel.mp4.
 *
 * Le rendu Remotion final (assemblage complet) est le jalon 8.
 */

import type { Step } from '../pipeline.ts';
import { FILES, GRADE, NORMALIZE } from '../config.ts';
import { ffmpeg } from '../util/ffmpeg.ts';
import { exists } from '../util/fs.ts';
import { log } from '../util/log.ts';

/** Chaîne d'étalonnage ffmpeg (§12). Achromatique-compatible, look sobre/sombre. */
export function buildGradeFilter(): string {
  const g = GRADE;
  const romin = (g.blackFloorPct / 100).toFixed(3); // noirs relevés à 12 %
  const romax = (g.highlightCeilPct / 100).toFixed(3); // hautes lumières sous 92 %
  return [
    `eq=saturation=${g.saturation}`,
    // Dominante chaude : rouge +3 %, bleu −2 %.
    `colorchannelmixer=rr=${(1 + g.redGainPct / 100).toFixed(3)}:gg=1:bb=${(1 + g.blueGainPct / 100).toFixed(3)}`,
    // Compression de la plage tonale : noirs → 12 %, hautes lumières → 92 %.
    `colorlevels=romin=${romin}:gomin=${romin}:bomin=${romin}:romax=${romax}:gomax=${romax}:bomax=${romax}`,
    // Image nettement sombre (médiane visée ~77/255) : léger gamma < 1.
    `eq=gamma=0.88`,
  ].join(',');
}

/** Applique l'étalonnage à un fichier vidéo. */
export async function gradeFacecam(input: string, output: string): Promise<void> {
  await ffmpeg([
    '-i', input,
    '-vf', buildGradeFilter(),
    '-r', String(NORMALIZE.fps),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
    '-c:a', 'copy',
    output,
  ]);
}

export const step09: Step = {
  id: '09',
  name: 'Étalonnage facecam + rendu Remotion (Reel.tsx)',
  version: 2,
  inputs: () => [FILES.cutMp4, FILES.audioMaster, FILES.captions, FILES.shots],
  outputs: () => [FILES.gradedMp4, FILES.finalMp4],
  async run() {
    if (!exists(FILES.cutMp4)) throw new Error(`cut.mp4 absent : ${FILES.cutMp4} (étape 5 requise).`);
    log.info('Étalonnage du facecam (§12)…');
    await gradeFacecam(FILES.cutMp4, FILES.gradedMp4);
    log.ok(`Facecam étalonné → ${FILES.gradedMp4}`);
    // TODO jalon 8 : rendu Remotion (Reel.tsx) = facecam étalonné + sous-titres
    // + inserts + audio master → out/reel.mp4.
    log.warn('Rendu Remotion final (assemblage jalon 8) : à implémenter.');
  },
};
