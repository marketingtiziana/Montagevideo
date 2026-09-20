/**
 * gen-slides.js
 * Genere slides/slide-01.html ... slide-16.html a partir de content/slides.js.
 * Chaque fichier produit est autonome : HTML + CSS pur, une seule balise <style>,
 * police Inter chargee depuis Google Fonts. Aucun framework.
 */
const fs = require('fs');
const path = require('path');
const { slides, PROVISOIRE } = require('./content/slides.js');
const schemas = require('./schemas.js');

const OUT = path.join(__dirname, 'slides');
const TOTAL = 16;

/* ================================================================== */
/* REGLAGES                                                            */
/* ================================================================== */

/** 'clair' (fond clair, texte navy) ou 'sombre' (fond navy, texte blanc). */
const THEME = 'clair';

/**
 * Style de la slide 1 (couverture).
 *   'immersif' photo plein cadre, voile navy degrade, titre blanc, indicateur
 *              de swipe. Le plus percutant en vignette de fil.
 *   'bandeau'  panneau navy arrondi en haut, photo en bandeau bas. Editorial.
 *   'echo'     fond navy, halo indigo venant du haut, photo en carte basse.
 *              Repond a la slide 16, dont le halo vient du bas.
 *   'carte'    fond clair, titre navy, photo en carte basse. Le plus sobre.
 * Surchargeable a la volee : COVER_STYLE=bandeau node gen-slides.js
 */
const COVER_STYLE = process.env.COVER_STYLE || 'echo';

/**
 * Style de la slide 16 (appel a l'action).
 *   'halo'   fond navy profond, halo indigo, fleche ronde. Rupture forte avec
 *            les 15 slides claires qui precedent.
 *   'massif' fond indigo plein, typo navy massive, chevrons de progression.
 *   'bloc'   fond clair, grand bloc indigo arrondi. Le plus proche du reste.
 * Surchargeable a la volee : CTA_STYLE=massif node gen-slides.js
 */
const CTA_STYLE = process.env.CTA_STYLE || 'halo';

/**
 * Numeros des slides portant le logo Fynovates.
 * []        aucune slide (reglage actuel)
 * [1]       uniquement la couverture
 * [1, 15]   couverture et derniere slide de contenu
 */
const LOGO_SLIDES = [];

/* ================================================================== */
/* Brand system                                                        */
/* ================================================================== */
const BRAND = {
  navy:   '#0F1535',
  indigo: '#4F6BFF',
  white:  '#FFFFFF',
  grey:   '#A8B0C8'
};

const THEMES = {
  clair: {
    page:      '#F4F6FC',   // fond de slide
    ink:       BRAND.navy,  // titres et mots mis en avant
    body:      '#545E80',   // corps courant
    accent:    BRAND.indigo,
    logoInk:   BRAND.navy,
    logoAlpha: 0.45,
    coverMode: 'card'       // couverture : image en carte basse sur fond clair
  },
  sombre: {
    page:      BRAND.navy,
    ink:       BRAND.white,
    body:      BRAND.grey,
    accent:    BRAND.indigo,
    logoInk:   BRAND.white,
    logoAlpha: 0.6,
    coverMode: 'overlay'    // couverture : image plein cadre + overlay navy 75%
  }
};

const T = THEMES[THEME];
if (!T) throw new Error(`[REGLAGE] THEME inconnu : "${THEME}" (attendu : clair ou sombre)`);

/* ================================================================== */
/* Garde-fous brand                                                    */
/* ================================================================== */
const FORBIDDEN = [
  [/—/, 'tiret cadratin interdit'],
  [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'emoji interdit']
];
function lint(txt, where) {
  for (const [re, msg] of FORBIDDEN) {
    if (re.test(txt)) throw new Error(`[BRAND] ${where} : ${msg} -> ${txt}`);
  }
}

/* ================================================================== */
/* Markup inline : **Black 900**  /  *600*                             */
/* ================================================================== */
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s, where) {
  lint(s, where);
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')   // chiffres cles
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');    // noms propres / termes techniques
}

