/* ============================================================
   FYNOVATES / Madame Caci — Deck « vatican »
   « Ce que le Vatican t'apprend sur l'argent »
   Langage visuel : architecture et géométrie uniquement
   (arches, coupole, colonnades, plan de la place, sceaux).
   Aucune iconographie religieuse.
   ============================================================ */

const B = '#4353FF';

/* ---------- COUPOLE : motif signature, dessinée dans un repère 300x372 ----------
   lanterne + calotte + côtes + tambour + entablement + colonnade de base. */
const DOME_SHAPE = `
  <circle cx="150" cy="39" r="5.5"/>
  <path d="M150,44.5 V48"/>
  <path d="M128,72 C128,54 138,48 150,48 C162,48 172,54 172,72"/>
  <path d="M128,72 H172 V116 H128 Z"/>
  <path d="M143,72 V116"/><path d="M157,72 V116"/>
  <path d="M120,116 H180"/>
  <path d="M60,244 C60,152 102,116 150,116 C198,116 240,152 240,244"/>
  <path d="M150,116 V244"/>
  <path d="M113,123 C99,160 91,205 89,244"/>
  <path d="M187,123 C201,160 209,205 211,244"/>
  <path d="M42,244 H258"/>
  <path d="M60,244 V306"/><path d="M240,244 V306"/>
  <path d="M89,306 V288 A11,11 0 0 1 111,288 V306"/>
  <path d="M139,306 V288 A11,11 0 0 1 161,288 V306"/>
  <path d="M189,306 V288 A11,11 0 0 1 211,288 V306"/>
  <path d="M36,306 H264"/><path d="M36,320 H264"/>
  <path d="M36,306 V320"/><path d="M264,306 V320"/>
  <path d="M50,320 V354"/><path d="M62,320 V354"/>
  <path d="M84,320 V354"/><path d="M96,320 V354"/>
  <path d="M118,320 V354"/><path d="M130,320 V354"/>
  <path d="M152,320 V354"/><path d="M164,320 V354"/>
  <path d="M186,320 V354"/><path d="M198,320 V354"/>
  <path d="M220,320 V354"/><path d="M232,320 V354"/>
  <path d="M26,354 H274"/><path d="M26,364 H274"/>
  <path d="M26,354 V364"/><path d="M274,354 V364"/>`;

/* coupole autonome : hauteur en px, épaisseur de trait en px réels */
const dome = ({ h, px = 3, op = 1, style = '', cls = '' }) => {
  const w = (h * 300 / 372).toFixed(1);
  return `<svg class="${cls}" width="${w}" height="${h}" viewBox="0 0 300 372" aria-hidden="true"
     style="${style}"><g fill="none" stroke="${B}" stroke-opacity="${op}"
     stroke-width="${(px * 372 / h).toFixed(2)}" stroke-linecap="round"
     stroke-linejoin="round">${DOME_SHAPE.replace('<circle', `<circle fill="${B}" fill-opacity="${op}"`)}</g></svg>`;
};
/* coupole à insérer dans un SVG plus large */
const domeG = ({ x, y, h, px = 2.5, op = 1 }) => {
  const s = h / 372;
  return `<g transform="translate(${x},${y}) scale(${s.toFixed(4)})" fill="none" stroke="${B}"
    stroke-opacity="${op}" stroke-width="${(px / s).toFixed(2)}" stroke-linecap="round"
    stroke-linejoin="round">${DOME_SHAPE.replace('<circle', `<circle fill="${B}" fill-opacity="${op}"`)}</g>`;
};

