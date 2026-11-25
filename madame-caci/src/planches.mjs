// Planches séparées : feed, Stories, Stories à la une (PNG + PDF). À lancer après build.mjs.
import fs from 'fs'; import path from 'path'; import { createRequire } from 'module'; import { execFileSync } from 'child_process';
import { ROOT, fontCSS, fix, C } from './core.mjs';
import { FEED, CARROUSEL } from './feed.mjs'; import { STORIES, STYLES, SEQUENCES, HIGHLIGHTS, HL_CONTENU } from './stories.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const O = path.join(ROOT, 'output'), D = path.join(O, '08-planches'), f = fix, u = (...p) => 'file://' + path.join(O, ...p);
const W = 2400;
const css = `${fontCSS}*{box-sizing:border-box;margin:0;padding:0}body{width:${W}px;background:${C.paper};font-family:Jost;color:${C.espresso};-webkit-font-smoothing:antialiased}
.wrap{padding:90px}.k{font:500 16px Jost;letter-spacing:.26em;text-transform:uppercase;color:${C.cognac}}h1{font:500 84px/1 Cormorant;margin-top:14px}
.lead{font:400 22px/1.5 Jost;color:${C.ink};max-width:1300px;margin-top:18px}h2{font:500 15px Jost;letter-spacing:.22em;text-transform:uppercase;color:${C.stone};margin:60px 0 18px}
.c{font:400 15px/1.4 Jost;color:${C.stone};margin-top:8px}.q{font:italic 500 21px/1.3 Cormorant;color:${C.espresso};margin-top:6px}img{display:block}
.ph{border-radius:40px;box-shadow:0 0 0 11px #161412,0 24px 60px rgba(0,0,0,.18);overflow:hidden;flex:none;background:#fff}`;
const phone = (src, w, h) => `<div class="ph" style="width:${w}px;height:${h}px"><img src="${src}" style="width:${w}px"></div>`;
const top = (k, t, lead) => `<div class="k">${k}</div><h1>${f(t)}</h1><p class="lead">${f(lead)}</p>`;
const fp = p => u('02-feed', `madame-caci-feed-${p.id}.png`);
const stv = s => u('04-stories', `style-${s.style}`, 'apercu-telephone', `${s.id}.png`);
const stFile = s => u('04-stories', `style-${s.style}`, `madame-caci-story-${s.id}${s.sticker ? '-apercu-sticker' : ''}.png`);

