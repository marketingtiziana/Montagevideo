// FYNOVATES — corporate minimalist YouTube banners (2560x1440) + YouTube mockups
// usage: node banners-corporate/build.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FONTS = path.join(ROOT, '..', 'banners', 'fonts');
const W = 2560, H = 1440;
const SZ = { x: 507, y: 508, w: 1546, h: 423 };       // YouTube safe area
const NAVY = '#0D082E', INK = '#0F0A13', WHITE = '#FFFFFF';
const b64 = (p) => fs.readFileSync(path.join(ROOT, p)).toString('base64');
const WORD = 'data:image/png;base64,' + b64('brand/wordmark-3x.png');
const RATIO = 76 / 1110;
const photo = (f) => 'data:image/jpeg;base64,' + b64('photos/' + f);
const ff = (f) => 'file://' + path.join(FONTS, f);

// monogram — geometry measured from the supplied logo (216-unit grid)
const mark = (s, sq, fg) => `<svg width="${s}" height="${s}" viewBox="0 0 216 216" style="display:block">
  <rect width="216" height="216" fill="${sq}"/><rect x="40" y="32" width="31" height="154" fill="${fg}"/>
  <rect x="40" y="32" width="136" height="27" fill="${fg}"/><rect x="40" y="100" width="120" height="25" fill="${fg}"/>
  <rect x="145" y="155" width="31" height="31" fill="${fg}"/></svg>`;
const word = (w, color = WHITE) => `<div style="width:${w}px;height:${(w * RATIO).toFixed(2)}px;background:${color};
  -webkit-mask:url(${WORD}) no-repeat 0 0/100% 100%;mask:url(${WORD}) no-repeat 0 0/100% 100%"></div>`;

const css = `
@font-face{font-family:Mont;src:url(${ff('Montserrat.ttf')})}
@font-face{font-family:Inter;src:url(${ff('Inter.ttf')})}
@font-face{font-family:PlayI;src:url(${ff('PlayfairItalic.ttf')})}
@font-face{font-family:Play;src:url(${ff('Playfair.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:${W}px;height:${H}px;overflow:hidden}
body{position:relative;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
.a{position:absolute}`;
const page = (bg, body) => `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body style="background:${bg}">${body}</body></html>`;
const at = (x, y, html, extra = '') => `<div class="a" style="left:${x}px;top:${y}px;${extra}">${html}</div>`;
const centerX = (y, html, extra = '') => `<div class="a" style="left:0;right:0;top:${y}px;display:flex;justify-content:center;${extra}">${html}</div>`;

// =====================================================================================
// A — CORPORATE PRESTIGE : monumental, symmetric, stone & glass at night
// =====================================================================================
function A(sig) {
  const ww = 1380, wh = ww * RATIO, ms = 128;
  const my = sig ? 540 : 566, wy = my + ms + 46;
  return page(NAVY, `
  <div class="a" style="inset:0;background:url(${photo('A-graded.jpg')}) center/cover;filter:saturate(.9) brightness(.85)"></div>
  <div class="a" style="inset:0;background:linear-gradient(180deg,rgba(13,8,46,.35) 0%,rgba(13,8,46,.55) 34%,rgba(13,8,46,.62) 50%,rgba(13,8,46,.55) 66%,rgba(8,5,28,.85) 100%)"></div>
  <div class="a" style="inset:0;background:radial-gradient(ellipse 52% 38% at 50% 50%,rgba(13,8,46,.72),rgba(13,8,46,0) 100%)"></div>
  ${centerX(my, mark(ms, WHITE, NAVY))}
  ${centerX(wy, word(ww))}
  ${sig ? `
  ${centerX(wy + wh + 44, '<div style="width:72px;height:2px;background:rgba(255,255,255,.75)"></div>')}
  ${centerX(wy + wh + 72, 'L’EXPERTISE AU SERVICE DE L’INTERNATIONAL', 'font:500 27px Mont;letter-spacing:.42em;color:#fff;padding-left:.42em')}` : ''}`);
}

// =====================================================================================
// B — SWISS MINIMALISM : strict grid, asymmetric, monogram as the graphic element
// =====================================================================================
function B(sig) {
  const BG = '#F5F5F7';
  const ms = 423, mx = SZ.x, my = SZ.y;                  // the monogram IS the safe-zone height
  const k = ms / 216, fTop = my + 32 * k, fBot = my + 186 * k;
  const cx = mx + ms + 112, ww = SZ.x + SZ.w - cx;        // text column runs to the safe-zone edge
  const wh = ww * RATIO;
  const lines = ['Comprendre.', 'Structurer.', 'Développer.'];
  const lh = 58, fs = 46;
  // baseline grid: last line's baseline sits on the F's lower edge
  const sigTop = fBot - lh * 3 + 8;
  let grid = '';
  for (let i = 0; i <= 12; i++) { const x = SZ.x + (SZ.w / 12) * i; grid += `<div class="a" style="left:${x}px;top:0;width:1px;height:${H}px;background:rgba(13,8,46,.045)"></div>`; }
  return page(BG, `
  ${grid}
  <div class="a" style="left:0;right:0;top:${fTop}px;height:1px;background:rgba(13,8,46,.14)"></div>
  <div class="a" style="left:0;right:0;top:${fBot}px;height:1px;background:rgba(13,8,46,.14)"></div>
  ${at(mx, my, mark(ms, NAVY, BG))}
  ${at(cx, fTop, word(ww, NAVY))}
  ${sig ? at(cx, sigTop, lines.map(l => `<div style="height:${lh}px">${l}</div>`).join(''), `font:600 ${fs}px/${lh}px Inter;letter-spacing:-.01em;color:${NAVY}`) : ''}`);
}

