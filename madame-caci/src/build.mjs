// node madame-caci/src/build.mjs → madame-caci/output/
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
import { ROOT } from './core.mjs';
import { FEED, CARROUSEL, REELS } from './feed.mjs';
import { STORIES, SEQUENCES, HIGHLIGHTS, hlPhoto } from './stories.mjs';
import { profil, reelsTab, feedOnly, storyView } from './instagram-ui.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = path.join(ROOT, 'output'); fs.rmSync(OUT, { recursive: true, force: true });
const D = { profil: '01-profil', feed: '02-feed', reels: '03-reels', stories: '04-stories', seq: '05-sequences', hl: '06-stories-a-la-une' };
const b = await chromium.launch(); const pg = await b.newPage(); const ui = await (await b.newContext({ deviceScaleFactor: 3 })).newPage();
const tmp = path.join(fs.mkdtempSync('/tmp/mc-'), 'p.html'); const issues = [];
const out = (...p) => { const f = path.join(OUT, ...p); fs.mkdirSync(path.dirname(f), { recursive: true }); return f; };
const shot = async (html, file, w, h, p = pg) => { fs.writeFileSync(tmp, html); await p.setViewportSize({ width: w, height: h || 844 }); await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready);
  const bad = await p.evaluate((W) => [...document.querySelectorAll('.cv *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && e.textContent.trim() && !e.children.length && (r.right > W + 2 || r.left < -2); }).map(e => e.textContent.slice(0, 40)), w);
  if (bad.length) issues.push(path.basename(file) + ' → ' + bad.join(' | ')); await p.screenshot({ path: file, fullPage: h === 0 }); };
const rel = (...p) => path.join(...p);

// Feed (15 photos) + carrousel photographique
for (const p of FEED) await shot(p.html(), out(D.feed, `madame-caci-feed-${p.id}.png`), 1080, 1350);
for (const [i, h] of CARROUSEL.entries()) await shot(h(), out(D.feed, 'carrousel-photo-05', `madame-caci-carrousel-05-photo-0${i + 1}.png`), 1080, 1350);
// Reels
for (const r of REELS) await shot(r.html(), out(D.reels, 'couvertures', `madame-caci-reel-${r.id}.png`), 1080, 1920);
// Stories (interactives : production sans sticker + aperçu avec sticker natif simulé)
for (const s of STORIES) { await shot(s.html(false), out(D.stories, `style-${s.style}`, `madame-caci-story-${s.id}.png`), 1080, 1920);
  if (s.sticker) await shot(s.html(true), out(D.stories, `style-${s.style}`, `madame-caci-story-${s.id}-apercu-sticker.png`), 1080, 1920); }
for (const q of SEQUENCES) for (const [i, [, e]] of q.ecrans.entries()) {
  await shot(e.html(false), out(D.seq, q.id, `ecran-${i + 1}.png`), 1080, 1920);
  if (e.sticker) await shot(e.html(true), out(D.seq, q.id, `ecran-${i + 1}-apercu-sticker.png`), 1080, 1920); }
for (const h of HIGHLIGHTS) { await shot(hlPhoto(h), out(D.hl, 'couvertures', `highlight-${h.id}.png`), 1080, 1080); await shot(h.intro(), out(D.hl, 'stories', `highlight-${h.id}-story.png`), 1080, 1920); }

// Interfaces simulées (×3)
const fsrc = FEED.map(p => 'file://' + path.join(OUT, D.feed, `madame-caci-feed-${p.id}.png`));
const carr = FEED.map((p, i) => p.carrousel ? i : -1).filter(i => i >= 0);
const hl = HIGHLIGHTS.map(h => ['file://' + path.join(OUT, D.hl, 'couvertures', `highlight-${h.id}.png`), h.nom]);
const rsrc = REELS.map(r => 'file://' + path.join(OUT, D.reels, 'couvertures', `madame-caci-reel-${r.id}.png`));
await shot(profil(fsrc, hl, carr), out(D.profil, 'mockup-1-profil-complet.png'), 390, 0, ui);
await shot(profil(fsrc, hl, carr), out(D.profil, 'mockup-1-profil-ecran.png'), 390, 844, ui);
await shot(feedOnly(fsrc, carr), out(D.feed, 'mockup-2-feed-15-photos.png'), 390, 0, ui);
await shot(reelsTab(rsrc, hl), out(D.reels, 'mockup-onglet-reels.png'), 390, 0, ui);
for (const q of SEQUENCES) for (const [i, [, e]] of q.ecrans.entries()) {
  const src = 'file://' + path.join(OUT, D.seq, q.id, `ecran-${i + 1}${e.sticker ? '-apercu-sticker' : ''}.png`);
  await shot(storyView(src, i, q.ecrans.length), out(D.seq, q.id, 'apercu-telephone', `ecran-${i + 1}.png`), 390, 844, ui); }
for (const s of STORIES) { const src = 'file://' + path.join(OUT, D.stories, `style-${s.style}`, `madame-caci-story-${s.id}${s.sticker ? '-apercu-sticker' : ''}.png`);
  await shot(storyView(src, 0, 1), out(D.stories, `style-${s.style}`, 'apercu-telephone', `${s.id}.png`), 390, 844, ui); }
await b.close();
console.log(issues.length ? 'À CORRIGER :\n' + issues.join('\n') : 'Contrôle : aucun texte hors cadre.');
