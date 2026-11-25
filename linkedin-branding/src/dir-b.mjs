// DIRECTION B — THE MODERN FINANCIAL JOURNAL
// Publication professionnelle : en-tête de journal (filet épais + filet fin), titres Playfair très affirmés,
// texte courant en Source Serif, métadonnées en IBM Plex Mono, colonnes, figures numérotées, un accent brique.
import { fix, logo, page, photo, P } from './core.mjs';
import * as C from './content.mjs';

const T = { paper: '#FFFFFF', ink: '#14121C', navy: '#0D082E', rust: '#A33B20', mute: '#6B6870', line: 'rgba(20,18,28,.18)', ph: '#EFEDE8' };
const css = `
.pf{font-family:Playfair;font-weight:800;letter-spacing:-.018em}
.sr{font-family:SrcSerif;font-variation-settings:"opsz" 16}
.mono{font-family:Mono;font-weight:500;text-transform:uppercase;letter-spacing:.08em}
.sans{font-family:Inter}
.mast{position:absolute;left:80px;right:80px;top:64px;border-top:8px solid var(--n);padding-top:16px;display:flex;justify-content:space-between;align-items:center}
.mast2{position:absolute;left:80px;right:80px;top:128px;border-top:1px solid var(--n)}
.ft{position:absolute;left:80px;right:80px;bottom:70px;border-top:1px solid var(--n);padding-top:16px;display:flex;justify-content:space-between;font:500 16px Mono;letter-spacing:.08em;text-transform:uppercase;color:var(--m)}
.kick{font:500 19px Mono;letter-spacing:.12em;text-transform:uppercase;color:var(--r)}
.ph{background:${T.ph};border:2px dashed rgba(20,18,28,.3);display:flex;align-items:center;justify-content:center;text-align:center;font:500 16px/1.5 Mono;letter-spacing:.1em;text-transform:uppercase;color:rgba(20,18,28,.55)}
.res{position:absolute;left:80px;right:80px;bottom:128px;font:400 18px/1.4 SrcSerif;font-style:italic;color:var(--m)}
.drop::first-letter{font-family:Playfair;font-weight:800;float:left;font-size:3.35em;line-height:.86;padding:6px 12px 0 0;color:var(--n)}
`;
const v = dark => `--n:${dark ? '#fff' : T.ink};--m:${dark ? 'rgba(255,255,255,.62)' : T.mute};--l:${dark ? 'rgba(255,255,255,.24)' : T.line};--r:${dark ? '#E39A80' : T.rust};--i:${dark ? 'rgba(255,255,255,.88)' : '#2A2733'}`;

const frame = (rub, body, { dark = false, folio = '', reserve = '', num = 'Notes & analyses' } = {}) => page(...P, dark ? T.navy : T.paper, css,
  `<div class="cv" style="${v(dark)};color:var(--n)">
  <div class="mast">${logo(210, dark ? '#fff' : T.navy)}<span class="mono" style="font-size:16px;color:var(--m)">${fix(num)}</span></div><div class="mast2"></div>
  <div class="kick" style="position:absolute;left:80px;top:156px">${fix(rub)}</div>
  ${body}
  ${reserve ? `<div class="res">${fix(reserve)}</div>` : ''}
  <div class="ft"><span>FYNOVATES · Fiscalité, comptabilité, international</span><span>${folio || C.MARQUE.site}</span></div></div>`);
const H = (t, size, top, w = 920, extra = '') => `<h1 class="pf" style="position:absolute;left:80px;top:${top}px;width:${w}px;font-size:${size}px;line-height:1.04;${extra}">${fix(t)}</h1>`;

