// ===== Bibliothèque d'incrustations =====
// Chaque composant : ENTRÉE / TENUE / SORTIE. Palette froide. 2 propriétés animées max.
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { T, FONT, title, label, textOutline, ensureFont } from "../theme";
import {
  envelope,
  scaleInOut,
  opacityInOut,
  translateInOut,
  holdDrift,
  holdBreath,
  CASCADE,
} from "../anim";

type Base = { hold?: number }; // frames de tenue

const shadow = { boxShadow: T.shadow } as const;

// Carte de base (rayon 24, ombre, marge latérale respectée).
const Card: React.FC<
  React.PropsWithChildren<{ style?: React.CSSProperties; pad?: number }>
> = ({ children, style, pad = 56 }) => (
  <div
    style={{
      background: T.cardBg,
      borderRadius: T.radius,
      padding: pad,
      border: `1px solid ${T.line}`,
      ...shadow,
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------- FullscreenStamp : « FAUX / 1re erreur » ----------
export const FullscreenStamp: React.FC<Base & { word?: string; sub?: string }> = ({
  hold = 44,
  word = "FAUX",
  sub = "1RE ERREUR",
}) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const sc = scaleInOut(env) * holdBreath(f);
  return (
    <AbsoluteFill
      style={{
        background: `rgba(5,7,16,${0.9 * interpolate(env.e, [0, 1], [0, 1]) * interpolate(env.x, [0, 1], [1, 0])})`,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ opacity: op, transform: `scale(${sc})`, textAlign: "center" }}>
        <div style={{ ...title(300, T.accent), letterSpacing: "-0.03em" }}>{word}</div>
        <div style={{ ...label(46), marginTop: 18, letterSpacing: "0.16em" }}>{sub}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Toggle AMATEUR / PRO ----------
export const Toggle: React.FC<Base & { labels?: [string, string]; active?: number }> = ({
  hold = 48,
  labels = ["AMATEUR", "PRO"],
  active = 1,
}) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const sc = scaleInOut(env);
  // le segment actif s'allume en accent dès l'arrivée (fin d'entrée), puis tient
  const fill = interpolate(env.e, [0.55, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: op, transform: `scale(${sc}) translateY(${holdDrift(f, 6)}px)`, display: "flex", ...shadow, borderRadius: 999, background: T.cardBg, padding: 10, border: `1px solid ${T.line}` }}>
        {labels.map((l, i) => {
          const on = i === active;
          return (
            <div
              key={l}
              style={{
                ...label(48, on ? T.white : T.sub),
                fontWeight: on ? 800 : 500,
                padding: "26px 68px",
                borderRadius: 999,
                background: on ? `rgba(79,107,255,${fill})` : "transparent",
              }}
            >
              {l}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------- LowerThird : slide + flou directionnel qui se résorbe + filet accent ----------
export const LowerThird: React.FC<Base & { titleText: string; accent?: string; y?: number }> = ({
  hold = 48,
  titleText,
  accent,
  y = 1060,
}) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const tx = translateInOut(env, -60);
  const blur = interpolate(env.e, [0, 1], [14, 0]); // flou directionnel se résorbe
  const ruleW = interpolate(env.e, [0.2, 1], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: y, left: T.marginX, right: T.marginX, opacity: op, transform: `translateX(${tx}px)`, filter: `blur(${blur}px)` }}>
        <Card pad={40} style={{ display: "inline-block", background: T.cardBg }}>
          <div style={{ height: 6, width: `${ruleW}%`, background: T.accent, borderRadius: 3, marginBottom: 22 }} />
          <span style={{ ...title(60) }}>{titleText}</span>
          {accent ? <span style={{ ...title(60, T.accent), marginLeft: 18 }}>{accent}</span> : null}
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ---------- StatCard : chiffre 0→valeur + barre de progression ----------
export const StatCard: React.FC<Base & { value?: number; unit?: string; sub?: string }> = ({
  hold = 60,
  value = 50,
  unit = "%",
  sub = "DE TES GAINS",
}) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const sc = scaleInOut(env);
  const count = Math.round(interpolate(f, [8, 8 + 0.6 * fps], [0, value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const barW = interpolate(f, [8, 8 + 0.6 * fps], [0, value], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: op, transform: `scale(${sc}) translateY(${holdDrift(f, 6)}px)`, width: 1080 - T.marginX * 2 }}>
        <Card pad={64}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center" }}>
            <span style={{ ...title(300, T.accent) }}>{count}</span>
            <span style={{ ...title(160, T.accent) }}>{unit}</span>
          </div>
          <div style={{ height: 16, borderRadius: 8, background: "rgba(255,255,255,0.10)", marginTop: 24, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${barW}%`, background: T.accent, borderRadius: 8 }} />
          </div>
          <div style={{ ...label(44), textAlign: "center", marginTop: 30, opacity: interpolate(f, [22, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            {sub}
          </div>
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ---------- ComparisonBar : GARDE TOUT vs LAISSE LA MOITIÉ ----------
export const ComparisonBar: React.FC<Base> = ({ hold = 66 }) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const sc = scaleInOut(env);
  const rows: { l: string; v: number; c: string; delay: number }[] = [
    { l: "GARDE TOUT", v: 100, c: T.accent, delay: 0 },
    { l: "LAISSE LA MOITIÉ", v: 50, c: T.sub, delay: CASCADE + 2 },
  ];
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: op, transform: `scale(${sc})`, width: 1080 - T.marginX * 2 }}>
        <Card pad={56}>
          {rows.map((r) => {
            const w = interpolate(f, [12 + r.delay, 12 + r.delay + 14], [0, r.v], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const n = Math.round(interpolate(f, [12 + r.delay, 12 + r.delay + 16], [0, r.v], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
            return (
              <div key={r.l} style={{ marginBottom: r.v === 100 ? 40 : 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
                  <span style={{ ...label(40, T.white), fontWeight: 700 }}>{r.l}</span>
                  <span style={{ ...title(56, r.c) }}>{n}%</span>
                </div>
                <div style={{ height: 26, borderRadius: 13, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${w}%`, background: r.c, borderRadius: 13 }} />
                </div>
              </div>
            );
          })}
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ---------- MapCard : comparaison pays nommés ----------
type Chip = { v: string; k: string; accent?: boolean };
export const MapCard: React.FC<Base & { chips?: Chip[] }> = ({
  hold = 60,
  chips: chipsProp,
}) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const sc = scaleInOut(env);
  const src = chipsProp ?? [
    { v: "DUBAÏ", k: "0 % D'IMPÔT", accent: true },
    { v: "FRANCE", k: "IMPOSÉ", accent: false },
  ];
  const chips = src.map((c, i) => ({
    k: c.k, v: c.v, c: c.accent ? T.accent : T.sub, delay: i === 0 ? 0 : CASCADE + 2,
  }));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: op, transform: `scale(${sc})`, width: 1080 - T.marginX * 2 }}>
        <div style={{ ...label(40), textAlign: "center", marginBottom: 28 }}>SELON LE PAYS</div>
        <div style={{ display: "flex", gap: 28 }}>
          {chips.map((c) => {
            const cop = interpolate(f, [10 + c.delay, 10 + c.delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const cy = interpolate(f, [10 + c.delay, 10 + c.delay + 12], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div key={c.k} style={{ flex: 1, opacity: cop, transform: `translateY(${cy}px)` }}>
                <Card pad={44} style={{ textAlign: "center", borderColor: c.c === T.accent ? T.accent : T.line }}>
                  <div style={{ ...title(88, c.c) }}>{c.v}</div>
                  <div style={{ ...label(34), marginTop: 16 }}>{c.k}</div>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- HighlightBox : cadre qui se dessine autour d'un mot ----------
export const HighlightBox: React.FC<Base & { text?: string }> = ({ hold = 42, text = "LA DÉCISION" }) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const draw = interpolate(env.e, [0, 1], [0, 1]);
  const W = 620, H = 150, per = (W + H) * 2;
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: op, position: "relative", transform: `translateY(${holdDrift(f, 5)}px)` }}>
        <div style={{ ...title(84, T.white), padding: "20px 40px" }}>{text}</div>
        <svg width={W} height={H} style={{ position: "absolute", left: -20, top: 0, overflow: "visible" }}>
          <rect
            x={4}
            y={4}
            width={W - 8}
            height={H - 8}
            rx={18}
            fill="none"
            stroke={T.accent}
            strokeWidth={6}
            strokeDasharray={per}
            strokeDashoffset={per * (1 - draw)}
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------- FullscreenCard : LE PIÈGE (chapitre / masque) ----------
export const FullscreenCard: React.FC<Base & { text?: string }> = ({ hold = 44, text = "LE PIÈGE" }) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold, 10, 8);
  const op = opacityInOut(env);
  const sc = scaleInOut(env);
  const ruleW = interpolate(env.e, [0.2, 1], [0, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: `rgba(15,21,53,${0.97 * interpolate(env.e, [0, 1], [0, 1]) * interpolate(env.x, [0, 1], [1, 0])})`, alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: op, transform: `scale(${sc})`, textAlign: "center" }}>
        <div style={{ height: 6, width: ruleW, background: T.accent, borderRadius: 3, margin: "0 auto 28px" }} />
        <div style={{ ...title(170) }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- TwinReveal : MÊMES GAINS → FORTUNES ≠ ----------
export const TwinReveal: React.FC<Base & { left?: string; right?: string }> = ({
  hold = 48,
  left = "MÊMES GAINS",
  right = "FORTUNES ≠",
}) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const rOp = interpolate(f, [16, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const rY = interpolate(f, [16, 28], [18, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: op, textAlign: "center", transform: `translateY(${holdDrift(f, 5)}px)` }}>
        <div style={{ ...label(48, T.sub), letterSpacing: "0.12em" }}>{left}</div>
        <div style={{ ...title(110, T.accent), marginTop: 14, opacity: rOp, transform: `translateY(${rY}px)` }}>{right}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- CTACard : COMMENTE « POKER » ----------
export const CTACard: React.FC<Base & { textTop?: string; word?: string }> = ({
  hold = 60,
  textTop = "COMMENTE",
  word = "« POKER »",
}) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const sc = scaleInOut(env);
  const underline = interpolate(env.e, [0.3, 1], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end" }}>
      <div style={{ opacity: op, transform: `scale(${sc})`, marginBottom: 360, width: 1080 - T.marginX * 2 }}>
        <Card pad={56} style={{ textAlign: "center" }}>
          <div style={{ ...label(46), marginBottom: 14 }}>{textTop}</div>
          <div style={{ ...title(120, T.accent) }}>{word}</div>
          <div style={{ height: 8, width: `${underline}%`, background: T.accent, borderRadius: 4, margin: "26px auto 0" }} />
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ---------- ProgressLine : filet 4px en haut, se remplit sur toute la durée ----------
export const ProgressLine: React.FC<{ total: number }> = ({ total }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [0, total], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: "rgba(255,255,255,0.10)" }}>
        <div style={{ height: "100%", width: `${w}%`, background: T.accent }} />
      </div>
    </AbsoluteFill>
  );
};

// ---------- TitleFlash : titre bref centré (pivot) ----------
export const TitleFlash: React.FC<Base & { text?: string }> = ({ hold = 44, text = "LE VRAI SUJET" }) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const sc = scaleInOut(env);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: op, transform: `scale(${sc}) translateY(${holdDrift(f, 5)}px)`, textAlign: "center" }}>
        <div style={{ height: 6, width: 90, background: T.accent, borderRadius: 3, margin: "0 auto 20px" }} />
        <div style={{ ...title(120) }}>{text}</div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Chip : petit encart chiffré animé ----------
export const Chip: React.FC<Base & { big?: string; small?: string }> = ({ hold = 50, big = "", small = "" }) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const ty = translateInOut(env, 30);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div style={{ position: "absolute", top: 980, opacity: op, transform: `translateY(${ty}px)` }}>
        <Card pad={40} style={{ textAlign: "center" }}>
          <div style={{ ...title(96, T.accent) }}>{big}</div>
          {small ? <div style={{ ...label(38), marginTop: 10 }}>{small}</div> : null}
        </Card>
      </div>
    </AbsoluteFill>
  );
};

// ===== Scènes b-roll graphiques (inserts plein cadre, la voix continue) =====
const bgScene = "radial-gradient(120% 90% at 50% 30%, #16204A 0%, #0B1030 60%, #05070A 100%)";

export const ScenePoker: React.FC = () => {
  ensureFont();
  const f = useCurrentFrame();
  const rise = interpolate(f, [0, 16], [40, 0], { extrapolateRight: "clamp" });
  const chips = [0, 1, 2, 3, 4];
  const suits = ["♠", "♣", "♦", "♥"];
  return (
    <AbsoluteFill style={{ background: bgScene, overflow: "hidden" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", transform: `translateY(${rise}px)` }}>
        <div style={{ display: "flex", gap: 34, alignItems: "flex-end" }}>
          {chips.map((c) => {
            const n = Math.round(interpolate(f, [4 + c * 3, 20 + c * 3], [0, 2 + c], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
            return (
              <div key={c} style={{ display: "flex", flexDirection: "column-reverse", gap: -8 }}>
                {Array.from({ length: Math.max(1, n) }).map((_, k) => (
                  <div key={k} style={{ width: 108, height: 108, borderRadius: "50%", background: k % 2 ? T.accent : T.cardBg2, border: `6px dashed ${k % 2 ? T.white : T.accent}`, boxShadow: T.shadow, marginTop: -78 }} />
                ))}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 60, marginTop: 70 }}>
          {suits.map((s, i) => (
            <span key={i} style={{ fontFamily: FONT, fontSize: 120, color: i % 2 ? T.accentSoft : T.white, opacity: interpolate(f, [8 + i * 2, 16 + i * 2], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateY(${interpolate(f, [8 + i * 2, 16 + i * 2], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>{s}</span>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SceneDubai: React.FC = () => {
  ensureFont();
  const f = useCurrentFrame();
  const bars = [200, 340, 260, 520, 300, 620, 380, 280, 240];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(90% 70% at 50% 20%, #1B2E63 0%, #0B1030 55%, #05070A 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 360, left: "50%", width: 220, height: 220, borderRadius: "50%", background: T.accent, filter: "blur(2px)", opacity: 0.85, transform: `translateX(-50%) translateY(${interpolate(f, [0, 20], [80, 0], { extrapolateRight: "clamp" })}px)` }} />
      <div style={{ position: "absolute", bottom: 640, left: 0, right: 0, display: "flex", gap: 14, justifyContent: "center", alignItems: "flex-end" }}>
        {bars.map((h, i) => (
          <div key={i} style={{ width: 78, height: interpolate(f, [2 + i * 2, 16 + i * 2], [0, h], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), background: "linear-gradient(180deg,#2A3E7A,#0E1740)", borderTop: `3px solid ${T.accentSoft}` }} />
        ))}
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 300 }}>
        <div style={{ ...title(180, T.accent), opacity: interpolate(f, [10, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>0 %</div>
        <div style={{ ...label(46), marginTop: 6 }}>D'IMPÔT</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const SceneMoney: React.FC = () => {
  ensureFont();
  const f = useCurrentFrame();
  const cols = [0, 1, 2, 3, 4, 5];
  return (
    <AbsoluteFill style={{ background: bgScene, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, display: "flex", gap: 20, justifyContent: "center", alignItems: "flex-end", paddingBottom: 620 }}>
        {cols.map((c) => {
          const h = interpolate(f, [2 + c * 2, 18 + c * 2], [0, 120 + ((c * 53) % 220)], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={c} style={{ display: "flex", flexDirection: "column-reverse", gap: 6 }}>
              {Array.from({ length: Math.max(1, Math.round(h / 26)) }).map((_, k) => (
                <div key={k} style={{ width: 120, height: 20, borderRadius: 4, background: k % 2 ? T.accent : T.accentSoft, opacity: 0.92 }} />
              ))}
            </div>
          );
        })}
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...title(280, T.white), opacity: interpolate(f, [8, 18], [0, 0.9], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `scale(${interpolate(f, [8, 18], [0.9, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })})` }}>€</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const ScenePassport: React.FC = () => {
  ensureFont();
  const f = useCurrentFrame();
  const stamp = interpolate(f, [10, 16], [1.6, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sop = interpolate(f, [10, 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ry = interpolate(f, [0, 16], [60, 0], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: bgScene, alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ transform: `translateY(${ry}px) rotate(-6deg)`, width: 460, height: 640, borderRadius: 28, background: "linear-gradient(160deg,#1B2E63,#0E1740)", border: `4px solid ${T.accent}`, boxShadow: T.shadow, position: "relative" }}>
        <div style={{ ...label(40, T.accentSoft), position: "absolute", top: 46, left: 0, right: 0, textAlign: "center", letterSpacing: "0.2em" }}>PASSEPORT</div>
        <div style={{ position: "absolute", top: 150, left: "50%", transform: "translateX(-50%)", width: 150, height: 150, borderRadius: "50%", border: `4px solid ${T.line}` }} />
        <div style={{ position: "absolute", bottom: 60, left: 40, right: 40, height: 12, background: T.line, borderRadius: 6 }} />
        <div style={{ position: "absolute", bottom: 110, left: 40, width: 200, height: 12, background: T.line, borderRadius: 6 }} />
        <div style={{ position: "absolute", top: 250, right: 40, transform: `rotate(-16deg) scale(${stamp})`, opacity: sop, border: `6px solid ${T.accent}`, color: T.accent, borderRadius: 12, padding: "8px 18px", fontFamily: FONT, fontWeight: 900, fontSize: 54 }}>EXPAT</div>
      </div>
    </AbsoluteFill>
  );
};

export const SceneMap: React.FC = () => {
  ensureFont();
  const f = useCurrentFrame();
  const pins = [[0.3, 0.4], [0.62, 0.32], [0.5, 0.55], [0.75, 0.6], [0.4, 0.68]];
  const drop = interpolate(f, [8, 18], [-80, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: "radial-gradient(90% 70% at 50% 40%, #16204A 0%, #0B1030 60%, #05070A 100%)", overflow: "hidden" }}>
      {pins.map((p, i) => {
        const o = interpolate(f, [2 + i * 2, 10 + i * 2], [0, 0.5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return <div key={i} style={{ position: "absolute", left: `${p[0] * 100}%`, top: `${p[1] * 100}%`, width: 22, height: 22, borderRadius: "50%", background: T.accentSoft, opacity: o }} />;
      })}
      <div style={{ position: "absolute", left: "50%", top: "38%", transform: `translate(-50%,${drop}px)` }}>
        <div style={{ width: 60, height: 60, borderRadius: "50% 50% 50% 0", background: T.accent, transform: "rotate(-45deg)", boxShadow: T.shadow }} />
      </div>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 340 }}>
        <div style={{ ...title(150, T.white), opacity: interpolate(f, [12, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>OÙ ?</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------- Tag : petite pastille animée (non-dominante, coexiste avec le sous-titre) ----------
type Pos = "tl" | "tr" | "ml" | "mr";
export const Tag: React.FC<Base & { text?: string; pos?: Pos; fill?: boolean }> = ({
  hold = 46,
  text = "",
  pos = "tr",
  fill = false,
}) => {
  ensureFont();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const env = envelope(f, fps, hold);
  const op = opacityInOut(env);
  const sc = scaleInOut(env);
  const rot = interpolate(env.e, [0, 1], [-4, 0]) + (env.x > 0 ? interpolate(env.x, [0, 1], [0, 3]) : 0);
  const coord: Record<Pos, React.CSSProperties> = {
    tl: { top: 300, left: T.marginX },
    tr: { top: 300, right: T.marginX },
    ml: { top: 760, left: T.marginX },
    mr: { top: 760, right: T.marginX },
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", ...coord[pos], opacity: op, transform: `scale(${sc}) rotate(${rot}deg)` }}>
        <div style={{ background: fill ? T.accent : T.cardBg, border: `2px solid ${T.accent}`, borderRadius: 999, padding: "16px 30px", ...shadow }}>
          <span style={{ ...label(40, fill ? T.white : T.accent), fontWeight: 800, letterSpacing: "0.02em" }}>{text}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Sous-titres karaoké (2-3 mots, mot actif en accent) ----------
export type Word = { w: string; accent?: boolean };
export const CaptionChunk: React.FC<{ words: Word[]; activeIndex: number }> = ({ words, activeIndex }) => {
  ensureFont();
  const f = useCurrentFrame();
  // apparition 4 frames, échelle 0.95→1.0, pas de rebond
  const op = interpolate(f, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sc = interpolate(f, [0, 4], [0.95, 1.0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start" }}>
      <div
        style={{
          position: "absolute",
          top: 1180,
          left: T.marginX,
          right: T.marginX,
          textAlign: "center",
          opacity: op,
          transform: `scale(${sc})`,
        }}
      >
        <span style={{ fontFamily: "Inter", fontWeight: 900, fontSize: 88, letterSpacing: "-0.02em", lineHeight: 1.1, textShadow: textOutline(8), wordSpacing: 6 }}>
          {words.map((w, i) => (
            <span key={i} style={{ color: i === activeIndex || w.accent ? T.accent : T.white, marginRight: 18 }}>
              {w.w}
            </span>
          ))}
        </span>
      </div>
    </AbsoluteFill>
  );
};
