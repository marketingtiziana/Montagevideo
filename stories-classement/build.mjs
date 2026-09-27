#!/usr/bin/env node
/**
 * Fynovates — « Le classement des pires conseils fiscaux d'Instagram »
 *
 * Compose les 6 stories en HTML/CSS puis les exporte en PNG 1080×1920 exactement
 * via Puppeteer, et produit la page de validation preview.html.
 *
 *   node build.mjs
 *
 * Entrées : backgrounds/bg-1.jpg … bg-6.jpg + src/story.css + src/content.js
 * Sorties : src/story-N.html   une page HTML par story
 *           output/story-N.png les 6 visuels finaux
 *           preview.html       les 6 côte à côte pour validation
 *
 * Cinq contrôles bloquants à chaque build :
 *   1. rien au-dessus de la ligne des 160 px ;
 *   2. rien sous la ligne des 1620 px (stories 1 à 5) — et rien sous 950 px
 *      pour la story 6, qui doit laisser toute sa moitié basse au sticker
 *      « Posez-moi une question » ;
 *   3. le numéro du classement est au pixel près à la même position sur les
 *      stories 2 à 5 ;
 *   4. chaque couleur de texte atteint WCAG 2.1 AA sur son fond réel ;
 *   5. l'export fait 1080×1920 exactement.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { STORIES, TOTAL, KICKER } from './src/content.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const BG = join(ROOT, 'backgrounds');
const OUT = join(ROOT, 'output');

const W = 1080;
const H = 1920;
const LIGNE_HAUT = 160;   // rien au-dessus
const LIGNE_BAS = 1620;   // 1920 − 300, rien en dessous
const LIGNE_FAQ = 950;    // story 6 : rien en dessous, place au sticker questions

// WCAG 2.1 AA : 4.5:1 pour le texte normal, 3:1 pour le « large scale text »
// (≥ 24 px, ou ≥ 18.66 px en gras). Le seuil est choisi élément par élément.
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

/* ------------------------------------------------------------------ rendu */

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Typographie française :
 *   - espace insécable après « et avant », et avant ? ! ; : %. Sans ça un
 *     guillemet fermant ou un point d'interrogation part seul à la ligne ;
 *   - apostrophe typographique U+2019 à la place de l'apostrophe droite, qui
 *     détonne à 40 px au milieu d'une composition Inter.
 */
