// DIRECTION A — THE INSTITUTIONAL ADVISORY
// Cabinet international : serif institutionnelle (Source Serif), grands blancs, hiérarchie classique,
// filets fins, numérotation romaine, papier ivoire et navy. Aucun effet, aucun pictogramme.
import { fix, logo, logoStack, page, photo, P } from './core.mjs';
import * as C from './content.mjs';

const T = { paper: '#F6F4EF', navy: '#0D082E', ink: '#24213A', mute: '#6E6B80', line: 'rgba(13,8,46,.16)', ph: '#E8E4DA' };
const ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
const css = `
.serif{font-family:SrcSerif;font-variation-settings:"opsz" 60}
.caps{font:600 17px/1 Mont;letter-spacing:.32em;text-transform:uppercase}
.sans{font-family:Inter}
.hd{position:absolute;left:96px;right:96px;top:92px;height:58px;display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid var(--l)}
.ft{position:absolute;left:96px;right:96px;bottom:84px;padding-top:22px;border-top:1px solid var(--l);display:flex;justify-content:space-between;font:400 19px Inter;color:var(--m)}
.res{position:absolute;left:96px;right:96px;bottom:150px;font:400 18px/1.4 Inter;color:var(--m)}
.ph{background:${T.ph};border:2px dashed rgba(13,8,46,.28);display:flex;align-items:center;justify-content:center;text-align:center;font:600 16px/1.5 Mont;letter-spacing:.22em;text-transform:uppercase;color:rgba(13,8,46,.55)}
.k{font:600 17px Mont;letter-spacing:.3em;text-transform:uppercase;color:var(--m)}
.rule{width:64px;height:2px;background:var(--n)}
`;
const v = (dark) => `--n:${dark ? '#fff' : T.navy};--m:${dark ? 'rgba(255,255,255,.62)' : T.mute};--l:${dark ? 'rgba(255,255,255,.22)' : T.line};--i:${dark ? 'rgba(255,255,255,.86)' : T.ink}`;

// Cadre commun : logo, rubrique, filet ; pied : signature et site.
const frame = (rub, body, { dark = false, folio = '', reserve = '' } = {}) => page(...P, dark ? T.navy : T.paper, css,
  `<div class="cv" style="${v(dark)};color:var(--n)">
  <div class="hd">${logo(230, dark ? '#fff' : T.navy)}<div class="caps" style="color:var(--m);padding-top:2px">${fix(rub)}</div></div>
  ${body}
  ${reserve ? `<div class="res">${fix(reserve)}</div>` : ''}
  <div class="ft"><span>Conseil fiscal, comptabilité &amp; structuration internationale</span><span>${folio || C.MARQUE.site}</span></div></div>`);

const title = (t, size, top, w = 888, extra = '') => `<h1 class="serif" style="position:absolute;left:96px;top:${top}px;width:${w}px;font-size:${size}px;line-height:1.12;font-weight:500;letter-spacing:-.012em;${extra}">${fix(t)}</h1>`;

