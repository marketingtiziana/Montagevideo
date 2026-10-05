/* ============================================================
   FYNOVATES / Madame Caci — Deck « fisc »
   « Les signaux qui font de toi une priorité du fisc »
   Fil rouge visuel : la case à cocher + le compteur de menace
   ============================================================ */

const fs = require('fs');
const path = require('path');

const B = '#4353FF';

/* Décor en filigrane : grilles carrées en coin (identique aux decks validés) */
const DECOR = `
<svg class="decor bleed" viewBox="0 0 1080 1350" aria-hidden="true">
  <defs>
    <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
      <path d="M46 0 L0 0 0 46" fill="none" stroke="#4353FF" stroke-opacity="0.10" stroke-width="1"/>
    </pattern>
  </defs>
  <rect x="-24" y="-24" width="418" height="418" fill="url(#grid)"/>
  <rect x="746" y="1016" width="380" height="380" fill="url(#grid)"/>
  <circle cx="1012" cy="1244" r="152" fill="none" stroke="#4353FF" stroke-opacity="0.12" stroke-width="1.5"/>
</svg>`;

const badge = t => `<div class="head"><span class="badge">${t}</span></div>`;

/* Photo de couverture : bandeau recadré sur le bureau */
const SHOT = path.join(__dirname, '..', 'assets', 'fisc-bureau.jpg');
const shotBlock = fs.existsSync(SHOT)
  ? `<div class="shot"><img src="REL_TOKEN/assets/fisc-bureau.jpg" alt=""></div>`
  : `<div class="shot-ph">PHOTO BUREAU</div>`;


/* ---------- briques de schéma : boîte étiquetée, flèche, étiquette ---------- */
const box = (x, y, w, h, label, o = {}) => {
  const { fill = 'none', txt = o.fill ? '#FFFFFF' : '#8A8FA3', size = 20, dash = '', r = 12 } = o;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"
      stroke="${B}" stroke-width="2.5"${dash ? ` stroke-dasharray="${dash}"` : ''}/>
    <text x="${x + w / 2}" y="${y + h / 2 + size * 0.35}" text-anchor="middle" font-family="Inter"
      font-weight="800" font-size="${size}" letter-spacing="1" fill="${txt}">${label}</text>`;
};
const line = (x1, y1, x2, y2, op = 0.5) =>
  `<path d="M${x1},${y1} L${x2},${y2}" stroke="${B}" stroke-opacity="${op}" stroke-width="2" stroke-linecap="round"/>`;
const arrow = (x1, y1, x2, y2) => {
  const a = Math.atan2(y2 - y1, x2 - x1), L = 13;
  const p = (d) => `${(x2 - L * Math.cos(a - d)).toFixed(1)},${(y2 - L * Math.sin(a - d)).toFixed(1)}`;
  return `<path d="M${x1},${y1} L${x2},${y2}" stroke="${B}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M${p(0.5)} L${x2},${y2} L${p(-0.5)}" fill="none" stroke="${B}" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round"/>`;
};
const cap = (x, y, t, { size = 18, fill = B, anchor = 'middle' } = {}) =>
  `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Inter" font-weight="700"
     font-size="${size}" letter-spacing="1.4" fill="${fill}">${t}</text>`;
const diag = (h, inner) =>
  `<svg class="diag" width="820" height="${h}" viewBox="0 0 820 ${h}" aria-hidden="true">${inner}</svg>`;

