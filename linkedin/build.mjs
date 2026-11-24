// FYNOVATES — LinkedIn library renderer.  usage: node linkedin/build.mjs
//   output/visuels/   PNG of each single visual (1080x1350 or 1200x627)
//   output/documents/ PDF documents (vector text) + one PNG per page
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import * as T from './templates.mjs';
import { VISUELS, DOCUMENTS } from './content.mjs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const R = T.ROOT;
for (const d of ['output', 'src']) fs.rmSync(path.join(R, d), { recursive: true, force: true });
for (const d of ['output/visuels', 'output/documents', 'src']) fs.mkdirSync(path.join(R, d), { recursive: true });

const call = ([fam, v], data) => (v ? T[fam][v] : T[fam])(data);
const sizeOf = (html) => html.includes('width:1200px') ? [1200, 627] : [1080, 1350];
const browser = await chromium.launch();
async function png(html, out) {
  const [w, h] = sizeOf(html);
  const pg = await browser.newPage({ viewport: { width: w, height: h } });
  const src = path.join(R, 'src', path.basename(out, '.png') + '.html'); fs.writeFileSync(src, html);
  await pg.goto('file://' + src); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(80);
  await pg.screenshot({ path: out }); await pg.close();
}
for (const v of VISUELS) await png(call(v.tpl, v.data), path.join(R, 'output', 'visuels', `fynovates-linkedin-${v.id}.png`));

for (const d of DOCUMENTS) {
  const total = d.pages.length, parts = [];
  for (let i = 0; i < total; i++) {
    const [kind, data] = d.pages[i];
    const html = T.doc[kind]({ ...data, n: i + 1, total });
    await png(html, path.join(R, 'output', 'documents', `${d.id}-page-${String(i + 1).padStart(2, '0')}.png`));
    parts.push(html);
  }
  // one vector PDF: each page wrapped in its own positioned frame
  const style = parts[0].match(/<style>([\s\S]*?)<\/style>/)[1].replace(/html,body\{[^}]+\}/, 'html,body{width:1080px;margin:0}').replace(/body\{background:[^;]+;/, 'body{');
  const body = parts.map(p => { const bg = p.match(/<body style="background:([^"]+)"/)?.[1] || p.match(/body\{background:([^;]+);/)[1];
    return `<section style="position:relative;width:1080px;height:1350px;overflow:hidden;background:${bg};page-break-after:always;break-after:page">${p.match(/<body>([\s\S]*)<\/body>/)[1]}</section>`; }).join('');
  const all = `<!doctype html><html><head><meta charset="utf-8"><style>${style}</style></head><body>${body}</body></html>`;
  const src = path.join(R, 'src', d.id + '.html'); fs.writeFileSync(src, all);
  const pg = await browser.newPage(); await pg.goto('file://' + src); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
  await pg.pdf({ path: path.join(R, 'output', 'documents', `fynovates-linkedin-${d.id}.pdf`), width: '1080px', height: '1350px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  await pg.close();
}
await browser.close();
console.log('ok', fs.readdirSync(path.join(R, 'output', 'visuels')).length, 'visuels,', fs.readdirSync(path.join(R, 'output', 'documents')).length, 'fichiers documents');