// =====================================================================================
// C — ARCHITECTURAL IDENTITY : one strong photograph, the brand in the open sky
// =====================================================================================
function C(sig) {
  const ms = 116, ww = 900, wh = ww * RATIO, gap = 44;
  const lockW = ms + gap + ww, lx = (W - lockW) / 2;
  const ly = sig ? 600 : 650;
  return page('#ECECF0', `
  <div class="a" style="inset:0;background:url(${photo('C-graded.jpg')}) center/cover"></div>
  <div class="a" style="inset:0;background:radial-gradient(ellipse 34% 26% at 50% 52%,rgba(244,244,248,.92) 0%,rgba(244,244,248,.6) 55%,rgba(244,244,248,0) 100%)"></div>
  ${at(lx, ly, `<div style="display:flex;align-items:center;gap:${gap}px">${mark(ms, NAVY, WHITE)}${word(ww, NAVY)}</div>`)}
  ${sig ? centerX(ly + ms + 52, 'Votre activité. Une vision internationale.', `font:italic 400 50px PlayI;color:${NAVY};letter-spacing:.005em`) : ''}`);
}

// =====================================================================================
// D — MODERN INSTITUTIONAL : letterhead lockup, absolute restraint
// =====================================================================================
function D(sig) {
  const ms = 156, ww = 820, wh = ww * RATIO;
  const gap = 64, rule = 1;
  const lockW = ms + gap * 2 + rule + ww, lx = (W - lockW) / 2;
  const ly = 720 - ms / 2;
  const tx = lx + ms + gap * 2 + rule;
  const wy = sig ? ly + 22 : ly + ms / 2 - wh / 2;
  return page(INK, `
  <div class="a" style="inset:0;background:linear-gradient(180deg,#120c2c 0%,${NAVY} 50%,#0a0720 100%)"></div>
  <div class="a" style="left:${SZ.x + 60}px;top:${SZ.y + 34}px;width:${SZ.w - 120}px;height:${SZ.h - 68}px;border:1px solid rgba(255,255,255,.16)"></div>
  ${at(lx, ly, mark(ms, WHITE, NAVY))}
  <div class="a" style="left:${lx + ms + gap}px;top:${ly}px;width:1px;height:${ms}px;background:rgba(255,255,255,.4)"></div>
  ${at(tx, wy, word(ww))}
  ${sig ? at(tx, ly + ms - 30, 'L’INTERNATIONAL, AVEC MÉTHODE.', 'font:500 25px/30px Mont;letter-spacing:.36em;color:rgba(255,255,255,.82)') : ''}`);
}

