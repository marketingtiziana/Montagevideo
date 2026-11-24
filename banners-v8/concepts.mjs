// FYNOVATES — YouTube banners, round 8: six wordmark-only directions (no icon) (2560x1440)
import fs from 'fs';
import path from 'path';

export const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FONTS = path.join(ROOT, '..', 'banners', 'fonts');
export const W = 2560, H = 1440;
const SZ = { x: 547, y: 508, w: 1466, r: 2013, b: 931 };   // safe area, 40 px inner side margin
export const NAVY = '#0D082E', INK = '#0F0A13', WHITE = '#FFFFFF';
const WORD = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'brand/wordmark-3x.png')).toString('base64');
const RATIO = 76 / 1110;
const ff = (f) => 'file://' + path.join(FONTS, f);

export const markSVG = (s, sq, fg) => `<svg width="${s}" height="${s}" viewBox="0 0 216 216" style="display:block">
  <rect width="216" height="216" fill="${sq}"/><rect x="40" y="32" width="31" height="154" fill="${fg}"/>
  <rect x="40" y="32" width="136" height="27" fill="${fg}"/><rect x="40" y="100" width="120" height="25" fill="${fg}"/>
  <rect x="145" y="155" width="31" height="31" fill="${fg}"/></svg>`;
const word = (w, color = WHITE) => `<div style="width:${w}px;height:${(w * RATIO).toFixed(2)}px;background:${color};
  -webkit-mask:url(${WORD}) no-repeat 0 0/100% 100%;mask:url(${WORD}) no-repeat 0 0/100% 100%"></div>`;
