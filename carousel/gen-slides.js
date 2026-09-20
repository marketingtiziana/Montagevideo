/**
 * gen-slides.js
 * Genere slides/slide-01.html ... slide-16.html a partir de content/slides.js.
 * Chaque fichier produit est autonome : HTML + CSS pur, une seule balise <style>,
 * police Inter chargee depuis Google Fonts. Aucun framework.
 */
const fs = require('fs');
const path = require('path');
const { slides, PROVISOIRE } = require('./content/slides.js');

const OUT = path.join(__dirname, 'slides');
const TOTAL = 16;

/* ------------------------------------------------------------------ */
/* Brand system                                                        */
/* ------------------------------------------------------------------ */
const BRAND = {
  navy:   '#0F1535',
  indigo: '#4F6BFF',
  white:  '#FFFFFF',
  grey:   '#A8B0C8'
};

/* ------------------------------------------------------------------ */
/* Garde-fous brand                                                    */
/* ------------------------------------------------------------------ */
const FORBIDDEN = [
  [/—/, 'tiret cadratin (—) interdit'],
  [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u, 'emoji interdit']
];
function lint(txt, where) {
  for (const [re, msg] of FORBIDDEN) {
    if (re.test(txt)) throw new Error(`[BRAND] ${where} : ${msg} -> ${txt}`);
  }
}

/* ------------------------------------------------------------------ */
/* Markup inline : **black900 blanc**  /  *600 blanc*                  */
/* ------------------------------------------------------------------ */
function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function inline(s, where) {
  lint(s, where);
  return esc(s)
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')   // chiffres cles
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');    // noms propres / termes techniques
}

/* ------------------------------------------------------------------ */
/* Fragments                                                           */
/* ------------------------------------------------------------------ */
/* Inter est charge depuis Google Fonts (lien CDN), double d'une copie locale des
   memes fichiers woff2 Google Fonts pour que l'export Playwright soit deterministe
   meme sans reseau. Sans cette copie, Chromium retombe sur Arial. */
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

const LOGO = `  <div class="logo" aria-label="Fynovates">FYNOVATES</div>`;

function num(n) {
  return `  <div class="num">${String(n).padStart(2, '0')} / ${TOTAL}</div>`;
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
    throw new Error(`[CONTENU] slide ${n} : bloc inconnu ${JSON.stringify(block)}`);
  }).join('\n');
}

/* ------------------------------------------------------------------ */
/* CSS commun                                                          */
/* ------------------------------------------------------------------ */
const RESET = `${FONTFACE}
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body {
      width: 1080px; height: 1350px;
      overflow: hidden;
      background: ${BRAND.navy};
      font-family: 'Inter', sans-serif;
      -webkit-font-smoothing: antialiased;
      text-rendering: geometricPrecision;
      font-variant-ligatures: none;
    }
    .slide {
      position: relative;
      width: 1080px; height: 1350px;
      overflow: hidden;
      background: ${BRAND.navy};
    }
    b  { font-weight: 900; color: ${BRAND.white}; }
    em { font-weight: 600; color: ${BRAND.white}; font-style: normal; }
    .logo {
      position: absolute; right: 90px; bottom: 56px;
      height: 40px; display: flex; align-items: center;
      font-weight: 900; font-size: 19px; letter-spacing: 0.20em;
      color: ${BRAND.white}; opacity: 0.6;
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
      color: ${BRAND.indigo};
      flex: none;
    }
    .title {
      margin-top: 44px;
      font-weight: 900; font-size: 56px; line-height: 1.08;
      letter-spacing: -0.015em;
      color: ${BRAND.white};
      flex: none;
    }
    .body {
      margin-top: 44px;
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      font-weight: 400; font-size: ${bodySize}px; line-height: 1.5;
      letter-spacing: -0.005em;
      color: ${BRAND.grey};
    }
    .body > * + * { margin-top: 1em; }
    .body ul { list-style: none; }
    .body li {
      position: relative;
      padding-left: 1.05em;
    }
    .body li + li { margin-top: 0.62em; }
    .body li::before {
      content: '';
      position: absolute; left: 0; top: 0.62em;
      width: 8px; height: 8px;
      background: ${BRAND.indigo};
    }`;

/* ------------------------------------------------------------------ */
/* Gabarit A : couverture                                              */
/* ------------------------------------------------------------------ */
function tplA(s) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Fynovates | Slide ${String(s.n).padStart(2, '0')}</title>
${FONTS}
  <style>
