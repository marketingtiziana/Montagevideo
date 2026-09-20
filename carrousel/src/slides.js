/* ============================================================
   FYNOVATES — Contenu des 9 slides
   "Personne ne devient riche avec un salaire."
   Chaque entrée : { cls?, main } — `main` est le contenu de .main
   ============================================================ */

/* --- marqueurs de flèches partagés --- */
const DEFS = `
  <defs>
    <marker id="ahBlue" viewBox="0 0 12 12" refX="10" refY="6"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M1 1 L11 6 L1 11" fill="none" stroke="#2563EB"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
    <marker id="ahGrey" viewBox="0 0 12 12" refX="10" refY="6"
            markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M1 1 L11 6 L1 11" fill="none" stroke="#9CA3AF"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>`;

/* ============================== SLIDE 2 — entonnoir ============================== */
const SVG_FUNNEL = `
<svg viewBox="0 0 900 650" role="img" aria-label="Entonnoir du salaire brut au net reel">
  ${DEFS}
  <!-- parois de l'entonnoir -->
  <polygon points="70,140 830,140 730,260 170,260" fill="rgba(96,165,250,0.05)"/>
  <polygon points="170,400 730,400 660,520 240,520" fill="rgba(96,165,250,0.05)"/>

  <!-- bloc 1 : brut charge -->
  <rect x="70" y="0" width="760" height="140" rx="8"
        fill="rgba(37,99,235,0.08)" stroke="#2563EB" stroke-width="2.5"/>
  <text x="450" y="70"  class="svg-val" font-size="58" text-anchor="middle">20 000€</text>
  <text x="450" y="108" class="svg-lab" font-size="25" text-anchor="middle">brut chargé</text>

  <!-- fleche 1 -->
  <line x1="450" y1="152" x2="450" y2="248" stroke="#60A5FA" stroke-width="2.5"
        stroke-linecap="round" marker-end="url(#ahBlue)"/>
  <text x="502" y="208" class="svg-lab" font-size="24">− charges sociales ≈ moitié</text>

  <!-- bloc 2 : net -->
  <rect x="170" y="260" width="560" height="140" rx="8"
        fill="rgba(96,165,250,0.06)" stroke="#60A5FA" stroke-width="2"/>
  <text x="450" y="330" class="svg-val" font-size="52" text-anchor="middle">≈ 10 000€</text>
  <text x="450" y="368" class="svg-lab" font-size="25" text-anchor="middle">net</text>

  <!-- fleche 2 -->
  <line x1="450" y1="412" x2="450" y2="508" stroke="#60A5FA" stroke-width="2.5"
        stroke-linecap="round" marker-end="url(#ahBlue)"/>
  <text x="502" y="452" class="svg-lab" font-size="24">− impôt sur le revenu</text>
  <text x="502" y="483" class="svg-lab" font-size="24">(tranches hautes)</text>

  <!-- bloc 3 : reste reel -->
  <rect x="240" y="520" width="420" height="120" rx="8"
        fill="rgba(37,99,235,0.18)" stroke="#2563EB" stroke-width="2.5"/>
  <text x="450" y="589" class="svg-strong" font-size="29" text-anchor="middle">ce qui te reste vraiment</text>
</svg>`;

/* ============================== SLIDE 4 — circuit ============================== */
const SVG_CIRCUIT = `
<svg viewBox="0 0 900 610" role="img" aria-label="Circuit societe vers holding vers capital">
  ${DEFS}
  <!-- SOCIETE -->
  <rect x="0" y="0" width="250" height="210" rx="8" fill="none" stroke="#60A5FA" stroke-width="2"/>
  <text x="125" y="98"  class="svg-name" font-size="26" text-anchor="middle">SOCIÉTÉ</text>
  <text x="125" y="135" class="svg-lab"  font-size="22" text-anchor="middle">(profits)</text>

  <line x1="262" y1="105" x2="313" y2="105" stroke="#2563EB" stroke-width="2.5"
        stroke-linecap="round" marker-end="url(#ahBlue)"/>

  <!-- HOLDING -->
  <rect x="325" y="0" width="250" height="210" rx="8"
        fill="rgba(37,99,235,0.10)" stroke="#2563EB" stroke-width="2.5"/>
  <text x="450" y="86"  class="svg-name" font-size="26" text-anchor="middle">HOLDING</text>
  <text x="450" y="123" class="svg-lab"  font-size="21" text-anchor="middle">(dividendes, quasi</text>
  <text x="450" y="150" class="svg-lab"  font-size="21" text-anchor="middle">sans friction)</text>

  <line x1="587" y1="105" x2="638" y2="105" stroke="#2563EB" stroke-width="2.5"
        stroke-linecap="round" marker-end="url(#ahBlue)"/>

  <!-- CAPITAL -->
  <rect x="650" y="0" width="250" height="210" rx="8"
        fill="rgba(37,99,235,0.18)" stroke="#2563EB" stroke-width="2.5"/>
  <text x="775" y="98"  class="svg-name" font-size="26" text-anchor="middle">CAPITAL</text>
  <text x="775" y="135" class="svg-lab"  font-size="21" text-anchor="middle">(grossit à l'abri)</text>

  <!-- derivation pointillee : salaire minimal -->
  <line x1="125" y1="210" x2="125" y2="470" stroke="#9CA3AF" stroke-width="2"
        stroke-dasharray="7 9" stroke-linecap="round" marker-end="url(#ahGrey)"/>
  <text x="155" y="348" class="svg-lab" font-size="21">salaire minimal</text>

  <rect x="10" y="494" width="230" height="104" rx="8"
        fill="none" stroke="#9CA3AF" stroke-width="1.5" stroke-opacity="0.45"/>
  <text x="125" y="553" class="svg-lab" font-size="22" text-anchor="middle">train de vie</text>
</svg>`;

