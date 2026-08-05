import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { theme } from '../../theme';

/** LowerThird — name / role. Indigo bar wipes in from the left, pushes text. */
export const LowerThird: React.FC<{ name: string; role: string; env: number }> = ({ name, role }) => {
  const frame = useCurrentFrame();
  const wipe = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const textReveal = interpolate(frame, [6, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', fontFamily: theme.font, overflow: 'hidden', borderRadius: theme.radius, boxShadow: `0 8px 0 ${theme.colors.ink}` }}>
      <div style={{ width: 16 * wipe + 8, background: theme.colors.indigo }} />
      <div style={{ background: theme.colors.navy, padding: '16px 24px', color: theme.colors.white, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
        <div style={{ fontWeight: theme.weights.black, fontSize: 36, opacity: textReveal }}>{name}</div>
        <div style={{ fontWeight: theme.weights.bold, fontSize: 24, color: theme.colors.indigo, opacity: textReveal, marginTop: 3 }}>{role}</div>
      </div>
    </div>
  );
};
