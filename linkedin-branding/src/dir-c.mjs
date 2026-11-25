// DIRECTION C — THE CORPORATE PRECISION
// Cabinet multidisciplinaire moderne : grille modulaire visible (cellules à filets de 1 px), Inter seule,
// titres très gras et serrés, index numériques, aplats navy, un bleu ardoise discret. Angles droits, aucun effet.
import { fix, logo, logoStack, page, photo, P } from './core.mjs';
import * as C from './content.mjs';

const T = { white: '#FFFFFF', navy: '#0D082E', cell: '#F0F2F5', slate: '#3E5C8A', ink: '#1C1A2E', mute: '#667085', line: '#D3D8E0', ph: '#E4E8EE' };
const M = 60, W = 1080 - 2 * M;
const css = `
.i{font-family:Inter}
.t{font-family:Inter;font-weight:700;letter-spacing:-.035em;line-height:1.04}
.lb{font:600 16px Inter;letter-spacing:.14em;text-transform:uppercase}
.num{font-family:Inter;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.02em}
.g{position:absolute;left:${M}px;width:${W}px;display:grid;border-top:1px solid ${T.line};border-left:1px solid ${T.line}}
.g>*{border-right:1px solid ${T.line};border-bottom:1px solid ${T.line};padding:26px 28px;min-width:0}
.n{background:${T.navy};color:#fff}.c{background:${T.cell}}
.ph{background:${T.ph};display:flex;align-items:center;justify-content:center;text-align:center;font:600 15px/1.5 Inter;letter-spacing:.14em;text-transform:uppercase;color:#5d6780;outline:2px dashed #9aa5b8;outline-offset:-14px}
.mt{color:${T.mute}}.sl{color:${T.slate}}
`;
// Cadre : rangée d'en-tête en cellules (logo | rubrique | index) et rangée de pied.
const frame = (rub, body, { dark = false, idx = '', folio = '', progress = null } = {}) => page(...P, dark ? T.navy : T.white, css + (dark ? `.g{border-color:rgba(255,255,255,.2)}.g>*{border-color:rgba(255,255,255,.2)}.mt{color:rgba(255,255,255,.6)}.sl{color:#9DB4D8}` : ''),
  `<div class="cv" style="color:${dark ? '#fff' : T.ink}">
  <div class="g" style="top:${M}px;grid-template-columns:330px 1fr 200px;height:96px">
    <div style="display:flex;align-items:center">${logo(230, dark ? '#fff' : T.navy)}</div>
    <div class="lb mt" style="display:flex;align-items:center;font-size:15px">${fix(rub)}</div>
    <div class="lb sl" style="display:flex;align-items:center;justify-content:flex-end;font-size:15px">${idx}</div></div>
  ${progress ? `<div style="position:absolute;left:${M}px;top:${M + 96}px;width:${W}px;height:6px;display:grid;grid-template-columns:repeat(${progress[1]},1fr);gap:4px">${Array.from({ length: progress[1] }, (_, k) => `<span style="background:${k < progress[0] ? (dark ? '#fff' : T.navy) : (dark ? 'rgba(255,255,255,.18)' : T.line)}"></span>`).join('')}</div>` : ''}
  ${body}
  <div class="g" style="top:${1350 - M - 64}px;grid-template-columns:1fr 300px;height:64px">
    <div class="i mt" style="display:flex;align-items:center;font-size:18px;padding:0 28px">Conseil fiscal, comptabilité &amp; structuration internationale</div>
    <div class="i mt" style="display:flex;align-items:center;justify-content:flex-end;font-size:18px;padding:0 28px">${folio || C.MARQUE.site}</div></div></div>`);
const G = (top, cols, cells, extra = '') => `<div class="g" style="top:${top}px;grid-template-columns:${cols};${extra}">${cells}</div>`;

// ———————————————————— IDENTITÉ
const profile = () => `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
<rect width="400" height="400" fill="${T.navy}"/>
<g transform="translate(64,76)">${logoStack(272, '#fff', [[0, 1, 2], [3, 4, 5], [6, 7, 8]], { mode: 'grid', cell: 300, gap: 140 })}</g></svg>`;

