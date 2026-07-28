// ===== Système de design — froid / premium =====
// Interdits stricts : or, couleurs chaudes, serif, dégradé multicolore, emoji, tiret cadratin.
import { staticFile, delayRender, continueRender } from "remotion";

export const T = {
  cardBg: "#0F1535",
  cardBg2: "#151C42", // variante légèrement plus claire pour étagement
  accent: "#4F6BFF",
  accentSoft: "#8FA0FF",
  yellow: "#FFD84D", // accent chaud — mots-clés sous-titres uniquement
  white: "#FFFFFF",
  whiteGrad: "linear-gradient(180deg,#FFFFFF 0%,#E4E9F5 100%)",
  sub: "#A8B0C8",
  ink: "#05070A",
  line: "rgba(168,176,200,0.22)",
  radius: 24,
  shadow: "0 24px 60px rgba(0,0,0,0.45)",
  marginX: 88, // marge latérale, aucun élément hors marge
  colW: (1080 - 88 * 2) / 12, // grille 12 colonnes
} as const;

export const FONT = "Inter";

// Titres : Black 900, tracking -0.02em. Labels : Medium 500, tracking 0.04em, majuscules.
export const title = (size: number, color: string = T.white) =>
  ({
    fontFamily: FONT,
    fontWeight: 900,
    letterSpacing: "-0.02em",
    fontSize: size,
    color,
    lineHeight: 1.02,
    margin: 0,
  }) as const;

export const label = (size: number, color: string = T.sub) =>
  ({
    fontFamily: FONT,
    fontWeight: 500,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    fontSize: size,
    color,
    margin: 0,
  }) as const;

// Sous-titres : Black 900, contour 8px + ombre, lisibles sans le son.
export const CAPTION = {
  weight: 900,
  sizePx: 88,
  tracking: "-0.02em",
  strokePx: 8,
  maxWords: 3,
  safeBottomY: 1640, // rien en dessous
  blockCenterY: 1300,
} as const;

// Contour propre via multi-ombres (plus net que -webkit-text-stroke au rendu).
export const textOutline = (px: number, color: string = T.ink) => {
  const o: string[] = [];
  const steps = 8; // 8 directions : contour net, coût de rendu réduit
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    o.push(`${Math.cos(a) * px}px ${Math.sin(a) * px}px 0 ${color}`);
  }
  o.push(`0 6px 18px rgba(0,0,0,0.55)`);
  return o.join(", ");
};

// ---- Chargement de la police (variable, graisses 100→900) ----
let loaded = false;
export function ensureFont() {
  if (loaded || typeof document === "undefined") return;
  loaded = true;
  const handle = delayRender("inter-font");
  const face = new FontFace(
    FONT,
    `url(${staticFile("assets/fonts/Inter.ttf")}) format("truetype")`,
    { weight: "100 900", style: "normal", display: "swap" },
  );
  face
    .load()
    .then((f) => {
      (document.fonts as unknown as { add: (f: FontFace) => void }).add(f);
      continueRender(handle);
    })
    .catch(() => continueRender(handle));
}
