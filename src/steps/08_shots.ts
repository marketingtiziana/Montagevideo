/**
 * Étape 8 — Plans et rythme.
 * Facecam décliné en 3 recadrages fixes (wide 1.00 / medium 1.12 / close 1.26),
 * statiques, changés uniquement aux coupes et jamais deux fois la même valeur
 * consécutivement. Une coupe toutes les 3–5 s, jamais > 6 s. Inserts plein écran
 * issus du plan éditorial (35–40 % de plein écran graphique). → work/shots.json.
 */

import type { Step } from '../pipeline.ts';
import { FILES, SHOTS, OUTPUT } from '../config.ts';
import type { Edl, Interval } from '../types.ts';
import { readJson, writeJson, exists } from '../util/fs.ts';
import { log } from '../util/log.ts';

const FPS = OUTPUT.fps;

export interface ShotSpan {
  startFrame: number;
  endFrame: number;
  kind: 'facecam' | 'insert';
  scale?: 'wide' | 'medium' | 'close';
  universe?: 'paper' | 'dark';
  template?: string;
  props?: Record<string, unknown>;
  justification?: string;
}

export interface ShotsData {
  fps: number;
  durationFrames: number;
  spans: ShotSpan[];
  stats: { graphicShare: number; insertCount: number; cutCount: number; warnings: string[] };
}

/** Mappe un instant source (s) vers l'instant de sortie (s) via l'EDL. */
export function mapSourceToOutput(edl: Edl, tSource: number): number | null {
  for (const s of edl.segments) {
    if (tSource >= s.srcStart && tSource <= s.srcEnd) {
      return s.outStart + (tSource - s.srcStart);
    }
  }
  return null; // instant coupé
}

/** Alterne les recadrages sans répéter la valeur précédente. */
function nextScale(prev?: 'wide' | 'medium' | 'close'): 'wide' | 'medium' | 'close' {
  const order: Array<'wide' | 'medium' | 'close'> = ['wide', 'medium', 'close'];
  const choices = order.filter((s) => s !== prev);
  // Choix déterministe : rotation stable (pas de Math.random).
  return choices[(prev ? order.indexOf(prev) : 0) % choices.length]!;
}

/** Découpe une plage facecam [a,b] (frames) en plans de 3–5 s, ≤ 6 s. */
function fillFacecam(aF: number, bF: number, startPrev: 'wide' | 'medium' | 'close' | undefined, spans: ShotSpan[]): 'wide' | 'medium' | 'close' | undefined {
  const minF = SHOTS.cutIntervalMinS * FPS;
  const maxF = SHOTS.cutIntervalMaxS * FPS;
  let cursor = aF;
  let prev = startPrev;
  let i = 0;
  while (cursor < bF) {
    // Longueur déterministe alternant dans [min,max].
    const len = minF + ((i % (maxF - minF + 1)));
    const end = Math.min(bF, cursor + len);
    const scale = nextScale(prev);
    spans.push({ startFrame: cursor, endFrame: end, kind: 'facecam', scale });
    prev = scale;
    cursor = end;
    i++;
  }
  return prev;
}

/** Construit la timeline de plans. `inserts` sont en temps de SORTIE (s). */
export function buildShots(durationFrames: number, inserts: Array<Interval & { universe?: 'paper' | 'dark'; template?: string; props?: Record<string, unknown>; justification?: string }>): ShotsData {
  const warnings: string[] = [];
  const sorted = [...inserts].sort((a, b) => a.start - b.start);
  const spans: ShotSpan[] = [];
  let cursor = 0;
  let prevScale: 'wide' | 'medium' | 'close' | undefined;

  for (const ins of sorted) {
    const sF = Math.round(ins.start * FPS);
    const eF = Math.round(ins.end * FPS);
    if (sF > cursor) prevScale = fillFacecam(cursor, sF, prevScale, spans);
    spans.push({
      startFrame: sF,
      endFrame: eF,
      kind: 'insert',
      universe: ins.universe,
      template: ins.template,
      props: ins.props,
      justification: ins.justification,
    });
    cursor = eF;
  }
  if (cursor < durationFrames) fillFacecam(cursor, durationFrames, prevScale, spans);

  // Contrôle de densité : jamais > 6 s sans changement d'image.
  for (const s of spans) {
    if (s.endFrame - s.startFrame > SHOTS.maxHoldS * FPS + 1) {
      warnings.push(`Plan > ${SHOTS.maxHoldS}s à ${(s.startFrame / FPS).toFixed(1)}s.`);
    }
  }

  const insertFrames = spans.filter((s) => s.kind === 'insert').reduce((a, s) => a + (s.endFrame - s.startFrame), 0);
  const graphicShare = durationFrames > 0 ? insertFrames / durationFrames : 0;
  if (graphicShare < SHOTS.graphicShareMin || graphicShare > SHOTS.graphicShareMax) {
    warnings.push(`Part plein écran graphique ${(graphicShare * 100).toFixed(0)}% hors cible ${SHOTS.graphicShareMin * 100}-${SHOTS.graphicShareMax * 100}%.`);
  }

  return {
    fps: FPS,
    durationFrames,
    spans,
    stats: {
      graphicShare,
      insertCount: sorted.length,
      cutCount: spans.length - 1,
      warnings,
    },
  };
}

export const step08: Step = {
  id: '08',
  name: 'Plans & rythme (recadrages + placement inserts)',
  version: 2,
  inputs: () => [FILES.edl, FILES.editorial],
  outputs: () => [FILES.shots],
  async run() {
    if (!exists(FILES.edl)) throw new Error(`edl.json absent : ${FILES.edl}`);
    const edl = readJson<Edl>(FILES.edl);
    const durationFrames = Math.round(edl.stats.finalDurationS * FPS);

    // Inserts éditoriaux (source-time) → sortie-time via l'EDL.
    const editorial = exists(FILES.editorial)
      ? readJson<{ inserts?: Array<{ start: number; end: number; universe?: 'paper' | 'dark'; template?: string; justification?: string; columns?: string[][]; text?: string | null }> }>(FILES.editorial)
      : { inserts: [] };
    const mapped: Array<Interval & { universe?: 'paper' | 'dark'; template?: string; props?: Record<string, unknown>; justification?: string }> = [];
    for (const ins of editorial.inserts ?? []) {
      const oS = mapSourceToOutput(edl, ins.start);
      const oE = mapSourceToOutput(edl, ins.end);
      if (oS == null || oE == null || oE <= oS) continue;
      mapped.push({ start: oS, end: oE, universe: ins.universe, template: ins.template, justification: ins.justification, props: { columns: ins.columns, text: ins.text } });
    }

    const shots = buildShots(durationFrames, mapped);
    writeJson(FILES.shots, shots);
    log.ok(`Plans : ${shots.spans.length} spans, ${shots.stats.insertCount} inserts, ${(shots.stats.graphicShare * 100).toFixed(0)}% graphique.`);
    for (const w of shots.stats.warnings) log.warn(w);
  },
};
