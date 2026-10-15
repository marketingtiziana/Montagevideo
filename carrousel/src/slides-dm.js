/* ============================================================
   FYNOVATES / Madame Caci — Deck « DM »
   « Pose ta question à un tax advisor, gratuitement »
   ============================================================ */

const fs = require('fs');
const path = require('path');

/* Illustration de couverture (Higgsfield) — placeholder tant qu'elle est absente */
const ILLUS = path.join(__dirname, '..', 'assets', 'dm-illustration.png');
const illusBlock = fs.existsSync(ILLUS)
  ? `<img class="illus bleed" src="REL_TOKEN/assets/dm-illustration.png" alt="">`
  : `<div class="illus-ph bleed">ILLUSTRATION</div>`;

/* Décor en filigrane : grilles carrées en coin + forme outline très pâle */
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

module.exports = { DECOR, slides: [

  /* ================= 01 · HOOK ================= */
  {
    main: `
      <div class="head"></div>
      <h1 class="title title--hero">
        Pose ta question<br>à un tax advisor.<br><span class="blue">GRATUITEMENT.</span>
      </h1>
      <span class="float" style="top:312px;right:104px">DM<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-6l-6 4.5V17a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"/></svg></span>
      <p class="body muted" style="position:absolute;top:648px;left:560px;width:440px;font-size:34px">
        En DM.<br>Aujourd'hui.
      </p>
      ${illusBlock}
      <div class="swipe" style="position:absolute;bottom:80px;right:80px">
        <span class="swipe-txt">SWIPE</span><span class="swipe-dot">&rarr;</span>
      </div>`
  },

  /* ================= 02 · LE CONSTAT ================= */
  {
    main: `
      ${badge('LE CONSTAT')}
      <h1 class="title">Les mêmes questions<br>traînent <span class="blue">partout</span>.</h1>
      <div class="zone">
        <div class="bubbles">
          <div class="bubble bubble--l">Est-ce que je peux garder mon compte français&nbsp;?</div>
          <div class="bubble bubble--r">Ma LLC doit déclarer quoi exactement&nbsp;?</div>
          <div class="bubble bubble--l" style="margin-left:56px">L'Espagne ou Dubaï pour mon profil&nbsp;?</div>
        </div>
      </div>
      <p class="chute">Groupes Facebook. Forums.<br>Commentaires YouTube.</p>`
  },

  /* ================= 03 · LE PROBLÈME ================= */
  {
    main: `
      ${badge('LE PROBLÈME')}
      <h1 class="title">Et <span class="blue">qui</span> répond<br>à ces questions&nbsp;?</h1>
      <div class="zone">
        <div class="rows">
          <div class="row">
            <span class="row-l">Des inconnus</span>
            <span class="row-v row-v--txt">aucune responsabilité</span>
          </div>
          <div class="row">
            <span class="row-l">D'autres perdus</span>
            <span class="row-v row-v--txt">qui devinent</span>
          </div>
          <div class="row">
            <span class="row-l">Des vendeurs déguisés</span>
            <span class="row-v row-v--txt">qui recrutent</span>
          </div>
        </div>
      </div>
      <p class="chute">Résultat&nbsp;: 4 réponses contradictoires.<br><span class="blue">Zéro décision</span>.</p>`
  },

  /* ================= 04 · CE QUE ÇA COÛTE ================= */
  {
    main: `
      ${badge('CE QUE ÇA COÛTE')}
      <h1 class="title" style="font-size:66px">Le doute est ton poste<br>de dépense <span class="blue">le plus cher</span>.</h1>
      <div class="zone">
        <div class="stat stat--blue" style="padding:56px">
          <div class="stat-fig" style="font-size:72px;white-space:nowrap">Des milliers d'euros</div>
          <div class="stat-sub" style="font-size:32px;margin-top:22px">
            qui partent chaque mois pendant que la décision attend.
          </div>
        </div>
      </div>
      <p class="chute">Une question sans réponse fiable,<br>c'est une décision repoussée.</p>`
  },

  /* ================= 05 · LA SOLUTION ================= */
  {
    main: `
      ${badge('LA SOLUTION')}
      <h1 class="title">Alors on fait<br><span class="blue">simple</span>.</h1>
      <div class="zone">
        <div class="ticks">
          <div class="tick" style="font-size:32px">Tu m'envoies TA question en DM</div>
          <div class="tick" style="font-size:32px">Ta vraie situation, pas un cas théorique</div>
          <div class="tick" style="font-size:32px">Tu reçois une réponse de tax advisor, pour TOI</div>
        </div>
      </div>
      <p class="chute">Pas de copier-coller.<br>Pas de lien vers une formation.</p>`
  },

  /* ================= 06 · POURQUOI GRATUIT ================= */
  {
    main: `
      ${badge('POURQUOI GRATUIT')}
      <h1 class="title">La <span class="blue">confiance</span><br>d'abord.</h1>
      <div class="zone">
        <p class="body">
          C'est comme ça que je travaille depuis 8 ans. Certains repartent avec
          leur réponse. D'autres réalisent qu'ils ont besoin de plus, et on
          avance ensemble.
        </p>
      </div>
      <p class="chute">Dans les deux cas, tu repars<br>avec du <span class="blue">concret</span>.</p>`
  },

  /* ================= 07 · EXEMPLES ================= */
  {
    main: `
      ${badge('EXEMPLES')}
      <h1 class="title">Ce qu'on nous<br>demande <span class="blue">le plus</span>.</h1>
      <div class="zone">
        <div class="ticks ticks--plain">
          <div class="tick" style="font-size:32px">Mon montage actuel est-il en règle&nbsp;?</div>
          <div class="tick" style="font-size:32px">À quel CA l'expatriation devient rentable&nbsp;?</div>
          <div class="tick" style="font-size:32px">Quelle structure pour mon activité&nbsp;?</div>
          <div class="tick" style="font-size:32px">Je pars dans 6 mois&nbsp;: par quoi commencer&nbsp;?</div>
        </div>
      </div>
      <p class="chute">Toutes ont une réponse précise.<br><span class="blue">La tienne aussi</span>.</p>`
  },

  /* ================= 08 · CTA ================= */
  {
    main: `
      ${badge('MAINTENANT')}
      <h1 class="title title--hero">Envoie ta<br><span class="blue">question</span>.</h1>
      <div class="zone">
        <div class="stat stat--blue" style="padding:56px;text-align:center">
          <div style="font-size:64px;font-weight:900;color:#FFFFFF;letter-spacing:-0.02em">DM<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12a4 4 0 0 1 4 4v6a4 4 0 0 1-4 4h-6l-6 4.5V17a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z"/></svg></div>
        </div>
        <p class="muted" style="font-size:30px;font-weight:500;margin-top:36px;text-align:center">
          Réponse personnalisée. Offerte. Sans engagement.
        </p>
      </div>`
  }
]};
