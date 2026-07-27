import React, { useMemo } from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

// Grain animé (opacité ~0.04) + vignette radiale subtile.
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();

  // grain via un data-URI SVG feTurbulence, seed qui change chaque frame
  const seed = frame % 12;
  const grainUri = useMemo(() => {
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='260' height='260'>
      <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' seed='${seed}'/>
      <feColorMatrix type='saturate' values='0'/></filter>
      <rect width='100%' height='100%' filter='url(#n)'/></svg>`;
    return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
  }, [seed]);

  // léger scintillement d'opacité
  const op = 0.035 + random(`g${frame}`) * 0.012;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          backgroundImage: grainUri,
          backgroundSize: "260px 260px",
          opacity: op,
          mixBlendMode: "overlay",
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 80% at 50% 42%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.22) 82%, rgba(0,0,0,0.5) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
