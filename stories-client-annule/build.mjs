#!/usr/bin/env node
/**
 * Fynovates — « Le client qui a annulé son départ »
 *
 * Compose les 6 stories en HTML/CSS puis les exporte en PNG 1080x1920 exactement
 * via Puppeteer, et produit la page de validation preview.html.
 *
 *   node build.mjs
 *
 * Entrées : backgrounds/bg-1.jpg … bg-6.jpg + src/story.css + src/content.js
 * Sorties : src/story-N.html   une page HTML par story
 *           output/story-N.png les 6 visuels finaux
 *           preview.html       les 6 côte à côte pour validation
 *
 * Contrôles exécutés à chaque build, bloquants :
 *   - rien ne descend sous la ligne des 300px du bas ;
 *   - le contraste de chaque couleur de texte sur son fond réel atteint WCAG AA ;
 *   - l'export fait 1080x1920 exactement.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { STORIES, TOTAL } from './src/content.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const BG = join(ROOT, 'backgrounds');
const OUT = join(ROOT, 'output');

const W = 1080;
const H = 1920;
const ZONE_BASSE = 300;          // stickers Instagram
// WCAG 2.1 AA : 4.5:1 pour le texte normal, 3:1 pour le « large scale text »
// (≥ 24px, ou ≥ 18.66px en gras). Le seuil est calculé par élément.
const AA_NORMAL = 4.5;
const AA_LARGE = 3.0;

/* ------------------------------------------------------------------ rendu */

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Typographie française : espace insécable après « et avant » ? ! ; :
 * Sans ça, un guillemet fermant part seul à la ligne suivante.
 */
const typo = (t) =>
  t.replace(/«\s/g, '«\u00A0')
   .replace(/\s»/g, '\u00A0»')
   .replace(/\s([?!;:])/g, '\u00A0$1');

/** {{doré}} → <em>, [[rouge]] → <i>, //italique// → <cite>. Le reste est échappé. */
function rich(source) {
  const text = typo(source);
  const re = /\{\{(.+?)\}\}|\[\[(.+?)\]\]|\/\/(.+?)\/\//gs;
  let out = '';
  let pos = 0;
  for (const m of text.matchAll(re)) {
    out += escapeHtml(text.slice(pos, m.index));
    if (m[1] !== undefined) out += `<em>${escapeHtml(m[1])}</em>`;
    else if (m[2] !== undefined) out += `<i>${escapeHtml(m[2])}</i>`;
    else out += `<cite>${escapeHtml(m[3])}</cite>`;
    pos = m.index + m[0].length;
  }
  return out + escapeHtml(text.slice(pos));
}

const deuxChiffres = (n) => String(n).padStart(2, '0');

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
  const cta = story.cta ? `\n          <div class="cta">${escapeHtml(story.cta)}</div>` : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — chapitre ${deuxChiffres(story.n)} / ${TOTAL}</title>
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
    <div class="grade"></div>
    <div class="renfort"></div>
    <div class="renfort-haut"></div>

    <!-- couche 2 : le système graphique éditorial -->
    <div class="filigrane">${deuxChiffres(story.n)}</div>
    <div class="chapitre">Chapitre ${deuxChiffres(story.n)} — ${deuxChiffres(TOTAL)}</div>

    <!-- couche 3 : le texte -->
    <div class="contenu">
      <div class="bloc">
        <div class="filet"></div>
        <div class="texte">
          <p class="accroche">${rich(story.accroche)}</p>
${corps}
        </div>${cta}
      </div>
    </div>

  </div>
