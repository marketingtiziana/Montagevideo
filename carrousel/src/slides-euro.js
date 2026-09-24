/* ============================================================
   FYNOVATES / Madame Caci — Deck « euro »
   « Le voyage d'un euro » — 100€ encaissés jusqu'à ta poche
   ============================================================ */

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

/* --- composant jauge : montant restant sur les 100€ encaissés --- */
function gauge({ pct, val, prev = '', label = '', mod = '' }) {
  return `
    <div class="gauge ${mod}">
      ${prev ? `<div class="gauge-top"><span class="gauge-prev">${prev}</span></div>` : ''}
      <div class="gauge-bar">
        <div class="gauge-fill" style="width:${pct}%"><span class="gauge-val">${val}</span></div>
      </div>
      ${label ? `<div class="gauge-label">${label}</div>` : ''}
    </div>`;
}
/* rappel d'une étape déjà franchie */
const mini = (pct, val) => gauge({ pct, val, mod: 'gauge--mini' });

module.exports = { DECOR, slides: [

  /* ================= 01 · COUVERTURE ================= */
  {
    main: `
      ${badge("LE VOYAGE D'UN EURO")}

      <h1 class="title" style="margin-top:158px;font-size:74px;max-width:620px">
        Ton client<br>
        paie <span class="blue">100€</span>.<br>
        Toi, tu touches<br>
        <span style="font-size:1.4em;line-height:1.02;display:inline-block">
          <span class="blue u-thick">43€</span>.
        </span>
      </h1>

      <span class="float" style="top:548px;left:372px;transform:rotate(3deg)">&minus;&nbsp;57%</span>

      <p class="muted" style="margin-top:56px;max-width:620px;font-size:34px;font-weight:500;line-height:1.4">
        Chaque étape du trajet, slide par slide.
      </p>

      <div class="coins bleed">
        <div class="coins-col">
          <div class="coin-x coin-1" style="transform:translateX(0)">100€</div>
          <div class="coin-x coin-2" style="transform:translateX(-10px)">83€</div>
          <div class="coin-x coin-3" style="transform:translateX(12px)">62€</div>
          <div class="coin-x coin-4" style="transform:translateX(-8px)">43€</div>
        </div>
        <div class="coin-tag">ta poche</div>
      </div>

      <div class="swipe" style="position:absolute;bottom:80px;right:80px">
        <span class="swipe-txt">SWIPE</span><span class="swipe-dot">&rarr;</span>
      </div>`
  },

  /* ================= 02 · LE DÉPART ================= */
  {
    main: `
      ${badge('LE DÉPART')}
      <h1 class="title">Ton client<br>paie <span class="blue">100€</span>.</h1>
      <div class="zone">
        <div class="stat stat--light">
          <div class="stat-fig" style="font-size:160px">100€</div>
          <div class="stat-sub" style="font-size:30px;margin-top:20px">
            Il clique. C'est débité. Tout le monde est content.
          </div>
        </div>
        <div style="margin-top:44px">${gauge({ pct: 100, val: '100€' })}</div>
      </div>
      <p class="chute">Ces 100€ commencent un<br><span class="blue">parcours d'obstacles</span>.</p>`
  },

  /* ================= 03 · ÉTAPE 1 — LA TVA ================= */
  {
    main: `
      ${badge('ÉTAPE 1 — LA TVA')}
      <h1 class="title">20% ne t'ont<br><span class="blue">jamais</span> appartenu.</h1>
      <div class="zone">
        ${gauge({ pct: 83, val: '83€', prev: '100€', label: 'après TVA' })}
        <p class="body" style="margin-top:56px">Tu n'es que le collecteur.</p>
      </div>
      <p class="chute">Mal collectée&nbsp;?<br>Tu la rembourses de ta poche.</p>`
  },

  /* ================= 04 · ÉTAPE 2 — L'IS ================= */
  {
    main: `
      ${badge("ÉTAPE 2 — L'IS")}
      <h1 class="title">L'impôt sur les<br>sociétés <span class="blue">se sert</span>.</h1>
      <div class="zone">
        <div class="gauges">
          ${mini(100, '100€')}
          ${mini(83, '83€')}
        </div>
        <div style="margin-top:40px">
          ${gauge({ pct: 62, val: '62€', prev: '83€', label: 'après IS (25%)' })}
        </div>
      </div>
      <p class="chute">Et cet argent est encore DANS<br>la société. Pas dans ta poche.</p>`
  },

  /* ================= 05 · ÉTAPE 3 — LA SORTIE ================= */
  {
    main: `
      ${badge('ÉTAPE 3 — LA SORTIE')}
      <h1 class="title">Sortir l'argent&nbsp;:<br>le <span class="blue">grand final</span>.</h1>
      <div class="zone">
        <div class="rows">
          <div class="row">
            <span class="row-l">Salaire</span>
            <span class="row-v row-v--txt">jusqu'à 80% de charges sur le net</span>
          </div>
          <div class="row">
            <span class="row-l">Dividendes</span>
            <span class="row-v row-v--txt">flat tax 30%</span>
          </div>
        </div>
        <div class="gauges" style="margin-top:44px">
          ${mini(100, '100€')}
          ${mini(83, '83€')}
          ${mini(62, '62€')}
        </div>
        <div style="margin-top:36px">
          ${gauge({ pct: 43, val: '43€', prev: '62€', label: 'dans ta poche' })}
        </div>
      </div>
      <p class="chute">Ton client a payé 100.<br>Tu touches <span class="blue">43</span>.</p>`
  },

  /* ================= 06 · SUR UNE ANNÉE ================= */
  {
    main: `
      ${badge('SUR UNE ANNÉE')}
      <h1 class="title">Maintenant,<br><span class="blue">multiplie</span>.</h1>
      <div class="zone">
        <div class="stat stat--blue" style="padding:56px">
          <div class="stat-fig" style="font-size:140px">170 000€</div>
          <div class="stat-sub" style="font-size:32px;margin-top:22px">
            évaporés sur 300 000€ encaissés. Chaque année.
          </div>
        </div>
      </div>
      <p class="chute">En 10 ans&nbsp;: 1,7 million. Le prix d'un<br>immeuble. Parti dans le <span class="blue">tuyau</span>.</p>`
  },

  /* ================= 07 · AUTRE STRUCTURE ================= */
  {
    main: `
      ${badge('AUTRE STRUCTURE')}
      <h1 class="title">Le même euro,<br>autre <span class="blue">TUYAU</span>.</h1>
      <p class="body" style="margin-top:40px">
        Juridiction territoriale, résidence adaptée, TVA gérée via l'OSS.
      </p>
      <div class="zone">
        <div class="stat stat--blue" style="padding:52px 56px">
          ${gauge({ pct: 95, val: '95€', label: 'dans ta poche', mod: 'gauge--invert' })}
        </div>
        <div class="pills" style="margin-top:44px">
          <span class="pill">IS faible ou nul</span>
          <span class="pill">Sortie quasi sans friction</span>
        </div>
      </div>`
  },

  /* ================= 08 · LE FACE-À-FACE ================= */
  {
    main: `
      ${badge('LE FACE-À-FACE')}
      <h1 class="title" style="font-size:66px">Ce n'est pas ton <span class="blue">travail</span><br>qui change.</h1>
      <div class="zone">
        <div class="gauges" style="gap:48px">
          ${gauge({ pct: 43, val: '43€', label: 'structure française', mod: 'gauge--grey' })}
          ${gauge({ pct: 95, val: '95€', label: 'structure internationale' })}
        </div>
      </div>
      <p class="chute">C'est le <span class="blue">TUYAU</span>.</p>`
  },

  /* ================= 09 · LA PARTIE SÉRIEUSE ================= */
  {
    main: `
      ${badge('LA PARTIE SÉRIEUSE')}
      <h1 class="title">Ce tuyau a des<br><span class="blue">conditions</span>.</h1>
      <div class="zone">
        <div class="ticks">
          <div class="tick" style="font-size:32px">Vraie résidence à l'étranger</div>
          <div class="tick" style="font-size:32px">Vraie substance</div>
          <div class="tick" style="font-size:32px">TVA européenne collectée quoi qu'il arrive</div>
        </div>
      </div>
      <p class="chute">L'architecture fait tout.<br>L'improvisation <span class="blue">détruit tout</span>.</p>`
  },

  /* ================= 10 · CTA ================= */
  {
    main: `
      ${badge('TON TOUR')}
      <h1 class="title" style="font-size:64px">Chaque euro que tu encaisses<br>fait <span class="blue">ce voyage</span>.</h1>
      <div class="zone">
        <div class="stat stat--blue" style="padding:56px;text-align:center">
          <div style="font-size:60px;font-weight:900;color:#FFFFFF;letter-spacing:-0.02em">Commente VOYAGE</div>
        </div>
        <p class="muted" style="font-size:30px;font-weight:500;margin-top:36px;text-align:center">
          Échange offert. On analyse ton tuyau ensemble.
        </p>
      </div>`
  }
]};
