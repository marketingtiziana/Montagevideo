// FYNOVATES — YouTube banners, round 4 (2560x1440): online entrepreneurs, international structuring
// 1 Global Entrepreneurial Structure · 2 Digital Business Infrastructure
// 3 International Financial & Corporate Advisory · 4 The Borderless Entrepreneur
// usage: node banners-v4/build.mjs [prefix]
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FONTS = path.join(ROOT, '..', 'banners', 'fonts');
const W = 2560, H = 1440;
const SZ = { x: 547, y: 508, w: 1466, r: 2013, b: 931 };   // safe area with a 40 px inner margin on the sides
const NAVY = '#0D082E', INK = '#0F0A13', WHITE = '#FFFFFF';
const WORD = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'brand/wordmark-3x.png')).toString('base64');
const RATIO = 76 / 1110;
const ff = (f) => 'file://' + path.join(FONTS, f);

const markSVG = (s, sq, fg) => `<svg width="${s}" height="${s}" viewBox="0 0 216 216" style="display:block">
  <rect width="216" height="216" fill="${sq}"/><rect x="40" y="32" width="31" height="154" fill="${fg}"/>
  <rect x="40" y="32" width="136" height="27" fill="${fg}"/><rect x="40" y="100" width="120" height="25" fill="${fg}"/>
  <rect x="145" y="155" width="31" height="31" fill="${fg}"/></svg>`;
const word = (w, color = WHITE) => `<div style="width:${w}px;height:${(w * RATIO).toFixed(2)}px;background:${color};
  -webkit-mask:url(${WORD}) no-repeat 0 0/100% 100%;mask:url(${WORD}) no-repeat 0 0/100% 100%"></div>`;
