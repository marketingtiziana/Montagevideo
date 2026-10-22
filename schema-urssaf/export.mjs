// Export du schema en PNG (1920 x 1080 et 3840 x 2160) + verifications.
// Usage : node export.mjs   (Playwright doit etre installe : npm i playwright)
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const pageUrl = pathToFileURL(join(here, 'index.html')).href;

const W = 1920, H = 1080, M = 96, BOTTOM_FREE = 80, MIN_FONT = 26, MIN_WHITE = 0.40, CELL_MIN = [320, 130];
const PALETTE = { '#FFFFFF': 'blanc', '#0F1535': 'navy', '#4F6BFF': 'indigo', '#8A93B8': 'gris' };
const problems = [];
const fail = (m) => { problems.push(m); console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

const browser = await chromium.launch();
let page, png;
for (const scale of [1, 2]) {
  const p = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  await p.goto(pageUrl);
  await p.waitForFunction(() => window.__ready === true);
  const file = join(here, scale === 1 ? 'schema.png' : 'schema@2x.png');
  await p.screenshot({ path: file, omitBackground: false });
  const buf = readFileSync(file);
  const pw = buf.readUInt32BE(16), ph = buf.readUInt32BE(20);
  console.log(`${file} : ${pw} x ${ph}`);
  if (pw !== W * scale || ph !== H * scale) fail(`taille attendue ${W * scale} x ${H * scale}`);
  if (scale === 1) { page = p; png = buf; } else await p.close();
}

const info = await page.evaluate(() => {
  const r = (v) => Math.round(v * 100) / 100;
  const rect = (el) => { const b = el.getBoundingClientRect(); return { x: r(b.left), y: r(b.top), w: r(b.width), h: r(b.height) }; };
  /* boite reelle des lignes de texte (Range), plus serree que la boite de l'element */
  const textBox = (el) => {
    const range = document.createRange(); range.selectNodeContents(el);
    const rs = [...range.getClientRects()].filter((b) => b.width > 0);
    const x0 = Math.min(...rs.map((b) => b.left)), y0 = Math.min(...rs.map((b) => b.top));
    return { x: r(x0), y: r(y0), w: r(Math.max(...rs.map((b) => b.right)) - x0), h: r(Math.max(...rs.map((b) => b.bottom)) - y0) };
  };
  const texts = [...document.querySelectorAll('[data-text]')].map((el, i) => ({
    id: `"${el.textContent.trim()}"`, size: parseFloat(getComputedStyle(el).fontSize), weight: getComputedStyle(el).fontWeight, ...textBox(el) }));
  const circles = [...document.querySelectorAll('[data-circle]')].map((el, i) => ({ id: 'cercle ' + (i + 1), kind: 'circle', ...rect(el),
    border: getComputedStyle(el.querySelector('circle')).strokeWidth }));
  const boxes = [...document.querySelectorAll('[data-box]')].map((el, i) => ({ id: 'case ' + (i + 1), kind: 'box', ...rect(el),
    border: getComputedStyle(el.querySelector('rect')).strokeWidth, rx: +el.querySelector('rect').getAttribute('rx') }));
  const blank = rect(document.querySelector('[data-blank]'));
  const cells = [...document.querySelectorAll('[data-cell]')].map((el) => ({ id: 'cellule ' + el.dataset.cell, ...rect(el) }));
  const h1 = document.querySelector('h1'), rule = document.querySelector('[data-rule]');
  const title = { textW: r(h1.getBoundingClientRect().width), ruleW: r(rule.getBoundingClientRect().width), ruleH: r(rule.getBoundingClientRect().height), ruleColor: getComputedStyle(rule).backgroundColor };
  /* toutes les couleurs effectivement utilisees */
  const toHex = (c) => { const m = c.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/); if (!m || m[4] === '0') return null;
    return '#' + [m[1], m[2], m[3]].map((v) => (+v).toString(16).padStart(2, '0')).join('').toUpperCase(); };
  const colors = new Set();
  for (const el of document.querySelectorAll('body, body *')) {
    const cs = getComputedStyle(el);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText) colors.add(toHex(cs.color));
    colors.add(toHex(cs.backgroundColor));
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(cs[`border${side}Width`]) > 0) colors.add(toHex(cs[`border${side}Color`]));
    if (el instanceof SVGGraphicsElement && !(el instanceof SVGSVGElement)) { if (cs.fill !== 'none') colors.add(toHex(cs.fill)); if (cs.stroke !== 'none') colors.add(toHex(cs.stroke)); }
    if (cs.backgroundImage !== 'none') colors.add('image:' + cs.backgroundImage);
    if (cs.boxShadow !== 'none') colors.add('shadow:' + cs.boxShadow);
  }
  colors.delete(null);
  const fonts = new Set([...document.querySelectorAll('body *')].map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/"/g, '')));
  return { texts, circles: [...circles, ...boxes], boxes, blank, cells, title, colors: [...colors], fonts: [...fonts], inter: window.__inter,
           emDash: document.documentElement.outerHTML.includes('—') };
});