${RESET}
    .bg {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      z-index: 0;
    }
    .overlay {
      position: absolute; inset: 0;
      background: rgba(15, 21, 53, 0.75);
      z-index: 1;
    }
    .frame {
      position: relative; z-index: 2;
      width: 100%; height: 100%;
      padding: 90px;
      display: flex; flex-direction: column;
      align-items: flex-start; justify-content: center;
    }
    .rule {
      width: 80px; height: 4px;
      background: ${BRAND.indigo};
      margin-bottom: 40px;
      flex: none;
    }
    .title {
      font-weight: 900; font-size: 88px; line-height: 1.04;
      letter-spacing: -0.025em;
      color: ${BRAND.white};
    }
    .subtitle {
      margin-top: 36px;
      font-weight: 400; font-size: 34px; line-height: 1.4;
      color: ${BRAND.grey};
    }
  </style>
</head>
<body>
<div class="slide" data-tpl="A" data-n="${s.n}">
  <img class="bg" src="../assets/img/${s.img}" alt="">
  <div class="overlay"></div>
  <div class="frame">
    <div class="rule"></div>
    <h1 class="title">${inline(s.title, `slide ${s.n} / title`)}</h1>
    <p class="subtitle">${inline(s.subtitle, `slide ${s.n} / subtitle`)}</p>
  </div>
${LOGO}
</div>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Gabarit B : texte seul sur navy plein                               */
/* ------------------------------------------------------------------ */
function tplB(s) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Fynovates | Slide ${String(s.n).padStart(2, '0')}</title>
${FONTS}
  <style>
${RESET}
${TEXTCOMMON(32)}
  </style>
</head>
<body>
<div class="slide" data-tpl="B" data-n="${s.n}">
  <div class="frame">
${num(s.n)}
    <h1 class="title">${inline(s.title, `slide ${s.n} / title`)}</h1>
    <div class="body" data-base="32" data-min="26">
${bodyHtml(s.body, s.n)}
    </div>
  </div>
${LOGO}
</div>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Gabarit C : bandeau illustration 520px + texte                      */
/* ------------------------------------------------------------------ */
function tplC(s) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Fynovates | Slide ${String(s.n).padStart(2, '0')}</title>
${FONTS}
  <style>
${RESET}
${TEXTCOMMON(28)}
    .banner {
      position: absolute; top: 44px; left: 44px; right: 44px;
      height: 520px;
      border-radius: 24px;
      overflow: hidden;
      z-index: 1;
    }
    .banner img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: block;
    }
    .banner::after {
      content: '';
      position: absolute; inset: 0;
      background: rgba(15, 21, 53, 0.20);
    }
    .frame { padding-top: 608px; }
    .title { font-size: 52px; margin-top: 36px; }
    .body  { margin-top: 36px; }
  </style>
</head>
<body>
<div class="slide" data-tpl="C" data-n="${s.n}">
  <div class="banner"><img src="../assets/img/${s.img}" alt=""></div>
  <div class="frame">
${num(s.n)}
    <h1 class="title">${inline(s.title, `slide ${s.n} / title`)}</h1>
    <div class="body" data-base="28" data-min="26">
${bodyHtml(s.body, s.n)}
    </div>
  </div>
${LOGO}
</div>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
/* Gabarit CTA : slide 16                                              */
/* ------------------------------------------------------------------ */
function tplCTA(s) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Fynovates | Slide ${String(s.n).padStart(2, '0')}</title>
${FONTS}
  <style>
${RESET}
    .slide { background: ${BRAND.indigo}; }
    html, body { background: ${BRAND.indigo}; }
    .frame {
      width: 100%; height: 100%;
      padding: 90px;
      display: flex; align-items: center; justify-content: center;
    }
    .cta {
      font-weight: 900; font-size: 72px; line-height: 1.08;
      letter-spacing: -0.02em;
      text-align: center;
      color: ${BRAND.navy};
    }
  </style>
</head>
<body>
<div class="slide" data-tpl="CTA" data-n="${s.n}">
  <div class="frame">
    <div class="cta" data-base="72" data-min="48">${inline(s.title, `slide ${s.n} / cta`)}</div>
  </div>
</div>
</body>
</html>
`;
}

/* ------------------------------------------------------------------ */
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

console.log(`OK  ${slides.length} slides ecrites dans slides/`);
if (PROVISOIRE) {
  console.log('!!  content/slides.js est encore en TEXTES PROVISOIRES (PROVISOIRE = true)');
}
