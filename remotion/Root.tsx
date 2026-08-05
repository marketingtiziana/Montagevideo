/**
 * Root.tsx — déclaration des compositions Remotion.
 * Reel : 1080x1920, 30 fps. La durée réelle est fournie au rendu via inputProps
 * (calculée depuis l'EDL) ; valeur par défaut ici pour le studio de preview.
 *
 * JALON 1 : composition déclarée, contenu minimal. Le montage complet arrive
 * aux jalons 5–8.
 */
import { Composition } from 'remotion';
import { Reel } from './compositions/Reel.tsx';

const FPS = 30;
const WIDTH = 1080;
const HEIGHT = 1920;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={FPS * 30}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{
        facecamSrc: null,
        captions: [],
        shots: [],
      }}
    />
  );
};
