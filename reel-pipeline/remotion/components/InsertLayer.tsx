import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import type { InsertPlan, FaceTrack } from '../../src/lib/types';
import { theme } from '../theme';
import { StatCard } from './inserts/StatCard';
import { ComparisonBar } from './inserts/ComparisonBar';
import { LowerThird } from './inserts/LowerThird';
import { KeywordPop } from './inserts/KeywordPop';
import { QuoteBlock } from './inserts/QuoteBlock';
import { ChecklistReveal } from './inserts/ChecklistReveal';
import { TimelineBar } from './inserts/TimelineBar';
import { Shape3D } from './inserts/Shape3D';

/**
 * InsertLayer (10.4). Places an insert in the free zone so it NEVER covers the
 * face (rule 1), enforces one-at-a-time via the Sequence in Reel.tsx (rule 2),
 * and animates entry (10f) + exit (8f) with movement (rule 5). The concrete
 * insert type is dispatched below.
 */
interface Props {
  insert: InsertPlan;
  faceTrack: FaceTrack;
  fps: number;
  startFrame: number;
}

export const InsertLayer: React.FC<Props> = ({ insert, faceTrack, fps, startFrame }) => {
  const frame = useCurrentFrame();
  const { width, height, durationInFrames } = useVideoConfig();

  // Entry (10f) + exit (8f) envelope with movement.
  const enter = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const exit = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], { extrapolateLeft: 'clamp', easing: Easing.in(Easing.cubic) });
  const env = Math.min(enter, exit);
  const slideY = (1 - enter) * 30 + (1 - exit) * 30;

  // Resolve a placement box (normalised) that avoids the face box.
  const box = resolvePlacement(insert.anchor, faceTrack, startFrame, width, height);

  // Sit the insert JUST ABOVE the subtitles: anchor by its bottom edge to the
  // top of the caption band and let it grow upward.
  const captionBandBottom = theme.caption.baselineFromBottom + theme.caption.size + 30;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: box.x * width,
          width: box.w * width,
          bottom: captionBandBottom,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          alignItems: 'center',
          opacity: env,
          transform: `translateY(${slideY}px)`,
        }}
      >
        {renderInsert(insert, env)}
      </div>
    </AbsoluteFill>
  );
};

function renderInsert(insert: InsertPlan, env: number): React.ReactNode {
  const p = insert.props as Record<string, unknown>;
  switch (insert.type) {
    case 'StatCard': return <StatCard value={String(p.value ?? '')} label={String(p.label ?? '')} source={p.source ? String(p.source) : undefined} env={env} />;
    case 'ComparisonBar': return <ComparisonBar a={p.a as any} b={p.b as any} env={env} />;
    case 'LowerThird': return <LowerThird name={String(p.name ?? '')} role={String(p.role ?? '')} env={env} />;
    case 'KeywordPop': return <KeywordPop word={String(p.word ?? p.value ?? '')} env={env} />;
    case 'QuoteBlock': return <QuoteBlock text={String(p.text ?? '')} source={p.source ? String(p.source) : undefined} env={env} />;
    case 'ChecklistReveal': return <ChecklistReveal items={(p.items as string[]) ?? []} env={env} />;
    case 'TimelineBar': return <TimelineBar steps={(p.steps as string[]) ?? []} env={env} />;
    case 'Shape3D': return <Shape3D env={env} />;
    default: return null;
  }
}

/**
 * Placement (normalised). FaceFrame reframes the subject to a fixed
 * upper-third-centre in the OUTPUT (targetY≈0.36), so the free zones in the
 * rendered frame are the TOP strip (above the head) and are independent of the
 * raw face_track position. Inserts sit in the top strip: clear of the face and
 * clear of the captions (which live low, at 640px from the bottom). We do NOT
 * relocate based on raw face_track coords — those are pre-reframe and would
 * (wrongly) push inserts down into the caption zone.
 */
function resolvePlacement(
  anchor: InsertPlan['anchor'],
  _faceTrack: FaceTrack,
  _startFrame: number,
  _width: number,
  _height: number,
): { x: number; y: number; w: number } {
  const top = { x: 0.06, y: 0.05, w: 0.88 }; // dedicated top band above the reframed face
  return { top, bottom: top, left: top, right: top }[anchor] ?? top;
}
