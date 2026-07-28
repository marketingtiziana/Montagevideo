// ===== Composition finale — assemblage entièrement piloté par data/timeline.json =====
// Aucun timecode en dur ici : tout vient du JSON compilé depuis edit.json.
import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Sequence,
} from "remotion";
import timelineData from "../data/timeline.json";
import { T, textOutline, ensureFont } from "./theme";
import { ENTER, EXIT } from "./anim";
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
} from "./graphics/overlays";

type Cap = { in_f: number; out_f: number; words: { w: string; accent: boolean; at_f: number }[] };
type Seg = {
  id: string;
  out_start: number;
  out_end: number;
  transition_in: string;
  camera: { type: string; from?: number; to?: number; scale?: number; drift_px?: number };
  graphic: Record<string, unknown> | null;
  captions: Cap[];
};
const TL = timelineData as unknown as { meta: { total_frames: number }; segments: Seg[] };
export const TOTAL_FRAMES = TL.meta.total_frames;
const SEGS = TL.segments;

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// Incrustations "dominantes" (centrées / plein cadre) → masquent les sous-titres.
const DOMINANT = new Set([
  "FullscreenStamp", "Toggle", "Map", "ComparisonBar",
  "HighlightBox", "StatCard", "FullscreenCard", "TwinReveal", "CTACard",
  "LowerThird", // le bandeau porte le sens : on masque le sous-titre pendant (pas de collision)
]);

type GTiming = { seg: Seg; type: string; appear: number; hold: number; total: number; dominant: boolean; props: Record<string, unknown> };

function graphicTiming(seg: Seg): GTiming | null {
  const g = seg.graphic;
  if (!g) return null;
  const type = g.type as string;
  let appear = seg.out_start + 6;
  const onWord = g.on_word as string | undefined;
  if (onWord) {
    const key = norm(onWord);
    outer: for (const ch of seg.captions)
      for (const w of ch.words)
        if (norm(w.w).includes(key) || key.includes(norm(w.w))) {
          appear = Math.max(seg.out_start + 2, w.at_f - 4);
          break outer;
        }
  }
  // le graphique doit tenir DANS son segment (ne jamais deborder sur le suivant)
  const MINTOTAL = ENTER + 42 + EXIT;
  if (appear + MINTOTAL > seg.out_end) appear = Math.max(seg.out_start, seg.out_end - MINTOTAL);
  const available = seg.out_end - appear;
  const hold = Math.max(42, Math.min(available - ENTER - EXIT, 72));
  return { seg, type, appear, hold, total: ENTER + hold + EXIT, dominant: DOMINANT.has(type), props: g };
}

const GRAPHICS = SEGS.map(graphicTiming).filter(Boolean) as GTiming[];
// Intervalles où une incrustation dominante est visible (pour masquer les sous-titres).
const DOM_INTERVALS = GRAPHICS.filter((g) => g.dominant).map((g) => [g.appear, g.appear + g.total] as [number, number]);

