import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {sketchPaths} from '../lib/rough';
import {THEME, VIDEO} from '../theme';

/** Grain de papier tres discret, pour casser l'aplat numerique. */
export const PaperGrain: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none', opacity: 0.05, mixBlendMode: 'multiply'}}>
    <svg width="100%" height="100%">
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  </AbsoluteFill>
);

/**
 * Effet gomme : balayage rapide de gauche a droite qui efface la scene.
 * La gomme elle-meme est dessinee au trait, comme le reste du tableau.
 */
const Eraser: React.FC<{x: number; flip?: boolean}> = ({x, flip = false}) => {
  const W = 180;
  const H = 560;
  const body = sketchPaths({kind: 'rect', x: -W, y: -H / 2, w: W, h: H}, 555, {roughness: 2.2, bowing: 2});
  const grip = sketchPaths(
    {kind: 'rect', x: -W + 14, y: -H / 2 + 16, w: W - 28, h: H * 0.34},
    556,
    {roughness: 2, bowing: 1.6}
  );
  const streaks = [-0.34, -0.1, 0.16, 0.38].flatMap((k, i) =>
    sketchPaths(
      {kind: 'line', x1: 18, y1: H * k, x2: 96 + i * 26, y2: H * k + 12},
      558 + i,
      {roughness: 2.4, bowing: 1.4}
    )
  );
  return (
    <g transform={`translate(${x} ${VIDEO.height / 2}) scale(${flip ? -1 : 1} 1)`}>
      <rect x={-W - 6} y={-H / 2 - 6} width={W + 12} height={H + 12} fill={THEME.paper} />
      {[...body, ...grip].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={THEME.ink} strokeWidth={6} strokeLinecap="round" />
      ))}
      {streaks.map((d, i) => (
        <path
          key={`s${i}`}
          d={d}
          fill="none"
          stroke={THEME.ink}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.35}
        />
      ))}
    </g>
  );
};

export type BoardProps = {
  children: React.ReactNode;
  /** frame de debut du balayage gomme, relative a la scene */
  eraseAt?: number;
  eraseDuration?: number;
  /** sens du balayage */
  eraseDir?: 'ltr' | 'rtl';
  /** dezoom de sortie (alternative a la gomme) : frame de debut */
  exitZoomAt?: number;
  /** graine du micro-drift de camera */
  driftSeed?: number;
  /** amplitude du zoom lent : 1 -> 1.03 */
  zoomTo?: number;
};

export const Board: React.FC<BoardProps> = ({
  children,
  eraseAt,
  eraseDuration = 9,
  eraseDir = 'ltr',
  exitZoomAt,
  driftSeed = 1,
  zoomTo = 1.03,
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Micro-drift permanent : zoom tres lent + derive laterale sinusoidale.
  const base = interpolate(frame, [0, durationInFrames], [1, zoomTo], {
    extrapolateRight: 'clamp',
  });
  const scale =
    exitZoomAt === undefined
      ? base
      : base *
        interpolate(frame, [exitZoomAt, exitZoomAt + 8], [1, 0.82], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
  const phase = driftSeed * 1.7;
  const tx = Math.sin(frame / 96 + phase) * 12;
  const ty = Math.cos(frame / 122 + phase) * 9;

  const erasing = eraseAt !== undefined && frame >= eraseAt;
  const eraseP = erasing
    ? Math.max(0, Math.min(1, (frame - (eraseAt as number)) / eraseDuration))
    : 0;
  const travel = eraseP * (VIDEO.width + 200);
  const edge = eraseDir === 'ltr' ? travel : VIDEO.width - travel;

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          transformOrigin: '50% 48%',
          clipPath: erasing
            ? eraseDir === 'ltr'
              ? `inset(0 0 0 ${Math.min(edge, VIDEO.width)}px)`
              : `inset(0 ${Math.min(VIDEO.width - edge, VIDEO.width)}px 0 0)`
            : undefined,
        }}
      >
        {children}
      </AbsoluteFill>
      {erasing && eraseP < 1 ? (
        <AbsoluteFill>
          <svg width={VIDEO.width} height={VIDEO.height} style={{overflow: 'visible'}}>
            <Eraser x={edge} flip={eraseDir === 'rtl'} />
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** Calque SVG plein cadre, repere en pixels absolus 1080x1920. */
export const Ink: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill>
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      viewBox={`0 0 ${VIDEO.width} ${VIDEO.height}`}
      style={{overflow: 'visible'}}
    >
      {children}
    </svg>
  </AbsoluteFill>
);
