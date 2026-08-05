/**
 * Reel.tsx — composition principale (étape 8).
 *
 * Assemble : facecam étalonné (recadrages fixes wide/medium/close, aucune
 * dérive dans un plan) + sous-titres + inserts plein écran (jamais superposés
 * au facecam). Toutes les transitions sont des coupes franches ; l'animation
 * se joue à l'intérieur de l'insert, pas sur la jointure.
 *
 * Règle : jamais plus d'un élément graphique à l'écran à la fois.
 *
 * JALON 1 : squelette. Rendu réel des plans/inserts aux jalons 5–8.
 */
import { AbsoluteFill } from 'remotion';
import { editorial } from '../theme.ts';

export interface CaptionBlock {
  startFrame: number;
  endFrame: number;
  line1: string;
  line2: string;
  surface: 'dark' | 'paper';
}

export interface ShotSpan {
  startFrame: number;
  endFrame: number;
  kind: 'facecam' | 'insert';
  scale?: 'wide' | 'medium' | 'close';
  template?: string;
}

export interface ReelProps {
  facecamSrc: string | null;
  captions: CaptionBlock[];
  shots: ShotSpan[];
}

export const Reel: React.FC<ReelProps> = () => {
  // Placeholder sobre au jalon 1 : fond neutre, aucun effet.
  return <AbsoluteFill style={{ backgroundColor: editorial.dark.bg }} />;
};