/* ================================================================== */
/* Fragments                                                           */
/* ================================================================== */
/* Inter est chargee depuis Google Fonts (lien CDN), doublee d'une copie locale
   des memes fichiers woff2 pour que l'export Playwright soit deterministe meme
   sans reseau. Sans cette copie, Chromium retombe sur Arial. */
const FONTS = `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;900&display=swap" rel="stylesheet">`;

const FONTFACE = `    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 100 900;
      font-display: block;
      src: url('../assets/fonts/Inter-latin.woff2') format('woff2');
      unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
        U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193,
        U+2212, U+2215, U+FEFF, U+FFFD;
    }
    @font-face {
      font-family: 'Inter';
      font-style: normal;
      font-weight: 100 900;
      font-display: block;
      src: url('../assets/fonts/Inter-latin-ext.woff2') format('woff2');
      unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF,
        U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020,
        U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
    }`;

function logo(n) {
  return LOGO_SLIDES.includes(n)
    ? `  <div class="logo" aria-label="Fynovates">FYNOVATES</div>\n`
    : '';
}

function sources(s) {
  if (!s.sources || !s.sources.length) return '';
  return `\n    <div class="sources">Sources : ${s.sources.map(x => esc(x)).join(', ')}</div>`;
}

function num(n) {
  return `    <div class="num">${String(n).padStart(2, '0')} / ${TOTAL}</div>`;
}

function bodyHtml(body, n) {
  return body.map(block => {
    if (block.p) return `      <p>${inline(block.p, `slide ${n} / p`)}</p>`;
    if (block.ul) {
      const li = block.ul
        .map(i => `        <li>${inline(i, `slide ${n} / li`)}</li>`)
        .join('\n');
      return `      <ul>\n${li}\n      </ul>`;
    }
    if (block.ol) {
      const li = block.ol
        .map(i => `        <li>${inline(i, `slide ${n} / ol`)}</li>`)
        .join('\n');
      return `      <ol class="num-list">\n${li}\n      </ol>`;
    }
    if (block.schema) return schemas.render(block.schema, n, inline);
    throw new Error(`[CONTENU] slide ${n} : bloc inconnu ${JSON.stringify(block)}`);
  }).join('\n');
}

/** true si la slide porte au moins un bloc schema. */
function hasSchema(s) {
  return Array.isArray(s.body) && s.body.some(b => b.schema);
}

/* ================================================================== */
/* CSS commun                                                          */
/* ================================================================== */
const RESET = `${FONTFACE}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 1080px; height: 1350px;
      overflow: hidden;
      background: ${T.page};
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
      font-variant-ligatures: none;
    }
    .slide {
      position: relative;
      width: 1080px; height: 1350px;
      overflow: hidden;
      background: ${T.page};
    }
    b  { font-weight: 900; color: ${T.ink}; }
    em { font-weight: 600; color: ${T.ink}; font-style: normal; }
    .logo {
      position: absolute; right: 90px; bottom: 56px;
      height: 40px; display: flex; align-items: center;
      font-weight: 900; font-size: 19px; letter-spacing: 0.20em;
      color: ${T.logoInk}; opacity: ${T.logoAlpha};
      z-index: 5;
    }`;

const TEXTCOMMON = (bodySize) => `    .frame {
      position: relative; z-index: 2;
      width: 100%; height: 100%;
      padding: 90px;
      display: flex; flex-direction: column;
    }
    .num {
      font-weight: 900; font-size: 22px; letter-spacing: 0.14em;
      color: ${T.accent};
      flex: none;
    }
    .title {
      margin-top: 44px;
      font-weight: 900; font-size: 56px; line-height: 1.08;
      letter-spacing: -0.015em;
      color: ${T.ink};
      flex: none;
    }
    .body {
      margin-top: 44px;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      font-weight: 400; font-size: ${bodySize}px; line-height: 1.5;
      letter-spacing: -0.005em;
      color: ${T.body};
    }
    .body > * + * { margin-top: 1em; }
    .body ul { list-style: none; }
    .body li { position: relative; padding-left: 1.05em; }
    .body li + li { margin-top: 0.62em; }
    .body li::before {
      content: '';
      position: absolute; left: 0; top: 0.62em;
      width: 8px; height: 8px;
      background: ${T.accent};
    }
    /* liste numerotee : le numero en indigo, texte alignes en retrait pendu */
    .body ol.num-list { list-style: none; counter-reset: nl; }
    .body ol.num-list li { padding-left: 1.55em; }
    .body ol.num-list li::before {
      counter-increment: nl;
      content: counter(nl);
      position: absolute; left: 0; top: 0;
      width: auto; height: auto;
      background: none;
      font-weight: 900; font-size: 0.86em;
      color: ${T.accent};
      font-variant-numeric: tabular-nums;
    }
    /* ligne de sources : hors du bloc auto-ajuste, taille fixe */
    .sources {
      flex: none;
      padding-top: 26px;
      font-weight: 400; font-size: 18px; line-height: 1.4;
      color: #8A93AE;
    }`;

