#!/usr/bin/env node
/**
 * Fynovates — « Ton salaire est une décision », version tout-texte
 *
 * Compose les 6 stories en HTML/CSS puis les exporte en PNG 1080 × 1920
 * exactement via Puppeteer.
 *
 *   node build.mjs
 *
 * Entrées : src/story.css  +  src/content.js
 * Sorties : output/story-1.png … story-6.png
 *           src/story-1.html … story-6.html   (sources, regénérées à chaque build)
 *           preview.html                      (les 6 en planche)
 *
 * Le build ne livre pas tant que quatre contrôles ne passent pas :
 *   1. le bloc est bien centré — l'air au-dessus et en dessous ne diffère pas
 *      de plus de 2px, sauf remontée voulue sur la story 6 ;
 *   2. rien ne descend sous 1620px (sous 900px pour la story 6) ;
 *   3. l'export fait 1080 × 1920 pixels exactement ;
 *   4. le PNG livré est strictement gris et sa zone basse strictement vide.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { STORIES, TOTAL } from './src/content.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'output');

const W = 1080;
const H = 1920;

const ZONE_BASSE = 300;               // stickers Instagram
const LIMITE = H - ZONE_BASSE;        // 1620
const LIMITE_STORY6 = 900;            // la moitié basse revient au sondage

/**
 * Remontée du bloc de la story 6. Le centre exact est à 960px ; on le pose à
 * 43% de la hauteur, soit 826px — assez haut pour dégager franchement la moitié
 * basse, assez bas pour que ça reste un centrage et pas un texte collé en haut.
 */
const REMONTEE_STORY6 = Math.round(H * 0.5 - H * 0.43); // 134px

const TOLERANCE_CENTRAGE = 2;         // px

/* ------------------------------------------------------------------ texte */

/** Typographie française : espaces insécables autour des guillemets et avant ? ! ; : %. */
const typo = (t) =>
  t
    .replace(/«\s/g, '« ')
    .replace(/\s»/g, ' »')
    .replace(/\s([?!;:])/g, ' $1')
    .replace(/(\d)\s*%/g, '$1 %');

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * __mot__ → <u> : le seul procédé de mise en valeur de la série.
 *
 * Une locution soulignée courte reste insécable : coupée en fin de ligne, son
 * filet se briserait en deux morceaux et se lirait comme une coquille. Au-delà,
 * on laisse le texte se composer normalement — « des dizaines de milliers
 * d'euros d'écart » ne peut pas tenir sur une ligne, et son filet en deux
 * tronçons est alors l'écriture normale de la locution.
 */
const INSECABLE_MAX = 18;

function rich(source) {
  const text = typo(source);
  const re = /__(.+?)__/gs;
  let out = '';
  let pos = 0;
  for (const m of text.matchAll(re)) {
    out += escapeHtml(text.slice(pos, m.index));
    const classe = m[1].length <= INSECABLE_MAX ? ' class="insecable"' : '';
    out += `<u${classe}>${escapeHtml(m[1])}</u>`;
    pos = m.index + m[0].length;
  }
  return out + escapeHtml(text.slice(pos));
}

/* ------------------------------------------------------------- navigateur */

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

/* ------------------------------------------------------------------ rendu */

const remonteeDe = (s) => (s.layout === 'haut' ? REMONTEE_STORY6 : 0);

