/**
 * Captions.tsx — sous-titres (étape 7). Réplique exacte du système mesuré.
 *
 * Mécanique : mots un par un, cumulativement, au timestamp WhisperX. Bloc de
 * 2 lignes max, ligne 1 en graisse 400, ligne 2 en graisse 700 (partie la plus
 * récente). Ancrage PAR LE BAS : la dernière ligne repose toujours à 627 px du
 * bas ; le bloc grandit vers le haut.
 *
 * Animation : le mot apparaît net, sans scale, sans bounce, sans changement de
 * couleur. Fondu d'opacité de 2 frames max. La discrétion est le sujet.
 *
 * JALON 1 : géométrie posée depuis config/theme, rendu affiné au jalon 5
 * ("15 secondes rendues, comparaison au pixel").
 */
import { AbsoluteFill } from 'remotion';

const FONT_FAMILY = 'EB Garamond'; // ou Cormorant Garamond
const FONT_SIZE = 63;
const LINE_HEIGHT = 75;
const BASELINE_FROM_BOTTOM = 627;

export interface CaptionsProps {
  line1: string;
  line2: string;
  /** Couleur pilotée par le type de plan en cours (pas de détection luminance). */
  surface: 'dark' | 'paper';
}

export const Captions: React.FC<CaptionsProps> = ({ line1, line2, surface }) => {
  const onDark = surface === 'dark';
  const color = onDark ? '#FFFFFF' : '#111111';
  const textShadow = onDark ? '0 2px 10px rgba(0,0,0,0.45)' : 'none';

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          // Ancrage bas : la ligne de base de la dernière ligne à 627 px du bas.
          bottom: BASELINE_FROM_BOTTOM - LINE_HEIGHT,
          textAlign: 'center',
          fontFamily: FONT_FAMILY,
          fontSize: FONT_SIZE,
          lineHeight: `${LINE_HEIGHT}px`,
          letterSpacing: 0,
          textTransform: 'none', // minuscules, JAMAIS de capitales
          color,
          textShadow,
        }}
      >
        {line1 ? <div style={{ fontWeight: 400 }}>{line1}</div> : null}
        {line2 ? <div style={{ fontWeight: 700 }}>{line2}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
