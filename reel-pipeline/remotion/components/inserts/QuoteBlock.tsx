import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import { theme } from '../../theme';

/** QuoteBlock — a citation / law article. Navy 92% block, giant indigo quote. */
export const QuoteBlock: React.FC<{ text: string; source?: string; env: number }> = ({ text, source }) => {
  const frame = useCurrentFrame();
  const rise = interpolate(frame, [0, 10], [24, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  return (
    <div
      style={{
        position: 'relative',
        transform: `translateY(${rise}px)`,
        background: 'rgba(15,21,53,0.92)', // navy @ 92%
        borderRadius: theme.radius,
        padding: '48px 40px 36px',
        fontFamily: theme.font,
        color: theme.colors.white,
        boxShadow: `0 8px 0 ${theme.colors.ink}`,
      }}
    >
      <div style={{ position: 'absolute', top: -30, left: 20, fontSize: 160, lineHeight: 1, fontWeight: theme.weights.black, color: theme.colors.indigo }}>“</div>
      <div style={{ fontWeight: theme.weights.bold, fontSize: 44, lineHeight: 1.25, marginTop: 20 }}>{text}</div>
      {source ? <div style={{ fontWeight: theme.weights.regular, fontSize: 28, color: theme.colors.indigo, marginTop: 16 }}>{source}</div> : null}
    </div>
  );
};