// ———————————————————— IDENTITÉ
const profile = () => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
<rect width="400" height="400" fill="${T.navy}"/><rect x="26" y="26" width="348" height="348" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2"/>
<g transform="translate(58,148)">${logoStack(284, '#fff', [[0, 1, 2, 3], [4, 5, 6, 7, 8]], { gap: 120 })}</g></svg>`;

const banner = () => `<svg xmlns="http://www.w3.org/2000/svg" width="1128" height="191" viewBox="0 0 1128 191">
<rect width="1128" height="191" fill="${T.paper}"/>
<line x1="0" y1="190.5" x2="1128" y2="190.5" stroke="${T.line}"/>
<g transform="translate(420,52)"><text font-family="SrcSerif" font-size="30" font-weight="500" fill="${T.navy}" letter-spacing="-.2">${fix('Conseil fiscal, comptabilité')}</text>
<text y="38" font-family="SrcSerif" font-size="30" font-weight="500" fill="${T.navy}">${fix('& structuration internationale.')}</text>
<line x1="0" y1="66" x2="560" y2="66" stroke="${T.line}"/>
<text y="96" font-family="Mont" font-size="11" font-weight="600" letter-spacing="2.6" fill="${T.mute}">FISCALITÉ · TVA · COMPTABILITÉ · STRUCTURATION · SOLUTIONS BANCAIRES</text></g>
<text x="1088" y="172" text-anchor="end" font-family="Inter" font-size="13" fill="${T.mute}">fynovates.com</text></svg>`;

// ———————————————————— PUBLICATIONS
const edito1 = () => frame(C.EDITO.rubrique, `
  ${title(C.EDITO.titre, 86, 360, 880)}
  <div class="rule" style="position:absolute;left:96px;top:790px"></div>
  <p class="sans" style="position:absolute;left:96px;top:826px;width:780px;font-size:30px;line-height:1.5;color:var(--i)">${fix(C.EDITO.texte)}</p>`);

const edito2 = () => frame(C.EDITO.rubrique, `
  <div style="position:absolute;left:120px;right:120px;top:330px;text-align:center">
    <div class="k" style="color:var(--m)">Point de vigilance</div>
    <h1 class="serif" style="margin-top:46px;font-size:76px;line-height:1.14;font-weight:500;letter-spacing:-.01em">${fix(C.EDITO.titre)}</h1>
    <div class="rule" style="margin:54px auto 0"></div>
    <p class="sans" style="margin:46px auto 0;width:720px;font-size:28px;line-height:1.55;color:var(--i)">${fix(C.EDITO.texte)}</p></div>`, { dark: true });

const infographie = () => frame(C.INFOG.rubrique, `
  ${title(C.INFOG.titre, 44, 196, 888)}
  <div style="position:absolute;left:96px;right:96px;top:330px">
  ${C.INFOG.etapes.map(([t, d], i) => `<div style="display:grid;grid-template-columns:96px 1fr;padding:14px 0;border-top:1px solid var(--l)">
    <div class="serif" style="font-size:38px;line-height:1;color:var(--n)">${ROM[i]}</div>
    <div><div class="sans" style="font-size:27px;font-weight:600;line-height:1.2">${fix(t)}</div><div class="sans" style="margin-top:6px;font-size:21px;line-height:1.38;color:var(--i)">${fix(d)}</div></div></div>`).join('')}
  </div>
  <div style="position:absolute;left:96px;right:96px;top:946px;border-top:1px solid var(--n);padding-top:18px">
    <div class="k">Distinctions à opérer</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:16px">${C.INFOG.distinctions.map(([a, b]) => `<div class="sans" style="font-size:20px;line-height:1.35"><b style="font-weight:600">${fix(a)}</b><br><span style="color:var(--m)">≠ ${fix(b)}</span></div>`).join('')}</div></div>
  <div style="position:absolute;left:96px;right:96px;top:1078px;background:${T.navy};color:#fff;padding:18px 28px;font:400 20px/1.4 Inter"><b class="serif" style="font-weight:600;font-size:23px">Synthèse. </b>${fix(C.INFOG.synthese)}</div>`);

const comparatif = () => { const c = C.COMPARATIF; return frame(c.rubrique, `
  ${title(c.titre, 60, 200, 860)}
  <div style="position:absolute;left:96px;right:96px;top:370px;display:grid;grid-template-columns:1fr 1fr;border-top:1px solid var(--n)">
  ${c.cols.map(([h, d], i) => `<div style="padding:${i ? '30px 0 0 36px' : '30px 36px 0 0'};${i ? 'border-left:1px solid var(--l)' : ''}">
    <div class="serif" style="font-size:36px;font-weight:600">${fix(h)}</div><p class="sans" style="margin-top:16px;font-size:23px;line-height:1.48;color:var(--i)">${fix(d)}</p></div>`).join('')}</div>
  <div style="position:absolute;left:96px;right:96px;top:742px;background:#fff;padding:30px 36px;border:1px solid var(--l)">
    <div class="k">${fix(c.exemple.titre)}</div>
    ${c.exemple.lignes.map(([a, b]) => `<div class="sans" style="display:flex;justify-content:space-between;font-size:24px;padding:13px 0;border-bottom:1px solid var(--l)"><span>${fix(a)}</span><span style="font-variant-numeric:tabular-nums">${fix(b)}</span></div>`).join('')}
    <div class="sans" style="display:flex;justify-content:space-between;font-size:26px;font-weight:600;padding-top:16px"><span>${fix(c.exemple.total[0])}</span><span>${fix(c.exemple.total[1])}</span></div></div>
  <p class="serif" style="position:absolute;left:96px;right:96px;top:1100px;font-size:28px;line-height:1.36;font-style:italic">${fix(c.conclusion)}</p>`); };

const actu = () => { const a = C.ACTU; return frame(a.rubrique, `
  <div class="sans" style="position:absolute;left:96px;top:196px;font-size:21px;color:var(--m)">${a.date} · ${fix(a.vigueur)}</div>
  ${title(a.titre, 54, 240, 880)}
  <div style="position:absolute;left:96px;right:96px;top:420px">
    ${[['Personnes concernées', `<p>${fix(a.concernes)}</p>`],
       ['Mécanisme', a.mecanisme.map(([k, d]) => `<p style="margin-bottom:10px"><b style="font-weight:600">${fix(k)}.</b> ${fix(d)}</p>`).join('')],
       ['Points d’attention', a.attention.map(d => `<p style="margin-bottom:8px">— ${fix(d)}</p>`).join('')]]
      .map(([h, b]) => `<div style="display:grid;grid-template-columns:230px 1fr;gap:30px;padding:24px 0;border-top:1px solid var(--l)"><div class="serif" style="font-size:27px;font-weight:600;line-height:1.2">${fix(h)}</div><div class="sans" style="font-size:22px;line-height:1.46;color:var(--i)">${b}</div></div>`).join('')}
  </div>`, { reserve: a.source }); };

const expert = () => { const e = C.EXPERT; return frame(e.rubrique, `
  <div class="ph" style="position:absolute;left:330px;top:220px;width:420px;height:500px">${e.photo}</div>
  <div style="position:absolute;left:96px;right:96px;top:776px;text-align:center">
    <div class="serif" style="font-size:58px;font-weight:500">${e.nom}</div>
    <div class="k" style="margin-top:20px">${fix(e.fonction)}</div>
    <div class="sans" style="margin-top:26px;font-size:24px;font-weight:600">${fix(e.domaine)}</div>
    <p class="sans" style="margin:22px auto 0;width:760px;font-size:22px;line-height:1.5;color:var(--m)">${fix(e.bio)}</p></div>`); };

const methode = () => { const m = C.METHODE; return frame(m.rubrique, `
  ${title(m.titre, 46, 198, 880)}
  <div style="position:absolute;left:96px;right:96px;top:378px;display:grid;grid-template-columns:1fr 1fr;column-gap:56px">
  ${m.etapes.map(([t, d], i) => `<div style="border-top:${i < 2 ? '2px solid var(--n)' : '1px solid var(--l)'};padding:24px 0 30px">
    <div class="serif" style="font-size:22px;color:var(--m)">${ROM[i]}.</div>
    <div class="sans" style="margin-top:10px;font-size:28px;font-weight:600;line-height:1.2">${fix(t)}</div>
    <div class="sans" style="margin-top:10px;font-size:22px;line-height:1.45;color:var(--i)">${fix(d)}</div></div>`).join('')}</div>
  <div style="position:absolute;left:96px;right:96px;top:1036px;border:1px solid var(--n);padding:24px 30px;display:flex;justify-content:space-between;align-items:center">
    <span class="serif" style="font-size:24px;font-style:italic;white-space:nowrap">Expertises coordonnées</span>
    <span class="caps" style="font-size:14px;letter-spacing:.18em;white-space:nowrap">${m.pôles.join(' · ')}</span></div>`); };

const partenariat = () => { const p = C.PARTENARIAT; return frame(p.rubrique, `
  <div class="caps" style="position:absolute;left:96px;top:196px;font-size:14px;letter-spacing:.22em;border:1px solid var(--n);padding:12px 16px">${fix(p.mention)}</div>
  <div style="position:absolute;left:96px;right:96px;top:290px;height:180px;display:grid;grid-template-columns:1fr 70px 1fr;align-items:center;border-top:1px solid var(--l);border-bottom:1px solid var(--l)">
    <div style="display:flex;justify-content:center">${logo(300)}</div><div class="serif" style="text-align:center;font-size:40px;color:var(--m)">×</div>
    <div class="ph" style="height:110px;font-size:14px">Logo officiel<br>du partenaire</div></div>
  ${title(p.titre, 46, 530, 880)}
  <p class="sans" style="position:absolute;left:96px;top:690px;width:860px;font-size:23px;line-height:1.5;color:var(--i)">${fix(p.texte)}</p>
  <div style="position:absolute;left:96px;right:96px;top:850px;display:grid;grid-template-columns:1fr 1fr;gap:36px">
  ${p.personnes.map(([n, f]) => `<div style="display:grid;grid-template-columns:120px 1fr;gap:22px;align-items:center"><div class="ph" style="height:140px;font-size:11px;letter-spacing:.14em">Photo</div><div><div class="serif" style="font-size:28px;font-weight:600">${n}</div><div class="sans" style="margin-top:6px;font-size:19px;color:var(--m)">${fix(f)}</div></div></div>`).join('')}</div>`); };

const corporate = () => { const c = C.CORPORATE; return frame(c.rubrique, `
  <div style="position:absolute;left:96px;right:96px;top:196px;height:420px;background:url('${photo('bureaux.jpg')}') center/cover;filter:grayscale(1) contrast(1.05)"></div>
  <div class="sans" style="position:absolute;right:96px;top:626px;font-size:15px;color:var(--m)">Photographie d’illustration</div>
  ${title(c.titre, 54, 676, 880)}
  <p class="sans" style="position:absolute;left:96px;top:900px;width:840px;font-size:24px;line-height:1.5;color:var(--i)">${fix(c.texte)}</p>
  <div style="position:absolute;left:96px;right:96px;top:1052px;display:flex;justify-content:space-between;border-top:1px solid var(--n);padding-top:22px">${C.MARQUE.court.map((x, i) => `<span class="sans" style="font-size:20px;font-weight:600"><span class="serif" style="font-weight:400;color:var(--m)">${ROM[i]}.</span> ${x}</span>`).join('')}</div>`); };

const evenement = () => { const e = C.CORPORATE.evenement; return frame(e.rubrique, `
  <div class="ph" style="position:absolute;left:96px;right:96px;top:196px;height:430px">Photographie de l’événement</div>
  ${title(e.titre, 56, 676, 880)}
  <div style="position:absolute;left:96px;right:96px;top:850px">${e.meta.map(([k, d]) => `<div style="display:grid;grid-template-columns:230px 1fr;padding:18px 0;border-top:1px solid var(--l)"><span class="k" style="font-size:15px;padding-top:6px">${k}</span><span class="sans" style="font-size:26px">${fix(d)}</span></div>`).join('')}</div>`, { reserve: e.mention }); };

// ———————————————————— DOCUMENT PDF : COMPTE DE PAIEMENT / COMPTE BANCAIRE
const docPage = (p, i, n) => {
  const folio = `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`;
  const R = C.CARROUSEL.rubrique;
  if (p.k === 'cover') return frame(R, `
    <div class="k" style="position:absolute;left:96px;top:420px">Document · 8 pages</div>
    ${title(C.CARROUSEL.titre, 78, 470, 870)}
    <div class="rule" style="position:absolute;left:96px;top:1010px"></div>
    <div class="sans" style="position:absolute;left:96px;top:1040px;font-size:24px;color:var(--m)">Faites défiler pour lire</div>`, { dark: true, folio });
  if (p.k === 'intro') return frame(R, `<div class="k" style="position:absolute;left:96px;top:300px">${p.kicker}</div>${title(p.titre, 66, 350, 860)}
    ${p.texte.map((t, j) => `<p class="sans" style="position:absolute;left:96px;top:${640 + j * 220}px;width:830px;font-size:30px;line-height:1.5;color:var(--i)">${fix(t)}</p>`).join('')}`, { folio });
  if (p.k === 'cat') return frame(R, `<div class="k" style="position:absolute;left:96px;top:270px">${p.kicker}</div>${title(p.titre, 76, 320, 860)}
    <p class="serif" style="position:absolute;left:96px;top:440px;width:820px;font-size:32px;font-style:italic;line-height:1.35;color:var(--i)">${fix(p.sous)}</p>
    <div style="position:absolute;left:96px;right:96px;top:610px">${p.points.map((t, j) => `<div style="display:grid;grid-template-columns:90px 1fr;padding:30px 0;border-top:1px solid var(--l)"><span class="serif" style="font-size:32px;color:var(--m)">${ROM[j]}</span><span class="sans" style="font-size:29px;line-height:1.45">${fix(t)}</span></div>`).join('')}</div>`, { folio });
  if (p.k === 'table') return frame(R, `<div class="k" style="position:absolute;left:96px;top:250px">${p.kicker}</div>${title(p.titre, 56, 296, 860)}
    <table class="sans" style="position:absolute;left:96px;top:450px;width:888px;border-collapse:collapse;font-size:23px;line-height:1.35">
    <tr>${['', ...p.cols].map(h => `<th class="serif" style="text-align:left;font-size:26px;font-weight:600;padding:0 16px 18px 0;border-bottom:2px solid var(--n)">${h}</th>`).join('')}</tr>
    ${p.rows.map(r => `<tr>${r.map((c, j) => `<td style="padding:24px 16px 24px 0;border-bottom:1px solid var(--l);vertical-align:top;${j ? '' : 'font-weight:600;width:230px'}">${fix(c)}</td>`).join('')}</tr>`).join('')}</table>`, { folio, reserve: 'Synthèse simplifiée. Les services proposés varient selon l’établissement et son agrément.' });
  if (p.k === 'list') return frame(R, `<div class="k" style="position:absolute;left:96px;top:250px">${p.kicker}</div>${title(p.titre, 60, 296, 860)}
    <div style="position:absolute;left:96px;right:96px;top:520px">${p.points.map(([h, d]) => `<div style="padding:26px 0;border-top:1px solid var(--l)"><div class="serif" style="font-size:32px;font-weight:600">${h}</div><div class="sans" style="margin-top:8px;font-size:26px;line-height:1.45;color:var(--i)">${fix(d)}</div></div>`).join('')}</div>`, { folio });
  if (p.k === 'synth') return frame(R, `<div class="k" style="position:absolute;left:96px;top:400px">${p.kicker}</div>${title(p.titre, 66, 450, 860)}
    <p class="serif" style="position:absolute;left:96px;top:600px;width:860px;font-size:48px;line-height:1.3;font-weight:400">${fix(p.texte)}</p>`, { folio });
  return frame(R, `<div style="position:absolute;left:96px;top:380px">${logo(520, '#fff')}</div>
    ${title(p.titre, 54, 540, 820)}
    <p class="sans" style="position:absolute;left:96px;top:740px;width:800px;font-size:28px;line-height:1.5;color:var(--i)">${fix(p.texte)}</p>
    <div class="sans" style="position:absolute;left:96px;top:930px;font-size:26px;font-weight:600;border-bottom:2px solid #fff;padding-bottom:8px">fynovates.com</div>`, { dark: true, folio });
};

// ———————————————————— ÉTUDE DE CAS (5 pages)
const casPages = () => { const c = C.CAS, R = c.rubrique, f = i => `0${i} / 05`, res = c.mention; return [
  frame(R, `<div class="k" style="position:absolute;left:96px;top:360px">Étude de cas</div>${title(c.titre, 72, 410, 870)}
    <p class="sans" style="position:absolute;left:96px;top:930px;width:760px;font-size:22px;line-height:1.5;color:var(--m)">${fix(c.mention)}</p>`, { folio: f(1) }),
  frame(R, `<div class="k" style="position:absolute;left:96px;top:250px">01</div>${title(c.situation.titre, 72, 290)}
    <div style="position:absolute;left:96px;right:96px;top:470px">${c.situation.points.map(([k, d]) => `<div style="display:grid;grid-template-columns:220px 1fr;padding:32px 0;border-top:1px solid var(--l)"><span class="serif" style="font-size:30px;font-weight:600">${k}</span><span class="sans" style="font-size:28px;line-height:1.45">${fix(d)}</span></div>`).join('')}</div>`, { folio: f(2), reserve: res }),
  frame(R, `<div class="k" style="position:absolute;left:96px;top:250px">02</div>${title(c.probleme.titre, 72, 290)}
    <p class="sans" style="position:absolute;left:96px;top:420px;width:860px;font-size:28px;line-height:1.5">${fix(c.probleme.texte)}</p>
    <div style="position:absolute;left:96px;right:96px;top:640px;background:#fff;border:1px solid var(--l);padding:30px 34px">
      <div class="k">Exemple chiffré fictif · une commande</div>
      <table class="sans" style="width:100%;margin-top:18px;border-collapse:collapse;font-size:23px">${[['', 'Traitement appliqué', 'Traitement dû'], ...c.probleme.exemple.lignes].map((r, j) => `<tr>${r.map((x, k) => `<td style="padding:14px 0;border-bottom:1px solid var(--l);${j === 0 ? 'font-weight:600;font-size:19px;color:' + T.mute : ''};${k ? 'text-align:right' : ''}">${fix(x)}</td>`).join('')}</tr>`).join('')}</table>
      <p class="serif" style="margin-top:22px;font-size:27px;font-weight:600;line-height:1.3">${fix(c.probleme.exemple.ecart)}</p></div>`, { folio: f(3), reserve: res }),
  frame(R, `<div class="k" style="position:absolute;left:96px;top:250px">03</div>${title(c.analyse.titre, 72, 290)}
    <div style="position:absolute;left:96px;right:96px;top:440px">${c.analyse.etapes.map((t, j) => `<div style="display:grid;grid-template-columns:90px 1fr;padding:25px 0;border-top:1px solid var(--l)"><span class="serif" style="font-size:30px;color:var(--m)">${ROM[j]}</span><span class="sans" style="font-size:28px;line-height:1.4">${fix(t)}</span></div>`).join('')}</div>`, { folio: f(4), reserve: res }),
  frame(R, `<div class="k" style="position:absolute;left:96px;top:330px">04 · ${c.conclusion.titre}</div>
    <p class="serif" style="position:absolute;left:96px;top:390px;width:880px;font-size:58px;line-height:1.24;font-weight:500">${fix(c.conclusion.texte)}</p>
    <div class="sans" style="position:absolute;left:96px;top:930px;font-size:24px;line-height:1.5;color:var(--i);width:820px">Vous vendez en ligne dans plusieurs pays de l’Union ? Faites vérifier le traitement TVA de vos ventes.</div>`, { dark: true, folio: f(5) }),
]; };

export default {
  id: 'A', slug: 'A-institutional-advisory', nom: 'The Institutional Advisory', ref: 'Cabinet international de conseil fiscal et corporate',
  resume: 'Serif institutionnelle, grands espaces blancs, hiérarchie classique, filets fins et numérotation romaine. Papier ivoire et navy.',
  palette: [['Navy', T.navy], ['Ivoire', T.paper], ['Encre', T.ink], ['Gris', T.mute], ['Réserve', T.ph]],
  typos: [['Source Serif', 'Titres, chiffres romains, citations', "SrcSerif"], ['Inter', 'Textes courants', 'Inter'], ['Montserrat capitales', 'Rubriques espacées', 'Mont']],
  ui: { bg: T.paper, ink: T.navy, mute: T.mute, line: T.line, title: "500 34px/1.15 SrcSerif", label: "600 11px Mont", accent: T.navy },
  profile, banner,
  visuels: { 'editorial-1': edito1, 'editorial-2': edito2, infographie, comparatif, actualite: actu, expert, methodologie: methode, partenariat, corporate, evenement },
  carrousel: () => C.CARROUSEL.pages.map((p, i, a) => docPage(p, i, a.length)),
  cas: casPages,
};
