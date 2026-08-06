/**
 * master_demo.ts — DÉMO du jalon critique audio.
 * Applique la chaîne de mastering (étape 6) directement sur work/source.wav
 * (audio réel non coupé, faute de transcript pour l'EDL) afin de valider que le
 * traitement atteint les cibles de la référence et de fournir un fichier à
 * écouter. Le pipeline réel masterisera work/cut.wav.
 *
 * Usage : tsx src/dev/master_demo.ts
 */

import path from 'node:path';
import { DIRS, FILES } from '../config.ts';
import { ensureDir, exists } from '../util/fs.ts';
import { masterAudio } from '../steps/06_master_audio.ts';
import { log } from '../util/log.ts';

async function main() {
  if (!exists(FILES.sourceWav)) {
    log.error(`${FILES.sourceWav} absent : lancez d'abord l'étape 1.`);
    process.exit(1);
  }
  ensureDir(DIRS.out);
  const out = path.join(DIRS.out, 'audio_master_demo.wav');
  const report = path.join(DIRS.out, 'audio_report_demo.json');
  await masterAudio(FILES.sourceWav, out, report);
  log.ok(`Démo audio : ${out}`);
}

main().catch((e) => {
  log.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