const css = `
@font-face{font-family:Mont;src:url(${ff('Montserrat.ttf')})}
@font-face{font-family:Inter;src:url(${ff('Inter.ttf')})}
@font-face{font-family:Play;src:url(${ff('Playfair.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{position:relative;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.a{position:absolute}`;
const page = (bg, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="background:${bg}">${body}</body></html>`;
const at = (x, y, html, extra = '') => `<div class="a" style="left:${x}px;top:${y}px;${extra}">${html}</div>`;
const row = (y, html, extra = '') => `<div class="a" style="left:0;right:0;top:${y}px;display:flex;justify-content:center;${extra}">${html}</div>`;

// =====================================================================================
// 1 — GLOBAL ENTREPRENEURIAL STRUCTURE : a space frame — the company as a built structure
// =====================================================================================
function spaceFrame() {
  // two-layer space frame (square grid + offset grid below), seen in perspective
  const cam = { x: 0, y: -5.2, z: -9.5 }, f = 1500, cx = 1980, cy = 400;
  const rot = 0.62, tilt = 0.46;
  const proj = ([x, y, z]) => {
    const xr = x * Math.cos(rot) - z * Math.sin(rot), zr = x * Math.sin(rot) + z * Math.cos(rot);
    const yr = y * Math.cos(tilt) - zr * Math.sin(tilt), zz = y * Math.sin(tilt) + zr * Math.cos(tilt);
    const d = zz - cam.z;
    return [cx + (xr - cam.x) * f / d, cy + (yr - cam.y) * f / d, d];
  };
  const N = 11, M = 7, h = 0.72;
  const top = [], bot = [];
  for (let i = 0; i <= N; i++) for (let j = 0; j <= M; j++) top.push([i, 0, j]);
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) bot.push([i + .5, h, j + .5]);
  const T = (i, j) => [i, 0, j], B = (i, j) => [i + .5, h, j + .5];
  const edges = [];
  for (let i = 0; i <= N; i++) for (let j = 0; j <= M; j++) { if (i < N) edges.push([T(i, j), T(i + 1, j), 1]); if (j < M) edges.push([T(i, j), T(i, j + 1), 1]); }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) {
    if (i < N - 1) edges.push([B(i, j), B(i + 1, j), .7]); if (j < M - 1) edges.push([B(i, j), B(i, j + 1), .7]);
    for (const [a, b] of [[0, 0], [1, 0], [0, 1], [1, 1]]) edges.push([B(i, j), T(i + a, j + b), .55]);
  }
  let s = '';
  for (const [a, b, w] of edges) {
    const p = proj(a), q = proj(b), d = (p[2] + q[2]) / 2;
    const o = Math.max(.06, Math.min(.62, 1.25 - d / 16)) * w;
    s += `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${NAVY}" stroke-opacity="${o.toFixed(3)}" stroke-width="${(1.6 * 14 / d).toFixed(2)}"/>`;
  }
  // entities of the group: a few nodes set as solid squares
  for (const [i, j] of [[2, 1], [5, 3], [8, 2], [4, 6], [9, 5]]) {
    const [x, y, d] = proj(T(i, j)); const r = 150 / d;
    s += `<rect x="${(x - r).toFixed(1)}" y="${(y - r).toFixed(1)}" width="${(2 * r).toFixed(1)}" height="${(2 * r).toFixed(1)}" fill="${NAVY}"/>`;
  }
  return s;
}
function S1(sig) {
  const ms = 112, ww = 760, wh = ww * RATIO;
  const my = sig ? 556 : 600, wy = my + ms + 40;
  return page('#FFFFFF', `
  <div class="a" style="inset:0;background:linear-gradient(180deg,#FFFFFF 0%,#F4F4F8 100%)"></div>
  <svg class="a" style="left:0;top:0" width="${W}" height="${H}">${spaceFrame()}</svg>
  <div class="a" style="inset:0;background:linear-gradient(90deg,#FFFFFF 0%,rgba(255,255,255,.96) 30%,rgba(255,255,255,0) 52%)"></div>
  ${at(SZ.x, my, markSVG(ms, NAVY, WHITE))}
  ${at(SZ.x, wy, word(ww, NAVY))}
  ${sig ? at(SZ.x, wy + wh + 40, `<div>Structurez votre entreprise.</div><div style="font-weight:400;color:#5B587A">Pensez international.</div>`, `font:600 38px/50px Inter;letter-spacing:-.01em;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// 2 — DIGITAL BUSINESS INFRASTRUCTURE : the brand as the hub that routes every function
// =====================================================================================
function S2(sig) {
  const ACC = '#A49CFF';
  const ms = 104, ww = 600, wh = ww * RATIO;
  const lx = SZ.x, my = sig ? 548 : 590, wy = my + ms + 36;
  const hubX = 1300, hubY = 720, nodeX = 1760;
  const fns = ['Société', 'Fiscalité', 'Comptabilité', 'Banques', 'Paiements', 'Résidence'];
  const y0 = 556, step = 66;
  let routes = '', nodes = '';
  fns.forEach((t, i) => {
    const y = y0 + i * step, r = 28;
    const mid = 1530 + (i % 2) * 22;
    const dir = y > hubY ? 1 : -1;
    const d = Math.abs(y - hubY) < 2
      ? `M${hubX},${hubY}H${nodeX}`
      : `M${hubX},${hubY}H${mid - r}Q${mid},${hubY} ${mid},${hubY + dir * r}V${y - dir * r}Q${mid},${y} ${mid + r},${y}H${nodeX}`;
    const hi = i === 0 || i === 3;
    routes += `<path d="${d}" fill="none" stroke="${hi ? ACC : '#fff'}" stroke-opacity="${hi ? .9 : .38}" stroke-width="2"/>`;
    nodes += `<rect x="${nodeX - 7}" y="${y - 7}" width="14" height="14" fill="${hi ? ACC : '#fff'}"/>
      <text x="${nodeX + 30}" y="${y + 9}" font-family="Inter" font-weight="500" font-size="30" fill="#fff" fill-opacity="${hi ? 1 : .8}">${t}</text>`;
  });
  // the same system continues quietly beyond the safe area (visible on TV)
  let far = '';
  for (let k = 0; k < 9; k++) { const y = 200 + k * 130; far += `<path d="M2140,${y}H2560" stroke="#fff" stroke-opacity=".06" stroke-width="2"/><rect x="2134" y="${y - 6}" width="12" height="12" fill="#fff" fill-opacity=".08"/>`; }
  for (let k = 0; k < 9; k++) { const y = 200 + k * 130; far += `<path d="M0,${y}H420" stroke="#fff" stroke-opacity=".05" stroke-width="2"/>`; }
  return page(INK, `
  <div class="a" style="inset:0;background:radial-gradient(ellipse 70% 60% at 55% 50%,#171030 0%,${INK} 75%)"></div>
  <svg class="a" style="left:0;top:0" width="${W}" height="${H}">
    ${far}
    <path d="M${lx + ww + 40},${hubY}H${hubX}" stroke="#fff" stroke-opacity=".38" stroke-width="2"/>
    ${routes}
    <rect x="${hubX - 11}" y="${hubY - 11}" width="22" height="22" fill="${INK}" stroke="#fff" stroke-width="2"/>
    ${nodes}
  </svg>
  ${at(lx, my, markSVG(ms, WHITE, INK))}
  ${at(lx, wy, word(ww))}
  ${sig ? at(lx, wy + wh + 34, `<div>L’infrastructure de votre</div><div>développement international.</div>`, 'font:500 32px/42px Inter;color:rgba(255,255,255,.85)') : ''}`);
}

// =====================================================================================
// 3 — INTERNATIONAL FINANCIAL & CORPORATE ADVISORY : colonnade, champagne hairlines
// =====================================================================================
function S3(sig) {
  const GOLD = '#C9B98F';
  const ms = 118, ww = 1000, wh = ww * RATIO;
  const my = sig ? 540 : 580, wy = my + ms + 40;
  // fluted pilasters across the whole width (institutional rhythm)
  let flutes = '';
  for (let x = 0; x < W; x += 64) flutes += `<div class="a" style="left:${x}px;top:0;width:64px;height:${H}px;background:linear-gradient(90deg,rgba(255,255,255,.035),rgba(255,255,255,0) 40%,rgba(0,0,0,.12) 100%)"></div>`;
  const words = ['Fiscalité.', 'Structure.', 'Finance.', 'International.'];
  const sigRow = `<div style="display:flex;align-items:center;font:500 26px Mont;letter-spacing:.3em;text-transform:uppercase;color:#fff">
    ${words.map((t, i) => `${i ? `<div style="width:1px;height:30px;background:${GOLD};margin:0 34px"></div>` : ''}<div style="padding-left:.3em">${t}</div>`).join('')}</div>`;
  return page(NAVY, `
  ${flutes}
  <div class="a" style="inset:0;background:radial-gradient(ellipse 48% 40% at 50% 50%,rgba(13,8,46,.94) 0%,rgba(13,8,46,.75) 60%,rgba(13,8,46,.35) 100%)"></div>
  <div class="a" style="left:0;right:0;top:${SZ.y - 40}px;height:1px;background:${GOLD};opacity:.55"></div>
  <div class="a" style="left:0;right:0;top:${SZ.b + 40}px;height:1px;background:${GOLD};opacity:.55"></div>
  ${row(my, markSVG(ms, WHITE, NAVY))}
  ${row(wy, word(ww))}
  ${sig ? row(wy + wh + 50, sigRow) : row(wy + wh + 50, `<div style="width:96px;height:1px;background:${GOLD}"></div>`)}`);
}

// =====================================================================================
// 4 — THE BORDERLESS ENTREPRENEUR : one continuous line through every border
// =====================================================================================
function S4(sig) {
  const ms = 96, ww = 560, wh = ww * RATIO;
  const cities = ['Paris', 'Lisbonne', 'Londres', 'Dubaï', 'Singapour', 'Montréal'];
  const lineY = 858;
  const x0 = SZ.x + 40, x1 = SZ.r - 40, gap = (x1 - x0) / (cities.length - 1);
  let borders = '', marks = '';
  cities.forEach((c, i) => {
    const x = x0 + i * gap;
    borders += `<line x1="${x}" x2="${x}" y1="0" y2="${H}" stroke="${NAVY}" stroke-opacity=".16" stroke-width="1.5" stroke-dasharray="3 9"/>`;
    marks += `<rect x="${x - 8}" y="${lineY - 8}" width="16" height="16" fill="${NAVY}"/>
      <text x="${x}" y="${lineY - 26}" text-anchor="middle" font-family="Inter" font-weight="500" font-size="29" fill="${NAVY}" fill-opacity=".8">${c}</text>`;
  });
  const my = 548, ly = my;
  return page('#EEF1F7', `
  <div class="a" style="inset:0;background:linear-gradient(180deg,#E6EAF3 0%,#F4F6FA 55%,#EAEDF4 100%)"></div>
  <svg class="a" style="left:0;top:0" width="${W}" height="${H}">
    ${borders}
    <line x1="0" x2="${W}" y1="${lineY}" y2="${lineY}" stroke="${NAVY}" stroke-width="3"/>
    ${marks}
  </svg>
  ${at(SZ.x, ly, `<div style="display:flex;align-items:center;gap:36px">${markSVG(ms, NAVY, WHITE)}${word(ww, NAVY)}</div>`)}
  ${sig ? at(SZ.r, ly + 4, `<div>Votre entreprise n’a pas de frontières.</div><div style="font-weight:600">Sa structure doit être maîtrisée.</div>`, `transform:translateX(-100%);text-align:right;font:400 38px/50px Inter;color:${NAVY};white-space:nowrap`) : ''}`);
}

// ---------- YouTube channel-page mockup (generic UI, no third-party logos) ----------
function mock(bannerFile) {
  const img = 'data:image/png;base64,' + fs.readFileSync(bannerFile).toString('base64');
  const bw = 1284, bh = Math.round(bw * 423 / 2560);
  const tab = (t, on) => `<div style="padding:14px 0;margin-right:34px;font:500 15px Inter;color:${on ? '#fff' : '#aaa'};border-bottom:2px solid ${on ? '#fff' : 'transparent'}">${t}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css.replace(/html,body\{[^}]+\}/, 'html,body{width:1440px;height:760px;overflow:hidden}')}</style></head>
  <body style="background:#0f0f0f;color:#fff;font-family:Inter">
  <div style="height:56px;display:flex;align-items:center;padding:0 24px;gap:18px">
    <div style="width:22px;display:grid;gap:4px">${'<div style="height:2px;background:#fff"></div>'.repeat(3)}</div>
    <div style="margin-left:auto;margin-right:auto;width:560px;height:40px;border:1px solid #303030;border-radius:20px;background:#121212;display:flex;align-items:center;padding:0 18px;color:#888;font:400 15px Inter">Rechercher</div>
    <div style="width:32px;height:32px;border-radius:50%;background:#3a3a3a"></div></div>
  <div style="width:${bw}px;margin:8px auto 0;padding-left:40px;box-sizing:content-box">
    <div style="width:${bw}px;height:${bh}px;border-radius:12px;overflow:hidden;background:url(${img}) center/${bw}px auto no-repeat"></div>
    <div style="display:flex;gap:24px;margin-top:22px;align-items:center">
      <div style="width:160px;height:160px;border-radius:50%;overflow:hidden;flex:none">${markSVG(160, NAVY, WHITE)}</div>
      <div><div style="font:700 36px Inter">FYNOVATES</div>
        <div style="font:400 14px Inter;color:#aaa;margin-top:6px">@fynovates · Chaîne officielle</div>
        <div style="margin-top:14px;display:inline-block;background:#fff;color:#0f0f0f;font:600 14px Inter;padding:10px 18px;border-radius:18px">S’abonner</div></div></div>
    <div style="display:flex;margin-top:18px;border-bottom:1px solid #303030">${tab('Accueil', 1)}${tab('Vidéos')}${tab('Shorts')}${tab('Playlists')}</div>
  </div></body></html>`;
}

const CONCEPTS = [['1-global-entrepreneurial-structure', S1], ['2-digital-business-infrastructure', S2], ['3-financial-corporate-advisory', S3], ['4-borderless-entrepreneur', S4]];
const only = process.argv[2];
for (const d of ['src', 'output', 'mockups']) fs.mkdirSync(path.join(ROOT, d), { recursive: true });
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
for (const [name, fn] of CONCEPTS) {
  if (only && !name.startsWith(only)) continue;
  for (const sig of [true, false]) {
    const suffix = sig ? 'avec-slogan' : 'sans-slogan';
    const file = path.join(ROOT, 'src', `${name}-${suffix}.html`);
    fs.writeFileSync(file, fn(sig));
    await pg.goto('file://' + file);
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(200);
    const out = path.join(ROOT, 'output', `fynovates-banniere-${name}-${suffix}.png`);
    await pg.screenshot({ path: out });
    if (sig) {
      const mp = await browser.newPage({ viewport: { width: 1440, height: 760 }, deviceScaleFactor: 2 });
      const mf = path.join(ROOT, 'src', `mock-${name}.html`);
      fs.writeFileSync(mf, mock(out));
      await mp.goto('file://' + mf);
      await mp.evaluate(() => document.fonts.ready);
      await mp.screenshot({ path: path.join(ROOT, 'mockups', `mockup-${name}.png`) });
      await mp.close();
    }
    console.log(name, suffix);
  }
}
await browser.close();