</body>
</html>
`;
}

/* --------------------------------------------------------------- contrôles */

/** Le bas du contenu, tout élément de texte confondu. */
const MESURE_BAS = () => {
  const noeuds = document.querySelectorAll('.accroche, .corps, .cta, .chapitre');
  let bas = 0;
  let coupable = null;
  for (const n of noeuds) {
    const b = n.getBoundingClientRect().bottom;
    if (b > bas) { bas = b; coupable = n.className; }
  }
  return { bas: Math.round(bas), coupable };
};

/** Position du bloc CTA, pour vérifier la consigne des 380px minimum du bas. */
const MESURE_CTA = () => {
  const n = document.querySelector('.cta');
  if (!n) return null;
  const r = n.getBoundingClientRect();
  return { bas: Math.round(r.bottom), sousLeCadre: Math.round(1920 - r.bottom) };
};

/**
 * Contraste réel de chaque run de texte sur son fond composité.
 *
 * On ne fait pas confiance au dégradé sur parole : on rend une seconde passe avec
 * le texte masqué, on en fait une image, et on échantillonne les pixels du fond
 * exactement sous chaque run. Le ratio retenu est le PIRE de la zone — c'est le
 * pixel le plus clair sous du texte clair qui décide.
 */
const MESURE_CONTRASTE = async (fondDataUrl, seuils) => {
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
  const parseRgb = (s) => s.match(/\d+/g).slice(0, 3).map(Number);

  const runs = document.querySelectorAll('.accroche, .corps, .cta, .chapitre, em, i, cite');
  let pire = { marge: Infinity };

  for (const n of runs) {
    const st = getComputedStyle(n);
    const [r, g, b] = parseRgb(st.color);
    const lTexte = lum(r, g, b);

    // « large scale text » au sens WCAG : ≥ 24px, ou ≥ 18.66px en gras.
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
        const v = ratio(lTexte, lum(px[i], px[i + 1], px[i + 2]));
        // on retient le run dont la MARGE au seuil est la plus faible
        if (v - seuil < pire.marge) {
          pire = {
            marge: v - seuil,
            ratio: Math.round(v * 100) / 100,
            seuil,
            taille: Math.round(taille),
            selecteur: n.tagName.toLowerCase() + (n.className ? '.' + n.className : ''),
            couleur: `rgb(${r}, ${g}, ${b})`,
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
    args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
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

      const { bas, coupable } = await page.evaluate(MESURE_BAS);
      const limite = H - ZONE_BASSE;
      if (bas > limite) {
        throw new Error(
          `Story ${story.n} : le contenu descend à ${bas}px, au-delà de la ligne des ${limite}px — bloc « ${coupable} ».`
        );
      }

      const cta = await page.evaluate(MESURE_CTA);
      if (cta && cta.sousLeCadre < 380) {
        throw new Error(
          `Story ${story.n} : le bloc GO s'arrête à ${cta.sousLeCadre}px du bas, minimum 380px.`
        );
      }

      // passe « fond seul » : le texte masqué, le reste intact
      await page.addStyleTag({ content: '.contenu, .chapitre { visibility: hidden !important; }' });
      const fond = await page.screenshot({ encoding: 'base64', type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
      await page.evaluate(() => document.querySelectorAll('style').forEach((s, i, a) => { if (i === a.length - 1) s.remove(); }));

      const contraste = await page.evaluate(MESURE_CONTRASTE, `data:image/png;base64,${fond}`, { normal: AA_NORMAL, large: AA_LARGE });
      if (!contraste.ok) {
        throw new Error(
          `Story ${story.n} : contraste ${contraste.ratio}:1 sous le seuil AA de ${contraste.seuil}:1 ` +
          `— ${contraste.couleur}, ${contraste.taille}px, sur « ${contraste.selecteur} ». ` +
          `Épaissir le dégradé localement.`
        );
      }

      const dst = join(OUT, `story-${story.n}.png`);
      await page.screenshot({ path: dst, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });

      rapport.push({ n: story.n, bas, limite, cta, contraste: contraste.ratio });
      console.log(
        `  ✓ output/story-${story.n}.png — bas ${bas}px / ${limite}px, ` +
        `contraste min ${contraste.ratio}:1 (seuil ${contraste.seuil}, « ${contraste.selecteur} »)` +
        (cta ? `, GO à ${cta.sousLeCadre}px du bas` : '')
      );
    }
  } finally {
    await browser.close();
  }

  preview();
  return rapport;
}

function preview() {
  const cartes = STORIES.map(
    (s) => `  <figure>
    <img src="output/story-${s.n}.png" alt="Chapitre ${deuxChiffres(s.n)}">
    <figcaption>Chapitre ${deuxChiffres(s.n)} — ${s.layout}</figcaption>
  </figure>`
  ).join('\n');

  writeFileSync(
    join(ROOT, 'preview.html'),
    `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — Le client qui a annulé son départ</title>
<style>
  :root { color-scheme: dark; }
  body { background:#0B0E16; color:#9CA3AF; font:14px/1.6 ui-sans-serif,system-ui,sans-serif; margin:0; padding:40px; }
  h1 { color:#D4AF37; font-size:15px; font-weight:700; letter-spacing:4px; text-transform:uppercase; margin:0 0 6px; }
  p.sous { margin:0 0 32px; max-width:760px; }
  .planche { display:flex; flex-wrap:wrap; gap:28px; padding-bottom:20px; }
  figure { margin:0; flex:0 0 auto; }
  img { width:320px; display:block; border-radius:8px; box-shadow:0 8px 40px rgba(0,0,0,.5); }
  figcaption { margin-top:10px; font-size:12px; letter-spacing:2px; text-transform:uppercase; }
  /* repères de grille, pour vérifier les zones mortes d'un coup d'œil */
  figure { position:relative; }
  figure::before, figure::after {
    content:''; position:absolute; left:0; right:0; height:1px;
    background:rgba(212,175,55,.35); pointer-events:none;
  }
  figure::before { top: calc(320px / 1080 * 160); }   /* ligne des 160px */
  figure::after  { top: calc(320px / 1080 * 1620); }  /* ligne des 1620px */
</style>
</head>
<body>
  <h1>Le client qui a annulé son départ</h1>
  <p class="sous">Les 6 stories dans l'ordre de publication. Les deux filets dorés marquent
  les zones mortes : 160&nbsp;px en haut, 300&nbsp;px en bas. Aucun texte ne doit les franchir.</p>
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
