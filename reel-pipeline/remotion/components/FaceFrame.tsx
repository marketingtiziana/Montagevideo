import React from 'react';
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, spring, interpolate } from 'remotion';
import type { Beat, FaceTrack } from '../../src/lib/types';

/**
 * Dynamic framing (10.2). OffthreadVideo cropped via transform, driven by
 * face_track.json. Base scale 1.12 (permanent light punch), range 1.00–1.42.
 * Punch-in on `punchline` beats (spring +0.14 over 8f, back over 22f). Slow
 * Ken Burns drift so the plate is never static. Face sits in the upper third.
 */
const BASE_SCALE = 1.08; // slight punch; face sits high to clear inserts above captions
const MIN_SCALE = 1.0;
const MAX_SCALE = 1.42;

interface Props {
  videoSrc: string;
  faceTrack: FaceTrack;
  beats: Beat[];
  fps: number;
  width: number;
  height: number;
}

export const FaceFrame: React.FC<Props> = ({ videoSrc, faceTrack, beats, fps, width, height }) => {
  const frame = useCurrentFrame();
  const fp = faceTrack.frames[Math.min(frame, Math.max(0, faceTrack.frames.length - 1))];

  // Face centre (normalised). Default to a pleasant upper-third framing.
  const cx = fp?.cx ?? 0.5;
  const cy = fp?.cy ?? 0.4;

  // Punch-in on punchline beats.
  const punch = beats
    .filter((b) => b.type === 'punchline')
    .reduce((acc, b) => {
      const start = Math.round(b.t * fps);
      if (frame < start) return acc;
      const up = spring({ frame: frame - start, fps, config: { damping: 200, stiffness: 120 }, durationInFrames: 8 });
      const down = interpolate(frame - start, [8, 30], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
      return acc + 0.14 * up * down;
    }, 0);

  // Ken Burns: 0.6% drift over 10s, alternating direction.
  const kb = 0.006 * Math.sin((frame / (fps * 10)) * Math.PI * 2);

  const scale = clamp(BASE_SCALE + punch + kb, MIN_SCALE, MAX_SCALE);

  // Keep the face high (upper third) so the band just above the captions is
  // clear for inserts (cy target ≈ 0.33).
  const targetY = 0.33;
  const dx = (0.5 - cx) * width * scale;
  const dyRaw = (targetY - cy) * height * scale;
  // Clamp so the frame never shows an edge.
  const maxDx = ((scale - 1) / 2) * width;
  const maxDy = ((scale - 1) / 2) * height;
  const dy = clamp(dyRaw, -maxDy, maxDy);
  const tx = clamp(dx, -maxDx, maxDx);

  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <OffthreadVideo
        src={staticFile(videoSrc)}
        style={{
          width,
          height,
          objectFit: 'cover',
          transform: `translate(${tx}px, ${dy}px) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      />
    </AbsoluteFill>
  );
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}
