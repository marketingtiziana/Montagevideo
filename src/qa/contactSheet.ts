/**
 * contactSheet.ts — planche-contact out/contact_sheet.jpg.
 * 12 vignettes à intervalles réguliers, pour un contrôle visuel humain en 5 s.
 *
 * JALON 1 : stub. Extraction ffmpeg (fps=tiles/durée, tile 3x4) au jalon 8.
 */

import { FILES, QA } from '../config.ts';
import { log } from '../util/log.ts';
import { exists } from '../util/fs.ts';

export async function buildContactSheet(): Promise<void> {
  if (!exists(FILES.finalMp4)) {
    log.warn(`Planche-contact : rendu final absent (${FILES.finalMp4}). Ignoré au jalon 1.`);
    return;
  }
  // TODO jalon 8 : ffmpeg select + tile 3x4 → out/contact_sheet.jpg
  log.info(`Planche-contact : ${QA.contactSheet.tiles} vignettes → ${FILES.contactSheet} (à implémenter).`);
}
