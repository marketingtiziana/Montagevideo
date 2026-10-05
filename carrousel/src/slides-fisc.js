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
const signal = ({ num, kicker, title, text, stamp, segs, level }) => ({
  main: `
      ${badge(kicker)}
      <h1 class="title" style="white-space:nowrap">${title}</h1>
      <div class="zone">
        <div class="sig-card">
          <div class="case-head">${cbox(true)}<span class="case-id">CASE ${num}/6</span></div>
          <p class="sig-txt">${text}</p>
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
      </div>
      <p class="chute">Voici les 6 cases qui pèsent le plus.<br><span class="blue">Compte les tiennes</span>.</p>`
  },

  /* ================= 03 · SIGNAL 1 ================= */
  signal({
    num: 1, kicker: 'SIGNAL 1',
    title: 'Des liens <span class="blue">conservés</span><br>en France.',
    text: 'Logement gardé, famille restée, enfants scolarisés en France. Le foyer fiscal ne suit pas les papiers : il suit ta vie réelle.',
    stamp: 'LE CLASSIQUE', segs: 1, level: 'dossier banal'
  }),

  /* ================= 04 · SIGNAL 2 ================= */
  signal({
    num: 2, kicker: 'SIGNAL 2',
    title: 'Des comptes étrangers<br><span class="blue">jamais</span> déclarés.',
    text: 'N26, Revolut, Wise, comptes crypto : ce sont des comptes étrangers. Formulaire 3916 obligatoire, amende par compte et par année d\'oubli.',
    stamp: 'L\'OUBLI QUI COÛTE', segs: 2, level: 'dossier intéressant'
  }),

  /* ================= 05 · SIGNAL 3 ================= */
  signal({
    num: 3, kicker: 'SIGNAL 3',
    title: 'Une société étrangère<br><span class="blue">pilotée de France</span>.',
    text: 'LLC, Ltd ou société Dubaï dirigée depuis ton salon : le siège de direction effective la rend imposable en France. Peu importe l\'immatriculation.',
    stamp: 'LE PIÈGE N°1', segs: 3, level: 'PRIORITÉ'
  }),

  /* ================= 06 · SIGNAL 4 ================= */
  signal({
    num: 4, kicker: 'SIGNAL 4',
    title: 'Un train de vie<br><span class="blue">incohérent</span>.',
    text: 'Stories à Dubaï, voiture neuve, apport immobilier... comparés à tes revenus déclarés. L\'algorithme lit aussi les réseaux sociaux.',
    stamp: 'VU ET REVU', segs: 3, level: 'PRIORITÉ'
  }),

  /* ================= 07 · SIGNAL 5 ================= */
  signal({
    num: 5, kicker: 'SIGNAL 5',
    title: 'Des incohérences<br>TVA et <span class="blue">DAC7</span>.',
    text: 'Stripe, PayPal, Shopify, Amazon transmettent déjà tes revenus au fisc. Si tes déclarations racontent une autre histoire, l\'écart est signalé automatiquement.',
    stamp: 'AUTOMATIQUE', segs: 3, level: 'PRIORITÉ'
  }),

  /* ================= 08 · SIGNAL 6 ================= */
  signal({
    num: 6, kicker: 'SIGNAL 6',
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
        <div class="cta-pill" style="margin-top:62px">Commente AUDIT</div>
        <p class="body muted" style="margin-top:28px;text-align:center;font-size:30px">
          Échange offert. On passe tes cases en revue ensemble.
        </p>
      </div>`
  }

]};
