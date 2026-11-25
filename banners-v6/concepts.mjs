// FYNOVATES — YouTube banners, round 6: six structural concepts, second exploration (2560x1440)
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
// 1 — THE CORPORATE ECOSYSTEM : a perfect squared rectangle — nine unequal squares, one whole;
//     the largest square is the FYNOVATES monogram itself
// =====================================================================================
function C1(sig) {
  // Moroń 33×32 squared rectangle: [x, y, side]
  const tiles = [[0, 0, 18], [18, 0, 15], [18, 15, 7], [25, 15, 8], [0, 18, 14], [14, 18, 4], [14, 22, 10], [24, 22, 1], [24, 23, 9]];
  const u = 12.4, g = 5, ox = SZ.r - 33 * u, oy = 720 - 16 * u;
  const tone = [0, .30, .14, .22, .10, .5, .18, .9, .26];
  let t = '';
  tiles.forEach(([x, y, s], i) => {
    if (i === 0) return;
    t += `<rect x="${ox + x * u + g / 2}" y="${oy + y * u + g / 2}" width="${s * u - g}" height="${s * u - g}" fill="#fff" fill-opacity="${tone[i]}"/>`;
  });
  const ms = 18 * u - g, ww = 800, wh = ww * RATIO;
  const wy = sig ? 676 : 720 - wh / 2;
  return page(NAVY, `
  <div class="a" style="inset:0;background:radial-gradient(ellipse 70% 80% at 70% 50%,#1b1450 0%,${NAVY} 60%,#07041b 100%)"></div>
  ${svg(t)}
  ${at(ox + g / 2, oy + g / 2, markSVG(ms, WHITE, NAVY))}
  ${at(SZ.x, wy, word(ww))}
  ${sig ? at(SZ.x, wy + wh + 36, 'Chaque pièce trouve sa place.', 'font:italic 400 46px PlayI;color:rgba(255,255,255,.9)') : ''}`);
}

