import React from "react";
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

// Chiffre qui compte de 0 à sa valeur en 0,8s (ease out) + barre qui se remplit.
export const StatCounter: React.FC<{
  value: string;
  label: string;
  inSec: number;
  durationSec: number;
}> = ({ value, label, inSec, durationSec }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const f0 = inSec * fps;
  const local = frame - f0;
  const total = durationSec * fps;
  if (local < 0 || local > total) return null;

  const num = parseFloat(value.replace(/[^\d.]/g, "")) || 0;
  const suffix = value.replace(/[\d.]/g, "");

  const count = interpolate(local, [0, 0.8 * fps], [0, num], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bar = interpolate(local, [0, 0.8 * fps], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // entrée/sortie
  const enter = interpolate(local, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(local, [total - 8, total], [1, 0], { extrapolateLeft: "clamp" });
  const op = Math.min(enter, exit);
  const ty = interpolate(enter, [0, 1], [-30, 0]);

  return (
    <div
      style={{
        position: "absolute",
        top: 300,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: op,
        transform: `translateY(${ty}px)`,
      }}
    >
      <div
        style={{
          fontFamily: "Inter",
          fontWeight: 900,
          fontSize: 200,
          color: THEME.accent,
          WebkitTextStroke: `9px ${THEME.stroke}`,
          paintOrder: "stroke fill",
          letterSpacing: "-0.03em",
          textShadow: "0 8px 26px rgba(0,0,0,0.6)",
        }}
      >
        {Math.round(count)}
        {suffix}
      </div>
      <div style={{ width: 520, height: 12, borderRadius: 8, background: "rgba(255,255,255,0.18)", overflow: "hidden", marginTop: 6 }}>
        <div style={{ width: `${bar * 100}%`, height: "100%", background: THEME.accent, borderRadius: 8 }} />
      </div>
      <div
        style={{
          marginTop: 18,
          fontFamily: "Inter",
          fontWeight: 800,
          fontSize: 46,
          textTransform: "uppercase",
          letterSpacing: "0.02em",
          color: THEME.white,
          WebkitTextStroke: `5px ${THEME.stroke}`,
          paintOrder: "stroke fill",
        }}
      >
        {label}
      </div>
    </div>
  );
};
