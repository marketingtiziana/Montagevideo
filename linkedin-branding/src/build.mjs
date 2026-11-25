// Génère tous les fichiers d'une ou plusieurs directions : node src/build.mjs [A] [B] [C]
import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { ROOT, FONTS, fontCSS } from './core.mjs';
import A from './dir-a.mjs'; import B from './dir-b.mjs'; import Cc from './dir-c.mjs';
import { linkedinDesktop, linkedinMobile } from './linkedin-page.mjs';
import { planche } from './board.mjs';

const ALL = { A, B, C: Cc };
const want = process.argv.slice(2).filter(x => ALL[x]);
const DIRS = (want.length ? want : Object.keys(ALL)).map(k => ALL[k]);
const OUT = path.join(ROOT, 'output');
const FILE_OF = { Inter: ['Inter.ttf'], Mont: ['Montserrat.ttf'], SrcSerif: ['SourceSerif.ttf'], Playfair: ['Playfair.ttf'], Mono: ['PlexMono.ttf', 'PlexMonoMedium.ttf'] };

// SVG autonome : polices sous-ensemblées et intégrées (woff2), logo déjà vectoriel.
const standaloneSVG = (svg, tmp) => {
  const text = (svg.match(/>([^<>]+)</g) || []).map(s => s.slice(1, -1)).join('') + ' ';
  const used = Object.keys(FILE_OF).filter(f => svg.includes(`font-family="${f}"`));
  fs.writeFileSync(path.join(tmp, 't.txt'), text);
  const faces = used.flatMap(f => FILE_OF[f].map((file, k) => {
    const o = path.join(tmp, file + '.woff2');
    execFileSync('pyftsubset', [path.join(FONTS, file), `--text-file=${path.join(tmp, 't.txt')}`, '--flavor=woff2', `--output-file=${o}`, '--layout-features=*']);
    const w = file.includes('Medium') ? 'font-weight:500;' : (f === 'Mono' ? 'font-weight:400;' : 'font-weight:100 900;');
    return `@font-face{font-family:'${f}';${w}src:url(data:font/woff2;base64,${fs.readFileSync(o).toString('base64')}) format('woff2')}`;
  }));
  return svg.replace(/^<svg([^>]*)>/, `<svg$1><style>${faces.join('')}</style>`);
};
const svgPage = (svg, w, h) => `<!doctype html><html><head><meta charset="utf-8"><style>${fontCSS()}*{margin:0}body{width:${w}px;height:${h}px;overflow:hidden}</style></head><body>${svg}</body></html>`;

