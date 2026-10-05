/* ============================================================
   FYNOVATES / Madame Caci — Deck « fisc », couverture : variante B
   La photo en carte portrait posée à droite, la checklist à gauche.
   ============================================================ */
const { DECOR } = require('./slides-fisc.js');
const fs = require('fs');
const path = require('path');

const B = '#4353FF';
const cbox = (checked, size) => `
<svg class="cbox" width="${size}" height="${size}" viewBox="0 0 72 72" aria-hidden="true">
  <rect x="2.5" y="2.5" width="67" height="67" rx="16" fill="none" stroke="${B}" stroke-width="3"/>
  ${checked ? `<path d="M17,38 L30,52 L56,19" fill="none" stroke="${B}" stroke-width="6"
       stroke-linecap="round" stroke-linejoin="round"/>` : ''}
</svg>`;

const SHOT = path.join(__dirname, '..', 'assets', 'fisc-bureau-portrait.jpg');
const shot = fs.existsSync(SHOT)
  ? `<div class="shot shot--portrait"><img src="REL_TOKEN/assets/fisc-bureau-portrait.jpg" alt=""></div>`
  : `<div class="shot-ph shot--portrait">PHOTO BUREAU</div>`;

module.exports = { DECOR, slides: [{
  main: `
      <div class="head"></div>
      <h1 class="title" style="font-size:60px;white-space:nowrap">
        2 cases cochées :<br>dossier intéressant.<br>3 cases :<br>
        <span class="blue ul-blue">PRIORITÉ</span> du fisc.
      </h1>
      <p class="body muted" style="margin-top:34px">Expatrié français ?<br>Compte tes cases.</p>
      ${shot}
      <div class="checklist" style="left:96px;top:742px">
        ${[true, true, true, false, false, false].map(c => cbox(c, 52)).join('')}
      </div>
      <div class="swipe" style="position:absolute;bottom:80px;left:80px">
        <span class="swipe-txt">SWIPE</span><span class="swipe-dot">&rarr;</span>
      </div>`
}]};
