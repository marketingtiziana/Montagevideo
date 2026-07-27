import React from "react";
import { ThreeCanvas } from "@remotion/three";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { THEME } from "../theme";

// Forme low-poly qui tourne lentement en arrière-plan, opacité <= 0.35.
// Ne doit jamais voler la vedette au sujet -> derrière la vidéo n'est pas possible,
// donc placée en overlay très discret au-dessus de la vidéo mais SOUS le texte.
const Spinner: React.FC = () => {
  const frame = useCurrentFrame();
  const rot = frame * 0.012;
  return (
    <>
      <ambientLight intensity={1.2} />
      <mesh rotation={[rot * 0.7, rot, rot * 0.3]}>
        <icosahedronGeometry args={[2.2, 0]} />
        <meshBasicMaterial color={THEME.accent} wireframe transparent opacity={0.9} />
      </mesh>
    </>
  );
};

export const Shape3D: React.FC<{ opacity?: number }> = ({ opacity = 0.3 }) => {
  const { width, height } = useVideoConfig();
  return (
    <div style={{ position: "absolute", inset: 0, opacity, pointerEvents: "none" }}>
      <ThreeCanvas width={width} height={height} style={{ background: "transparent" }} camera={{ position: [0, 0, 7], fov: 50 }}>
        <Spinner />
      </ThreeCanvas>
    </div>
  );
};
