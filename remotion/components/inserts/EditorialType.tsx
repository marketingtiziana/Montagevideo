/**
 * EditorialType (univers paper) — empilement typo à 3 niveaux, calé à gauche,
 * tiers supérieur, marge gauche 200 px.
 *   ligne 1 : EB Garamond regular 58 px
 *   ligne 2 : Playfair Display Bold Italic 145 px   <- le mot vedette
 *   ligne 3 : EB Garamond italic 62 px
 * Entrée : révélation caractère par caractère, cadence 2 frames par caractère.
 */
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { editorial, inserts } from '../../theme.ts';
import { Texture } from '../Texture.tsx';

export interface EditorialTypeProps {
  line1: string;
  line2: string; // mot vedette
  line3: string;
}

export const EditorialType: React.FC<EditorialTypeProps> = ({ line1, line2, line3 }) => {
  const frame = useCurrentFrame();
  const cfg = inserts.editorialType;
  const revealed = Math.floor(frame / cfg.revealFramesPerChar); // nb de caractères affichés

  // Révélation séquentielle sur les 3 lignes (caractère par caractère).
  const lens = [line1.length, line2.length, line3.length];
  const shown = (idx: number, text: string): string => {
    const before = lens.slice(0, idx).reduce((a, b) => a + b, 0);
    return text.slice(0, Math.max(0, Math.min(text.length, revealed - before)));
  };

  const common = { color: editorial.paper.ink, whiteSpace: 'pre' as const, letterSpacing: 0 };

  return (
    <AbsoluteFill style={{ backgroundColor: editorial.paper.bg }}>
      <Texture opacity={editorial.paper.textureOpacity} />
      <div style={{ position: 'absolute', left: cfg.marginLeft, top: 1920 / 3 - 120, textAlign: 'left' }}>
        <div style={{ ...common, fontFamily: cfg.line1.font, fontWeight: cfg.line1.weight, fontStyle: cfg.line1.style, fontSize: cfg.line1.size }}>
          {shown(0, line1)}
        </div>
        <div style={{ ...common, fontFamily: cfg.line2.font, fontWeight: cfg.line2.weight, fontStyle: cfg.line2.style, fontSize: cfg.line2.size, lineHeight: 1.0 }}>
          {shown(1, line2)}
        </div>
        <div style={{ ...common, fontFamily: cfg.line3.font, fontWeight: cfg.line3.weight, fontStyle: cfg.line3.style, fontSize: cfg.line3.size }}>
          {shown(2, line3)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
