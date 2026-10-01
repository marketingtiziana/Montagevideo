/* ============================================================
   FYNOVATES / Madame Caci — Deck « surcoté »
   « Les 5 destinations les plus SURCOTÉES de 2026 »
   Langage visuel : hype vs réalité, compte à rebours N°5 → N°1
   ============================================================ */

const fs = require('fs');
const path = require('path');

const B = '#4353FF';

/* Visuel de couverture : valise détourée (Higgsfield), ombre refaite en CSS */
const CASE = path.join(__dirname, '..', 'assets', 'surcote-valise.png');
const caseBlock = fs.existsSync(CASE)
  ? `<img class="case bleed" src="REL_TOKEN/assets/surcote-valise.png" alt="">`
  : `<div class="case-ph bleed">VISUEL VALISE</div>`;

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

/* --- étoiles de notation : n remplies sur 5 --- */
const STAR = '12,2 14.9,8.9 22.4,9.5 16.7,14.4 18.4,21.7 12,17.8 5.6,21.7 7.3,14.4 1.6,9.5 9.1,8.9';
const stars = (filled, { size = 34, total = 5, fade = false } = {}) =>
  Array.from({ length: total }, (_, i) => {
    const on = i < filled;
    const op = fade && on ? (1 - i * 0.26).toFixed(2) : 1;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">
      <polygon points="${STAR}" fill="${on ? B : 'none'}" fill-opacity="${on ? op : 0}"
               stroke="${B}" stroke-opacity="${on ? op : 0.45}" stroke-width="1.6"
               stroke-linejoin="round"/></svg>`;
  }).join('');

/* --- flèche descendante entre les deux cards --- */
const ARROW = `
<svg class="hv-arrow" width="34" height="74" viewBox="0 0 34 74" aria-hidden="true">
  <line x1="17" y1="4" x2="17" y2="56" stroke="${B}" stroke-width="3" stroke-linecap="round"/>
  <path d="M7 50 L17 64 L27 50" fill="none" stroke="${B}" stroke-width="3"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

/* --- tête de slide destination : rang géant + pill pays --- */
const rankrow = (rank, code, name) => `
<div class="rankrow">
  <span class="rank">${rank}</span>
  <span class="cc"><span class="cc-code">${code}</span><span class="cc-name">${name}</span></span>
</div>`;

/* --- le composant central --- */
const hype = ({ hype: h, real }) => `
<div class="hv">
  <div class="hv-card">
    <span class="hv-tag">ce qu'on te vend</span>
    <div class="hv-kicker">LA RÉPUTATION</div>
    <div class="hv-stars">${stars(5)}</div>
    <p class="hv-txt">${h}</p>
  </div>
  ${ARROW}
  <div class="hv-card hv-card--real">
    <span class="hv-tag hv-tag--blue">les règles d'aujourd'hui</span>
    <div class="hv-kicker">LA RÉALITÉ 2026</div>
    <div class="hv-stars">${stars(2)}</div>
    <p class="hv-txt">${real}</p>
    <span class="stamp-box" style="right:36px;bottom:-28px;transform:rotate(-10deg)">SURCOTÉ</span>
  </div>
</div>`;

/* --- une slide destination complète --- */
const dest = ({ rank, code, name, hype: h, real, chute }) => ({
  main: `
      ${rankrow(rank, code, name)}
      <div class="zone">${hype({ hype: h, real })}</div>
      <p class="chute">${chute}</p>`
});

module.exports = { DECOR, slides: [

  /* ================= 01 · HOOK ================= */
  {
    main: `
      <div class="head"></div>
      <h1 class="title title--hero">
        Les 5 destinations<br>les plus<br>
        <span class="blue ul-blue">SURCOTÉES</span><br>de 2026.
      </h1>
      <p class="body muted" style="margin-top:30px">Tout le monde en parle. Beaucoup regrettent.</p>
      <div class="halo bleed" style="left:478px;top:650px;width:740px;height:740px"></div>
      <div class="case-floor bleed" style="left:700px;top:1272px;width:300px;height:52px"></div>
      ${caseBlock}
      <span class="rating" style="left:556px;top:880px;transform:rotate(-6deg)">
        ${stars(2, { size: 36 })}
      </span>
      <div class="fan" style="position:absolute;left:84px;top:792px">
        <span class="cc cc--mini" style="transform:rotate(-9deg) translateY(12px)"><span class="cc-code">AE</span></span>
        <span class="cc cc--mini" style="transform:rotate(-5deg) translateY(5px)"><span class="cc-code">ID</span></span>
        <span class="cc cc--mini"><span class="cc-code">MT</span></span>
        <span class="cc cc--mini" style="transform:rotate(5deg) translateY(5px)"><span class="cc-code">EE</span></span>
        <span class="cc cc--mini" style="transform:rotate(9deg) translateY(12px)"><span class="cc-code">PT</span></span>
      </div>
      <div class="swipe" style="position:absolute;bottom:80px;left:80px">
        <span class="swipe-txt">SWIPE</span><span class="swipe-dot">&rarr;</span>
      </div>`
  },

  /* ================= 02 · AVANT DE COMMENCER ================= */
  {
    main: `
      ${badge('AVANT DE COMMENCER')}
      <h1 class="title">Surcoté ne veut pas<br>dire <span class="blue">mauvais</span>.</h1>
      <div class="zone">
        <div class="stat stat--light" style="padding:48px">
          <div style="font-size:42px;font-weight:800;line-height:1.26;letter-spacing:-0.015em">
            Ça veut dire : la réputation dépasse la réalité.
          </div>
        </div>
        <p class="body" style="margin-top:44px">Ces 5 destinations fonctionnent... pour certains profils
          précis. Le problème : on te les vend comme universelles.</p>
      </div>
      <p class="chute">Et la déception coûte <span class="blue">cher</span>.</p>`
  },

  /* ================= 03 · N°5 — LISBONNE ================= */
  dest({
    rank: 'N°5', code: 'PT', name: 'LISBONNE',
    hype: 'Le paradis des nomades et entrepreneurs.',
    real: 'Le régime RNH qui a fait sa légende est FERMÉ depuis 2023. Sans lui : barème standard jusqu\'à 48%. Et des loyers qui ont doublé.',
    chute: 'Tu paies le prix de la hype,<br>sans l\'avantage qui l\'a créée.'
  }),

  /* ================= 04 · N°4 — ESTONIE ================= */
  dest({
    rank: 'N°4', code: 'EE', name: 'ESTONIE',
    hype: 'Crée ta société européenne en ligne avec l\'e-residency.',
    real: 'L\'e-residency ne donne AUCUNE résidence fiscale. Ta société estonienne dirigée depuis chez toi reste imposable... chez toi.',
    chute: 'Le <span class="blue">malentendu</span> le plus<br>répandu d\'Internet.'
  }),

  /* ================= 05 · N°3 — MALTE ================= */
  dest({
    rank: 'N°3', code: 'MT', name: 'MALTE',
    hype: 'Le hub fiscal européen au soleil.',
    real: 'Montages devenus complexes et coûteux à maintenir. Réputation bancaire qui te suit. Coût de la vie qui a explosé.',
    chute: 'L\'avantage net final déçoit<br>souvent le solo entrepreneur.'
  }),

  /* ================= 06 · N°2 — BALI ================= */
  dest({
    rank: 'N°2', code: 'ID', name: 'BALI',
    hype: 'La vie de rêve des créateurs de contenu.',
    real: 'Visas nomades récents et pleins de zones grises. Fiscalité indonésienne mal comprise, pas douce une fois résident. Infrastructure capricieuse.',
    chute: 'Parfait pour 3 mois.<br><span class="blue">Piège</span> fréquent pour une vraie installation.'
  }),

  /* ================= 07 · N°1 — DUBAÏ ================= */
  dest({
    rank: 'N°1', code: 'AE', name: 'DUBAÏ',
    hype: 'LE réflexe 0% de toute une génération.',
    real: 'Un IS de 9% existe désormais. Substance et présence réelle exigées et vérifiées. Loyers dignes de Londres.',
    chute: 'Excellent pour les bons profils, bien structurés.<br>Cher et complexe pour les autres.'
  }),

  /* ================= 08 · LE POINT COMMUN ================= */
  {
    main: `
      ${badge('LE POINT COMMUN')}
      <h1 class="title">La hype a survécu<br>aux <span class="blue">conditions</span>.</h1>
      <div class="zone">
        <div class="stat stat--blue" style="padding:50px">
          <div style="font-size:46px;font-weight:900;line-height:1.16;letter-spacing:-0.02em;color:#FFFFFF">
            Une destination s'évalue sur ses règles D'AUJOURD'HUI.
          </div>
          <div style="margin-top:30px;font-size:30px;font-weight:500;line-height:1.36;color:rgba(255,255,255,0.80)">
            Pas sur sa réputation d'il y a 5 ans. Pas sur les reels de ceux arrivés avant les changements.
          </div>
        </div>
        <div class="hv-stars" style="justify-content:center;gap:22px;margin-top:56px">
          ${stars(5, { size: 46, fade: true })}
        </div>
      </div>`
  },

  /* ================= 09 · CTA ================= */
  {
    main: `
      ${badge('LA SUITE')}
      <h1 class="title" style="font-size:58px;white-space:nowrap">
        Les destinations qui valent<br><span class="blue">VRAIMENT</span> le coup.
      </h1>
      <div class="zone">
        <p class="body" style="text-align:center">Règles à jour, conditions réelles, profils idéaux.</p>
        <div style="display:flex;justify-content:center;margin-top:56px">
          <span class="listpill">LA LISTE</span>
        </div>
        <div class="cta-pill" style="margin-top:58px">Commente LISTE</div>
        <p class="body muted" style="margin-top:28px;text-align:center;font-size:30px">
          Je te l'envoie en DM. Gratuitement.
        </p>
      </div>`
  }

]};