/* ---------- les schémas, un par slide ---------- */
const D = {
  /* 02 — les données croisées alimentent un score */
  algo: diag(196, `
    ${box(10, 8, 240, 52, 'BANQUES')}
    ${box(10, 72, 240, 52, 'PLATEFORMES')}
    ${box(10, 136, 240, 52, 'DÉCLARATIONS')}
    ${line(250, 34, 330, 90)}${line(250, 98, 330, 98)}${line(250, 162, 330, 106)}
    ${box(330, 62, 230, 72, 'ALGORITHME', { fill: B })}
    ${arrow(560, 98, 622, 98)}
    ${box(630, 62, 180, 72, 'SCORE', { txt: '#12121F' })}`),

  /* 03 — le foyer fiscal, et tout ce qui l'attache à la France */
  foyer: diag(196, `
    ${box(0, 6, 220, 50, 'LOGEMENT')}
    ${box(600, 6, 220, 50, 'FAMILLE')}
    ${box(0, 140, 220, 50, 'ENFANTS')}
    ${box(600, 140, 220, 50, 'VIE RÉELLE')}
    ${line(220, 31, 320, 82)}${line(600, 31, 500, 82)}
    ${line(220, 165, 320, 114)}${line(600, 165, 500, 114)}
    ${box(310, 66, 200, 64, 'FOYER FISCAL', { fill: B })}`),

  /* 04 — un compte étranger non déclaré, multiplié par les années */
  comptes: diag(196, `
    ${box(10, 6, 185, 50, 'N26')}
    ${box(205, 6, 185, 50, 'REVOLUT')}
    ${box(400, 6, 185, 50, 'WISE')}
    ${box(595, 6, 185, 50, 'CRYPTO')}
    ${arrow(395, 60, 395, 96)}
    ${box(170, 104, 450, 64, 'FORMULAIRE 3916', { txt: '#12121F' })}
    <rect x="196" y="122" width="28" height="28" rx="7" fill="none" stroke="${B}" stroke-width="2.5"/>
    ${cap(700, 142, '× ANNÉE')}`),

  /* 05 — la direction effective ramène la société en France */
  siege: diag(212, `
    <rect x="4" y="4" width="812" height="172" rx="18" fill="none" stroke="${B}"
      stroke-opacity="0.45" stroke-width="2" stroke-dasharray="10 10"/>
    ${cap(410, 44, 'DIRECTION EFFECTIVE', { size: 17 })}
    ${box(40, 66, 270, 70, 'DEPUIS LA FRANCE', { txt: '#12121F' })}
    ${arrow(322, 101, 498, 101)}
    ${box(510, 66, 270, 70, 'LLC / LTD / DUBAÏ')}
    ${cap(410, 202, 'IMPOSABLE EN FRANCE', { size: 19 })}`),

  /* 06 — l'écart entre ce qui est déclaré et ce qui se voit */
  ecart: diag(180, `
    ${cap(10, 44, 'REVENUS DÉCLARÉS', { size: 19, fill: '#8A8FA3', anchor: 'start' })}
    <rect x="330" y="20" width="190" height="32" rx="16" fill="#8A8FA3" fill-opacity="0.45"/>
    ${cap(10, 126, 'TRAIN DE VIE', { size: 19, fill: '#8A8FA3', anchor: 'start' })}
    <rect x="330" y="102" width="460" height="32" rx="16" fill="${B}"/>
    <path d="M520,66 L520,88 M790,66 L790,88 M520,77 L790,77" stroke="${B}" stroke-width="2"
      stroke-opacity="0.6" stroke-linecap="round"/>
    ${cap(655, 168, 'ÉCART', { size: 19 })}`),

  /* 07 — les plateformes transmettent déjà */
  dac7: diag(196, `
    ${box(10, 6, 185, 50, 'STRIPE')}
    ${box(205, 6, 185, 50, 'PAYPAL')}
    ${box(400, 6, 185, 50, 'SHOPIFY')}
    ${box(595, 6, 185, 50, 'AMAZON')}
    ${line(102, 60, 380, 104)}${line(297, 60, 395, 104)}
    ${line(492, 60, 425, 104)}${line(687, 60, 440, 104)}
    ${box(300, 110, 220, 64, 'FISC', { fill: B })}
    ${cap(660, 150, 'TRANSMIS', { size: 19 })}`),

  /* 08 — chaque passage laisse une trace datée */
  jours: diag(196, (() => {
    const on = new Set([0, 1, 4, 7, 8, 12, 15, 16, 17, 22, 25, 26]);
    let g = '';
    for (let i = 0; i < 30; i++) {
      const x = 10 + (i % 10) * 44, y = 18 + Math.floor(i / 10) * 44;
      g += `<rect x="${x}" y="${y}" width="34" height="34" rx="8"
        fill="${on.has(i) ? B : 'none'}" stroke="${B}" stroke-opacity="${on.has(i) ? 1 : 0.4}" stroke-width="2"/>`;
    }
    return g + `
      <rect x="520" y="52" width="34" height="34" rx="8" fill="${B}"/>
      ${cap(572, 76, 'PASSAGE DATÉ', { size: 19, fill: '#8A8FA3', anchor: 'start' })}
      ${cap(520, 150, 'SUR UN MOIS', { size: 19, anchor: 'start' })}`;
  })()),

  /* 10 — une case cochée se décoche, dans le bon ordre */
  avant: diag(130, `
    <rect x="56" y="22" width="78" height="78" rx="18" fill="none" stroke="${B}" stroke-width="3"/>
    <path d="M74,62 L88,77 L116,41" fill="none" stroke="${B}" stroke-width="6"
      stroke-linecap="round" stroke-linejoin="round"/>
    ${cap(95, 126, 'AUJOURD\'HUI', { size: 18, fill: '#8A8FA3' })}
    ${arrow(166, 61, 266, 61)}
    ${box(286, 31, 248, 60, 'SOLUTION', { fill: B })}
    ${arrow(554, 61, 654, 61)}
    <rect x="686" y="22" width="78" height="78" rx="18" fill="none" stroke="${B}" stroke-width="3"/>
    ${cap(725, 126, 'APRÈS', { size: 18, fill: '#8A8FA3' })}`)
};

