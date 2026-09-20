/**
 * schemas.js
 * Schemas de donnees pour les slides sans illustration (gabarit B).
 * HTML + CSS purs, aucune librairie, aucun JS a l'execution.
 *
 * PALETTE (validee avec le validateur dataviz, surface #F4F6FC)
 *   rampe ordinale indigo : #93A6FF -> #4F6BFF -> #2F46C9
 *     monotone, ecarts de clarte suffisants, bout clair a 2,13:1, teinte unique
 *   paire deux nuances    : #93A6FF + #4F6BFF
 *     dans la bande de clarte, au-dessus du plancher de chroma, ecart CVD 16,4
 *   #4F6BFF + #2F46C9 ne doivent JAMAIS coder deux series distinctes :
 *     ecart en vision normale de 12,8, sous le plancher de 15.
 *
 * REGLES APPLIQUEES
 *   - le rendu final est un PNG : aucune infobulle possible, donc chaque valeur
 *     porte une etiquette directe, ce qui leve l'obligation de contraste du
 *     bout clair de la rampe
 *   - le texte ne porte jamais la couleur de donnee : etiquettes et valeurs en
 *     encre navy ou gris secondaire, l'identite vient de la marque coloree
 *   - barres de 20px d'epaisseur maximum, bout arrondi 4px, pied carre
 *   - une seule serie : pas de boite de legende, le titre de slide la nomme
 *   - chiffres proportionnels pour les grandes valeurs isolees, chiffres
 *     tabulaires uniquement dans les colonnes alignees
 */

const VIZ = {
  light:  '#93A6FF',   // rampe, pas clair
  accent: '#4F6BFF',   // rampe, pas moyen
  deep:   '#2F46C9',   // rampe, pas fonce
  dim:    '#C3CAE0',   // mise en retrait (forme emphase, hors rampe categorielle)
  track:  '#DDE3F5',   // fond de jauge
  rule:   '#E2E6F2'    // filets et axes, un cran au-dessus de la surface
};

/** Part de la piste occupee par la barre la plus longue. Le reste est la
    reserve d'etiquette, pour que la valeur tienne au bout de chaque barre. */
const BAR_MAX = 78;

/** Types de schema acceptes dans un bloc { schema: { type: ... } }. */
const TYPES = ['kpi', 'bars', 'meter', 'steps', 'timeline', 'compare', 'flow', 'columns', 'versus',
  'threshold', 'pairs'];

