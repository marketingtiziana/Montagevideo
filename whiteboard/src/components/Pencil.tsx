import React from 'react';
import {sketchPaths} from '../lib/rough';
import {THEME} from '../theme';

/**
 * Main tenant un crayon, dessinee au trait comme le reste du tableau.
 * La pointe du crayon est a l'origine (0,0) du groupe : il suffit de
 * translater le groupe sur le point courant du trace.
 *
 * Repere local : l'axe du crayon monte vers la droite (AX, AY), la
 * perpendiculaire (PX, PY) pointe vers le bas-droite, cote paume.
 */
const AX = 0.58;
const AY = -0.81;
const PX = 0.81;
const PY = 0.58;

const at = (d: number, o = 0): [number, number] => [AX * d + PX * o, AY * d + PY * o];

/** Barre perpendiculaire a l'axe : sert aux doigts. */
const bar = (d: number, o1: number, o2: number, half: number): [number, number][] => [
  at(d - half, o1),
  at(d + half, o1),
  at(d + half, o2),
  at(d - half, o2),
];

const HALF = 11;
const COLLAR = 40;
const BODY_END = 238;

const TIP: [number, number][] = [[0, 0], at(COLLAR, HALF), at(COLLAR, -HALF)];
const BODY: [number, number][] = [
  at(COLLAR, HALF),
  at(BODY_END, HALF),
  at(BODY_END, -HALF),
  at(COLLAR, -HALF),
];
const CAP: [number, number][] = [
  at(BODY_END, HALF),
  at(BODY_END + 22, HALF * 0.9),
  at(BODY_END + 22, -HALF * 0.9),
  at(BODY_END, -HALF),
];

const PALM = at(188, 74);
const FINGERS: [number, number][][] = [
  bar(100, -15, 62, 15),
  bar(134, -15, 66, 15),
  bar(168, -13, 64, 14),
];

const pencilOutline = [
  ...sketchPaths({kind: 'polygon', points: TIP}, 9101),
  ...sketchPaths({kind: 'polygon', points: BODY}, 9102),
  ...sketchPaths({kind: 'polygon', points: CAP}, 9103),
];

const handOutline = [
  ...sketchPaths(
    {kind: 'ellipse', cx: PALM[0], cy: PALM[1], w: 152, h: 134},
    9104,
    {roughness: 1.9, bowing: 1.7}
  ),
  ...FINGERS.flatMap((pts, i) => sketchPaths({kind: 'polygon', points: pts}, 9110 + i, {roughness: 1.4})),
];

const toPoints = (pts: [number, number][]) => pts.map((p) => p.join(',')).join(' ');

export const Pencil: React.FC<{
  x: number;
  y: number;
  opacity?: number;
  scale?: number;
  strokeWidth?: number;
}> = ({x, y, opacity = 1, scale = 1, strokeWidth = 4}) => {
  const stroke = {
    fill: 'none',
    stroke: THEME.ink,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      {/* le crayon, puis la main qui le recouvre */}
      {pencilOutline.map((d, i) => (
        <path key={`p${i}`} d={d} {...stroke} />
      ))}
      <ellipse cx={PALM[0]} cy={PALM[1]} rx={78} ry={69} fill={THEME.paper} />
      {FINGERS.map((pts, i) => (
        <polygon key={`ff${i}`} points={toPoints(pts)} fill={THEME.paper} />
      ))}
      {handOutline.map((d, i) => (
        <path key={`h${i}`} d={d} {...stroke} />
      ))}
    </g>
  );
};

/** Crayon en surcouche HTML (pour suivre l'ecriture manuscrite). */
export const FloatingPencil: React.FC<{size?: number; opacity?: number}> = ({
  size = 0.42,
  opacity = 1,
}) => (
  <svg
    width={1}
    height={1}
    viewBox="0 0 1 1"
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      overflow: 'visible',
      pointerEvents: 'none',
    }}
  >
    <Pencil x={0} y={0} scale={size} opacity={opacity} strokeWidth={4 / size} />
  </svg>
);
