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
import cameraData from "../data/camera.json";
import { T, ensureFont } from "./theme";
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
  ProgressLine,
  TitleFlash,
  Chip,
  Tag,
} from "./graphics/overlays";

type Cap = { in_f: number; out_f: number; words: { w: string; key: boolean; at_f: number }[] };
const CAM = (cameraData as unknown as { cam: { scale: number; cx: number; cy: number; mblur: number }[] }).cam;
type Seg = {
  id: string;
  out_start: number;
  out_end: number;
  transition_in: string;
  camera: { type: string; from?: number; to?: number; scale?: number; drift_px?: number };
  graphics: Record<string, unknown>[];
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
  "LowerThird", "TitleFlash", "Chip", // portent le sens : masquent le sous-titre (pas de collision, <=2 elements)
]);

type GTiming = { seg: Seg; type: string; appear: number; hold: number; total: number; dominant: boolean; props: Record<string, unknown> };

function graphicTiming(seg: Seg, g: Record<string, unknown>): GTiming | null {
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
  // tenues par type : FullscreenCard = 0,6s (masque chapitre) ; TitleFlash/TwinReveal resserrés
  const holdFloor = type === "FullscreenCard" ? 18 : 42;
  const holdCap = type === "FullscreenCard" ? 18 : type === "TitleFlash" || type === "TwinReveal" ? 48 : 66;
  const MINTOTAL = ENTER + holdFloor + EXIT;
  if (appear + MINTOTAL > seg.out_end) appear = Math.max(seg.out_start, seg.out_end - MINTOTAL);
  const available = seg.out_end - appear;
  const hold = Math.max(holdFloor, Math.min(available - ENTER - EXIT, holdCap));
  return { seg, type, appear, hold, total: ENTER + hold + EXIT, dominant: DOMINANT.has(type), props: g };
}

const GRAPHICS = SEGS.flatMap((s) =>
  (s.graphics || []).map((g) => graphicTiming(s, g)),
).filter(Boolean) as GTiming[];
// Intervalles où une incrustation dominante est visible (pour masquer les sous-titres).
const DOM_INTERVALS = GRAPHICS.filter((g) => g.dominant).map((g) => [g.appear, g.appear + g.total] as [number, number]);

