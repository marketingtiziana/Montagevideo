import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { theme } from '../../theme.js';

interface Side { label: string; value: number; }
/** ComparisonBar — A vs B / before vs after. Bars fill sequentially (+6f). */
export const ComparisonBar: React.FC<{ a?: Side; b?: Side; env: number }> = ({ a, b }) => {
  const frame = useCurrentFrame();
  const A = a ?? { label: 'Avant', value: 100 };
  const B = b ?? { label: 'Après', value: 60 };
  const max = Math.max(A.value, B.value, 1);
  const fillA = interpolate(frame, [4, 20], [0, A.value / max], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const fillB = interpolate(frame, [10, 26], [0, B.value / max], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  return (
    <div style={{ background: theme.colors.navy, borderRadius: theme.radius, padding: 36, fontFamily: theme.font, color: theme.colors.white, boxShadow: `0 8px 0 ${theme.colors.ink}` }}>
      <Row label={A.label} fill={fillA} value={A.value} color={theme.colors.white} />
      <div style={{ height: 24 }} />
      <Row label={B.label} fill={fillB} value={B.value} color={theme.colors.indigo} />
    </div>
  );
};

const Row: React.FC<{ label: string; fill: number; value: number; color: string }> = ({ label, fill, value, color }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: theme.weights.bold, fontSize: 34, marginBottom: 10 }}>
      <span>{label}</span>
      <span style={{ color }}>{value}</span>
    </div>
    <div style={{ height: 34, borderRadius: 17, background: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
      <div style={{ width: `${fill * 100}%`, height: '100%', background: color, borderRadius: 17 }} />
    </div>
  </div>
);
