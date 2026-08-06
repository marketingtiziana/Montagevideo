/**
 * Root.tsx — déclaration des compositions Remotion.
 * 1080x1920, 30 fps. Les durées réelles arrivent via inputProps au rendu.
 */
import { Composition } from 'remotion';
import './fonts.ts';
import { Reel } from './compositions/Reel.tsx';
import { CaptionsPreview } from './compositions/CaptionsPreview.tsx';

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Reel"
        component={Reel}
        durationInFrames={FPS * 30}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ facecamSrc: null, captions: [], shots: [] }}
      />
      {/* Jalon 5 : sous-titres seuls sur facecam brut (15 s). */}
      <Composition
        id="CaptionsPreview"
        component={CaptionsPreview}
        durationInFrames={FPS * 15}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ facecam: 'facecam15.mp4', blocks: [] }}
      />
    </>
  );
};
