// FYNOVATES — YouTube channel banners generator (2560x1440)
// usage: node banners/build.mjs <path/to/geo.json>
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const GEO = JSON.parse(fs.readFileSync(process.argv[2] || path.join(ROOT, 'geo.json')));
const W = 2560, H = 1440;
const SZ = { x: 507, y: 508.5, w: 1546, h: 423 };
const NAVY = '#0D082E', INK = '#0F0A13', WHITE = '#FFFFFF', IVORY = '#F2EEE6';
const WORD = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'brand/fynovates-wordmark-white.png')).toString('base64');
const WORD_RATIO = 76 / 1110;
const F = (f) => 'file://' + path.join(ROOT, 'fonts', f);

// ---------- brand primitives (geometry measured from the original mark, 216-unit grid) ----------
function mark(x, y, s, sq, fg) {
  const k = s / 216;
  return `<g transform="translate(${x},${y}) scale(${k})">
    <rect width="216" height="216" fill="${sq}"/>
    <rect x="40" y="32" width="31" height="154" fill="${fg}"/>
    <rect x="40" y="32" width="136" height="27" fill="${fg}"/>
    <rect x="40" y="100" width="120" height="25" fill="${fg}"/>
    <rect x="145" y="155" width="31" height="31" fill="${fg}"/></g>`;
}
// wordmark: original raster used as an alpha mask (keeps the exact letterforms), any colour
function word(x, y, w, color = WHITE) {
  const h = w * WORD_RATIO;
  return `<div style="position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;background:${color};
    -webkit-mask:url(${WORD}) no-repeat 0 0/100% 100%;mask:url(${WORD}) no-repeat 0 0/100% 100%"></div>`;
}
const css = `
@font-face{font-family:Mont;src:url(${F('Montserrat.ttf')})}
@font-face{font-family:Play;src:url(${F('Playfair.ttf')})}
@font-face{font-family:PlayI;src:url(${F('PlayfairItalic.ttf')})}
@font-face{font-family:Mono;src:url(${F('PlexMono.ttf')})}
@font-face{font-family:MonoM;src:url(${F('PlexMonoMedium.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{position:relative;-webkit-font-smoothing:antialiased}
.abs{position:absolute}
.t{position:absolute;white-space:nowrap}
svg.layer{position:absolute;left:0;top:0}`;
const page = (bg, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body style="background:${bg}">${body}</body></html>`;
const text = (x, y, s, style, anchor = 'left') => {
  const tx = anchor === 'center' ? 'translateX(-50%)' : anchor === 'right' ? 'translateX(-100%)' : 'none';
  return `<div class="t" style="left:${x}px;top:${y}px;transform:${tx};${style}">${s}</div>`;
};

// =====================================================================================
// CONCEPT 1 — INTERNATIONAL BUSINESS MEDIA : dot-matrix world, live connections
// =====================================================================================
const FR = { LDN: 'LONDRES', NYC: 'NEW YORK', DXB: 'DUBAÏ', SIN: 'SINGAPOUR', HKG: 'HONG KONG', TYO: 'TOKYO', TOR: 'TORONTO', MIA: 'MIAMI',
  MEX: 'MEXICO', SAO: 'SÃO PAULO', JNB: 'JOHANNESBOURG', SYD: 'SYDNEY', BOM: 'BOMBAY', PAR: 'PARIS' };
function concept1(sig) {
  const { dots, hubs } = GEO.c1;
  const cx = 1280, cy = 700;
  let d = '';
  for (const [x, y] of dots) {
    const ex = (x - cx) / 820, ey = (y - cy) / 330;
    const r = Math.sqrt(ex * ex + ey * ey);
    let o = 0.05 + 0.17 * Math.min(1, Math.max(0, (r - 0.55) / 0.9));
    o *= Math.max(0, 1 - Math.max(0, Math.abs(y - 720) - 330) / 260);
    if (o > 0.012) d += `<circle cx="${x}" cy="${y}" r="2.2" fill-opacity="${o.toFixed(3)}"/>`;
  }
  const links = [['LDN', 'NYC'], ['LDN', 'TOR'], ['NYC', 'TOR'], ['NYC', 'MIA'], ['MIA', 'SAO'], ['NYC', 'MEX'], ['LDN', 'HKG'],
    ['DXB', 'BOM'], ['DXB', 'SIN'], ['SIN', 'HKG'], ['HKG', 'TYO'], ['SIN', 'SYD'], ['DXB', 'JNB'], ['BOM', 'SIN']];
  let arcs = '';
  links.forEach(([a, b], i) => {
    const [x1, y1] = hubs[a], [x2, y2] = hubs[b];
    const dx = x2 - x1, dist = Math.hypot(dx, y2 - y1);
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - dist * 0.32;
    arcs += `<path d="M${x1},${y1} Q${mx},${my} ${x2},${y2}" stroke="url(#arc)" stroke-width="${dist > 600 ? 1.8 : 1.4}" fill="none" opacity="${dist > 600 ? 0.62 : 0.5}"/>`;
  });
  // hubs outside the lockup area get a node + label
  let nodes = '';
  for (const [k, [x, y]] of Object.entries(hubs)) {
    const hidden = (Math.abs(x - cx) < 620 && Math.abs(y - cy) < 150) || ['LIS', 'LAG'].includes(k);
    if (hidden) continue;
    if (['PAR', 'LUX', 'ZRH'].includes(k)) { nodes += `<circle cx="${x}" cy="${y}" r="3.2" fill="#fff" fill-opacity=".8"/>`; continue; }
    nodes += `<circle cx="${x}" cy="${y}" r="13" fill="none" stroke="#fff" stroke-opacity=".22"/>
      <circle cx="${x}" cy="${y}" r="4.2" fill="#fff"/>
      <text x="${x + 20}" y="${y - 16}" font-family="MonoM" font-size="14" letter-spacing="3" fill="#fff" fill-opacity=".62">${FR[k] || k}</text>`;
  }
  // latitude hairlines (tropics + equator) — cartographic reference
  const lat = [[23.44, 'TROPIQUE DU CANCER'], [0, 'ÉQUATEUR'], [-23.44, 'TROPIQUE DU CAPRICORNE']].map(([l, lab]) => {
    const y = 873 - (l * Math.PI / 180) * 398;
    return `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#fff" stroke-opacity=".07" stroke-dasharray="2 10"/>
      <text x="${W - 60}" text-anchor="end" y="${y - 10}" font-family="Mono" font-size="13" letter-spacing="2" fill="#fff" fill-opacity=".28">${lab}</text>`;
  }).join('');

  const markS = 148, ww = 880, gap = 54, total = markS + gap + ww;
  const lx = cx - total / 2, ly = sig ? 618 : 646;
  const wh = ww * WORD_RATIO;
  const body = `
  <div class="abs" style="inset:0;background:radial-gradient(ellipse 60% 55% at 50% 50%,#1a1453 0%,#120c3e 45%,#0a0626 100%)"></div>
  <svg class="layer" width="${W}" height="${H}">
    <defs><linearGradient id="arc" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#a7a0ff"/><stop offset="1" stop-color="#fff"/></linearGradient>
      <radialGradient id="halo"><stop offset="0" stop-color="#0D082E" stop-opacity=".92"/><stop offset=".6" stop-color="#0D082E" stop-opacity=".55"/><stop offset="1" stop-color="#0D082E" stop-opacity="0"/></radialGradient></defs>
    ${lat}
    <g fill="#fff">${d}</g>
    ${arcs}${nodes}
    <ellipse cx="${cx}" cy="${cy + 20}" rx="800" ry="230" fill="url(#halo)"/>
    ${mark(lx, ly, markS, WHITE, NAVY)}
  </svg>
  ${word(lx + markS + gap, ly + markS / 2 - wh / 2, ww)}
  ${sig ? `
  <div class="abs" style="left:${lx}px;top:${ly + markS + 46}px;width:${total}px;height:1px;background:rgba(255,255,255,.22)"></div>
  ${text(cx, ly + markS + 74, 'COMPRENDRE LES ENJEUX DU BUSINESS INTERNATIONAL.', 'font:500 24px Mont;letter-spacing:.34em;color:rgba(255,255,255,.9);margin-left:.19em', 'center')}` : ''}`;
  return page(NAVY, body);
}

// =====================================================================================
// CONCEPT 2 — GLOBAL INTELLIGENCE : analytical globe, jurisdictions, instrument bezel
// =====================================================================================
function concept2(sig) {
  const g = GEO.c2, dx = 110, cx = g.cx + dx, cy = g.cy, R = g.R;
  const ACC = '#7C70FF';
  let hl = '';
  for (const p of Object.values(g.hl)) if (p) hl += `<path d="${p}" fill="${ACC}" fill-opacity=".55" stroke="${ACC}" stroke-width="1"/>`;
  let arcs = '';
  for (const p of Object.values(g.arcs)) if (p) arcs += `<path d="${p}" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4" stroke-dasharray="1 6" stroke-linecap="round"/>`;
  const labelled = { LDN: ['LONDRES', '51,5074° N  0,1278° O', -1], ZRH: ['ZURICH', '47,3769° N  8,5417° E', 1], DXB: ['DUBAÏ', '25,2048° N  55,2708° E', -1],
    LIS: ['LISBONNE', '38,7223° N  9,1393° O', -1], LAG: ['LAGOS', '6,5244° N  3,3792° E', -1] };
  let hubs = '';
  for (const [k, [x, y]] of Object.entries(g.hubs)) {
    hubs += `<rect x="${x - 4}" y="${y - 4}" width="8" height="8" fill="#fff"/>`;
    const L = labelled[k];
    if (!L) continue;
    const dir = L[2], lx = x + dir * 70, ly = y - 38 + (k === 'LUX' ? -34 : 0) + (k === 'ZRH' ? 30 : 0) + (k === 'LDN' ? 40 : 0) + (k === 'LIS' ? 74 : 0);
    hubs += `<path d="M${x},${y} L${x + dir * 18},${ly} L${lx},${ly}" fill="none" stroke="#fff" stroke-opacity=".5"/>
      <text x="${lx + dir * 8}" y="${ly - 7}" text-anchor="${dir > 0 ? 'start' : 'end'}" font-family="MonoM" font-size="15" letter-spacing="3" fill="#fff">${L[0]}</text>
      <text x="${lx + dir * 8}" y="${ly + 17}" text-anchor="${dir > 0 ? 'start' : 'end'}" font-family="Mono" font-size="12" letter-spacing="1.5" fill="#fff" fill-opacity=".5">${L[1]}</text>`;
  }
  // instrument bezel around the globe
  let bezel = '';
  for (let a = 0; a < 360; a += 2) {
    const rad = (a - 90) * Math.PI / 180, r1 = R + 26, r2 = R + 26 + (a % 30 === 0 ? 22 : a % 10 === 0 ? 12 : 6);
    bezel += `<line x1="${cx + r1 * Math.cos(rad)}" y1="${cy + r1 * Math.sin(rad)}" x2="${cx + r2 * Math.cos(rad)}" y2="${cy + r2 * Math.sin(rad)}" stroke="#fff" stroke-opacity="${a % 30 === 0 ? .55 : .22}"/>`;
    if (a % 30 === 0) {
      const r3 = R + 66;
      bezel += `<text x="${cx + r3 * Math.cos(rad)}" y="${cy + r3 * Math.sin(rad) + 5}" text-anchor="middle" font-family="Mono" font-size="13" fill="#fff" fill-opacity=".4">${String(a).padStart(3, '0')}</text>`;
    }
  }
  // background measurement grid
  let grid = '';
  for (let x = 0; x <= W; x += 80) grid += `<line x1="${x}" x2="${x}" y1="0" y2="${H}"/>`;
  for (let y = 0; y <= H; y += 80) grid += `<line y1="${y}" y2="${y}" x1="0" x2="${W}"/>`;
  let cross = '';
  for (const [x, y] of [[480, 480], [480, 960], [1440, 480], [1440, 960], [160, 720]]) cross += `<path d="M${x - 9},${y}H${x + 9}M${x},${y - 9}V${y + 9}" stroke="#fff" stroke-opacity=".4"/>`;

  const LX = 568, ww = 690, wh = ww * WORD_RATIO, ms = 104;
  const my = sig ? 568 : 600, wy = my + ms + 44;
  const body = `
  <div class="abs" style="inset:0;background:radial-gradient(circle at 76% 50%,#18104a 0%,#0f0a24 38%,${INK} 70%)"></div>
  <svg class="layer" width="${W}" height="${H}">
    <defs><radialGradient id="sph" cx=".38" cy=".35"><stop offset="0" stop-color="#231a6a"/><stop offset=".75" stop-color="#120c3c"/><stop offset="1" stop-color="#0a0726"/></radialGradient>
    <radialGradient id="rim"><stop offset=".9" stop-color="${ACC}" stop-opacity="0"/><stop offset="1" stop-color="${ACC}" stop-opacity=".35"/></radialGradient>
    <linearGradient id="fadeL" x1="0" x2="1"><stop offset="0" stop-color="${INK}"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient></defs>
    <g stroke="#fff" stroke-opacity=".035">${grid}</g>${cross}
    <circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="url(#rim)"/>
    <circle cx="${cx}" cy="${cy}" r="${R}" fill="url(#sph)" stroke="#fff" stroke-opacity=".35" stroke-width="1.2"/>
    <g transform="translate(${dx},0)">
      <path d="${g.grat}" fill="none" stroke="#fff" stroke-opacity=".07"/>
      <path d="${g.gratMajor}" fill="none" stroke="#fff" stroke-opacity=".12"/>
      <path d="${g.land}" fill="#241d62" fill-opacity=".7" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
      <path d="${g.borders}" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width=".7"/>
      ${hl}
      <path d="${g.equator}" fill="none" stroke="${ACC}" stroke-opacity=".6" stroke-dasharray="6 6"/>
      ${arcs}${hubs}
    </g>
    <circle cx="${cx}" cy="${cy}" r="${R + 26}" fill="none" stroke="#fff" stroke-opacity=".18"/>
    ${bezel}
    <rect x="0" y="0" width="1240" height="${H}" fill="url(#fadeL)" opacity=".0"/>
    ${mark(LX, my, ms, WHITE, INK)}
  </svg>
  ${text(LX + ms + 32, my + 6, 'FYNOVATES&nbsp;/&nbsp;INTELLIGENCE&nbsp;ÉCONOMIQUE', 'font:500 15px MonoM;letter-spacing:.32em;color:rgba(255,255,255,.75)')}
  ${text(LX + ms + 32, my + 34, 'AFFAIRES INTERNATIONALES · FISCALITÉ · BANQUE', 'font:400 13px Mono;letter-spacing:.28em;color:rgba(255,255,255,.38)')}
  <div class="abs" style="left:${LX + ms + 32}px;top:${my + ms - 1}px;width:${ww - ms - 32}px;height:1px;background:rgba(255,255,255,.25)"></div>
  ${word(LX, wy, ww)}
  ${sig ? `
  <div class="abs" style="left:${LX}px;top:${wy + wh + 38}px;width:${ww}px;height:1px;background:rgba(255,255,255,.18)"></div>
  <div class="abs" style="left:${LX}px;top:${wy + wh + 34}px;width:9px;height:9px;background:${ACC}"></div>
  ${text(LX, wy + wh + 64, 'DÉCRYPTER. ANALYSER. <span style="color:#a49cff">COMPRENDRE.</span>', 'font:600 23px Mont;letter-spacing:.24em;color:#fff')}` : ''}`;
  return page(INK, body);
}