const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const pg = await ctx.newPage();
const mctx = await browser.newContext({ deviceScaleFactor: 2, viewport: { width: 390, height: 844 } });
const mp = await mctx.newPage();
const tmp = fs.mkdtempSync('/tmp/lbr-');
const shot = async (html, file, w, h, opts = {}) => {
  const f = path.join(tmp, 'p.html'); fs.writeFileSync(f, html);
  await pg.setViewportSize({ width: w, height: h }); await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(60);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await pg.screenshot({ path: file, fullPage: !!opts.full, clip: opts.full ? undefined : { x: 0, y: 0, width: w, height: h } });
};
const pdf = async (htmls, file, w, h) => {
  const body = htmls.map(x => { const m = x.match(/<body>([\s\S]*)<\/body>/); return `<section style="width:${w}px;height:${h}px;overflow:hidden;position:relative;page-break-after:always">${m[1]}</section>`; }).join('');
  const style = htmls[0].match(/<style>([\s\S]*?)<\/style>/)[1].replace(/html,body\{[^}]*\}/, 'html,body{margin:0}');
  const f = path.join(tmp, 'd.html'); fs.writeFileSync(f, `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${style}@page{size:${w}px ${h}px;margin:0}</style></head><body>${body}</body></html>`);
  await pg.goto('file://' + f); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(200);
  await pg.pdf({ path: file, width: w + 'px', height: h + 'px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
};

for (const D of DIRS) {
  const base = path.join(OUT, D.slug);
  fs.rmSync(base, { recursive: true, force: true });
  const id = D.id.toLowerCase();
  // 1. Identité : photo de profil + bannière (SVG autonomes + PNG)
  const idDir = path.join(base, '01-identite');
  fs.mkdirSync(idDir, { recursive: true });
  for (const [name, fn, w, h, scale] of [['photo-de-profil', D.profile, 400, 400, 1], ['banniere-linkedin', D.banner, 1128, 191, 2]]) {
    const svg = fn();
    fs.writeFileSync(path.join(idDir, `fynovates-${id}-${name}.svg`), standaloneSVG(svg, tmp));
    const big = svg.replace(/width="(\d+)" height="(\d+)"/, `width="${w * scale}" height="${h * scale}"`);
    await shot(svgPage(big, w * scale, h * scale), path.join(idDir, `fynovates-${id}-${name}.png`), w * scale, h * scale);
  }
  // 2. Publications individuelles (1080 × 1350)
  for (const [name, fn] of Object.entries(D.visuels)) await shot(fn(), path.join(base, '02-publications', `fynovates-${id}-${name}.png`), 1080, 1350);
  // 3. Carrousel PDF + pages
  const car = D.carrousel();
  for (const [i, h] of car.entries()) await shot(h, path.join(base, '03-carrousel-pdf', 'pages', `fynovates-${id}-carrousel-page-${String(i + 1).padStart(2, '0')}.png`), 1080, 1350);
  await pdf(car, path.join(base, '03-carrousel-pdf', `fynovates-${id}-carrousel-compte-paiement-compte-bancaire.pdf`), 1080, 1350);
  // 4. Étude de cas PDF + pages
  const cas = D.cas();
  for (const [i, h] of cas.entries()) await shot(h, path.join(base, '04-etude-de-cas', 'pages', `fynovates-${id}-cas-page-${String(i + 1).padStart(2, '0')}.png`), 1080, 1350);
  await pdf(cas, path.join(base, '04-etude-de-cas', `fynovates-${id}-etude-de-cas-tva-e-commerce.pdf`), 1080, 1350);
  // 5. Simulations de page LinkedIn (ordinateur, mobile)
  const sim = path.join(base, '05-page-linkedin');
  await shot(linkedinDesktop(D, base), path.join(sim, `fynovates-${id}-page-linkedin-ordinateur.png`), 1440, 900, { full: true });
  await shot(linkedinDesktop(D, base), path.join(sim, `fynovates-${id}-page-linkedin-ordinateur-ecran.png`), 1440, 900);
  const f = path.join(tmp, 'm.html'); fs.writeFileSync(f, linkedinMobile(D, base));
  await mp.goto('file://' + f); await mp.evaluate(() => document.fonts.ready); await mp.waitForTimeout(150);
  await mp.screenshot({ path: path.join(sim, `fynovates-${id}-page-linkedin-mobile.png`), fullPage: true });
  await mp.screenshot({ path: path.join(sim, `fynovates-${id}-page-linkedin-mobile-ecran.png`) });
  // 6. Planche de branding (PNG + PDF)
  const pl = path.join(base, '00-planche'); fs.mkdirSync(pl, { recursive: true });
  const fb = path.join(tmp, 'b.html'); fs.writeFileSync(fb, planche(D, base));
  await pg.setViewportSize({ width: 1600, height: 1000 }); await pg.goto('file://' + fb); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(250);
  await pg.screenshot({ path: path.join(pl, `fynovates-${id}-planche-branding.png`), fullPage: true });
  const hgt = await pg.evaluate(() => document.documentElement.scrollHeight);
  await pg.pdf({ path: path.join(pl, `fynovates-${id}-planche-branding.pdf`), width: '1600px', height: hgt + 'px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
  console.log('✓', D.slug);
}
await browser.close();
