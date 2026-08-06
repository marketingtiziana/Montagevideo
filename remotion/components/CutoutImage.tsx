/**
 * CutoutImage.tsx — traitement §11.3 des photos découpées, appliqué au rendu :
 *  - désaturation totale,
 *  - compression tonale (noirs → ~25 % de luminance, blancs → ~90 %),
 *  - trame de demi-teinte (points ~1,5 px) pour l'effet impression papier,
 *  - très léger flou (0,3 px) pour casser l'aspect numérique.
 * S'applique à une image (src) ou à un contenu SVG (children), pour que les PNG
 * sources puissent être en couleur.
 */
import type React from 'react';
import { cutoutTreatment as T } from '../theme.ts';

let uid = 0;

export interface CutoutImageProps {
  src?: string;
  width?: number;
  height?: number;
  children?: React.ReactNode;
}

export const CutoutImage: React.FC<CutoutImageProps> = ({ src, width, height, children }) => {
  const id = `cut${uid++}`;
  // Compression tonale : remappe [0,1] vers [blackLift, whiteCeil] (achromatique).
  const lo = T.blackLift;
  const hi = T.whiteCeil;

  return (
    <div style={{ position: 'relative', width, height, display: 'inline-block' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width ?? 100} ${height ?? 100}`} style={{ display: 'block' }}>
        <defs>
          <filter id={`${id}-f`} x="-5%" y="-5%" width="110%" height="110%">
            {/* Désaturation totale. */}
            <feColorMatrix type="saturate" values={String(1 - T.desaturate)} />
            {/* Compression de la plage tonale : noirs remontés, blancs descendus. */}
            <feComponentTransfer>
              <feFuncR type="linear" slope={hi - lo} intercept={lo} />
              <feFuncG type="linear" slope={hi - lo} intercept={lo} />
              <feFuncB type="linear" slope={hi - lo} intercept={lo} />
            </feComponentTransfer>
            {/* Très léger flou anti-numérique. */}
            <feGaussianBlur stdDeviation={T.blurPx} />
          </filter>
          {/* Trame de demi-teinte (points réguliers). */}
          <pattern id={`${id}-ht`} width={T.halftoneDotPx * 2} height={T.halftoneDotPx * 2} patternUnits="userSpaceOnUse">
            <circle cx={T.halftoneDotPx} cy={T.halftoneDotPx} r={T.halftoneDotPx * 0.5} fill="#000000" />
          </pattern>
        </defs>
        <g filter={`url(#${id}-f)`}>
          {src ? <image href={src} x={0} y={0} width={width} height={height} preserveAspectRatio="xMidYMid meet" /> : children}
        </g>
        {/* Overlay demi-teinte (effet impression). */}
        <rect x={0} y={0} width={width} height={height} fill={`url(#${id}-ht)`} opacity={0.12} />
      </svg>
    </div>
  );
};