// =====================================================================================
// CONCEPT 3 — THE INTERNATIONAL BUSINESS JOURNAL : ivory masthead + architectural elevations
// =====================================================================================
function tower(x, base, w, h, kind, ink) {
  // returns an architectural elevation drawn in hairlines
  const top = base - h;
  let s = '', mull = '';
  const stroke = `stroke="${ink}"`;
  const vlines = (x0, x1, y0, step = 9, y1 = base) => { let o = ''; for (let xx = x0 + step; xx < x1 - 1; xx += step) o += `M${xx.toFixed(1)},${y0}V${y1}`; return o; };
  const hlines = (x0, x1, y0, step = 14, y1 = base) => { let o = ''; for (let yy = y0 + step; yy < y1; yy += step) o += `M${x0},${yy.toFixed(1)}H${x1}`; return o; };
  switch (kind) {
    case 'slab': s = `M${x},${base}V${top}H${x + w}V${base}`; mull = vlines(x, x + w, top + 6); break;
    case 'setback': {
      const a = w * 0.16, b = w * 0.3;
      s = `M${x},${base}V${top + h * .32}H${x + a}V${top + h * .14}H${x + b}V${top + 30}H${x + w - b}V${top + h * .14}H${x + w - a}V${top + h * .32}H${x + w}V${base}M${x + w / 2},${top + 30}V${top - 60}`;
      mull = vlines(x + b, x + w - b, top + 36) + vlines(x, x + a, top + h * .32 + 6) + vlines(x + w - a, x + w, top + h * .32 + 6) + vlines(x + a, x + b, top + h * .14 + 6) + vlines(x + w - b, x + w - a, top + h * .14 + 6);
      break;
    }
    case 'needle': {
      const c = x + w / 2; let pts = [];
      const tiers = 6; s = `M${x},${base}`;
      for (let i = 0; i < tiers; i++) { const yy = base - h * (i + 1) / tiers * .82, hw = w / 2 * (1 - i / tiers * .85); s += `V${yy}H${c - hw * .78}`; pts.push([yy, hw]); }
      s = `M${x},${base}`; let r = `M${x + w},${base}`;
      pts.forEach(([yy, hw], i) => { const nhw = (pts[i + 1] || [0, hw * .6])[1]; s += `L${c - hw},${yy}H${c - nhw}`; r += `L${c + hw},${yy}H${c + nhw}`; });
      s += `L${c},${top - 40}` + r.replace(/^M/, 'M') + `L${c},${top - 40}`;
      mull = `M${c},${base}V${top}`;
      break;
    }
    case 'bullet': {
      const c = x + w / 2;
      s = `M${x},${base}C${x - w * .08},${base - h * .55} ${x + w * .1},${top + h * .1} ${c},${top}C${x + w * .9},${top + h * .1} ${x + w * 1.08},${base - h * .55} ${x + w},${base}`;
      for (let i = 1; i < 9; i++) { const t = i / 9, yy = base - h * t * .96; mull += `M${x + w * .02},${yy}Q${c},${yy + 14} ${x + w * .98},${yy}`; }
      mull += `M${x + w * .25},${base}Q${x + w * .3},${top + h * .3} ${c},${top}M${x + w * .75},${base}Q${x + w * .7},${top + h * .3} ${c},${top}M${c},${base}V${top}`;
      break;
    }
    case 'slant': s = `M${x},${base}V${top + w * .55}L${x + w},${top}V${base}`; mull = vlines(x, x + w, top + w * .6); break;
    case 'twin': {
      const tw = w * .4;
      s = `M${x},${base}V${top + 40}L${x + tw / 2},${top - 30}L${x + tw},${top + 40}V${base}M${x + w - tw},${base}V${top + 40}L${x + w - tw / 2},${top - 30}L${x + w},${top + 40}V${base}M${x + tw},${top + h * .45}H${x + w - tw}M${x + tw},${top + h * .45 + 10}H${x + w - tw}`;
      mull = hlines(x, x + tw, top + 40, 12) + hlines(x + w - tw, x + w, top + 40, 12);
      break;
    }
    case 'triple': {
      const tw = w * .26, g = (w - 3 * tw) / 2;
      for (let i = 0; i < 3; i++) { const xx = x + i * (tw + g); s += `M${xx},${base}V${top + 26}H${xx + tw}V${base}`; mull += vlines(xx, xx + tw, top + 30, 7); }
      s += `M${x - 20},${top + 26}C${x + w * .3},${top + 6} ${x + w * .7},${top + 6} ${x + w + 34},${top + 22}L${x + w + 34},${top + 30}C${x + w * .7},${top + 16} ${x + w * .3},${top + 16} ${x - 20},${top + 34}Z`;
      break;
    }
    case 'crown': {
      s = `M${x},${base}V${top + 60}L${x + w / 2},${top}L${x + w},${top + 60}V${base}M${x},${top + 60}H${x + w}`;
      mull = vlines(x, x + w, top + 66, 10);
      for (let i = 1; i < 4; i++) mull += `M${x + w / 2 - (w / 2) * i / 4},${top + 60 * i / 4}H${x + w / 2 + (w / 2) * i / 4}`;
      break;
    }
    case 'low': s = `M${x},${base}V${top}H${x + w}V${base}`; mull = hlines(x, x + w, top, 11); break;
    case 'step': {
      s = `M${x},${base}V${top + h * .4}H${x + w * .25}V${top}H${x + w * .7}V${top + h * .22}H${x + w}V${base}`;
      mull = vlines(x + w * .25, x + w * .7, top + 6, 8) + vlines(x, x + w * .25, top + h * .4 + 6, 8) + vlines(x + w * .7, x + w, top + h * .22 + 6, 8);
      break;
    }
  }
  return `<path d="${s}" fill="${IVORY}" ${stroke} stroke-width="1.5" stroke-linejoin="round"/><path d="${mull}" fill="none" ${stroke} stroke-opacity=".38" stroke-width=".8"/>`;
}
function concept3(sig) {
  const ink = NAVY, base = 1000;
  // [x, width, height, kind] — tall flanks, quiet centre (the editorial "valley")
  const L = [[-30, 150, 380, 'slab'], [110, 120, 520, 'needle'], [228, 130, 330, 'bullet'], [350, 110, 560, 'setback'], [455, 90, 200, 'slant'],
    [560, 140, 150, 'step'], [710, 120, 110, 'low'], [840, 160, 80, 'low'], [1010, 130, 130, 'low'], [1150, 120, 70, 'low']];
  const Rr = [[1290, 150, 100, 'low'], [1450, 130, 140, 'low'], [1590, 170, 150, 'step'], [1770, 120, 110, 'low'], [1900, 140, 150, 'slant'],
    [2060, 120, 380, 'crown'], [2190, 110, 600, 'needle'], [2300, 230, 300, 'triple'], [2560, 140, 450, 'setback']];
  let sky = '';
  [...L, ...Rr].forEach(([x, w, h, k]) => sky += tower(x, base, w, h, k, ink));
  const ww = 1110, wh = ww * WORD_RATIO, wx = (W - ww) / 2, wy = sig ? 640 : 662;
  const body = `
  <div class="abs" style="inset:0;background:radial-gradient(ellipse 70% 60% at 50% 45%,#f7f4ee 0%,${IVORY} 60%,#e9e4d9 100%)"></div>
  <svg class="layer" width="${W}" height="${H}">
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${IVORY}" stop-opacity="0"/><stop offset="1" stop-color="${IVORY}"/></linearGradient>
    <radialGradient id="clear" cx=".5" cy=".5"><stop offset="0" stop-color="#f6f3ec" stop-opacity="1"/><stop offset=".55" stop-color="#f6f3ec" stop-opacity=".85"/><stop offset="1" stop-color="#f6f3ec" stop-opacity="0"/></radialGradient></defs>
    <g opacity=".42">${sky}</g>
    <line x1="0" x2="${W}" y1="${base}" y2="${base}" stroke="${ink}" stroke-opacity=".5" stroke-width="1.5"/>
    <rect x="0" y="${base + 1}" width="${W}" height="${H - base}" fill="${IVORY}"/>
    <ellipse cx="1280" cy="${wy + 60}" rx="760" ry="210" fill="url(#clear)"/>
    <!-- masthead rules -->
    <line x1="${SZ.x + 40}" x2="${SZ.x + SZ.w - 40}" y1="${wy - 56}" y2="${wy - 56}" stroke="${ink}" stroke-width="3"/>
    <line x1="${SZ.x + 40}" x2="${SZ.x + SZ.w - 40}" y1="${wy - 49}" y2="${wy - 49}" stroke="${ink}" stroke-width="1"/>
    <line x1="${SZ.x + 40}" x2="${SZ.x + SZ.w - 40}" y1="${wy + wh + 34}" y2="${wy + wh + 34}" stroke="${ink}" stroke-width="1"/>
    ${mark(SZ.x + 40, wy - 30 - 50 - 36, 50, NAVY, IVORY).replace('', '')}
    <line x1="0" x2="${W}" y1="${base + 60}" y2="${base + 60}" stroke="${ink}" stroke-opacity=".18"/>
  </svg>
  ${text(SZ.x + 40 + 66, wy - 104, 'LE MAGAZINE DES AFFAIRES INTERNATIONALES', `font:700 15px Mont;letter-spacing:.36em;color:${ink}`)}
  ${text(SZ.x + SZ.w - 40, wy - 104, 'LONDRES&nbsp;&nbsp;·&nbsp;&nbsp;NEW YORK&nbsp;&nbsp;·&nbsp;&nbsp;DUBAÏ&nbsp;&nbsp;·&nbsp;&nbsp;SINGAPOUR&nbsp;&nbsp;·&nbsp;&nbsp;ZURICH', `font:500 14px Mont;letter-spacing:.3em;color:${ink};opacity:.75`, 'right')}
  ${word(wx, wy, ww, ink)}
  ${sig ? text(1280, wy + wh + 52, 'Les clés de l’entrepreneuriat international.', `font:italic 400 46px PlayI;letter-spacing:.01em;color:${ink}`, 'center') : ''}
  ${!sig ? text(1280, wy + wh + 54, 'ÉDITION&nbsp;&nbsp;INTERNATIONALE', `font:600 15px Mont;letter-spacing:.6em;color:${ink};opacity:.7`, 'center') : ''}`;
  return page(IVORY, body);
}

