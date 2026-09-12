import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Board, Ink} from '../components/Board';
import {Handwriting} from '../components/Handwriting';
import {SketchGroup, SketchShape} from '../components/SketchShape';
import {questionMark} from '../components/Doodles';
import {STROKE} from '../theme';

/** Scene 1 - HOOK (4.8s) : la question se pose, le sujet apparait. */
export const SCENE1_FRAMES = 144;

export const Scene1: React.FC = () => (
  <Board eraseAt={SCENE1_FRAMES - 9} eraseDir="ltr" driftSeed={1}>
    <Ink>
      <SketchGroup
        shapes={questionMark(540, 1055, 400, 900)}
        start={32}
        each={24}
        stagger={20}
        pencilOnLast
      />
      {/* petits traits d'insistance autour de la boite : rien ne reste fige */}
      <SketchGroup
        shapes={[
          {spec: {kind: 'line', x1: 236, y1: 1372, x2: 280, y2: 1352}, seed: 131, strokeWidth: 4},
          {spec: {kind: 'line', x1: 228, y1: 1448, x2: 274, y2: 1448}, seed: 132, strokeWidth: 4},
          {spec: {kind: 'line', x1: 800, y1: 1372, x2: 844, y2: 1352}, seed: 133, strokeWidth: 4},
          {spec: {kind: 'line', x1: 806, y1: 1448, x2: 852, y2: 1448}, seed: 134, strokeWidth: 4},
        ]}
        start={98}
        each={9}
        stagger={7}
      />
      <SketchShape
        spec={{kind: 'rect', x: 300, y: 1320, w: 480, h: 250}}
        seed={121}
        start={58}
        duration={26}
        strokeWidth={STROKE.bold}
        roughOptions={{roughness: 2.4, bowing: 2.4}}
        pencil
      />
    </Ink>
    <AbsoluteFill>
      <Handwriting
        text="C'est quoi"
        start={0}
        fontSize={200}
        seed={3}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 330, textAlign: 'center'}}
      />
      <Handwriting
        text="une LLC ?"
        start={16}
        fontSize={200}
        seed={5}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 560, textAlign: 'center'}}
      />
      <Handwriting
        text="LLC"
        start={84}
        fontSize={150}
        seed={8}
        style={{position: 'absolute', left: 300, width: 480, top: 1358, textAlign: 'center'}}
      />
    </AbsoluteFill>
  </Board>
);
