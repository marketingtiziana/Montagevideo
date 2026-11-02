import rough from 'roughjs/bin/rough';
import type { Options } from 'roughjs/bin/core';

export interface RoughPath {
  d: string;
  stroke: string;
  strokeWidth: number;
  fill: string;
}

const generator = rough.generator();

function toPaths(drawable: ReturnType<typeof generator.path>): RoughPath[] {
  return generator.toPaths(drawable).map((p) => ({
    d: p.d,
    stroke: p.stroke,
    strokeWidth: p.strokeWidth,
    fill: p.fill ?? 'none',
  }));
}

/** Courbe « dessinée à la main » à partir d'un chemin SVG (déterministe via `seed`). */
export function roughCurvePaths(d: string, opts: { seed: number; stroke: string; strokeWidth?: number; roughness?: number }): RoughPath[] {
  const options: Options = {
    seed: opts.seed,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 2,
    roughness: opts.roughness ?? 1.3,
    bowing: 1.2,
    disableMultiStroke: true,
    preserveVertices: true,
  };
  return toPaths(generator.path(d, options));
}

/** Rectangle à coins arrondis, tracé à la main (bordure des callouts). */
export function roughRectPaths(
  w: number,
  h: number,
  opts: { seed: number; stroke: string; strokeWidth?: number; radius?: number; roughness?: number },
): RoughPath[] {
  const r = Math.min(opts.radius ?? 16, w / 2, h / 2);
  const inset = 1.5;
  const x0 = inset;
  const y0 = inset;
  const x1 = w - inset;
  const y1 = h - inset;
  const d = [
    `M ${x0 + r} ${y0}`,
    `L ${x1 - r} ${y0}`,
    `Q ${x1} ${y0} ${x1} ${y0 + r}`,
    `L ${x1} ${y1 - r}`,
    `Q ${x1} ${y1} ${x1 - r} ${y1}`,
    `L ${x0 + r} ${y1}`,
    `Q ${x0} ${y1} ${x0} ${y1 - r}`,
    `L ${x0} ${y0 + r}`,
    `Q ${x0} ${y0} ${x0 + r} ${y0}`,
    'Z',
  ].join(' ');
  const options: Options = {
    seed: opts.seed,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 1.8,
    roughness: opts.roughness ?? 1.1,
    bowing: 0.8,
    disableMultiStroke: false,
    preserveVertices: true,
  };
  return toPaths(generator.path(d, options));
}

/** Petite flèche « à la main » à l'extrémité d'un lien. */
export function roughArrowPaths(
  x: number,
  y: number,
  angle: number,
  opts: { seed: number; stroke: string; strokeWidth?: number; size?: number },
): RoughPath[] {
  const s = opts.size ?? 10;
  const a1 = angle + Math.PI * 0.8;
  const a2 = angle - Math.PI * 0.8;
  const p1: [number, number] = [x + Math.cos(a1) * s, y + Math.sin(a1) * s];
  const p2: [number, number] = [x + Math.cos(a2) * s, y + Math.sin(a2) * s];
  const options: Options = {
    seed: opts.seed,
    stroke: opts.stroke,
    strokeWidth: opts.strokeWidth ?? 2,
    roughness: 0.9,
    disableMultiStroke: true,
  };
  return toPaths(generator.linearPath([p1, [x, y], p2], options));
}
