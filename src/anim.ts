// ===== Grammaire d'animation =====
// Chaque élément a 3 temps : ENTRÉE (12-16f, overshoot 1.03) · TENUE (dérive/respiration) · SORTIE (60% de l'entrée, ne rembobine pas).
// Deux propriétés animées maximum par élément.
import { interpolate, spring } from "remotion";

export const ENTER = 14; // frames d'entrée
export const EXIT = 9; // ~60% de l'entrée

export type Env = {
  e: number; // progression d'entrée 0→1
  x: number; // progression de sortie 0→1
  alive: boolean;
  t: number;
  exitStart: number;
};

// Enveloppe temporelle d'un élément. holdFrames = durée de tenue (après l'entrée).
export function envelope(
  t: number,
  fps: number,
  holdFrames: number,
  enter: number = ENTER,
  exit: number = EXIT,
): Env {
  const exitStart = enter + Math.max(0, holdFrames);
  const e =
    t <= 0
      ? 0
      : spring({
          frame: t,
          fps,
          config: { damping: 200, mass: 0.6, stiffness: 120 },
          durationInFrames: enter,
        });
  const x = interpolate(t, [exitStart, exitStart + exit], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return { e, x, alive: t >= 0 && x < 1, t, exitStart };
}

// Échelle : anticipation → overshoot 1.03 → stabilisation ; sortie continue vers 0.96 (pas de marche arrière).
export function scaleInOut(env: Env): number {
  if (env.x > 0) return interpolate(env.x, [0, 1], [1.0, 0.96]);
  return interpolate(env.e, [0, 0.6, 1], [0.94, 1.03, 1.0]);
}

// Opacité (toujours l'une des deux propriétés).
export function opacityInOut(env: Env): number {
  return Math.min(
    interpolate(env.e, [0, 1], [0, 1]),
    interpolate(env.x, [0, 1], [1, 0]),
  );
}

// Translation d'entrée (px) : arrive depuis un décalage, poursuit légèrement en sortie.
export function translateInOut(env: Env, fromPx: number): number {
  if (env.x > 0) return interpolate(env.x, [0, 1], [0, fromPx * -0.18]); // continue, ne rembobine pas
  return interpolate(env.e, [0, 1], [fromPx, 0]);
}

// Dérive lente de tenue (6px) — l'élément n'est jamais figé.
export function holdDrift(t: number, px: number = 6, span: number = 120): number {
  return interpolate(t, [ENTER, ENTER + span], [0, px], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

// Respiration d'échelle de tenue (±0.4%).
export function holdBreath(t: number): number {
  return 1 + 0.004 * Math.sin((t - ENTER) / 14);
}

// Flou de mouvement : au-delà de 200px de déplacement, flou proportionnel à la vitesse d'entrée.
export function motionBlur(env: Env, distancePx: number): number {
  if (distancePx < 200) return 0;
  const v = 1 - env.e; // vitesse ~ décroît sur l'entrée
  return Math.min(14, v * 14);
}

// Décalage en cascade : 4 frames entre éléments frères.
export const CASCADE = 4;

// Durée de tenue minimale = mots × 0,3 s + 0,7 s, jamais < 1,4 s.
export function minHoldFrames(words: number, fps: number): number {
  return Math.max(1.4, words * 0.3 + 0.7) * fps;
}
