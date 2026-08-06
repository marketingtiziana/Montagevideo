/**
 * CollageScene (univers paper) — un décor en fond, un sujet découpé devant.
 * Entrée : fond en place, sujet en fondu échelle décalé de 6 frames.
 *
 * JALON 1 : stub (univers papier construit au jalon 6).
 */
import { AbsoluteFill } from 'remotion';
import { editorial, inserts } from '../../theme.ts';
import { Texture } from '../Texture.tsx';

export interface CollageSceneProps {
  background: string;
  subject: string;
}

export const CollageScene: React.FC<CollageSceneProps> = () => {
  void inserts.collageScene;
  return (
    <AbsoluteFill style={{ backgroundColor: editorial.paper.bg }}>
      <Texture opacity={editorial.paper.textureOpacity} />
    </AbsoluteFill>
  );
};
