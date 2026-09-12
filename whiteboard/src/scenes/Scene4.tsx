import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Board, Ink} from '../components/Board';
import {Handwriting} from '../components/Handwriting';
import {SketchGroup, SketchShape} from '../components/SketchShape';
import {arrow, curvedArrow, dollar, globe, smile, stickFigure} from '../components/Doodles';
import {STROKE} from '../theme';

/**
 * Scene 4 - LE FLUX (10.5s).
 * Client -> $ -> LLC -> toi, pose sur un globe : l'imposition suit la residence.
 */
export const SCENE4_FRAMES = 315;

export const Scene4: React.FC = () => (
  <Board eraseAt={SCENE4_FRAMES - 9} eraseDir="rtl" driftSeed={4}>
    <Ink>
      <SketchGroup shapes={stickFigure(190, 380, 240, 400)} start={0} each={12} stagger={7} />
      <SketchGroup shapes={smile(190, 380, 240, 430)} start={44} each={9} stagger={6} />
      <SketchGroup shapes={arrow(300, 470, 586, 470, 34, 450)} start={66} each={11} stagger={6} />
      <SketchGroup shapes={dollar(443, 386, 110, 470)} start={84} each={14} stagger={10} />
      <SketchShape
        spec={{kind: 'rect', x: 610, y: 370, w: 340, h: 200}}
        seed={481}
        start={104}
        duration={26}
        strokeWidth={STROKE.bold}
        roughOptions={{roughness: 2.4, bowing: 2.4}}
        pencil
      />
      <SketchGroup
        shapes={curvedArrow(770, 600, 330, 830, 110, 38, 490)}
        start={140}
        each={13}
        stagger={8}
      />
      <SketchGroup shapes={stickFigure(250, 890, 250, 520)} start={168} each={12} stagger={7} />
      <SketchGroup shapes={smile(250, 890, 250, 550)} start={212} each={9} stagger={6} />
      <SketchGroup shapes={globe(800, 990, 230, 560)} start={200} each={14} stagger={9} />
    </Ink>
    <AbsoluteFill>
      <Handwriting
        text="client"
        start={58}
        fontSize={80}
        seed={41}
        style={{position: 'absolute', left: 60, width: 260, top: 600, textAlign: 'center'}}
      />
      <Handwriting
        text="LLC"
        start={132}
        fontSize={120}
        seed={43}
        style={{position: 'absolute', left: 610, width: 340, top: 396, textAlign: 'center'}}
      />
      <Handwriting
        text="toi"
        start={226}
        fontSize={80}
        seed={45}
        style={{position: 'absolute', left: 120, width: 260, top: 1128, textAlign: 'center'}}
      />
      <Handwriting
        text="Tes clients paient la LLC"
        start={118}
        fontSize={100}
        seed={47}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 1265, textAlign: 'center'}}
      />
      <Handwriting
        text="toi, tu es imposé"
        start={200}
        fontSize={100}
        seed={49}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 1382, textAlign: 'center'}}
      />
      <Handwriting
        text="là où TU vis"
        start={232}
        fontSize={100}
        seed={51}
        pencil
        highlight="là où TU vis"
        highlightDelay={5}
        highlightDuration={12}
        style={{position: 'absolute', left: 0, right: 0, top: 1499, textAlign: 'center'}}
      />
    </AbsoluteFill>
  </Board>
);
