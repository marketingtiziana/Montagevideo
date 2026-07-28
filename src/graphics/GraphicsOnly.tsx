// ===== Animatic : toutes les incrustations à la suite sur fond neutre =====
// Sert la Phase 5 (critique des stills). Aucune vidéo, juste le système graphique.
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { T, label, ensureFont } from "../theme";
import { Grain } from "../components/Grain";
import {
  FullscreenStamp,
  Toggle,
  LowerThird,
  MapCard,
  ComparisonBar,
  HighlightBox,
  StatCard,
  FullscreenCard,
  TwinReveal,
  CTACard,
  CaptionChunk,
} from "./overlays";

export const SECTION = 96; // frames par incrustation

const NEUTRAL = "#3D4459"; // gris froid neutre : juge le blanc, le contour et l'accent

const items: { name: string; node: React.ReactNode }[] = [
  { name: "FullscreenStamp", node: <FullscreenStamp /> },
  { name: "Toggle", node: <Toggle /> },
  { name: "LowerThird", node: <LowerThird titleText="ACTIVITÉ PRO" accent="= IMPOSABLE" /> },
  { name: "MapCard", node: <MapCard /> },
  { name: "ComparisonBar", node: <ComparisonBar /> },
  { name: "HighlightBox", node: <HighlightBox text="LA DÉCISION" /> },
  { name: "StatCard", node: <StatCard value={50} unit="%" sub="DE TES GAINS" /> },
  { name: "FullscreenCard", node: <FullscreenCard text="LE PIÈGE" /> },
  { name: "TwinReveal", node: <TwinReveal /> },
  { name: "CTACard", node: <CTACard /> },
  {
    name: "Captions",
    node: (
      <>
        <Sequence durationInFrames={30}><CaptionChunk words={[{ w: "le" }, { w: "choix" }, { w: "du" }]} activeIndex={1} /></Sequence>
        <Sequence from={30} durationInFrames={30}><CaptionChunk words={[{ w: "pays" }, { w: "où", accent: true }, { w: "tu" }]} activeIndex={1} /></Sequence>
        <Sequence from={60} durationInFrames={36}><CaptionChunk words={[{ w: "c'est" }, { w: "LA", accent: true }, { w: "décision", accent: true }]} activeIndex={2} /></Sequence>
      </>
    ),
  },
];

export const GRAPHICS_TOTAL = items.length * SECTION;

const Tag: React.FC<{ name: string }> = ({ name }) => (
  <div style={{ position: "absolute", top: 60, left: T.marginX, ...label(30, "rgba(255,255,255,0.6)") }}>{name}</div>
);

export const GraphicsOnly: React.FC = () => {
  ensureFont();
  useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: NEUTRAL }}>
      {items.map((it, i) => (
        <Sequence key={it.name} from={i * SECTION} durationInFrames={SECTION} name={it.name}>
          <Tag name={it.name} />
          {it.node}
        </Sequence>
      ))}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
