/**
 * contactSheet.ts — planche-contact out/contact_sheet.jpg.
 * 12 vignettes à intervalles réguliers (grille 3×4), pour un contrôle visuel
 * humain en 5 secondes.
 * Usage : tsx src/qa/contactSheet.ts [reel.mp4]
 */

import { FILES, QA } from '../config.ts';
import { ffprobe, ffmpeg } from '../util/ffmpeg.ts';
import { exists } from '../util/fs.ts';
import { log } from '../util/log.ts';

export async function buildContactSheet(reel: string, out: string): Promise<void> {
  if (!exists(reel)) {
    log.warn(`Planche-contact : reel absent (${reel}).`);
    return;
  }
  const { durationS } = await ffprobe(reel);
  const tiles = QA.contactSheet.tiles;
  // Une vignette toutes les durationS/tiles secondes (intervalles réguliers).
  const fps = tiles / durationS;
  const cols = 3;
  const rows = Math.ceil(tiles / cols);
  await ffmpeg([
    '-i', reel,
    '-vf', `fps=${fps.toFixed(6)},scale=320:-1,tile=${cols}x${rows}`,
    '-frames:v', '1',
    '-q:v', '3',
    out,
  ]);
  log.ok(`Planche-contact : ${tiles} vignettes → ${out}`);
}

// Exécution directe.
if (import.meta.url === `file://${process.argv[1]}`) {
  const reel = process.argv[2] ?? FILES.finalMp4;
  buildContactSheet(reel, FILES.contactSheet).catch((e) => {
    log.error(e instanceof Error ? e.message : String(e));
    process.exitCode = 1;
  });
}
