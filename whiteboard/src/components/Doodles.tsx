import type {ShapeSpec} from '../lib/rough';

export type Shape = {spec: ShapeSpec; seed?: number; strokeWidth?: number};

/** Fleche droite avec pointe en deux traits. */
export const arrow = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  head = 34,
  seed = 400
): Shape[] => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const s = 0.42; // ouverture de la pointe
  return [
    {spec: {kind: 'line', x1, y1, x2, y2}, seed},
    {
      spec: {
        kind: 'line',
        x1: x2,
        y1: y2,
        x2: x2 - head * Math.cos(a - s),
        y2: y2 - head * Math.sin(a - s),
      },
      seed: seed + 1,
    },
    {
      spec: {
        kind: 'line',
        x1: x2,
        y1: y2,
        x2: x2 - head * Math.cos(a + s),
        y2: y2 - head * Math.sin(a + s),
      },
      seed: seed + 2,
    },
  ];
};

/** Fleche courbe (arc de Bezier) avec pointe. */
export const curvedArrow = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  bend = 80,
  head = 34,
  seed = 420
): Shape[] => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const nx = -(y2 - y1);
  const ny = x2 - x1;
  const len = Math.hypot(nx, ny) || 1;
  const cx = mx + (nx / len) * bend;
  const cy = my + (ny / len) * bend;
  const a = Math.atan2(y2 - cy, x2 - cx);
  const s = 0.45;
  return [
    {spec: {kind: 'path', d: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`}, seed},
    {
      spec: {
        kind: 'line',
        x1: x2,
        y1: y2,
        x2: x2 - head * Math.cos(a - s),
        y2: y2 - head * Math.sin(a - s),
      },
      seed: seed + 1,
    },
    {
      spec: {
        kind: 'line',
        x1: x2,
        y1: y2,
        x2: x2 - head * Math.cos(a + s),
        y2: y2 - head * Math.sin(a + s),
      },
      seed: seed + 2,
    },
  ];
};

/** Bonhomme baton. (x, y) = centre de la tete. h = hauteur totale. */
export const stickFigure = (x: number, y: number, h = 260, seed = 500): Shape[] => {
  const headR = h * 0.17;
  const neck = y + headR;
  const hip = neck + h * 0.36;
  const foot = hip + h * 0.34;
  const armY = neck + h * 0.1;
  const armSpan = h * 0.28;
  const legSpan = h * 0.2;
  return [
    {spec: {kind: 'circle', cx: x, cy: y, d: headR * 2}, seed},
    {spec: {kind: 'line', x1: x, y1: neck, x2: x, y2: hip}, seed: seed + 1},
    {spec: {kind: 'line', x1: x, y1: armY, x2: x - armSpan, y2: armY + h * 0.14}, seed: seed + 2},
    {spec: {kind: 'line', x1: x, y1: armY, x2: x + armSpan, y2: armY + h * 0.1}, seed: seed + 3},
    {spec: {kind: 'line', x1: x, y1: hip, x2: x - legSpan, y2: foot}, seed: seed + 4},
    {spec: {kind: 'line', x1: x, y1: hip, x2: x + legSpan, y2: foot}, seed: seed + 5},
  ];
};

/** Sourire simple sur la tete d'un bonhomme. */
export const smile = (x: number, y: number, h = 260, seed = 560): Shape[] => {
  const r = h * 0.17;
  return [
    {spec: {kind: 'circle', cx: x - r * 0.36, cy: y - r * 0.16, d: 9}, seed},
    {spec: {kind: 'circle', cx: x + r * 0.36, cy: y - r * 0.16, d: 9}, seed: seed + 1},
    {
      spec: {
        kind: 'path',
        d: `M ${x - r * 0.42} ${y + r * 0.26} Q ${x} ${y + r * 0.68} ${x + r * 0.42} ${y + r * 0.26}`,
      },
      seed: seed + 2,
    },
  ];
};

/** Drapeau americain simplifie : hampe, rectangle, bandes, canton, etoiles. */
export const usFlag = (x: number, y: number, w = 300, seed = 600): Shape[] => {
  const h = w * 0.6;
  const stripes = 4;
  const shapes: Shape[] = [
    {spec: {kind: 'line', x1: x, y1: y - 34, x2: x, y2: y + h + 150}, seed},
    {spec: {kind: 'rect', x, y, w, h}, seed: seed + 1},
  ];
  for (let i = 1; i <= stripes; i++) {
    const sy = y + (h / (stripes + 1)) * i;
    const from = i <= 2 ? x + w * 0.42 : x;
    shapes.push({
      spec: {kind: 'line', x1: from, y1: sy, x2: x + w, y2: sy},
      seed: seed + 10 + i,
      strokeWidth: 4,
    });
  }
  shapes.push({spec: {kind: 'rect', x, y, w: w * 0.42, h: h * 0.5}, seed: seed + 20});
  const starRows = [0.16, 0.34];
  starRows.forEach((ry, ri) => {
    for (let c = 0; c < 3; c++) {
      const sx = x + w * (0.08 + c * 0.13);
      const sy = y + h * ry;
      shapes.push({spec: {kind: 'line', x1: sx - 8, y1: sy, x2: sx + 8, y2: sy}, seed: seed + 30 + ri * 5 + c, strokeWidth: 4});
      shapes.push({spec: {kind: 'line', x1: sx, y1: sy - 8, x2: sx, y2: sy + 8}, seed: seed + 40 + ri * 5 + c, strokeWidth: 4});
    }
  });
  return shapes;
};

/** Globe croque a la main : cercle + meridiens + equateur. */
export const globe = (cx: number, cy: number, d = 220, seed = 700): Shape[] => [
  {spec: {kind: 'circle', cx, cy, d}, seed},
  {spec: {kind: 'ellipse', cx, cy, w: d * 0.42, h: d}, seed: seed + 1, strokeWidth: 4},
  {spec: {kind: 'ellipse', cx, cy, w: d * 0.82, h: d}, seed: seed + 2, strokeWidth: 4},
  {spec: {kind: 'line', x1: cx - d / 2, y1: cy, x2: cx + d / 2, y2: cy}, seed: seed + 3, strokeWidth: 4},
  {
    spec: {kind: 'path', d: `M ${cx - d * 0.42} ${cy - d * 0.22} Q ${cx} ${cy - d * 0.34} ${cx + d * 0.42} ${cy - d * 0.22}`},
    seed: seed + 4,
    strokeWidth: 4,
  },
];

/** Symbole dollar trace au crayon. */
export const dollar = (cx: number, cy: number, h = 90, seed = 800): Shape[] => {
  const w = h * 0.52;
  return [
    {
      spec: {
        kind: 'path',
        d:
          `M ${cx + w / 2} ${cy - h * 0.3} ` +
          `C ${cx + w / 2} ${cy - h * 0.55}, ${cx - w / 2} ${cy - h * 0.58}, ${cx - w / 2} ${cy - h * 0.16} ` +
          `C ${cx - w / 2} ${cy + h * 0.12}, ${cx + w / 2} ${cy + h * 0.08}, ${cx + w / 2} ${cy + h * 0.3} ` +
          `C ${cx + w / 2} ${cy + h * 0.6}, ${cx - w / 2} ${cy + h * 0.58}, ${cx - w / 2} ${cy + h * 0.3}`,
      },
      seed,
    },
    {spec: {kind: 'line', x1: cx, y1: cy - h * 0.62, x2: cx, y2: cy + h * 0.62}, seed: seed + 1, strokeWidth: 4},
  ];
};

/** Gros point d'interrogation croque. */
export const questionMark = (cx: number, cy: number, h = 300, seed = 900): Shape[] => {
  const w = h * 0.46;
  return [
    {
      spec: {
        kind: 'path',
        d:
          `M ${cx - w * 0.52} ${cy - h * 0.26} ` +
          `C ${cx - w * 0.56} ${cy - h * 0.56}, ${cx + w * 0.62} ${cy - h * 0.62}, ${cx + w * 0.5} ${cy - h * 0.2} ` +
          `C ${cx + w * 0.42} ${cy + h * 0.04}, ${cx + w * 0.02} ${cy + h * 0.02}, ${cx} ${cy + h * 0.28}`,
      },
      seed,
      strokeWidth: 7,
    },
    {spec: {kind: 'circle', cx, cy: cy + h * 0.44, d: 20}, seed: seed + 1, strokeWidth: 7},
  ];
};

/** Petit paraphe de validation (coche). */
export const check = (x: number, y: number, s = 60, seed = 950): Shape[] => [
  {spec: {kind: 'curve', points: [[x, y], [x + s * 0.34, y + s * 0.4], [x + s, y - s * 0.6]]}, seed},
];