function doc(s, style, markup) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Fynovates | Slide ${String(s.n).padStart(2, '0')}</title>
${FONTS}
  <style>
${RESET}
${style}
  </style>
</head>
<body>
${markup}
</body>
</html>
`;
}

/* ================================================================== */
/* Gabarit A : couverture                                              */
/* ================================================================== */
function tplA(s) {
  const title = inline(s.title, `slide ${s.n} / title`);
  const subtitle = inline(s.subtitle, `slide ${s.n} / subtitle`);

  /* Typo commune aux quatre couvertures. `ink` et `dim` changent selon que la
     variante pose le texte sur clair ou sur sombre. */
  const TYPO = (ink, dim, base) => `    .rule { width: 80px; height: 4px; background: ${BRAND.indigo}; flex: none; }
    .title {
      margin-top: 40px;
      font-weight: 900; font-size: ${base}px; line-height: 1.04;
      letter-spacing: -0.03em;
      color: ${ink};
    }
    .subtitle {
      margin-top: 32px;
      font-weight: 400; font-size: 34px; line-height: 1.4;
      color: ${dim};
    }`;

  /* Indicateur de swipe : chevrons dessines en CSS, aucun emoji. */
  const SWIPE = (ink) => `    .swipe {
      position: absolute; left: 90px; bottom: 76px;
      display: flex; align-items: center; gap: 16px;
      z-index: 3;
    }
    .swipe b {
      font-weight: 900; font-size: 20px; letter-spacing: 0.16em;
      color: ${ink}; opacity: 0.66;
    }
    .swipe i {
      width: 13px; height: 13px;
      border-top: 3px solid ${BRAND.indigo};
      border-right: 3px solid ${BRAND.indigo};
      transform: rotate(45deg);
    }
    .swipe i:nth-of-type(1) { opacity: 0.35; }
    .swipe i:nth-of-type(2) { opacity: 0.65; }
    .swipe i:nth-of-type(3) { opacity: 1; }`;

  const SWIPE_MARKUP = `  <div class="swipe"><b>16 SLIDES</b><i></i><i></i><i></i></div>`;

  if (COVER_STYLE === 'bandeau') {
    const style = `${TYPO(BRAND.white, BRAND.grey, 80)}
    .panel {
      position: absolute; top: 44px; left: 44px; right: 44px;
      height: 856px;
      border-radius: 24px;
      background: ${BRAND.navy};
      z-index: 1;
    }
    .frame {
      position: absolute; top: 44px; left: 44px; right: 44px;
      height: 856px;
      z-index: 2;
      padding: 90px 80px 96px;
      display: flex; flex-direction: column;
      align-items: flex-start; justify-content: center;
    }
    .photo {
      position: absolute; left: 44px; right: 44px; top: 924px; bottom: 44px;
      border-radius: 24px;
      overflow: hidden;
      z-index: 1;
    }
    .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .swipe { left: 124px; bottom: 112px; }`;

    const markup = `<div class="slide" data-tpl="A" data-n="${s.n}">
  <div class="panel"></div>
  <div class="frame">
    <div class="rule"></div>
    <h1 class="title" data-base="80" data-min="48">${title}</h1>
    <p class="subtitle">${subtitle}</p>
  </div>
  <div class="photo"><img src="../assets/img/${s.img}" alt=""></div>
