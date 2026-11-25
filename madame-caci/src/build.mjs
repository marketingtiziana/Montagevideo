// node madame-caci/src/build.mjs → madame-caci/output/ (livrables A à F)
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
import { ROOT } from './core.mjs';
import { FEED, CARROUSEL, REELS } from './feed.mjs';
import { STORIES, FAMILLES, SEQUENCES, HIGHLIGHTS, hlPhoto, hlTypo } from './stories.mjs';
import { profil, reelsTab, feedOnly, storyView } from './instagram-ui.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = path.join(ROOT, 'output'); fs.rmSync(OUT, { recursive: true, force: true });
const b = await chromium.launch(); const pg = await b.newPage(); const ui = await (await b.newContext({ deviceScaleFactor: 3 })).newPage();
const tmp = path.join(fs.mkdtempSync('/tmp/mc-'), 'p.html'); const issues = [];
const out = (...p) => { const f = path.join(OUT, ...p); fs.mkdirSync(path.dirname(f), { recursive: true }); return f; };
const url = (...p) => 'file://' + path.join(OUT, ...p);
const shot = async (html, file, w, h, p = pg) => { fs.writeFileSync(tmp, html); await p.setViewportSize({ width: w, height: h || 844 }); await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready);
  const bad = await p.evaluate(W => [...document.querySelectorAll('.cv *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && e.textContent.trim() && !e.children.length && (r.right > W + 2 || r.left < -2); }).map(e => e.textContent.slice(0, 40)), w);
  if (bad.length) issues.push(path.basename(file) + ' → ' + bad.join(' | ')); await p.screenshot({ path: file, fullPage: h === 0 }); };

// B · Feed : 15 photos + carrousel photo
for (const p of FEED) await shot(p.html(), out('B-feed', 'photos', `feed-${p.id}.png`), 1080, 1350);
for (const [i, h] of CARROUSEL.entries()) await shot(h(), out('B-feed', 'photos', 'carrousel-publication-05', `photo-0${i + 1}.png`), 1080, 1350);
// C · Reels
for (const r of REELS) await shot(r.html(), out('C-reels', 'miniatures', `reel-${r.id}.png`), 1080, 1920);
// D · Stories individuelles (dossier par famille ; interactives : fichier publiable + aperçu avec sticker)
for (const s of STORIES) { const dir = FAMILLES[s.famille - 1][0];
  await shot(s.html(false), out('D-stories', dir, `story-${s.id}.png`), 1080, 1920);
  if (s.sticker) await shot(s.html(true), out('D-stories', dir, 'apercus-avec-sticker', `story-${s.id}.png`), 1080, 1920); }
// E · Séquences écran par écran
for (const q of SEQUENCES) for (const [i, [, e]] of q.ecrans.entries()) {
  await shot(e.html(false), out('E-sequences', q.id, `ecran-${i + 1}.png`), 1080, 1920);
  if (e.sticker) await shot(e.html(true), out('E-sequences', q.id, 'apercus-avec-sticker', `ecran-${i + 1}.png`), 1080, 1920); }
// F · Stories à la une : 2 couvertures (photo + typographique) et leurs stories
for (const h of HIGHLIGHTS) {
  await shot(hlPhoto(h), out('F-stories-a-la-une', 'couvertures', `couverture-${h.id}.png`), 1080, 1080);
  await shot(hlTypo(h), out('F-stories-a-la-une', 'couvertures-variante-typographique', `couverture-${h.id}.png`), 1080, 1080);
  for (const [i, [, fn, opt = {}]] of h.stories.entries()) { await shot(fn(false), out('F-stories-a-la-une', h.id, `story-${i + 1}.png`), 1080, 1920);
    if (opt.sticker) await shot(fn(true), out('F-stories-a-la-une', h.id, 'apercus-avec-sticker', `story-${i + 1}.png`), 1080, 1920); } }

// Simulations d'interface (×3)
const fsrc = FEED.map(p => url('B-feed', 'photos', `feed-${p.id}.png`)), carr = FEED.map((p, i) => p.carrousel ? i : -1).filter(i => i >= 0);
const hl = (v = 'couvertures') => HIGHLIGHTS.map(h => [url('F-stories-a-la-une', v, `couverture-${h.id}.png`), h.nom]);
await shot(profil(fsrc, hl(), carr), out('A-profil', 'profil-instagram-page-complete.png'), 390, 0, ui);
await shot(profil(fsrc, hl(), carr), out('A-profil', 'profil-instagram-ecran.png'), 390, 844, ui);
await shot(feedOnly(fsrc, carr), out('B-feed', 'feed-instagram-grille-smartphone.png'), 390, 0, ui);
await shot(reelsTab(REELS.map(r => url('C-reels', 'miniatures', `reel-${r.id}.png`)), hl(), ), out('C-reels', 'onglet-reels-smartphone.png'), 390, 0, ui);
await shot(profil(fsrc, hl(), carr), out('F-stories-a-la-une', 'affichage-sous-la-bio.png'), 390, 844, ui);
await shot(profil(fsrc, hl('couvertures-variante-typographique'), carr), out('F-stories-a-la-une', 'affichage-sous-la-bio-variante-typographique.png'), 390, 844, ui);
// Aperçus téléphone (secondaires)
for (const s of STORIES) { const dir = FAMILLES[s.famille - 1][0];
  await shot(storyView(url('D-stories', dir, s.sticker ? 'apercus-avec-sticker' : '', `story-${s.id}.png`)), out('D-stories', dir, 'apercus-telephone', `story-${s.id}.png`), 390, 844, ui); }
for (const q of SEQUENCES) for (const [i, [, e]] of q.ecrans.entries())
  await shot(storyView(url('E-sequences', q.id, e.sticker ? 'apercus-avec-sticker' : '', `ecran-${i + 1}.png`), i, q.ecrans.length), out('E-sequences', q.id, 'apercus-telephone', `ecran-${i + 1}.png`), 390, 844, ui);
for (const h of HIGHLIGHTS) for (const [i, [, , opt = {}]] of h.stories.entries())
  await shot(storyView(url('F-stories-a-la-une', h.id, opt.sticker ? 'apercus-avec-sticker' : '', `story-${i + 1}.png`), i, h.stories.length, h.nom), out('F-stories-a-la-une', h.id, 'apercus-telephone', `story-${i + 1}.png`), 390, 844, ui);
await b.close();
console.log(issues.length ? 'À CORRIGER :\n' + issues.join('\n') : 'Contrôle : aucun texte hors cadre.');