// ———————————————————— IDENTITÉ
const profile = () => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
<rect width="400" height="400" fill="#fff"/><rect x="34" y="150" width="332" height="9" fill="${T.ink}"/>
<g transform="translate(34,183)">${logo(332, T.navy)}</g><rect x="34" y="226" width="332" height="2" fill="${T.ink}"/></svg>`;

const banner = () => `<svg xmlns="http://www.w3.org/2000/svg" width="1128" height="191" viewBox="0 0 1128 191">
<rect width="1128" height="191" fill="#fff"/>
<rect x="330" y="40" width="758" height="5" fill="${T.ink}"/><rect x="330" y="150" width="758" height="1" fill="${T.ink}"/>
<text x="330" y="70" font-family="Mono" font-size="12" font-weight="500" letter-spacing="1.2" fill="${T.rust}">NOTES &amp; ANALYSES · ENTREPRENEURS ET ENTREPRISES INTERNATIONALES</text>
<text x="330" y="112" font-family="Playfair" font-size="30" font-weight="800" letter-spacing="-.4" fill="${T.ink}">${fix('Fiscalité, comptabilité & structuration internationale.')}</text>
<text x="330" y="138" font-family="SrcSerif" font-size="15" font-style="italic" fill="${T.mute}">${fix('Analyses, dossiers et études de cas pour décider sur des bases solides.')}</text>
<text x="330" y="172" font-family="Mono" font-size="11.5" letter-spacing="1.1" fill="${T.mute}">FISCALITÉ · TVA · COMPTABILITÉ · STRUCTURATION · BANQUE</text>
<text x="1088" y="172" text-anchor="end" font-family="Mono" font-size="11.5" letter-spacing="1.1" fill="${T.mute}">FYNOVATES.COM</text></svg>`;

// ———————————————————— PUBLICATIONS
const edito1 = () => frame(C.EDITO.rubrique, `
  ${H(C.EDITO.titre, 104, 236, 920)}
  <div style="position:absolute;left:80px;right:80px;top:900px;border-top:1px solid var(--n);padding-top:30px;display:grid;grid-template-columns:260px 1fr;gap:40px">
    <div class="mono" style="font-size:16px;line-height:1.6;color:var(--m)">L’essentiel<br>en une phrase</div>
    <p class="sr drop" style="font-size:30px;line-height:1.42;color:var(--i)">${fix(C.EDITO.texte)}</p></div>`);

const edito2 = () => frame(C.EDITO.rubrique, `
  <div style="position:absolute;left:80px;right:80px;top:300px;border-top:1px solid var(--l);border-bottom:1px solid var(--l);padding:56px 0 60px">
    <h1 class="pf" style="font-size:84px;line-height:1.08;font-style:italic;font-weight:700">« ${fix(C.EDITO.titre)} »</h1></div>
  <div style="position:absolute;left:80px;right:80px;top:910px;display:grid;grid-template-columns:1fr 1fr;gap:48px">
    <p class="sr" style="font-size:26px;line-height:1.45;color:var(--i)">${fix('Le pays d’immatriculation ne suffit pas à déterminer les obligations de TVA.')}</p>
    <p class="sr" style="font-size:26px;line-height:1.45;color:var(--i);border-left:1px solid var(--l);padding-left:48px">${fix('Ce qui compte : la nature des opérations, leur lieu d’imposition et la qualité des clients.')}</p></div>`, { dark: true });

const infographie = () => { const I = C.INFOG; return frame(I.rubrique, `
  ${H(I.titre, 50, 204, 920)}
  <div class="mono" style="position:absolute;left:80px;top:400px;font-size:15px;color:var(--m)">Fig. 1 — Les cinq étapes de l’analyse</div>
  <div style="position:absolute;left:80px;width:590px;top:436px;border-top:3px solid var(--n)">
    ${I.etapes.map(([t, d], i) => `<div style="display:grid;grid-template-columns:64px 1fr;padding:18px 0;border-bottom:1px solid var(--l)">
      <span class="pf" style="font-size:40px;line-height:1;color:var(--r)">${i + 1}</span>
      <div><div class="pf" style="font-size:27px;font-weight:700;letter-spacing:-.005em">${fix(t)}</div><div class="sr" style="margin-top:6px;font-size:21px;line-height:1.4;color:var(--i)">${fix(d)}</div></div></div>`).join('')}</div>
  <div style="position:absolute;left:710px;right:80px;top:436px;border-top:3px solid var(--n)">
    <div class="mono" style="font-size:15px;padding:18px 0 6px">Distinctions</div>
    ${I.distinctions.map(([a, b]) => `<div style="padding:16px 0;border-bottom:1px solid var(--l)"><div class="sr" style="font-size:21px;font-weight:600">${fix(a)}</div><div class="mono" style="font-size:14px;color:var(--r);margin:6px 0">n’est pas</div><div class="sr" style="font-size:21px">${fix(b)}</div></div>`).join('')}
    <div style="margin-top:26px;background:${T.navy};color:#fff;padding:22px 22px 24px"><div class="mono" style="font-size:14px;color:#E39A80">Synthèse</div><p class="sr" style="margin-top:10px;font-size:20px;line-height:1.42">${fix(I.synthese)}</p></div></div>`, { reserve: C.RESERVE }); };

const comparatif = () => { const c = C.COMPARATIF; return frame(c.rubrique, `
  ${H(c.titre, 66, 204, 900)}
  <div style="position:absolute;left:80px;right:80px;top:380px;display:grid;grid-template-columns:1fr 1fr;border-top:3px solid var(--n)">
  ${c.cols.map(([h, d], i) => `<div style="padding:${i ? '24px 0 0 32px' : '24px 32px 0 0'};${i ? 'border-left:1px solid var(--l)' : ''}"><div class="mono" style="font-size:15px;color:var(--r)">Colonne ${i ? 'B' : 'A'}</div><div class="pf" style="margin-top:10px;font-size:36px;font-weight:700">${fix(h)}</div><p class="sr" style="margin-top:14px;font-size:22px;line-height:1.45;color:var(--i)">${fix(d)}</p></div>`).join('')}</div>
  <div class="mono" style="position:absolute;left:80px;top:744px;font-size:15px;color:var(--m)">Tableau 1 — ${fix(c.exemple.titre)}</div>
  <div style="position:absolute;left:80px;right:80px;top:778px;border-top:3px solid var(--n)">
    ${c.exemple.lignes.map(([a, b]) => `<div style="display:flex;justify-content:space-between;padding:13px 0;border-bottom:1px solid var(--l)"><span class="sr" style="font-size:23px">${fix(a)}</span><span class="mono" style="font-size:22px;text-transform:none;letter-spacing:0">${fix(b)}</span></div>`).join('')}
    <div style="display:flex;justify-content:space-between;padding:15px 0;border-bottom:3px solid var(--n)"><span class="pf" style="font-size:26px;font-weight:700">${fix(c.exemple.total[0])}</span><span class="mono" style="font-size:24px;letter-spacing:0;color:var(--r)">${fix(c.exemple.total[1])}</span></div></div>
  <p class="sr" style="position:absolute;left:80px;right:80px;top:1112px;font-size:26px;line-height:1.38;font-style:italic">${fix(c.conclusion)}</p>`); };

const actu = () => { const a = C.ACTU; return frame(a.rubrique, `
  <div class="mono" style="position:absolute;right:80px;top:156px;font-size:19px;color:var(--m)">${a.date}</div>
  ${H(a.titre, 62, 210, 920)}
  <p class="sr" style="position:absolute;left:80px;top:372px;width:900px;font-size:24px;font-style:italic;color:var(--m)">${fix(a.vigueur)}.</p>
  <div style="position:absolute;left:80px;right:80px;top:428px;border-top:3px solid var(--n);display:grid;grid-template-columns:1fr 1fr;column-gap:44px">
    <div style="padding-top:22px"><div class="kick" style="font-size:16px">Qui est concerné</div><p class="sr drop" style="margin-top:14px;font-size:22px;line-height:1.46;color:var(--i)">${fix(a.concernes)}</p>
      <div class="kick" style="font-size:16px;margin-top:24px">Points d’attention</div>${a.attention.map(t => `<p class="sr" style="margin-top:12px;font-size:21px;line-height:1.42;padding-left:20px;border-left:3px solid var(--r)">${fix(t)}</p>`).join('')}</div>
    <div style="padding-top:22px;border-left:1px solid var(--l);padding-left:44px"><div class="kick" style="font-size:16px">Le mécanisme</div>
      ${a.mecanisme.map(([k, d]) => `<div style="padding:16px 0;border-bottom:1px solid var(--l)"><div class="pf" style="font-size:28px;font-weight:700">${fix(k)}</div><p class="sr" style="margin-top:6px;font-size:21px;line-height:1.42;color:var(--i)">${fix(d)}</p></div>`).join('')}</div></div>`, { reserve: a.source }); };

const expert = () => { const e = C.EXPERT; return frame(e.rubrique, `
  <div class="ph" style="position:absolute;left:80px;top:216px;width:480px;height:640px">${e.photo}</div>
  <div class="mono" style="position:absolute;left:80px;top:870px;font-size:14px;color:var(--m)">Photo : ${fix('[crédit]')}</div>
  <div style="position:absolute;left:600px;right:80px;top:216px;border-top:3px solid var(--n);padding-top:22px">
    <div class="kick" style="font-size:16px">Portrait</div>
    <div class="pf" style="margin-top:18px;font-size:54px;line-height:1.05">${e.nom}</div>
    <div class="mono" style="margin-top:20px;font-size:16px;color:var(--m)">${fix(e.fonction)}</div>
    <div class="sr" style="margin-top:34px;padding-top:18px;border-top:1px solid var(--l);font-size:23px;font-weight:600">${fix(e.domaine)}</div></div>
  <p class="sr" style="position:absolute;left:80px;right:80px;top:940px;font-size:25px;line-height:1.46;color:var(--i)">${fix(e.bio)}</p>`); };

const methode = () => { const m = C.METHODE; return frame(m.rubrique, `
  ${H(m.titre, 50, 204, 920)}
  <div class="mono" style="position:absolute;left:80px;top:408px;font-size:15px;color:var(--m)">Fig. 2 — Le déroulé d’une analyse</div>
  <div style="position:absolute;left:80px;right:80px;top:444px;border-top:3px solid var(--n);display:grid;grid-template-columns:1fr 1fr 1fr">
  ${m.etapes.map(([t, d], i) => `<div style="padding:22px ${i % 3 === 2 ? 0 : 24}px 26px ${i % 3 ? 24 : 0}px;${i % 3 ? 'border-left:1px solid var(--l);' : ''}${i > 2 ? 'border-top:1px solid var(--l);' : ''}">
    <div class="pf" style="font-size:58px;line-height:1;color:var(--r)">${i + 1}</div>
    <div class="pf" style="margin-top:14px;font-size:27px;font-weight:700;line-height:1.12">${fix(t)}</div>
    <div class="sr" style="margin-top:10px;font-size:21px;line-height:1.4;color:var(--i)">${fix(d)}</div></div>`).join('')}</div>
  <div style="position:absolute;left:80px;right:80px;top:1070px;border-top:3px solid var(--n);padding-top:18px;display:flex;justify-content:space-between">
    <span class="kick" style="font-size:16px;color:var(--n)">Expertises mobilisées</span><span class="mono" style="font-size:16px;color:var(--m)">${m.pôles.join(' · ')}</span></div>`); };

const partenariat = () => { const p = C.PARTENARIAT; return frame(p.rubrique, `
  <div class="ph" style="position:absolute;left:80px;right:80px;top:208px;height:400px">Photographie de la rencontre</div>
  <div class="mono" style="position:absolute;left:80px;top:622px;font-size:14px;color:var(--r)">${fix(p.mention)}</div>
  ${H(p.titre, 50, 670, 920)}
  <p class="sr" style="position:absolute;left:80px;top:810px;width:920px;font-size:23px;line-height:1.46;color:var(--i)">${fix(p.texte)}</p>
  <div style="position:absolute;left:80px;right:80px;top:940px;border-top:3px solid var(--n);display:grid;grid-template-columns:1fr 1fr 1fr">
    ${p.personnes.map(([n, f]) => `<div style="padding:18px 20px 0 0"><div class="pf" style="font-size:26px;font-weight:700">${n}</div><div class="mono" style="margin-top:8px;font-size:14px;color:var(--m)">${fix(f)}</div></div>`).join('')}
    <div style="padding-top:18px;display:grid;grid-template-rows:auto auto;gap:12px">${logo(220, T.navy)}<div class="ph" style="height:66px;font-size:12px">Logo officiel du partenaire</div></div></div>`); };

const corporate = () => { const c = C.CORPORATE; return frame(c.rubrique, `
  <div style="position:absolute;left:80px;right:80px;top:208px;height:470px;background:url('${photo('londres.jpg')}') center 40%/cover;filter:grayscale(1) contrast(1.08)"></div>
  <div class="mono" style="position:absolute;left:80px;top:690px;font-size:14px;color:var(--m)">Photographie d’illustration</div>
  ${H(c.titre, 58, 738, 920)}
  <p class="sr" style="position:absolute;left:80px;top:960px;width:900px;font-size:24px;line-height:1.46;color:var(--i)">${fix(c.texte)}</p>
  <div class="mono" style="position:absolute;left:80px;right:80px;top:1094px;border-top:3px solid var(--n);padding-top:16px;font-size:16px;display:flex;justify-content:space-between">${C.MARQUE.court.map((x, i) => `<span><span style="color:var(--r)">0${i + 1}</span> ${x}</span>`).join('')}</div>`); };

const evenement = () => { const e = C.CORPORATE.evenement; return frame('Agenda · ' + e.rubrique, `
  <div style="position:absolute;left:80px;top:208px;width:300px;border-top:3px solid var(--n);padding-top:20px">
    <div class="mono" style="font-size:16px;color:var(--m)">Date</div><div class="pf" style="margin-top:12px;font-size:48px;line-height:1.05">[JJ]<br>[mois]</div><div class="mono" style="margin-top:12px;font-size:18px">[AAAA]</div></div>
  <div class="ph" style="position:absolute;left:420px;right:80px;top:208px;height:420px">Photographie de l’événement</div>
  ${H(e.titre, 64, 690, 920)}
  <div style="position:absolute;left:80px;right:80px;top:900px;border-top:3px solid var(--n)">${e.meta.slice(1).map(([k, d]) => `<div style="display:grid;grid-template-columns:260px 1fr;padding:18px 0;border-bottom:1px solid var(--l)"><span class="mono" style="font-size:16px;color:var(--r);padding-top:6px">${k}</span><span class="sr" style="font-size:27px">${fix(d)}</span></div>`).join('')}</div>`, { reserve: e.mention }); };

// ———————————————————— DOSSIER PDF
const docPage = (p, i, n) => {
  const folio = `Page ${i + 1} / ${n}`, R = 'Dossier · Banque', num = 'Dossier n° [00]';
  if (p.k === 'cover') return frame(R, `
    <div style="position:absolute;left:80px;right:80px;top:330px;border-top:1px solid var(--l);padding-top:40px">
    <h1 class="pf" style="font-size:96px;line-height:1.02">${fix('Compte de paiement ou compte bancaire')}</h1>
    <p class="pf" style="margin-top:28px;font-size:46px;line-height:1.12;font-style:italic;font-weight:600;color:#E39A80">${fix('Quelles différences pour un entrepreneur ?')}</p></div>
    <div class="mono" style="position:absolute;left:80px;top:1130px;font-size:17px;color:var(--m)">8 pages · Faites défiler →</div>`, { dark: true, folio, num });
  if (p.k === 'intro') return frame(R, `${H(p.titre, 76, 210, 900)}
    <div style="position:absolute;left:80px;right:80px;top:520px;border-top:3px solid var(--n);padding-top:30px;display:grid;grid-template-columns:1fr 1fr;gap:44px">
    ${p.texte.map((t, j) => `<p class="sr ${j ? '' : 'drop'}" style="font-size:28px;line-height:1.46;color:var(--i);${j ? 'border-left:1px solid var(--l);padding-left:44px' : ''}">${fix(t)}</p>`).join('')}</div>`, { folio, num });
  if (p.k === 'cat') return frame(R, `
    <div class="pf" style="position:absolute;left:80px;top:196px;font-size:240px;line-height:1;color:var(--r)">${p.kicker.slice(-1)}</div>
    ${H(p.titre, 78, 470, 900)}
    <p class="sr" style="position:absolute;left:80px;top:575px;width:900px;font-size:28px;font-style:italic;color:var(--m)">${fix(p.sous)}</p>
    <div style="position:absolute;left:80px;right:80px;top:690px;border-top:3px solid var(--n)">${p.points.map(t => `<p class="sr" style="font-size:29px;line-height:1.42;padding:24px 0;border-bottom:1px solid var(--l)">${fix(t)}</p>`).join('')}</div>`, { folio, num });
  if (p.k === 'table') return frame(R, `${H(p.titre, 66, 210, 900)}
    <div class="mono" style="position:absolute;left:80px;top:300px;font-size:15px;color:var(--m)">Tableau 2 — Synthèse comparative</div>
    <table style="position:absolute;left:80px;top:336px;width:920px;border-collapse:collapse;border-top:3px solid var(--n)">
    <tr>${['', ...p.cols].map(h => `<th class="pf" style="text-align:left;font-size:28px;font-weight:700;padding:18px 16px 18px 0;border-bottom:1px solid var(--n)">${h}</th>`).join('')}</tr>
    ${p.rows.map(r => `<tr>${r.map((c, j) => `<td class="${j ? 'sr' : 'mono'}" style="padding:24px 16px 24px 0;border-bottom:1px solid var(--l);vertical-align:top;font-size:${j ? 24 : 15}px;line-height:1.38;${j ? '' : 'width:220px;color:var(--r)'}">${fix(c)}</td>`).join('')}</tr>`).join('')}</table>`, { folio, num, reserve: 'Synthèse simplifiée. Les services proposés varient selon l’établissement et son agrément.' });
  if (p.k === 'list') return frame(R, `${H(p.titre, 66, 210, 900)}
    <div style="position:absolute;left:80px;right:80px;top:420px;border-top:3px solid var(--n);display:grid;grid-template-columns:1fr 1fr">
    ${p.points.map(([h, d], j) => `<div style="padding:28px ${j % 2 ? 0 : 30}px 34px ${j % 2 ? 30 : 0}px;${j % 2 ? 'border-left:1px solid var(--l);' : ''}${j > 1 ? 'border-top:1px solid var(--l);' : ''}"><div class="mono" style="font-size:15px;color:var(--r)">0${j + 1}</div><div class="pf" style="margin-top:10px;font-size:36px;font-weight:700">${h}</div><p class="sr" style="margin-top:12px;font-size:25px;line-height:1.44;color:var(--i)">${fix(d)}</p></div>`).join('')}</div>`, { folio, num });
  if (p.k === 'synth') return frame(R, `
    <div style="position:absolute;left:80px;right:80px;top:330px;border-top:3px solid var(--n);border-bottom:1px solid var(--n);padding:50px 0 56px">
    <div class="kick">${p.titre}</div><p class="pf" style="margin-top:26px;font-size:58px;line-height:1.14;font-style:italic;font-weight:600">« ${fix(p.texte)} »</p></div>`, { folio, num });
  return frame(R, `<div style="position:absolute;left:80px;right:80px;top:360px;border-top:1px solid var(--l);padding-top:44px">
    ${logo(560, '#fff')}<h2 class="pf" style="margin-top:56px;font-size:58px;line-height:1.08">${fix(p.titre)}</h2>
    <p class="sr" style="margin-top:30px;width:860px;font-size:28px;line-height:1.46;color:var(--i)">${fix(p.texte)}</p>
    <div class="mono" style="margin-top:44px;font-size:20px;color:#E39A80">fynovates.com →</div></div>`, { dark: true, folio, num });
};

const casPages = () => { const c = C.CAS, R = c.rubrique, num = 'Étude de cas n° [00]', f = i => `Page ${i} / 5`, res = c.mention; return [
  frame(R, `<div style="position:absolute;left:80px;right:80px;top:300px;border-top:1px solid var(--l);padding-top:40px"><h1 class="pf" style="font-size:86px;line-height:1.04">${fix(c.titre)}</h1></div>
    <p class="sr" style="position:absolute;left:80px;top:1060px;width:820px;font-size:22px;font-style:italic;line-height:1.45;color:var(--m)">${fix(c.mention)}</p>`, { dark: true, folio: f(1), num }),
  frame(R, `<div class="mono" style="position:absolute;left:80px;top:220px;font-size:17px;color:var(--m)">I. Fiche de situation</div>${H(c.situation.titre, 80, 260)}
    <div style="position:absolute;left:80px;right:80px;top:420px;border-top:3px solid var(--n)">${c.situation.points.map(([k, d]) => `<div style="display:grid;grid-template-columns:240px 1fr;padding:30px 0;border-bottom:1px solid var(--l)"><span class="mono" style="font-size:17px;color:var(--r);padding-top:8px">${k}</span><span class="sr" style="font-size:30px;line-height:1.4">${fix(d)}</span></div>`).join('')}</div>`, { folio: f(2), num, reserve: res }),
  frame(R, `<div class="mono" style="position:absolute;left:80px;top:220px;font-size:17px;color:var(--m)">II. Diagnostic</div>${H(c.probleme.titre, 80, 260)}
    <p class="sr drop" style="position:absolute;left:80px;top:400px;width:920px;font-size:28px;line-height:1.46;color:var(--i)">${fix(c.probleme.texte)}</p>
    <div class="mono" style="position:absolute;left:80px;top:640px;font-size:15px;color:var(--m)">Tableau 3 — Exemple chiffré fictif, une commande</div>
    <table style="position:absolute;left:80px;top:676px;width:920px;border-collapse:collapse;border-top:3px solid var(--n)">${[['', 'Appliqué', 'Dû'], ...c.probleme.exemple.lignes].map((r, j) => `<tr>${r.map((x, k) => `<td class="${k ? 'mono' : 'sr'}" style="padding:16px 0;border-bottom:1px solid var(--l);font-size:${k ? 21 : 24}px;letter-spacing:0;text-transform:none;${k ? 'text-align:right' : ''};${j === 0 ? 'font-size:15px;color:' + T.mute + ';text-transform:uppercase;letter-spacing:.08em' : ''}">${fix(x)}</td>`).join('')}</tr>`).join('')}</table>
    <p class="pf" style="position:absolute;left:80px;right:80px;top:960px;font-size:32px;font-weight:700;line-height:1.2;color:var(--r)">${fix(c.probleme.exemple.ecart)}</p>`, { folio: f(3), num, reserve: res }),
  frame(R, `<div class="mono" style="position:absolute;left:80px;top:220px;font-size:17px;color:var(--m)">III. Méthode</div>${H(c.analyse.titre, 80, 260)}
    <div style="position:absolute;left:80px;right:80px;top:410px;border-top:3px solid var(--n);display:grid;grid-template-columns:1fr 1fr">${c.analyse.etapes.map((t, j) => `<div style="padding:24px ${j % 2 ? 0 : 28}px 28px ${j % 2 ? 28 : 0}px;border-bottom:1px solid var(--l);${j % 2 ? 'border-left:1px solid var(--l)' : ''}"><div class="pf" style="font-size:44px;color:var(--r);line-height:1">${j + 1}</div><p class="sr" style="margin-top:12px;font-size:26px;line-height:1.4">${fix(t)}</p></div>`).join('')}</div>`, { folio: f(4), num, reserve: res }),
  frame(R, `<div style="position:absolute;left:80px;right:80px;top:300px;border-top:3px solid var(--n);border-bottom:1px solid var(--n);padding:46px 0 54px">
    <div class="kick">IV. ${c.conclusion.titre}</div><p class="pf" style="margin-top:24px;font-size:60px;line-height:1.12;font-style:italic;font-weight:600">« ${fix(c.conclusion.texte)} »</p></div>
    <p class="sr" style="position:absolute;left:80px;top:1010px;width:840px;font-size:25px;line-height:1.45;color:var(--i)">Vous vendez en ligne dans plusieurs pays de l’Union ? Faites vérifier le traitement TVA de vos ventes.</p>`, { dark: true, folio: f(5), num }),
]; };

export default {
  id: 'B', slug: 'B-modern-financial-journal', nom: 'The Modern Financial Journal', ref: 'Publication professionnelle spécialisée en fiscalité, finance et entreprises internationales',
  resume: 'En-tête de journal, titres Playfair très affirmés, texte en serif de lecture, métadonnées en mono, colonnes, figures et tableaux numérotés. Blanc, encre et un accent brique.',
  palette: [['Encre', T.ink], ['Navy', T.navy], ['Blanc', T.paper], ['Brique', T.rust], ['Gris', T.mute]],
  typos: [['Playfair Display', 'Titres, chiffres, citations', 'Playfair'], ['Source Serif', 'Texte de lecture', 'SrcSerif'], ['IBM Plex Mono', 'Rubriques, figures, données', 'Mono']],
  ui: { bg: '#fff', ink: T.ink, mute: T.mute, line: T.line, accent: T.rust },
  profile, banner,
  visuels: { 'editorial-1': edito1, 'editorial-2': edito2, infographie, comparatif, actualite: actu, expert, methodologie: methode, partenariat, corporate, evenement },
  carrousel: () => C.CARROUSEL.pages.map((p, i, a) => docPage(p, i, a.length)),
  cas: casPages,
};
