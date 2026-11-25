// Planches et PDF par livrable (A à F). À lancer après build.mjs.
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module'; import { execFileSync } from 'child_process';
import { ROOT, fontCSS, fix, C } from './core.mjs';
import { FEED, REELS } from './feed.mjs'; import { STORIES, FAMILLES, SEQUENCES, HIGHLIGHTS } from './stories.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const O = path.join(ROOT, 'output'), f = fix, u = (...p) => 'file://' + path.join(O, ...p), W = 2400;
const css = `${fontCSS}*{box-sizing:border-box;margin:0;padding:0}body{width:${W}px;background:${C.paper};font-family:Jost;color:${C.espresso};-webkit-font-smoothing:antialiased}
.wrap{padding:100px}.k{font:500 18px Jost;letter-spacing:.26em;text-transform:uppercase;color:${C.cognac}}h1{font:500 92px/1 Cormorant;margin-top:16px}
.lead{font:400 24px/1.5 Jost;color:${C.ink};max-width:1400px;margin-top:20px}h2{font:500 16px Jost;letter-spacing:.22em;text-transform:uppercase;color:${C.stone};margin:70px 0 20px}
.c{font:400 17px/1.4 Jost;color:${C.stone};margin-top:10px}img{display:block}.ph{border-radius:44px;box-shadow:0 0 0 12px #161412,0 24px 60px rgba(0,0,0,.18);overflow:hidden;flex:none;background:#fff}`;
const phone = (src, w, h) => `<div class="ph" style="width:${w}px;height:${h}px"><img src="${src}" style="width:${w}px"></div>`;
const top = (k, t, lead) => `<div class="k">${k}</div><h1>${f(t)}</h1>${lead ? `<p class="lead">${f(lead)}</p>` : ''}`;
const PL = [
  ['A-profil/planche-A-profil-instagram.png', `<div class="wrap">${top('Livrable A', 'Profil Instagram — Madame Caci', 'Portrait réel, nom affiché, bio minimaliste « Fondatrice & directrice de @fynovates », deux Stories à la une, grille photographique.')}
    <div style="display:flex;gap:90px;margin-top:60px;align-items:flex-start">${phone(u('A-profil', 'profil-instagram-ecran.png'), 600, 1300)}${phone(u('A-profil', 'profil-instagram-page-complete.png'), 600, 2050)}</div>
    <p class="c">À gauche : l’écran tel qu’il apparaît à l’ouverture. À droite : la page complète. « [identifiant] » et « [N] » sont à remplacer par les informations réelles.</p></div>`],
  ['B-feed/FEED-INSTAGRAM-MADAME-CACI.png', `<div class="wrap">${top('Livrable B', 'FEED INSTAGRAM — MADAME CACI')}
    <div style="display:flex;gap:90px;margin-top:60px;align-items:flex-start">${phone(u('B-feed', 'feed-instagram-grille-smartphone.png'), 620, 1640)}
    <div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${FEED.map(p => `<div style="aspect-ratio:4/5;background:url('${u('B-feed', 'photos', `feed-${p.id}.png`)}') center/cover"></div>`).join('')}</div></div></div>`],
  ['C-reels/planche-C-onglet-reels.png', `<div class="wrap">${top('Livrable C', 'Onglet Reels — Madame Caci', 'Douze vidéos où Tiziana prend la parole : face caméra, reportage et terrain, extraits YouTube, storytelling.')}
    <div style="display:flex;gap:90px;margin-top:60px;align-items:flex-start">${phone(u('C-reels', 'onglet-reels-smartphone.png'), 620, 1640)}
    <div style="flex:1;display:grid;grid-template-columns:repeat(4,1fr);gap:18px">${REELS.map(r => `<div><img src="${u('C-reels', 'miniatures', `reel-${r.id}.png`)}" style="width:100%"><div class="c">${f(r.cat)}${r.manquante ? ' · à tourner' : ''}</div></div>`).join('')}</div></div></div>`],
  ['F-stories-a-la-une/planche-F-stories-a-la-une.png', `<div class="wrap">${top('Livrable F', 'Stories à la une — Madame Caci', 'Deux rubriques uniquement : « À PROPOS DE MOI » et « MON CABINET ». Couverture photographique (proposition principale) ou typographique (variante).')}
    <div style="display:flex;gap:90px;margin-top:60px;align-items:flex-start">${phone(u('F-stories-a-la-une', 'affichage-sous-la-bio.png'), 600, 1300)}
    <div style="flex:1"><h2 style="margin-top:0">Couvertures</h2><div style="display:flex;gap:80px">${HIGHLIGHTS.map(h => `<div style="text-align:center"><div style="display:flex;gap:30px">${['couvertures', 'couvertures-variante-typographique'].map(v => `<div style="width:300px;height:300px;border-radius:50%;padding:9px;border:2px solid #DBDBDB"><img src="${u('F-stories-a-la-une', v, `couverture-${h.id}.png`)}" style="width:278px;height:278px;border-radius:50%"></div>`).join('')}</div><div style="font:500 28px Jost;margin-top:20px;letter-spacing:.04em">${h.nom}</div><div class="c">Photographie · Typographie</div></div>`).join('')}</div>
    <h2>Variante typographique sous la bio</h2>${phone(u('F-stories-a-la-une', 'affichage-sous-la-bio-variante-typographique.png'), 420, 520)}</div></div></div>`],
];
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: 1000 } }); const tmp = path.join(fs.mkdtempSync('/tmp/mcpl-'), 'p.html');
const py = code => execFileSync('python3', ['-c', 'from PIL import Image\nImage.MAX_IMAGE_PIXELS=None\n' + code]);
for (const [rel, body] of PL) {
  fs.writeFileSync(tmp, `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`);
  await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500);
  const png = path.join(O, rel); await pg.screenshot({ path: png, fullPage: true });
  py(`Image.open('${png}').convert('RGB').save('${png.replace('.png', '.pdf')}',resolution=144,quality=88)`); }
await b.close();
// PDF « une Story par page » (1080 × 1920) : Stories individuelles, chaque séquence, chaque rubrique à la une
const pdf = (files, dest) => py(`ims=[Image.open(f).convert('RGB') for f in ${JSON.stringify(files)}]\nims[0].save('${dest}',save_all=True,append_images=ims[1:],resolution=144,quality=88)`);
const D = path.join(O, 'D-stories'); const st = [];
for (const s of STORIES) { const dir = FAMILLES[s.famille - 1][0]; st.push(path.join(D, dir, s.sticker ? 'apercus-avec-sticker' : '', `story-${s.id}.png`)); }
pdf(st, path.join(D, 'stories-individuelles-une-par-page.pdf'));
for (const q of SEQUENCES) pdf(q.ecrans.map(([, e], i) => path.join(O, 'E-sequences', q.id, e.sticker ? 'apercus-avec-sticker' : '', `ecran-${i + 1}.png`)), path.join(O, 'E-sequences', `sequence-${q.id}.pdf`));
for (const h of HIGHLIGHTS) pdf(h.stories.map(([, , o = {}], i) => path.join(O, 'F-stories-a-la-une', h.id, o.sticker ? 'apercus-avec-sticker' : '', `story-${i + 1}.png`)), path.join(O, 'F-stories-a-la-une', `rubrique-${h.id}.pdf`));
console.log('planches et PDF prêts');
