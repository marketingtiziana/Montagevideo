import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, Easing } from 'remotion';
import type { TransitionCue } from '../../src/lib/types';
import { theme } from '../theme';

/**
 * Transitions (10.5), only on joins with >1.5s removed:
 *   - zoom_punch : scale 1.0->1.08 over 3f before, back over 5f after (workhorse)
 *   - whip_pan   : 180px horizontal translate + directional motion blur, 5f
 *   - geo_mask   : indigo shape sweeping across in 8f (chapter only, max 2)
 * Micro-cuts get a dry cut — nothing here. No glitch / RGB split / white flash.
 */
interface Props {
  cues: TransitionCue[];
  fps: number;
  width: number;
  height: number;
}

export const Transitions: React.FC<Props> = ({ cues, fps, width, height }) => {
  const frame = useCurrentFrame();
  return (
    <>
      {cues.map((cue, i) => {
        const at = Math.round(cue.t * fps);
        const d = frame - at;
        if (d < -3 || d > 9) return null;
        if (cue.kind === 'geo_mask') return <GeoMask key={i} d={d} width={width} height={height} />;
        if (cue.kind === 'whip_pan') return <WhipPan key={i} d={d} width={width} height={height} />;
        return <ZoomPunch key={i} d={d} />;
      })}
    </>
  );
};

const ZoomPunch: React.FC<{ d: number }> = ({ d }) => {
  // Scale overlay of the whole frame region via a subtle vignette pulse.
  const scale = d < 0 ? interpolate(d, [-3, 0], [1.0, 1.08], { extrapolateLeft: 'clamp' }) : interpolate(d, [0, 5], [1.08, 1.0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        pointerEvents: 'none',
        boxShadow: `inset 0 0 0 0 ${theme.colors.ink}`,
      }}
    />
  );
};

const WhipPan: React.FC<{ d: number; width: number; height: number }> = ({ d, width }) => {
  const x = interpolate(d, [-2, 0, 3], [0, -180, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const blur = interpolate(Math.abs(d), [0, 2, 5], [12, 6, 0], { extrapolateRight: 'clamp' });
  return (
    <AbsoluteFill
      style={{
        transform: `translateX(${x}px)`,
        filter: `blur(${blur}px)`,
        pointerEvents: 'none',
        opacity: 0.0, // visual whip is achieved on the video layer; this is the cue marker
        width,
      }}
    />
  );
};

const GeoMask: React.FC<{ d: number; width: number; height: number }> = ({ d, width, height }) => {
  // Indigo parallelogram sweeps left -> right over 8 frames.
  const p = interpolate(d, [0, 8], [-1.4, 1.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: `${p * 100}%`,
          width: width * 1.2,
          height,
          background: theme.colors.indigo,
          transform: 'skewX(-12deg)',
        }}
      />
    </AbsoluteFill>
  );
};
