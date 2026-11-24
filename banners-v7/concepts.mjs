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

// =====================================================================================
// 1 — THE TAX ADVISORY FIRM : white page, the name at full measure, two hairlines, a serif line
// =====================================================================================
function C1(sig) {
  const ww = SZ.w, wh = ww * RATIO, wy = sig ? 664 : 690, ms = 58;
  return page('#FFFFFF', `
  ${at(SZ.x, wy - ms - 44, markSVG(ms, NAVY, WHITE))}
  ${hr(SZ.x + ms + 28, wy - 44 - ms / 2, SZ.w - ms - 28, NAVY, .35)}
  ${at(SZ.x, wy, word(ww, NAVY))}
  ${sig ? hr(SZ.x, wy + wh + 40, SZ.w, NAVY, .35) + txt(SZ.x, wy + wh + 62, 'Conseil fiscal et structuration internationale.', `font:400 40px SrcSerif;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// 2 — THE CORPORATE ARCHITECTURE : a proportioned frame divided into blocks — the organisation of a group
// =====================================================================================
function C2(sig) {
  const BG = '#ECECEF', L = NAVY;
  // frame on the right half of the safe area; 1 : 1.618 subdivisions
  const fx = 1350, fy = SZ.y + 34, fw = SZ.r - fx, fh = 355;
  const c1 = fx + fw * .382, r1 = fy + fh * .5, c2 = c1 + (fx + fw - c1) * .5;
  const lines = `
    <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" fill="none" stroke="${L}" stroke-width="2"/>
    <line x1="${c1}" x2="${c1}" y1="${fy}" y2="${fy + fh}" stroke="${L}" stroke-width="1.2"/>
    <line x1="${c1}" x2="${fx + fw}" y1="${r1}" y2="${r1}" stroke="${L}" stroke-width="1.2"/>
    <line x1="${c2}" x2="${c2}" y1="${r1}" y2="${fy + fh}" stroke="${L}" stroke-width="1.2"/>
    <rect x="${fx + 28}" y="${fy + 28}" width="${c1 - fx - 56}" height="${fh - 56}" fill="${L}"/>
    ${[[c1, fy, fx + fw, r1], [c1, r1, c2, fy + fh], [c2, r1, fx + fw, fy + fh]].map(([a, b, c, d]) => `<rect x="${a + 20}" y="${b + 20}" width="${c - a - 40}" height="${d - b - 40}" fill="none" stroke="${L}" stroke-opacity=".35" stroke-width="1"/>`).join('')}`;
  const lab = (x, y, t, c = L) => `<text x="${x}" y="${y}" font-family="Inter" font-weight="600" font-size="18" letter-spacing="2.5" fill="${c}">${t}</text>`;
  const labels = lab(fx + 52, fy + fh - 52, 'HOLDING', '#fff') + lab(c1 + 44, r1 - 44, 'SOCIÉTÉS D’EXPLOITATION') + lab(c1 + 40, fy + fh - 44, 'BANQUES') + lab(c2 + 36, fy + fh - 44, 'COMPTABILITÉ');
  const ms = 96, ww = 620, wh = ww * RATIO, my = sig ? 560 : 600, wy = my + ms + 36;
  return page(BG, `
  ${svg(lines + labels)}
  ${at(SZ.x, my, markSVG(ms, NAVY, WHITE))}
  ${at(SZ.x, wy, word(ww, NAVY))}
  ${sig ? txt(SZ.x, wy + wh + 32, '<div>Construire une structure solide.</div><div>Développer à l’international.</div>', `font:400 34px/44px SrcSerif;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// 3 — THE INSTITUTIONAL STANDARD : the cover of an annual report — strict grid, vast white
// =====================================================================================
function C3(sig) {
  const BG = '#F4F3EF', cols = 12, cw = SZ.w / cols;
  const ww = 8 * cw - 40, wh = ww * RATIO;
  const top = SZ.y + 40, base = SZ.b - 56;
  let colRules = '';
  for (let i = 0; i <= cols; i++) colRules += vr(SZ.x + i * cw, SZ.y, SZ.b - SZ.y, NAVY, i % 4 === 0 ? .14 : .05);
  return page(BG, `
  ${colRules}
  ${hr(SZ.x, top, SZ.w, NAVY, 1, 2)}
  ${at(SZ.x, top + 28, markSVG(64, NAVY, BG))}
  ${at(SZ.x, base - wh, word(ww, NAVY))}
  ${hr(SZ.x, base + 24, SZ.w, NAVY, .35)}
  ${sig ? txt(SZ.x + 8 * cw + 16, top + 28, '<div>La maîtrise de votre</div><div>environnement fiscal</div><div>et financier.</div>', `font:italic 400 40px/50px SrcSerifI;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// 4 — THE FINANCIAL FRAMEWORK : the ruling of a ledger — columns, double rules, tabular order
// =====================================================================================
function C4(sig) {
  const BG = '#FBFBFA', INKL = '#1F3A5F';
  const rowH = 48, y0 = SZ.y + 24;
  let rows = '';
  for (let y = y0; y < H; y += rowH) rows += hr(0, y, W, INKL, .1);
  for (let y = y0 - rowH; y > 0; y -= rowH) rows += hr(0, y, W, INKL, .1);
  // column rules: left margin double rule, then three accounting columns
  const colX = [SZ.x + 700, SZ.x + 960, SZ.x + 1220];
  let cols = vr(SZ.x - 30, 0, H, '#7A2E2E', .5) + vr(SZ.x - 24, 0, H, '#7A2E2E', .5);
  colX.forEach(x => { cols += vr(x, 0, H, INKL, .35); cols += vr(x + 5, 0, H, INKL, .35); });
  const heads = sig ? '' : ['Fiscalité', 'Comptabilité', 'Structuration'].map((t, i) => txt(colX[i] + 24, y0 + 9, t.toUpperCase(), `font:600 18px Inter;letter-spacing:.2em;color:${INKL}`)).join('');
  const ms = 96, ww = 600, wh = ww * RATIO;
  const my = y0 + rowH * 1 + (rowH * 2 - ms) / 2 + 6, wy = y0 + rowH * 4 + (rowH - wh) / 2 + 6;
  const sigRow = sig ? ['Fiscalité.', 'Comptabilité.', 'Structuration.'].map((t, i) => txt(colX[i] + 24, y0 + rowH * 6 + 6, t, `font:400 32px SrcSerif;color:${NAVY}`)).join('') : '';
  return page(BG, `
  ${rows}${cols}${heads}
  ${at(SZ.x, my, markSVG(ms, NAVY, WHITE))}
  ${at(SZ.x, wy, word(ww, NAVY))}
  ${sigRow}`);
}

// =====================================================================================
// 5 — THE LEGAL & TAX FOUNDATION : the base courses of a wall — courses of dressed stone, flat
// =====================================================================================
function C5(sig) {
  const BG = '#16141C', S1 = '#2A2733', S2 = '#33303D', S3 = '#3D3A48';
  const base = SZ.b + 2, ch = 46;
  let courses = '';
  const rows = [[0, 300, S1], [1, 360, S2], [2, 260, S3]];
  rows.forEach(([r, bl, c]) => {
    const y = base - (r + 1) * ch, off = r % 2 ? bl / 2 : 0;
    for (let x = -off; x < W; x += bl) courses += `<rect x="${x + 3}" y="${y + 3}" width="${bl - 6}" height="${ch - 6}" fill="${c}"/>`;
  });
  // the course below the safe area continues on TV
  for (let r = 0; r < 12; r++) { const y = base + r * ch, bl = r % 2 ? 340 : 280, off = r % 2 ? 170 : 0; for (let x = -off; x < W; x += bl) courses += `<rect x="${x + 3}" y="${y + 3}" width="${bl - 6}" height="${ch - 6}" fill="${r % 2 ? '#211F29' : '#1D1B24'}"/>`; }
  const ms = 92, ww = 760, wh = ww * RATIO;
  const top = base - 3 * ch;
  const ly = sig ? 556 : 580;
  return page(BG, `
  ${svg(courses)}
  ${hr(0, top - 1, W, '#C9C3B0', .6)}
  ${row(ly, `<div style="display:flex;align-items:center;gap:40px">${markSVG(ms, WHITE, BG)}${word(ww)}</div>`)}
  ${sig ? row(ly + ms + 34, 'Les fondations de votre entreprise internationale.', 'font:400 36px SrcSerif;color:#E9E5D8') : ''}`);
}

// =====================================================================================
// 6 — THE GLOBAL ADVISORY : monumental and silent — navy, the mark, the name, nothing else
// =====================================================================================
function C6(sig) {
  const ms = 132, ww = SZ.w - 120, wh = ww * RATIO;
  const my = sig ? 532 : 560, wy = my + ms + 44;
  return page(NAVY, `
  ${row(my, markSVG(ms, WHITE, NAVY))}
  ${row(wy, word(ww))}
  ${sig ? row(wy + wh + 40, 'VOTRE PARTENAIRE EN STRUCTURATION INTERNATIONALE', 'font:500 26px Mont;letter-spacing:.42em;color:rgba(255,255,255,.86);padding-left:.42em') : ''}`);
}

export const CONCEPTS = [
  ['1-cabinet-conseil-fiscal', C1], ['2-architecture-corporate', C2], ['3-standard-institutionnel', C3],
  ['4-cadre-financier', C4], ['5-fondations-juridiques-fiscales', C5], ['6-conseil-international', C6]];