// ---------- Caméra virtuelle : crop par frame piloté par data/camera.json (suivi de visage) ----------
const CameraVideo: React.FC = () => {
  const f = useCurrentFrame();
  const c = CAM[Math.min(f, CAM.length - 1)] ?? { scale: 1, cx: 0.5, cy: 0.5, mblur: 0 };
  const W = 1080, H = 1920;
  // place le point (cx,cy) de la source au centre du cadre, à l'échelle scale
  const tx = W / 2 - c.cx * W * c.scale;
  const ty = H / 2 - c.cy * H * c.scale;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#05070A" }}>
      <OffthreadVideo
        src={staticFile("base_cut.mp4")}
        style={{
          width: W, height: H,
          transformOrigin: "0 0",
          transform: `translate(${tx}px, ${ty}px) scale(${c.scale})`,
          filter: c.mblur > 0.3 ? `blur(${c.mblur}px)` : "none",
        }}
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
    case "TitleFlash": return <TitleFlash hold={hold} text={(p.label as string) ?? "LE VRAI SUJET"} />;
    case "Chip": return <Chip hold={hold} big={(p.big as string) ?? ""} small={(p.small as string) ?? ""} />;
    case "Tag": return <Tag hold={hold} text={(p.text as string) ?? ""} pos={(p.pos as "tl" | "tr" | "ml" | "mr") ?? "tr"} fill={Boolean(p.fill)} />;
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
  const enter = interpolate(f, [active.in_f - 2, active.in_f + 2], [0.94, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  let activeIdx = 0;
  active.words.forEach((w, i) => { if (f >= w.at_f) activeIdx = i; });
  const single = active.words.length === 1;
  const SIZE = single ? 108 : 92;
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute", bottom: 500, left: T.marginX, right: T.marginX,
          textAlign: "center", opacity: app, transform: `scale(${enter})`,
          filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.6))",
          fontFamily: "Inter", fontWeight: 900, fontSize: SIZE, letterSpacing: "-0.03em", lineHeight: 0.92,
        }}
      >
        {active.words.map((w, i) => {
          const on = i === activeIdx;
          const yellow = w.key;
          // mot en cours : echelle 1.06 + luminosite. AUCUN fond.
          const pop = on ? interpolate(f - w.at_f, [0, 4], [1.0, 1.06], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
          const bright = on ? 1.18 : 1;
          const common: React.CSSProperties = {
            display: "inline-block", margin: "0 12px", transform: `scale(${pop})`,
            filter: `brightness(${bright})`,
            WebkitTextStroke: "6px #05070A", paintOrder: "stroke fill" as unknown as string,
          };
          if (yellow) {
            // mot-cle jaune : entree lettre par lettre + micro-rotation
            const dl = f - w.at_f;
            return (
              <span key={i} style={{ ...common, color: T.yellow }}>
                {w.w.split("").map((ch, ci) => {
                  const lo = interpolate(dl, [ci, ci + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  const rot = interpolate(dl, [ci, ci + 5], [1.5, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
                  return <span key={ci} style={{ display: "inline-block", opacity: lo, transform: `rotate(${rot}deg)` }}>{ch === " " ? " " : ch}</span>;
                })}
              </span>
            );
          }
          // mot blanc : contour + ombre (dégradé simulé par une teinte froide légère, robuste en headless)
          return (
            <span key={i} style={{ ...common, color: "#F4F7FF" }}>
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- Transitions (aux vraies coupes) : whip / flash / signature ----------
const EFFECTS = new Set(["SIGNATURE", "whip", "whip_l", "flash"]);
const transitionDur = (t: string) => (t === "SIGNATURE" ? 12 : t === "flash" ? 8 : 10);

const OneTransition: React.FC<{ type: string; at: number; idx: number }> = ({ type, at, idx }) => {
  const f = useCurrentFrame();
  const dur = transitionDur(type);
  const t0 = at - Math.floor(dur / 2);
  if (f < t0 || f > t0 + dur) return null;
  const p = interpolate(f, [t0, t0 + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (type === "flash") {
    const op = interpolate(p, [0, 0.28, 1], [0, 0.55, 0]);
    return <AbsoluteFill style={{ background: T.accent, opacity: op, mixBlendMode: "screen" }} />;
  }
  // whip / signature : panneau accent qui balaie, flou de mouvement
  const dir = type === "whip_l" ? -1 : 1;
  const wide = type === "SIGNATURE";
  const x = interpolate(p, [0, 1], [dir * -1300, dir * 1300]);
  const blur = interpolate(p, [0, 0.5, 1], [0, wide ? 26 : 18, 0]);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, width: wide ? 1600 : 1200, left: 0, transform: `translateX(${x}px) skewX(-12deg)`, background: wide ? T.accent : T.accentSoft, filter: `blur(${blur}px)`, boxShadow: T.shadow }} />
      {wide ? <div style={{ position: "absolute", top: 0, bottom: 0, width: 200, left: 0, transform: `translateX(${x - 260}px) skewX(-12deg)`, background: T.white, opacity: 0.5, filter: `blur(${blur}px)` }} /> : null}
    </AbsoluteFill>
  );
};

const TransitionLayer: React.FC = () => (
  <>
    {SEGS.map((s, i) =>
      EFFECTS.has(s.transition_in) ? (
        <OneTransition key={s.id} type={s.transition_in} at={s.out_start} idx={i} />
      ) : null,
    )}
  </>
);

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
      <TransitionLayer />
      <ProgressLine total={TOTAL_FRAMES} />
    </AbsoluteFill>
  );
};