// ---------- Caméra sur le base cut (source déjà 9:16) ----------
const CameraVideo: React.FC = () => {
  const f = useCurrentFrame();
  const seg = SEGS.find((s) => f >= s.out_start && f < s.out_end) ?? SEGS[SEGS.length - 1];
  const local = (f - seg.out_start) / Math.max(1, seg.out_end - seg.out_start);
  const cam = seg.camera || { type: "static" };
  let scale = 1.03;
  let tx = 0;
  if (cam.type === "push_in") {
    scale = interpolate(local, [0, 1], [cam.from ?? 1.0, cam.to ?? 1.06]) * 1.02;
  } else {
    scale = (cam.scale ?? 1.0) * 1.03;
    // dérive lente pour ne jamais figer l'image
    tx = Math.sin((f - seg.out_start) / 40) * (cam.drift_px ?? 4);
  }
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile("base_cut.mp4")}
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale}) translateX(${tx}px)` }}
      />
    </AbsoluteFill>
  );
};

// ---------- Rendu d'une incrustation ----------
const GraphicNode: React.FC<{ g: GTiming }> = ({ g }) => {
  const p = g.props;
  const hold = g.hold;
  switch (g.type) {
    case "FullscreenStamp": return <FullscreenStamp hold={hold} word={(p.label as string) ?? "FAUX"} sub={(p.sub as string) ?? "1RE ERREUR"} />;
    case "Toggle": return <Toggle hold={hold} labels={(p.labels as [string, string]) ?? ["AMATEUR", "PRO"]} active={1} />;
    case "LowerThird": return <LowerThird hold={hold} titleText={(p.title as string) ?? ""} accent={p.accent as string | undefined} />;
    case "Map": return <MapCard hold={hold} chips={p.chips as { v: string; k: string; accent?: boolean }[] | undefined} />;
    case "ComparisonBar": return <ComparisonBar hold={hold} />;
    case "HighlightBox": return <HighlightBox hold={hold} text="LA DÉCISION" />;
    case "StatCard": return <StatCard hold={hold} value={(p.value as number) ?? 50} unit={(p.unit as string) ?? "%"} sub={(p.label as string) ?? "DE TES GAINS"} />;
    case "FullscreenCard": return <FullscreenCard hold={hold} text={(p.label as string) ?? "LE PIÈGE"} />;
    case "TwinReveal": return <TwinReveal hold={hold} left={(p.left as string) ?? "MÊMES GAINS"} right={(p.right as string) ?? "FORTUNES ≠"} />;
    case "CTACard": return <CTACard hold={hold} word={(p.label as string) ?? "« POKER »"} />;
    default: return null;
  }
};

// ---------- Sous-titres karaoké ----------
const CaptionsLayer: React.FC = () => {
  const f = useCurrentFrame();
  // masqué si une incrustation dominante est visible
  if (DOM_INTERVALS.some(([a, b]) => f >= a && f < b)) return null;
  let active: Cap | null = null;
  for (const s of SEGS)
    for (const ch of s.captions)
      if (f >= ch.in_f - 4 && f < ch.out_f + 6) { active = ch; break; }
  if (!active) return null;
  const app = interpolate(f, [active.in_f - 2, active.in_f + 2], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sc = interpolate(f, [active.in_f - 2, active.in_f + 2], [0.95, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let activeIdx = 0;
  active.words.forEach((w, i) => { if (f >= w.at_f) activeIdx = i; });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 1180, left: T.marginX, right: T.marginX, textAlign: "center", opacity: app, transform: `scale(${sc})` }}>
        <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 88, letterSpacing: "-0.02em", lineHeight: 1.12, textShadow: textOutline(8) }}>
          {active.words.map((w, i) => (
            <span key={i} style={{ color: i === activeIdx || w.accent ? T.accent : T.white, marginRight: 18 }}>{w.w}</span>
          ))}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Transition signature (unique, au pivot s06) ----------
const Signature: React.FC = () => {
  const seg = SEGS.find((s) => s.transition_in === "SIGNATURE");
  const { fps } = useVideoConfig();
  const f = useCurrentFrame();
  if (!seg) return null;
  const t0 = seg.out_start - 5;
  const dur = 12;
  const p = interpolate(f, [t0, t0 + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (f < t0 || f > t0 + dur) return null;
  // panneau accent qui balaie le cadre de gauche à droite, flou de mouvement
  const x = interpolate(p, [0, 1], [-1200, 1200]);
  const blur = interpolate(p, [0, 0.5, 1], [0, 24, 0]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, width: 1500, left: 0, transform: `translateX(${x}px) skewX(-12deg)`, background: T.accent, filter: `blur(${blur}px)`, boxShadow: T.shadow }} />
    </AbsoluteFill>
  );
};

export const Short: React.FC = () => {
  ensureFont();
  return (
    <AbsoluteFill style={{ background: "#05070A" }}>
      <CameraVideo />
      {GRAPHICS.map((g) => (
        <Sequence key={g.seg.id} from={g.appear} durationInFrames={g.total} name={`gfx-${g.seg.id}`}>
          <GraphicNode g={g} />
        </Sequence>
      ))}
      <CaptionsLayer />
      <Signature />
    </AbsoluteFill>
  );
};
