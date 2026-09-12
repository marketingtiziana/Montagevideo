import React from 'react';
import {AbsoluteFill, Composition, Sequence} from 'remotion';
import {PaperGrain} from './components/Board';
import {loadCaveat} from './lib/font';
import {ReelLLC} from './ReelLLC';
import {Scene1, SCENE1_FRAMES} from './scenes/Scene1';
import {TOTAL_FRAMES} from './timeline';
import {THEME, VIDEO} from './theme';

loadCaveat();

/** Preview de la scene 1 seule, pour valider le style. */
export const Preview1: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: THEME.paper}}>
    <Sequence durationInFrames={SCENE1_FRAMES}>
      <Scene1 />
    </Sequence>
    <PaperGrain />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="ReelLLC"
      component={ReelLLC}
      durationInFrames={TOTAL_FRAMES}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
      defaultProps={{silent: false}}
    />
    <Composition
      id="Scene1Preview"
      component={Preview1}
      durationInFrames={SCENE1_FRAMES}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
  </>
);
