/**
 * ObjectReveal (univers paper) — un objet symbolique isolé au centre.
 * Entrée : fondu échelle, identique à CollageSubject.
 * Sans asset fourni, rend le motif signature (§11.5) traité (§11.3).
 */
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, staticFile } from 'remotion';
import { editorial, inserts } from '../../theme.ts';
import { Texture } from '../Texture.tsx';
import { CutoutImage } from '../CutoutImage.tsx';
import { SignatureMotif } from '../SignatureMotif.tsx';

export interface ObjectRevealProps {
  asset?: string;
}

export const ObjectReveal: React.FC<ObjectRevealProps> = ({ asset }) => {
  const frame = useCurrentFrame();
  const cfg = inserts.objectReveal;
  const t = interpolate(frame, [0, cfg.enterFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.out(Easing.cubic),
  });
  const scale = cfg.enterScaleFrom + (1 - cfg.enterScaleFrom) * t;

  return (
    <AbsoluteFill style={{ backgroundColor: editorial.paper.bg }}>
      <Texture opacity={editorial.paper.textureOpacity} />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ opacity: t, transform: `scale(${scale})` }}>
          {asset ? (
            <CutoutImage src={staticFile(asset)} width={440} height={440} />
          ) : (
            <CutoutImage width={440} height={440}>
              <SignatureMotif size={440} />
            </CutoutImage>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
