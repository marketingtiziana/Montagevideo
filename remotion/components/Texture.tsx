/**
 * Texture.tsx — trame tissée signature (§11.2).
 * Hachures croisées à 45°, pas de 3 px, trait 0.5 px, en overlay sur toute la
 * surface. Opacité 0.10 sur papier clair, 0.14 sur noir. Présente sur TOUS les
 * inserts : c'est la signature.
 *
 * Générée en SVG (pas d'image pré-rendue). Achromatique.
 */
import { AbsoluteFill } from 'remotion';
import { weave } from '../theme.ts';

export interface TextureProps {
  opacity: number; // 0.10 (papier) ou 0.14 (noir)
  ink?: string; // achromatique uniquement
}

export const Texture: React.FC<TextureProps> = ({ opacity, ink = '#000000' }) => {
  const s = weave.stepPx;
  const w = weave.strokePx;
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: 'none' }}>
      <svg width="100%" height="100%">
        <defs>
          <pattern id="weave" width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`rotate(${weave.angleDeg})`}>
            <line x1="0" y1="0" x2="0" y2={s} stroke={ink} strokeWidth={w} />
            <line x1="0" y1="0" x2={s} y2="0" stroke={ink} strokeWidth={w} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#weave)" />
      </svg>
    </AbsoluteFill>
  );
};
