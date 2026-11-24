// FYNOVATES — round 5 renderer: node banners-v5/build.mjs [prefix]
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { ROOT, W, H, NAVY, WHITE, css, markSVG, CONCEPTS } from './concepts.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
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
