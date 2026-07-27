import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionWord } from "../edit";
import { CAPTION, THEME } from "../theme";

// ponctuation supprimée sauf "?"
function disp(w: string) {
  return w.replace(/[«».,!:;]/g, "").trim();
}

type Chunk = { words: CaptionWord[]; start: number; end: number };

function chunkWords(words: CaptionWord[], max: number): Chunk[] {
  const chunks: Chunk[] = [];
  for (let i = 0; i < words.length; i += max) {
    const grp = words.slice(i, i + max);
    chunks.push({ words: grp, start: grp[0].start, end: grp[grp.length - 1].end });
  }
  return chunks;
}

export const Captions: React.FC<{ words: CaptionWord[] }> = ({ words }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (!words || words.length === 0) return null;

  const chunks = chunkWords(words, CAPTION.maxWords);
  // chunk actif = celui qui contient t (sinon le plus proche déjà commencé)
  let active = chunks.findIndex((c) => t >= c.start && t < c.end);
  if (active === -1) {
    active = chunks.filter((c) => c.start <= t).length - 1;
  }
  if (active < 0) active = 0;
  const chunk = chunks[active];

  // apparition : scale 0.94->1 + opacité 0->1 sur 4 frames à l'entrée du chunk
  const chunkStartFrame = chunk.start * fps;
  const appear = interpolate(frame, [chunkStartFrame, chunkStartFrame + 4], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const groupScale = interpolate(appear, [0, 1], [0.94, 1]);

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: CAPTION.blockCenterY - 150,
        height: 300,
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px 48px",
        padding: "0 80px",
        opacity: appear,
        transform: `scale(${groupScale})`,
      }}
    >
      {chunk.words.map((w, i) => {
        const isCurrent = t >= w.start && t < w.end;
        const isAccent = w.accent || isCurrent;
        const scale = isCurrent ? 1.06 : 1;
        return (
          <span
            key={i}
            style={{
              fontFamily: CAPTION.fontFamily,
              fontWeight: CAPTION.weight,
              fontSize: CAPTION.sizePx,
              letterSpacing: `${CAPTION.tracking}em`,
              lineHeight: 1.05,
              textTransform: "uppercase",
              color: isAccent ? THEME.accent : THEME.white,
              WebkitTextStroke: `${CAPTION.strokePx}px ${THEME.stroke}`,
              paintOrder: "stroke fill",
              textShadow: "0 6px 18px rgba(0,0,0,0.65)",
              transform: `scale(${scale})`,
              transformOrigin: "center",
              margin: "0 3px",
              display: "inline-block",
              transition: "none",
            }}
          >
            {disp(w.w)}
          </span>
        );
      })}
    </div>
  );
};
