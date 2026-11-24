// FYNOVATES — YouTube banners, round 5: six structural concepts (2560x1440)
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
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{position:relative;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.a{position:absolute}`;
const page = (bg, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="background:${bg}">${body}</body></html>`;
const at = (x, y, html, extra = '') => `<div class="a" style="left:${x}px;top:${y}px;${extra}">${html}</div>`;
const row = (y, html, extra = '') => `<div class="a" style="left:0;right:0;top:${y}px;display:flex;justify-content:center;${extra}">${html}</div>`;
const svg = (inner, extra = '') => `<svg class="a" style="left:0;top:0;${extra}" width="${W}" height="${H}">${inner}</svg>`;

// =====================================================================================
// 1 — THE CORPORATE ECOSYSTEM : concentric squares — the holding at the centre of its entities
// =====================================================================================
function C1(sig) {
  const ms = 150, cx = SZ.x + ms / 2, cy = 720;
  let rings = '';
  for (let i = 1; i <= 16; i++) {
    const s = ms + i * 92, o = Math.max(.05, .3 - i * .016);
    rings += `<rect x="${cx - s / 2}" y="${cy - s / 2}" width="${s}" height="${s}" fill="none" stroke="#fff" stroke-opacity="${o.toFixed(3)}" stroke-width="${i < 4 ? 1.6 : 1.2}"/>`;
  }
  // entities placed on the rings (subsidiaries, bank, accounting, residence...)
  const ents = [[2, .62, 0], [3, .15, 1], [4, .86, 2], [5, .4, 3], [7, .7, 0], [8, .25, 1], [10, .55, 2], [12, .9, 3], [13, .35, 0], [15, .6, 1]];
  for (const [i, t, side] of ents) {
    const s = ms + i * 92, h = s / 2; let x, y;
    if (side === 0) { x = cx - h + t * s; y = cy - h; } else if (side === 1) { x = cx + h; y = cy - h + t * s; }
    else if (side === 2) { x = cx + h - t * s; y = cy + h; } else { x = cx - h; y = cy + h - t * s; }
    const r = i < 6 ? 9 : 7;
    rings += `<rect x="${x - r}" y="${y - r}" width="${2 * r}" height="${2 * r}" fill="#fff" fill-opacity="${i < 9 ? .9 : .5}"/>`;
  }
  const ww = 900, wh = ww * RATIO, tx = SZ.x + ms + 86;
  const wy = sig ? cy - wh - 22 : cy - wh / 2;
  return page(NAVY, `
  <div class="a" style="inset:0;background:radial-gradient(circle at ${cx}px ${cy}px,#1d1650 0%,${NAVY} 45%,#08051e 100%)"></div>
  ${svg(rings)}
  <div class="a" style="left:${tx - 40}px;top:${cy - 120}px;width:${ww + 120}px;height:240px;background:radial-gradient(ellipse 50% 50% at 50% 50%,rgba(13,8,46,.92),rgba(13,8,46,0))"></div>
  ${at(cx - ms / 2, cy - ms / 2, markSVG(ms, WHITE, NAVY))}
  ${at(tx, wy, word(ww))}
  ${sig ? at(tx, cy + 22, 'Chaque entité à sa place.', 'font:italic 400 44px PlayI;color:rgba(255,255,255,.9)') : ''}`);
}

// =====================================================================================
// 2 — THE GLOBAL FRAMEWORK : a monumental portal — the legal frame in which the business stands
// =====================================================================================
function C2(sig) {
  const cx = 1280, cy = 720, O = 1560, I = 1060, k = .74;          // outer front, inner front, depth scale
  const oi = I / 2, bi = I * k / 2;
  const q = (pts, fill) => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}"/>`;
  const P = (x, y) => [cx + x, cy + y];
  const faces =
    q([P(-oi, -oi), P(oi, -oi), P(bi, -bi), P(-bi, -bi)], 'url(#gTop)') +
    q([P(-oi, oi), P(oi, oi), P(bi, bi), P(-bi, bi)], 'url(#gBot)') +
    q([P(-oi, -oi), P(-bi, -bi), P(-bi, bi), P(-oi, oi)], 'url(#gL)') +
    q([P(oi, -oi), P(bi, -bi), P(bi, bi), P(oi, oi)], 'url(#gR)');
  const front = `<path fill-rule="evenodd" fill="${NAVY}" d="M0,0h${W}v${H}h${-W}z M${cx - oi},${cy - oi}v${I}h${I}v${-I}z"/>`;
  const ms = 108, ww = 640, wh = ww * RATIO;
  const my = sig ? 560 : 596, wy = my + ms + 38;
  return page('#E7E8EC', `
  ${svg(`<defs>
      <linearGradient id="gTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c1650"/><stop offset="1" stop-color="#3a3478"/></linearGradient>
      <linearGradient id="gBot" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#8f8cb0"/><stop offset="1" stop-color="#c9c8d8"/></linearGradient>
      <linearGradient id="gL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5b5690"/><stop offset="1" stop-color="#a9a7c4"/></linearGradient>
      <linearGradient id="gR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#2a245f"/><stop offset="1" stop-color="#6b6799"/></linearGradient>
      <radialGradient id="back"><stop offset="0" stop-color="#F6F6F9"/><stop offset="1" stop-color="#DADBE3"/></radialGradient></defs>
    <rect x="${cx - bi}" y="${cy - bi}" width="${2 * bi}" height="${2 * bi}" fill="url(#back)"/>
    ${faces}${front}`)}
  ${row(my, markSVG(ms, NAVY, WHITE))}
  ${row(wy, word(ww, NAVY))}
  ${sig ? row(wy + wh + 34, 'Un cadre solide pour grandir partout.', `font:500 30px Inter;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// 3 — THE INTERNATIONAL GRID : the module the monogram is built on becomes the grid of everything
// =====================================================================================
function C3(sig) {
  const BG = '#F7F7F9', k = 1.5, ms = 216 * k, mx = SZ.x, my = 556;
  const band = (y0, h, o) => `<rect x="0" y="${my + y0 * k}" width="${W}" height="${h * k}" fill="${NAVY}" fill-opacity="${o}"/>`;
  const col = (x0, w, o) => `<rect x="${mx + x0 * k}" y="0" width="${w * k}" height="${H}" fill="${NAVY}" fill-opacity="${o}"/>`;
  const mod = 31 * k;                                   // the stem / dot module
  let grid = '';
  for (let x = (mx + 40 * k) % mod; x < W; x += mod) grid += `<line x1="${x}" x2="${x}" y1="0" y2="${H}" stroke="${NAVY}" stroke-opacity=".05"/>`;
  for (let y = (my + 32 * k) % mod; y < H; y += mod) grid += `<line y1="${y}" y2="${y}" x1="0" x2="${W}" stroke="${NAVY}" stroke-opacity=".05"/>`;
  // the four rows of the F extended across the banner
  const rows = band(32, 27, .07) + band(100, 25, .07) + band(155, 31, .05) + col(40, 31, .05) + col(145, 31, .035);
  // a few modules set solid along the dot row: the same unit, repeated elsewhere
  let mods = '';
  [9, 13, 17, 22, 26, 30].forEach((n, i) => { const x = mx + 145 * k + n * mod; if (x < W) mods += `<rect x="${x}" y="${my + 155 * k}" width="${mod}" height="${mod}" fill="${NAVY}" fill-opacity="${i < 2 ? .9 : i < 4 ? .45 : .2}"/>`; });
  const tx = mx + ms + 2 * mod;
  const ww = 27 * k / RATIO;                             // wordmark cap height = height of the top bar
  return page(BG, `
  ${svg(grid + rows + mods)}
  ${at(mx, my, markSVG(ms, NAVY, BG))}
  ${at(tx, my + 32 * k, word(ww, NAVY))}
  ${sig ? at(tx, my + 100 * k - 3, 'La rigueur, à toutes les échelles.', `font:500 ${25 * k}px/${25 * k + 6}px Inter;letter-spacing:-.005em;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// 4 — THE BUSINESS BLUEPRINT : the international company drawn as an architect's floor plan
// =====================================================================================
function C4(sig) {
  const BP = '#0F2554', L = 'stroke="#fff" fill="none"';
  const x0 = 1230, y0 = 556, w = 1180, h = 330;
  const wall = (d, wd = 4) => `<path d="${d}" ${L} stroke-width="${wd}" stroke-linecap="square"/>`;
  const label = (x, y, t) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="Inter" font-weight="500" font-size="24" letter-spacing="3" fill="#fff" fill-opacity=".9">${t}</text>`;
  const door = (x, y, r, a) => `<path d="M${x},${y} l${r * Math.cos(a)},${r * Math.sin(a)} M${x + r},${y} A${r},${r} 0 0 0 ${x + r * Math.cos(a)},${y + r * Math.sin(a)}" ${L} stroke-width="1.2" stroke-opacity=".7"/>`;
  const c1 = x0 + 400, c2 = x0 + 760, mid = y0 + 170;
  const plan =
    wall(`M${x0},${y0}H${x0 + w}V${y0 + h}H${x0}Z`, 6) +
    wall(`M${c1},${y0}V${y0 + 120}M${c1},${y0 + 190}V${y0 + h}`) +
    wall(`M${c2},${y0}V${mid - 40}M${c2},${mid + 30}V${y0 + h}`) +
    wall(`M${x0},${mid}H${x0 + 150}M${x0 + 230},${mid}H${c1}`) +
    wall(`M${c2},${mid}H${x0 + 940}M${x0 + 1020},${mid}H${x0 + w}`) +
    door(c1, y0 + 120, 70, Math.PI / 2) + door(x0 + 150, mid, 80, -Math.PI / 2) + door(x0 + 940, mid, 80, Math.PI / 2) +
    `<rect x="${c1 + 20}" y="${y0 + 20}" width="${c2 - c1 - 40}" height="${h - 40}" fill="#fff" fill-opacity=".06" stroke="#fff" stroke-opacity=".35" stroke-dasharray="6 6"/>` +
    label((x0 + c1) / 2, y0 + 96, 'FISCALITÉ') + label((x0 + c1) / 2, y0 + 262, 'COMPTABILITÉ') +
    label((c1 + c2) / 2, mid + 8, 'HOLDING') +
    label((c2 + x0 + w) / 2, y0 + 96, 'BANQUE') + label((c2 + x0 + w) / 2, y0 + 262, 'RÉSIDENCE');
  // dimension lines
  const dim = (xa, xb, y) => `<path d="M${xa},${y}H${xb}M${xa},${y - 10}V${y + 10}M${xb},${y - 10}V${y + 10}" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/>`;
  const dims = dim(x0, c1, y0 - 26) + dim(c1, c2, y0 - 26) + dim(c2, x0 + w, y0 - 26) + `<path d="M${x0 - 26},${y0}V${y0 + h}M${x0 - 36},${y0}H${x0 - 16}M${x0 - 36},${y0 + h}H${x0 - 16}" stroke="#fff" stroke-opacity=".45" stroke-width="1.2"/>`;
  let grid = '';
  for (let x = 0; x <= W; x += 40) grid += `<line x1="${x}" x2="${x}" y1="0" y2="${H}" stroke="#fff" stroke-opacity="${x % 200 ? .03 : .07}"/>`;
  for (let y = 0; y <= H; y += 40) grid += `<line y1="${y}" y2="${y}" x1="0" x2="${W}" stroke="#fff" stroke-opacity="${y % 200 ? .03 : .07}"/>`;
  const ms = 104, ww = 560, wh = ww * RATIO, my = sig ? 560 : 600, wy = my + ms + 36;
  return page(BP, `
  <div class="a" style="inset:0;background:radial-gradient(ellipse 80% 70% at 60% 50%,#16306a 0%,${BP} 70%,#0a1a40 100%)"></div>
  ${svg(grid + plan + dims)}
  ${at(SZ.x, my, markSVG(ms, WHITE, BP))}
  ${at(SZ.x, wy, word(ww))}
  ${sig ? at(SZ.x, wy + wh + 34, '<div>Concevoir votre entreprise</div><div>avant de la développer.</div>', 'font:500 32px/42px Inter;color:rgba(255,255,255,.88)') : ''}`);
}

// =====================================================================================
// 5 — THE FINANCIAL ARCHITECTURE : four pillars carry the entablature of the company
// =====================================================================================
function C5(sig) {
  const cx = 1280, aw = 1240, ax = cx - aw / 2;
  const aTop = sig ? 526 : 534, aH = 88, pTop = aTop + aH + 14, pBot = sig ? 778 : 828, sTop = pBot + 6;
  const pw = 150, labels = ['Fiscalité', 'Comptabilité', 'Banque', 'Juridique'];
  const gap = (aw - 80 - 4 * pw) / 3;
  let pillars = '';
  labels.forEach((t, i) => {
    const x = ax + 40 + i * (pw + gap);
    let flutes = '';
    for (let f = 1; f < 6; f++) flutes += `<line x1="${x + f * pw / 6}" x2="${x + f * pw / 6}" y1="${pTop + 16}" y2="${pBot - 16}" stroke="#0F0A13" stroke-opacity=".16" stroke-width="2"/>`;
    pillars += `<rect x="${x - 10}" y="${pTop}" width="${pw + 20}" height="14" fill="#E6E4EE"/>
      <rect x="${x}" y="${pTop + 14}" width="${pw}" height="${pBot - pTop - 28}" fill="url(#pil)"/>${flutes}
      <rect x="${x - 10}" y="${pBot - 14}" width="${pw + 20}" height="14" fill="#E6E4EE"/>`;
  });
  const steps = `<rect x="${ax - 20}" y="${sTop}" width="${aw + 40}" height="14" fill="#CFCCDD"/><rect x="${ax - 50}" y="${sTop + 14}" width="${aw + 100}" height="14" fill="#A9A6BE"/>`;
  const ly = sTop + 46;
  const labelRow = labels.map((t, i) => `<div class="a" style="left:${ax + 40 + i * (pw + gap) + pw / 2}px;top:${ly}px;transform:translateX(-50%);font:600 22px Mont;letter-spacing:.26em;text-transform:uppercase;color:rgba(255,255,255,.78);white-space:nowrap;padding-left:.26em">${t}</div>`).join('');
  const ww = 720, ms = 64;
  return page(INK, `
  <div class="a" style="inset:0;background:radial-gradient(ellipse 60% 70% at 50% 45%,#1d1638 0%,${INK} 70%)"></div>
  ${svg(`<defs><linearGradient id="pil" x1="0" x2="1"><stop offset="0" stop-color="#F2F1F6"/><stop offset=".55" stop-color="#C9C6D9"/><stop offset="1" stop-color="#8E8AA8"/></linearGradient></defs>
    <rect x="${ax}" y="${aTop}" width="${aw}" height="${aH}" fill="#F2F1F6"/>
    <rect x="${ax - 18}" y="${aTop + aH}" width="${aw + 36}" height="14" fill="#C9C6D9"/>
    ${pillars}${steps}`)}
  ${at(cx - (ms + 36 + ww) / 2, aTop + (aH - ms) / 2, `<div style="display:flex;align-items:center;gap:36px">${markSVG(ms, NAVY, '#F2F1F6')}${word(ww, NAVY)}</div>`)}
  ${labelRow}
  ${sig ? row(ly + 44, 'Quatre piliers pour une entreprise internationale.', 'font:italic 400 34px PlayI;color:rgba(255,255,255,.92)') : ''}`);
}

// =====================================================================================
// 6 — THE BORDERLESS STRUCTURE : one beam — the company — resting on several countries
// =====================================================================================
function C6(sig) {
  const BG = '#EDF0F6', dx = 46, dy = -34;                // oblique depth
  const box = (x, y, w, h, front, top, side) =>
    `<polygon points="${x},${y} ${x + dx},${y + dy} ${x + w + dx},${y + dy} ${x + w},${y}" fill="${top}"/>
     <polygon points="${x + w},${y} ${x + w + dx},${y + dy} ${x + w + dx},${y + h + dy} ${x + w},${y + h}" fill="${side}"/>
     <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${front}"/>`;
  const beamY = 616, beamH = 124, groundY = 894;
  const countries = ['France', 'Portugal', 'Émirats', 'Singapour'];
  const pw = 230, span = 1640, px0 = 1280 - span / 2;
  const gap = (span - 4 * pw) / 3;
  let plinths = '', borders = '';
  countries.forEach((c, i) => {
    const x = px0 + i * (pw + gap);
    plinths += box(x, beamY + beamH, pw, groundY - beamY - beamH, '#DADDE6', '#F5F6FA', '#B9BDCB') +
      `<text x="${x + pw / 2}" y="${groundY - 40}" text-anchor="middle" font-family="Mont" font-weight="600" font-size="24" letter-spacing="4" fill="${NAVY}" fill-opacity=".85">${c.toUpperCase()}</text>`;
    if (i) { const bx = x - gap / 2; borders += `<line x1="${bx}" x2="${bx + dx * 3}" y1="${groundY + 60}" y2="${groundY - 40}" stroke="${NAVY}" stroke-opacity=".3" stroke-width="2" stroke-dasharray="4 8"/>`; }
  });
  const ground = `<rect x="0" y="${groundY}" width="${W}" height="${H - groundY}" fill="#E2E6EE"/><line x1="0" x2="${W}" y1="${groundY}" y2="${groundY}" stroke="${NAVY}" stroke-opacity=".25" stroke-width="2"/>`;
  const beam = box(-80, beamY, W + 160, beamH, NAVY, '#2B2566', '#070418');
  const ms = 84, ww = 760, wh = ww * RATIO;
  const lockW = ms + 40 + ww;
  return page(BG, `
  <div class="a" style="inset:0;background:linear-gradient(180deg,#E3E8F1 0%,#F3F5F9 60%)"></div>
  ${svg(ground + borders + plinths + beam)}
  ${at(1280 - lockW / 2, beamY + (beamH - ms) / 2, `<div style="display:flex;align-items:center;gap:40px">${markSVG(ms, WHITE, NAVY)}${word(ww)}</div>`)}
  ${sig ? row(beamY - 76, 'Une seule structure, plusieurs pays.', `font:500 34px Inter;color:${NAVY}`) : ''}`);
}

export const CONCEPTS = [
  ['1-ecosysteme-corporate', C1], ['2-cadre-global', C2], ['3-grille-internationale', C3],
  ['4-plan-entreprise', C4], ['5-architecture-financiere', C5], ['6-structure-sans-frontieres', C6]];