// =====================================================================================
// YouTube channel-page mockups (generic UI, no third-party logos)
// =====================================================================================
function mockDesktop(bannerFile) {
  const img = 'data:image/png;base64,' + fs.readFileSync(bannerFile).toString('base64');
  const bw = 1284, bh = Math.round(bw * 423 / 2560);
  const tab = (t, on) => `<div style="padding:14px 0;margin-right:34px;font:500 15px Inter;color:${on ? '#fff' : '#aaa'};border-bottom:2px solid ${on ? '#fff' : 'transparent'}">${t}</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css.replace(/html,body\{[^}]+\}/, 'html,body{width:1440px;height:900px;overflow:hidden}')}</style></head>
  <body style="background:#0f0f0f;color:#fff;font-family:Inter">
  <div style="height:56px;display:flex;align-items:center;padding:0 24px;gap:18px">
    <div style="width:22px;display:grid;gap:4px">${'<div style="height:2px;background:#fff"></div>'.repeat(3)}</div>
    <div style="font:700 17px Inter;letter-spacing:-.02em">Vidéo</div>
    <div style="margin-left:auto;margin-right:auto;width:560px;height:40px;border:1px solid #303030;border-radius:20px;background:#121212;display:flex;align-items:center;padding:0 18px;color:#888;font:400 15px Inter">Rechercher</div>
    <div style="width:32px;height:32px;border-radius:50%;background:#3a3a3a"></div>
  </div>
  <div style="display:flex">
    <div style="width:72px"></div>
    <div style="width:${bw}px;margin:8px auto 0">
      <div style="width:${bw}px;height:${bh}px;border-radius:12px;overflow:hidden;background:url(${img}) center/${bw}px auto no-repeat"></div>
      <div style="display:flex;gap:24px;margin-top:22px;align-items:center">
        <div style="width:160px;height:160px;border-radius:50%;overflow:hidden;flex:none">${mark(160, NAVY, WHITE)}</div>
        <div>
          <div style="font:700 36px Inter;letter-spacing:-.01em">FYNOVATES</div>
          <div style="font:400 14px Inter;color:#aaa;margin-top:6px">@fynovates · Chaîne officielle</div>
          <div style="font:400 14px Inter;color:#aaa;margin-top:8px">Affaires internationales, fiscalité, banque et structuration.</div>
          <div style="margin-top:14px;display:inline-block;background:#fff;color:#0f0f0f;font:600 14px Inter;padding:10px 18px;border-radius:18px">S’abonner</div>
        </div>
      </div>
      <div style="display:flex;margin-top:18px;border-bottom:1px solid #303030">${tab('Accueil', 1)}${tab('Vidéos')}${tab('Shorts')}${tab('Playlists')}${tab('Posts')}</div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-top:22px">${'<div><div style="aspect-ratio:16/9;border-radius:10px;background:#1f1f1f"></div><div style="height:12px;background:#272727;border-radius:4px;margin-top:12px;width:85%"></div><div style="height:12px;background:#1e1e1e;border-radius:4px;margin-top:8px;width:55%"></div></div>'.repeat(4)}</div>
    </div>
  </div></body></html>`;
}
function mockMobile(bannerFile) {
  const img = 'data:image/png;base64,' + fs.readFileSync(bannerFile).toString('base64');
  const bw = 390, bh = Math.round(bw * 423 / 1546);       // mobile shows the safe area only
  const scale = bw / 1546;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${css.replace(/html,body\{[^}]+\}/, 'html,body{width:390px;height:780px;overflow:hidden}')}</style></head>
  <body style="background:#0f0f0f;color:#fff;font-family:Inter">
  <div style="height:48px;display:flex;align-items:center;padding:0 14px;gap:12px"><div style="font:700 15px Inter">‹</div><div style="font:600 15px Inter">FYNOVATES</div></div>
  <div style="width:${bw - 24}px;height:${Math.round((bw - 24) * 423 / 1546)}px;margin:0 12px;border-radius:10px;overflow:hidden;background:url(${img}) no-repeat;background-size:${Math.round(2560 * (bw - 24) / 1546)}px auto;background-position:${-Math.round(507 * (bw - 24) / 1546)}px ${-Math.round(508 * (bw - 24) / 1546)}px"></div>
  <div style="display:flex;gap:14px;padding:16px 14px;align-items:center">
    <div style="width:72px;height:72px;border-radius:50%;overflow:hidden;flex:none">${mark(72, NAVY, WHITE)}</div>
    <div><div style="font:700 22px Inter">FYNOVATES</div><div style="font:400 12px Inter;color:#aaa;margin-top:4px">@fynovates · Chaîne officielle</div></div>
  </div>
  <div style="margin:0 14px;background:#fff;color:#0f0f0f;text-align:center;font:600 14px Inter;padding:10px;border-radius:18px">S’abonner</div>
  <div style="display:flex;gap:22px;padding:14px;border-bottom:1px solid #303030;margin-top:10px;font:500 14px Inter;color:#aaa"><span style="color:#fff">Accueil</span><span>Vidéos</span><span>Shorts</span><span>Playlists</span></div>
  <div style="margin:16px 14px 0;aspect-ratio:16/9;border-radius:10px;background:#1f1f1f"></div>
  </body></html>`;
}

// ---------- render ----------
const CONCEPTS = [['A-corporate-prestige', A], ['B-minimalisme-suisse', B], ['C-identite-architecturale', C], ['D-institutionnel-moderne', D]];
const only = process.argv[2];
for (const d of ['src', 'output', 'mockups']) fs.mkdirSync(path.join(ROOT, d), { recursive: true });
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
for (const [name, fn] of CONCEPTS) {
  if (only && !name.startsWith(only)) continue;
  for (const sig of [true, false]) {
    const suffix = sig ? 'avec-signature' : 'sans-signature';
    const file = path.join(ROOT, 'src', `${name}-${suffix}.html`);
    fs.writeFileSync(file, fn(sig));
    await pg.goto('file://' + file);
    await pg.evaluate(() => document.fonts.ready);
    await pg.waitForTimeout(200);
    const out = path.join(ROOT, 'output', `fynovates-banniere-${name}-${suffix}.png`);
    await pg.screenshot({ path: out });
    console.log('banner', name, suffix);
    if (sig) {
      for (const [kind, fnm, vw, vh] of [['desktop', mockDesktop, 1440, 900], ['mobile', mockMobile, 390, 780]]) {
        const mp = await browser.newPage({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2 });
        const mf = path.join(ROOT, 'src', `mock-${name}-${kind}.html`);
        fs.writeFileSync(mf, fnm(out));
        await mp.goto('file://' + mf);
        await mp.evaluate(() => document.fonts.ready);
        await mp.screenshot({ path: path.join(ROOT, 'mockups', `mockup-${name}-${kind}.png`) });
        await mp.close();
      }
    }
  }
}
await browser.close();
