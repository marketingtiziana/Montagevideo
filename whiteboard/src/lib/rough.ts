import roughModule from 'roughjs/bundled/rough.cjs.js';
import type {Options} from 'roughjs/bin/core';

// Le build "bundled" expose soit un default ESM, soit l'objet CJS directement.
const rough = ((roughModule as never as {default?: unknown}).default ??
  roughModule) as typeof import('roughjs/bin/rough').default;

const generator = rough.generator();

export type Op = {op: 'move' | 'lineTo' | 'bcurveTo'; data: number[]};
export type OpSet = {type: string; ops: Op[]};

export type Pt = {x: number; y: number};

/** Options par defaut : trait crayon imparfait, jamais de remplissage. */
const baseOptions = (seed: number, overrides?: Options): Options => ({
  roughness: 1.7,
  bowing: 1.2,
  seed,
  // rough n'emet aucun trace si stroke vaut 'none' : on garde une couleur
  // factice ici, la vraie couleur est portee par le <path> React.
  stroke: '#000000',
  strokeWidth: 1,
  disableMultiStroke: false,
  ...overrides,
});

export type ShapeSpec =
  | {kind: 'rect'; x: number; y: number; w: number; h: number}
  | {kind: 'ellipse'; cx: number; cy: number; w: number; h: number}
  | {kind: 'circle'; cx: number; cy: number; d: number}
  | {kind: 'line'; x1: number; y1: number; x2: number; y2: number}
  | {kind: 'polygon'; points: [number, number][]}
  | {kind: 'curve'; points: [number, number][]}
  | {kind: 'path'; d: string}
  | {kind: 'arc'; cx: number; cy: number; w: number; h: number; start: number; stop: number};

const drawableFor = (spec: ShapeSpec, opts: Options) => {
  switch (spec.kind) {
    case 'rect':
      return generator.rectangle(spec.x, spec.y, spec.w, spec.h, opts);
    case 'ellipse':
      return generator.ellipse(spec.cx, spec.cy, spec.w, spec.h, opts);
    case 'circle':
      return generator.circle(spec.cx, spec.cy, spec.d, opts);
    case 'line':
      return generator.line(spec.x1, spec.y1, spec.x2, spec.y2, opts);
    case 'polygon':
      return generator.polygon(spec.points, opts);
    case 'curve':
      return generator.curve(spec.points, opts);
    case 'path':
      return generator.path(spec.d, opts);
    case 'arc':
      return generator.arc(spec.cx, spec.cy, spec.w, spec.h, spec.start, spec.stop, false, opts);
  }
};

/**
 * Transforme une forme en une liste de sous-traces SVG ("d"), dans l'ordre
 * ou un humain les tracerait. Memoise : rough est deterministe a seed fixe.
 */
const cache = new Map<string, string[]>();

export const sketchPaths = (spec: ShapeSpec, seed: number, opts?: Options): string[] => {
  const key = JSON.stringify([spec, seed, opts ?? null]);
  const hit = cache.get(key);
  if (hit) return hit;
  const drawable = drawableFor(spec, baseOptions(seed, opts));
  const out = drawable.sets
    .filter((s) => s.ops.length > 0)
    .map((s) => generator.opsToPath(s))
    .filter((d) => d.trim().length > 0);
  cache.set(key, out);
  return out;
};

/** Les op-sets bruts, utiles pour echantillonner la position du crayon. */
const opsCache = new Map<string, OpSet[]>();

export const sketchOps = (spec: ShapeSpec, seed: number, opts?: Options): OpSet[] => {
  const key = JSON.stringify([spec, seed, opts ?? null]);
  const hit = opsCache.get(key);
  if (hit) return hit;
  const drawable = drawableFor(spec, baseOptions(seed, opts));
  const out = drawable.sets.filter((s) => s.ops.length > 0) as OpSet[];
  opsCache.set(key, out);
  return out;
};

const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, t: number): Pt => {
  const u = 1 - t;
  const a = u * u * u;
  const b = 3 * u * u * t;
  const c = 3 * u * t * t;
  const d = t * t * t;
  return {
    x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
    y: a * p0.y + b * p1.y + c * p2.y + d * p3.y,
  };
};

/**
 * Echantillonne un op-set en polyligne + longueurs cumulees, pour pouvoir
 * placer la pointe du crayon a n'importe quelle fraction du trace.
 */
export const samplePolyline = (sets: OpSet[]): {pts: Pt[]; cum: number[]; total: number} => {
  const pts: Pt[] = [];
  let cursor: Pt = {x: 0, y: 0};
  for (const set of sets) {
    for (const op of set.ops) {
      const d = op.data;
      if (op.op === 'move') {
        cursor = {x: d[0], y: d[1]};
        pts.push(cursor);
      } else if (op.op === 'lineTo') {
        cursor = {x: d[0], y: d[1]};
        pts.push(cursor);
      } else if (op.op === 'bcurveTo') {
        const p0 = cursor;
        const p1 = {x: d[0], y: d[1]};
        const p2 = {x: d[2], y: d[3]};
        const p3 = {x: d[4], y: d[5]};
        for (let i = 1; i <= 10; i++) pts.push(cubic(p0, p1, p2, p3, i / 10));
        cursor = p3;
      }
    }
  }
  const cum: number[] = [0];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i].x - pts[i - 1].x;
    const dy = pts[i].y - pts[i - 1].y;
    total += Math.hypot(dx, dy);
    cum.push(total);
  }
  return {pts, cum, total};
};

/** Position sur la polyligne pour une progression 0..1. */
export const pointAt = (
  sampled: {pts: Pt[]; cum: number[]; total: number},
  progress: number
): Pt => {
  const {pts, cum, total} = sampled;
  if (pts.length === 0) return {x: 0, y: 0};
  const target = Math.max(0, Math.min(1, progress)) * total;
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0) return pts[0];
  const span = cum[lo] - cum[lo - 1];
  const t = span === 0 ? 0 : (target - cum[lo - 1]) / span;
  return {
    x: pts[lo - 1].x + (pts[lo].x - pts[lo - 1].x) * t,
    y: pts[lo - 1].y + (pts[lo].y - pts[lo - 1].y) * t,
  };
};
