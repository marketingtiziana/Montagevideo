import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Board, Ink} from '../components/Board';
import {Handwriting} from '../components/Handwriting';
import {SketchGroup, SketchShape} from '../components/SketchShape';
import {arrow, check, usFlag} from '../components/Doodles';
import {STROKE} from '../theme';

/** Scene 2 - DEFINITION (7s) : drapeau US + la boite LLC. */
export const SCENE2_FRAMES = 210;

export const Scene2: React.FC = () => (
  <Board eraseAt={SCENE2_FRAMES - 9} eraseDir="rtl" driftSeed={2}>
    <Ink>
      <SketchGroup shapes={usFlag(150, 400, 340, 600)} start={0} each={10} stagger={3.2} />
      <SketchGroup shapes={arrow(500, 530, 616, 530, 30, 640)} start={74} each={11} stagger={6} />
      <SketchShape
        spec={{kind: 'rect', x: 640, y: 430, w: 330, h: 200}}
        seed={660}
        start={90}
        duration={24}
        strokeWidth={STROKE.bold}
        roughOptions={{roughness: 2.4, bowing: 2.4}}
        pencil
      />
      <SketchGroup
        shapes={[
          {spec: {kind: 'line', x1: 190, y1: 1218, x2: 890, y2: 1226}, seed: 671},
          {spec: {kind: 'line', x1: 210, y1: 1240, x2: 860, y2: 1244}, seed: 672, strokeWidth: 4},
        ]}
        start={126}
        each={16}
        stagger={12}
      />
      <SketchGroup shapes={check(905, 1150, 90, 690)} start={158} each={16} />
    </Ink>
    <AbsoluteFill>
      <Handwriting
        text="LLC"
        start={116}
        fontSize={120}
        seed={11}
        style={{position: 'absolute', left: 640, width: 330, top: 456, textAlign: 'center'}}
      />
      <Handwriting
        text="Une société américaine"
        start={16}
        fontSize={110}
        seed={13}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 940, textAlign: 'center'}}
      />
      <Handwriting
        text="simple et flexible"
        start={62}
        fontSize={110}
        seed={17}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 1075, textAlign: 'center'}}
      />
    </AbsoluteFill>
  </Board>
);
