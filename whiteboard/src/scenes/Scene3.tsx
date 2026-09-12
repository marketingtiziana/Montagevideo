import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Board, Ink} from '../components/Board';
import {Handwriting} from '../components/Handwriting';
import {SketchGroup, SketchShape} from '../components/SketchShape';
import {arrow, smile, stickFigure} from '../components/Doodles';
import {STROKE} from '../theme';

/**
 * Scene 3 - TRANSPARENCE FISCALE (11s).
 * La fleche traverse la boite LLC et file vers le bonhomme baton.
 */
export const SCENE3_FRAMES = 330;

export const Scene3: React.FC = () => (
  <Board eraseAt={SCENE3_FRAMES - 9} eraseDir="ltr" driftSeed={3}>
    <Ink>
      <SketchShape
        spec={{kind: 'rect', x: 110, y: 320, w: 420, h: 280}}
        seed={301}
        start={0}
        duration={28}
        strokeWidth={STROKE.bold}
        roughOptions={{roughness: 2.4, bowing: 2.4}}
        pencil
      />
      <SketchShape
        spec={{kind: 'line', x1: 20, y1: 545, x2: 112, y2: 545}}
        seed={311}
        start={40}
        duration={12}
      />
      <SketchShape
        spec={{kind: 'line', x1: 118, y1: 545, x2: 528, y2: 545}}
        seed={312}
        start={54}
        duration={24}
        dashed
      />
      <SketchGroup shapes={arrow(534, 545, 800, 675, 38, 320)} start={76} each={12} stagger={7} />
      <SketchGroup shapes={stickFigure(880, 745, 280, 340)} start={100} each={13} stagger={8} />
      <SketchGroup shapes={smile(880, 745, 280, 360)} start={150} each={9} stagger={6} />
    </Ink>
    <AbsoluteFill>
      <Handwriting
        text="LLC"
        start={30}
        fontSize={120}
        seed={21}
        style={{position: 'absolute', left: 110, width: 420, top: 342, textAlign: 'center'}}
      />
      <Handwriting
        text="toi"
        start={168}
        fontSize={84}
        seed={23}
        style={{position: 'absolute', left: 760, width: 240, top: 1000, textAlign: 'center'}}
      />
      <Handwriting
        text="Elle est fiscalement"
        start={150}
        fontSize={108}
        seed={25}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 1125, textAlign: 'center'}}
      />
      <Handwriting
        text="transparente"
        start={187}
        fontSize={108}
        seed={27}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 1247, textAlign: 'center'}}
      />
      <Handwriting
        text="les revenus vont"
        start={214}
        fontSize={100}
        seed={29}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 1378, textAlign: 'center'}}
      />
      <Handwriting
        text="directement à toi"
        start={244}
        fontSize={100}
        seed={31}
        pencil
        highlight="directement à toi"
        highlightDelay={5}
        highlightDuration={12}
        style={{position: 'absolute', left: 0, right: 0, top: 1490, textAlign: 'center'}}
      />
    </AbsoluteFill>
  </Board>
);
