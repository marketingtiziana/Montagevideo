// FYNOVATES — Instagram kit v2 (minimal corporate): feed posts (1080x1350), carousel slide,
// Reels covers (1080x1920), story highlight covers and a profile mockup.
// usage: node instagram/build.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const FONTS = path.join(ROOT, '..', 'banners', 'fonts');
const ff = (f) => 'file://' + path.join(FONTS, f);
const data = (f, t) => `data:image/${t};base64,` + fs.readFileSync(path.join(ROOT, 'assets', f)).toString('base64');
const WORD = data('wordmark-3x.png', 'png');
const photo = (k) => data(`photos/${k}-duo.jpg`, 'jpeg');
const RATIO = 76 / 1110;
const NAVY = '#0D082E', PAPER = '#F5F5F7', WHITE = '#FFFFFF', MUTE = '#6B6980';
const word = (w, c) => `<div style="width:${w}px;height:${(w * RATIO).toFixed(2)}px;background:${c};-webkit-mask:url(${WORD}) no-repeat 0 0/100% 100%;mask:url(${WORD}) no-repeat 0 0/100% 100%"></div>`;
const fix = (s) => s.replace(/ ([:?!;])/g, ' $1').replace(/(\w)-(\w)/g, '$1‑$2');
const base = (w, h, bg, body, extra = '') => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Mont;src:url(${ff('Montserrat.ttf')})}@font-face{font-family:Inter;src:url(${ff('Inter.ttf')})}
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${w}px;height:${h}px;overflow:hidden}
body{background:${bg};position:relative;-webkit-font-smoothing:antialiased;font-family:Inter}.a{position:absolute}
.cat{font:600 22px Mont;letter-spacing:.34em}
.ttl{font:500 64px/1.14 Inter;letter-spacing:-.022em;text-wrap:balance}
${extra}</style></head><body>${body}</body></html>`;

// ---------------- feed formats (1080x1350) ----------------
const F = {
  // A: photo on top, white band with category, title and wordmark
  photo: (img, cat, title, pos = 'center') => base(1080, 1350, WHITE, `
    <div class="a" style="left:0;top:0;width:1080px;height:880px;background:url(${photo(img)}) ${pos}/cover"></div>
    <div class="a cat" style="left:96px;top:960px;color:${MUTE}">${cat}</div>
    <div class="a ttl" style="left:96px;width:888px;top:1010px;color:${NAVY};font-size:54px">${fix(title)}</div>
    <div class="a" style="right:96px;top:1238px">${word(220, NAVY)}</div>`),
  // B: text only, generous white space
  texte: (bg, cat, title) => { const fg = bg === NAVY ? WHITE : NAVY, mu = bg === NAVY ? 'rgba(255,255,255,.6)' : MUTE, ru = bg === NAVY ? 'rgba(255,255,255,.22)' : 'rgba(13,8,46,.14)';
    return base(1080, 1350, bg, `
    <div class="a cat" style="left:96px;top:120px;color:${mu}">${cat}</div>
    <div class="a ttl" style="left:96px;width:840px;top:190px;color:${fg}">${fix(title)}</div>
    <div class="a" style="left:96px;right:96px;top:1180px;height:1px;background:${ru}"></div>
    <div class="a" style="left:96px;top:1226px">${word(240, fg)}</div>`); },
  // C: full-bleed photo, wordmark only
  plein: (img, cat, pos = 'center') => base(1080, 1350, NAVY, `
    <div class="a" style="inset:0;background:url(${photo(img)}) ${pos}/cover"></div>
    <div class="a" style="left:0;right:0;bottom:0;height:260px;background:linear-gradient(180deg,rgba(10,7,34,0),rgba(10,7,34,.72))"></div>
    <div class="a cat" style="left:96px;top:1196px;color:rgba(255,255,255,.8)">${cat}</div>
    <div class="a" style="right:96px;top:1196px">${word(240, WHITE)}</div>`),
  // D: carousel cover
  carrousel: (bg, cat, title, n) => { const fg = bg === NAVY ? WHITE : NAVY, mu = bg === NAVY ? 'rgba(255,255,255,.6)' : MUTE, ru = bg === NAVY ? 'rgba(255,255,255,.22)' : 'rgba(13,8,46,.14)';
    return base(1080, 1350, bg, `
    <div class="a cat" style="left:96px;top:120px;color:${mu}">GUIDE · ${cat}</div>
    <div class="a" style="right:96px;top:114px;font:500 24px Inter;color:${mu};font-variant-numeric:tabular-nums">1 / ${n}</div>
    <div class="a ttl" style="left:96px;width:840px;top:190px;color:${fg}">${fix(title)}</div>
    <div class="a" style="left:96px;right:96px;top:1180px;height:1px;background:${ru}"></div>
    <div class="a" style="left:96px;top:1226px">${word(240, fg)}</div>
    <div class="a" style="right:96px;top:1216px;font:500 26px Inter;color:${fg}">Faire défiler →</div>`); },
};
const slide = (k, n, title, text) => base(1080, 1350, WHITE, `
  <div class="a cat" style="left:96px;top:120px;color:${MUTE}">ÉTAPE ${k - 1}</div>
  <div class="a" style="right:96px;top:114px;font:500 24px Inter;color:${MUTE}">${k} / ${n}</div>
  <div class="a ttl" style="left:96px;width:840px;top:190px;color:${NAVY};font-size:56px">${fix(title)}</div>
  <div class="a" style="left:96px;width:800px;top:420px;font:400 36px/1.55 Inter;color:#3B3953">${fix(text)}</div>
  <div class="a" style="left:96px;right:96px;top:1180px;height:1px;background:rgba(13,8,46,.14)"></div>
  <div class="a" style="left:96px;top:1226px">${word(240, NAVY)}</div>`);

// chronological order: 01 = oldest. Alternates photo / text so the grid forms a quiet checkerboard.
export const FEED = [
  ['photo', 'poignee-main', 'STRUCTURATION', 'Holding : quand devient-elle vraiment rentable ?'],
  ['texte', PAPER, 'BANQUE', 'Ouvrir un compte professionnel à l’étranger : ce que la banque vérifie.'],
  ['plein', 'femme-fenetre', 'RÉSIDENCE FISCALE', 'center 30%'],
  ['carrousel', WHITE, 'FISCALITÉ', 'Facturer depuis l’étranger en cinq étapes.', 6],
  ['photo', 'documents-fiscaux', 'COMPTABILITÉ', 'Les obligations comptables que les freelances oublient.'],
  ['texte', NAVY, 'EXPATRIATION', 'Avant de partir : résidence, couverture sociale, banque et structure.'],
  ['plein', 'homme-lunettes', 'CONSEIL', 'center 25%'],
  ['texte', PAPER, 'STRUCTURATION', 'LLC américaine : le coût réel, au-delà des frais de création.'],
  ['photo', 'signature', 'JURIDIQUE', 'Statuts, pactes, conventions : ce qu’il faut signer, et quand.'],
  ['carrousel', NAVY, 'RÉSIDENCE', 'Les trois critères de la résidence fiscale française.', 5],
  ['photo', 'entretien', 'ACCOMPAGNEMENT', 'Un premier rendez-vous pour faire le point sur votre structure.'],
  ['texte', WHITE, 'COMPTABILITÉ', 'TVA e-commerce : ce qui a changé pour les ventes en ligne.'],
];
const REELS = [
  ['homme-costume', 'FISCALITÉ', 'Trois erreurs des freelances à l’étranger', 'center 20%'],
  ['femme-blazer', 'BANQUE', 'Pourquoi une banque bloque un virement', 'center 25%'],
  ['reunion-docs', 'RÉSIDENCE', 'Portugal, Espagne ou Émirats : bien comparer', '60% center'],
];
const HIGHLIGHTS = ['Fiscalité', 'Banque', 'Résidence', 'Structure', 'Avis', 'Cabinet'];

const reel = (img, cat, title, pos) => base(1080, 1920, NAVY, `
  <div class="a" style="inset:0;background:url(${photo(img)}) ${pos}/cover"></div>
  <div class="a" style="left:0;right:0;top:0;height:1000px;background:linear-gradient(180deg,rgba(10,7,34,.82),rgba(10,7,34,.55) 60%,rgba(10,7,34,0))"></div>
  <div class="a" style="left:96px;top:330px">${word(300, WHITE)}</div>
  <div class="a cat" style="left:96px;top:420px;color:rgba(255,255,255,.75);font-size:26px">${cat}</div>
  <div class="a ttl" style="left:96px;width:860px;top:480px;color:${WHITE};font-size:76px">${fix(title)}</div>`);
const highlight = (label) => base(1080, 1920, NAVY, `
  <div class="a" style="left:0;right:0;top:0;bottom:0;display:flex;align-items:center;justify-content:center">
    <div style="font:600 ${label.length > 8 ? 58 : 68}px Mont;letter-spacing:.2em;color:${WHITE};padding-left:.18em">${label.toUpperCase()}</div></div>`);

function profile(posts, hl) {
  const img = (f) => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
  return base(430, 400, '#fff', `<div style="font-family:Inter;color:#000">
  <div style="height:50px;display:flex;align-items:center;padding:0 16px;font:700 20px Inter">fynovates</div>
  <div style="display:flex;align-items:center;gap:24px;padding:6px 16px">
    <div style="width:86px;height:86px;border-radius:50%;background:${NAVY};display:flex;align-items:center;justify-content:center;flex:none">${word(64, WHITE)}</div>
    <div style="display:flex;gap:22px;text-align:center;font:13px Inter">${['publications', 'followers', 'suivi(e)s'].map(l => `<div><b style="font-size:16px">—</b><br>${l}</div>`).join('')}</div></div>
  <div style="padding:10px 16px 4px;font:14px/1.4 Inter"><b>FYNOVATES</b><br><span style="color:#737373">Service de conseil</span><br>Cabinet de conseil fiscal &amp; structuration internationale.<br>Fiscalité · Comptabilité · Banque · Résidence</div>
  <div style="display:flex;gap:6px;padding:10px 16px"><div style="flex:1;background:#efefef;border-radius:8px;text-align:center;padding:8px;font:600 14px Inter">Suivre</div><div style="flex:1;background:#efefef;border-radius:8px;text-align:center;padding:8px;font:600 14px Inter">Contacter</div></div>
  <div style="display:flex;gap:14px;padding:8px 16px 14px;overflow:hidden">${hl.map(([f, l]) => `<div style="text-align:center;font:12px Inter;flex:none;width:64px"><div style="width:64px;height:64px;border-radius:50%;border:1px solid #dbdbdb;padding:3px"><div style="width:100%;height:100%;border-radius:50%;background:url(${img(f)}) center/180% auto"></div></div><div style="margin-top:6px">${l}</div></div>`).join('')}</div>
  <div style="display:flex;border-top:1px solid #dbdbdb;font:600 13px Inter"><div style="flex:1;text-align:center;padding:10px;border-bottom:1px solid #000">Publications</div><div style="flex:1;text-align:center;padding:10px;color:#999">Reels</div><div style="flex:1;text-align:center;padding:10px;color:#999">Identifié(e)</div></div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">${posts.map(f => `<div style="aspect-ratio:3/4;background:url(${img(f)}) center/cover"></div>`).join('')}</div></div>`, 'html,body{height:auto!important}');
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
for (let i = 0; i < FEED.length; i++) { const [kind, ...args] = FEED[i]; posts.push(await shot(F[kind](...args), `post-${String(i + 1).padStart(2, '0')}-${kind}`, 1080, 1350)); }
await shot(slide(2, 6, 'Vérifier où votre société est établie.', 'La banque se fonde d’abord sur le pays de votre société, son activité réelle et votre propre résidence. Alignez ces trois éléments avant de déposer un dossier.'), 'carrousel-slide-02', 1080, 1350);
for (let i = 0; i < REELS.length; i++) await shot(reel(...REELS[i]), `reel-${String(i + 1).padStart(2, '0')}`, 1080, 1920);
const hl = [];
for (const l of HIGHLIGHTS) hl.push([await shot(highlight(l), `une-${l.normalize('NFD').replace(/[^\w]/g, '').toLowerCase()}`, 1080, 1920), l]);
await shot(profile([...posts].reverse(), hl), 'profil-mockup', 430, 400, 3);
await browser.close();
console.log('ok');
