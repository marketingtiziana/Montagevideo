// node linkedin-infographies/src/build.mjs
// → output/infographies/*.png, output/carrousel/{pages/*.png, *.pdf, planche}, output/planche-globale.png
// Contrôle qualité intégré : signale tout contenu qui déborde de sa zone ou du cadre.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { INFOGRAPHIES } from './infographies.mjs'; import { CARROUSEL } from './carrousel.mjs';
import { fontCSS } from '../../linkedin-branding/src/core.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), OUT = path.join(ROOT, 'output');
fs.rmSync(OUT, { recursive: true, force: true });
const b = await chromium.launch(), pg = await b.newPage({ viewport: { width: 1080, height: 1350 } });
const tmp = path.join(fs.mkdtempSync('/tmp/lif-'), 'p.html'); const issues = [];
const check = async name => { const r = await pg.evaluate(() => { const out = [], body = document.querySelector('.body');
  if (body && body.scrollHeight > body.clientHeight + 1) out.push(`contenu trop haut de ${body.scrollHeight - body.clientHeight}px`);
  for (const el of document.querySelectorAll('.cv *')) { const s = getComputedStyle(el); if (el.scrollWidth > el.clientWidth + 1 && s.overflow !== 'visible' && el.tagName !== 'svg') out.push('débordement horizontal : ' + el.textContent.slice(0, 40));
    const rc = el.getBoundingClientRect(); if (rc.width && (rc.right > 1081 || rc.bottom > 1351)) out.push('hors cadre : ' + (el.textContent || el.tagName).slice(0, 40)); }
  return [...new Set(out)].slice(0, 5); }); if (r.length) issues.push(name + ' → ' + r.join(' | ')); };
const render = async (html, file, name) => { fs.writeFileSync(tmp, html); await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await check(name);
  fs.mkdirSync(path.dirname(file), { recursive: true }); await pg.screenshot({ path: file }); };

for (const [id, , , fn] of INFOGRAPHIES) await render(fn(), path.join(OUT, 'infographies', `fynovates-infographie-${id}.png`), id);
const pages = CARROUSEL.map(fn => fn());
for (const [i, h] of pages.entries()) await render(h, path.join(OUT, 'carrousel', 'pages', `fynovates-carrousel-page-${String(i + 1).padStart(2, '0')}.png`), 'carrousel p' + (i + 1));
// PDF vectoriel 8 pages
const style = pages[0].match(/<style>([\s\S]*?)<\/style>/)[1].replace(/html,body\{[^}]*\}/, 'html,body{margin:0}');
const body = pages.map(h => `<section style="width:1080px;height:1350px;overflow:hidden;position:relative;page-break-after:always">${h.match(/<body>([\s\S]*)<\/body>/)[1]}</section>`).join('');
fs.writeFileSync(tmp, `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${style}</style></head><body>${body}</body></html>`);
await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
await pg.pdf({ path: path.join(OUT, 'carrousel', 'fynovates-carrousel-compte-paiement-compte-bancaire.pdf'), width: '1080px', height: '1350px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });

// Planches : carrousel seul (8 pages côte à côte) et planche globale (10 infographies + 8 pages)
const img = (p, w) => `<img src="file://${p}" style="width:${w}px;display:block;box-shadow:0 0 0 1px rgba(13,8,46,.12)">`;
const sheet = (w, inner) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${fontCSS()}*{margin:0;box-sizing:border-box}body{width:${w}px;background:#F5F5F7;font-family:Inter;color:#0D082E;padding:72px}
.cap{font:600 15px Mont;letter-spacing:.3em;text-transform:uppercase;color:#6B6980}h1{font:600 52px/1.1 Inter;letter-spacing:-.025em;margin:14px 0 10px}h2{font:600 26px Inter;margin:56px 0 20px}.l{font:500 15px/1.35 Inter;color:#6B6980;margin-top:10px}.g{display:grid;gap:24px}</style></head><body>${inner}</body></html>`;
const cp = i => path.join(OUT, 'carrousel', 'pages', `fynovates-carrousel-page-0${i}.png`);
const carSheet = sheet(3160, `<div class="cap">FYNOVATES · Carrousel LinkedIn · 8 pages</div><h1>Compte de paiement ou compte bancaire ?</h1>
  <div class="g" style="grid-template-columns:repeat(8,1fr);gap:16px;margin-top:30px">${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `<div>${img(cp(i), 360)}<div class="l">Page ${i}</div></div>`).join('')}</div>`);
const glob = sheet(2400, `<div class="cap">FYNOVATES · Publications LinkedIn</div><h1>10 infographies et 1 carrousel</h1>
  <h2>Infographies</h2><div class="g" style="grid-template-columns:repeat(5,1fr)">${INFOGRAPHIES.map(([id, t, s]) => `<div>${img(path.join(OUT, 'infographies', `fynovates-infographie-${id}.png`), 427)}<div class="l"><b style="color:#0D082E;font-weight:600">${id.slice(0, 2)} · ${t}</b><br>${s}</div></div>`).join('')}</div>
  <h2>Carrousel · Compte de paiement ou compte bancaire ? (8 pages)</h2><div class="g" style="grid-template-columns:repeat(8,1fr);gap:14px">${[1, 2, 3, 4, 5, 6, 7, 8].map(i => `<div>${img(cp(i), 258)}<div class="l">Page ${i}</div></div>`).join('')}</div>`);
for (const [html, file, w] of [[carSheet, path.join(OUT, 'carrousel', 'fynovates-carrousel-planche.png'), 3160], [glob, path.join(OUT, 'fynovates-planche-globale.png'), 2400]]) {
  fs.writeFileSync(tmp, html); await pg.setViewportSize({ width: w, height: 1000 }); await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(300); await pg.screenshot({ path: file, fullPage: true }); }
await b.close();
console.log(issues.length ? 'À CORRIGER :\n' + issues.join('\n') : 'Contrôle : aucun débordement détecté.');
