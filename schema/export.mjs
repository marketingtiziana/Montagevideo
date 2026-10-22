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

const W = 1920, H = 1080, M = 80, BOTTOM_FREE = 60, MIN_FONT = 30, MIN_WHITE = 0.35, CELL_MIN = [180, 110];
const problems = [];
const fail = (m) => { problems.push(m); console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

const browser = await chromium.launch();
const outputs = [];
for (const scale of [1, 2]) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
  await page.goto(pageUrl);
  await page.waitForFunction(() => window.__ready === true);
  const file = join(here, scale === 1 ? 'schema.png' : 'schema@2x.png');
  await page.screenshot({ path: file, omitBackground: false });
  const png = readFileSync(file);
  const pw = png.readUInt32BE(16), ph = png.readUInt32BE(20);
  console.log(`${file} : ${pw} x ${ph}`);
  if (pw !== W * scale || ph !== H * scale) fail(`taille attendue ${W * scale} x ${H * scale}`);
  outputs.push({ page, file, png, scale });
}

const { page, png } = outputs[0];
const info = await page.evaluate(({ M, W, H }) => {
  const r = (v) => Math.round(v * 100) / 100;
  const ctx = document.createElement('canvas').getContext('2d');
  const inkBox = (el) => {   /* boite d'encre reelle du texte, puis rotation */
    const size = +el.getAttribute('font-size'), x = +el.getAttribute('x'), y = +el.getAttribute('y');
    ctx.font = `${el.getAttribute('font-weight')} ${size}px ${el.getAttribute('font-family')}`;
    ctx.textAlign = { start: 'left', middle: 'center', end: 'right' }[el.getAttribute('text-anchor')];
    const m = ctx.measureText(el.textContent);
    const x0 = x - m.actualBoundingBoxLeft, x1 = x + m.actualBoundingBoxRight, y0 = y - m.actualBoundingBoxAscent, y1 = y + m.actualBoundingBoxDescent;
    const [, a, px, py] = (el.getAttribute('transform') || '').match(/rotate\(([-\d.]+) ([-\d.]+) ([-\d.]+)\)/) || [0, 0, 0, 0];
    const c = Math.cos(a * Math.PI / 180), s = Math.sin(a * Math.PI / 180);
    const pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([qx, qy]) => [px + (qx - px) * c - (qy - py) * s, py + (qx - px) * s + (qy - py) * c]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return { x: r(Math.min(...xs)), y: r(Math.min(...ys)), w: r(Math.max(...xs) - Math.min(...xs)), h: r(Math.max(...ys) - Math.min(...ys)) };
  };
  const texts = [], others = [];
  for (const el of document.querySelectorAll('[data-id]')) {
    const id = el.dataset.id, kind = el.dataset.kind;
    if (kind === 'text') texts.push({ id, size: +el.getAttribute('font-size'), ...inkBox(el) });
    else { const b = el.getBBox(); others.push({ id, kind, role: el.dataset.role || '', x: r(b.x), y: r(b.y), w: r(b.width), h: r(b.height) }); }
  }
  const colors = new Set();
  for (const el of document.querySelectorAll('svg *')) {
    for (const a of ['fill', 'stroke']) { const v = el.getAttribute(a); if (v && v !== 'none') colors.add(v.toUpperCase()); }
    const st = el.getAttribute('style'); if (st && /#|rgb/i.test(st)) colors.add('style:' + st);
  }
  return { texts, others, cells: window.__cells, colors: [...colors], bodyBg: getComputedStyle(document.body).backgroundColor,
           emDash: document.documentElement.outerHTML.includes('—'), fonts: window.__fonts };
}, { M, W, H });

console.log('\nVerifications :');
if (!(info.fonts.caveat && info.fonts.patrick)) fail(`polices manuscrites non chargees : ${JSON.stringify(info.fonts)}`); else ok('Caveat 700 et Patrick Hand chargees');
if (info.bodyBg !== 'rgb(255, 255, 255)') fail(`fond ${info.bodyBg}`); else ok('fond blanc #FFFFFF');
const extra = info.colors.filter((c) => c !== '#111111');
if (extra.length) fail(`couleurs hors encre : ${extra.join(', ')}`); else ok(`une seule encre dans le DOM : ${info.colors.join(' ')}`);
if (info.emDash) fail('tiret cadratin dans le DOM'); else ok('aucun tiret cadratin');

const inter = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
let before = problems.length;
for (const t of info.texts) {
  if (t.size < MIN_FONT) fail(`${t.id} : ${t.size} px, sous ${MIN_FONT} px`);
  if (t.x < M - 0.5 || t.x + t.w > W - M + 0.5 || t.y < M - 0.5) fail(`${t.id} hors marges : x ${t.x} a ${t.x + t.w}, y ${t.y}`);
}
for (const e of [...info.texts, ...info.others]) if (e.y + e.h > H - BOTTOM_FREE) fail(`${e.id} entre dans les ${BOTTOM_FREE} px du bas (y ${e.y + e.h})`);
for (let i = 0; i < info.texts.length; i++) for (let j = i + 1; j < info.texts.length; j++)
  if (inter(info.texts[i], info.texts[j])) fail(`chevauchement ${info.texts[i].id} / ${info.texts[j].id}`);
for (const o of info.others.filter((o) => o.role !== 'grid')) for (const t of info.texts)
  if (inter(o, t)) fail(`chevauchement ${o.id} / ${t.id}`);
if (problems.length === before) ok(`${info.texts.length} textes, tous >= ${MIN_FONT} px, dans les marges, sans chevauchement, rien dans les ${BOTTOM_FREE} px du bas`);

/* cellules : vides (aucun texte, cercle ou soulignement ne les touche) et assez grandes */
before = problems.length;
const inset = (c) => ({ x: c.x + 6, y: c.y + 6, w: c.w - 12, h: c.h - 12 });
for (const c of info.cells) {
  if (c.w < CELL_MIN[0] || c.h < CELL_MIN[1]) fail(`${c.id} : ${c.w} x ${c.h}, minimum ${CELL_MIN.join(' x ')}`);
  for (const e of [...info.texts, ...info.others.filter((o) => o.role !== 'grid')]) if (inter(inset(c), e)) fail(`${c.id} contient ${e.id}`);
}
if (problems.length === before) ok(`${info.cells.length} cellules vides de ${info.cells[0].w} x ${info.cells[0].h} px`);
const circles = info.others.filter((o) => o.id.startsWith('list-circle'));
if (circles.length === 5) ok('5 cercles vides dans la liste'); else fail(`${circles.length} cercles dans la liste`);
const under = info.others.filter((o) => o.id.startsWith('title-underline'));
if (under.length === 2) ok('titre souligne deux fois'); else fail(`${under.length} soulignement(s) du titre`);

/* proportion de pixels blancs purs sur schema.png */
const white = await page.evaluate(async ({ b64, W, H }) => {
  const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
  const d = ctx.getImageData(0, 0, W, H).data;
  let w = 0, opaque = true;
  for (let i = 0; i < d.length; i += 4) { if (d[i] === 255 && d[i + 1] === 255 && d[i + 2] === 255) w++; if (d[i + 3] !== 255) opaque = false; }
  return { ratio: w / (W * H), opaque };
}, { b64: png.toString('base64'), W, H });
console.log(`\nPixels blancs purs sur schema.png : ${(white.ratio * 100).toFixed(1)} %`);
if (white.ratio < MIN_WHITE) fail(`moins de ${MIN_WHITE * 100} % de blanc`);
if (!white.opaque) fail('PNG non opaque');

await browser.close();
console.log(problems.length ? `\n${problems.length} probleme(s)` : '\nTout est conforme.');
process.exit(problems.length ? 1 : 0);
