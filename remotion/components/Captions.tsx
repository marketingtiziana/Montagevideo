/**
 * Captions.tsx — sous-titres (étape 7). Réplique exacte du système mesuré.
 *
 * Mots un par un, cumulativement. Bloc de 2 lignes max : ligne 1 en graisse 400,
 * ligne 2 en graisse 700 (partie la plus récente). Ancrage PAR LE BAS : la
 * dernière ligne repose toujours à 627 px du bas (ligne de base) ; le bloc
 * grandit vers le haut. Le mot apparaît net (aucun scale, aucun bounce, aucun
 * changement de couleur), fondu d'opacité de 2 frames max. La discrétion est
 * le sujet. Couleur pilotée par le type de plan (dark → blanc, paper → encre).
 */
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import type { CaptionBlock } from '../../src/types.ts';

const FONT_FAMILY = 'EB Garamond';
const FONT_SIZE = 63;
const LINE_HEIGHT = 75;
const BASELINE_FROM_BOTTOM = 627;
const FADE_FRAMES = 2;

// Distance ligne de base ↔ bas de la boîte de ligne (approx. métriques EB
// Garamond) pour que la dernière ligne pose sa base à 627 px du bas.
const BASELINE_OFFSET = Math.round((LINE_HEIGHT - FONT_SIZE) / 2 + FONT_SIZE * 0.21);

export interface CaptionsProps {
  blocks: CaptionBlock[];
  /** Couleur pilotée par le type de plan EN COURS (prioritaire sur block.surface). */
  surfaceOverride?: 'dark' | 'paper';
}

export const Captions: React.FC<CaptionsProps> = ({ blocks, surfaceOverride }) => {
  const frame = useCurrentFrame();
  const block = blocks.find((b) => frame >= b.startFrame && frame < b.endFrame);
  if (!block) return null;

  const onDark = (surfaceOverride ?? block.surface) === 'dark';
  const color = onDark ? '#FFFFFF' : '#111111';
  const textShadow = onDark ? '0 2px 10px rgba(0,0,0,0.45)' : 'none';

  const visible = block.words.filter((w) => frame >= w.appearFrame);
  const line1 = visible.filter((w) => w.line === 1);
  const line2 = visible.filter((w) => w.line === 2);
  if (visible.length === 0) return null;

  const renderWord = (w: { text: string; appearFrame: number }, i: number) => {
    const opacity = interpolate(frame, [w.appearFrame, w.appearFrame + FADE_FRAMES], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    return (
      <span key={i} style={{ opacity }}>
        {i > 0 ? ' ' : ''}
        {w.text}
      </span>
    );
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: BASELINE_FROM_BOTTOM - BASELINE_OFFSET,
          textAlign: 'center',
          fontFamily: FONT_FAMILY,
          fontSize: FONT_SIZE,
          lineHeight: `${LINE_HEIGHT}px`,
          letterSpacing: 0,
          textTransform: 'none', // minuscules préservées, JAMAIS de capitales
          color,
          textShadow,
        }}
      >
        {line1.length > 0 && <div style={{ fontWeight: 400 }}>{line1.map(renderWord)}</div>}
        {line2.length > 0 && <div style={{ fontWeight: 700 }}>{line2.map(renderWord)}</div>}
      </div>
    </AbsoluteFill>
  );
};
