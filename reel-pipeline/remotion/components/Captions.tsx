import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';
import type { CaptionGroup } from '../../src/lib/types.js';
import { theme, captionTextShadow } from '../theme.js';

/**
 * Captions (10.3). Groups of 2–4 words, one line, <=22 chars. The active word
 * is revealed by a colour change (white -> accent) and a 1.00->1.06 scale over
 * 3 frames. Inter Black 900, 84px, letter-spacing -0.02em, NOT uppercase.
 * Crisp 6px ink outline + hard offset shadow, no blur, no background box.
 * Group entry: translateY 14px + opacity over 4 frames, ease out cubic.
 */
interface Props {
  groups: CaptionGroup[];
  fps: number;
  height: number;
}

export const Captions: React.FC<Props> = ({ groups, fps, height }) => {
  const frame = useCurrentFrame();
  const t = frame / fps;
  const group = groups.find((g) => t >= g.start && t < g.end);
  if (!group) return null;

  const startFrame = Math.round(group.start * fps);
  const local = frame - startFrame;

  // Group entry animation (4 frames).
  const entryY = interpolate(local, [0, 4], [14, 0], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });
  const entryO = interpolate(local, [0, 4], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) });

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: theme.caption.baselineFromBottom,
        display: 'flex',
        justifyContent: 'center',
        gap: 18,
        padding: `0 ${theme.safe.side + 20}px`,
        transform: `translateY(${entryY}px)`,
        opacity: entryO,
      }}
    >
      {group.words.map((w, i) => {
        const active = t >= w.start && t < w.end;
        const past = t >= w.end;
        const reveal = interpolate(frame - Math.round(w.start * fps), [0, 3], [1.0, 1.06], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const color = active || past ? (w.accent ? theme.colors.accent : theme.colors.white) : theme.colors.white;
        return (
          <span
            key={i}
            style={{
              fontFamily: theme.font,
              fontWeight: theme.weights.black,
              fontSize: theme.caption.size,
              letterSpacing: theme.caption.letterSpacing,
              color,
              textShadow: captionTextShadow(),
              transform: active ? `scale(${reveal})` : 'scale(1)',
              transformOrigin: 'center bottom',
              whiteSpace: 'nowrap',
              lineHeight: 1,
            }}
          >
            {w.text}
          </span>
        );
      })}
    </div>
  );
};
