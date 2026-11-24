// Planche de branding LinkedIn d'une direction (1600 px de large, hauteur libre).
import path from 'path';
import { fontCSS, fix, logo } from './core.mjs';
import * as C from './content.mjs';

export const planche = (D, root) => {
  const id = D.id.toLowerCase(), u = r => 'file://' + path.join(root, r), U = D.ui;
  const pub = n => u(`02-publications/fynovates-${id}-${n}.png`);
  const car = Array.from({ length: 8 }, (_, i) => u(`03-carrousel-pdf/pages/fynovates-${id}-carrousel-page-0${i + 1}.png`));
  const cas = Array.from({ length: 5 }, (_, i) => u(`04-etude-de-cas/pages/fynovates-${id}-cas-page-0${i + 1}.png`));
  const desk = u(`05-page-linkedin/fynovates-${id}-page-linkedin-ordinateur.png`), mob = u(`05-page-linkedin/fynovates-${id}-page-linkedin-mobile.png`);
  const prof = u(`01-identite/fynovates-${id}-photo-de-profil.png`), ban = u(`01-identite/fynovates-${id}-banniere-linkedin.png`);
  const sec = (n, t, body, note = '') => `<section style="margin-top:72px"><div style="display:flex;align-items:baseline;gap:18px;border-top:1px solid ${U.line};padding-top:18px"><span style="font:600 14px Inter;color:${U.accent};letter-spacing:.12em">${String(n).padStart(2, '0')}</span><h2 style="font:600 26px Inter;letter-spacing:-.01em">${t}</h2>${note ? `<span style="margin-left:auto;font:400 15px Inter;color:${U.mute}">${note}</span>` : ''}</div><div style="margin-top:24px">${body}</div></section>`;
  const img = (s, w, extra = '') => `<img src="${s}" style="width:${w};display:block;box-shadow:0 0 0 1px ${U.line};${extra}">`;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${fontCSS()}*{box-sizing:border-box;margin:0;padding:0}
  body{width:1600px;background:${U.bg};color:${U.ink};font-family:Inter;-webkit-font-smoothing:antialiased;padding:80px 80px 96px}
  .g{display:grid;gap:24px}.cap{font:400 14px/1.4 Inter;color:${U.mute};margin-top:10px}</style></head><body>
  <header style="display:grid;grid-template-columns:1fr 560px;gap:60px;align-items:end">
    <div><div style="font:600 14px Inter;letter-spacing:.2em;text-transform:uppercase;color:${U.mute}">Branding LinkedIn FYNOVATES · Direction ${D.id}</div>
      <h1 style="font:700 64px/1.04 Inter;letter-spacing:-.03em;margin-top:18px">${D.nom}</h1>
      <p style="font:400 22px/1.45 Inter;margin-top:18px;max-width:820px;color:${U.mute}">${fix(D.ref)}. ${fix(D.resume)}</p></div>
    <div class="g" style="grid-template-columns:repeat(5,1fr);gap:10px">${D.palette.map(([n, c]) => `<div><div style="height:96px;background:${c};box-shadow:0 0 0 1px ${U.line}"></div><div style="font:600 13px Inter;margin-top:8px">${n}</div><div style="font:400 12px Mono;color:${U.mute}">${c}</div></div>`).join('')}</div></header>
  <div class="g" style="grid-template-columns:repeat(3,1fr);margin-top:40px">${D.typos.map(([n, r, f]) => `<div style="border-top:2px solid ${U.ink};padding-top:16px"><div style="font-family:${f};font-size:46px;white-space:nowrap;font-weight:${f === 'Inter' && n.includes('Bold') ? 700 : 500};line-height:1">Aa Éé 10 000 €</div><div style="font:600 15px Inter;margin-top:14px">${n}</div><div class="cap" style="margin-top:2px">${r}</div></div>`).join('')}</div>

  ${sec(1, 'Logo typographique', `<div class="g" style="grid-template-columns:1fr 1fr"><div style="height:240px;background:#fff;box-shadow:0 0 0 1px ${U.line};display:flex;align-items:center;justify-content:center">${logo(560, '#0D082E')}</div><div style="height:240px;background:#0D082E;display:flex;align-items:center;justify-content:center">${logo(560, '#fff')}</div></div><p class="cap">Logo officiel FYNOVATES, vectorisé à l’identique. Aucune icône, aucun monogramme.</p>`)}
  ${sec(2, 'Bannière LinkedIn', `${img(ban, '1440px')}<p class="cap">1128 × 191 px (exportée en 2×, PNG et SVG).</p>`)}
  ${sec(3, 'Photo de profil', `<div style="display:flex;gap:48px;align-items:flex-end">${img(prof, '320px')}${img(prof, '160px')}${img(prof, '72px')}${img(prof, '48px')}<p class="cap" style="max-width:420px">400 × 400 px. Tailles réelles d’affichage : 160 px (en-tête de page), 72 px et 48 px (fil d’actualité).</p></div>`)}
  ${sec(4, 'En-tête de la page entreprise', `<div style="height:600px;overflow:hidden;box-shadow:0 0 0 1px ${U.line}"><img src="${desk}" style="width:1440px;display:block"></div>`, 'Simulation, version ordinateur')}
  ${sec(5, 'Fil de publications', `<div style="display:grid;grid-template-columns:420px 1fr;gap:40px"><div style="height:1640px;overflow:hidden;border-radius:28px;box-shadow:0 0 0 10px #111,0 0 0 11px ${U.line}"><img src="${mob}" style="width:420px;display:block"></div>
     <div class="g" style="grid-template-columns:repeat(3,1fr);align-content:start">${['editorial-1', 'infographie', 'actualite', 'expert', 'comparatif', 'corporate'].map(n => img(pub(n), '100%')).join('')}${img(car[0], '100%')}${img(cas[0], '100%')}${img(pub('methodologie'), '100%')}</div></div>`, 'Simulation mobile et vue d’ensemble du fil')}
  ${sec(6, 'Publication éditoriale', `<div class="g" style="grid-template-columns:repeat(2,560px)">${img(pub('editorial-1'), '560px')}${img(pub('editorial-2'), '560px')}</div><p class="cap">Deux variantes de composition sur le même sujet.</p>`)}
  ${sec(7, 'Infographie fiscale', `<div class="g" style="grid-template-columns:720px 1fr;align-items:start">${img(pub('infographie'), '720px')}<div>${img(pub('comparatif'), '100%')}<p class="cap">Tableau comparatif (exemple chiffré fictif).</p><div style="margin-top:24px">${img(pub('actualite'), '100%')}</div><p class="cap">Note d’actualité fiscale.</p></div></div>`)}
  ${sec(8, 'Carrousel PDF', `<div class="g" style="grid-template-columns:repeat(4,1fr)">${car.map(s => img(s, '100%')).join('')}</div>`, 'Compte de paiement ou compte bancaire · 8 pages')}
  ${sec(9, 'Étude de cas', `<div class="g" style="grid-template-columns:repeat(5,1fr)">${cas.map(s => img(s, '100%')).join('')}</div><p class="cap">${fix(C.CAS.mention)}</p>`, 'TVA e-commerce · 5 pages')}
  ${sec(10, 'Présentation d’expert et méthodologie', `<div class="g" style="grid-template-columns:repeat(2,560px)">${img(pub('expert'), '560px')}${img(pub('methodologie'), '560px')}</div><p class="cap">Photo, nom, fonction et présentation à compléter avec des informations réelles.</p>`)}
  ${sec(11, 'Publications institutionnelles', `<div class="g" style="grid-template-columns:repeat(3,1fr)">${img(pub('corporate'), '100%')}${img(pub('evenement'), '100%')}${img(pub('partenariat'), '100%')}</div><p class="cap">Prise de parole du cabinet, événement (emplacements à compléter), partenariat (exemple fictif à remplacer).</p>`)}
  </body></html>`;
};
