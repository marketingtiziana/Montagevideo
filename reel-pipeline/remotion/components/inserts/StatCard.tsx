import React from 'react';
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { theme } from '../../theme.js';

/** StatCard — a cited figure. Counter increments, card springs up 30px. */
export const StatCard: React.FC<{ value: string; label: string; source?: string; env: number }> = ({ value, label, source }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rise = spring({ frame, fps, config: { damping: 200, stiffness: 120 }, durationInFrames: 14 });

  // Animate the leading numeric part of `value` (e.g. "27 %").
  const num = parseFloat(value.replace(',', '.'));
  const suffix = value.replace(/^[\d.,\s]+/, '');
  const shown = isNaN(num) ? value : `${Math.round(num * Math.min(1, frame / 18))}${suffix ? ' ' + suffix : ''}`;

  return (
    <div
      style={{
        transform: `translateY(${(1 - rise) * 30}px)`,
        background: theme.colors.navy,
        borderRadius: theme.radius,
        border: `3px solid ${theme.colors.indigo}`,
        padding: '36px 44px',
        color: theme.colors.white,
        fontFamily: theme.font,
        boxShadow: `0 8px 0 ${theme.colors.ink}`,
      }}
    >
      <div style={{ fontWeight: theme.weights.black, fontSize: 120, color: theme.colors.indigo, lineHeight: 1 }}>{shown}</div>
      <div style={{ fontWeight: theme.weights.bold, fontSize: 40, marginTop: 8 }}>{label}</div>
      {source ? <div style={{ fontWeight: theme.weights.regular, fontSize: 26, opacity: 0.7, marginTop: 10 }}>{source}</div> : null}
    </div>
  );
};