/* ============================== SLIDE 6 — les deux tuyaux ============================== */
const SVG_PIPES = `
<svg viewBox="0 0 900 420" role="img" aria-label="Deux sorties de ta société : rémunération et structure">
  <!-- TA SOCIÉTÉ -->
  <rect x="300" y="0" width="300" height="110" rx="8"
        fill="rgba(37,99,235,0.10)" stroke="#2563EB" stroke-width="2.5"/>
  <text x="450" y="66" class="svg-name" font-size="26" text-anchor="middle">TA SOCIÉTÉ</text>

  <!-- gros tuyau : rémunération (barré) -->
  <path d="M390 110 C 390 200, 200 190, 200 320" fill="none"
        stroke="#9CA3AF" stroke-opacity="0.26" stroke-width="28" stroke-linecap="round"/>
  <line x1="238" y1="196" x2="290" y2="238" stroke="#F5F5F7" stroke-opacity="0.55"
        stroke-width="3" stroke-linecap="round"/>
  <line x1="290" y1="196" x2="238" y2="238" stroke="#F5F5F7" stroke-opacity="0.55"
        stroke-width="3" stroke-linecap="round"/>
  <text x="200" y="368" class="svg-lab" font-size="20" text-anchor="middle">rémunération (le plus taxé)</text>

  <!-- tuyau fin bleu : structure (inutilisé) -->
  <path d="M510 110 C 510 200, 700 190, 700 320" fill="none"
        stroke="#2563EB" stroke-width="8" stroke-linecap="round" stroke-dasharray="16 12"/>
  <text x="700" y="368" class="svg-lab" font-size="20" text-anchor="middle">structure (inutilisé)</text>
</svg>`;