const banner = () => { const cells = C.MARQUE.court; const x0 = 420, cw = (1128 - x0) / cells.length;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1128" height="191" viewBox="0 0 1128 191">
<rect width="1128" height="191" fill="#fff"/><rect x="${x0}" y="0" width="${1128 - x0}" height="96" fill="${T.navy}"/>
<text x="${x0 + 24}" y="44" font-family="Inter" font-size="24" font-weight="700" letter-spacing="-.6" fill="#fff">${fix('Conseil fiscal, comptabilité')}</text>
<text x="${x0 + 24}" y="74" font-family="Inter" font-size="24" font-weight="700" letter-spacing="-.6" fill="#fff">${fix('& structuration internationale.')}</text>
${cells.map((c, i) => `<rect x="${x0 + i * cw + .5}" y="96.5" width="${cw - 1}" height="94" fill="${i % 2 ? T.cell : '#fff'}" stroke="${T.line}"/>
<text x="${x0 + i * cw + 16}" y="128" font-family="Inter" font-size="12" font-weight="700" letter-spacing="1.4" fill="${T.slate}">0${i + 1}</text>
<text x="${x0 + i * cw + 16}" y="164" font-family="Inter" font-size="14.5" font-weight="600" fill="${T.ink}">${c === 'Solutions bancaires' ? 'Banque' : c}</text>`).join('')}
<line x1="${x0}" y1="0" x2="${x0}" y2="191" stroke="${T.line}"/>
<text x="${x0 - 28}" y="176" text-anchor="end" font-family="Inter" font-size="12.5" fill="${T.mute}">fynovates.com</text></svg>`; };

// ———————————————————— PUBLICATIONS
const edito1 = () => frame(C.EDITO.rubrique, `
  ${G(180, '1fr', `<div class="n" style="height:640px;padding:56px 52px;display:flex;flex-direction:column;justify-content:space-between">
    <div class="lb" style="color:#9DB4D8">Point de vigilance</div>
    <h1 class="t" style="font-size:82px">${fix(C.EDITO.titre)}</h1></div>`)}
  ${G(820, '1fr 1fr 1fr', ['Nature des opérations', 'Lieu d’imposition', 'Qualité des clients'].map((x, i) => `<div style="height:200px;display:flex;flex-direction:column;justify-content:space-between"><span class="num sl" style="font-size:22px">0${i + 1}</span><span class="i" style="font-size:28px;font-weight:600;line-height:1.2">${fix(x)}</span></div>`).join(''), 'border-top:0')}
  ${G(1020, '1fr', `<div class="i mt" style="font-size:21px;line-height:1.42;padding:18px 28px">${fix('Le pays d’immatriculation ne suffit pas à déterminer les obligations de TVA : ce sont ces trois éléments qui comptent.')}</div>`, 'border-top:0')}`, { idx: 'TVA · 01' });

const edito2 = () => frame(C.EDITO.rubrique, `
  ${G(180, '2fr 1fr', `<div style="height:760px;display:flex;flex-direction:column;justify-content:flex-end;padding:44px 40px"><h1 class="t" style="font-size:74px">${fix(C.EDITO.titre)}</h1></div>
    <div class="c" style="height:760px;padding:0;display:grid;grid-template-rows:repeat(3,1fr)">${['Nature des opérations', 'Lieu d’imposition', 'Qualité des clients'].map((x, i) => `<div style="padding:26px 24px;${i < 2 ? 'border-bottom:1px solid ' + T.line : ''};display:flex;flex-direction:column;justify-content:space-between"><span class="num sl" style="font-size:44px">0${i + 1}</span><span class="i" style="font-size:24px;font-weight:600;line-height:1.2">${fix(x)}</span></div>`).join('')}</div>`)}
  ${G(940, '1fr', `<div class="i" style="font-size:25px;line-height:1.45;padding:28px 40px;height:286px;color:${T.ink}">${fix(C.EDITO.texte)}</div>`, 'border-top:0')}`, { idx: 'TVA · 01' });

const infographie = () => { const I = C.INFOG; return frame(I.rubrique, `
  ${G(180, '1fr', `<h1 class="t" style="font-size:40px;padding:26px 28px">${fix(I.titre)}</h1>`)}
  ${G(342, '92px 330px 1fr', I.etapes.map(([t, d], i) => `<div class="${i === 4 ? 'n' : 'c'} num" style="font-size:30px;display:flex;align-items:center;justify-content:center;padding:0;${i === 4 ? '' : 'color:' + T.slate}">0${i + 1}</div><div class="i" style="font-size:24px;font-weight:700;line-height:1.2;display:flex;align-items:center;padding:20px 22px">${fix(t)}</div><div class="i mt" style="font-size:20px;line-height:1.4;padding:20px 22px;color:#3d4257">${fix(d)}</div>`).join(''), 'border-top:0')}
  ${G(916, '1fr 1fr 1fr', I.distinctions.map(([a, b]) => `<div style="padding:20px 22px"><div class="i" style="font-size:20px;font-weight:700">${fix(a)}</div><div class="lb sl" style="font-size:12px;margin:8px 0">≠</div><div class="i mt" style="font-size:19px">${fix(b)}</div></div>`).join(''), 'border-top:0')}
  ${G(1062, '200px 1fr', `<div class="n lb" style="font-size:14px;display:flex;align-items:center">Synthèse</div><div class="i" style="font-size:20px;line-height:1.4;padding:18px 24px">${fix(I.synthese)}</div>`, 'border-top:0')}`, { idx: 'Fig. 01' }); };

const comparatif = () => { const c = C.COMPARATIF; return frame(c.rubrique, `
  ${G(180, '1fr', `<h1 class="t" style="font-size:60px;padding:32px 28px">${fix(c.titre)}</h1>`)}
  ${G(370, '1fr 1fr', c.cols.map(([h, d], i) => `<div class="${i ? 'c' : 'n'}" style="padding:22px 28px"><div class="lb" style="font-size:13px;${i ? 'color:' + T.slate : 'color:#9DB4D8'}">${i ? 'B' : 'A'}</div><div class="i" style="margin-top:8px;font-size:30px;font-weight:700;letter-spacing:-.02em">${fix(h)}</div></div>`).join('') + c.cols.map(([, d]) => `<div class="i" style="font-size:21px;line-height:1.45;color:#3d4257">${fix(d)}</div>`).join(''), 'border-top:0')}
  ${G(746, '1fr 240px', `<div class="lb sl" style="font-size:14px;grid-column:span 2;padding:18px 28px">${fix(c.exemple.titre)}</div>` + c.exemple.lignes.map(([a, b]) => `<div class="i" style="font-size:22px;padding:14px 28px">${fix(a)}</div><div class="num" style="font-size:22px;text-align:right;padding:14px 28px">${fix(b)}</div>`).join('') + `<div class="n i" style="font-size:24px;font-weight:700;padding:16px 28px">${fix(c.exemple.total[0])}</div><div class="n num" style="font-size:24px;text-align:right;padding:16px 28px">${fix(c.exemple.total[1])}</div>`, 'border-top:0')}
  ${G(1124, '1fr', `<div class="i" style="font-size:22px;font-weight:600;line-height:1.38;padding:16px 28px">${fix(c.conclusion)}</div>`, 'border-top:0')}`, { idx: 'Tab. 01' }); };

const actu = () => { const a = C.ACTU; return frame(a.rubrique, `
  ${G(180, '1fr 1fr', `<div class="c"><div class="lb mt" style="font-size:13px">Date</div><div class="i" style="margin-top:8px;font-size:24px;font-weight:600">${a.date}</div></div><div class="c"><div class="lb mt" style="font-size:13px">Statut</div><div class="i" style="margin-top:8px;font-size:24px;font-weight:600">${fix(a.vigueur.replace('Règle en vigueur', 'En vigueur'))}</div></div>`)}
  ${G(302, '1fr', `<h1 class="t" style="font-size:56px;padding:34px 28px">${fix(a.titre)}</h1>`, 'border-top:0')}
  ${G(484, '200px 1fr', `<div class="lb sl" style="font-size:14px">Concernés</div><div class="i" style="font-size:21px;line-height:1.45">${fix(a.concernes)}</div>` +
    a.mecanisme.map(([k, d], i) => `<div class="${i === 2 ? 'n' : ''} lb" style="font-size:14px;${i === 2 ? '' : 'color:' + T.slate}">${fix(k)}</div><div class="i" style="font-size:21px;line-height:1.45;padding:20px 28px">${fix(d)}</div>`).join('') +
    `<div class="lb sl" style="font-size:14px">Attention</div><div class="i" style="font-size:20px;line-height:1.45">${a.attention.map(t => `<p style="padding:3px 0">— ${fix(t)}</p>`).join('')}</div>`, 'border-top:0')}
  <div class="i mt" style="position:absolute;left:${M + 28}px;top:1170px;font-size:16px">${fix(a.source)}</div>`, { idx: 'Note · 01' }); };

const expert = () => { const e = C.EXPERT; return frame(e.rubrique, `
  ${G(180, '460px 1fr', `<div class="ph" style="height:620px;padding:0">${e.photo}</div>
    <div style="padding:0;display:grid;grid-template-rows:auto auto auto 1fr">${[['Nom', `<span class="t" style="font-size:46px">${e.nom}</span>`], ['Fonction', `<span class="i" style="font-size:24px;font-weight:600">${fix(e.fonction)}</span>`], ['Domaine', `<span class="i" style="font-size:24px;font-weight:600">${fix(e.domaine)}</span>`]].map(([k, v]) => `<div style="padding:24px 28px;border-bottom:1px solid ${T.line}"><div class="lb sl" style="font-size:13px;margin-bottom:12px">${k}</div>${v}</div>`).join('')}<div class="c"></div></div>`)}
  ${G(800, '1fr', `<div style="padding:30px 28px;height:426px"><div class="lb sl" style="font-size:13px;margin-bottom:16px">Présentation</div><p class="i" style="font-size:26px;line-height:1.5;color:#3d4257">${fix(e.bio)}</p></div>`, 'border-top:0')}`, { idx: 'Équipe · 01' }); };

const methode = () => { const m = C.METHODE; return frame(m.rubrique, `
  ${G(180, '1fr', `<h1 class="t" style="font-size:40px;padding:26px 28px">${fix(m.titre)}</h1>`)}
  ${G(342, '1fr 1fr 1fr', m.etapes.map(([t, d], i) => `<div class="${i === 5 ? 'n' : ''}" style="height:280px;display:flex;flex-direction:column"><span class="num ${i === 5 ? '' : 'sl'}" style="font-size:56px;line-height:1">0${i + 1}</span><span class="i" style="margin-top:auto;font-size:25px;font-weight:700;line-height:1.18;letter-spacing:-.01em">${fix(t)}</span><span class="i ${i === 5 ? '' : 'mt'}" style="margin-top:10px;font-size:19px;line-height:1.4;${i === 5 ? 'color:rgba(255,255,255,.75)' : ''}">${fix(d)}</span></div>`).join(''), 'border-top:0')}
  ${G(910, '1fr', `<div class="lb sl" style="font-size:14px;padding:18px 28px">Expertises coordonnées à chaque étape</div>`, 'border-top:0')}
  ${G(966, 'repeat(5,1fr)', m.pôles.map((p, i) => `<div class="c" style="height:110px;display:flex;flex-direction:column;justify-content:space-between;padding:18px 20px"><span class="num sl" style="font-size:15px">${String.fromCharCode(65 + i)}</span><span class="i" style="font-size:21px;font-weight:600">${p}</span></div>`).join(''), 'border-top:0')}
  ${G(1076, '1fr', `<div class="i mt" style="font-size:18px;padding:16px 28px">${fix('Chaque recommandation est revue de manière croisée par les expertises concernées avant d’être présentée.')}</div>`, 'border-top:0')}`, { idx: 'Méthode' }); };

const partenariat = () => { const p = C.PARTENARIAT; return frame(p.rubrique, `
  ${G(180, '1fr 90px 1fr', `<div style="height:200px;display:flex;align-items:center;justify-content:center">${logo(300, T.navy)}</div><div class="c i" style="display:flex;align-items:center;justify-content:center;font-size:34px;color:${T.mute}">×</div><div class="ph" style="height:200px">Logo officiel<br>du partenaire</div>`)}
  ${G(380, '1fr', `<div class="lb" style="font-size:13px;padding:14px 28px;background:#FFF;color:${T.slate}">${fix(p.mention)}</div>`, 'border-top:0')}
  ${G(430, '1fr', `<h1 class="t" style="font-size:48px;padding:30px 28px">${fix(p.titre)}</h1>`, 'border-top:0')}
  ${G(604, '1fr', `<p class="i" style="font-size:23px;line-height:1.48;color:#3d4257">${fix(p.texte)}</p>`, 'border-top:0')}
  ${G(744, '1fr 1fr', p.personnes.map(([n, f]) => `<div style="padding:0;display:grid;grid-template-columns:180px 1fr"><div class="ph" style="height:230px;font-size:12px;outline-offset:-10px">Photo</div><div style="padding:24px"><div class="i" style="font-size:26px;font-weight:700">${n}</div><div class="i mt" style="margin-top:8px;font-size:18px;line-height:1.35">${fix(f)}</div></div></div>`).join(''), 'border-top:0')}
  ${G(975, '1fr', `<div class="c" style="height:251px;padding:26px 28px"><div class="lb sl" style="font-size:13px">Objet de la rencontre</div><p class="i mt" style="margin-top:12px;font-size:21px;line-height:1.45">${fix('[Thème abordé, public concerné, prochaines étapes éventuelles.]')}</p></div>`, 'border-top:0')}`, { idx: 'Écosystème' }); };

const corporate = () => { const c = C.CORPORATE; return frame(c.rubrique, `
  ${G(180, '1fr 1fr', `<div style="height:520px;padding:0;background:url('${photo('tours-verre.jpg')}') center/cover;filter:grayscale(1) contrast(1.05)"></div>
    <div class="n" style="height:520px;display:flex;flex-direction:column;justify-content:space-between;padding:36px 32px"><span class="lb" style="color:#9DB4D8;font-size:14px">Prise de parole</span><h1 class="t" style="font-size:44px">${fix(c.titre)}</h1></div>`)}
  ${G(700, '1fr', `<p class="i" style="font-size:24px;line-height:1.48;color:#3d4257;padding:30px 28px">${fix(c.texte)}</p>`, 'border-top:0')}
  ${G(844, 'repeat(5,1fr)', C.MARQUE.court.map((x, i) => `<div class="${i % 2 ? 'c' : ''}" style="height:240px;display:flex;flex-direction:column;justify-content:space-between;padding:22px 20px"><span class="num sl" style="font-size:34px">0${i + 1}</span><span class="i" style="font-size:21px;font-weight:700;line-height:1.2">${x}</span></div>`).join(''), 'border-top:0')}
  <div class="i mt" style="position:absolute;left:${M + 28}px;top:1112px;font-size:15px">Photographie d’illustration</div>`, { idx: 'Cabinet' }); };

const evenement = () => { const e = C.CORPORATE.evenement; return frame(e.rubrique, `
  ${G(180, '1fr', `<div class="ph" style="height:440px;padding:0">Photographie de l’événement</div>`)}
  ${G(620, '1fr', `<h1 class="t" style="font-size:58px;padding:34px 28px">${fix(e.titre)}</h1>`, 'border-top:0')}
  ${G(812, '1fr 1fr 1fr', e.meta.map(([k, d], i) => `<div class="${i === 0 ? 'n' : 'c'}" style="height:220px;display:flex;flex-direction:column;justify-content:space-between"><span class="lb" style="font-size:13px;${i ? 'color:' + T.slate : 'color:#9DB4D8'}">${k}</span><span class="i" style="font-size:25px;font-weight:600;line-height:1.25">${fix(d)}</span></div>`).join(''), 'border-top:0')}
  ${G(1032, '1fr', `<div class="i mt" style="font-size:18px;padding:16px 28px">${fix(e.mention)}</div>`, 'border-top:0')}`, { idx: 'Agenda' }); };

// ———————————————————— DOCUMENT PDF
const docPage = (p, i, n) => {
  const o = { progress: [i + 1, n], idx: `${String(i + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`, folio: 'Document · Banque' }, R = C.CARROUSEL.rubrique;
  if (p.k === 'cover') return frame(R, `
    ${G(200, '1fr', `<div style="height:720px;display:flex;flex-direction:column;justify-content:flex-end;padding:48px 44px"><span class="lb" style="color:#9DB4D8;font-size:15px;margin-bottom:34px">Document · 8 pages</span><h1 class="t" style="font-size:84px">${fix(C.CARROUSEL.titre)}</h1></div>`)}
    ${G(920, '1fr 1fr', `<div style="height:250px" class="i mt"><span style="font-size:22px">Compte bancaire</span></div><div style="height:250px" class="i mt"><span style="font-size:22px">Compte de paiement</span></div>`, 'border-top:0')}`, { ...o, dark: true });
  if (p.k === 'intro') return frame(R, `
    ${G(200, '1fr', `<div class="lb sl" style="font-size:14px">${p.kicker}</div><h1 class="t" style="font-size:72px;padding:20px 28px 40px;border:0">${fix(p.titre)}</h1>`, 'grid-template-rows:auto auto')}
    ${G(560, '1fr 1fr', p.texte.map((t, j) => `<div class="${j ? 'c' : ''}" style="height:540px;padding:34px 30px"><span class="num sl" style="font-size:22px">0${j + 1}</span><p class="i" style="margin-top:24px;font-size:28px;line-height:1.48">${fix(t)}</p></div>`).join(''), 'border-top:0')}`, o);
  if (p.k === 'cat') return frame(R, `
    ${G(200, '240px 1fr', `<div class="n num" style="height:300px;font-size:150px;display:flex;align-items:flex-end;line-height:.8">${p.kicker.slice(-1)}</div><div style="display:flex;flex-direction:column;justify-content:flex-end"><span class="lb sl" style="font-size:14px">${p.kicker}</span><h1 class="t" style="margin-top:16px;font-size:68px">${fix(p.titre)}</h1></div>`)}
    ${G(500, '1fr', `<p class="i c" style="font-size:27px;font-weight:600;line-height:1.4;padding:28px">${fix(p.sous)}</p>`, 'border-top:0')}
    ${G(620, '90px 1fr', p.points.map((t, j) => `<div class="num sl" style="font-size:26px">0${j + 1}</div><div class="i" style="font-size:28px;line-height:1.42;padding:32px 28px;min-height:166px">${fix(t)}</div>`).join(''), 'border-top:0')}`, o);
  if (p.k === 'table') return frame(R, `
    ${G(200, '1fr', `<h1 class="t" style="font-size:60px;padding:34px 28px">${fix(p.titre)}</h1>`)}
    ${G(345, '230px 1fr 1fr', ['', ...p.cols].map((h, j) => `<div class="${j === 1 ? 'n' : j === 2 ? 'c' : ''} i" style="font-size:24px;font-weight:700">${h}</div>`).join('') + p.rows.map(r => r.map((c, j) => `<div class="${j ? 'i' : 'lb sl'}" style="${j ? 'font-size:23px;line-height:1.38' : 'font-size:13px;line-height:1.5'};padding:26px 24px">${fix(c)}</div>`).join('')).join(''), 'border-top:0')}
    <div class="i mt" style="position:absolute;left:${M + 28}px;top:1150px;font-size:17px">${fix('Synthèse simplifiée. Les services proposés varient selon l’établissement et son agrément.')}</div>`, o);
  if (p.k === 'list') return frame(R, `
    ${G(200, '1fr', `<div class="lb sl" style="font-size:14px">${p.kicker}</div><h1 class="t" style="font-size:62px;padding:18px 28px 36px">${fix(p.titre)}</h1>`)}
    ${G(500, '1fr 1fr', p.points.map(([h, d], j) => `<div class="${j === 0 || j === 3 ? 'c' : ''}" style="height:330px;display:flex;flex-direction:column"><span class="num sl" style="font-size:40px">0${j + 1}</span><span class="i" style="margin-top:auto;font-size:30px;font-weight:700">${h}</span><span class="i mt" style="margin-top:12px;font-size:23px;line-height:1.42;color:#3d4257">${fix(d)}</span></div>`).join(''), 'border-top:0')}`, o);
  if (p.k === 'synth') return frame(R, `
    ${G(200, '1fr', `<div class="n" style="height:1020px;padding:56px 48px;display:flex;flex-direction:column;justify-content:space-between"><span class="lb" style="color:#9DB4D8;font-size:15px">${p.titre}</span><p class="t" style="font-size:58px;line-height:1.12">${fix(p.texte)}</p></div>`)}`, o);
  return frame(R, `
    ${G(200, '1fr', `<div style="height:420px;display:flex;align-items:flex-end;padding:44px">${logo(560, '#fff')}</div>`)}
    ${G(620, '1fr', `<div style="padding:40px 44px"><h2 class="t" style="font-size:54px">${fix(p.titre)}</h2><p class="i mt" style="margin-top:26px;font-size:26px;line-height:1.48">${fix(p.texte)}</p></div>`, 'border-top:0')}
    ${G(1060, '1fr', `<div class="i" style="font-size:24px;font-weight:700;padding:22px 44px;background:#fff;color:${T.navy}">fynovates.com</div>`, 'border-top:0')}`, { ...o, dark: true });
};

const casPages = () => { const c = C.CAS, R = c.rubrique, o = i => ({ progress: [i, 5], idx: `0${i} / 05`, folio: 'Étude de cas · TVA' }); return [
  frame(R, `${G(200, '1fr', `<div style="height:740px;display:flex;flex-direction:column;justify-content:flex-end;padding:48px 44px"><span class="lb" style="color:#9DB4D8;font-size:15px;margin-bottom:30px">Étude de cas</span><h1 class="t" style="font-size:74px">${fix(c.titre)}</h1></div>`)}
    ${G(940, '1fr', `<div class="i mt" style="font-size:21px;line-height:1.45;padding:28px 44px;height:286px">${fix(c.mention)}</div>`, 'border-top:0')}`, { ...o(1), dark: true }),
  frame(R, `${G(200, '1fr', `<h1 class="t" style="font-size:72px;padding:36px 28px"><span class="sl">01 </span>${c.situation.titre}</h1>`)}
    ${G(380, '240px 1fr', c.situation.points.map(([k, d], j) => `<div class="${j % 2 ? '' : 'c'} lb sl" style="font-size:14px;padding:34px 28px">${k}</div><div class="i" style="font-size:28px;line-height:1.42;padding:30px 28px;min-height:160px">${fix(d)}</div>`).join(''), 'border-top:0')}
    <div class="i mt" style="position:absolute;left:${M + 28}px;top:1150px;font-size:17px">${fix(c.mention)}</div>`, o(2)),
  frame(R, `${G(200, '1fr', `<h1 class="t" style="font-size:72px;padding:36px 28px"><span class="sl">02 </span>${c.probleme.titre}</h1>`)}
    ${G(380, '1fr', `<p class="i" style="font-size:27px;line-height:1.46;padding:30px 28px">${fix(c.probleme.texte)}</p>`, 'border-top:0')}
    ${G(568, '1fr 260px 260px', `<div class="lb sl" style="font-size:13px;grid-column:span 3">Exemple chiffré fictif · une commande</div>` + [['', 'Appliqué', 'Dû'], ...c.probleme.exemple.lignes].map((r, j) => r.map((x, k) => `<div class="${j === 0 && k === 2 ? 'n' : j === 0 && k === 1 ? 'c' : ''} ${k ? 'num' : 'i'}" style="font-size:${j ? 23 : 17}px;${k ? 'text-align:right' : ''};padding:18px 26px;${j === 0 ? 'font-weight:600' : 'font-weight:' + (k ? 600 : 400)}">${fix(x)}</div>`).join('')).join(''), 'border-top:0')}
    ${G(948, '1fr', `<div class="n i" style="font-size:27px;font-weight:700;line-height:1.3;padding:28px">${fix(c.probleme.exemple.ecart)}</div>`, 'border-top:0')}
    <div class="i mt" style="position:absolute;left:${M + 28}px;top:1150px;font-size:17px">${fix(c.mention)}</div>`, o(3)),
  frame(R, `${G(200, '1fr', `<h1 class="t" style="font-size:72px;padding:36px 28px"><span class="sl">03 </span>${c.analyse.titre}</h1>`)}
    ${G(380, '1fr 1fr', c.analyse.etapes.map((t, j) => `<div class="${j === 3 ? 'n' : ''}" style="height:240px;display:flex;flex-direction:column"><span class="num ${j === 3 ? '' : 'sl'}" style="font-size:40px">0${j + 1}</span><span class="i" style="margin-top:auto;font-size:26px;font-weight:600;line-height:1.3">${fix(t)}</span></div>`).join(''), 'border-top:0')}
    <div class="i mt" style="position:absolute;left:${M + 28}px;top:1150px;font-size:17px">${fix(c.mention)}</div>`, o(4)),
  frame(R, `${G(200, '1fr', `<div style="height:760px;padding:56px 48px;display:flex;flex-direction:column;justify-content:space-between"><span class="lb" style="color:#9DB4D8;font-size:15px">04 · ${c.conclusion.titre}</span><p class="t" style="font-size:62px;line-height:1.1">${fix(c.conclusion.texte)}</p></div>`)}
    ${G(960, '1fr', `<div class="i" style="font-size:24px;line-height:1.45;padding:30px 48px;height:266px;color:rgba(255,255,255,.85)">${fix('Vous vendez en ligne dans plusieurs pays de l’Union ? Faites vérifier le traitement TVA de vos ventes.')}</div>`, 'border-top:0')}`, { ...o(5), dark: true }),
]; };

export default {
  id: 'C', slug: 'C-corporate-precision', nom: 'The Corporate Precision', ref: 'Cabinet de conseil multidisciplinaire, moderne et international',
  resume: 'Grille modulaire visible, cellules à filets fins, Inter seule en graisses fortes, index numériques et aplats navy. Une précision d’ingénieur, sans effet technologique.',
  palette: [['Navy', T.navy], ['Blanc', T.white], ['Gris cellule', T.cell], ['Ardoise', T.slate], ['Filet', T.line]],
  typos: [['Inter Bold', 'Titres serrés, chiffres', 'Inter'], ['Inter Regular', 'Textes courants', 'Inter'], ['Inter capitales', 'Libellés de cellules', 'Inter']],
  ui: { bg: '#fff', ink: T.navy, mute: T.mute, line: T.line, accent: T.slate },
  profile, banner,
  visuels: { 'editorial-1': edito1, 'editorial-2': edito2, infographie, comparatif, actualite: actu, expert, methodologie: methode, partenariat, corporate, evenement },
  carrousel: () => C.CARROUSEL.pages.map((p, i, a) => docPage(p, i, a.length)),
  cas: casPages,
};
