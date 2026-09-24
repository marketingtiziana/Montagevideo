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

/* --- bord dentele : ~23px de pas, comme la couverture (500px / 22 dents) --- */
const tear = (width) => {
  let teeth = Math.round(width / 22.7);
  if (teeth % 2) teeth += 1;                       // nombre pair : la dentelure boucle proprement
  const pts = ['0% 0%', '100% 0%'];
  for (let i = teeth; i >= 0; i--) {
    pts.push(`${(i * 100 / teeth).toFixed(3)}% ${i % 2 === 0 ? '100%' : 'calc(100% - 14px)'}`);
  }
  return pts.join(', ');
};
const TEAR = tear(500);                            // couverture (slide 1)

/* --- ligne de ticket : les points de conduite sont calcules pour que
       tous les montants d'un meme bloc tombent sur la meme colonne --- */
const tline = (label, amount, cells) =>
  `${label} ${'.'.repeat(cells - label.length - amount.length - 2)} ${amount}`;

/* --- fragment de ticket : zoom sur une ou deux lignes --- */
const frag = ({ head = '', lines, hl = false }) => `
<div class="frag-wrap bleed">
  <div class="frag" style="clip-path:polygon(${tear(880)})">
    ${head ? `<div class="frag-head">${head}</div>` : ''}
    ${lines.map(l => `<div class="frag-line">${hl ? `<span class="frag-hl">${l}</span>` : l}</div>`).join('')}
  </div>
</div>`;

/* --- tampon de verdict --- */
const stampBox = (txt, style) => `<span class="stamp-box" style="${style}">${txt}</span>`;

/* --- tampon rond a cheval sur le bas du ticket --- */
const STAMP = `
<svg class="stamp" viewBox="0 0 210 210" aria-hidden="true" style="transform:rotate(-12deg)">
  <defs>
    <path id="ring" fill="none"
          d="M105,105 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/>
  </defs>
  <circle cx="105" cy="105" r="101" fill="none" stroke="#4353FF" stroke-width="3"/>
  <circle cx="105" cy="105" r="66"  fill="none" stroke="#4353FF" stroke-width="2"/>
  <text class="stamp-ring" font-size="15">
    <textPath href="#ring" startOffset="0">STRUCTURE FRANÇAISE • STRUCTURE FRANÇAISE •</textPath>
  </text>
  <text class="stamp-mid" x="105" y="120" text-anchor="middle" font-size="40">−57%</text>
</svg>`;

