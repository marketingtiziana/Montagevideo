/**
 * Brand tokens — the single source of truth. QA lints THIS file for
 * off-palette colours. Do not hardcode hex anywhere else in the components.
 *
 * Strict prohibitions (section 10.1): no serif fonts, no gold, no warm colour
 * outside `accent`, no em dash in displayed text, no garish gradient, no soft
 * diffuse drop shadow (only the crisp shadows defined here).
 */
export const theme = {
  colors: {
    navy: '#0F1535', // background, blocks
    indigo: '#4F6BFF', // primary accent
    white: '#FFFFFF',
    accent: '#FFD84D', // subtitle keyword ONLY
    ink: '#0A0E24', // outline / crisp shadow
  },
  font: 'Inter', // Inter only, weights 400 / 700 / 900
  weights: { regular: 400, bold: 700, black: 900 },
  radius: 20,
  safe: { top: 180, bottom: 340, side: 90 }, // TikTok/IG UI zones
  caption: {
    size: 84,
    letterSpacing: '-0.02em',
    baselineFromBottom: 640,
    outlinePx: 6,
    shadowOffset: { x: 0, y: 4 }, // crisp, no blur
  },
} as const;

export type Theme = typeof theme;

/** Crisp caption text shadow: 6px ink outline + hard offset shadow, no blur. */
export function captionTextShadow(): string {
  const { ink } = theme.colors;
  const o = theme.caption.outlinePx;
  const { x, y } = theme.caption.shadowOffset;
  // 8-direction outline (crisp) + one hard offset shadow.
  const dirs = [
    [-o, -o], [0, -o], [o, -o],
    [-o, 0], [o, 0],
    [-o, o], [0, o], [o, o],
  ];
  const outline = dirs.map(([dx, dy]) => `${dx}px ${dy}px 0 ${ink}`).join(', ');
  return `${outline}, ${x}px ${y}px 0 ${ink}`;
}
