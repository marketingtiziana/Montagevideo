/**
 * pipeline.ts — contrat d'étape + orchestrateur.
 *
 * Chaque étape déclare ses entrées (fichiers dont dépend son hash) et ses
 * sorties. L'orchestrateur saute une étape si son hash d'entrée est inchangé
 * et que ses sorties existent (idempotence). `--from <id>` force la reprise à
 * partir d'une étape.
 */

import { hashFile, hashValue, exists } from './util/fs.ts';
import { isFresh, commit } from './util/cache.ts';
import { log } from './util/log.ts';

export interface PipelineOptions {
  input: string;
  lang: string;
  dryRunEdl: boolean;
  from?: string;
  force: boolean;
}

export interface StepContext {
  opts: PipelineOptions;
}

export interface Step {
  /** Identifiant à deux chiffres, ex. "01". Utilisé par --from. */
  id: string;
  /** Nom lisible. */
  name: string;
  /** Version : à incrémenter quand la logique change, pour invalider le cache. */
  version: number;
  /** Fichiers d'entrée dont dépend le hash (peuvent ne pas exister au dry-run). */
  inputs(ctx: StepContext): string[];
  /** Fichiers de sortie produits. */
  outputs(ctx: StepContext): string[];
  /** Exécution effective. */
  run(ctx: StepContext): Promise<void>;
  /** Si vrai, l'étape n'est pas mise en cache (toujours ré-exécutée). */
  noCache?: boolean;
}

/** Hash d'entrée : version + hash de chaque entrée existante + options pertinentes. */
function inputHash(step: Step, ctx: StepContext): string {
  const parts: string[] = [`v${step.version}`, `lang:${ctx.opts.lang}`];
  for (const f of step.inputs(ctx)) {
    parts.push(exists(f) ? `${f}:${hashFile(f)}` : `${f}:missing`);
  }
  return hashValue(parts);
}

export interface RunReport {
  ran: string[];
  skipped: string[];
}

export async function runPipeline(steps: Step[], opts: PipelineOptions): Promise<RunReport> {
  const ctx: StepContext = { opts };
  const report: RunReport = { ran: [], skipped: [] };

  let startIdx = 0;
  if (opts.from) {
    startIdx = steps.findIndex((s) => s.id === opts.from);
    if (startIdx < 0) throw new Error(`Étape --from ${opts.from} inconnue.`);
    log.info(`Reprise à partir de l'étape ${opts.from} (${steps[startIdx]!.name}).`);
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (i < startIdx) {
      report.skipped.push(step.id);
      continue;
    }

    // Le dry-run EDL s'arrête après l'étape 04.
    if (opts.dryRunEdl && Number(step.id) > 4) {
      log.info(`--dry-run-edl : arrêt après l'étape 04 (étape ${step.id} non exécutée).`);
      break;
    }

    const outputs = step.outputs(ctx);
    const hash = step.noCache ? '' : inputHash(step, ctx);

    if (!opts.force && !step.noCache && isFresh(step.id, hash, outputs)) {
      log.cache(`${step.id} ${step.name}`);
      report.skipped.push(step.id);
      continue;
    }

    log.step(step.id, step.name);
    const t0 = Date.now();
    await step.run(ctx);
    const dt = ((Date.now() - t0) / 1000).toFixed(1);

    if (!step.noCache) commit(step.id, hash, outputs);
    log.ok(`${step.id} ${step.name} — ${dt}s`);
    report.ran.push(step.id);
  }

  return report;
}