const typo = (t) =>
  t.replace(/«\s/g, '« ')
   .replace(/\s»/g, ' »')
   .replace(/\s([?!;:%])/g, ' $1')
   .replace(/'/g, '’')
   // séparateur de milliers : espace fine insécable, sinon « 25 000 » se coupe
   // en fin de ligne et le montant se lit en deux morceaux
   .replace(/(\d)\s(?=\d)/g, '$1 ');

/** {{doré}} → <em>, [[rouge]] → <i>. Tout le reste est échappé. */
function rich(source) {
  const text = typo(source);
  const re = /\{\{(.+?)\}\}|\[\[(.+?)\]\]/gs;
  let out = '';
  let pos = 0;
  for (const m of text.matchAll(re)) {
    out += escapeHtml(text.slice(pos, m.index));
    if (m[1] !== undefined) out += `<em>${escapeHtml(m[1])}</em>`;
    else out += `<i>${escapeHtml(m[2])}</i>`;
    pos = m.index + m[0].length;
  }
  return out + escapeHtml(text.slice(pos));
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/opt/pw-browsers/chromium/chrome-linux/chrome',
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return c;
  const base = '/opt/pw-browsers';
  if (existsSync(base)) {
    for (const d of readdirSync(base)) {
      const p = join(base, d, 'chrome-linux', 'chrome');
      if (existsSync(p)) return p;
    }
  }
  throw new Error('Chromium introuvable — définir CHROME_PATH.');
}

function html(story) {
  const fonts = readFileSync(join(SRC, 'inter', 'inter.css'), 'utf8');
  const css = readFileSync(join(SRC, 'story.css'), 'utf8');

  const corps = story.corps.map((p) => `        <p class="corps">${rich(p)}</p>`).join('\n');

  // Le système graphique du classement n'existe que sur les rangs.
  const rang = story.rang
    ? `        <div class="rang">${escapeHtml(story.rang)}</div>
        <div class="filet"></div>
        <p class="citation">${rich(story.citation)}</p>\n`
    : '';

  const accroche = story.accroche
    ? `        <p class="accroche">${rich(story.accroche)}</p>\n`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — classement ${story.n} / ${TOTAL}</title>
<!-- Inter (Google Fonts), vendorisée dans src/inter/ pour un rendu déterministe hors ligne -->
<style>
${fonts}
${css}
</style>
</head>
<body>
  <div class="story story--${story.layout}">

    <!-- couche 1 : la photo et son grading -->
    <img class="photo" src="../backgrounds/${story.bg}" alt="">

    <!-- couche 2 : lisibilité -->
    <div class="grade"></div>
    <div class="renfort-bas"></div>
    <div class="renfort-haut"></div>

    <!-- couche 3 : en-tête de série -->
    <div class="kicker">${escapeHtml(KICKER)}</div>
    <div class="compteur">${story.n}/${TOTAL}</div>

    <!-- couche 3 : le texte -->
    <div class="contenu">
${rang}${accroche}${corps}
    </div>

  </div>
</body>
</html>
`;
}

/* --------------------------------------------------------------- contrôles */

const SELECTEURS_TEXTE = '.kicker, .compteur, .rang, .citation, .accroche, .corps';

/** Bornes verticales du texte, et l'élément responsable de chaque extrême. */
const MESURE_BORNES = (sel) => {
  let bas = 0;
  let haut = Infinity;
  let coupableBas = null;
  let coupableHaut = null;
  for (const n of document.querySelectorAll(sel)) {
    const r = n.getBoundingClientRect();
    if (r.bottom > bas) { bas = r.bottom; coupableBas = n.className; }
    if (r.top < haut) { haut = r.top; coupableHaut = n.className; }
  }
  return {
    bas: Math.round(bas),
    haut: Math.round(haut),
    coupableBas,
    coupableHaut,
  };
};

/** Position exacte du numéro de classement, pour comparer les rangs entre eux. */
const MESURE_RANG = () => {
  const n = document.querySelector('.rang');
  if (!n) return null;
  const r = n.getBoundingClientRect();
  const f = document.querySelector('.filet').getBoundingClientRect();
  return {
    top: Math.round(r.top * 100) / 100,
    left: Math.round(r.left * 100) / 100,
    hauteur: Math.round(r.height * 100) / 100,
    filetTop: Math.round(f.top * 100) / 100,
  };
};

/**
 * Contraste réel de chaque run de texte sur son fond composité.
 *
 * On ne fait pas confiance au dégradé sur parole : une seconde passe rend la
 * page texte masqué, on en fait une image, et on échantillonne les pixels du
 * fond exactement sous chaque run. Le ratio retenu est le PIRE de la zone —
 * c'est le pixel le plus clair sous du texte clair qui décide.
 */
const MESURE_CONTRASTE = async (fondDataUrl, seuils, sel) => {
  const img = new Image();
  img.src = fondDataUrl;
  await img.decode();

  const c = document.createElement('canvas');
  c.width = 1080;
  c.height = 1920;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const canal = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const lum = (r, g, b) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
  const ratio = (l1, l2) => {
    const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
    return (hi + 0.05) / (lo + 0.05);
  };
  const parseRgba = (s) => {
    const v = s.match(/[\d.]+/g).map(Number);
    return { r: v[0], g: v[1], b: v[2], a: v[3] === undefined ? 1 : v[3] };
  };

  const runs = document.querySelectorAll(`${sel}, em, i`);
  let pire = { marge: Infinity };

  for (const n of runs) {
    const st = getComputedStyle(n);
    const col = parseRgba(st.color);

    // « large scale text » au sens WCAG : ≥ 24 px, ou ≥ 18.66 px en gras.
    const taille = parseFloat(st.fontSize);
    const graisse = parseInt(st.fontWeight, 10) || 400;
    const seuil = taille >= 24 || (taille >= 18.66 && graisse >= 700) ? seuils.large : seuils.normal;

    for (const rect of n.getClientRects()) {
      const x0 = Math.max(0, Math.floor(rect.left));
      const y0 = Math.max(0, Math.floor(rect.top));
      const w = Math.min(1080 - x0, Math.ceil(rect.width));
      const h = Math.min(1920 - y0, Math.ceil(rect.height));
      if (w <= 0 || h <= 0) continue;

      const px = ctx.getImageData(x0, y0, w, h).data;
      for (let i = 0; i < px.length; i += 4 * 3) {   // 1 pixel sur 3, suffisant et rapide
        // le texte semi-transparent est composité sur le fond avant mesure
        const fr = px[i], fg = px[i + 1], fb = px[i + 2];
        const lTexte = col.a >= 1
          ? lum(col.r, col.g, col.b)
          : lum(
              col.r * col.a + fr * (1 - col.a),
              col.g * col.a + fg * (1 - col.a),
              col.b * col.a + fb * (1 - col.a),
            );
        const v = ratio(lTexte, lum(fr, fg, fb));
        // on retient le run dont la MARGE au seuil est la plus faible
        if (v - seuil < pire.marge) {
          pire = {
            marge: Math.round((v - seuil) * 100) / 100,
            ratio: Math.round(v * 100) / 100,
            seuil,
            taille: Math.round(taille),
            selecteur: n.tagName.toLowerCase() + (n.className ? '.' + String(n.className).split(' ')[0] : ''),
            couleur: st.color,
          };
        }
      }
    }
  }

  return { ...pire, ok: pire.ratio >= pire.seuil };
};

/* --------------------------------------------------------------- exécution */

async function main() {
  mkdirSync(OUT, { recursive: true });

  const manquantes = STORIES.filter((s) => !existsSync(join(BG, s.bg)));
  if (manquantes.length) {
    console.error(
      `Photos manquantes dans backgrounds/ : ${manquantes.map((s) => s.bg).join(', ')}\n` +
      `Voir prompts-higgsfield.md, déposer les images, puis relancer.`
    );
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--font-render-hinting=none',
      // sans ça, l'anti-aliasing sous-pixel pose des franges colorées sur les
      // bords des lettres claires : fatal pour un PNG destiné à Instagram
      '--disable-lcd-text',
    ],
  });

  const rapport = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

    for (const story of STORIES) {
      const fichier = join(SRC, `story-${story.n}.html`);
      writeFileSync(fichier, html(story), 'utf8');

      await page.goto(`file://${fichier}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);

      const bornes = await page.evaluate(MESURE_BORNES, SELECTEURS_TEXTE);
      const limiteBas = story.layout === 'faq' ? LIGNE_FAQ : LIGNE_BAS;

      if (bornes.haut < LIGNE_HAUT) {
        throw new Error(
          `Story ${story.n} : du texte monte à ${bornes.haut}px, au-dessus de la ligne ` +
          `des ${LIGNE_HAUT}px — bloc « ${bornes.coupableHaut} ».`
        );
      }
      if (bornes.bas > limiteBas) {
        throw new Error(
          `Story ${story.n} : le texte descend à ${bornes.bas}px, au-delà de la ligne ` +
          `des ${limiteBas}px — bloc « ${bornes.coupableBas} ».`
        );
      }

      const rang = await page.evaluate(MESURE_RANG);

      // passe « fond seul » : le texte masqué, les dégradés et la photo intacts
      await page.addStyleTag({
        content: '.contenu, .kicker, .compteur { visibility: hidden !important; }',
      });
      const fond = await page.screenshot({
        encoding: 'base64', type: 'png',
        clip: { x: 0, y: 0, width: W, height: H },
      });
      await page.evaluate(() => {
        const styles = document.querySelectorAll('style');
        styles[styles.length - 1].remove();
      });

      const contraste = await page.evaluate(
        MESURE_CONTRASTE,
        `data:image/png;base64,${fond}`,
        { normal: AA_NORMAL, large: AA_LARGE },
        SELECTEURS_TEXTE,
      );
      if (!contraste.ok) {
        throw new Error(
          `Story ${story.n} : contraste ${contraste.ratio}:1 sous le seuil AA de ${contraste.seuil}:1 ` +
          `— ${contraste.couleur}, ${contraste.taille}px, sur « ${contraste.selecteur} ». ` +
          `Épaissir le dégradé localement.`
        );
      }

      const dst = join(OUT, `story-${story.n}.png`);
      await page.screenshot({ path: dst, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });

      rapport.push({ n: story.n, layout: story.layout, ...bornes, limiteBas, rang, contraste });
      console.log(
        `  ✓ output/story-${story.n}.png — texte ${bornes.haut}→${bornes.bas}px ` +
        `(limite ${limiteBas}), contraste min ${contraste.ratio}:1 ` +
        `(seuil ${contraste.seuil}, « ${contraste.selecteur} »)` +
        (rang ? `, N° à y=${rang.top}` : '')
      );
    }
  } finally {
    await browser.close();
  }

  /* ---- contrôle 3 : les quatre numéros exactement au même endroit -------- */
  const rangs = rapport.filter((r) => r.rang);
  if (rangs.length) {
    const ref = rangs[0].rang;
    for (const r of rangs.slice(1)) {
      for (const cle of ['top', 'left', 'hauteur', 'filetTop']) {
        if (r.rang[cle] !== ref[cle]) {
          throw new Error(
            `Le numéro de classement bouge entre les stories ${rangs[0].n} et ${r.n} : ` +
            `${cle} ${ref[cle]} ≠ ${r.rang[cle]}. Les rangs doivent être au pixel près.`
          );
        }
      }
    }
    console.log(
      `  ✓ numéros de classement alignés sur les 4 rangs — ` +
      `y=${ref.top}, x=${ref.left}, filet y=${ref.filetTop}`
    );
  }

  /* ---- contrôle 5 : dimensions réelles des PNG livrés -------------------- */
  for (const r of rapport) {
    const f = join(OUT, `story-${r.n}.png`);
    const buf = readFileSync(f);
    // en-tête PNG : largeur et hauteur en big-endian aux octets 16 et 20
    const w = buf.readUInt32BE(16);
    const h = buf.readUInt32BE(20);
    if (w !== W || h !== H) {
      throw new Error(`output/story-${r.n}.png fait ${w}×${h}, attendu ${W}×${H}.`);
    }
    r.poids = Math.round(statSync(f).size / 1024);
  }
  console.log(`  ✓ les 6 PNG font ${W}×${H} exactement`);

  preview(rapport);
  return rapport;
}

