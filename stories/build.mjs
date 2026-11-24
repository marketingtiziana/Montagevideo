// FYNOVATES — Stories renderer.  usage: node stories/build.mjs
// output/      clean 1080x1920 PNG, ready to publish (no simulated stickers)
// apercus/     same screens with simulated Instagram stickers, for the presentation board
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import * as T from './templates.mjs';
import { SEQUENCES, VARIANTES, UNES } from './content.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const R = T.ROOT;
for (const d of ['output', 'apercus', 'src']) fs.rmSync(path.join(R, d), { recursive: true, force: true }), fs.mkdirSync(path.join(R, d));

const render = (tpl, variant, data, opts) => { const f = T[tpl]; return typeof f === 'function' ? f(data, opts) : f[variant](data, opts); };
const browser = await chromium.launch();
const pg = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
async function shot(html, file) {
  const src = path.join(R, 'src', file + '.html'); fs.writeFileSync(src, html);
  await pg.goto('file://' + src); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(80);
  await pg.screenshot({ path: file.startsWith('apercu') ? path.join(R, 'apercus', file.replace(/^apercu-/, '') + '.png') : path.join(R, 'output', file + '.png') });
}
// YouTube thumbnail used by the republication template
{ const p = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const photo = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(R, '..', 'instagram', 'assets', 'photos', 'formulaire-fiscal-duo.jpg')).toString('base64');
  const word = 'data:image/png;base64,' + fs.readFileSync(path.join(R, 'brand', 'wordmark-3x.png')).toString('base64');
  await p.setContent(`<html><body style="margin:0;width:1280px;height:720px;background:url(${photo}) center/cover;position:relative;font-family:Inter">
    <style>@font-face{font-family:Inter;src:url(file://${path.join(R, '..', 'banners', 'fonts', 'Inter.ttf')})}</style>
    <div style="position:absolute;inset:0;background:rgba(10,7,34,.72)"></div>
    <div style="position:absolute;left:70px;top:70px;width:260px;height:17.8px;background:#fff;-webkit-mask:url(${word}) 0 0/100% 100%"></div>
    <div style="position:absolute;left:70px;top:230px;width:900px;color:#fff;font:600 92px/1.05 Inter;letter-spacing:-.03em">Résidence fiscale : les 3 critères</div></body></html>`);
  await p.waitForTimeout(150); await p.screenshot({ path: path.join(R, 'assets', 'youtube.png') }); await p.close(); }

const index = { sequences: {}, variantes: [], unes: [] };
for (const [k, seq] of Object.entries(SEQUENCES)) {
  index.sequences[k] = { ...seq, files: [] };
  for (let i = 0; i < seq.screens.length; i++) {
    const [tpl, variant, data, mock] = seq.screens[i];
    const name = `sequence-${k}-${i + 1}-${tpl}${variant ? '-' + variant : ''}`;
    await shot(render(tpl, variant, data, {}), name);
    await shot(render(tpl, variant, data, { mock: mock || false }), 'apercu-' + name);
    index.sequences[k].files.push(name);
  }
  delete index.sequences[k].screens;
}
for (let i = 0; i < VARIANTES.length; i++) {
  const [tpl, variant, data, mock] = VARIANTES[i];
  const name = `modele-${String(i + 1).padStart(2, '0')}-${tpl}${variant ? '-' + variant : ''}`;
  await shot(render(tpl, variant, data, {}), name);
  await shot(render(tpl, variant, data, { mock: mock || false }), 'apercu-' + name);
  index.variantes.push({ name, tpl, variant });
}
for (const l of UNES) {
  const name = 'une-' + l.normalize('NFD').replace(/[^\w]/g, '').toLowerCase();
  await shot(T.une({ label: l }), name); fs.copyFileSync(path.join(R, 'output', name + '.png'), path.join(R, 'apercus', name + '.png'));
  index.unes.push({ name, label: l });
}
// guide: safe zones and sticker zone on one template
await shot(T.sondage({ rubric: 'Guide', question: 'Zones de sécurité et zone du sticker', options: ['Option 1', 'Option 2'] }, { mock: 'guide' }), 'apercu-guide-zones');
fs.writeFileSync(path.join(R, 'apercus', 'index.json'), JSON.stringify(index, null, 1));
await browser.close();
console.log('ok', fs.readdirSync(path.join(R, 'output')).length, 'exports');