/* ---------- ARCHE ROMANE ---------- */
const arch = (w, h, px = 2.5, op = 1) => {
  const r = w / 2;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path
    d="M1.5,${h - 1} V${r + 1} A${r - 1.5},${r - 1.5} 0 0 1 ${w - 1.5},${r + 1} V${h - 1}"
    fill="none" stroke="${B}" stroke-opacity="${op}" stroke-width="${px}" stroke-linecap="round"/></svg>`;
};

/* ---------- SCEAU : double liseré contenant un chiffre ---------- */
const seal = (l1, l2, d = 216) => `
<svg width="${d}" height="${d}" viewBox="0 0 216 216" aria-hidden="true">
  <circle cx="108" cy="108" r="104" fill="none" stroke="${B}" stroke-width="3"/>
  <circle cx="108" cy="108" r="88"  fill="none" stroke="${B}" stroke-width="1.5"/>
  <text x="108" y="100" text-anchor="middle" font-family="Inter" font-weight="900"
        font-size="46" letter-spacing="-1" fill="${B}">${l1}</text>
  <text x="108" y="146" text-anchor="middle" font-family="Inter" font-weight="700"
        font-size="30" letter-spacing="6" fill="${B}">${l2}</text>
</svg>`;

/* ---------- CADENAS géométrique (carré + anse) ---------- */
const lock = `
<svg width="40" height="46" viewBox="0 0 40 46" aria-hidden="true">
  <path d="M11,21 V14 A9,9 0 0 1 29,14 V21" fill="none" stroke="${B}" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="4" y="21" width="32" height="23" rx="3" fill="none" stroke="${B}" stroke-width="2.5"/>
  <circle cx="20" cy="32.5" r="3" fill="${B}"/>
</svg>`;

/* ---------- PLAN DE LA PLACE : ellipse à double colonnade, vue du dessus ---------- */
const plan = (op = 0.14) => {
  const ring = (rx, ry, n, r) => {
    let o = '';
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      o += `<circle cx="${(340 + rx * Math.cos(a)).toFixed(1)}" cy="${(260 + ry * Math.sin(a)).toFixed(1)}" r="${r}"/>`;
    }
    return o;
  };
  return `
<svg class="decor bleed" width="680" height="520" viewBox="0 0 680 520" aria-hidden="true"
     style="position:absolute;top:470px;left:200px;opacity:${op}">
  <g fill="none" stroke="${B}" stroke-width="2">
    <ellipse cx="340" cy="260" rx="316" ry="238"/>
    <ellipse cx="340" cy="260" rx="252" ry="186"/>
    <ellipse cx="340" cy="260" rx="150" ry="110"/>
  </g>
  <g fill="${B}">${ring(284, 212, 44, 5)}${ring(218, 158, 40, 4)}<circle cx="340" cy="260" r="7"/></g>
</svg>`;
};

/* ---------- DÉCOR COMMUN : arcade en filigrane sur le bord bas ---------- */
const arcade = (() => {
  let o = '';
  for (let x = -10; x < 1090; x += 90) {
    o += `<path d="M${x},1350 V1306 A45,45 0 0 1 ${x + 90},1306 V1350"/>`;
  }
  return o;
})();
const DECOR = `
<svg class="decor bleed" viewBox="0 0 1080 1350" aria-hidden="true">
  <g fill="none" stroke="${B}" stroke-opacity="0.09" stroke-width="2">${arcade}</g>
</svg>`;

const badge = t => `<div class="head"><span class="badge">${t}</span></div>`;

/* ---------- CARTE EN POINTS : grille filtrée par des contours simplifiés ---------- */
const LANDS = [
  [[-168,66],[-160,71],[-130,70],[-95,72],[-80,73],[-60,68],[-55,52],[-70,44],[-80,32],[-97,26],[-107,23],[-117,32],[-125,40],[-130,55],[-145,60]],
  [[-97,26],[-92,17],[-83,9],[-77,8],[-86,15],[-95,20]],
  [[-81,8],[-70,12],[-60,10],[-50,0],[-35,-6],[-38,-20],[-48,-25],[-58,-35],[-65,-45],[-72,-52],[-75,-45],[-71,-30],[-70,-18],[-80,-5]],
  [[-45,60],[-20,70],[-25,82],[-45,83],[-58,76],[-55,65]],
  [[-10,44],[-9,38],[0,36],[10,38],[18,40],[28,36],[30,45],[40,48],[30,60],[28,70],[10,64],[5,58],[-5,50]],
  [[-17,14],[-10,5],[0,5],[10,4],[9,-1],[13,-5],[12,-17],[15,-28],[20,-35],[28,-33],[33,-26],[40,-15],[41,-3],[43,5],[51,12],[44,12],[37,18],[34,28],[32,31],[20,32],[10,35],[0,28],[-8,25],[-17,21]],
  [[30,45],[45,40],[48,30],[55,25],[60,25],[68,24],[78,8],[80,15],[90,22],[95,15],[100,13],[105,10],[110,18],[118,22],[122,30],[127,35],[130,43],[140,45],[142,53],[135,55],[140,60],[160,60],[170,66],[180,68],[170,72],[140,73],[110,76],[80,76],[60,70],[50,68],[40,66],[30,60]],
  [[113,-22],[115,-34],[130,-32],[138,-35],[146,-39],[150,-35],[153,-28],[145,-15],[135,-12],[125,-14]]
];
const MAP_W = 920, MAP_H = 430, LAT_T = 85, LAT_B = -60;
const px_ = lon => (lon + 180) / 360 * MAP_W;
const py_ = lat => (LAT_T - lat) / (LAT_T - LAT_B) * MAP_H;

const inside = (x, y, poly) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = px_(poly[i][0]), yi = py_(poly[i][1]);
    const xj = px_(poly[j][0]), yj = py_(poly[j][1]);
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};
const dotMap = () => {
  let o = '';
  for (let y = 8; y < MAP_H; y += 15) {
    for (let x = 8; x < MAP_W; x += 15) {
      if (LANDS.some(p => inside(x, y, p))) o += `<circle cx="${x}" cy="${y}" r="2.8"/>`;
    }
  }
  return o;
};

/* villes : projection réelle, puis écartement x2,2 du groupe européen
   pour que les trois points restent lisibles à l'échelle du feed */
const CITIES = (() => {
  const raw = { 'NEW YORK': [-74, 40.7], 'LONDRES': [-0.13, 51.5], 'PARIS': [2.35, 48.85], 'ROME': [12.5, 41.9] };
  const eu = ['LONDRES', 'PARIS', 'ROME'];
  const cx = eu.reduce((s, k) => s + px_(raw[k][0]), 0) / 3;
  const cy = eu.reduce((s, k) => s + py_(raw[k][1]), 0) / 3;
  const out = {};
  for (const [k, v] of Object.entries(raw)) {
    const x = px_(v[0]), y = py_(v[1]);
    out[k] = eu.includes(k) ? [cx + (x - cx) * 2.2, cy + (y - cy) * 2.2] : [x, y];
  }
  return out;
})();
const cityArc = (a, b, bow = 26) => {
  const [x1, y1] = CITIES[a], [x2, y2] = CITIES[b];
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2 - bow;
  return `<path d="M${x1.toFixed(1)},${y1.toFixed(1)} Q${mx.toFixed(1)},${my.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}"
    fill="none" stroke="${B}" stroke-width="2" stroke-opacity="0.55"/>`;
};
const cityDot = (k, dx, dy, anchor = 'start') => {
  const [x, y] = CITIES[k];
  return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${B}"/>
    <text class="map-label" x="${(x + dx).toFixed(1)}" y="${(y + dy).toFixed(1)}" text-anchor="${anchor}">${k}</text>`;
};

