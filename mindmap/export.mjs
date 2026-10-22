// Export des 9 etats en PNG 1080 x 1920 + verifications.
// Usage : node export.mjs   (Playwright doit etre installe : npm i playwright)
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, 'out');
mkdirSync(outDir, { recursive: true });
const pageUrl = pathToFileURL(join(here, 'index.html')).href;

const W = 1080, H = 1920, TOP = 800, M = 80, STATES = 9;
const ALLOWED = new Set(['#0F1535', '#FFFFFF', '#4F6BFF', '#8A93B8']);
const NAVY = [15, 21, 53];
const problems = [];
const fail = (m) => { problems.push(m); console.log('  ✗ ' + m); };
const ok = (m) => console.log('  ✓ ' + m);

// Mini ecrivain ZIP (methode "stored") : aucune dependance.
const CRC = Int32Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xEDB88320 ^ (n >>> 1) : n >>> 1; return n; });
const crc32 = (buf) => { let c = -1; for (const b of buf) c = CRC[(c ^ b) & 0xFF] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function zip(entries) {
  const locals = [], centrals = []; let offset = 0;
  const now = new Date(), dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  for (const { name, data } of entries) {
    const n = Buffer.from(name), crc = crc32(data);
    const head = Buffer.alloc(30); head.writeUInt32LE(0x04034b50, 0); head.writeUInt16LE(20, 4); head.writeUInt16LE(0x800, 6);
    head.writeUInt16LE(0, 8); head.writeUInt16LE(dosTime, 10); head.writeUInt16LE(dosDate, 12); head.writeUInt32LE(crc, 14);
    head.writeUInt32LE(data.length, 18); head.writeUInt32LE(data.length, 22); head.writeUInt16LE(n.length, 26); head.writeUInt16LE(0, 28);
    const cen = Buffer.alloc(46); cen.writeUInt32LE(0x02014b50, 0); cen.writeUInt16LE(20, 4); cen.writeUInt16LE(20, 6); cen.writeUInt16LE(0x800, 8);
    cen.writeUInt16LE(0, 10); cen.writeUInt16LE(dosTime, 12); cen.writeUInt16LE(dosDate, 14); cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(data.length, 20); cen.writeUInt32LE(data.length, 24); cen.writeUInt16LE(n.length, 28); cen.writeUInt32LE(offset, 42);
    locals.push(head, n, data); centrals.push(cen, n); offset += head.length + n.length + data.length;
  }
  const cenBuf = Buffer.concat(centrals), end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(cenBuf.length, 12); end.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cenBuf, end]);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const geo = {};  // state -> { id: bbox }
const files = [];