// =====================================================================================
// CONCEPT 4 — INTERNATIONAL BUSINESS, EXPLAINED : structure diagrams, blueprint grid
// =====================================================================================
function concept4(sig) {
  const ACC = '#9A92FF', st = 'stroke="#fff" stroke-width="1.6" fill="none"';
  // entity box echoing the logo: square-dot in the lower-right corner
  const box = (x, y, w, h, label, tag, hi) => `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${hi ? '#fff' : '#120c3e'}" stroke="#fff" stroke-width="1.6"/>
    <rect x="${x + w - 15}" y="${y + h - 15}" width="9" height="9" fill="${hi ? NAVY : ACC}"/>
    <text x="${x + 18}" y="${y + h / 2 + 6}" font-family="MonoM" font-size="17" letter-spacing="3" fill="${hi ? NAVY : '#fff'}">${label}</text>
    ${tag ? `<text x="${x + w - 24}" y="${y + 22}" text-anchor="end" font-family="Mono" font-size="12" letter-spacing="2" fill="${hi ? NAVY : '#fff'}" fill-opacity=".6">${tag}</text>` : ''}`;
  const pct = (x, y, v) => `<text x="${x + 8}" y="${y}" font-family="Mono" font-size="12" letter-spacing="1.5" fill="#fff" fill-opacity=".55">${v}</text>`;
  const node = (x, y, c) => `<circle cx="${x}" cy="${y}" r="40" fill="#120c3e" stroke="#fff" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="50" fill="none" stroke="#fff" stroke-opacity=".2" stroke-dasharray="2 5"/>
    <text x="${x}" y="${y + 7}" text-anchor="middle" font-family="MonoM" font-size="20" letter-spacing="2" fill="#fff">${c}</text>`;
  const flow = (d, label, lx, ly, anchor = 'middle') => `<path d="${d}" stroke="${ACC}" stroke-width="1.8" fill="none" marker-end="url(#ar)"/>
    <text x="${lx}" y="${ly}" text-anchor="${anchor}" font-family="Mono" font-size="12" letter-spacing="2.5" fill="${ACC}">${label}</text>`;

  // FIG.01 — group structure (left)
  const fig1 = `
    ${box(300, 548, 230, 64, 'HOLDING', 'LU', true)}
    <path d="M415,612V672M158,672H692M158,672V738M425,672V738M692,672V738" ${st}/>
    ${pct(158, 714, '100 %')}${pct(425, 714, '100 %')}${pct(692, 714, '100 %')}
    ${box(45, 738, 226, 58, 'OPÉRATIONS', 'FR')}${box(312, 738, 226, 58, 'PI · MARQUES', 'IE')}${box(579, 738, 226, 58, 'TRÉSORERIE', 'AE')}
    <path d="M158,796V846H850" stroke="#fff" stroke-opacity=".35" stroke-dasharray="3 6" fill="none"/>
    <path d="M425,796V846M692,796V846" stroke="#fff" stroke-opacity=".35" stroke-dasharray="3 6" fill="none"/>
    <text x="45" y="886" font-family="Mono" font-size="13" letter-spacing="3" fill="#fff" fill-opacity=".45">FIG. 01 — STRUCTURE DE GROUPE</text>`;
  // FIG.02 — cross-border flows (right)
  const fig2 = `
    ${node(1860, 600, 'FR')}${node(2120, 600, 'LU')}${node(2380, 600, 'AE')}${node(1990, 800, 'SG')}${node(2250, 800, 'US')}
    ${flow('M1906,600H2068', 'DIVIDENDES', 1990, 584)}
    ${flow('M2166,600H2328', 'REDEVANCES', 2250, 584)}
    ${flow('M2092,640L2014,752', 'PRESTATIONS', 2020, 690, 'end')}
    ${flow('M2036,800H2198', 'CONVENTION', 2120, 784)}
    ${flow('M2290,778L2350,644', 'CAPITAL', 2350, 728, 'start')}
    <path d="M1860,646V800H1938" stroke="#fff" stroke-opacity=".35" stroke-dasharray="3 6" fill="none"/>
    <text x="1820" y="886" font-family="Mono" font-size="13" letter-spacing="3" fill="#fff" fill-opacity=".45">FIG. 02 — FLUX TRANSFRONTALIERS</text>`;

  let dots = '';
  for (let x = 16; x < W; x += 32) for (let y = 16; y < H; y += 32) dots += `<circle cx="${x}" cy="${y}" r="1.3"/>`;
  let major = '';
  for (let x = 0; x <= W; x += 160) major += `<line x1="${x}" x2="${x}" y1="0" y2="${H}"/>`;
  for (let y = 0; y <= H; y += 160) major += `<line y1="${y}" y2="${y}" x1="0" x2="${W}"/>`;

  const ms = 124, ww = 700, wh = ww * WORD_RATIO, cx = 1280;
  const my = sig ? 552 : 584, wy = my + ms + 40;
  const body = `
  <div class="abs" style="inset:0;background:linear-gradient(180deg,#0b0728 0%,${NAVY} 30%,#120c3e 50%,${NAVY} 70%,#0b0728 100%)"></div>
  <svg class="layer" width="${W}" height="${H}">
    <defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="${ACC}"/></marker>
      <radialGradient id="cl"><stop offset="0" stop-color="${NAVY}" stop-opacity="1"/><stop offset=".7" stop-color="${NAVY}" stop-opacity=".9"/><stop offset="1" stop-color="${NAVY}" stop-opacity="0"/></radialGradient></defs>
    <g fill="#fff" fill-opacity=".09">${dots}</g>
    <g stroke="#fff" stroke-opacity=".04">${major}</g>
    <ellipse cx="${cx}" cy="720" rx="520" ry="300" fill="url(#cl)"/>
    <!-- dimension line framing the lockup -->
    <path d="M${cx - ww / 2},${wy + wh + 30}V${wy + wh + 46}M${cx + ww / 2},${wy + wh + 30}V${wy + wh + 46}M${cx - ww / 2},${wy + wh + 38}H${cx + ww / 2}" stroke="#fff" stroke-opacity="${sig ? 0 : .3}"/>
    ${fig1}${fig2}
    ${mark(cx - ms / 2, my, ms, WHITE, NAVY)}
  </svg>
  ${word(cx - ww / 2, wy, ww)}
  ${sig ? `
  ${text(cx, wy + wh + 40, 'LE MONDE DES AFFAIRES INTERNATIONALES', 'font:300 24px Mont;letter-spacing:.24em;color:#fff;margin-left:.12em', 'center')}
  ${text(cx, wy + wh + 78, 'EXPLIQUÉ.', `font:700 28px Mont;letter-spacing:.3em;color:${ACC};margin-left:.15em`, 'center')}` : ''}`;
  return page(NAVY, body);
}

// ---------- render ----------
const CONCEPTS = [['01-media-economique-international', concept1], ['02-intelligence-economique', concept2], ['03-magazine-affaires-internationales', concept3], ['04-expertise-pedagogie', concept4]];
const only = process.argv[3];
fs.mkdirSync(path.join(ROOT, 'src'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'output'), { recursive: true });
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
for (const [name, fn] of CONCEPTS) {
  if (only && !name.startsWith(only)) continue;
  for (const sig of [true, false]) {
    const file = path.join(ROOT, 'src', `${name}${sig ? '' : '-nosig'}.html`);
    fs.writeFileSync(file, fn(sig));
    await pg.goto('file://' + file);
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(150);
    await pg.screenshot({ path: path.join(ROOT, 'output', `fynovates-banner-${name}${sig ? '-avec-signature' : '-sans-signature'}.png`) });
    console.log('rendered', name, sig ? 'sig' : 'nosig');
  }
}
await browser.close();
