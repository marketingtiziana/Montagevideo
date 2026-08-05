/**
 * ObjectReveal (univers paper) — un objet symbolique isolé au centre.
 * Entrée : fondu échelle, identique à CollageSubject.
 *
 * JALON 1 : stub (construit au jalon 6).
 */
import { AbsoluteFill } from 'remotion';
import { editorial, inserts } from '../../theme.ts';
import { Texture } from '../Texture.tsx';

export interface ObjectRevealProps {
  asset: string;
}

export const ObjectReveal: React.FC<ObjectRevealProps> = () => {
  void inserts.objectReveal;
  return (
    <AbsoluteFill style={{ backgroundColor: editorial.paper.bg }}>
      <Texture opacity={editorial.paper.textureOpacity} />
    </AbsoluteFill>
  );
};