/* --- la case à cocher : carré 72px, coche épaisse tracée d'un geste --- */
const cbox = (checked, size = 72, style = '', solid = false) => `
<svg class="cbox" width="${size}" height="${size}" viewBox="0 0 72 72" aria-hidden="true" style="${style}">
  <rect x="2.5" y="2.5" width="67" height="67" rx="16"
        fill="${solid ? '#F7F8FC' : 'none'}" stroke="${B}" stroke-width="3"/>
  ${checked ? `<path d="M17,38 L30,52 L56,19" fill="none" stroke="${B}" stroke-width="6"
       stroke-linecap="round" stroke-linejoin="round"/>` : ''}
</svg>`;

/* --- compteur de menace : 3 segments + étiquette --- */
const threat = (n, label) => `
<div class="threat">
  <div class="threat-segs">
    ${[0, 1, 2].map(i => `<span class="threat-seg${i < n ? ' threat-seg--on' : ''}"></span>`).join('')}
  </div>
  <span class="threat-lbl${n >= 3 ? ' threat-lbl--hot' : ''}">${label}</span>
</div>`;

/* --- une slide signal complète --- */
const signal = ({ num, kicker, title, text, schema = '', stamp, segs, level }) => ({
  main: `
      ${badge(kicker)}
      <h1 class="title" style="white-space:nowrap">${title}</h1>
      <div class="zone">
        <div class="sig-card">
          <div class="case-head">${cbox(true)}<span class="case-id">CASE ${num}/6</span></div>
          <p class="sig-txt">${text}</p>
          ${schema}
          <span class="stamp-box"
                style="right:34px;bottom:-30px;transform:rotate(-10deg);font-size:26px">${stamp}</span>
        </div>
      </div>
      ${threat(segs, level)}`
});

