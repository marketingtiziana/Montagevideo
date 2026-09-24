/* ============================================================
   FYNOVATES / Madame Caci — Contenu des 9 slides
   « Personne ne devient riche avec un salaire. »
   ============================================================ */

const fs = require('fs');
const path = require('path');

/* Photo détourée de Tiziana — placeholder tant que le fichier est absent */
const PHOTO = path.join(__dirname, '..', 'assets', 'tiziana-cutout.png');
const photoBlock = fs.existsSync(PHOTO)
  ? `<img class="photo bleed" src="../assets/tiziana-cutout.png" alt="">`
  : `<div class="photo-ph bleed">PHOTO TIZIANA</div>`;

/* Décor en filigrane : grilles carrées en coin + formes outline très pâles */
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

const ARROW = `
<svg class="flow-arrow" width="26" height="58" viewBox="0 0 26 58" aria-hidden="true">
  <line x1="13" y1="3" x2="13" y2="44" stroke="#4353FF" stroke-width="2" stroke-linecap="round"/>
  <path d="M6 40 L13 50 L20 40" fill="none" stroke="#4353FF" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const badge = t => `<div class="head"><span class="badge">${t}</span></div>`;

module.exports = { DECOR, slides: [

  /* ================= 01 · HOOK ================= */
  {
    main: `
      <div class="head"></div>
      <h1 class="title title--hero">
        Personne ne<br>devient riche<br><span class="blue">AVEC UN SALAIRE.</span>
      </h1>
      <span class="float" style="top:312px;right:104px">45% + charges</span>
      <p class="body muted" style="position:absolute;top:592px;left:560px;width:440px;font-size:34px">
        Même énorme.<br>C'est mathématique.
      </p>
      <div class="stat stat--light" style="position:absolute;top:740px;left:560px;width:440px;padding:40px">
        <div class="stat-fig" style="font-size:76px">20 000€</div>
        <div class="stat-sub" style="font-size:26px;margin-top:14px">le salaire du test.</div>
      </div>
      ${photoBlock}
      <div class="swipe" style="position:absolute;bottom:80px;right:80px">
        <span class="swipe-txt">SWIPE</span><span class="swipe-dot">&rarr;</span>
      </div>`
  },

  /* ================= 02 · LA PREUVE ================= */
  {
    main: `
      ${badge('LA PREUVE')}
      <h1 class="title">Le trajet d'un<br>salaire de <span class="blue">20 000€</span>.</h1>
      <div class="zone">
        <div class="rows">
          <div class="row">
            <span class="row-l">Brut chargé</span><span class="row-v">20 000€</span>
          </div>
          <div class="row">
            <span class="row-l">Après charges sociales</span><span class="row-v">≈ 10 800€</span>
          </div>
          <div class="row-card">
            <span class="row-l">Après impôt sur le revenu</span><span class="row-v">≈ 7 500€</span>
          </div>
        </div>
      </div>
      <p class="chute">Le salaire est le revenu<br><span class="blue">le plus taxé</span> qui existe.</p>`
  },

  /* ================= 03 · LES GRANDES FORTUNES ================= */
  {
    main: `
      ${badge('LES GRANDES FORTUNES')}
      <h1 class="title">Leur salaire<br>officiel.</h1>
      <div class="zone">
        <div class="stat stat--blue" style="padding:64px;display:flex;align-items:center;gap:52px">
          <div class="stat-fig" style="font-size:180px;flex:none">1€</div>
          <div class="stat-sub" style="font-size:32px;margin-top:0">
            le salaire symbolique de certains patrons de la tech.
          </div>
        </div>
      </div>
      <p class="chute">Ce n'est pas de la modestie.<br>C'est de l'<span class="blue">architecture</span>.</p>`
  },

  /* ================= 04 · LEUR CIRCUIT ================= */
  {
    main: `
      ${badge('LEUR CIRCUIT')}
      <h1 class="title">Ils ne touchent pas<br>leur argent.<br>Ils le <span class="blue">positionnent</span>.</h1>
      <div class="zone">
        <div class="flow">
          <div class="flow-card flow-card--light">
            <span class="flow-name">SOCIÉTÉ</span>
            <span class="flow-desc">— les profits restent dedans</span>
          </div>
          ${ARROW}
          <div class="flow-card flow-card--light">
            <span class="flow-name">HOLDING</span>
            <span class="flow-desc">— dividendes quasi sans friction</span>
          </div>
          ${ARROW}
          <div class="flow-card flow-card--blue">
            <span class="flow-name">CAPITAL</span>
            <span class="flow-desc">— grossit à l'abri, année après année</span>
          </div>
        </div>
      </div>
      <p class="chute">Ils vivent de leur <span class="blue">structure</span>.<br>Pas de leur revenu.</p>`
  },

  /* ================= 05 · LA RÈGLE ================= */
  {
    main: `
      ${badge('LA RÈGLE')}
      <h1 class="title">Ce que <span class="blue">l'école</span><br>ne t'apprend pas.</h1>
      <div class="zone">
        <div class="duo">
          <div class="duo-card duo-card--light">
            <span class="duo-kicker">SALAIRE</span>
            <span class="duo-txt">De l'argent qui te traverse.</span>
          </div>
          <div class="duo-card duo-card--blue">
            <span class="duo-kicker">STRUCTURE</span>
            <span class="duo-txt">De l'argent qui te reste.</span>
          </div>
        </div>
      </div>
      <p class="chute">L'un paie ta vie. L'autre<br>construit ton <span class="blue">patrimoine</span>.</p>`
  },

  /* ================= 06 · LE PARADOXE ================= */
  {
    main: `
      ${badge('LE PARADOXE')}
      <h1 class="title">Tu as déjà<br>le <span class="blue">véhicule</span>.</h1>
      <p class="body" style="margin-top:40px">
        Tu as une société. Une machine à cash. Mais tu la vides
        par le tuyau le plus taxé&nbsp;: la rémunération.
      </p>
      <div class="zone">
        <div class="rows">
          <div class="row row--struck">
            <span class="row-l">Rémunération</span>
            <span class="row-v row-v--txt">jusqu'à 80% de charges</span>
          </div>
          <div class="row-card">
            <span class="row-l">Structure</span>
            <span class="row-v row-v--txt">le tuyau que tu n'utilises pas</span>
          </div>
        </div>
      </div>
      <p class="chute">Même machine.<br><span class="blue">Mauvais tuyau</span>.</p>`
  },

  /* ================= 07 · LES STRUCTURÉS ================= */
  {
    main: `
      ${badge('LES STRUCTURÉS')}
      <h1 class="title">Ce qu'ils font<br><span class="blue">différemment</span>.</h1>
      <div class="zone">
        <div class="ticks">
          <div class="tick">Arbitrage rémunération / dividendes</div>
          <div class="tick">Holding quand le niveau le justifie</div>
          <div class="tick">Capital qui grossit dans la structure</div>
          <div class="tick">Juridiction douce pour certains</div>
        </div>
        <div class="pills" style="margin-top:48px">
          <span class="pill">Hong Kong</span>
          <span class="pill">Dubaï</span>
          <span class="pill">Andorre</span>
        </div>
      </div>
      <p class="chute">Même CA que toi.<br>Destin patrimonial <span class="blue">opposé</span>.</p>`
  },

  /* ================= 08 · LE DÉCLIC ================= */
  {
    main: `
      <div class="head"></div>
      <div class="zone" style="justify-content:center;gap:56px">
        <p class="muted" style="font-size:48px;font-weight:500;line-height:1.3;letter-spacing:-0.01em">
          Arrête de te demander<br>comment gagner plus.
        </p>
        <p style="font-size:72px;font-weight:900;line-height:1.06;letter-spacing:-0.025em;word-spacing:0.05em">
          Demande-toi comment<br><span class="blue">te payer mieux</span>.
        </p>
      </div>`
  },

  /* ================= 09 · CTA ================= */
  {
    main: `
      ${badge('GRATUIT')}
      <h1 class="title title--codex">LE <span class="blue">CODEX</span>.</h1>
      <p class="body" style="margin-top:40px">
        Structures, holdings, arbitrages, juridictions.<br>
        Le mode d'emploi complet.
      </p>
      <div class="zone">
        <div class="stat stat--blue" style="padding:56px;text-align:center">
          <div style="font-size:64px;font-weight:900;color:#FFFFFF;letter-spacing:-0.02em">Commente CODEX</div>
        </div>
        <p class="muted" style="font-size:30px;font-weight:500;margin-top:36px;text-align:center">
          Je te l'envoie en DM.
        </p>
      </div>`
  }
]};
