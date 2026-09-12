import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {PaperGrain} from './components/Board';
import {Scene1} from './scenes/Scene1';
import {Scene2} from './scenes/Scene2';
import {Scene3} from './scenes/Scene3';
import {Scene4} from './scenes/Scene4';
import {Scene5} from './scenes/Scene5';
import {Soundtrack} from './Soundtrack';
import {SCENE_FRAMES, SCENE_OFFSETS} from './timeline';
import {THEME} from './theme';

const SCENES = [Scene1, Scene2, Scene3, Scene4, Scene5];

export const ReelLLC: React.FC<{silent?: boolean}> = ({silent = false}) => (
  <AbsoluteFill style={{backgroundColor: THEME.paper}}>
    {SCENES.map((Scene, i) => (
      <Sequence key={i} from={SCENE_OFFSETS[i]} durationInFrames={SCENE_FRAMES[i]}>
        <Scene />
      </Sequence>
    ))}
    <PaperGrain />
    {silent ? null : <Soundtrack />}
  </AbsoluteFill>
);
