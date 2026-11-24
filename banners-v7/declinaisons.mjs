// FYNOVATES — YouTube banners, round 7: six professional-firm directions (2560x1440)
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

// Déclinaisons du concept 6 — The Global Advisory
const SIG = 'Votre partenaire en structuration internationale.';
const SIGC = 'VOTRE PARTENAIRE EN STRUCTURATION INTERNATIONALE';
const capsStyle = (c) => `font:500 26px Mont;letter-spacing:.42em;color:${c};padding-left:.42em`;

// centred stack in any colourway
function stack(bg, fg, markSq, markF, sigColor, serif = false) {
  return (sig) => {
    const ms = 132, ww = SZ.w - 120, wh = ww * RATIO;
    const my = sig ? 532 : 560, wy = my + ms + 44;
    return page(bg, `
    ${row(my, markSVG(ms, markSq, markF))}
    ${row(wy, word(ww, fg))}
    ${sig ? row(wy + wh + 40, serif ? SIG : SIGC, serif ? `font:400 40px SrcSerif;color:${sigColor}` : capsStyle(sigColor)) : ''}`);
  };
}
// horizontal lockup, signature centred under a hairline
function horizontal(sig) {
  const ms = 150, gap = 56, ww = SZ.w - 160 - ms - gap, wh = ww * RATIO;
  const lw = ms + gap + ww, lx = (W - lw) / 2;
  const ly = sig ? 560 : 645;
  return page(NAVY, `
  ${at(lx, ly, `<div style="display:flex;align-items:center;gap:${gap}px">${markSVG(ms, WHITE, NAVY)}${word(ww)}</div>`)}
  ${sig ? hr(lx, ly + ms + 44, lw, '#FFFFFF', .3) + row(ly + ms + 72, SIGC, capsStyle('rgba(255,255,255,.86)')) : ''}`);
}
// left aligned, signature set right on the same baseline
function aligned(sig) {
  const ms = 120, ww = 1180, wh = ww * RATIO;
  const my = sig ? 560 : 590, wy = my + ms + 44;
  return page(INK, `
  ${at(SZ.x, my, markSVG(ms, WHITE, INK))}
  ${at(SZ.x, wy, word(ww))}
  ${sig ? hr(SZ.x, wy + wh + 40, SZ.w, '#FFFFFF', .28) + txt(SZ.x, wy + wh + 62, SIG, 'font:400 36px SrcSerif;color:rgba(255,255,255,.88)') : ''}`);
}

export const CONCEPTS = [
  ['6a-navy-centre', stack(NAVY, WHITE, WHITE, NAVY, 'rgba(255,255,255,.86)')],
  ['6b-noir-encre', stack(INK, WHITE, WHITE, INK, 'rgba(255,255,255,.82)')],
  ['6c-blanc', stack('#FFFFFF', NAVY, NAVY, WHITE, NAVY)],
  ['6d-pierre-serif', stack('#E9E7E2', NAVY, NAVY, '#E9E7E2', NAVY, true)],
  ['6e-navy-horizontal', horizontal],
  ['6f-encre-aligne-gauche', aligned]];