module.exports = { DECOR, slides: [

  /* ================= 01 · HOOK ================= */
  {
    main: `
      <div class="head"></div>
      <h1 class="title title--hero">
        Ce que le Vatican<br>t'apprend sur<br><span class="blue">L'ARGENT</span>.
      </h1>
      <p class="body muted" style="margin-top:38px">(Et que ton banquier ignore.)</p>
      <span class="float" style="top:306px;right:80px">44 hectares</span>
      <div style="position:absolute;left:80px;top:706px;width:250px">
        <div class="rule-dbl rule-dbl--blue"></div>
        <div class="serif-cap" style="margin-top:28px">MMXXVI</div>
      </div>
      ${dome({ h: 560, px: 3, style: 'position:absolute;left:548px;top:618px' })}
      <div class="swipe" style="position:absolute;bottom:80px;right:80px">
        <span class="swipe-txt">SWIPE</span><span class="swipe-dot">&rarr;</span>
      </div>`
  },

  /* ================= 02 · LE PLUS PETIT ÉTAT ================= */
  {
    main: `
      ${badge('DERRIÈRE LA PAPAMOBILE')}
      <h1 class="title">Le <span class="blue">plus petit</span> État<br>du monde.</h1>
      ${plan()}
      <div class="zone">
        <div style="display:flex;flex-direction:column;gap:22px">
          <div class="stat stat--light" style="padding:34px 40px">
            <div class="stat-fig" style="font-size:68px">44 ha</div>
            <div class="stat-sub" style="font-size:27px;margin-top:12px">de superficie totale.</div>
          </div>
          <div class="stat stat--light" style="padding:34px 40px">
            <div class="stat-fig" style="font-size:68px">&lt; 1 000</div>
            <div class="stat-sub" style="font-size:27px;margin-top:12px">habitants.</div>
          </div>
          <div class="stat stat--blue" style="padding:34px 40px">
            <div class="stat-fig" style="font-size:68px">Souverain</div>
            <div class="stat-sub" style="font-size:27px;margin-top:12px">avec sa banque, ses finances, sa diplomatie.</div>
          </div>
        </div>
      </div>
      <p class="chute">La plus vieille <span class="blue">architecture financière</span><br>du monde.</p>`
  },

  /* ================= 03 · LEÇON 1 ================= */
  {
    main: `
      ${badge('LEÇON 1')}
      <h1 class="title">L'institution <span class="blue">survit</span><br>aux personnes.</h1>
      <div class="zone">
        <div style="display:flex;align-items:flex-end;gap:36px">
          <div style="flex:none">
            <svg width="640" height="216" viewBox="0 0 640 216" aria-hidden="true">
              <g fill="none" stroke="${B}" stroke-opacity="0.35" stroke-width="2.5" stroke-linecap="round">
                <path d="M10,206 V126 A50,50 0 0 1 110,126 V206"/>
                <path d="M110,206 V126 A50,50 0 0 1 210,126 V206"/>
                <path d="M210,206 V126 A50,50 0 0 1 310,126 V206"/>
                <path d="M310,206 V126 A50,50 0 0 1 410,126 V206"/>
                <path d="M410,206 V126 A50,50 0 0 1 510,126 V206"/>
                <path d="M510,206 V126 A50,50 0 0 1 610,126 V206"/>
                <path d="M4,206 H616"/>
              </g>
            </svg>
            <div class="muted" style="margin-top:26px;font-size:30px;font-weight:600;
                 text-decoration:line-through;text-align:center;width:620px">
              empires · monnaies · régimes
            </div>
          </div>
          <div style="flex:none;padding-bottom:6px">${seal('2000', 'ANS')}</div>
        </div>
      </div>
      <p class="body" style="margin-bottom:34px">Le patrimoine n'appartient à personne.
        Il appartient à des structures qui traversent le temps.</p>
      <p class="chute">Ta boîte où tout repose sur toi ?<br>L'exact inverse.</p>`
  },

  /* ================= 04 · LEÇON 2 ================= */
  {
    main: `
      ${badge('LEÇON 2')}
      <h1 class="title">Les patrimoines<br>sont <span class="blue">séparés</span>.</h1>
      <div class="zone">
        <div>
          <svg width="920" height="268" viewBox="0 0 920 268" aria-hidden="true">
            ${domeG({ x: 381, y: 0, h: 196, px: 2.5 })}
            <g fill="none" stroke="${B}" stroke-width="2" stroke-opacity="0.75" stroke-linecap="round">
              <path d="M460,194 V226"/>
              <path d="M144,226 H776"/>
              <path d="M144,226 V268"/><path d="M460,226 V268"/><path d="M776,226 V268"/>
            </g>
          </svg>
          <div class="vault">
            <div class="vault-card">${lock}<div class="vault-name">IMMOBILIER</div></div>
            <div class="vault-card">${lock}<div class="vault-name">FINANCES</div></div>
            <div class="vault-card">${lock}<div class="vault-name">BANQUE (IOR)</div></div>
          </div>
        </div>
      </div>
      <p class="body" style="margin-bottom:34px">Chaque brique est isolée.
        Si l'une tombe, les autres tiennent.</p>
      <p class="chute">Toi : maison, compte pro, épargne…<br><span class="blue">le même panier</span> juridique.</p>`
  },

  /* ================= 05 · LEÇON 3 ================= */
  {
    main: `
      ${badge('LEÇON 3')}
      <h1 class="title">Ne jamais dépendre<br>d'<span class="blue">un seul pays</span>.</h1>
      <div class="zone">
        <div>
          <svg width="920" height="430" viewBox="0 0 920 430" aria-hidden="true">
            <g fill="#8A8FA3" fill-opacity="0.45">${dotMap()}</g>
            ${cityArc('NEW YORK', 'LONDRES', 42)}
            ${cityArc('LONDRES', 'PARIS', 14)}
            ${cityArc('PARIS', 'ROME', 14)}
            ${cityDot('NEW YORK', -18, 6, 'end')}
            ${cityDot('LONDRES', -18, -14, 'end')}
            ${cityDot('PARIS', 20, -8)}
            ${cityDot('ROME', 20, 12)}
          </svg>
          <div class="pills" style="margin-top:32px;justify-content:center">
            <span class="pill">Entités par pays</span>
            <span class="pill">Actifs répartis</span>
          </div>
        </div>
      </div>
      <p class="chute">Aucun État ne peut tout saisir.<br>Aucune crise ne peut tout emporter.</p>`
  },

  /* ================= 06 · LEÇON 4 ================= */
  {
    main: `
      ${badge('LEÇON 4')}
      <h1 class="title">Le <span class="blue">statut</span> avant<br>la taille.</h1>
      <div class="zone">
        <div class="versus">
          <div style="flex:none;width:340px">
            <div style="display:flex;justify-content:center">${dome({ h: 120, px: 2.5 })}</div>
            <div class="plinth" style="margin-top:22px">ÉTAT SOUVERAIN</div>
          </div>
          <div class="ghost" style="flex:1;height:250px"><span>GRANDE ENTREPRISE</span></div>
        </div>
      </div>
      <p class="body" style="margin-bottom:34px">La puissance vient du statut juridique.
        Pas de la surface.</p>
      <p class="chute">Un business à 10k/mois <span class="blue">bien juridictionné</span><br>bat un gros CA mal structuré.</p>`
  },

  /* ================= 07 · LA SYNTHÈSE ================= */
  {
    main: `
      ${badge('LA SYNTHÈSE')}
      <h1 class="title">4 principes.<br><span class="blue">2 000 ans</span>.</h1>
      <div class="zone">
        <div class="arches">
          <div class="arch-row">${arch(20, 24, 2)}Structures qui survivent aux personnes</div>
          <div class="rule-dbl"></div>
          <div class="arch-row">${arch(20, 24, 2)}Patrimoines séparés</div>
          <div class="rule-dbl"></div>
          <div class="arch-row">${arch(20, 24, 2)}Diversification entre juridictions</div>
          <div class="rule-dbl"></div>
          <div class="arch-row">${arch(20, 24, 2)}Statut choisi, jamais subi</div>
          <div class="rule-dbl"></div>
        </div>
      </div>
      <p class="chute">Toujours valables.<br>Applicables à <span class="blue">TON échelle</span>.</p>`
  },

  /* ================= 08 · POUR TOI ================= */
  {
    main: `
      ${badge('POUR TOI')}
      <h1 class="title">La version<br><span class="blue">entrepreneur</span>.</h1>
      <div class="zone">
        <div class="ticks">
          <div class="tick">Une structure d'exploitation pour ton activité</div>
          <div class="tick">Une holding pour capitaliser à l'abri</div>
          <div class="tick">Une résidence fiscale choisie intelligemment</div>
          <div class="tick">Des actifs répartis, pas empilés</div>
        </div>
      </div>
      <p class="chute">Pas besoin d'être milliardaire.<br>Juste du <span class="blue">mode d'emploi</span>.</p>`
  },

  /* ================= 09 · CTA — LE CODEX ================= */
  {
    main: `
      ${badge('GRATUIT')}
      <h1 class="title title--codex">LE <span class="blue">CODEX</span>.</h1>
      <div class="zone">
        <div class="codex-scene" style="height:470px">
          ${dome({ h: 470, px: 2.5, op: 0.20, style: 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)' })}
          <div class="codex-holder" style="width:340px">
            <div class="codex" style="width:340px;height:470px">
              <div class="codex-spine"></div>
              <div class="codex-rule"></div>
              <div class="codex-title">LE CODEX</div>
            </div>
          </div>
        </div>
        <div class="serif-cap serif-cap--sm" style="margin-top:34px;text-align:center;text-indent:0">
          STRUCTURES · JURIDICTIONS · PÉRENNITÉ
        </div>
        <div class="cta-pill" style="margin-top:38px">Commente CODEX</div>
        <p class="body muted" style="margin-top:26px;text-align:center;font-size:30px">Je te l'envoie en DM.</p>
      </div>`
  }

]};