/* ============================== LES 9 SLIDES ============================== */
module.exports = [

  /* ---------- 01 · HOOK ---------- */
  {
    main: `
      <div class="main main--center" style="gap:56px">
        <h1 class="title title--hero">
          Personne<br>ne devient riche<br>avec un <span class="u">salaire</span>.
        </h1>
        <p class="lead">Même énorme.<br>Et c'est mathématique.</p>
      </div>`,
    extraFoot: `<span style="color:#60A5FA">Swipe &rarr;</span>`
  },

  /* ---------- 02 · LA PREUVE ---------- */
  {
    main: `
      <div class="main">
        <h2 class="title">Le trajet d'un salaire<br>de 20 000€</h2>
        <div class="diagram">${SVG_FUNNEL}</div>
        <p class="kicker">Le salaire est le revenu<br>le plus taxé qui existe.</p>
      </div>`
  },

  /* ---------- 03 · LES RICHES ---------- */
  {
    main: `
      <div class="main">
        <h2 class="title">Le salaire officiel<br>des grandes fortunes</h2>
        <div class="diagram"><div class="figure" style="font-size:200px">1€</div></div>
        <p class="kicker" style="font-weight:400;color:#9CA3AF;font-size:30px">
          Le salaire symbolique de certains patrons de la tech.<br>
          Ce n'est pas de la modestie.
          <strong style="color:#F5F5F7;font-weight:600">C'est de l'architecture.</strong>
        </p>
      </div>`
  },

  /* ---------- 04 · LEUR CIRCUIT ---------- */
  {
    main: `
      <div class="main">
        <h2 class="title">Leur vrai circuit</h2>
        <div class="diagram">${SVG_CIRCUIT}</div>
        <p class="kicker">Ils ne vivent pas de leur revenu.<br>Ils vivent de leur structure.</p>
      </div>`
  },

  /* ---------- 05 · LA RÈGLE ---------- */
  {
    main: `
      <div class="main">
        <h2 class="title">La règle que l'école<br>ne t'apprend pas</h2>
        <div class="diagram">
          <div style="display:flex;gap:40px;width:900px">
            <div style="flex:1;border:1px solid #232A38;border-radius:8px;padding:44px 38px;min-height:400px;display:flex;flex-direction:column">
              <div class="eyebrow">Salaire</div>
              <div style="flex:1"></div>
              <div style="font-size:30px;font-weight:600;line-height:1.3;color:#F5F5F7">De l'argent qui te traverse.</div>
              <div style="font-size:25px;font-weight:400;line-height:1.35;color:#9CA3AF;margin-top:18px">Paie ton train de vie.</div>
            </div>
            <div style="flex:1;border:1px solid #2563EB;border-radius:8px;padding:44px 38px;min-height:400px;display:flex;flex-direction:column;background:rgba(37,99,235,0.08)">
              <div class="eyebrow" style="color:#60A5FA">Actif / Structure</div>
              <div style="flex:1"></div>
              <div style="font-size:30px;font-weight:600;line-height:1.3;color:#F5F5F7">De l'argent qui te reste.</div>
              <div style="font-size:25px;font-weight:400;line-height:1.35;color:#9CA3AF;margin-top:18px">Construit ton patrimoine.</div>
            </div>
          </div>
        </div>
      </div>`
  },

  /* ---------- 06 · TOI ---------- */
  {
    main: `
      <div class="main">
        <h2 class="title">Le paradoxe<br>de l'entrepreneur</h2>
        <p class="body" style="margin-top:34px">
          Tu as déjà une société. Tu as déjà le véhicule.<br>
          Mais tu te verses tout en rémunération, comme un salarié.
        </p>
        <div class="diagram">${SVG_PIPES}</div>
        <p class="kicker">Tu vides ta machine à cash<br>par le mauvais tuyau.</p>
      </div>`
  },

  /* ---------- 07 · LES STRUCTURÉS ---------- */
  {
    main: `
      <div class="main">
        <h2 class="title">Ce que font les<br>entrepreneurs structurés</h2>
        <div class="diagram">
          <div style="display:flex;flex-direction:column;gap:38px;width:900px">
            ${[
              'Arbitrage rémunération / dividendes',
              'Holding quand le niveau le justifie',
              'Capital qui grossit dans la structure',
              'Juridiction douce pour certains'
            ].map(t => `<div style="display:flex;align-items:center;gap:30px">
              <span style="flex:none;width:12px;height:12px;background:#2563EB;border-radius:2px"></span>
              <span style="font-size:32px;font-weight:500;color:#F5F5F7;letter-spacing:-0.01em">${t}</span>
            </div>`).join('')}
          </div>
        </div>
        <p class="kicker">Même CA que toi.<br>Destin patrimonial opposé.</p>
      </div>`
  },

  /* ---------- 08 · LE DÉCLIC ---------- */
  {
    main: `
      <div class="main main--center" style="align-items:center;text-align:center;gap:56px">
        <p style="font-size:44px;font-weight:500;line-height:1.3;color:#9CA3AF;letter-spacing:-0.02em">
          Arrête de te demander<br>comment gagner plus.
        </p>
        <span style="width:56px;height:3px;background:#2563EB"></span>
        <p style="font-size:52px;font-weight:700;line-height:1.25;color:#F5F5F7;letter-spacing:-0.03em">
          Demande-toi comment<br><span style="color:#2563EB">te payer mieux</span>.
        </p>
      </div>`
  },

  /* ---------- 09 · CTA ---------- */
  {
    main: `
      <div class="main main--center" style="gap:44px">
        <h2 class="title" style="font-family:'Space Grotesk',sans-serif;font-size:84px;font-weight:700;letter-spacing:0.02em">LE CODEX</h2>
        <p class="body" style="font-size:32px">
          Structures, holdings, arbitrages, juridictions.<br>
          <strong>Le mode d'emploi complet.</strong>
        </p>
        <div style="margin-top:22px">
          <span style="display:inline-block;background:#2563EB;border-radius:12px;padding:34px 58px;
                       font-size:36px;font-weight:700;color:#FFFFFF;letter-spacing:-0.01em">Commente CODEX</span>
        </div>
        <p style="font-size:26px;font-weight:400;color:#9CA3AF">Je te l'envoie en DM.</p>
      </div>`
  }
];