module.exports = { DECOR, slides: [

  /* ================= 01 · COUVERTURE « le reçu de caisse » ================= */
  {
    main: `
      ${badge("LE VOYAGE D'UN EURO")}

      <h1 class="title" style="margin-top:58px;font-size:60px;max-width:620px">
        Voici le vrai<br>ticket de caisse<br>de ton<br><span class="blue">BUSINESS</span>.
      </h1>

      <p class="muted" style="margin-top:55px;max-width:380px;font-size:34px;font-weight:500;line-height:1.4">
        Ton client paie 100€. Suis le trajet.
      </p>

      <div style="margin-top:40px">
        <span class="pill" style="font-size:24px">slide par slide &rarr;</span>
      </div>

      <div class="receipt-wrap bleed">
        <div class="receipt" style="clip-path:polygon(${TEAR})">
          <div class="rc-head">TON BUSINESS</div>
          <div class="rc-dots"></div>
          <div class="rc-line">Paiement client ........ 100,00€</div>
          <div class="rc-line">TVA .................... −16,67€</div>
          <div class="rc-line">Impôt sociétés ......... −20,83€</div>
          <div class="rc-line">Sortie (flat tax) ...... −19,00€</div>
          <div class="rc-rule"></div>
          <div class="rc-total">
            <span class="rc-total-lbl">RESTE POUR TOI</span>
            <span class="rc-total-val">43,50€</span>
          </div>
          <div class="rc-foot">MERCI DE VOTRE FIDÉLITÉ</div>
        </div>
      </div>

      ${STAMP}

      <div class="swipe" style="position:absolute;bottom:80px;right:80px">
        <span class="swipe-txt">SWIPE</span><span class="swipe-dot">&rarr;</span>
      </div>`
  },

  /* ================= 02 · LE DÉPART ================= */
  {
    main: `
      ${badge('LE DÉPART')}
      <h1 class="title">Ton client<br>paie <span class="blue mono">100€</span>.</h1>
      <div class="zone">
        ${frag({ head: 'TON BUSINESS', lines: [tline('Paiement client', '100,00€', 32)] })}
        <div style="margin-top:64px">${gauge({ pct: 100, val: '100€' })}</div>
      </div>
      <p class="chute">Ces 100€ commencent un<br><span class="blue">parcours d'obstacles</span>.</p>`
  },

  /* ================= 03 · ÉTAPE 1 — LA TVA ================= */
  {
    main: `
      ${badge('ÉTAPE 1 — LA TVA')}
      <h1 class="title">20% ne t'ont<br><span class="blue">jamais</span> appartenu.</h1>
      <div class="zone">
        <div style="position:relative;width:880px;margin:0 auto">
          ${frag({ lines: [tline('TVA', '−16,67€', 32)], hl: true })}
          ${stampBox('COLLECTEUR', 'right:10px;bottom:-32px;transform:rotate(-10deg)')}
        </div>
        <div style="margin-top:80px">
          ${gauge({ pct: 83, val: '83€', prev: '100€', label: 'après TVA' })}
        </div>
      </div>
      <p class="chute">Mal collectée&nbsp;?<br>Tu la rembourses de ta poche.</p>`
  },

  /* ================= 04 · ÉTAPE 2 — L'IS ================= */
  {
    main: `
      ${badge("ÉTAPE 2 — L'IS")}
      <h1 class="title">L'impôt sur les<br>sociétés <span class="blue">se sert</span>.</h1>
      <div class="zone">
        <div style="position:relative;width:880px;margin:0 auto">
          ${frag({ lines: [tline('Impôt sociétés', '−20,83€', 32)], hl: true })}
          ${stampBox('PAS ENCORE À TOI', 'right:10px;bottom:-32px;transform:rotate(-8deg)')}
        </div>
        <div style="margin-top:80px">
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
        ${frag({ lines: [
            tline('Salaire', "jusqu'à −80% net", 36),
            tline('Dividendes', '−30% flat', 36)
          ] })}
        <div style="margin-top:64px">
          ${gauge({ pct: 43, val: '43€', prev: '62€', label: 'dans ta poche' })}
        </div>
      </div>
      <p class="chute">Ton client a payé 100.<br>Tu touches <span class="blue mono">43</span>.</p>`
  },

  /* ================= 06 · SUR UNE ANNÉE ================= */
  {
    main: `
      ${badge('SUR UNE ANNÉE')}
      <h1 class="title">Maintenant,<br><span class="blue">multiplie</span>.</h1>
      <div class="zone">
        <div class="stat stat--blue" style="padding:56px">
          <div class="stat-fig mono" style="font-size:130px;font-weight:700">170 000€</div>
          <div class="stat-sub" style="font-size:32px;margin-top:24px">
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
      <p class="body" style="margin-top:38px">
        Juridiction territoriale, résidence adaptée, TVA gérée via l'OSS.
      </p>
      <div class="zone">
        <div style="position:relative;width:620px;margin:0 auto">
          <div class="ticket7-wrap bleed">
            <div class="ticket7" style="clip-path:polygon(${tear(620)})">
              <div class="frag-line">${tline('Paiement client', '100,00€', 33)}</div>
              <div class="frag-line">${tline('Structure territoriale', '−2,00€', 33)}</div>
              <div class="frag-line">${tline('Sortie optimisée', '−3,00€', 33)}</div>
              <div class="rc-rule"></div>
              <div class="rc-total">
                <span class="rc-total-lbl">RESTE POUR TOI</span>
                <span class="rc-total-val">95,00€</span>
              </div>
            </div>
          </div>
          ${stampBox('95€/100€', 'right:-64px;bottom:-34px;transform:rotate(-12deg)')}
        </div>
      </div>`
  },

  /* ================= 08 · LE FACE-À-FACE ================= */
  {
    main: `
      ${badge('LE FACE-À-FACE')}
      <h1 class="title" style="font-size:66px">Ce n'est pas ton <span class="blue">travail</span><br>qui change.</h1>
      <div class="zone">
        <div class="gauges" style="gap:52px">
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
        <div class="ticks ticks--dot">
          <div class="tick" style="font-size:32px">Vraie résidence à l'étranger</div>
          <div class="tick" style="font-size:32px">Vraie substance</div>
          <div class="tick" style="font-size:32px">TVA européenne collectée quoi qu'il arrive</div>
        </div>
      </div>
      <p class="chute">L'architecture fait tout.<br>L'improvisation <span class="blue">détruit tout</span>.</p>`
  },

  /* ================= 10 · CTA — LE CODEX ================= */
  {
    main: `
      ${badge('LA SOLUTION')}

      <h1 class="title" style="text-align:center;font-size:56px;margin-top:78px">
        Ton euro mérite<br><span class="blue">un meilleur voyage</span>.
      </h1>

      <div class="codex-scene" style="margin-top:46px">
        <div class="codex-bg bleed">
          <div class="rc-dots" style="margin:0 0 24px"></div>
          <div class="rc-total">
            <span class="rc-total-lbl">RESTE POUR TOI</span>
            <span class="rc-total-val">43,50€</span>
          </div>
        </div>

        <div class="codex-holder">
          <div class="codex">
            <div class="codex-spine"></div>
            <div class="codex-rule"></div>
            <div class="codex-title">LE CODEX</div>
            <div class="codex-sub">STRUCTURES · PAYS · MÉCANISMES</div>
          </div>
          ${stampBox('GRATUIT', 'right:-78px;bottom:-28px;transform:rotate(-10deg)')}
        </div>
      </div>

      <div class="codex-line">Structures ... Holdings ... Juridictions ... Étapes</div>

      <span class="cta-pill">Commente CODEX</span>

      <p class="muted" style="text-align:center;margin-top:32px;font-size:30px;font-weight:500">
        Je te l'envoie en DM. Gratuitement.
      </p>`
  }
]};