// =====================================================================================
// 2 — THE GLOBAL FRAMEWORK : the golden rectangle — proportion as a framework;
//     every subdivision converges on the point of the F
// =====================================================================================
function C2(sig) {
  const BG = '#ECEBE8', phi = (1 + Math.sqrt(5)) / 2;
  const build = (x0, y0) => {
    let x = x0, y = y0, w = H * phi, h = H, ln = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${NAVY}" stroke-opacity=".5" stroke-width="2"/>`, last;
    for (let i = 0; i < 9; i++) {
      const d = i % 4;
      if (d === 0) { const s = h; ln += `<line x1="${x + s}" x2="${x + s}" y1="${y}" y2="${y + h}"/>`; x += s; w -= s; }
      else if (d === 1) { const s = w; ln += `<line x1="${x}" x2="${x + w}" y1="${y + s}" y2="${y + s}"/>`; y += s; h -= s; }
      else if (d === 2) { const s = h; ln += `<line x1="${x + w - s}" x2="${x + w - s}" y1="${y}" y2="${y + h}"/>`; w -= s; }
      else { const s = w; ln += `<line x1="${x}" x2="${x + w}" y1="${y + h - s}" y2="${y + h - s}"/>`; h -= s; }
      last = { x, y, w, h };
    }
    return { ln, pt: { x: last.x + last.w / 2, y: last.y + last.h / 2 } };
  };
  const probe = build(0, 0);
  const { ln: lines, pt } = build(1830 - probe.pt.x, 700 - probe.pt.y);   // convergence point placed in the visible band
  const r = 26;
  const ms = 112, ww = 700, wh = ww * RATIO;
  const lx = SZ.x + 10, my = sig ? 552 : 590, wy = my + ms + 40;
  return page(BG, `
  <div class="a" style="inset:0;background:radial-gradient(ellipse 60% 70% at 70% 55%,#F6F5F2 0%,${BG} 70%,#E1E0DC 100%)"></div>
  ${svg(`<g stroke="${NAVY}" stroke-opacity=".38" stroke-width="1.6">${lines}</g>
    <rect x="${pt.x - r}" y="${pt.y - r}" width="${2 * r}" height="${2 * r}" fill="${NAVY}"/>
    <text x="${pt.x}" y="${pt.y + r + 44}" text-anchor="middle" font-family="PlayI" font-style="italic" font-size="34" fill="${NAVY}" fill-opacity=".7">φ</text>`)}
  ${at(lx, my, markSVG(ms, NAVY, WHITE))}
  ${at(lx, wy, word(ww, NAVY))}
  ${sig ? at(lx, wy + wh + 36, 'Structurer avec justesse.', `font:500 36px Inter;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// 3 — THE INTERNATIONAL GRID : the 24 time zones — one company, active around the clock
// =====================================================================================
function C3(sig) {
  const n = 24, bw = W / n;
  const c0 = [13, 8, 46], c1 = [226, 224, 240];
  let bands = '';
  for (let i = 0; i < n; i++) {
    const off = i - 11;                                        // UTC-11 … UTC+12
    const t = Math.pow(.5 + .5 * Math.cos(2 * Math.PI * (off - 1) / 24), 1.6);
    const c = c0.map((v, k) => Math.round(v + (c1[k] - v) * t));
    bands += `<rect x="${(i * bw).toFixed(1)}" y="0" width="${(bw + .5).toFixed(1)}" height="${H}" fill="rgb(${c})"/>`;
    const lab = off === 0 ? 'UTC' : `UTC${off > 0 ? '+' : '−'}${Math.abs(off)}`;
    const fg = t > .45 ? NAVY : '#fff';
    bands += `<text x="${(i * bw + bw / 2).toFixed(1)}" y="${SZ.b - 22}" text-anchor="middle" font-family="Mont" font-weight="600" font-size="19" letter-spacing="1" fill="${fg}" fill-opacity=".62">${lab}</text>`;
    bands += `<line x1="${(i * bw).toFixed(1)}" x2="${(i * bw).toFixed(1)}" y1="0" y2="${H}" stroke="#fff" stroke-opacity=".08"/>`;
  }
  const ms = 116, ww = 1000, wh = ww * RATIO;
  const my = sig ? 540 : 568, wy = my + ms + 38;
  return page(NAVY, `
  ${svg(bands)}
  ${row(my, markSVG(ms, NAVY, WHITE))}
  ${row(wy, word(ww, NAVY))}
  ${sig ? row(wy + wh + 32, 'Votre entreprise, sur tous les fuseaux.', `font:500 34px Inter;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// 4 — THE BUSINESS BLUEPRINT : exploded axonometric — the company, level by level
// =====================================================================================
function C4(sig) {
  const BG = '#F6F6F4', a = 16 * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
  const cx = 1420, base = 868, L = 430, D = 300, th = 16, step = 66;
  const P = (x, y, z) => [cx + (x - y) * ca, base - z + (x + y) * sa - (L + D) * sa / 2];
  const levels = ['Juridique', 'Comptabilité', 'Fiscalité', 'Banque', 'Résidence'];
  const pts = (a) => a.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  let s = '', labs = '';
  levels.forEach((lab, i) => {
    const z = i * step, solid = i === 0;
    const top = [P(0, 0, z + th), P(L, 0, z + th), P(L, D, z + th), P(0, D, z + th)];
    const fl = [P(0, D, z), P(L, D, z), P(L, D, z + th), P(0, D, z + th)];
    const fr = [P(L, 0, z), P(L, D, z), P(L, D, z + th), P(L, 0, z + th)];
    s += `<polygon points="${pts(fl)}" fill="${solid ? '#1d1750' : '#E2E2EA'}" stroke="${NAVY}" stroke-width="1.4"/>
      <polygon points="${pts(fr)}" fill="${solid ? '#07041a' : '#CFCFDB'}" stroke="${NAVY}" stroke-width="1.4"/>
      <polygon points="${pts(top)}" fill="${solid ? NAVY : '#FFFFFF'}" stroke="${NAVY}" stroke-width="1.4"/>`;
    // leader line to the label
    const [lx, ly] = P(L, 0, z + th);
    labs += `<path d="M${lx + 6},${ly}H${1856}" stroke="${NAVY}" stroke-opacity=".45" stroke-width="1.2" stroke-dasharray="2 5"/>
      <rect x="${1852}" y="${ly - 4}" width="8" height="8" fill="${NAVY}"/>
      <text x="${1874}" y="${ly + 9}" font-family="Inter" font-weight="500" font-size="26" fill="${NAVY}">${lab}</text>`;
  });
  // vertical alignment axes between levels (exploded view)
  for (const [x, y] of [[0, 0], [L, 0], [0, D], [L, D]]) {
    const [x1, y1] = P(x, y, 0), [x2, y2] = P(x, y, (levels.length - 1) * step + th);
    s = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${NAVY}" stroke-opacity=".25" stroke-dasharray="3 6"/>` + s;
  }
  const ms = 104, ww = 540, wh = ww * RATIO, my = sig ? 556 : 594, wy = my + ms + 36;
  return page(BG, `
  ${svg(s + labs)}
  ${at(SZ.x, my, markSVG(ms, NAVY, WHITE))}
  ${at(SZ.x, wy, word(ww, NAVY))}
  ${sig ? at(SZ.x, wy + wh + 34, '<div>Chaque niveau de votre</div><div>entreprise, maîtrisé.</div>', `font:500 34px/44px Inter;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// 5 — THE FINANCIAL ARCHITECTURE : the arch — the monogram is its keystone
// =====================================================================================
function C5(sig) {
  const cx = 1280, cy = 1450, Ri = 760, Ro = 900, nst = 17;
  const pt = (r, t) => [cx + r * Math.cos(t), cy - r * Math.sin(t)];
  let s = '';
  for (let i = 0; i < nst; i++) {
    const t0 = Math.PI * i / nst, t1 = Math.PI * (i + 1) / nst, key = i === (nst - 1) / 2;
    const p = [pt(Ri, t0), pt(Ro, t0), pt(Ro, t1), pt(Ri, t1)];
    const sh = .55 + .45 * Math.sin((t0 + t1) / 2);
    const c = key ? NAVY : `rgb(${Math.round(150 + 90 * sh)},${Math.round(147 + 88 * sh)},${Math.round(170 + 75 * sh)})`;
    s += `<path d="M${p[0]}L${p[1]}A${Ro},${Ro} 0 0 0 ${p[2]}L${p[3]}A${Ri},${Ri} 0 0 1 ${p[0]}Z" fill="${c}" stroke="#0F0A13" stroke-width="5"/>`;
  }
  const km = Math.PI / 2, [kx, ky] = pt((Ri + Ro) / 2, km);
  const ms = 108, ww = 600, wh = ww * RATIO;
  const wy = sig ? 776 : 806;
  return page(INK, `
  <div class="a" style="inset:0;background:radial-gradient(ellipse 50% 60% at 50% 70%,#211a42 0%,${INK} 70%)"></div>
  ${svg(s)}
  ${at(kx - ms / 2, ky - ms / 2 + 2, markSVG(ms, WHITE, NAVY))}
  ${row(wy, word(ww))}
  ${sig ? row(wy + wh + 30, 'La clé de voûte de votre développement international.', 'font:italic 400 34px PlayI;color:rgba(255,255,255,.9)') : ''}`);
}

// =====================================================================================
// 6 — THE BORDERLESS STRUCTURE : one continuous bar runs through every border wall
// =====================================================================================
function C6(sig) {
  const BG = '#EEF0F5', dx = 120, dy = -70;                  // oblique depth of each wall
  const walls = ['France', 'Portugal', 'Irlande', 'Émirats', 'Singapour'];
  const wx0 = 1240, gap = 162, wTop = 600, wBot = 856;
  const barY = 690, barH = 64, bx0 = 1160, bx1 = W + 40;
  const bar = `<polygon points="${bx0},${barY} ${bx0 + dx * .5},${barY + dy * .5} ${bx1},${barY + dy * .5} ${bx1},${barY}" fill="#2B2566"/>
    <rect x="${bx0}" y="${barY}" width="${bx1 - bx0}" height="${barH}" fill="${NAVY}"/>
    <polygon points="${bx0},${barY} ${bx0 + dx * .5},${barY + dy * .5} ${bx0 + dx * .5},${barY + barH + dy * .5} ${bx0},${barY + barH}" fill="#07041a"/>`;
  let ws = '';
  walls.forEach((c, i) => {
    const x = wx0 + i * gap;
    ws += `<polygon points="${x},${wTop} ${x + dx},${wTop + dy} ${x + dx},${wBot + dy} ${x},${wBot}" fill="#FFFFFF" fill-opacity=".55" stroke="${NAVY}" stroke-opacity=".55" stroke-width="1.6"/>
      <text x="${x + 2}" y="${wBot + 36}" font-family="Mont" font-weight="600" font-size="19" letter-spacing="2" fill="${NAVY}" fill-opacity=".85">${c.toUpperCase()}</text>`;
  });
  const ground = `<line x1="0" x2="${W}" y1="${wBot}" y2="${wBot}" stroke="${NAVY}" stroke-opacity=".18" stroke-width="2"/>`;
  const ms = 104, ww = 560, wh = ww * RATIO, my = sig ? 556 : 594, wy = my + ms + 36;
  return page(BG, `
  <div class="a" style="inset:0;background:linear-gradient(180deg,#E4E8F1 0%,#F4F5F9 70%)"></div>
  ${svg(ground + bar + ws)}
  ${at(SZ.x, my, markSVG(ms, NAVY, WHITE))}
  ${at(SZ.x, wy, word(ww, NAVY))}
  ${sig ? at(SZ.x, wy + wh + 34, '<div>Traverser les frontières,</div><div>garder la structure.</div>', `font:500 34px/44px Inter;color:${NAVY}`) : ''}`);
}

export const CONCEPTS = [
  ['1-ecosysteme-corporate', C1], ['2-cadre-global', C2], ['3-grille-internationale', C3],
  ['4-plan-entreprise', C4], ['5-architecture-financiere', C5], ['6-structure-sans-frontieres', C6]];
