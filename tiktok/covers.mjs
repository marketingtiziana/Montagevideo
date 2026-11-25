// FYNOVATES — TikTok covers (1080x1920) and profile feed mockup
// usage: node tiktok/covers.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FONTS = path.join(ROOT, '..', 'banners', 'fonts');
const ff = (f) => 'file://' + path.join(FONTS, f);
const WORD = 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'brand/wordmark-3x.png')).toString('base64');
const RATIO = 76 / 1110;
const NAVY = '#0D082E', STONE = '#E7E4DD', WHITE = '#FFFFFF', LAV = '#A49CFF';
const word = (w, c) => `<div style="width:${w}px;height:${(w * RATIO).toFixed(2)}px;background:${c};-webkit-mask:url(${WORD}) no-repeat 0 0/100% 100%;mask:url(${WORD}) no-repeat 0 0/100% 100%"></div>`;
const fonts = `
@font-face{font-family:Mont;src:url(${ff('Montserrat.ttf')})}
@font-face{font-family:Inter;src:url(${ff('Inter.ttf')})}
@font-face{font-family:SrcSerif;src:url(${ff('SourceSerif.ttf')})}
@font-face{font-family:SrcSerifI;src:url(${ff('SourceSerifItalic.ttf')})}`;

// three templates: A navy · B stone · C white
const T = {
  A: { bg: NAVY, fg: WHITE, mute: 'rgba(255,255,255,.62)', rule: 'rgba(255,255,255,.28)', hi: (w) => `<span style="color:${LAV}">${w}</span>` },
  B: { bg: STONE, fg: NAVY, mute: 'rgba(13,8,46,.62)', rule: 'rgba(13,8,46,.25)', hi: (w) => `<span style="background:${NAVY};color:${STONE};padding:0 .12em;box-decoration-break:clone;-webkit-box-decoration-break:clone">${w}</span>` },
  C: { bg: WHITE, fg: NAVY, mute: 'rgba(13,8,46,.55)', rule: 'rgba(13,8,46,.2)', hi: (w) => `<span style="font-family:SrcSerifI;font-weight:400;font-style:italic;letter-spacing:0;font-size:1.12em;line-height:.9">${w}</span>` },
};

export const EPISODES = [
  ['FISCALITÉ', 'Holding : quand devient-elle *vraiment* rentable ?'],
  ['BANQUE', 'Ouvrir un compte pro *à l’étranger*'],
  ['RÉSIDENCE', 'Résidence fiscale : les *3 critères* à connaître'],
  ['STRUCTURATION', 'LLC américaine : le *vrai coût*'],
  ['COMPTABILITÉ', 'Les obligations que les freelances *oublient*'],
  ['EXPATRIATION', 'Partir à l’étranger : *l’erreur n° 1*'],
  ['FISCALITÉ', 'Facturer depuis *l’étranger*'],
  ['STRUCTURATION', 'SASU ou micro : *que choisir* ?'],
  ['BANQUE', 'Pourquoi votre banque *bloque* vos virements'],
  ['RÉSIDENCE', 'Portugal, Espagne ou Dubaï : *bien comparer*'],
  ['COMPTABILITÉ', 'TVA e-commerce : *ce qui change*'],
  ['STRUCTURATION', 'Structurer *avant* de facturer'],
];
const PATTERN = ['A', 'B', 'C', 'C', 'A', 'B', 'B', 'C', 'A', 'A', 'B', 'C'];

