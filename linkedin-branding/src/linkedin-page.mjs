// Simulation d'une page entreprise LinkedIn (structure visuelle de LinkedIn, chrome neutre, sans logo LinkedIn).
// Les visuels affichés sont les fichiers PNG générés pour la direction.
import path from 'path';
import { fontCSS, fix } from './core.mjs';
import * as C from './content.mjs';

const BLUE = '#0A66C2', GREEN = '#01754F', BG = '#F4F2EE', BORDER = '#E0DFDC', TXT = 'rgba(0,0,0,.9)', SUB = 'rgba(0,0,0,.6)';
const src = (base, rel) => 'file://' + path.join(base, rel);
const files = (D, base) => { const id = D.id.toLowerCase();
  return { profil: src(base, `01-identite/fynovates-${id}-photo-de-profil.png`), banniere: src(base, `01-identite/fynovates-${id}-banniere-linkedin.png`),
    v: n => src(base, `02-publications/fynovates-${id}-${n}.png`), car: src(base, `03-carrousel-pdf/pages/fynovates-${id}-carrousel-page-01.png`), cas: src(base, `04-etude-de-cas/pages/fynovates-${id}-cas-page-01.png`) }; };

// Fil : 8 publications de formats différents.
const feed = f => [
  { img: f.v('editorial-1'), txt: C.POSTS.edito, quand: '2 j' },
  { img: f.car, txt: C.POSTS.carrousel, quand: '4 j', doc: `${C.CARROUSEL.titre} · 8 pages` },
  { img: f.v('infographie'), txt: C.POSTS.infog, quand: '1 sem' },
  { img: f.cas, txt: C.POSTS.cas, quand: '1 sem', doc: 'Étude de cas : TVA e-commerce · 5 pages' },
  { img: f.v('actualite'), txt: C.POSTS.actu, quand: '2 sem' },
  { img: f.v('expert'), txt: C.POSTS.expert, quand: '2 sem' },
  { img: f.v('comparatif'), txt: C.POSTS.comparatif, quand: '3 sem' },
  { img: f.v('corporate'), txt: C.POSTS.corporate, quand: '1 mois' },
];
const ico = (s = 20, r = 4) => `<span style="display:inline-block;width:${s}px;height:${s}px;border-radius:${r}px;background:rgba(0,0,0,.42);vertical-align:middle"></span>`;
const base = `${fontCSS()}*{box-sizing:border-box;margin:0;padding:0}body{background:${BG};font-family:Inter,system-ui,sans-serif;color:${TXT};-webkit-font-smoothing:antialiased}
.card{background:#fff;border:1px solid ${BORDER};border-radius:8px}
.btn{display:inline-flex;align-items:center;gap:6px;height:34px;padding:0 16px;border-radius:17px;font-weight:600;font-size:15px}
.pri{background:${BLUE};color:#fff}.out{border:1px solid ${BLUE};color:${BLUE}}.gr{border:1px solid rgba(0,0,0,.6);color:${SUB}}
.sub{color:${SUB}}img{display:block}`;

const post = (p, f, w, mobile = false) => `<article class="card" style="${mobile ? 'border-radius:0;border-left:0;border-right:0;margin-top:8px' : 'margin-top:8px'}">
  <div style="display:flex;gap:8px;padding:12px 16px 0"><img src="${f.profil}" width="48" height="48" style="border-radius:2px"><div style="line-height:1.3"><div style="font-size:14px;font-weight:600">FYNOVATES</div><div class="sub" style="font-size:12px">${fix(C.PAGE.abonnes)}</div><div class="sub" style="font-size:12px">${p.quand} · ${ico(11, 6)}</div></div>
  <div class="sub" style="margin-left:auto;font-size:20px;letter-spacing:1px">···</div></div>
  <div style="padding:10px 16px 12px;font-size:14px;line-height:1.43;white-space:pre-line">${fix(p.txt)} <span class="sub">…plus</span></div>
  ${p.doc ? `<div style="background:#1D2226;color:#fff;font-size:13px;font-weight:600;padding:9px 14px;display:flex;justify-content:space-between"><span style="overflow:hidden;white-space:nowrap;text-overflow:ellipsis;max-width:${w - 90}px">${fix(p.doc)}</span><span style="opacity:.8">1 / ${p.doc.includes('8') ? 8 : 5}</span></div>` : ''}
  <img src="${p.img}" width="${w}" height="${Math.round(w * 1.25)}">
  <div style="margin:0 16px;padding:8px 0;border-bottom:1px solid ${BORDER};font-size:12px" class="sub">${ico(16, 8)} <span style="margin-left:4px">[Réactions]</span><span style="float:right">[Commentaires]</span></div>
  <div style="display:flex;justify-content:space-around;padding:4px 8px 6px;font-size:14px;font-weight:600" class="sub">${['J’aime', 'Commenter', 'Republier', 'Envoyer'].map(a => `<span style="padding:10px 8px;display:flex;gap:6px;align-items:center">${ico(18)}${mobile ? '' : a}</span>`).join('')}</div></article>`;

