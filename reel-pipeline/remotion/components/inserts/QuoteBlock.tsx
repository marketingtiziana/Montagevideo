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
        padding: '28px 28px 22px',
        fontFamily: theme.font,
        color: theme.colors.white,
        boxShadow: `0 6px 0 ${theme.colors.ink}`,
      }}
    >
      <div style={{ position: 'absolute', top: -22, left: 16, fontSize: 110, lineHeight: 1, fontWeight: theme.weights.black, color: theme.colors.indigo }}>“</div>
      <div style={{ fontWeight: theme.weights.bold, fontSize: 34, lineHeight: 1.22, marginTop: 14 }}>{text}</div>
      {source ? <div style={{ fontWeight: theme.weights.regular, fontSize: 24, color: theme.colors.indigo, marginTop: 10 }}>{source}</div> : null}
    </div>
  );
};