module.exports = { DECOR, slides: [

  /* ================= 01 · HOOK ================= */
  {
    main: `
      <div class="head"></div>
      <h1 class="title title--hero" style="font-size:78px;white-space:nowrap">
        2 cases cochées :<br>dossier intéressant.<br>3 cases :<br>
        <span class="blue ul-blue">PRIORITÉ</span> du fisc.
      </h1>
      <p class="body muted" style="margin-top:40px">Expatrié français ? Compte tes cases.</p>
      ${shotBlock}
      <div class="cbox-fan" style="position:absolute;left:112px;top:748px">
        ${cbox(true, 64, 'transform:rotate(-9deg) translateY(14px)', true)}
        ${cbox(true, 64, 'transform:rotate(-5deg) translateY(6px)', true)}
        ${cbox(true, 64, 'transform:rotate(-2deg)', true)}
        ${cbox(false, 64, 'transform:rotate(2deg)', true)}
        ${cbox(false, 64, 'transform:rotate(5deg) translateY(6px)', true)}
        ${cbox(false, 64, 'transform:rotate(9deg) translateY(14px)', true)}
      </div>
      <div class="swipe swipe--plate" style="position:absolute;top:758px;right:112px">
        <span class="swipe-txt">SWIPE</span><span class="swipe-dot">&rarr;</span>
      </div>`
  },

  /* ================= 02 · COMMENT ÇA MARCHE ================= */
  {
    main: `
      ${badge('COMMENT ÇA MARCHE')}
      <h1 class="title" style="font-size:64px;white-space:nowrap">
        Le fisc ne surveille pas<br><span class="blue">tout le monde</span>.
      </h1>
      <div class="zone">
        <div class="stat stat--light" style="padding:46px">
          <div style="font-size:40px;font-weight:800;line-height:1.26;letter-spacing:-0.015em">
            63% des contrôles sont déclenchés par un algorithme qui croise tes données et te score.
          </div>
        </div>
        <p class="body" style="margin-top:42px">Chaque signal fait monter ton score.
          Au-delà d'un seuil, un humain ouvre ton dossier.</p>
        ${D.algo}
      </div>
      <p class="chute">Voici les 6 cases qui pèsent le plus.<br><span class="blue">Compte les tiennes</span>.</p>`
  },

  /* ================= 03 · SIGNAL 1 ================= */
  signal({
    num: 1, kicker: 'SIGNAL 1', schema: D.foyer,
    title: 'Des liens <span class="blue">conservés</span><br>en France.',
    text: 'Logement gardé, famille restée, enfants scolarisés en France. Le foyer fiscal ne suit pas les papiers : il suit ta vie réelle.',
    stamp: 'LE CLASSIQUE', segs: 1, level: 'dossier banal'
  }),

  /* ================= 04 · SIGNAL 2 ================= */
  signal({
    num: 2, kicker: 'SIGNAL 2', schema: D.comptes,
    title: 'Des comptes étrangers<br><span class="blue">jamais</span> déclarés.',
    text: 'N26, Revolut, Wise, comptes crypto : ce sont des comptes étrangers. Formulaire 3916 obligatoire, amende par compte et par année d\'oubli.',
    stamp: 'L\'OUBLI QUI COÛTE', segs: 2, level: 'dossier intéressant'
  }),

  /* ================= 05 · SIGNAL 3 ================= */
  signal({
    num: 3, kicker: 'SIGNAL 3', schema: D.siege,
    title: 'Une société étrangère<br><span class="blue">pilotée de France</span>.',
    text: 'LLC, Ltd ou société Dubaï dirigée depuis ton salon : le siège de direction effective la rend imposable en France. Peu importe l\'immatriculation.',
    stamp: 'LE PIÈGE N°1', segs: 3, level: 'PRIORITÉ'
  }),

  /* ================= 06 · SIGNAL 4 ================= */
  signal({
    num: 4, kicker: 'SIGNAL 4', schema: D.ecart,
    title: 'Un train de vie<br><span class="blue">incohérent</span>.',
    text: 'Stories à Dubaï, voiture neuve, apport immobilier... comparés à tes revenus déclarés. L\'algorithme lit aussi les réseaux sociaux.',
    stamp: 'VU ET REVU', segs: 3, level: 'PRIORITÉ'
  }),

  /* ================= 07 · SIGNAL 5 ================= */
  signal({
    num: 5, kicker: 'SIGNAL 5', schema: D.dac7,
    title: 'Des incohérences<br>TVA et <span class="blue">DAC7</span>.',
    text: 'Stripe, PayPal, Shopify, Amazon transmettent déjà tes revenus au fisc. Si tes déclarations racontent une autre histoire, l\'écart est signalé automatiquement.',
    stamp: 'AUTOMATIQUE', segs: 3, level: 'PRIORITÉ'
  }),

  /* ================= 08 · SIGNAL 6 ================= */
  signal({
    num: 6, kicker: 'SIGNAL 6', schema: D.jours,
    title: 'Trop de <span class="blue">présence</span><br>en France.',
    text: 'Bornage téléphonique, péages, billets de train, carte de fidélité du supermarché : tes passages en France laissent des traces datées. Elles se comptent.',
    stamp: 'LA PREUVE PAR LE QUOTIDIEN', segs: 3, level: 'PRIORITÉ'
  }),

  /* ================= 09 · TON SCORE ================= */
  {
    main: `
      ${badge('TON SCORE')}
      <h1 class="title" style="white-space:nowrap">Alors,<br><span class="blue">combien</span> de cases ?</h1>
      <div class="zone">
        <div class="score">
          <div class="score-col">${cbox(false, 88)}<span class="score-lbl">LIENS</span></div>
          <div class="score-col">${cbox(false, 88)}<span class="score-lbl">COMPTES</span></div>
          <div class="score-col">${cbox(false, 88)}<span class="score-lbl">SOCIÉTÉ</span></div>
          <div class="score-col">${cbox(false, 88)}<span class="score-lbl">TRAIN DE VIE</span></div>
          <div class="score-col">${cbox(false, 88)}<span class="score-lbl">TVA</span></div>
          <div class="score-col">${cbox(false, 88)}<span class="score-lbl">PRÉSENCE</span></div>
        </div>
        <div class="stat stat--blue" style="margin-top:72px;padding:48px">
          <div style="font-size:36px;font-weight:700;line-height:1.32;color:#FFFFFF">
            0-1 : continue proprement. 2 : mets de l'ordre maintenant.
            3+ : ta situation doit être revue avant que le fisc ne s'en charge.
          </div>
        </div>
      </div>`
  },

  /* ================= 10 · CTA ================= */
  {
    main: `
      ${badge('AVANT EUX')}
      <h1 class="title" style="font-size:64px;white-space:nowrap">
        Corrige tes signaux<br><span class="blue">avant</span> qu'ils clignotent.
      </h1>
      <div class="zone">
        <p class="body" style="text-align:center">Chaque case a une solution légale et propre.
          Encore faut-il la mettre en place dans le bon ordre.</p>
        ${D.avant}
        <div class="cta-pill" style="margin-top:54px">Commente AUDIT</div>
        <p class="body muted" style="margin-top:28px;text-align:center;font-size:30px">
          Échange offert. On passe tes cases en revue ensemble.
        </p>
      </div>`
  }

]};
