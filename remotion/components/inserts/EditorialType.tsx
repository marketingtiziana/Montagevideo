/**
 * EditorialType (univers paper) — empilement typo à 3 niveaux, calé à gauche,
 * tiers supérieur, marge gauche 200 px.
 *   ligne 1 : EB Garamond regular 58 px
 *   ligne 2 : Playfair Display Bold Italic 145 px   <- le mot vedette
 *   ligne 3 : EB Garamond italic 62 px
 * Entrée : révélation caractère par caractère, cadence 2 frames par caractère.
 *
 * JALON 1 : stub (construit au jalon 6).
 */
import { AbsoluteFill } from 'remotion';
import { editorial, inserts } from '../../theme.ts';
import { Texture } from '../Texture.tsx';

export interface EditorialTypeProps {
  line1: string;
  line2: string; // mot vedette
  line3: string;
}

export const EditorialType: React.FC<EditorialTypeProps> = () => {
  void inserts.editorialType;
  return (
    <AbsoluteFill style={{ backgroundColor: editorial.paper.bg }}>
      <Texture opacity={editorial.paper.textureOpacity} />
    </AbsoluteFill>
  );
};