/* ------------------------------------------------------------------ */
/* CSS, injecte uniquement dans les slides qui portent un schema       */
/* ------------------------------------------------------------------ */
function css(ink, body) {
  return `    /* --- schemas ------------------------------------------------ */
    .sch { margin-top: 1.25em; }

    /* Un libelle pose sur un aplat indigo prend le blanc, jamais l'encre.
       C'est la seule exception a la regle "le texte ne porte pas la couleur
       de donnee" : sur l'aplat, l'encre navy ne passe pas le contraste. */
    .sch-pairs .pr-b b, .sch-pairs .pr-b em,
    .sch-flow .fl.end b, .sch-flow .fl.end em,
    .sch-threshold .th-zone.hi b, .sch-threshold .th-zone.hi em,
    .sch-versus .vs.yes .vs-m b { color: #FFFFFF; }

    /* KPI : une valeur seule devient un chiffre heros, deux ou trois
       deviennent une rangee de tuiles */
    .sch-kpi { display: flex; gap: 56px; }
    .sch-kpi .kpi { flex: 1 1 0; }
    .sch-kpi .kpi-key { width: 40px; height: 4px; background: ${VIZ.accent}; }
    .sch-kpi .kpi-v {
      margin-top: 18px;
      font-weight: 900; line-height: 1;
      letter-spacing: -0.035em;
      color: ${ink};
    }
    .sch-kpi .kpi-l {
      margin-top: 14px;
      font-weight: 400; line-height: 1.35;
      color: ${body};
    }
    .sch-kpi[data-count="1"] .kpi-v { font-size: 118px; }
    .sch-kpi[data-count="1"] .kpi-v[data-long] { font-size: 72px; }
    .sch-kpi[data-count="1"] .kpi-l { font-size: 28px; }
    .sch-kpi[data-count="2"] .kpi-v { font-size: 86px; }
    .sch-kpi[data-count="2"] .kpi-l { font-size: 24px; }
    .sch-kpi[data-count="3"] { gap: 40px; }
    .sch-kpi[data-count="3"] .kpi-v { font-size: 64px; }
    .sch-kpi[data-count="3"] .kpi-l { font-size: 21px; }

    /* Barres horizontales : magnitude, serie unique */
    .sch-bars .row + .row { margin-top: 30px; }
    .sch-bars .row-l {
      font-weight: 600; font-size: 24px; line-height: 1.3;
      color: ${ink};
    }
    /* La valeur suit immediatement le bout de la barre. La barre la plus longue
       est plafonnee a BAR_MAX% de la piste, ce qui garantit la place de
       l'etiquette sans jamais la detacher de sa marque ni la rogner. */
    .sch-bars .row-b {
      margin-top: 12px;
      display: flex; align-items: center;
    }
    .sch-bars .bar {
      height: 20px;
      border-radius: 0 4px 4px 0;
      background: ${VIZ.accent};
      flex: none;
    }
    .sch-bars .bar.dim { background: ${VIZ.dim}; }
    .sch-bars .row-v {
      margin-left: 18px;
      font-weight: 900; font-size: 26px;
      color: ${ink};
      white-space: nowrap;
    }
    .sch-bars .row.is-dim .row-l,
    .sch-bars .row.is-dim .row-v { color: ${body}; }

    /* Jauge : un rapport face a un seuil */
    .sch-meter .m-head {
      display: flex; align-items: baseline; justify-content: space-between;
      gap: 24px;
    }
    .sch-meter .m-cap { font-weight: 600; font-size: 24px; color: ${ink}; }
    .sch-meter .m-val { font-weight: 900; font-size: 44px; color: ${ink}; letter-spacing: -0.02em; }
    .sch-meter .m-track {
      position: relative;
      margin-top: 16px;
      height: 20px;
      border-radius: 4px;
      background: ${VIZ.track};
      overflow: hidden;
    }
    .sch-meter .m-fill {
      height: 100%;
      border-radius: 0 4px 4px 0;
      background: ${VIZ.accent};
    }
    .sch-meter .m-tick {
      position: absolute; top: -6px; bottom: -6px;
      width: 2px; background: ${ink};
    }
    .sch-meter .m-foot {
      margin-top: 14px;
      display: flex; justify-content: space-between; gap: 24px;
      font-weight: 400; font-size: 21px; color: ${body};
    }

    /* Etapes : un enchainement */
    .sch-steps { list-style: none; }
    .sch-steps li {
      position: relative;
      padding-left: 74px;
      padding-bottom: 30px;
    }
    .sch-steps li:last-child { padding-bottom: 0; }
    .sch-steps li::before {
      content: '';
      position: absolute; left: 23px; top: 48px; bottom: 0;
      width: 2px; background: ${VIZ.rule};
    }
    .sch-steps li:last-child::before { display: none; }
    .sch-steps .s-n {
      position: absolute; left: 0; top: 0;
      width: 48px; height: 48px;
      border-radius: 50%;
      background: ${VIZ.accent};
      color: #FFFFFF;
      font-weight: 900; font-size: 22px;
      display: flex; align-items: center; justify-content: center;
    }
    .sch-steps .s-t {
      display: block;
      padding-top: 8px;
      font-weight: 400; font-size: 26px; line-height: 1.4;
      color: ${body};
    }
    .sch-steps .s-t b { font-weight: 900; color: ${ink}; }

    /* Frise : des jalons dates */
    .sch-timeline { position: relative; padding-top: 4px; }
    /* l'axe court du premier au dernier jalon, jamais au-dela :
       les jalons sont ancres a gauche de cellules de largeur 100/n */
    .sch-timeline .t-axis {
      position: absolute; left: 7px; top: 63px;
      width: calc((100% - 14px) * var(--span) / var(--n));
      height: 1px; background: ${VIZ.rule};
    }
    .sch-timeline .t-row { position: relative; display: flex; }
    .sch-timeline .t-item { flex: 1 1 0; padding-right: 28px; }
    .sch-timeline .t-d {
      font-weight: 900; font-size: 26px; line-height: 1.2;
      color: ${ink}; letter-spacing: -0.015em;
      min-height: 62px;
    }
    .sch-timeline .t-dot {
      position: relative; z-index: 2;
      width: 14px; height: 14px; border-radius: 50%;
      background: ${VIZ.dim};
      box-shadow: 0 0 0 4px #F4F6FC;
    }
    .sch-timeline .t-item.on .t-dot { background: ${VIZ.accent}; }
    .sch-timeline .t-l {
      margin-top: 20px;
      font-weight: 400; font-size: 21px; line-height: 1.4;
      color: ${body};
    }

    /* Enchainement horizontal : une chaine de causes, le dernier maillon
       porte l'aboutissement */
    .sch-flow {
      display: flex; flex-wrap: wrap; align-items: center;
      gap: 12px 10px;
    }
    .sch-flow .fl {
      padding: 11px 18px;
      border-radius: 10px;
      background: #FFFFFF;
      border: 1px solid ${VIZ.rule};
      font-weight: 600; font-size: 24px; line-height: 1.25;
      color: ${ink};
    }
    .sch-flow .fl.end {
      background: ${VIZ.accent};
      border-color: ${VIZ.accent};
      color: #FFFFFF;
    }
    .sch-flow .fa {
      width: 0; height: 0;
      border-left: 9px solid ${VIZ.accent};
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      flex: none;
    }

    /* Deux colonnes de listes : ce qui tient contre ce qui tombe */
    .sch-columns { display: flex; gap: 28px; }
    .sch-columns .col {
      flex: 1 1 0;
      padding: 26px 26px 28px;
      border-radius: 16px;
      background: #FFFFFF;
      border: 1px solid ${VIZ.rule};
    }
    .sch-columns .col-key { width: 32px; height: 4px; background: ${VIZ.light}; }
    .sch-columns .col.on .col-key { background: ${VIZ.accent}; }
    .sch-columns .col-t {
      margin-top: 16px;
      font-weight: 900; font-size: 26px; color: ${ink};
      letter-spacing: -0.01em;
    }
    .sch-columns ul { margin-top: 18px; list-style: none; }
    .sch-columns li {
      position: relative; padding-left: 20px;
      font-weight: 400; font-size: 23px; line-height: 1.4;
      color: ${body};
    }
    .sch-columns li + li { margin-top: 12px; }
    .sch-columns li::before {
      content: '';
      position: absolute; left: 0; top: 0.56em;
      width: 7px; height: 7px; background: ${VIZ.light};
    }
    .sch-columns .col.on li::before { background: ${VIZ.accent}; }

    /* Avant contre apres : remplace les marqueurs croix et coche par un
       traitement typographique, le brand system interdit les emoji */
    .sch-versus .vs {
      position: relative;
      padding: 22px 26px 22px 74px;
      border-radius: 16px;
      background: #FFFFFF;
      border: 1px solid ${VIZ.rule};
      font-weight: 600; font-size: 24px; line-height: 1.4;
    }
    .sch-versus .vs + .vs { margin-top: 16px; }
    .sch-versus .vs.no  { color: ${body}; }
    .sch-versus .vs.yes { color: ${ink}; border-color: ${VIZ.accent}; }
    .sch-versus .vs-m {
      position: absolute; left: 26px; top: 26px;
      width: 28px; height: 28px; border-radius: 50%;
    }
    .sch-versus .vs.no .vs-m  { background: ${VIZ.dim}; }
    .sch-versus .vs.yes .vs-m { background: ${VIZ.accent}; }
    /* croix : deux barres croisees, centrees dans la pastille */
    .sch-versus .vs.no .vs-m::before,
    .sch-versus .vs.no .vs-m::after {
      content: '';
      position: absolute; left: 8px; top: 13px;
      width: 12px; height: 2px; background: #FFFFFF;
    }
    .sch-versus .vs.no .vs-m::before { transform: rotate(45deg); }
    .sch-versus .vs.no .vs-m::after  { transform: rotate(-45deg); }
    /* coche : un angle pivote */
    .sch-versus .vs.yes .vs-m::after {
      content: '';
      position: absolute; left: 10px; top: 7px;
      width: 7px; height: 12px;
      border-right: 2px solid #FFFFFF;
      border-bottom: 2px solid #FFFFFF;
      transform: rotate(45deg);
    }

    /* Seuil : une bande coupee en deux zones de taux, le point de bascule
       est chiffre sous la coupure. Le texte pose sur un aplat prend blanc ou
       encre selon la luminosite de l'aplat. */
    .sch-threshold .th-bar {
      display: flex; align-items: stretch;
      border-radius: 4px; overflow: hidden;
    }
    .sch-threshold .th-zone {
      padding: 20px 24px;
      display: flex; flex-direction: column; gap: 6px;
    }
    .sch-threshold .th-zone.lo { flex: 0 0 38%; background: ${VIZ.light}; }
    .sch-threshold .th-zone.hi { flex: 1 1 auto; background: ${VIZ.accent}; }
    .sch-threshold .th-v { font-weight: 900; font-size: 40px; line-height: 1; letter-spacing: -0.025em; }
    .sch-threshold .th-l { font-weight: 400; font-size: 21px; line-height: 1.3; }
    .sch-threshold .th-zone.lo .th-v { color: ${ink}; }
    .sch-threshold .th-zone.lo .th-l { color: ${ink}; opacity: 0.72; }
    .sch-threshold .th-zone.hi .th-v { color: #FFFFFF; }
    .sch-threshold .th-zone.hi .th-l { color: #FFFFFF; opacity: 0.82; }
    .sch-threshold .th-mark {
      position: relative;
      margin-left: 38%;
      padding-top: 14px; padding-left: 16px;
      font-weight: 900; font-size: 22px; color: ${ink};
    }
    .sch-threshold .th-mark::before {
      content: '';
      position: absolute; left: 0; top: 0; height: 14px;
      border-left: 2px solid ${ink};
    }

    /* Bascules : une serie de "ceci devient cela" */
    .sch-pairs .pr {
      display: flex; align-items: center; gap: 14px;
    }
    .sch-pairs .pr + .pr { margin-top: 14px; }
    .sch-pairs .pr-a, .sch-pairs .pr-b {
      padding: 11px 18px;
      border-radius: 10px;
      font-weight: 600; font-size: 24px; line-height: 1.25;
    }
    .sch-pairs .pr-a {
      background: #FFFFFF; border: 1px solid ${VIZ.rule};
      color: ${body};
    }
    .sch-pairs .pr-b {
      background: ${VIZ.accent};
      color: #FFFFFF;
    }
    .sch-pairs .pr-ar {
      width: 0; height: 0;
      border-left: 9px solid ${VIZ.accent};
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      flex: none;
    }

    /* Comparatif : deux colonnes, paire deux nuances */
    .sch-compare { display: flex; gap: 28px; }
    .sch-compare .cmp {
      flex: 1 1 0;
      padding: 28px 28px 30px;
      border-radius: 16px;
      background: #FFFFFF;
      border: 1px solid ${VIZ.rule};
    }
    .sch-compare .c-key { width: 32px; height: 4px; background: ${VIZ.light}; }
    .sch-compare .cmp.on .c-key { background: ${VIZ.accent}; }
    .sch-compare .c-t {
      margin-top: 16px;
      font-weight: 600; font-size: 22px; color: ${body};
    }
    .sch-compare .c-v {
      margin-top: 10px;
      font-weight: 900; font-size: 56px; line-height: 1;
      letter-spacing: -0.03em; color: ${ink};
      font-variant-numeric: tabular-nums;
    }
    .sch-compare .c-d {
      margin-top: 14px;
      font-weight: 400; font-size: 21px; line-height: 1.4; color: ${body};
    }`;
}

