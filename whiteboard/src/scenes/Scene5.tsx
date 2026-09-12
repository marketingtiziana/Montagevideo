import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Board, Ink} from '../components/Board';
import {Handwriting} from '../components/Handwriting';
import {SketchGroup, SketchShape} from '../components/SketchShape';
import {arrow} from '../components/Doodles';
import {STROKE} from '../theme';

/**
 * Scene 5 - NUANCE + CTA (10s).
 * La nuance sur le pays de residence est encadree : elle ne peut pas etre coupee.
 */
export const SCENE5_FRAMES = 300;

/** Petites etincelles a quatre branches autour du CTA. */
const sparkle = (x: number, y: number, s: number, seed: number) => {
  const d = s * 0.52;
  return [
    {spec: {kind: 'line' as const, x1: x, y1: y - s, x2: x, y2: y + s}, seed, strokeWidth: 4},
    {spec: {kind: 'line' as const, x1: x - s * 0.72, y1: y, x2: x + s * 0.72, y2: y}, seed: seed + 1, strokeWidth: 4},
    {spec: {kind: 'line' as const, x1: x - d, y1: y - d, x2: x + d, y2: y + d}, seed: seed + 2, strokeWidth: 3},
    {spec: {kind: 'line' as const, x1: x - d, y1: y + d, x2: x + d, y2: y - d}, seed: seed + 3, strokeWidth: 3},
  ];
};

export const Scene5: React.FC = () => (
  <Board driftSeed={5} zoomTo={1.04}>
    <Ink>
      <SketchShape
        spec={{kind: 'rect', x: 110, y: 395, w: 860, h: 505}}
        seed={501}
        start={84}
        duration={40}
        strokeWidth={STROKE.normal}
        roughOptions={{roughness: 2.6, bowing: 2.6}}
        pencil
      />
      <SketchGroup shapes={arrow(540, 955, 540, 1150, 44, 520)} start={130} each={12} stagger={8} />
      <SketchGroup
        shapes={[
          ...sparkle(175, 1300, 32, 540),
          ...sparkle(915, 1265, 26, 546),
        ]}
        start={226}
        each={9}
        stagger={5}
      />
      <SketchGroup
        shapes={[
          {spec: {kind: 'line', x1: 285, y1: 1512, x2: 800, y2: 1518}, seed: 570},
          {spec: {kind: 'line', x1: 305, y1: 1534, x2: 775, y2: 1538}, seed: 571, strokeWidth: 4},
        ]}
        start={244}
        each={15}
        stagger={11}
      />
    </Ink>
    <AbsoluteFill>
      <Handwriting
        text="Le résultat dépend"
        start={0}
        fontSize={118}
        seed={61}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center'}}
      />
      <Handwriting
        text="de TON pays"
        start={34}
        fontSize={118}
        seed={63}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 580, textAlign: 'center'}}
      />
      <Handwriting
        text="de résidence"
        start={56}
        fontSize={118}
        seed={65}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 720, textAlign: 'center'}}
      />
      <Handwriting
        text="Audit offert,"
        start={156}
        fontSize={124}
        seed={67}
        pencil
        style={{position: 'absolute', left: 0, right: 0, top: 1195, textAlign: 'center'}}
      />
      <Handwriting
        text="lien en bio"
        start={182}
        fontSize={124}
        seed={69}
        pencil
        highlight="lien en bio"
        highlightDelay={6}
        highlightDuration={13}
        style={{position: 'absolute', left: 0, right: 0, top: 1340, textAlign: 'center'}}
      />
    </AbsoluteFill>
  </Board>
);
