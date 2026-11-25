// Présentation PDF (diapositives 1920 × 1080) + planche globale PNG. À lancer après build.mjs.
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module';
import { ROOT, fontCSS, fix, C } from './core.mjs';
import { FEED, REELS } from './feed.mjs'; import { STORIES, STYLES, SEQUENCES, HIGHLIGHTS, HL_CONTENU } from './stories.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const O = path.join(ROOT, 'output'), f = fix, u = (...p) => 'file://' + path.join(O, ...p);
const css = `${fontCSS}*{box-sizing:border-box;margin:0;padding:0}body{-webkit-font-smoothing:antialiased;font-family:Jost;color:${C.espresso}}
.s{width:1920px;height:1080px;position:relative;overflow:hidden;background:${C.paper};padding:64px 90px;page-break-after:always}
.k{font:500 15px Jost;letter-spacing:.26em;text-transform:uppercase;color:${C.cognac}}.h{font:500 52px/1.05 Cormorant;margin-top:10px}.p{font:400 18px/1.5 Jost;color:${C.ink}}
.c{font:400 13px/1.35 Jost;color:${C.stone};margin-top:6px}img{display:block}.ph{border-radius:34px;box-shadow:0 0 0 9px #1a1a1a,0 20px 50px rgba(0,0,0,.18);overflow:hidden;flex:none}`;
const phone = (src, w, h) => `<div class="ph" style="width:${w}px;height:${h}px"><img src="${src}" style="width:${w}px"></div>`;
const head = (k, h, p = '') => `<div class="k">${k}</div><div class="h">${f(h)}</div>${p ? `<p class="p" style="margin-top:10px;max-width:1150px">${f(p)}</p>` : ''}`;
const stv = s => u('04-stories', `style-${s.style}`, 'apercu-telephone', `${s.id}.png`);
const byStyle = n => STORIES.filter(s => s.style === n);
const fp = p => u('02-feed', `madame-caci-feed-${p.id}.png`);