/* ------------------------------------------------------------------ */
/* Rendu                                                               */
/* ------------------------------------------------------------------ */
function render(sc, n, inline) {
  const where = `slide ${n} / schema ${sc.type}`;
  if (!TYPES.includes(sc.type)) {
    throw new Error(`[SCHEMA] ${where} : type inconnu. Attendu : ${TYPES.join(', ')}`);
  }
  const t = s => inline(s, where);

  switch (sc.type) {
    case 'kpi': {
      const items = need(sc.items, where, 1, 3);
      const cells = items.map(i => `      <div class="kpi">
        <div class="kpi-key"></div>
        <div class="kpi-v"${items.length === 1 && i.value.replace(/\*/g, '').length > 10 ? ' data-long' : ''}>${t(i.value)}</div>
        <div class="kpi-l">${t(i.label)}</div>
      </div>`).join('\n');
      return `    <div class="sch sch-kpi" data-count="${items.length}">\n${cells}\n    </div>`;
    }

    case 'bars': {
      const items = need(sc.items, where, 1, 5);
      const max = Math.max(...items.map(i => numOf(i.value, where)));
      const rows = items.map(i => {
        const w = Math.max(6, Math.round(numOf(i.value, where) / max * BAR_MAX));
        const dim = i.emphasis === false;
        return `      <div class="row${dim ? ' is-dim' : ''}">
        <div class="row-l">${t(i.label)}</div>
        <div class="row-b">
          <div class="bar${dim ? ' dim' : ''}" style="width: ${w}%"></div>
          <div class="row-v">${t(i.display)}</div>
        </div>
      </div>`;
      }).join('\n');
      return `    <div class="sch sch-bars">\n${rows}\n    </div>`;
    }

    case 'meter': {
      const pct = clampPct(sc.pct, where);
      const tick = sc.threshold == null
        ? ''
        : `\n        <div class="m-tick" style="left: ${clampPct(sc.threshold, where)}%"></div>`;
      return `    <div class="sch sch-meter">
      <div class="m-head">
        <span class="m-cap">${t(sc.caption)}</span>
        <span class="m-val">${t(sc.value)}</span>
      </div>
      <div class="m-track">
        <div class="m-fill" style="width: ${pct}%"></div>${tick}
      </div>
      <div class="m-foot"><span>${t(sc.min)}</span><span>${t(sc.max)}</span></div>
    </div>`;
    }

    case 'steps': {
      const items = need(sc.items, where, 2, 5);
      const li = items.map((s, k) => `      <li>
        <span class="s-n">${k + 1}</span>
        <span class="s-t">${t(s)}</span>
      </li>`).join('\n');
      return `    <ol class="sch sch-steps">\n${li}\n    </ol>`;
    }

    case 'timeline': {
      const items = need(sc.items, where, 2, 4);
      const cells = items.map(i => `        <div class="t-item${i.on ? ' on' : ''}">
          <div class="t-d">${t(i.date)}</div>
          <div class="t-dot"></div>
          <div class="t-l">${t(i.label)}</div>
        </div>`).join('\n');
      return `    <div class="sch sch-timeline" style="--n: ${items.length}; --span: ${items.length - 1}">
      <div class="t-axis"></div>
      <div class="t-row">\n${cells}\n      </div>
    </div>`;
    }

    case 'flow': {
      const items = need(sc.items, where, 2, 6);
      const parts = items.map((label, k) => {
        const chip = `<span class="fl${k === items.length - 1 ? ' end' : ''}">${t(label)}</span>`;
        return k === 0 ? chip : `<span class="fa"></span>${chip}`;
      }).join('');
      return `    <div class="sch sch-flow">${parts}</div>`;
    }

    case 'columns': {
      const items = need(sc.items, where, 2, 2);
      const onIdx = items.findIndex(c => c.on);
      const accent = onIdx === -1 ? 0 : onIdx;
      const cols = items.map((c, k) => {
        const li = need(c.items, `${where} / colonne ${k + 1}`, 1, 5)
          .map(i => `          <li>${t(i)}</li>`).join('\n');
        return `      <div class="col${k === accent ? ' on' : ''}">
        <div class="col-key"></div>
        <div class="col-t">${t(c.title)}</div>
        <ul>\n${li}\n        </ul>
      </div>`;
      }).join('\n');
      return `    <div class="sch sch-columns">\n${cols}\n    </div>`;
    }

    case 'versus': {
      const items = need(sc.items, where, 2, 2);
      const rows = items.map(v => {
        if (v.kind !== 'no' && v.kind !== 'yes') {
          throw new Error(`[SCHEMA] ${where} : kind doit valoir "no" ou "yes"`);
        }
        return `      <div class="vs ${v.kind}"><span class="vs-m"></span>${t(v.text)}</div>`;
      }).join('\n');
      return `    <div class="sch sch-versus">\n${rows}\n    </div>`;
    }

    case 'threshold': {
      return `    <div class="sch sch-threshold">
      <div class="th-bar">
        <div class="th-zone lo">
          <span class="th-v">${t(sc.low.value)}</span>
          <span class="th-l">${t(sc.low.label)}</span>
        </div>
        <div class="th-zone hi">
          <span class="th-v">${t(sc.high.value)}</span>
          <span class="th-l">${t(sc.high.label)}</span>
        </div>
      </div>
      <div class="th-mark">${t(sc.at)}</div>
    </div>`;
    }

    case 'pairs': {
      const items = need(sc.items, where, 2, 4);
      const rows = items.map(i => `      <div class="pr">
        <span class="pr-a">${t(i.from)}</span>
        <span class="pr-ar"></span>
        <span class="pr-b">${t(i.to)}</span>
      </div>`).join('\n');
      return `    <div class="sch sch-pairs">\n${rows}\n    </div>`;
    }

    case 'compare': {
      const items = need(sc.items, where, 2, 2);
      const cols = items.map((c, k) => `      <div class="cmp${k === 1 ? ' on' : ''}">
        <div class="c-key"></div>
        <div class="c-t">${t(c.title)}</div>
        <div class="c-v">${t(c.value)}</div>
        <div class="c-d">${t(c.detail)}</div>
      </div>`).join('\n');
      return `    <div class="sch sch-compare">\n${cols}\n    </div>`;
    }
  }
}

/* ------------------------------------------------------------------ */
function need(items, where, min, max) {
  if (!Array.isArray(items) || items.length < min || items.length > max) {
    throw new Error(`[SCHEMA] ${where} : items doit contenir de ${min} a ${max} entrees`);
  }
  return items;
}
function numOf(v, where) {
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) {
    throw new Error(`[SCHEMA] ${where} : value doit etre un nombre positif, recu ${JSON.stringify(v)}`);
  }
  return n;
}
function clampPct(v, where) {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > 100) {
    throw new Error(`[SCHEMA] ${where} : pourcentage attendu entre 0 et 100, recu ${JSON.stringify(v)}`);
  }
  return n;
}

module.exports = { VIZ, TYPES, css, render };
