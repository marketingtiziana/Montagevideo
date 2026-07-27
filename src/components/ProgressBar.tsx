import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

// Fine barre en haut qui se remplit sur toute la durée du short.
export const ProgressBar: React.FC<{ heightPx?: number }> = ({ heightPx = 6 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], {
    extrapolateRight: "clamp",
  });
  return (
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: heightPx, background: "rgba(255,255,255,0.12)" }}>
      <div style={{ width: `${p * 100}%`, height: "100%", background: THEME.accent }} />
    </div>
  );
};