const PL = {
  feed: `<div class="wrap">${top('Tiziana Caci · Instagram', 'Planche · Feed', 'Quinze photographies, sans texte, sans logo, sans montage. Tiziana, ses lieux de travail, l’architecture, les villes et les détails alternent. Les réflexions vivent dans les légendes.')}
   <div style="display:flex;gap:80px;margin-top:60px;align-items:flex-start">
    <div><h2 style="margin-top:0">Profil</h2>${phone(u('01-profil', 'mockup-1-profil-complet.png'), 430, 1500)}</div>
    <div style="flex:1"><h2 style="margin-top:0">Les 15 publications</h2>
     <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:18px">${FEED.map((p, i) => `<div><img src="${fp(p)}" style="width:100%"><div class="c"><b style="color:${C.espresso};font-weight:500">${String(i + 1).padStart(2, '0')} · ${f(p.cat)}</b>${p.illustration ? ' · lieu (projet)' : ''}${p.manquante ? ' · à fournir' : ''}${p.carrousel ? ' · carrousel' : ''}</div>${p.manquante ? '' : `<div class="q">« ${f(p.legende)} »</div>`}</div>`).join('')}</div>
     <h2>Carrousel photographique · publication 05</h2><div style="display:grid;grid-template-columns:repeat(4,280px);gap:18px">${CARROUSEL.map((_, i) => `<img src="${u('02-feed', 'carrousel-photo-05', `madame-caci-carrousel-05-photo-0${i + 1}.png`)}" style="width:280px">`).join('')}</div></div></div></div>`,
  stories: `<div class="wrap">${top('Tiziana Caci · Instagram', 'Planche · Stories', 'Les codes de l’éditeur natif d’Instagram : sérif noir sur bandeaux blancs pour les convictions, sans-sérif pour les réflexions, textes courts, face caméra, lieux et stickers natifs.')}
   ${Object.entries(STYLES).map(([n, nom]) => `<h2>Style ${n} · ${f(nom)}</h2><div style="display:flex;gap:30px">${STORIES.filter(s => String(s.style) === n).map(s => `<div style="width:340px"><img src="${stv(s)}" style="width:340px;border-radius:26px"><div class="c">${f(s.nom)}</div></div>`).join('')}</div>`).join('')}
   <h2>Séquences</h2>${SEQUENCES.map((q, i) => `<div style="margin-bottom:34px"><div style="font:500 30px Cormorant;margin-bottom:12px">${'ABCD'[i]} · ${f(q.titre)} <span style="font:400 17px Jost;color:${C.stone}">${f(q.theme)}</span></div><div style="display:flex;gap:22px">${q.ecrans.map(([nom], j) => `<div style="width:250px"><img src="${u('05-sequences', q.id, 'apercu-telephone', `ecran-${j + 1}.png`)}" style="width:250px;border-radius:20px"><div class="c">${j + 1}. ${f(nom)}</div></div>`).join('')}</div></div>`).join('')}
   <p class="c" style="margin-top:10px">Stickers simulés pour l’aperçu ; les fichiers de production laissent l’emplacement libre. Polices natives d’Instagram approchées : les Stories finales se tapent dans l’application.</p></div>`,
  highlights: `<div class="wrap">${top('Tiziana Caci · Instagram', 'Planche · Stories à la une', 'Cinq rubriques permanentes, en français. Couvertures photographiques recadrées dans les photos réelles ; l’intitulé s’affiche sous le cercle.')}
   <div style="display:flex;gap:80px;margin-top:60px;align-items:flex-start">
    <div><h2 style="margin-top:0">Affichage sur le profil</h2>${phone(u('01-profil', 'mockup-1-profil-ecran.png'), 430, 930)}</div>
    <div style="flex:1"><h2 style="margin-top:0">Les cinq couvertures</h2><div style="display:flex;gap:56px">${HIGHLIGHTS.map(h => `<div style="text-align:center"><div style="width:220px;height:220px;border-radius:50%;padding:7px;border:2px solid #DBDBDB"><img src="${u('06-stories-a-la-une', 'couvertures', `highlight-${h.id}.png`)}" style="width:202px;height:202px;border-radius:50%"></div><div style="font:500 24px Jost;margin-top:16px">${h.nom}</div></div>`).join('')}</div>
     <h2>Contenu de chaque rubrique</h2><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:28px">${HIGHLIGHTS.map(h => `<div><div style="font:500 26px Cormorant;margin-bottom:12px">${h.nom}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"><div><img src="${u('06-stories-a-la-une', 'stories', `highlight-${h.id}-story.png`)}" style="width:100%;border-radius:10px"><div class="c" style="font-size:13px">Introduction</div></div>${HL_CONTENU[h.id].map(id => { const s = STORIES.find(x => x.id === id); return `<div><img src="${stFile(s)}" style="width:100%;border-radius:10px"><div class="c" style="font-size:13px">${f(s.nom)}</div></div>`; }).join('')}</div></div>`).join('')}</div></div></div></div>`,
};
fs.rmSync(D, { recursive: true, force: true }); fs.mkdirSync(D, { recursive: true });
const b = await chromium.launch(); const pg = await b.newPage({ viewport: { width: W, height: 1000 } }); const tmp = path.join(fs.mkdtempSync('/tmp/mcpl-'), 'p.html');
for (const [k, body] of Object.entries(PL)) {
  fs.writeFileSync(tmp, `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`);
  await pg.goto('file://' + tmp); await pg.evaluate(() => document.fonts.ready); await pg.waitForTimeout(500);
  const png = path.join(D, `madame-caci-planche-${k}.png`); await pg.screenshot({ path: png, fullPage: true });
  execFileSync('python3', ['-c', `from PIL import Image;Image.MAX_IMAGE_PIXELS=None;Image.open('${png}').convert('RGB').save('${png.replace('.png', '.pdf')}',resolution=144,quality=88)`]);
}
await b.close(); console.log('planches :', Object.keys(PL).join(', '));
