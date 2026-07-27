import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Camera, TransitionIn } from "../edit";

const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

// Caméra virtuelle -> {scale, tx, ty}
function cameraTransform(cam: Camera, frame: number, dur: number) {
  let scale = 1;
  let tx = 0;
  let ty = 0;
  if (cam.type === "punch_in") {
    // le zoom se TERMINE avant la fin du plan (interdit: zoom sur toute la durée)
    scale = interpolate(frame, [0, 25], [cam.from, cam.to], {
      easing: EXPO,
      extrapolateRight: "clamp",
    });
    // drift lent APRÈS le punch pour tuer l'image figée (translation, pas un zoom)
    tx = interpolate(frame, [25, dur], [0, -11], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    ty = interpolate(frame, [25, dur], [0, 6], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (cam.type === "snap_zoom") {
    // 1.0 -> to sur 3 frames, retour sur 10 frames (réservé punchline)
    scale = interpolate(frame, [0, 3, 13], [cam.from, cam.to, 1.0], {
      easing: Easing.out(Easing.quad),
      extrapolateRight: "clamp",
    });
  } else if (cam.type === "drift") {
    // translation lente sur toute la durée pour tuer l'image figée
    const p = interpolate(frame, [0, dur], [0, 1], { extrapolateRight: "clamp" });
    tx = interpolate(p, [0, 1], [-cam.px / 2, cam.px / 2]);
    scale = 1.06; // léger sur-cadrage pour masquer le drift sur bords
  } else if (cam.type === "shake") {
    // drift lent de base pour ne jamais figer l'image
    scale = 1.05;
    tx = interpolate(frame, [0, dur], [-6, 6], { extrapolateRight: "clamp" });
    // + oscillation ±px sur les 8 dernières frames (impact sonore "tout retombe")
    const startShake = dur - 8;
    if (frame >= startShake) {
      const k = frame - startShake;
      const decay = interpolate(k, [0, 8], [1, 0], { extrapolateRight: "clamp" });
      tx += Math.sin(k * 2.4) * cam.px * decay;
      ty = Math.cos(k * 2.9) * cam.px * decay;
      scale = 1.03;
    }
  }
  return { scale, tx, ty };
}

// Intro de transition sur l'incoming clip -> {tx, blur, flash}
function transitionIntro(t: TransitionIn, frame: number) {
  if (t === "whip_left") {
    const tx = interpolate(frame, [0, 6], [220, 0], {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: "clamp",
    });
    const blur = interpolate(frame, [0, 6], [14, 0], { extrapolateRight: "clamp" });
    return { tx, blur, flash: 0 };
  }
  if (t === "whip_right") {
    const tx = interpolate(frame, [0, 6], [-220, 0], {
      easing: Easing.out(Easing.cubic),
      extrapolateRight: "clamp",
    });
    const blur = interpolate(frame, [0, 6], [14, 0], { extrapolateRight: "clamp" });
    return { tx, blur, flash: 0 };
  }
  if (t === "flash") {
    const flash = interpolate(frame, [0, 2, 6], [1, 0.6, 0], { extrapolateRight: "clamp" });
    return { tx: 0, blur: 0, flash };
  }
  if (t === "zoom_blur") {
    const blur = interpolate(frame, [0, 5], [12, 0], { extrapolateRight: "clamp" });
    return { tx: 0, blur, flash: 0 };
  }
  return { tx: 0, blur: 0, flash: 0 };
}

export const Clip: React.FC<{
  fromFrame: number; // position cumulée dans base_cut.mp4 (lecture linéaire, zéro seek)
  camera: Camera;
  transition: TransitionIn;
  durFrames: number;
}> = ({ fromFrame, camera, transition, durFrames }) => {
  const frame = useCurrentFrame();
  const cam = cameraTransform(camera, frame, durFrames);
  const intro = transitionIntro(transition, frame);

  // aberration chromatique 1px : uniquement pendant flash / pic de snap_zoom
  const chroma =
    intro.flash > 0 || (camera.type === "snap_zoom" && frame >= 1 && frame <= 6) ? 1 : 0;

  const trimBefore = fromFrame;

  const videoStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  };

  // aberration chromatique 1px approximée par frange colorée (cheap, pas de double décodage)
  const chromaFilter =
    chroma > 0
      ? "drop-shadow(1px 0 0 rgba(255,45,92,0.55)) drop-shadow(-1px 0 0 rgba(59,232,255,0.55))"
      : undefined;
  const blurFilter = intro.blur > 0 ? `blur(${intro.blur}px)` : undefined;
  const filter = [blurFilter, chromaFilter].filter(Boolean).join(" ") || undefined;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${cam.tx + intro.tx}px, ${cam.ty}px) scale(${cam.scale})`,
          filter,
        }}
      >
        <OffthreadVideo src={staticFile("base_cut.mp4")} trimBefore={trimBefore} muted style={videoStyle} />
      </AbsoluteFill>
      {intro.flash > 0 && (
        <AbsoluteFill style={{ backgroundColor: "#fff", opacity: intro.flash }} />
      )}
    </AbsoluteFill>
  );
};