const slides = [
  `<div class="s" style="background:${C.espresso};color:${C.cream};padding:0"><div style="position:absolute;right:0;top:0;width:820px;height:1080px;background:url('${fp(FEED[0])}') center/cover"></div>
   <div style="position:absolute;left:110px;top:320px;width:900px"><div class="k" style="color:#D9B89C">Proposition · Instagram personnel</div><div style="font:500 112px/1 Cormorant;margin-top:24px">Tiziana Caci</div>
   <p style="font:400 26px/1.5 Jost;margin-top:30px;color:rgba(243,237,228,.85)">Profil, feed photographique, Reels, Stories aux codes natifs d’Instagram, séquences et Stories à la une.</p></div></div>`,
  `<div class="s">${head('Les principes', 'Un compte personnel, photographique et incarné')}
   <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:40px;margin-top:44px">${[
     ['Bio', 'Une seule ligne : « Fondatrice & directrice de @fynovates ». La mention renvoie vers le compte du cabinet.'],
     ['Feed', 'Uniquement des photographies : Tiziana, ses lieux de travail, ses déplacements, des détails. Aucun texte sur les images, aucun logo.'],
     ['Reels', 'Tiziana prend la parole. Les miniatures sont des images de la vidéo avec un sous-titre sobre, sans couverture graphique.'],
     ['Stories', 'Les styles de l’éditeur Instagram : sérif sur bandeaux blancs, sans-sérif blanc ou sur fond sombre, stickers natifs.']].map(([t, d]) => `<div style="border-top:1px solid ${C.espresso};padding-top:18px"><div style="font:500 34px Cormorant">${t}</div><p class="p" style="margin-top:10px">${f(d)}</p></div>`).join('')}</div>
   <div style="display:flex;gap:16px;margin-top:56px">${['portrait-studio', 'studio-podcast', 'bureau-debout', 'bureau-rire-documents', 'jardin-voyage'].map(k => `<div style="flex:1;height:330px;background:url('file://${ROOT}/photos/traitees/${k}.jpg') center 30%/cover"></div>`).join('')}</div>
   <div class="c" style="margin-top:10px">Les cinq photographies fournies, avec un même étalonnage léger et sans retouche du visage.</div></div>`,
  `<div class="s" style="display:grid;grid-template-columns:420px 1fr;gap:80px">${phone(u('01-profil', 'mockup-1-profil-complet.png'), 400, 952)}
   <div>${head('Mockup 1 · Profil complet', 'Une bio d’une ligne, un portrait reconnaissable', 'Photo de profil : portrait réel de Tiziana. Nom affiché : Tiziana Caci. Bio : « Fondatrice & directrice de @fynovates », la mention en couleur de lien, comme dans l’application.')}
   <div style="margin-top:40px;background:#fff;padding:30px 34px;max-width:620px;box-shadow:0 0 0 1px rgba(0,0,0,.06)"><div style="font:700 17px/1.4 Jost">Tiziana Caci</div><div style="font:400 17px/1.4 Jost">Fondatrice &amp; directrice de <span style="color:#00376B;font-weight:500">@fynovates</span></div></div>
   <p class="c" style="margin-top:14px;max-width:620px">L’identifiant du compte n’a pas été fourni : il apparaît comme « [identifiant] » et sera remplacé par le vrai nom de compte. Les nombres d’abonnés sont des emplacements.</p>
   <div class="k" style="margin-top:44px">Stories à la une</div><div style="display:flex;gap:34px;margin-top:16px">${HIGHLIGHTS.map(h => `<div style="text-align:center"><img src="${u('06-stories-a-la-une', 'couvertures', `highlight-${h.id}.png`)}" style="width:110px;height:110px;border-radius:50%;box-shadow:0 0 0 4px #fff,0 0 0 5px #ddd"><div style="font:400 16px Jost;margin-top:10px">${h.nom}</div></div>`).join('')}</div></div></div>`,
  `<div class="s" style="display:grid;grid-template-columns:420px 1fr;gap:80px">${phone(u('02-feed', 'mockup-2-feed-15-photos.png'), 400, 952)}
   <div>${head('Mockup 2 · Feed', 'Quinze photographies, sans aucun texte', 'Tiziana (portraits, assise, debout, en extérieur, au travail), lieux et architecture, moments professionnels et détails. La publication 5 est un carrousel de photos.')}
   <div style="display:grid;grid-template-columns:repeat(8,1fr);gap:12px;margin-top:28px">${FEED.map(p => `<div><img src="${fp(p)}" style="width:100%"><div class="c">${f(p.cat)}${p.illustration ? ' · photo de lieu (projet)' : ''}${p.manquante ? ' · à fournir' : ''}</div></div>`).join('')}</div></div></div>`,
  `<div class="s">${head('Feed · Légendes', 'Les réflexions passent dans la légende, pas sur l’image')}
   <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:26px 40px;margin-top:34px">${FEED.filter(p => !p.manquante).slice(0, 9).map(p => `<div style="display:grid;grid-template-columns:120px 1fr;gap:18px;align-items:center"><img src="${fp(p)}" style="width:120px"><p style="font:italic 500 23px/1.3 Cormorant">« ${f(p.legende)} »</p></div>`).join('')}</div>
   <div class="k" style="margin-top:40px">Carrousel photographique · publication 5</div><div style="display:flex;gap:14px;margin-top:14px">${[1, 2, 3, 4].map(i => `<img src="${u('02-feed', 'carrousel-photo-05', `madame-caci-carrousel-05-photo-0${i}.png`)}" style="width:180px">`).join('')}</div></div>`,
  `<div class="s" style="display:grid;grid-template-columns:420px 1fr;gap:80px">${phone(u('03-reels', 'mockup-onglet-reels.png'), 400, 952)}
   <div>${head('Reels', 'Tiziana prend la parole', 'Face caméra, reportage et terrain, extraits YouTube, storytelling. Miniatures : image de la vidéo et sous-titre sobre. Ici, les images viennent des photos fournies, en attendant les vraies captures des vidéos.')}
   <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:12px;margin-top:26px">${REELS.map(r => `<div><img src="${u('03-reels', 'couvertures', `madame-caci-reel-${r.id}.png`)}" style="width:100%"><div class="c">${f(r.cat)}${r.manquante ? ' · à tourner' : ''}</div></div>`).join('')}</div></div></div>`,
  `<div class="s">${head('Mockup 3 · Stories', 'Les codes de l’éditeur natif d’Instagram')}
   <div style="display:grid;grid-template-columns:repeat(9,1fr);gap:14px;margin-top:28px">${[...byStyle(1), ...byStyle(2), ...byStyle(5), ...byStyle(4), ...byStyle(6).slice(0, 2), ...byStyle(3), ...byStyle(6).slice(2)].map(s => `<div><img src="${stv(s)}" style="width:100%;border-radius:14px"><div class="c">${f(STYLES[s.style])}</div></div>`).join('')}</div></div>`,
  ...[[1, 2], [3, 5], [4, 6]].map(g => `<div class="s">${head('Stories · ' + g.map(n => STYLES[n]).join(' et '), g[0] === 1 ? 'Convictions en sérif sur bandeaux blancs, réflexions en sans-sérif' : g[0] === 3 ? 'Textes courts, lieux et réflexions' : 'Face caméra et stickers natifs')}
   <div style="display:flex;gap:20px;margin-top:30px">${g.flatMap(n => byStyle(n)).map(s => `<div style="width:${g[0] === 4 ? 230 : 260}px"><img src="${stv(s)}" style="width:100%;border-radius:18px"><div class="c">${f(STYLES[s.style])} · ${f(s.nom)}</div></div>`).join('')}</div>
   ${g[0] === 4 ? '<p class="c" style="margin-top:14px">Stickers simulés pour l’aperçu. Les fichiers de production gardent l’emplacement libre pour poser les vrais stickers dans Instagram.</p>' : ''}</div>`),
  ...SEQUENCES.map((q, i) => `<div class="s">${head('Séquence ' + 'ABCD'[i], q.titre, q.theme)}
   <div style="display:flex;gap:26px;margin-top:30px">${q.ecrans.map(([nom], j) => `<div style="width:300px"><img src="${u('05-sequences', q.id, 'apercu-telephone', `ecran-${j + 1}.png`)}" style="width:300px;border-radius:22px"><div class="c" style="font-size:15px">${j + 1}. ${nom}</div></div>`).join('')}</div></div>`),
  `<div class="s">${head('Stories à la une', 'Cinq rubriques permanentes, en français', 'Couvertures photographiques recadrées dans les photos réelles. L’intitulé s’affiche sous le cercle, comme dans Instagram.')}
   <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:30px;margin-top:34px">${HIGHLIGHTS.map(h => `<div style="text-align:center"><img src="${u('06-stories-a-la-une', 'couvertures', `highlight-${h.id}.png`)}" style="width:130px;height:130px;border-radius:50%;margin:0 auto"><div style="font:500 21px Jost;margin-top:12px">${h.nom}</div>
     <div style="display:flex;gap:8px;justify-content:center;margin-top:16px"><img src="${u('06-stories-a-la-une', 'stories', `highlight-${h.id}-story.png`)}" style="width:105px;border-radius:8px">${HL_CONTENU[h.id].map(id => { const s = STORIES.find(x => x.id === id); return `<img src="${u('04-stories', `style-${s.style}`, `madame-caci-story-${s.id}${s.sticker ? '-apercu-sticker' : ''}.png`)}" style="width:105px;border-radius:8px">`; }).join('')}</div></div>`).join('')}</div>
   <p class="c" style="margin-top:18px">Sous chaque rubrique : la story d’introduction, puis deux stories du projet à y ranger.</p></div>`,
  `<div class="s">${head('À compléter', 'Les photographies et informations manquantes', 'Aucune scène n’a été inventée avec Tiziana. Voici ce qu’il faut fournir pour finaliser le compte.')}
   <div style="display:grid;grid-template-columns:1fr 1fr;gap:50px;margin-top:40px">
   <div>${['Le vrai nom de compte Instagram (identifiant).', 'Des photos de Tiziana en réunion et avec ses collaborateurs.', 'Des photos de Tiziana lors d’un événement.', 'Des photos de ses vrais déplacements : villes, rues, hôtels, lieux de rencontre.', 'Des captures des vidéos réelles pour les miniatures de Reels et les Stories face caméra.', 'Le nom de la chaîne YouTube pour les stickers de lien.'].map((t, i) => `<div style="display:grid;grid-template-columns:50px 1fr;padding:16px 0;border-top:1px solid rgba(33,27,23,.15)"><span style="font:500 26px Cormorant;color:${C.cognac}">${i + 1}</span><span class="p" style="font-size:20px">${f(t)}</span></div>`).join('')}</div>
   <div><p class="p">Les photos de lieux (Londres, New York, tours, bureaux) proviennent des ressources du projet (Unsplash) et servent d’illustration en attendant ses propres photos.</p>
   <p class="p" style="margin-top:16px">Les captures de comptes et de Stories de référence (Louis Key, Ludovic Key) n’ont pas été reçues dans les fichiers : les styles natifs ont été reproduits d’après les conventions de l’éditeur Instagram.</p>
   <p class="p" style="margin-top:16px">Les polices natives d’Instagram ne sont pas installables : les maquettes utilisent des polices proches. Les Stories finales se tapent directement dans l’application.</p></div></div></div>`,
];
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } });
const tmp = path.join(fs.mkdtempSync('/tmp/mcp-'), 'p.html');
fs.rmSync(path.join(O, '07-presentation'), { recursive: true, force: true }); fs.mkdirSync(path.join(O, '07-presentation', 'diapositives'), { recursive: true });
fs.writeFileSync(tmp, `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}@page{size:1920px 1080px;margin:0}</style></head><body>${slides.join('')}</body></html>`);
await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(600);
const els = await pg.$$('.s'); for (const [i, e] of els.entries()) await e.screenshot({ path: path.join(O, '07-presentation', 'diapositives', `diapositive-${String(i + 1).padStart(2, '0')}.png`) });
const board = `<div style="width:2400px;background:${C.paper};padding:80px">
 <div class="k">Tiziana Caci · Instagram</div><div style="font:500 76px/1 Cormorant;margin-top:14px">Planche globale du compte</div>
 <div style="display:flex;gap:50px;margin-top:50px;align-items:flex-start">${phone(u('01-profil', 'mockup-1-profil-complet.png'), 380, 1380)}${phone(u('03-reels', 'mockup-onglet-reels.png'), 380, 1380)}
  <div style="flex:1"><div class="k" style="color:${C.stone}">Feed · 15 photographies</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:12px">${FEED.map(p => `<img src="${fp(p)}" style="width:100%">`).join('')}</div>
  <div class="k" style="color:${C.stone};margin-top:34px">Stories à la une</div><div style="display:flex;gap:30px;margin-top:12px">${HIGHLIGHTS.map(h => `<div style="text-align:center"><img src="${u('06-stories-a-la-une', 'couvertures', `highlight-${h.id}.png`)}" style="width:110px;height:110px;border-radius:50%"><div class="c">${h.nom}</div></div>`).join('')}</div></div></div>
 <div class="k" style="color:${C.stone};margin-top:50px">Stories · codes natifs</div><div style="display:grid;grid-template-columns:repeat(18,1fr);gap:8px;margin-top:12px">${STORIES.map(s => `<img src="${stv(s)}" style="width:100%;border-radius:8px">`).join('')}</div>
 <div class="k" style="color:${C.stone};margin-top:50px">Reels · 12 vidéos</div><div style="display:grid;grid-template-columns:repeat(12,1fr);gap:8px;margin-top:12px">${REELS.map(r => `<img src="${u('03-reels', 'couvertures', `madame-caci-reel-${r.id}.png`)}" style="width:100%">`).join('')}</div>
 <div class="k" style="color:${C.stone};margin-top:50px">Séquences A · B · C · D</div><div style="display:grid;grid-template-columns:repeat(17,1fr);gap:8px;margin-top:12px">${SEQUENCES.flatMap(q => q.ecrans.map((_, j) => `<img src="${u('05-sequences', q.id, 'apercu-telephone', `ecran-${j + 1}.png`)}" style="width:100%;border-radius:8px">`)).join('')}</div></div>`;
fs.writeFileSync(tmp, `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}body{width:2400px}</style></head><body>${board}</body></html>`);
await pg.setViewportSize({ width: 2400, height: 1000 }); await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500);
await pg.screenshot({ path: path.join(O, '07-presentation', 'madame-caci-planche-globale.png'), fullPage: true });
await b.close(); console.log('présentation :', els.length, 'diapositives');
// PDF compact : diapositives en JPEG (le PDF navigateur intègre les images sans compression)
import { execFileSync } from 'child_process';
execFileSync('python3', ['-c', `from PIL import Image;import glob
fs=sorted(glob.glob('${O}/07-presentation/diapositives/*.png'));ims=[Image.open(f).convert('RGB') for f in fs]
ims[0].save('${O}/07-presentation/madame-caci-presentation.pdf',save_all=True,append_images=ims[1:],resolution=144,quality=88)`]);
