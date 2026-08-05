/**
 * cli.ts — point d'entrée de l'orchestration.
 *
 *   npm run pipeline -- --input ./raw/source.mp4 --lang fr --dry-run-edl
 *   npm run pipeline -- --input ./raw/source.mp4
 *   npm run pipeline -- --input ./raw/source.mp4 --from 07
 */

import { STEPS } from './steps/index.ts';
import { runPipeline, type PipelineOptions } from './pipeline.ts';
import { DIRS } from './config.ts';
import { ensureDir, exists } from './util/fs.ts';
import { log } from './util/log.ts';

interface Parsed {
  input?: string;
  lang: string;
  dryRunEdl: boolean;
  from?: string;
  force: boolean;
  help: boolean;
}

function parseArgs(argv: string[]): Parsed {
  const p: Parsed = { lang: 'fr', dryRunEdl: false, force: false, help: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--input':
      case '-i':
        p.input = argv[++i];
        break;
      case '--lang':
        p.lang = argv[++i] ?? 'fr';
        break;
      case '--from':
        p.from = String(argv[++i]).padStart(2, '0');
        break;
      case '--dry-run-edl':
        p.dryRunEdl = true;
        break;
      case '--force':
        p.force = true;
        break;
      case '--help':
      case '-h':
        p.help = true;
        break;
      default:
        if (a && a.startsWith('--')) log.warn(`Option inconnue ignorée : ${a}`);
    }
  }
  return p;
}

function printHelp(): void {
  const steps = STEPS.map((s) => `    ${s.id}  ${s.name}`).join('\n');
  console.log(`
montagevideo — pipeline de montage (reel vertical 1080x1920, système de référence)

Usage :
  npm run pipeline -- --input <fichier.mp4> [options]

Options :
  -i, --input <path>   Vidéo source (obligatoire pour exécuter)
      --lang <code>    Langue (défaut : fr)
      --from <id>      Reprend à partir d'une étape (ex. 07)
      --dry-run-edl    S'arrête après l'étape 04 et produit l'EDL seule
      --force          Ignore le cache et ré-exécute
  -h, --help           Affiche cette aide

Étapes :
${steps}
`);
}

async function main(): Promise<void> {
  const p = parseArgs(process.argv.slice(2));
  if (p.help) {
    printHelp();
    return;
  }
  if (!p.input) {
    log.error('Argument --input requis. Voir --help.');
    process.exitCode = 1;
    return;
  }
  if (!exists(p.input)) {
    log.error(`Fichier source introuvable : ${p.input}`);
    process.exitCode = 1;
    return;
  }

  ensureDir(DIRS.work);
  ensureDir(DIRS.out);

  const opts: PipelineOptions = {
    input: p.input,
    lang: p.lang,
    dryRunEdl: p.dryRunEdl,
    from: p.from,
    force: p.force,
  };

  log.info(`Source : ${opts.input}`);
  log.info(`Langue : ${opts.lang}${opts.dryRunEdl ? ' | dry-run-edl' : ''}${opts.from ? ` | from ${opts.from}` : ''}`);

  const report = await runPipeline(STEPS, opts);

  log.ok(`Terminé. Exécutées : [${report.ran.join(', ') || '—'}] | Sautées : [${report.skipped.join(', ') || '—'}]`);
}

main().catch((err) => {
  log.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
