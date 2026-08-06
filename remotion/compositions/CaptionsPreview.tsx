/**
 * CaptionsPreview.tsx — jalon 5. Sous-titres SEULS sur le facecam BRUT (aucun
 * étalonnage, aucun insert), pour une comparaison au pixel avec la référence.
 */
import { AbsoluteFill, OffthreadVideo, staticFile } from 'remotion';
import { Captions } from '../components/Captions.tsx';
import type { CaptionBlock } from '../../src/types.ts';

export interface CaptionsPreviewProps {
  facecam: string; // nom de fichier dans public/
  blocks: CaptionBlock[];
}

export const CaptionsPreview: React.FC<CaptionsPreviewProps> = ({ facecam, blocks }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#111111' }}>
      <OffthreadVideo src={staticFile(facecam)} />
      <Captions blocks={blocks} />
    </AbsoluteFill>
  );
};