for (let s = 1; s <= STATES; s++) {
  await page.goto(`${pageUrl}?state=${s}`);
  await page.waitForFunction(() => window.__ready === true);
  const file = join(outDir, `mindmap_${String(s).padStart(2, '0')}.png`);
  await page.screenshot({ path: file, omitBackground: false, clip: { x: 0, y: 0, width: W, height: H } });
  files.push({ name: `mindmap_${String(s).padStart(2, '0')}.png`, path: file });

  const info = await page.evaluate(() => {
    const vis = [...document.querySelectorAll('[data-visible="1"]')];
    const r = (v) => Math.round(v * 100) / 100;
    const boxes = {};
    const texts = [], shapes = [];
    for (const el of vis) {
      const b = el.getBBox();
      const box = { x: r(b.x), y: r(b.y), w: r(b.width), h: r(b.height) };
      boxes[el.dataset.id] = box;
      if (el.dataset.kind === 'text') texts.push({ id: el.dataset.id, ...box });
      else if (el.getAttribute('fill') && el.getAttribute('fill') !== 'none') shapes.push({ id: el.dataset.id, ...box });
    }
    const colors = new Set();
    for (const el of document.querySelectorAll('svg *')) {
      for (const a of ['fill', 'stroke']) { const v = el.getAttribute(a); if (v && v !== 'none') colors.add(v.toUpperCase()); }
    }
    const rgb = getComputedStyle(document.body).backgroundColor;
    const emDash = document.documentElement.outerHTML.includes('—');
    return { boxes, texts, shapes, colors: [...colors], bodyBg: rgb, emDash };
  });
  geo[s] = info.boxes;

  console.log(`state ${s}: ${file}`);
  // dimensions PNG (IHDR)
  const png = readFileSync(file);
  const pw = png.readUInt32BE(16), ph = png.readUInt32BE(20);
  if (pw !== W || ph !== H) fail(`taille ${pw} x ${ph}`); else ok(`1080 x 1920`);

  // zone haute vide : on relit le PNG dans un canvas (data URL, pas de taint)
  const top = await page.evaluate(async ({ b64, TOP, W, NAVY }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas'); c.width = W; c.height = TOP;
    const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0);
    const d = ctx.getImageData(0, 0, W, TOP).data;
    let bad = 0;
    for (let i = 0; i < d.length; i += 4)
      if (d[i] !== NAVY[0] || d[i + 1] !== NAVY[1] || d[i + 2] !== NAVY[2] || d[i + 3] !== 255) bad++;
    return { bad, opaque: img.width === W };
  }, { b64: png.toString('base64'), TOP, W, NAVY });
  if (top.bad) fail(`${top.bad} pixels non navy dans les 800 px du haut`); else ok('zone facecam vide (800 px navy opaques)');

  // debordements et chevauchements
  const before = problems.length;
  for (const t of info.texts) {
    if (t.x < M - 0.5 || t.x + t.w > W - M + 0.5 || t.y < TOP) fail(`${t.id} deborde : x ${t.x} a ${t.x + t.w}, y ${t.y}`);
    if (t.y + t.h > H) fail(`${t.id} sort du frame en bas`);
  }
  const inter = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  for (let i = 0; i < info.texts.length; i++)
    for (let j = i + 1; j < info.texts.length; j++)
      if (inter(info.texts[i], info.texts[j])) fail(`chevauchement ${info.texts[i].id} / ${info.texts[j].id}`);
  if (problems.length === before) ok(`${info.texts.length} textes visibles, dans les marges, sans chevauchement`);

  // couleurs et tiret cadratin
  const extra = info.colors.filter((c) => !ALLOWED.has(c));
  if (extra.length) fail(`couleurs hors palette : ${extra.join(', ')}`); else ok(`couleurs DOM : ${info.colors.join(' ')}`);
  if (info.bodyBg !== 'rgb(15, 21, 53)') fail(`fond body ${info.bodyBg}`);
  if (info.emDash) fail('tiret cadratin dans le DOM'); else ok('aucun tiret cadratin');

  if (s === 6) {
    const ids = info.shapes.map((x) => x.id).sort().join(', ');
    if (info.shapes.length === 2 && ids === 'layer4-box, layer5-box') ok(`etat 6 : seules formes pleines = ${ids}`);
    else fail(`etat 6 : formes pleines = ${ids || 'aucune'}`);
  }
}
await browser.close();

// Regle d'or : aucun noeud visible ne bouge entre deux etats consecutifs.
console.log('\nDiff des coordonnees entre etats consecutifs :');
for (let s = 1; s < STATES; s++) {
  const a = geo[s], b = geo[s + 1];
  const common = Object.keys(a).filter((id) => id in b);
  const moved = common.filter((id) => ['x', 'y', 'w', 'h'].some((k) => Math.abs(a[id][k] - b[id][k]) > 0.01));
  const line = `  ${s} -> ${s + 1} : ${common.length} noeuds communs, ${moved.length} deplace(s)`;
  if (moved.length) fail(line + ' : ' + moved.join(', ')); else console.log(line + '  ✓');
}

// Archive ZIP des 9 PNG (stockage sans compression, les PNG le sont deja) pour tout telecharger d'un coup.
const zipFile = join(outDir, 'mindmap_png.zip');
writeFileSync(zipFile, zip(files.map((f) => ({ name: f.name, data: readFileSync(f.path) }))));
console.log(`\nArchive : ${zipFile}`);

console.log(problems.length ? `\n${problems.length} probleme(s)` : '\nTout est conforme.');
process.exit(problems.length ? 1 : 0);
