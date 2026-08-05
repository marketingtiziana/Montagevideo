import React from 'react';
import { useCurrentFrame, interpolate, spring, useVideoConfig, Easing } from 'remotion';
import { theme } from '../../theme.js';

/** TimelineBar — a chronology. The line traces, points pop in sequence. */
export const TimelineBar: React.FC<{ steps: string[]; env: number }> = ({ steps }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pts = steps.slice(0, 4);
  const trace = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });

  return (
    <div style={{ background: theme.colors.navy, borderRadius: theme.radius, padding: '40px 36px', fontFamily: theme.font, boxShadow: `0 8px 0 ${theme.colors.ink}` }}>
      <div style={{ position: 'relative', height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3, marginBottom: 28 }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: 6, width: `${trace * 100}%`, background: theme.colors.indigo, borderRadius: 3 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {pts.map((label, i) => {
          const s = spring({ frame: frame - 6 - i * 5, fps, config: { damping: 200, stiffness: 150 }, durationInFrames: 8 });
          return (
            <div key={i} style={{ textAlign: 'center', flex: 1, opacity: s, transform: `scale(${0.6 + 0.4 * s})` }}>
              <div style={{ width: 22, height: 22, borderRadius: 11, background: theme.colors.indigo, margin: '0 auto 10px' }} />
              <div style={{ color: theme.colors.white, fontWeight: theme.weights.bold, fontSize: 26 }}>{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