function html(story) {
  const fonts = readFileSync(join(SRC, 'inter', 'inter.css'), 'utf8');
  const css = readFileSync(join(SRC, 'story.css'), 'utf8');

  const corps = story.corps.map((c) => `      <p class="corps">${rich(c)}</p>`).join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — story ${story.n}/${TOTAL}</title>
<style>
${fonts}
${css}
:root { --remontee: ${remonteeDe(story)}px; }${story.espace?.interligne ? `
.accroche + .corps { margin-top: ${story.espace.interligne}px; }` : ''}
</style>
</head>
<body>
  <div class="story story--${story.layout}">
    <span class="numero">${story.n}/${TOTAL}</span>
    <div class="contenu">
      <div class="texte">
        <p class="accroche">${rich(story.accroche)}</p>
${corps}
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/** Mesure, dans la page rendue, la géométrie réelle du bloc. */
const MESURE = () => {
  const t = document.querySelector('.texte').getBoundingClientRect();
  return {
    haut: Math.round(t.top),
    bas: Math.round(t.bottom),
    hauteur: Math.round(t.height),
    centre: Math.round((t.top + t.bottom) / 2),
  };
};

/**
 * Audit du PNG produit, relu pixel par pixel : la direction artistique interdit
 * toute couleur, et la zone basse doit être rigoureusement vide.
 */
const AUDITE = async (dataUri, limite) => {
  const img = new Image();
  img.src = dataUri;
  await img.decode();

  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const x = c.getContext('2d', { willReadFrequently: true });
  x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data;

  let blancs = 0, total = 0, teinte = 0, sousLigne = 0, premierBas = null;
  for (let y = 0; y < c.height; y++) {
    for (let px = 0; px < c.width; px++) {
      const k = (y * c.width + px) * 4;
      const [R, G, B] = [d[k], d[k + 1], d[k + 2]];
      total++;
      if (R === 255 && G === 255 && B === 255) blancs++;
      const t = Math.max(Math.abs(R - G), Math.abs(G - B), Math.abs(R - B));
      if (t > teinte) teinte = t;
      if (y >= limite && (R < 250 || G < 250 || B < 250)) {
        sousLigne++;
        if (premierBas === null) premierBas = y;
      }
    }
  }
  return {
    partBlanche: +((blancs / total) * 100).toFixed(1),
    teinte,
    sousLigne,
    premierBas,
  };
};

/* -------------------------------------------------------------- exécution */

async function main() {
  mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    // --disable-lcd-text : sans lui, Chromium rend le texte en anticrénelage
    // sous-pixel sur fond opaque et borde chaque lettre de franges rouges et
    // bleues. Invisible à l'œil, mais c'est de la couleur dans une série qui
    // n'en admet aucune — le contrôle de teinte du build le refuse (écart 134).
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--font-render-hinting=none',
      '--disable-lcd-text',
    ],
  });

  const rapport = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

    for (const story of STORIES) {
      const limite = story.layout === 'haut' ? LIMITE_STORY6 : LIMITE;
      const remontee = remonteeDe(story);
      const centreVoulu = Math.round(H / 2) - remontee;

      const f = join(SRC, `story-${story.n}.html`);
      writeFileSync(f, html(story), 'utf8');
      await page.goto(`file://${f}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      const m = await page.evaluate(MESURE);

      // 1. Le centrage est-il celui qu'on a demandé ?
      const ecart = Math.abs(m.centre - centreVoulu);
      if (ecart > TOLERANCE_CENTRAGE) {
        throw new Error(
          `Story ${story.n} : bloc centré sur ${m.centre}px au lieu de ${centreVoulu}px ` +
          `(écart ${ecart}px).`
        );
      }

      // 2. La ligne basse.
      if (m.bas > limite) {
        throw new Error(
          `Story ${story.n} : le texte descend à ${m.bas}px (limite ${limite}px).`
        );
      }

      const dst = join(OUT, `story-${story.n}.png`);
      await page.screenshot({ path: dst, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });

      // 3. Les dimensions, lues dans l'en-tête du fichier produit.
      const png = readFileSync(dst);
      const [lx, ly] = [png.readUInt32BE(16), png.readUInt32BE(20)];
      if (lx !== W || ly !== H) throw new Error(`Story ${story.n} : export ${lx}×${ly}.`);

      // 4. Relecture du PNG livré : aucune couleur, aucune encre sous la ligne.
      const audit = await page.evaluate(
        AUDITE, `data:image/png;base64,${png.toString('base64')}`, limite
      );
      if (audit.teinte !== 0) {
        throw new Error(
          `Story ${story.n} : le rendu n'est pas strictement gris ` +
          `(écart de teinte ${audit.teinte}). La direction artistique interdit la couleur.`
        );
      }
      if (audit.sousLigne !== 0) {
        throw new Error(
          `Story ${story.n} : ${audit.sousLigne} pixels d'encre sous la ligne des ${limite}px ` +
          `(le premier à ${audit.premierBas}px).`
        );
      }

      rapport.push({ n: story.n, ...m, limite, remontee, ...audit });
      console.log(
        `  ✓ output/story-${story.n}.png — bloc ${m.haut}→${m.bas}px, ` +
        `centré sur ${m.centre}px` +
        (remontee ? ` (remonté de ${remontee}px)` : '') +
        `, limite ${limite}px, ${audit.partBlanche}% de blanc pur, teinte ${audit.teinte}`
      );
    }
  } finally {
    await browser.close();
  }

  preview(rapport);
  return rapport;
}

/* --------------------------------------------------------------- planche */

function preview(rapport) {
  const cartes = STORIES.map((s) => {
    const r = rapport.find((x) => x.n === s.n) || {};
    return `  <figure class="${s.layout === 'haut' ? 'six' : ''}">
    <img src="output/story-${s.n}.png" alt="Story ${s.n}">
    <figcaption>${s.n}/${TOTAL} — bloc ${r.haut}→${r.bas}px · centré sur ${r.centre}px</figcaption>
  </figure>`;
  }).join('\n');

  writeFileSync(
    join(ROOT, 'preview.html'),
    `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — Ton salaire est une décision (tout-texte)</title>
<style>
  body { background:#F4F4F5; color:#555; font:14px/1.6 ui-sans-serif,system-ui,sans-serif; margin:0; padding:40px; }
  h1 { color:#111; font-size:15px; font-weight:700; letter-spacing:4px; text-transform:uppercase; margin:0 0 6px; }
  p.sous { margin:0 0 32px; max-width:820px; }
  .planche { display:flex; flex-wrap:wrap; gap:28px; }
  figure { margin:0; flex:0 0 auto; position:relative; }
  img { width:320px; display:block; border:1px solid #E4E4E7; }
  figcaption { margin-top:10px; font-size:12px; letter-spacing:.06em; }
  /* repères : l'axe médian, et la ligne basse à ne pas franchir */
  figure::before, figure::after {
    content:''; position:absolute; left:0; right:0; height:1px; pointer-events:none;
  }
  figure::before { top: calc(320px / 1080 * 960); background:rgba(17,17,17,.2); }
  figure::after  { top: calc(320px / 1080 * 1620); background:rgba(220,38,38,.45); }
  figure.six::after { top: calc(320px / 1080 * 900); }
</style>
</head>
<body>
  <h1>Ton salaire est une décision — tout-texte</h1>
  <p class="sous">Les 6 stories dans l'ordre de publication. Le filet gris marque l'axe médian
  des 960&nbsp;px, sur lequel le bloc est centré ; le filet rouge, la limite basse — 1620&nbsp;px
  partout, 900&nbsp;px sur la story&nbsp;6 dont le bloc est remonté pour dégager la moitié basse
  au sticker sondage.</p>
  <div class="planche">
${cartes}
  </div>
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
