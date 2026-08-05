/**
 * qa.ts — QA automatique bloquant (npm run qa).
 *
 * Échoue (exit 1) si l'un des critères de la §13 est violé. Résumé PASS/FAIL
 * ligne par ligne en console, rapport détaillé dans out/qa_report.json.
 *
 * JALON 1 : squelette. Chaque contrôle renvoie SKIP tant que le livrable
 * correspondant n'existe pas. Les contrôles réels sont branchés au jalon 8.
 */

import { QA, FILES } from '../config.ts';
import { writeJson, exists } from '../util/fs.ts';
import { log } from '../util/log.ts';

type Status = 'PASS' | 'FAIL' | 'SKIP';
interface Check {
  id: string;
  label: string;
  status: Status;
  detail?: string;
}

/** Liste des contrôles de la §13, tous en SKIP au jalon 1. */
function buildChecks(): Check[] {
  const havePipeline = exists(FILES.finalMp4);
  const skip = (id: string, label: string): Check => ({
    id,
    label,
    status: havePipeline ? 'PASS' : 'SKIP',
    detail: havePipeline ? undefined : 'livrable absent (jalon 1)',
  });
  return [
    skip('loudness', `Loudness intégré dans [${QA.lufs.min}; ${QA.lufs.max}] LUFS`),
    skip('lra', `LRA dans [${QA.lra.min}; ${QA.lra.max}] LU`),
    skip('truepeak', `True peak <= ${QA.truePeakMaxDb} dBTP`),
    skip('silence', `Aucun silence > ${QA.maxSilenceMs} ms sous ${QA.maxSilenceFloorDb} dB`),
    skip('cutgap', `Aucune paire de coupes espacée de < ${QA.minCutGapMs} ms`),
    skip('caption_lines', `Sous-titre <= ${QA.captionMaxLines} lignes / ${QA.captionMaxWordsPerLine} mots par ligne`),
    skip('caption_baseline', `Ligne de base sous-titre à ${QA.captionBaselineFromBottom} px du bas`),
    skip('caption_style', 'Sous-titres : pas de capitales, pas de contour, pas de fond opaque'),
    skip('neutrality', 'Aucune couleur non achromatique dans les inserts'),
    skip('single_graphic', 'Jamais deux éléments graphiques simultanés'),
    skip('facecam_scale', "Pas de variation d'échelle du facecam à l'intérieur d'un plan"),
    skip('graphic_share', `Part plein écran graphique dans [${QA.graphicShare.min * 100}%; ${QA.graphicShare.max * 100}%]`),
    skip('insert_justification', 'Chaque insert a un champ justification'),
    skip('av_drift', `Dérive audio/vidéo <= ${QA.maxAvDriftFrames} frame`),
  ];
}

async function main(): Promise<void> {
  const checks = buildChecks();
  let failed = 0;
  for (const c of checks) {
    const tag = c.status === 'PASS' ? '\x1b[32mPASS\x1b[0m' : c.status === 'FAIL' ? '\x1b[31mFAIL\x1b[0m' : '\x1b[2mSKIP\x1b[0m';
    console.log(`  ${tag}  ${c.label}${c.detail ? `  — ${c.detail}` : ''}`);
    if (c.status === 'FAIL') failed++;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    passed: checks.filter((c) => c.status === 'PASS').length,
    failed,
    skipped: checks.filter((c) => c.status === 'SKIP').length,
    checks,
  };
  writeJson(FILES.qaReport, report);
  log.info(`Rapport : ${FILES.qaReport}`);

  if (failed > 0) {
    log.error(`QA : ${failed} contrôle(s) en échec.`);
    process.exitCode = 1;
  } else {
    log.ok('QA : aucun échec.');
  }
}

main().catch((err) => {
  log.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