function preview(rapport) {
  const ECHELLE = 320 / W;
  // le repère du numéro est celui qu'on vient de mesurer, pas une constante recopiée
  const RANG_Y = (rapport.find((r) => r.rang) || { rang: { top: 0 } }).rang.top;
  const cartes = STORIES.map((s) => {
    const r = rapport.find((x) => x.n === s.n);
    const titre = s.rang ? s.rang : s.layout === 'faq' ? 'FAQ' : 'Ouverture';
    return `  <figure class="v--${s.layout}">
    <img src="output/story-${s.n}.png" alt="Story ${s.n} — ${titre}">
    <figcaption>${s.n}/${TOTAL} · ${titre}<br><span>texte ${r.haut}→${r.bas}px · AA ${r.contraste.ratio}:1 · ${r.poids} ko</span></figcaption>
  </figure>`;
  }).join('\n');

  writeFileSync(
    join(ROOT, 'preview.html'),
    `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — Le classement des pires conseils fiscaux d'Instagram</title>
<style>
  :root { color-scheme: dark; --ech: ${ECHELLE}; --rang-y: ${RANG_Y}px; }
  body { background:#0B0E16; color:#9CA3AF; font:14px/1.6 ui-sans-serif,system-ui,sans-serif; margin:0; padding:40px; }
  h1 { color:#D4AF37; font-size:15px; font-weight:700; letter-spacing:4px; text-transform:uppercase; margin:0 0 6px; }
  p.sous { margin:0 0 30px; max-width:820px; }
  .planche { display:flex; flex-wrap:wrap; gap:28px; padding-bottom:24px; }
  figure { margin:0; flex:0 0 auto; position:relative; }
  img { width:320px; display:block; border-radius:8px; box-shadow:0 8px 40px rgba(0,0,0,.5); }
  figcaption { margin-top:10px; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#E5E7EB; }
  figcaption span { letter-spacing:0; text-transform:none; color:#6B7280; }

  /* Repères de grille superposés au visuel, pour vérifier les zones mortes
     et l'alignement des numéros d'un seul coup d'œil. */
  .repere { position:absolute; left:0; width:320px; height:1px; pointer-events:none; }
  .r-haut  { top:calc(160px  * var(--ech)); background:rgba(212,175,55,.55); }
  .r-bas   { top:calc(1620px * var(--ech)); background:rgba(212,175,55,.55); }
  .r-faq   { top:calc(950px  * var(--ech)); background:rgba(224,92,92,.65); }
  .r-rang  { top:calc(640px  * var(--ech)); background:rgba(96,165,250,.55); }
  /* la ligne des rangs ne concerne que les stories 2 à 5 */
  figure:not(.v--rang) .r-rang { display:none; }
  figure.v--faq .r-bas { display:none; }
  figure:not(.v--faq) .r-faq { display:none; }
  .legende { display:flex; gap:24px; margin:0 0 26px; font-size:12px; }
  .legende b { font-weight:600; }
  .pastille { display:inline-block; width:22px; height:2px; vertical-align:middle; margin-right:7px; }
</style>
</head>
<body>
  <h1>Le classement des pires conseils fiscaux d'Instagram</h1>
  <p class="sous">Les 6 stories dans l'ordre de publication. Même grading, même grille,
  même en-tête. Les repères sont posés à l'échelle&nbsp;: aucun texte ne les franchit.</p>
  <div class="legende">
    <span><i class="pastille" style="background:#D4AF37"></i><b>160 px / 1620 px</b> — zones mortes des stickers</span>
    <span><i class="pastille" style="background:#60A5FA"></i><b>${RANG_Y} px</b> — haut du numéro de classement</span>
    <span><i class="pastille" style="background:#E05C5C"></i><b>950 px</b> — limite basse de la story&nbsp;6</span>
  </div>
  <div class="planche">
${cartes}
  </div>
  <script>
    // les repères sont injectés plutôt qu'écrits six fois dans le HTML
    for (const f of document.querySelectorAll('figure')) {
      for (const c of ['r-haut', 'r-bas', 'r-faq', 'r-rang']) {
        const d = document.createElement('div');
        d.className = 'repere ' + c;
        f.appendChild(d);
      }
    }
  </script>
</body>
</html>
`,
    'utf8'
  );
  console.log('  ✓ preview.html');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
