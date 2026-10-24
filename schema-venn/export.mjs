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

const W = 1920, H = 1080, M = 96, BOTTOM_FREE = 80, MIN_FONT = 24, MIN_WHITE = 0.60, LENS_MIN = 180, CENTER_MIN = 140;
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
  const textBox = (el) => {
    if (el instanceof SVGElement) return rect(el);
    const range = document.createRange(); range.selectNodeContents(el);
    const rs = [...range.getClientRects()].filter((b) => b.width > 0);
    const x0 = Math.min(...rs.map((b) => b.left)), y0 = Math.min(...rs.map((b) => b.top));
    return { x: r(x0), y: r(y0), w: r(Math.max(...rs.map((b) => b.right)) - x0), h: r(Math.max(...rs.map((b) => b.bottom)) - y0) };
  };
  const texts = [...document.querySelectorAll('[data-text]')].map((el) => ({
    id: `"${el.textContent.trim()}"`, size: parseFloat(getComputedStyle(el).fontSize), ...textBox(el) }));
  const circles = [...document.querySelectorAll('[data-circle]')].map((el) => { const cs = getComputedStyle(el); return {
    id: el.dataset.circle, cx: +el.getAttribute('cx'), cy: +el.getAttribute('cy'), r: +el.getAttribute('r'), fill: cs.fill, stroke: cs.stroke, sw: cs.strokeWidth }; });
  const h1 = document.querySelector('h1'), rule = document.querySelector('[data-rule]');
  const title = { textW: r(h1.getBoundingClientRect().width), ruleW: r(rule.getBoundingClientRect().width), ruleH: r(rule.getBoundingClientRect().height), ruleColor: getComputedStyle(rule).backgroundColor };
  const blank = rect(document.querySelector('[data-blank]'));
  /* largeur de la zone centrale : balayage pixel par pixel des points dans les trois cercles */
  const inside = (x, y, c) => (x - c.cx) ** 2 + (y - c.cy) ** 2 <= c.r ** 2;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let y = 0; y < 1080; y++) for (let x = 0; x < 1920; x++)
    if (circles.every((c) => inside(x, y, c))) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  const center = { w: maxX - minX + 1, h: maxY - minY + 1 };
  const toHex = (c) => { const m = c.match(/rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)/); if (!m || m[4] === '0') return null;
    return '#' + [m[1], m[2], m[3]].map((v) => (+v).toString(16).padStart(2, '0')).join('').toUpperCase(); };
  const colors = new Set();
  for (const el of document.querySelectorAll('body, body *')) {
    const cs = getComputedStyle(el);
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (hasText && !(el instanceof SVGElement)) colors.add(toHex(cs.color));
    colors.add(toHex(cs.backgroundColor));
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) if (parseFloat(cs[`border${side}Width`]) > 0) colors.add(toHex(cs[`border${side}Color`]));
    if (el instanceof SVGGraphicsElement && !(el instanceof SVGSVGElement)) { if (cs.fill !== 'none') colors.add(toHex(cs.fill)); if (cs.stroke !== 'none') colors.add(toHex(cs.stroke)); }
    if (cs.backgroundImage !== 'none') colors.add('image:' + cs.backgroundImage);
    if (cs.boxShadow !== 'none') colors.add('shadow:' + cs.boxShadow);
  }
  colors.delete(null);
  const fonts = new Set([...document.querySelectorAll('body *')].map((el) => getComputedStyle(el).fontFamily.split(',')[0].replace(/"/g, '')));
  return { texts, circles, title, blank, center, colors: [...colors], fonts: [...fonts], inter: window.__inter,
           emDash: document.documentElement.outerHTML.includes('—') };
});

console.log('\nVerifications :');
if (!info.inter) fail('Inter non chargee'); else ok(`police : ${info.fonts.join(', ')}`);
if (info.emDash) fail('tiret cadratin dans le DOM'); else ok('aucun tiret cadratin');
const named = info.colors.map((c) => `${c}${PALETTE[c] ? ' (' + PALETTE[c] + ')' : ''}`);
console.log(`  couleurs presentes dans le DOM : ${named.join(', ')}`);
const extra = info.colors.filter((c) => !PALETTE[c]);
if (extra.length) fail(`hors charte : ${extra.join(', ')}`); else ok('fond blanc, et 3 couleurs au plus pour les elements (navy, indigo, gris)');

/* cercles : trois, memes rayons, contour 2 px gris, sans remplissage */
const C = info.circles;
if (C.length === 3 && C.every((c) => c.fill === 'none' && c.stroke === 'rgb(138, 147, 184)' && c.sw === '2px' && c.r === C[0].r)) ok(`3 cercles de rayon ${C[0].r} px, contour 2 px gris, fill none`);
else fail(`cercles : ${JSON.stringify(C)}`);
for (const c of C) if (c.cy + c.r > H - BOTTOM_FREE || c.cy - c.r < M || c.cx - c.r < M || c.cx + c.r > W - M) fail(`cercle ${c.id} hors zone utile`);

/* intersections : largeur des lentilles deux a deux (2R - distance des centres) et de la zone centrale */
const dist = (a, b) => Math.hypot(a.cx - b.cx, a.cy - b.cy);
const pairs = [[0, 1], [0, 2], [1, 2]];
console.log('  largeurs mesurees des intersections :');
for (const [i, j] of pairs) {
  const w = Math.round((2 * C[i].r - dist(C[i], C[j])) * 10) / 10;
  console.log(`    ${C[i].id} ∩ ${C[j].id} : ${w} px`);
  if (w < LENS_MIN) fail(`intersection ${C[i].id} / ${C[j].id} : ${w} px, minimum ${LENS_MIN}`);
}
console.log(`    zone centrale commune : ${info.center.w} px de large, ${info.center.h} px de haut`);
if (info.center.w < CENTER_MIN) fail(`zone centrale ${info.center.w} px, minimum ${CENTER_MIN}`);
if (problems.length === 0) ok(`intersections >= ${LENS_MIN} px, zone centrale >= ${CENTER_MIN} px`);

/* textes : tailles, marges, zone basse, chevauchements, et tous a l'exterieur des cercles */
const inter = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
let before = problems.length;
for (const t of info.texts) {
  if (t.size < MIN_FONT) fail(`${t.id} : ${t.size} px, sous ${MIN_FONT} px`);
  if (t.x < M - 0.5 || t.x + t.w > W - M + 0.5 || t.y < M - 0.5) fail(`${t.id} hors marges : x ${t.x} a ${t.x + t.w}, y ${t.y}`);
  if (t.y + t.h > H - BOTTOM_FREE) fail(`${t.id} entre dans les ${BOTTOM_FREE} px du bas (y ${t.y + t.h})`);
  for (const c of C) {   /* distance minimale du centre a la boite du texte : doit depasser le rayon */
    const dx = Math.max(c.cx - (t.x + t.w), 0, t.x - c.cx), dy = Math.max(c.cy - (t.y + t.h), 0, t.y - c.cy);
    if (Math.hypot(dx, dy) <= c.r + 1) fail(`${t.id} touche ou entre dans le cercle ${c.id}`);
  }
}
for (let i = 0; i < info.texts.length; i++) for (let j = i + 1; j < info.texts.length; j++)
  if (inter(info.texts[i], info.texts[j])) fail(`chevauchement ${info.texts[i].id} / ${info.texts[j].id}`);
if (problems.length === before) ok(`${info.texts.length} textes, tous >= ${MIN_FONT} px, dans les marges, hors des cercles, sans chevauchement, rien dans les ${BOTTOM_FREE} px du bas`);
if (info.blank.w === 160 && info.blank.x + info.blank.w <= W - M + 0.5) ok('160 px de vide apres « 1 · 2 · 3 »'); else fail(`vide apres « 1 · 2 · 3 » : ${JSON.stringify(info.blank)}`);
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
