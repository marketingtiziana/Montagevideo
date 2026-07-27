// Grain froid + vignette. Discret : opacité basse, ne mange pas le sujet.
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.06 }) => {
  const f = useCurrentFrame();
  const seed = (f % 6) * 13.37;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* vignette froide */}
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, rgba(0,0,0,0) 52%, rgba(5,7,16,0.42) 100%)",
        }}
      />
      {/* grain */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity }}>
        <filter id="g">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#g)" />
      </svg>
    </AbsoluteFill>
  );
};