${SWIPE_MARKUP}
${logo(s.n)}</div>`;
    return doc(s, style + '\n' + SWIPE(BRAND.white), markup);
  }

  if (COVER_STYLE === 'echo') {
    const style = `${TYPO(BRAND.white, BRAND.grey, 84)}
    /* Le halo vient du haut. Celui de la slide 16 vient du bas : le carousel
       s'ouvre et se ferme sur la meme signature, inversee. */
    html, body, .slide {
      background:
        radial-gradient(ellipse 1180px 780px at 50% -6%, ${BRAND.indigo} 0%, rgba(79, 107, 255, 0.5) 32%, rgba(79, 107, 255, 0) 68%),
        ${BRAND.navy};
    }
    .frame {
      position: relative; z-index: 2;
      width: 100%; height: 100%;
      padding: 120px 90px 700px;
      display: flex; flex-direction: column;
      align-items: flex-start; justify-content: flex-start;
    }
    .cover-card {
      position: absolute; left: 44px; right: 44px; bottom: 44px;
      height: 580px;
      border-radius: 24px;
      overflow: hidden;
      z-index: 1;
    }
    .cover-card img { width: 100%; height: 100%; object-fit: cover; display: block; }`;

    const markup = `<div class="slide" data-tpl="A" data-n="${s.n}">
  <div class="frame">
    <div class="rule"></div>
    <h1 class="title" data-base="84" data-min="48">${title}</h1>
    <p class="subtitle">${subtitle}</p>
  </div>
  <div class="cover-card"><img src="../assets/img/${s.img}" alt=""></div>
${logo(s.n)}</div>`;
    return doc(s, style, markup);
  }

  if (COVER_STYLE === 'carte') {
    const style = `${TYPO(T.ink, T.body, 88)}
    .frame {
      position: relative; z-index: 2;
      width: 100%; height: 100%;
      padding: 110px 90px 692px;
      display: flex; flex-direction: column;
      align-items: flex-start; justify-content: flex-start;
    }
    .cover-card {
      position: absolute; left: 44px; right: 44px; bottom: 44px;
      height: 600px;
      border-radius: 24px;
      overflow: hidden;
      z-index: 1;
    }
    .cover-card img { width: 100%; height: 100%; object-fit: cover; display: block; }`;

    const markup = `<div class="slide" data-tpl="A" data-n="${s.n}">
  <div class="frame">
    <div class="rule"></div>
    <h1 class="title" data-base="88" data-min="52">${title}</h1>
    <p class="subtitle">${subtitle}</p>
  </div>
  <div class="cover-card"><img src="../assets/img/${s.img}" alt=""></div>
${logo(s.n)}</div>`;
    return doc(s, style, markup);
  }

  /* 'immersif' par defaut */
  const style = `${TYPO(BRAND.white, '#C3CBE2', 88)}
${SWIPE(BRAND.white)}
    .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
    /* Voile degrade : dense la ou se pose le texte, il s'ouvre au tiers bas
       pour laisser respirer la photo, puis se redensifie sous l'indicateur. */
    .veil {
      position: absolute; inset: 0; z-index: 1;
      background: linear-gradient(
        180deg,
        rgba(15, 21, 53, 0.93) 0%,
        rgba(15, 21, 53, 0.86) 40%,
        rgba(15, 21, 53, 0.30) 68%,
        rgba(15, 21, 53, 0.22) 84%,
        rgba(15, 21, 53, 0.66) 100%);
    }
    .frame {
      position: relative; z-index: 2;
      width: 100%; height: 100%;
      padding: 120px 90px 420px;
      display: flex; flex-direction: column;
      align-items: flex-start; justify-content: flex-start;
    }`;

  const markup = `<div class="slide" data-tpl="A" data-n="${s.n}">
  <img class="bg" src="../assets/img/${s.img}" alt="">
  <div class="veil"></div>
  <div class="frame">
    <div class="rule"></div>
    <h1 class="title" data-base="88" data-min="52">${title}</h1>
    <p class="subtitle">${subtitle}</p>
  </div>
