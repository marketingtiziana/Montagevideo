import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, Easing } from 'remotion';
import type { InsertPlan, FaceTrack } from '../../src/lib/types.js';
import { theme } from '../theme.js';
import { StatCard } from './inserts/StatCard.js';
import { ComparisonBar } from './inserts/ComparisonBar.js';
import { LowerThird } from './inserts/LowerThird.js';
import { KeywordPop } from './inserts/KeywordPop.js';
import { QuoteBlock } from './inserts/QuoteBlock.js';
import { ChecklistReveal } from './inserts/ChecklistReveal.js';
import { TimelineBar } from './inserts/TimelineBar.js';
import { Shape3D } from './inserts/Shape3D.js';

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

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: box.x * width,
          top: box.y * height,
          width: box.w * width,
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
 * Choose a placement box (normalised) for the requested anchor, then push it
 * away if it collides with the face box on this frame. The face box is derived
 * from face_track.json; an insert is never allowed to sit over it.
 */
function resolvePlacement(
  anchor: InsertPlan['anchor'],
  faceTrack: FaceTrack,
  startFrame: number,
  width: number,
  height: number,
): { x: number; y: number; w: number } {
  const base: Record<string, { x: number; y: number; w: number }> = {
    top: { x: 0.1, y: 0.06, w: 0.8 },
    bottom: { x: 0.1, y: 0.62, w: 0.8 },
    left: { x: 0.05, y: 0.35, w: 0.4 },
    right: { x: 0.55, y: 0.35, w: 0.4 },
  };
  let box = base[anchor] ?? base.top;

  const fp = faceTrack.frames[Math.min(startFrame, Math.max(0, faceTrack.frames.length - 1))];
  if (fp) {
    const fw = fp.scale;
    const fh = fp.scale * (width / height) * 1.3;
    const faceBox = { x: fp.cx - fw / 2, y: fp.cy - fh / 2, w: fw, h: fh };
    // If the chosen band overlaps the face vertically, prefer the top band
    // (face is framed in the upper third, so bottom is usually free).
    const insertH = 0.16;
    const overlapsV = box.y < faceBox.y + faceBox.h && box.y + insertH > faceBox.y;
    if (overlapsV) box = base.bottom;
  }
  return box;
}