function cover(n, cat, title, k) {
  const t = T[k];
  const html = title.replace(/ ([:?])/g, '\u00A0$1').replace(/(\w)-(\w)/g, '$1\u2011$2').replace(/\*(.+?)\*/g, (_, w) => t.hi(w));
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  *{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}
  body{background:${t.bg};color:${t.fg};position:relative;-webkit-font-smoothing:antialiased}
  .a{position:absolute}</style></head><body>
  <div class="a" style="left:90px;top:330px">${word(380, t.fg)}</div>
  <div class="a" style="right:90px;top:322px;font:500 30px Inter;color:${t.mute};font-variant-numeric:tabular-nums">N° ${String(n).padStart(2, '0')}</div>
  <div class="a" style="left:90px;right:90px;top:400px;height:2px;background:${t.rule}"></div>
  <div class="a" style="left:90px;top:470px;font:600 32px Mont;letter-spacing:.32em;color:${t.fg}">${cat}</div>
  <div class="a" style="left:90px;width:900px;top:580px;font:700 120px/1.08 Mont;letter-spacing:-.015em;color:${t.fg};text-wrap:balance">${html}</div>
  <div class="a" style="left:90px;right:90px;top:1500px;height:2px;background:${t.rule}"></div>
  <div class="a" style="left:90px;top:1528px;font:400 32px SrcSerif;color:${t.mute}">Conseil fiscal &amp; structuration internationale</div>
  </body></html>`;
}

function feed(files) {
  const tile = (f, i) => `<div style="aspect-ratio:3/4;overflow:hidden;background:url(data:image/png;base64,${fs.readFileSync(f).toString('base64')}) center/100% auto no-repeat;position:relative">
    <div style="position:absolute;left:8px;bottom:6px;font:600 13px Inter;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.6)">▷ —</div></div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>${fonts}
  *{margin:0;padding:0;box-sizing:border-box}html,body{width:430px;overflow:hidden}body{background:#fff;font-family:Inter;color:#161823}</style></head><body>
  <div style="height:52px;display:flex;align-items:center;justify-content:center;font:600 17px Inter">fynovates</div>
  <div style="display:flex;flex-direction:column;align-items:center;gap:10px;padding:8px 16px 14px">
    <div style="width:96px;height:96px;border-radius:50%;background:${NAVY};display:flex;align-items:center;justify-content:center">${word(70, WHITE)}</div>
    <div style="font:600 17px Inter">@fynovates</div>
    <div style="display:flex;gap:28px;font:13px Inter;color:#666;text-align:center"><div><b style="color:#161823;font-size:16px">—</b><br>Abonnements</div><div><b style="color:#161823;font-size:16px">—</b><br>Abonnés</div><div><b style="color:#161823;font-size:16px">—</b><br>J’aime</div></div>
    <div style="display:flex;gap:8px"><div style="background:#FE2C55;color:#fff;font:600 15px Inter;padding:10px 40px;border-radius:4px">Suivre</div><div style="border:1px solid #ddd;font:600 15px Inter;padding:10px 18px;border-radius:4px">Message</div></div>
    <div style="font:14px/1.4 Inter;text-align:center;max-width:340px">Cabinet de conseil fiscal &amp; structuration internationale.<br>Fiscalité · Comptabilité · Banque · Résidence</div>
  </div>
  <div style="display:flex;border-bottom:1px solid #eee;font:600 14px Inter"><div style="flex:1;text-align:center;padding:10px;border-bottom:2px solid #161823">Vidéos</div><div style="flex:1;text-align:center;padding:10px;color:#999">J’aime</div></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">${files.map(tile).join('')}</div>
  </body></html>`;
}

const out = path.join(ROOT, 'output'), src = path.join(ROOT, 'src');
for (const d of [out, src]) fs.mkdirSync(d, { recursive: true });
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
const files = [];
for (let i = 0; i < EPISODES.length; i++) {
  const [cat, title] = EPISODES[i], k = PATTERN[i];
  const name = `couverture-${String(i + 1).padStart(2, '0')}-${k}`;
  const f = path.join(src, name + '.html');
  fs.writeFileSync(f, cover(i + 1, cat, title, k));
  await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(100);
  const png = path.join(out, `fynovates-tiktok-${name}.png`);
  await pg.screenshot({ path: png }); files.push(png);
}
// TikTok shows the newest video first: feed order = reverse
const fp = await browser.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 3 });
fs.writeFileSync(path.join(src, 'feed.html'), feed([...files].reverse()));
await fp.goto('file://' + path.join(src, 'feed.html')); await fp.evaluate(() => document.fonts.ready);
await fp.screenshot({ path: path.join(out, 'fynovates-tiktok-feed-mockup.png'), fullPage: true });
await browser.close();
console.log('ok', files.length);
