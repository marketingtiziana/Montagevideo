import React from 'react';
import { useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { theme } from '../../theme.js';

/** KeywordPop — one strong keyword. Inter Black, scale 0.9 -> 1, no rotation. */
export const KeywordPop: React.FC<{ word: string; env: number }> = ({ word }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 180, stiffness: 140 }, durationInFrames: 12 });
  const scale = 0.9 + 0.1 * s;

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div
        style={{
          transform: `scale(${scale})`,
          fontFamily: theme.font,
          fontWeight: theme.weights.black,
          fontSize: 96,
          color: theme.colors.white,
          background: theme.colors.indigo,
          padding: '18px 40px',
          borderRadius: theme.radius,
          boxShadow: `0 8px 0 ${theme.colors.ink}`,
          textTransform: 'none',
        }}
      >
        {word}
      </div>
    </div>
  );
};
