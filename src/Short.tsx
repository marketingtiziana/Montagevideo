import React, { useEffect } from "react";
import {
  AbsoluteFill,
  continueRender,
  delayRender,
  Sequence,
  staticFile,
} from "remotion";
import { EDIT } from "./edit";
import { Clip } from "./components/Clip";
import { Captions } from "./components/Captions";
import { StatCounter } from "./components/StatCounter";
import { LowerThird } from "./components/LowerThird";
import { ProgressBar } from "./components/ProgressBar";
import { Grain } from "./components/Grain";
import { Shape3D } from "./components/Shape3D";

const fps = EDIT.meta.fps;

// Durées en frames (grille commune vidéo/audio) et positions cumulées.
export const layout = EDIT.segments.map((s) => ({
  ...s,
  durFrames: Math.round(s.dur * fps),
}));
let acc = 0;
export const placed = layout.map((s) => {
  const from = acc;
  acc += s.durFrames;
  return { ...s, from };
});
export const TOTAL_FRAMES = acc;

// Police
const useInter = () => {
  useEffect(() => {
    const handle = delayRender("font");
    const f = new FontFace("Inter", `url(${staticFile("assets/fonts/Inter.ttf")})`, {
      weight: "100 900",
    });
    f.load()
      .then((loaded) => {
        (document.fonts as FontFaceSet).add(loaded);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, []);
};

export const Short: React.FC = () => {
  useInter();
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {placed.map((s) => {
        const danger = s.overlay?.type === "lower_third" && s.overlay.value === "Fausse expat";
        return (
          <Sequence key={s.id} from={s.from} durationInFrames={s.durFrames} name={s.id}>
            <Clip
              fromFrame={s.from}
              camera={s.camera}
              transition={s.transition_in}
              durFrames={s.durFrames}
            />
            {s.id === "s10" && <Shape3D opacity={0.18} />}
            {/* CTA : le bandeau porte le message, on masque les sous-titres pour éviter la collision */}
            {s.role !== "cta" && <Captions words={s.caption_words} />}
            {s.overlay?.type === "stat_counter" && (
              <StatCounter
                value={s.overlay.value}
                label={s.overlay.label}
                inSec={s.overlay.in}
                durationSec={s.overlay.duration}
              />
            )}
            {s.overlay?.type === "lower_third" && (
              <LowerThird
                title={s.overlay.value}
                label={s.overlay.label}
                inSec={s.overlay.in}
                durationSec={s.overlay.duration}
                anchor={s.overlay.anchor}
                danger={danger}
              />
            )}
          </Sequence>
        );
      })}

      {/* Ambiance permanente + UI globale */}
      <Grain />
      <ProgressBar heightPx={6} />
    </AbsoluteFill>
  );
};