${SWIPE_MARKUP}
${logo(s.n)}</div>`;
  return doc(s, style, markup);
}

/* ================================================================== */
/* Gabarit B : texte seul sur fond plein                               */
/* ================================================================== */
function tplB(s) {
  // Le CSS des schemas n'est injecte que dans les slides qui en portent un.
  const style = TEXTCOMMON(32) + (hasSchema(s) ? '\n' + schemas.css(T.ink, T.body) : '');
  const markup = `<div class="slide" data-tpl="B" data-n="${s.n}">
  <div class="frame">
${num(s.n)}
    <h1 class="title">${inline(s.title, `slide ${s.n} / title`)}</h1>
    <div class="body" data-base="32" data-min="26">
${bodyHtml(s.body, s.n)}
    </div>${sources(s)}
  </div>
${logo(s.n)}</div>`;
  return doc(s, style, markup);
}

/* ================================================================== */
/* Gabarit C : bandeau illustration 520px + texte                      */
/* ================================================================== */
function tplC(s) {
  // Le CSS des schemas doit etre injecte ici aussi : une slide a bandeau peut
  // porter un schema (slide 3), sans quoi il s'affiche sans aucune mise en forme.
  const style = `${TEXTCOMMON(28)}${hasSchema(s) ? '\n' + schemas.css(T.ink, T.body) : ''}
    /* --banner est la hauteur du bandeau. build.js peut la reduire quand le
       texte de la slide ne tient pas, plutot que de rogner le texte. */
    .banner {
      position: absolute; top: 44px; left: 44px; right: 44px;
      height: var(--banner, 520px);
      border-radius: 24px;
      overflow: hidden;
      z-index: 1;
    }
    .banner img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .banner::after {
      content: '';
      position: absolute; inset: 0;
      background: rgba(15, 21, 53, 0.20);
    }
    .frame { padding-top: calc(var(--banner, 520px) + 88px); }
    .title { font-size: 52px; margin-top: 36px; }
    .body  { margin-top: 36px; }`;

  const markup = `<div class="slide" data-tpl="C" data-n="${s.n}" style="--banner: 520px">
  <div class="banner"><img src="../assets/img/${s.img}" alt=""></div>
  <div class="frame">
${num(s.n)}
    <h1 class="title">${inline(s.title, `slide ${s.n} / title`)}</h1>
    <div class="body" data-base="28" data-min="26">
${bodyHtml(s.body, s.n)}
    </div>${sources(s)}
  </div>
