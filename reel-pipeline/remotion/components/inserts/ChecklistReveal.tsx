import React from 'react';
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { theme } from '../../theme';

/** ChecklistReveal — 3–5 points cascading in with an indigo check. */
export const ChecklistReveal: React.FC<{ items: string[]; env: number }> = ({ items }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const list = items.slice(0, 5);

  return (
    <div style={{ background: theme.colors.navy, borderRadius: theme.radius, padding: 36, fontFamily: theme.font, boxShadow: `0 8px 0 ${theme.colors.ink}` }}>
      {list.map((item, i) => {
        const s = spring({ frame: frame - i * 6, fps, config: { damping: 200, stiffness: 130 }, durationInFrames: 10 });
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: i < list.length - 1 ? 22 : 0, opacity: s, transform: `translateX(${(1 - s) * 24}px)` }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.colors.indigo, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto' }}>
              <Check />
            </div>
            <div style={{ color: theme.colors.white, fontWeight: theme.weights.bold, fontSize: 38 }}>{item}</div>
          </div>
        );
      })}
    </div>
  );
};

const Check: React.FC = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
    <path d="M4 12.5l5 5L20 6" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
