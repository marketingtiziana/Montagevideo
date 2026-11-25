// FYNOVATES — YouTube banners, round 3 (2560x1440)
// 1 Signature Identity · 2 Global Architecture · 3 Executive Journal · 4 Abstract Structure
// usage: node banners-v3/build.mjs [prefix]
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FONTS = path.join(ROOT, '..', 'banners', 'fonts');
const W = 2560, H = 1440;
const SZ = { x: 507, y: 508, w: 1546, h: 423, r: 2053, b: 931 };
const NAVY = '#0D082E', INK = '#0F0A13', WHITE = '#FFFFFF';
const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString('base64');
const WORD = 'data:image/png;base64,' + b64('brand/wordmark-3x.png');
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
@font-face{font-family:PlayI;src:url(${ff('PlayfairItalic.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{position:relative;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.a{position:absolute}`;
const page = (bg, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="background:${bg}">${body}</body></html>`;
const at = (x, y, html, extra = '') => `<div class="a" style="left:${x}px;top:${y}px;${extra}">${html}</div>`;
const row = (y, html, extra = '') => `<div class="a" style="left:0;right:0;top:${y}px;display:flex;justify-content:center;${extra}">${html}</div>`;

// =====================================================================================
// 1 — SIGNATURE IDENTITY : the monogram as architecture, the name at full measure
// =====================================================================================
function S1(sig) {
  // the F of the monogram enlarged into a tone-on-tone supergraphic (same proportions, 216-unit grid)
  const k = 9.2, gx = 1180, gy = -150;                     // F spans the full height and bleeds off
  const F = (x, y, w, h, fill) => `<rect x="${gx + x * k}" y="${gy + y * k}" width="${w * k}" height="${h * k}" fill="${fill}"/>`;
  const tone = '#1B1439';
  const sup = `<svg class="a" style="left:0;top:0" width="${W}" height="${H}">
    ${F(40, 32, 31, 154, tone)}${F(40, 32, 136, 27, tone)}${F(40, 100, 120, 25, tone)}${F(145, 155, 31, 31, tone)}</svg>`;
  const ww = (SZ.w - 80), wh = ww * RATIO;                        // the wordmark at the full width of the safe area
  const wy = sig ? 700 : 724;
  const ms = 104;
  return page(INK, `
  <div class="a" style="inset:0;background:radial-gradient(ellipse 80% 70% at 60% 45%,#16102c 0%,${INK} 70%)"></div>
  ${sup}
  ${at((SZ.x + 40), wy - ms - 48, markSVG(ms, WHITE, INK))}
  ${at((SZ.x + 40), wy, word(ww))}
  ${sig ? at((SZ.r - 40), wy + wh + 46, 'LA PRÉCISION POUR SIGNATURE', 'transform:translateX(-100%);font:500 28px Mont;letter-spacing:.46em;color:rgba(255,255,255,.88);white-space:nowrap;margin-right:-.46em') : ''}
  <div class="a" style="left:${(SZ.x + 40) + ms + 40}px;top:${wy - 48 - ms / 2}px;width:${(SZ.w - 80) - ms - 40}px;height:1px;background:rgba(255,255,255,.22)"></div>`);
}

// =====================================================================================
// 2 — GLOBAL ARCHITECTURE : the monogram at the crossing of the sky, the name on a plinth
// =====================================================================================
function S2(sig) {
  const img = 'data:image/jpeg;base64,' + b64('photos/G-graded.jpg');
  const plinth = 700, ms = 140, ww = 980, wh = ww * RATIO;
  const my = 600 - ms / 2;
  const wy = sig ? plinth + 36 : plinth + 70;
  return page(NAVY, `
  <div class="a" style="inset:0;background:url(${img}) center/cover"></div>
  <div class="a" style="inset:0;background:linear-gradient(90deg,rgba(13,8,46,.55),rgba(13,8,46,.12) 38%,rgba(13,8,46,.12) 62%,rgba(13,8,46,.55))"></div>
  <div class="a" style="left:0;right:0;top:${plinth}px;bottom:0;background:${NAVY}"></div>
  <div class="a" style="left:0;right:0;top:${plinth}px;height:2px;background:rgba(255,255,255,.55)"></div>
  ${row(my, `<div style="box-shadow:0 24px 60px rgba(13,8,46,.35)">${markSVG(ms, NAVY, WHITE)}</div>`)}
  ${row(wy, word(ww))}
  ${sig ? row(wy + wh + 30, 'Bâtir à l’échelle internationale.', 'font:italic 400 40px PlayI;color:rgba(255,255,255,.9)') : ''}`);
}

// =====================================================================================
// 3 — EXECUTIVE JOURNAL : a serif statement set like the cover of an annual report
// =====================================================================================
function S3(sig) {
  const PAPER = '#F3F2EE';
  const colX = 1660, ms = 128, cw = (SZ.r - 40) - colX - 56;
  const top = 548, bot = 892;
  const rule = (y, w = 1) => `<div class="a" style="left:${(SZ.x + 40)}px;width:${(SZ.w - 80)}px;top:${y}px;height:${w}px;background:${NAVY}"></div>`;
  const left = sig
    ? at((SZ.x + 40), top + 46, `<div>L’exigence des affaires</div><div style="font-family:PlayI;font-style:italic">internationales.</div>`, `font:400 100px/112px Play;color:${NAVY};letter-spacing:-.012em`)
    : at((SZ.x + 40), (top + bot) / 2 - (1040 * RATIO) / 2, word(1040, NAVY));
  return page(PAPER, `
  ${rule(top - 8, 3)}${rule(top)}
  ${rule(bot)}
  <div class="a" style="left:${colX}px;top:${top + 34}px;width:1px;height:${bot - top - 68}px;background:rgba(13,8,46,.35)"></div>
  ${left}
  ${at(colX + 56, top + 46, markSVG(ms, NAVY, PAPER))}
  ${at(colX + 56, bot - 46 - cw * RATIO, word(cw, NAVY))}`);
}

// =====================================================================================
// 4 — ABSTRACT STRUCTURE : white monoliths, one navy cube — the point of the F
// =====================================================================================
function iso(boxes, ox, oy, s) {
  const c = Math.cos(Math.PI / 6), sn = Math.sin(Math.PI / 6);
  const P = (x, y, z) => [ox + (x - y) * c * s, oy + (x + y) * sn * s - z * s];
  const pts = (a) => a.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  let shadows = '', solids = '';
  boxes.sort((a, b) => (a.x + a.y) - (b.x + b.y));
  for (const bx of boxes) {
    const { x, y, w, d, h } = bx;
    // long soft shadow cast toward +x (light from the upper left)
    const L = h * 1.15;
    shadows += `<polygon points="${pts([P(x + w, y, 0), P(x + w + L, y + L * .35, 0), P(x + w + L, y + d + L * .35, 0), P(x + w, y + d, 0), P(x, y + d, 0)])}" fill="url(#sh)"/>`;
    const top = [P(x, y, h), P(x + w, y, h), P(x + w, y + d, h), P(x, y + d, h)];
    const left = [P(x, y + d, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x, y + d, h)];
    const right = [P(x + w, y, 0), P(x + w, y + d, 0), P(x + w, y + d, h), P(x + w, y, h)];
    const [ct, cl, cr] = bx.navy ? ['#2A2366', '#0D082E', '#070418'] : ['#FBFBFD', '#E9E9EF', '#C9C9D5'];
    solids += `<polygon points="${pts(left)}" fill="${cl}"/><polygon points="${pts(right)}" fill="${cr}"/><polygon points="${pts(top)}" fill="${ct}"/>`;
  }
  return shadows + solids;
}
function S4(sig) {
  const BG = '#DFE0E6';
  // a stepped composition of slabs on a common plinth; the small navy cube is the "point"
  const boxes = [
    { x: 0, y: 0, w: 2.2, d: 2.2, h: 7.2 },
    { x: 2.8, y: 0, w: 2.2, d: 2.2, h: 5.0 },
    { x: 5.6, y: 0, w: 2.2, d: 2.2, h: 3.0 },
    { x: 0, y: 2.8, w: 2.2, d: 2.2, h: 4.0 },
    { x: 2.8, y: 2.8, w: 2.2, d: 2.2, h: 1.6 },
    { x: 5.9, y: 3.1, w: 1.6, d: 1.6, h: 1.6, navy: true },
  ];
  const svg = `<svg class="a" style="left:0;top:0" width="${W}" height="${H}">
    <defs><linearGradient id="sh" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9FA0B3" stop-opacity=".55"/><stop offset="1" stop-color="#9FA0B3" stop-opacity="0"/></linearGradient></defs>
    ${iso(boxes, 1700, 500, 58)}</svg>`;
  const ms = 112, ww = 760, wh = ww * RATIO;
  const lx = SZ.x + 20, my = sig ? 560 : 590, wy = my + ms + 42;
  return page(BG, `
  <div class="a" style="inset:0;background:radial-gradient(ellipse 70% 80% at 70% 55%,#ECEDF1 0%,${BG} 60%,#D3D4DC 100%)"></div>
  ${svg}
  ${at(lx, my, markSVG(ms, NAVY, WHITE))}
  ${at(lx, wy, word(ww, NAVY))}
  ${sig ? at(lx, wy + wh + 40, 'Structurer l’international.', `font:500 40px Inter;letter-spacing:-.005em;color:${NAVY}`) : ''}`);
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

const CONCEPTS = [['1-signature-identity', S1], ['2-global-architecture', S2], ['3-executive-journal', S3], ['4-abstract-structure', S4]];
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
