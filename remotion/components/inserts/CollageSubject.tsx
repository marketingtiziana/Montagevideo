/**
 * CollageSubject (univers paper) — 1 à 2 photos découpées, beaucoup de vide.
 * Entrée : fondu opacité 0→1 + échelle 0.85→1.0 sur 18 frames, easing sortant.
 * Les photos passent par le traitement §11.3 (désat, plage tonale compressée,
 * demi-teinte, léger flou) appliqué au rendu.
 *
 * JALON 1 : stub (univers papier construit au jalon 6).
 */
import { AbsoluteFill } from 'remotion';
import { editorial, inserts } from '../../theme.ts';
import { Texture } from '../Texture.tsx';

export interface CollageSubjectProps {
  assets: string[]; // chemins PNG détourés (assets/cutouts/*)
}

export const CollageSubject: React.FC<CollageSubjectProps> = () => {
  void inserts.collageSubject;
  return (
    <AbsoluteFill style={{ backgroundColor: editorial.paper.bg }}>
      <Texture opacity={editorial.paper.textureOpacity} />
    </AbsoluteFill>
  );
};
