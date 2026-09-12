import React from 'react';
import {sketchPaths} from '../lib/rough';
import {THEME} from '../theme';

/**
 * Effet stabilo : deux passes de feutre jaune epais, tracees de gauche a
 * droite, posees DERRIERE le texte. Le SVG est etire au format du texte
 * (preserveAspectRatio="none") pour ne demander aucune mesure DOM, et
 * l'epaisseur reste constante grace a vector-effect="non-scaling-stroke".
 */
export const Highlighter: React.FC<{
  children: React.ReactNode;
  /** 0 = pas de surlignage, 1 = trait complet */
  progress: number;
  /** epaisseur du feutre en px ecran (~0.5 x la taille de police) */
  thickness: number;
  seed?: number;
  color?: string;
}> = ({children, progress, thickness, seed = 31, color = THEME.highlight}) => {
  const p = Math.max(0, Math.min(1, progress));
  const passes = [
    {d: sketchPaths({kind: 'line', x1: 1, y1: 40, x2: 99, y2: 44}, seed, {roughness: 1.1, bowing: 0.8}), w: thickness},
    {d: sketchPaths({kind: 'line', x1: 3, y1: 68, x2: 97, y2: 64}, seed + 1, {roughness: 1.3, bowing: 0.9}), w: thickness * 0.8},
  ];

  return (
    <span style={{position: 'relative', display: 'inline-block', whiteSpace: 'pre'}}>
      {p > 0 ? (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            left: '-1.5%',
            width: '103%',
            top: '22%',
            height: '64%',
            overflow: 'visible',
            mixBlendMode: 'multiply',
            opacity: 0.9,
          }}
        >
          {passes.map((pass, pi) =>
            pass.d.map((d, i) => (
              <path
                key={`${pi}-${i}`}
                d={d}
                fill="none"
                stroke={color}
                strokeWidth={pass.w}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray="1 1"
                strokeDashoffset={1 - p}
              />
            ))
          )}
        </svg>
      ) : null}
      <span style={{position: 'relative'}}>{children}</span>
    </span>
  );
};
