/**
 * CollageSubject (univers paper) — 1 à 2 photos découpées, beaucoup de vide.
 * Entrée : fondu opacité 0→1 + échelle 0.85→1.0 sur 18 frames, easing sortant.
 * Les photos passent par le traitement §11.3 (CutoutImage). Sans PNG fourni,
 * on rend le motif signature (§11.5) traité — cohérence de série.
 */
import { AbsoluteFill, useCurrentFrame, interpolate, Easing, staticFile } from 'remotion';
import { editorial, inserts } from '../../theme.ts';
import { Texture } from '../Texture.tsx';
import { CutoutImage } from '../CutoutImage.tsx';
import { SignatureMotif } from '../SignatureMotif.tsx';

export interface CollageSubjectProps {
  assets: string[]; // chemins PNG détourés (public/) ; vide → motif signature
}

export const CollageSubject: React.FC<CollageSubjectProps> = ({ assets }) => {
  const frame = useCurrentFrame();
  const cfg = inserts.collageSubject;
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
          {assets.length > 0 ? (
            <CutoutImage src={staticFile(assets[0]!)} width={560} height={560} />
          ) : (
            <CutoutImage width={560} height={560}>
              <SignatureMotif size={560} />
            </CutoutImage>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