console.log('\nVerifications :');
if (!info.inter) fail('Inter non chargee'); else ok(`police : ${info.fonts.join(', ')}`);
if (info.emDash) fail('tiret cadratin dans le DOM'); else ok('aucun tiret cadratin');
const named = info.colors.map((c) => `${c}${PALETTE[c] ? ' (' + PALETTE[c] + ')' : ''}`);
console.log(`  couleurs presentes dans le DOM : ${named.join(', ')}`);
const extra = info.colors.filter((c) => !PALETTE[c]);
if (extra.length) fail(`hors charte : ${extra.join(', ')}`); else ok('fond blanc, et 3 couleurs au plus pour les elements (navy, indigo, gris)');

const inter = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
let before = problems.length;
for (const t of info.texts) {
  if (t.size < MIN_FONT) fail(`${t.id} : ${t.size} px, sous ${MIN_FONT} px`);
  if (t.x < M - 0.5 || t.x + t.w > W - M + 0.5 || t.y < M - 0.5) fail(`${t.id} hors marges : x ${t.x} a ${t.x + t.w}, y ${t.y}`);
}
for (const e of [...info.texts, ...info.circles]) if (e.y + e.h > H - BOTTOM_FREE) fail(`${e.id} entre dans les ${BOTTOM_FREE} px du bas (y ${e.y + e.h})`);
for (let i = 0; i < info.texts.length; i++) for (let j = i + 1; j < info.texts.length; j++)
  if (inter(info.texts[i], info.texts[j])) fail(`chevauchement ${info.texts[i].id} / ${info.texts[j].id}`);
for (const c of info.circles) for (const t of info.texts) if (inter(c, t)) fail(`chevauchement ${c.id} / ${t.id}`);
if (problems.length === before) ok(`${info.texts.length} textes, tous >= ${MIN_FONT} px, dans les marges, sans chevauchement, rien dans les ${BOTTOM_FREE} px du bas`);

before = problems.length;
const inset = (c) => ({ x: c.x + 2, y: c.y + 2, w: c.w - 4, h: c.h - 4 });
for (const c of info.cells) {
  if (c.w < CELL_MIN[0] || c.h < CELL_MIN[1]) fail(`${c.id} : ${c.w} x ${c.h}, minimum ${CELL_MIN.join(' x ')}`);
  for (const e of [...info.texts, ...info.circles]) if (inter(inset(c), e)) fail(`${c.id} contient ${e.id}`);
}
if (info.cells.length !== 6) fail(`${info.cells.length} cellules`);
if (problems.length === before) ok(`6 cellules vides de ${info.cells[0].w} x ${info.cells[0].h} px`);
const boxes = info.boxes, circles = info.circles.filter((c) => c.kind === 'circle');
if (boxes.length === 3 && boxes.every((b) => b.w === 28 && b.h === 28 && b.border === '1.5px' && b.rx === 6)) ok('3 cases a cocher de 28 px, trait 1,5 px, coins 6 px');
else fail(`cases a cocher : ${JSON.stringify(boxes)}`);
if (circles.length === 2 && circles.every((c) => c.w === 28 && c.h === 28 && c.border === '1.5px')) ok('2 cercles vides de 28 px, trait 1,5 px');
else fail(`cercles : ${JSON.stringify(circles)}`);
if (info.blank.w >= 200 && info.blank.x + info.blank.w <= W - M + 0.5) ok(`espace vide de ${info.blank.w} px apres le seuil, dans les marges`); else fail(`espace vide : ${JSON.stringify(info.blank)}`);
if (info.title.ruleColor === 'rgb(79, 107, 255)' && info.title.ruleH === 6 && Math.abs(info.title.ruleW - info.title.textW) < 1) ok(`titre souligne en indigo, filet 6 px de la largeur du titre (${info.title.ruleW} px)`);
else fail(`filet du titre : ${JSON.stringify(info.title)}`);

const white = await page.evaluate(async ({ b64, W, H }) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, W, H).data;
  let w = 0, opaque = true;
  for (let i = 0; i < d.length; i += 4) { if (d[i] === 255 && d[i + 1] === 255 && d[i + 2] === 255) w++; if (d[i + 3] !== 255) opaque = false; }
  return { ratio: w / (W * H), opaque };
}, { b64: png.toString('base64'), W, H });
console.log(`\nPixels blancs purs sur schema.png : ${(white.ratio * 100).toFixed(1)} % (minimum ${MIN_WHITE * 100} %)`);
if (white.ratio < MIN_WHITE) fail(`moins de ${MIN_WHITE * 100} % de blanc`);
if (!white.opaque) fail('PNG non opaque');

await browser.close();
console.log(problems.length ? `\n${problems.length} probleme(s)` : '\nTout est conforme.');
process.exit(problems.length ? 1 : 0);