export const css = `
@font-face{font-family:Mont;src:url(${ff('Montserrat.ttf')})}
@font-face{font-family:Inter;src:url(${ff('Inter.ttf')})}
@font-face{font-family:Play;src:url(${ff('Playfair.ttf')})}
@font-face{font-family:PlayI;src:url(${ff('PlayfairItalic.ttf')})}
@font-face{font-family:SrcSerif;src:url(${ff("SourceSerif.ttf")})}
@font-face{font-family:SrcSerifI;src:url(${ff("SourceSerifItalic.ttf")})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{position:relative;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.a{position:absolute}`;
const page = (bg, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="background:${bg}">${body}</body></html>`;
const at = (x, y, html, extra = '') => `<div class="a" style="left:${x}px;top:${y}px;${extra}">${html}</div>`;
const row = (y, html, extra = '') => `<div class="a" style="left:0;right:0;top:${y}px;display:flex;justify-content:center;${extra}">${html}</div>`;
const svg = (inner, extra = '') => `<svg class="a" style="left:0;top:0;${extra}" width="${W}" height="${H}">${inner}</svg>`;
const hr = (x, y, w, c, o = 1, t = 1) => `<div class="a" style="left:${x}px;top:${y}px;width:${w}px;height:${t}px;background:${c};opacity:${o}"></div>`;
const vr = (x, y, h, c, o = 1, t = 1) => `<div class="a" style="left:${x}px;top:${y}px;width:${t}px;height:${h}px;background:${c};opacity:${o}"></div>`;
const txt = (x, y, s, style, anchor = 'left') => `<div class="a" style="left:${x}px;top:${y}px;white-space:nowrap;${anchor === 'center' ? 'transform:translateX(-50%);' : anchor === 'right' ? 'transform:translateX(-100%);' : ''}${style}">${s}</div>`;

// channel avatar for the mockups: the name only, no icon
export const avatar = (s) => `<div style="width:${s}px;height:${s}px;border-radius:50%;background:${NAVY};display:flex;align-items:center;justify-content:center">${word(s * .74)}</div>`;
const caps = (px, c, ls = .4) => `font:500 ${px}px Mont;letter-spacing:${ls}em;color:${c};padding-left:${ls}em`;

// 1 — PURE WORDMARK : the name at the full measure of the safe area, nothing else
function C1(sig) {
  const ww = SZ.w, wh = ww * RATIO;
  const wy = sig ? 690 - wh / 2 : 720 - wh / 2;
  return page(NAVY, `
  ${row(wy, word(ww))}
  ${sig ? row(wy + wh + 54, 'CONSEIL FISCAL &amp; STRUCTURATION INTERNATIONALE', caps(28, 'rgba(255,255,255,.86)', .42)) : ''}`);
}

// 2 — EDITORIAL AUTHORITY : annual-report cover, 12-column grid, name on the baseline
function C2(sig) {
  const BG = '#F4F3EF', cw = SZ.w / 12, top = SZ.y + 40, base = SZ.b - 60;
  const ww = sig ? 8 * cw - 40 : SZ.w, wh = ww * RATIO;
  return page(BG, `
  ${hr(SZ.x, top - 7, SZ.w, NAVY, 1, 3)}${hr(SZ.x, top, SZ.w, NAVY, 1, 1)}
  ${at(SZ.x, base - wh, word(ww, NAVY))}
  ${hr(SZ.x, base + 26, SZ.w, NAVY, .4)}
  ${sig ? vr(SZ.x + 8 * cw, top + 80, base - top - 80, NAVY, .25) + txt(SZ.x + 8 * cw + 36, base - 150, '<div>Fiscalité.</div><div>Comptabilité.</div><div>Conseil international.</div>', `font:italic 400 40px/50px SrcSerifI;color:${NAVY}`) : ''}`);
}

// 3 — ARCHITECTURAL PRECISION : two flat planes in golden proportion; the name on one, the method on the other
function C3(sig) {
  const STONE = '#E4E2DD', split = Math.round(W * .618);
  const ww = 900, wh = ww * RATIO, wx = split - 110 - ww, wy = 720 - wh / 2;
  return page(NAVY, `
  <div class="a" style="left:${split}px;top:0;width:${W - split}px;height:${H}px;background:${STONE}"></div>
  ${hr(0, SZ.y + 40, split, '#FFFFFF', .18)}${hr(0, SZ.b - 40, split, '#FFFFFF', .18)}
  ${hr(split, SZ.y + 40, W - split, NAVY, .18)}${hr(split, SZ.b - 40, W - split, NAVY, .18)}
  ${at(wx, wy, word(ww))}
  ${sig ? txt(split + 90, 720 - 81, '<div>Structurer.</div><div>Sécuriser.</div><div>Développer.</div>', `font:500 42px/54px Inter;letter-spacing:-.005em;color:${NAVY}`) : ''}`);
}

// 4 — THE PROFESSIONAL STANDARD : the letterhead of a law and tax firm — charcoal, stone, double rules
function C4(sig) {
  const BG = '#1B1A20', STONE = '#E6E0D1', ww = 1180, wh = ww * RATIO;
  const wy = sig ? 676 - wh / 2 : 720 - wh / 2;
  const rules = (y) => hr(SZ.x + 80, y, SZ.w - 160, STONE, .7) + hr(SZ.x + 80, y + 6, SZ.w - 160, STONE, .35);
  return page(BG, `
  ${rules(SZ.y + 50)}${rules(SZ.b - 56)}
  ${row(wy, word(ww, STONE))}
  ${sig ? row(wy + wh + 46, 'L’expertise au service de votre entreprise.', `font:400 40px SrcSerif;color:${STONE}`) : ''}`);
}

// 5 — STRUCTURED INTELLIGENCE : squared ruling — the name sized and placed exactly on the module
function C5(sig) {
  const BG = '#FFFFFF', m = 26.4;                       // module: the name is 50 modules wide
  const gx0 = SZ.x + 40, ww = 50 * m, wh = ww * RATIO;
  let g = '';
  for (let x = gx0 % m; x < W; x += m) g += `<line x1="${x.toFixed(1)}" x2="${x.toFixed(1)}" y1="0" y2="${H}" stroke="#1F3A5F" stroke-opacity="${Math.round((x - gx0) / m) % 5 === 0 ? .12 : .05}"/>`;
  const gy0 = 720 - Math.round(wh / m / 2) * m;
  for (let y = gy0 % m; y < H; y += m) g += `<line y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" x1="0" x2="${W}" stroke="#1F3A5F" stroke-opacity="${Math.round((y - gy0) / m) % 5 === 0 ? .12 : .05}"/>`;
  const wy = sig ? gy0 - 2 * m : gy0;
  return page(BG, `
  ${svg(g)}
  ${at(gx0, wy, word(ww, NAVY))}
  ${hr(gx0, wy + wh + 2 * m, ww, NAVY, .8, 2)}
  ${sig ? txt(gx0, wy + wh + 3 * m - 2, 'Votre environnement fiscal, maîtrisé.', `font:500 ${Math.round(1.3 * m)}px/${2 * m}px Inter;color:${NAVY}`) : ''}`);
}

// 6 — INSTITUTIONAL MINIMALISM : a quiet page — the name, a short rule, a discreet line
function C6(sig) {
  const BG = '#F7F7F5', ww = 860, wh = ww * RATIO;
  const wy = sig ? 690 - wh / 2 : 720 - wh / 2;
  return page(BG, `
  ${row(wy, word(ww, NAVY))}
  ${sig ? row(wy + wh + 44, `<div style="width:64px;height:1px;background:${NAVY};opacity:.5"></div>`) + row(wy + wh + 72, 'Une vision globale. Une structure maîtrisée.', 'font:400 28px Inter;color:#55536B;letter-spacing:.01em') : ''}`);
}

export const CONCEPTS = [
  ['1-pure-wordmark', C1], ['2-autorite-editoriale', C2], ['3-precision-architecturale', C3],
  ['4-standard-professionnel', C4], ['5-intelligence-structuree', C5], ['6-minimalisme-institutionnel', C6]];