${logo(s.n)}</div>`;
  return doc(s, style, markup);
}

/* ================================================================== */
/* Gabarit CTA : slide 16                                              */
/* ================================================================== */
function tplCTA(s) {
  const text = inline(s.title, `slide ${s.n} / cta`);

  /* Fleche : dessinee en CSS, aucun emoji, aucune dependance. */
  const ARROW = (bg, ink) => `    .arrow {
      position: relative;
      width: 96px; height: 96px;
      border-radius: 50%;
      background: ${bg};
      flex: none;
    }
    .arrow::before {
      content: '';
      position: absolute; left: 33px; top: 47px;
      width: 31px; height: 2px; background: ${ink};
    }
    .arrow::after {
      content: '';
      position: absolute; left: 51px; top: 40px;
      width: 15px; height: 15px;
      border-top: 2px solid ${ink};
      border-right: 2px solid ${ink};
      transform: rotate(45deg);
    }`;

  if (CTA_STYLE === 'massif') {
    const style = `    html, body, .slide { background: ${BRAND.indigo}; }
    .frame {
      width: 100%; height: 100%;
      padding: 64px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .rule { width: 80px; height: 4px; background: ${BRAND.navy}; opacity: 0.55; }
    .cta {
      margin-top: 48px;
      font-weight: 900; font-size: 78px; line-height: 1.04;
      letter-spacing: -0.04em;
      text-align: center;
      color: ${BRAND.navy};
    }
    /* chevrons de progression, du plus marque au plus efface */
    .chev { margin-top: 68px; display: flex; gap: 22px; }
    .chev i {
      width: 34px; height: 34px;
      border-top: 6px solid ${BRAND.navy};
      border-right: 6px solid ${BRAND.navy};
      transform: rotate(45deg);
    }
    .chev i:nth-child(1) { opacity: 0.22; }
    .chev i:nth-child(2) { opacity: 0.48; }
    .chev i:nth-child(3) { opacity: 0.88; }`;

    const markup = `<div class="slide" data-tpl="CTA" data-n="${s.n}">
  <div class="frame">
    <div class="rule"></div>
    <div class="cta" data-base="78" data-min="56">${text}</div>
    <div class="chev"><i></i><i></i><i></i></div>
  </div>
</div>`;
    return doc(s, style, markup);
  }

  if (CTA_STYLE === 'bloc') {
    const style = `${ARROW('#FFFFFF', BRAND.indigo)}
    html, body, .slide { background: ${T.page}; }
    .frame {
      width: 100%; height: 100%;
      padding: 44px;
      display: flex;
    }
    .card {
      flex: 1 1 auto;
      border-radius: 24px;
      background: ${BRAND.indigo};
      padding: 64px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .cta {
      font-weight: 900; font-size: 72px; line-height: 1.04;
      letter-spacing: -0.035em;
      text-align: center;
      color: #FFFFFF;
    }
    .arrow { margin-top: 56px; }`;

    const markup = `<div class="slide" data-tpl="CTA" data-n="${s.n}">
  <div class="frame">
    <div class="card">
      <div class="cta" data-base="72" data-min="52">${text}</div>
      <div class="arrow"></div>
    </div>
  </div>
</div>`;
    return doc(s, style, markup);
  }

  /* 'halo' par defaut */
  const style = `${ARROW(BRAND.indigo, '#FFFFFF')}
    /* halo froid : un degrade radial indigo sur fond navy. Aucune couleur
       chaude, le brand system n'interdit que les degrades orange et rouge. */
    html, body, .slide {
      background:
        radial-gradient(ellipse 1180px 820px at 50% 104%, ${BRAND.indigo} 0%, rgba(79, 107, 255, 0.55) 34%, rgba(79, 107, 255, 0) 70%),
        ${BRAND.navy};
    }
    /* 64px et non 90px : a 78px de corps, l'accroche demande 905px et la
       marge de 90px n'en laisse que 900. Elle cassait en deux lignes. */
    .frame {
      width: 100%; height: 100%;
      padding: 64px;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
    }
    .rule { width: 80px; height: 4px; background: ${BRAND.indigo}; }
    .cta {
      margin-top: 48px;
      font-weight: 900; font-size: 78px; line-height: 1.04;
      letter-spacing: -0.035em;
      text-align: center;
      color: ${BRAND.white};
    }
    .arrow { margin-top: 60px; }`;

  const markup = `<div class="slide" data-tpl="CTA" data-n="${s.n}">
  <div class="frame">
    <div class="rule"></div>
    <div class="cta" data-base="78" data-min="52">${text}</div>
    <div class="arrow"></div>
  </div>
</div>`;
  return doc(s, style, markup);
}

/* ================================================================== */
const RENDER = { A: tplA, B: tplB, C: tplC, CTA: tplCTA };

fs.mkdirSync(OUT, { recursive: true });
if (slides.length !== TOTAL) throw new Error(`[CONTENU] ${slides.length} slides au lieu de ${TOTAL}`);

for (const s of slides) {
  const fn = RENDER[s.tpl];
  if (!fn) throw new Error(`[CONTENU] slide ${s.n} : gabarit inconnu "${s.tpl}"`);
  if (s.img && !fs.existsSync(path.join(__dirname, 'assets', 'img', s.img))) {
    throw new Error(`[ASSET] slide ${s.n} : image manquante assets/img/${s.img}`);
  }
  const file = path.join(OUT, `slide-${String(s.n).padStart(2, '0')}.html`);
  fs.writeFileSync(file, fn(s), 'utf8');
}

console.log(`OK  ${slides.length} slides ecrites dans slides/  (theme : ${THEME}, couverture : ${COVER_STYLE}, CTA : ${CTA_STYLE})`);
console.log(LOGO_SLIDES.length
  ? `OK  logo sur les slides ${LOGO_SLIDES.join(', ')}`
  : 'OK  aucun logo sur les slides');
if (PROVISOIRE) {
  console.log('!!  content/slides.js est encore en TEXTES PROVISOIRES (PROVISOIRE = true)');
}