export const linkedinDesktop = (D, root) => { const f = files(D, root), W = 1128;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${base}</style></head><body style="width:1440px">
  <header style="height:52px;background:#fff;border-bottom:1px solid ${BORDER};position:relative"><div style="width:${W}px;margin:0 auto;height:52px;display:flex;align-items:center;gap:10px">
    <span style="width:34px;height:34px;border-radius:4px;background:#5b6b7b"></span><span style="width:280px;height:34px;border-radius:4px;background:#EDF3F8;display:flex;align-items:center;padding:0 12px;font-size:14px;gap:8px" class="sub">${ico(14, 7)} Recherche</span>
    <nav style="margin-left:auto;display:flex;gap:8px">${['Accueil', 'Réseau', 'Emplois', 'Messagerie', 'Notifications', 'Vous'].map(x => `<span style="width:80px;text-align:center;font-size:12px;line-height:1.6" class="sub">${ico(22)}<br>${x}</span>`).join('')}</nav></div></header>
  <main style="width:${W}px;margin:24px auto 40px">
    <section class="card" style="overflow:hidden;position:relative">
      <img src="${f.banniere}" width="${W}" height="191">
      <img src="${f.profil}" width="160" height="160" style="position:absolute;left:24px;top:111px;border:4px solid #fff;background:#fff">
      <div style="padding:104px 24px 0">
        <h1 style="font-size:24px;font-weight:600;letter-spacing:-.01em">FYNOVATES</h1>
        <p style="font-size:16px;margin-top:4px">${fix(C.MARQUE.slogan)}</p>
        <p class="sub" style="font-size:14px;margin-top:6px">${C.PAGE.secteur} · ${fix(C.PAGE.lieu)} · ${fix(C.PAGE.abonnes)} · ${fix(C.PAGE.taille)}</p>
        <div style="display:flex;gap:8px;margin-top:16px"><span class="btn pri">+ Suivre</span><span class="btn out">Visiter le site web ↗</span><span class="btn out">Contacter</span><span class="btn gr">Plus</span></div></div>
      <nav style="display:flex;gap:4px;padding:0 12px;margin-top:16px;border-top:1px solid ${BORDER}">${['Accueil', 'À propos', 'Posts', 'Emplois', 'Personnes'].map((x, i) => `<span style="padding:14px 12px;font-size:16px;font-weight:600;${i === 0 ? `color:${GREEN};box-shadow:inset 0 -2px 0 ${GREEN}` : `color:${SUB}`}">${x}</span>`).join('')}</nav></section>
    <div style="display:grid;grid-template-columns:300px 552px 228px;gap:24px;margin-top:8px;align-items:start">
      <aside>
        <section class="card" style="padding:20px 24px;margin-top:8px"><h2 style="font-size:20px;font-weight:600">Présentation</h2>
          ${C.PAGE.presentation.map(t => `<p style="font-size:14px;line-height:1.5;margin-top:12px">${fix(t)}</p>`).join('')}</section>
        <section class="card" style="padding:20px 24px;margin-top:8px"><h2 style="font-size:20px;font-weight:600">Informations</h2>
          ${[['Site web', `<span style="color:${BLUE};font-weight:600">${C.MARQUE.site}</span>`], ['Secteur', C.PAGE.secteur], ['Taille de l’entreprise', fix(C.PAGE.taille)], ['Siège social', fix(C.PAGE.lieu)], ['Spécialisations', fix(C.PAGE.specialisations)]].map(([k, v]) => `<div style="margin-top:14px;font-size:14px;line-height:1.45"><div style="font-weight:600">${k}</div><div class="sub">${v}</div></div>`).join('')}</section></aside>
      <div>
        <section class="card" style="padding:14px 16px;margin-top:8px;display:flex;gap:8px;align-items:center"><span style="font-size:16px;font-weight:600;margin-right:6px">Publications de la Page</span>${['Tout', 'Images', 'Documents'].map((x, i) => `<span style="height:32px;padding:0 12px;border-radius:16px;display:inline-flex;align-items:center;font-size:14px;font-weight:600;${i ? 'border:1px solid rgba(0,0,0,.4);color:' + SUB : 'background:' + GREEN + ';color:#fff'}">${x}</span>`).join('')}</section>
        ${feed(f).map(p => post(p, f, 550)).join('')}</div>
      <aside>
        <section class="card" style="padding:18px 16px;margin-top:8px"><h2 style="font-size:16px;font-weight:600">Domaines d’expertise</h2>${C.MARQUE.expertises.map(x => `<p style="font-size:14px;line-height:1.4;margin-top:10px;padding-top:10px;border-top:1px solid ${BORDER}">${fix(x)}</p>`).join('')}</section>
        <section class="card" style="padding:18px 16px;margin-top:8px"><h2 style="font-size:16px;font-weight:600">Accompagne</h2><p class="sub" style="font-size:14px;line-height:1.5;margin-top:10px">Consultants et freelances, agences, e-commerçants, fondateurs de SaaS, entrepreneurs digitaux, dirigeants de sociétés internationales.</p></section></aside>
    </div></main></body></html>`; };

export const linkedinMobile = (D, root) => { const f = files(D, root), W = 390;
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${base}</style></head><body style="width:${W}px">
  <div style="background:#fff;height:44px;display:flex;align-items:center;justify-content:space-between;padding:0 22px;font-size:15px;font-weight:600"><span>9:41</span><span>${ico(16, 3)} ${ico(16, 8)} ${ico(24, 4)}</span></div>
  <div style="background:#fff;height:48px;display:flex;align-items:center;gap:10px;padding:0 12px;border-bottom:1px solid ${BORDER}"><span class="sub" style="font-size:26px">‹</span><span style="flex:1;height:34px;border-radius:4px;background:#EDF3F8;display:flex;align-items:center;padding:0 12px;font-size:14px;gap:8px">${ico(14, 7)} FYNOVATES</span><span class="sub" style="font-size:20px">···</span></div>
  <section style="background:#fff;position:relative">
    <img src="${f.banniere}" width="${W}" height="${Math.round(W * 191 / 1128)}">
    <img src="${f.profil}" width="88" height="88" style="position:absolute;left:16px;top:26px;border:3px solid #fff;background:#fff">
    <div style="padding:54px 16px 16px">
      <h1 style="font-size:22px;font-weight:600">FYNOVATES</h1>
      <p style="font-size:15px;line-height:1.35;margin-top:4px">${fix(C.MARQUE.slogan)}</p>
      <p class="sub" style="font-size:13px;line-height:1.4;margin-top:6px">${C.PAGE.secteur} · ${fix(C.PAGE.lieu)}<br>${fix(C.PAGE.abonnes)} · ${fix(C.PAGE.taille)}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px"><span class="btn pri" style="justify-content:center">+ Suivre</span><span class="btn out" style="justify-content:center">Site web ↗</span></div></div>
    <nav style="display:flex;border-top:1px solid ${BORDER};padding:0 6px;overflow:hidden">${['Accueil', 'À propos', 'Posts', 'Emplois', 'Personnes'].map((x, i) => `<span style="padding:13px 10px;font-size:15px;font-weight:600;white-space:nowrap;${i === 0 ? `color:${GREEN};box-shadow:inset 0 -2px 0 ${GREEN}` : `color:${SUB}`}">${x}</span>`).join('')}</nav></section>
  <section style="background:#fff;margin-top:8px;padding:16px"><h2 style="font-size:18px;font-weight:600">Présentation</h2><p style="font-size:14px;line-height:1.5;margin-top:8px">${fix(C.PAGE.presentation[0])} ${fix(C.PAGE.presentation[1])} <span class="sub">…voir plus</span></p></section>
  <section style="background:#fff;margin-top:8px;padding:14px 16px 4px"><h2 style="font-size:18px;font-weight:600">Publications de la Page</h2></section>
  ${feed(f).slice(0, 7).map(p => post(p, f, W, true)).join('')}
  <div style="height:56px;background:#fff;border-top:1px solid ${BORDER};display:flex;justify-content:space-around;align-items:center;margin-top:8px">${['Accueil', 'Réseau', 'Publier', 'Notifications', 'Emplois'].map(x => `<span class="sub" style="font-size:10px;text-align:center;line-height:1.5">${ico(22)}<br>${x}</span>`).join('')}</div></body></html>`; };
