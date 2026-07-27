import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

// Bandeau : slide depuis la gauche + blur qui se résorbe de 12px à 0.
export const LowerThird: React.FC<{
  title: string;
  label: string;
  inSec: number;
  durationSec: number;
  anchor: string;
  danger?: boolean;
}> = ({ title, label, inSec, durationSec, anchor, danger }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f0 = inSec * fps;
  const local = frame - f0;
  const total = durationSec * fps;
  if (local < 0 || local > total) return null;

  const enter = interpolate(local, [0, 8], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = interpolate(local, [total - 8, total], [1, 0], { extrapolateLeft: "clamp" });
  const op = Math.min(enter, exit);
  const tx = interpolate(enter, [0, 1], [-260, 0]);
  const blur = interpolate(enter, [0, 1], [12, 0]);

  const top = anchor === "center_low" ? 1120 : anchor === "lower" ? 1430 : 1470;
  const accent = danger ? THEME.danger : THEME.accent;

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: 70,
        opacity: op,
        transform: `translateX(${tx}px)`,
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          alignSelf: "flex-start",
          background: accent,
          color: THEME.ink,
          fontFamily: "Inter",
          fontWeight: 900,
          fontSize: 58,
          textTransform: "uppercase",
          letterSpacing: "-0.01em",
          padding: "8px 22px",
          borderRadius: 10,
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        }}
      >
        {title}
      </div>
      <div
        style={{
          alignSelf: "flex-start",
          background: "rgba(5,7,10,0.82)",
          color: THEME.white,
          fontFamily: "Inter",
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: "0.01em",
          padding: "8px 18px",
          borderRadius: 8,
        }}
      >
        {label}
      </div>
    </div>
  );
};
