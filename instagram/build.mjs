// FYNOVATES — Instagram kit: feed posts (1080x1350), carousel slide, Reels covers (1080x1920),
// story highlight covers (1080x1920) and a profile mockup.  usage: node instagram/build.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FONTS = path.join(ROOT, '..', 'banners', 'fonts');
const ff = (f) => 'file://' + path.join(FONTS, f);
const b64 = (f, t = 'png') => `data:image/${t};base64,` + fs.readFileSync(path.join(ROOT, 'assets', f)).toString('base64');
const WORD = b64('wordmark-3x.png'), CUT = b64('portrait_cutout.png'), PHOTO = b64('portrait_original.jpg', 'jpeg');
const RATIO = 76 / 1110;
const NAVY = '#0D082E', STONE = '#E7E4DD', WHITE = '#FFFFFF', LAV = '#A49CFF';
const word = (w, c) => `<div style="width:${w}px;height:${(w * RATIO).toFixed(2)}px;background:${c};-webkit-mask:url(${WORD}) no-repeat 0 0/100% 100%;mask:url(${WORD}) no-repeat 0 0/100% 100%"></div>`;
const base = (w, h, bg, fg, body) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Mont;src:url(${ff('Montserrat.ttf')})}@font-face{font-family:Inter;src:url(${ff('Inter.ttf')})}
@font-face{font-family:SrcSerif;src:url(${ff('SourceSerif.ttf')})}@font-face{font-family:SrcSerifI;src:url(${ff('SourceSerifItalic.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:${bg};color:${fg};position:relative;-webkit-font-smoothing:antialiased}.a{position:absolute}
.t{font:700 96px/1.08 Mont;letter-spacing:-.015em;text-wrap:balance}
.cat{font:600 28px Mont;letter-spacing:.32em}
.sig{font:400 30px SrcSerif}
</style></head><body>${body}</body></html>`;
const fix = (s) => s.replace(/ ([:?!;»])/g, ' $1').replace(/« /g, '« ').replace(/(\w)-(\w)/g, '$1‑$2');
const THEME = {
  navy: { bg: NAVY, fg: WHITE, mute: 'rgba(255,255,255,.62)', rule: 'rgba(255,255,255,.28)', hi: (w) => `<span style="color:${LAV}">${w}</span>` },
  stone: { bg: STONE, fg: NAVY, mute: 'rgba(13,8,46,.62)', rule: 'rgba(13,8,46,.25)', hi: (w) => `<span style="background:${NAVY};color:${STONE};padding:0 .12em;-webkit-box-decoration-break:clone">${w}</span>` },
  white: { bg: WHITE, fg: NAVY, mute: 'rgba(13,8,46,.55)', rule: 'rgba(13,8,46,.2)', hi: (w) => `<span style="font-family:SrcSerifI;font-weight:400;font-size:1.12em;line-height:.9">${w}</span>` },
};
const hi = (t, s) => fix(s).replace(/\*(.+?)\*/g, (_, w) => t.hi(w.split(' ').length <= 2 ? w.replace(/ /g, '\u00A0') : w));
const header = (t, right) => `
  <div class="a" style="left:90px;top:90px">${word(320, t.fg)}</div>
  <div class="a" style="right:90px;top:84px;font:500 26px Inter;color:${t.mute}">${right || ''}</div>
  <div class="a" style="left:90px;right:90px;top:150px;height:2px;background:${t.rule}"></div>`;
const footer = (t, txt = 'Conseil fiscal &amp; structuration internationale') => `
  <div class="a" style="left:90px;right:90px;top:1196px;height:2px;background:${t.rule}"></div>
  <div class="a sig" style="left:90px;top:1222px;color:${t.mute}">${txt}</div>`;

// ---------------- feed post templates (1080x1350) ----------------
const P = {
  // typographic topic post
  sujet: (th, cat, title) => { const t = THEME[th]; return base(1080, 1350, t.bg, t.fg, `${header(t)}
    <div class="a cat" style="left:90px;top:220px">${cat}</div>
    <div class="a t" style="left:90px;width:900px;top:320px">${hi(t, title)}</div>${footer(t)}`); },
  // Tiziana cut-out, title on the left
  portrait: (th, cat, title) => { const t = THEME[th]; return base(1080, 1350, t.bg, t.fg, `${header(t)}
    <img class="a" src="${CUT}" style="right:-170px;bottom:0;height:1020px">
    <div class="a" style="left:0;right:0;bottom:0;height:300px;background:linear-gradient(180deg,${t.bg}00,${t.bg} 85%)"></div>
    <div class="a cat" style="left:90px;top:220px">${cat}</div>
    <div class="a" style="left:90px;width:500px;top:310px;font:700 66px/1.12 Mont;letter-spacing:-.01em">${hi(t, title)}</div>
    <div class="a" style="left:90px;top:1220px;font:500 28px Inter;color:${t.mute}">Tiziana · FYNOVATES</div>`); },
  // full photo + white panel
  photo: (th, cat, title) => { const t = THEME[th]; return base(1080, 1350, t.bg, t.fg, `
    <div class="a" style="left:0;top:0;width:1080px;height:860px;background:url(${PHOTO}) center 18%/cover"></div>
    <div class="a cat" style="left:90px;top:930px">${cat}</div>
    <div class="a" style="right:90px;top:938px">${word(260, NAVY)}</div>
    <div class="a" style="left:90px;width:900px;top:1000px;font:700 70px/1.12 Mont;letter-spacing:-.01em">${hi(t, title)}</div>`); },
  // quote
  citation: (th, quote, who) => { const t = THEME[th]; return base(1080, 1350, t.bg, t.fg, `${header(t)}
    <div class="a" style="left:80px;top:190px;font:400 260px/1 SrcSerif;color:${t.fg};opacity:.25">«</div>
    <div class="a" style="left:90px;width:900px;top:420px;font:400 76px/1.2 SrcSerif;letter-spacing:-.005em">${hi(t, quote)}</div>
    <div class="a" style="left:90px;top:1060px;font:500 28px Inter;color:${t.mute}">${who}</div>${footer(t)}`); },
  // carousel cover
  carrousel: (th, cat, title, n) => { const t = THEME[th]; return base(1080, 1350, t.bg, t.fg, `${header(t, `1 / ${n}`)}
    <div class="a cat" style="left:90px;top:220px">GUIDE · ${cat}</div>
    <div class="a t" style="left:90px;width:900px;top:320px">${hi(t, title)}</div>
    <div class="a" style="right:90px;top:1100px;font:600 30px Inter;color:${t.fg}">Faites défiler →</div>${footer(t)}`); },
  // numbered checklist
  checklist: (th, cat, title, items) => { const t = THEME[th]; return base(1080, 1350, t.bg, t.fg, `${header(t)}
    <div class="a cat" style="left:90px;top:220px">${cat}</div>
    <div class="a" style="left:90px;width:900px;top:300px;font:700 78px/1.1 Mont;letter-spacing:-.01em">${hi(t, title)}</div>
    <div class="a" style="left:90px;right:90px;top:640px">${items.map((it, i) => `<div style="display:flex;gap:36px;align-items:baseline;padding:22px 0;border-top:2px solid ${t.rule}">
      <div style="font:500 30px Inter;color:${t.mute};font-variant-numeric:tabular-nums">${String(i + 1).padStart(2, '0')}</div><div style="font:500 40px Inter">${fix(it)}</div></div>`).join('')}</div>${footer(t)}`); },
};
// carousel inner slide example
const slide = (th, k, n, title, text) => { const t = THEME[th]; return base(1080, 1350, t.bg, t.fg, `${header(t, `${k} / ${n}`)}
  <div class="a" style="left:90px;top:230px;font:500 150px/1 Mont;color:${t.mute}">${String(k - 1).padStart(2, '0')}</div>
  <div class="a" style="left:90px;width:900px;top:430px;font:700 72px/1.12 Mont">${hi(t, title)}</div>
  <div class="a" style="left:90px;width:860px;top:640px;font:400 40px/1.5 SrcSerif">${fix(text)}</div>${footer(t)}`); };

export const FEED = [  // chronological order: 01 = oldest
  ['sujet', 'navy', 'FISCALITÉ', 'Holding : quand devient-elle *vraiment* rentable ?'],
  ['portrait', 'stone', 'À PROPOS', 'Je structure les entreprises *qui n’ont pas de frontières*.'],
  ['carrousel', 'white', 'BANQUE', 'Ouvrir un compte pro *à l’étranger* en 5 étapes', 6],
  ['citation', 'stone', 'La bonne structure, c’est celle qui *suit votre vie*, pas l’inverse.', 'Tiziana · FYNOVATES'],
  ['sujet', 'white', 'RÉSIDENCE', 'Résidence fiscale : les *3 critères* à connaître'],
  ['checklist', 'navy', 'EXPATRIATION', 'Avant de partir : *4 vérifications*', ['Votre résidence fiscale', 'Votre couverture sociale', 'Vos comptes bancaires', 'La structure de votre société']],
  ['photo', 'white', 'RENCONTRE', 'Qui est derrière *FYNOVATES* ?'],
  ['sujet', 'stone', 'STRUCTURATION', 'LLC américaine : le *vrai coût*'],
  ['sujet', 'navy', 'COMPTABILITÉ', 'TVA e-commerce : *ce qui change*'],
  ['carrousel', 'navy', 'FISCALITÉ', 'Facturer depuis l’étranger : *le guide*', 7],
  ['portrait', 'white', 'CONSEIL', 'Avant de choisir un pays, *choisissez une stratégie*.'],
  ['sujet', 'stone', 'STRUCTURATION', 'Structurer *avant* de facturer'],
];
const REELS = [
  ['navy', 'FISCALITÉ', 'Les *3 erreurs* des freelances à l’étranger', true],
  ['stone', 'BANQUE', 'Pourquoi votre banque *bloque* vos virements', false],
  ['white', 'RÉSIDENCE', 'Portugal, Espagne ou Dubaï : *bien comparer*', true],
];
const HIGHLIGHTS = [['Fiscalité', 'navy'], ['Banque', 'navy'], ['Résidence', 'navy'], ['Structure', 'navy'], ['Avis', 'navy'], ['À propos', 'navy']];

const reel = (th, cat, title, withPortrait) => { const t = THEME[th]; return base(1080, 1920, t.bg, t.fg, `
  <div class="a" style="left:90px;top:330px">${word(380, t.fg)}</div>
  <div class="a" style="left:90px;right:90px;top:400px;height:2px;background:${t.rule}"></div>
  <div class="a cat" style="left:90px;top:470px;font-size:32px">${cat}</div>
  <div class="a t" style="left:90px;width:900px;top:570px;font-size:${withPortrait ? 100 : 118}px">${hi(t, title)}</div>
  ${withPortrait ? `<img class="a" src="${CUT}" style="right:-90px;bottom:0;height:900px"><div class="a" style="left:0;right:0;bottom:0;height:200px;background:linear-gradient(180deg,${t.bg}00,${t.bg})"></div>
  <div class="a" style="left:90px;top:1500px;font:500 30px Inter;color:${t.mute}">Tiziana · FYNOVATES</div>` : `<div class="a sig" style="left:90px;top:1560px;color:${t.mute};font-size:32px">Conseil fiscal &amp; structuration internationale</div>`}`); };
const highlight = (label, th) => { const t = THEME[th]; return base(1080, 1920, t.bg, t.fg, `
  <div class="a" style="left:140px;top:560px;width:800px;height:800px;border-radius:50%;border:3px solid ${t.rule};display:flex;align-items:center;justify-content:center;flex-direction:column;gap:30px">
    <div style="font:italic 400 ${label.length > 8 ? 120 : 140}px SrcSerifI">${label}</div>
    <div style="width:80px;height:2px;background:${t.rule}"></div></div>`); };

function profile(posts, hl) {
  const img = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
  return base(430, 1600, '#fff', '#000', `<style>html,body{height:auto!important}</style><div style="position:relative;font-family:Inter">
  <div style="height:50px;display:flex;align-items:center;padding:0 16px;font:700 20px Inter">fynovates</div>
  <div style="display:flex;align-items:center;gap:24px;padding:6px 16px">
    <div style="width:86px;height:86px;border-radius:50%;background:${NAVY};display:flex;align-items:center;justify-content:center;flex:none">${word(64, WHITE)}</div>
    <div style="display:flex;gap:22px;text-align:center;font:13px Inter">${['publications', 'followers', 'suivi(e)s'].map(l => `<div><b style="font-size:16px">—</b><br>${l}</div>`).join('')}</div></div>
  <div style="padding:10px 16px 4px;font:14px/1.4 Inter"><b>FYNOVATES</b><br><span style="color:#737373">Service de conseil</span><br>Cabinet de conseil fiscal &amp; structuration internationale.<br>Fiscalité · Comptabilité · Banque · Résidence · Expatriation<br><span style="color:#00376b">fynovates.com</span></div>
  <div style="display:flex;gap:6px;padding:10px 16px"><div style="flex:1;background:#efefef;border-radius:8px;text-align:center;padding:8px;font:600 14px Inter">Suivre</div><div style="flex:1;background:#efefef;border-radius:8px;text-align:center;padding:8px;font:600 14px Inter">Contacter</div></div>
  <div style="display:flex;gap:14px;padding:8px 16px 14px;overflow:hidden">${hl.map(([f, l]) => `<div style="text-align:center;font:12px Inter;flex:none;width:64px"><div style="width:64px;height:64px;border-radius:50%;border:1px solid #dbdbdb;padding:3px"><div style="width:100%;height:100%;border-radius:50%;background:url(${img(f)}) center/170% auto"></div></div><div style="margin-top:6px">${l}</div></div>`).join('')}</div>
  <div style="display:flex;border-top:1px solid #dbdbdb;font:600 13px Inter"><div style="flex:1;text-align:center;padding:10px;border-bottom:1px solid #000">Publications</div><div style="flex:1;text-align:center;padding:10px;color:#999">Reels</div><div style="flex:1;text-align:center;padding:10px;color:#999">Identifié(e)</div></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">${posts.map(f => `<div style="aspect-ratio:3/4;background:url(${img(f)}) center/cover"></div>`).join('')}</div></div>`);
}

const out = path.join(ROOT, 'output'), src = path.join(ROOT, 'src');
for (const d of [out, src]) fs.mkdirSync(d, { recursive: true });
const browser = await chromium.launch();
async function shot(html, name, w, h, scale = 1) {
  const pg = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  const f = path.join(src, name + '.html'); fs.writeFileSync(f, html);
  await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(120);
  const png = path.join(out, `fynovates-instagram-${name}.png`);
  await pg.screenshot({ path: png, fullPage: true }); await pg.close(); return png;
}
const posts = [];
for (let i = 0; i < FEED.length; i++) {
  const [kind, th, ...args] = FEED[i];
  posts.push(await shot(P[kind](th, ...args), `post-${String(i + 1).padStart(2, '0')}-${kind}`, 1080, 1350));
}
await shot(slide('white', 2, 6, 'Choisir *le bon pays*', 'La banque dépend souvent du pays de votre société, pas du vôtre. Commencez par aligner les deux : siège, activité et résidence.'), 'carrousel-slide-02', 1080, 1350);
for (let i = 0; i < REELS.length; i++) await shot(reel(...REELS[i]), `reel-${String(i + 1).padStart(2, '0')}`, 1080, 1920);
const hl = [];
for (const [l, th] of HIGHLIGHTS) hl.push([await shot(highlight(l, th), `une-${l.normalize('NFD').replace(/[^\w]/g, '').toLowerCase()}`, 1080, 1920), l]);
await shot(profile([...posts].reverse(), hl), 'profil-mockup', 430, 400, 3);
await browser.close();
console.log('ok');
