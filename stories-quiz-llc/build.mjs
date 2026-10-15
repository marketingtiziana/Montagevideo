#!/usr/bin/env node
/**
 * Fynovates — « Le quiz LLC »
 *
 * Compose les 6 stories en HTML/CSS pur — aucune image, rien d'importé — puis
 * les exporte en PNG 1080 × 1920 exactement via Puppeteer.
 *
 *   node build.mjs
 *
 * Entrées : src/story.css  +  src/content.js
 * Sorties : output/story-1.png … story-6.png
 *           src/story-1.html … story-6.html   (sources, regénérées à chaque build)
 *           preview.html                      (les 6 en planche)
 *
 * Six contrôles, détaillés dans le README. Le build échoue si l'un d'eux tombe.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { STORIES, CASES, TOTAL } from './src/content.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'output');

const W = 1080;
const H = 1920;

const LIMITE = H - 300;          // 1620 — zone morte basse
const LIMITE_STORY6 = 1450;      // la barre de commentaire vient sous le verdict
const PLANCHER = 300;            // le contenu ne remonte pas dans l'en-tête

/** Centre optique : un peu au-dessus du centre vrai (960px). */
const CENTRE_OPTIQUE = Math.round(H * 0.46);   // 883px

/** Le jaune surligneur, seul accent autorisé. */
const JAUNE = { r: 255, g: 226, b: 77 };

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

/** ==mot== → <mark> : le surligneur, seul procédé de mise en valeur de la série. */
function rich(source) {
  const text = typo(source);
  const re = /==(.+?)==/gs;
  let out = '';
  let pos = 0;
  for (const m of text.matchAll(re)) {
    out += escapeHtml(text.slice(pos, m.index));
    out += `<mark>${escapeHtml(m[1])}</mark>`;
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

const limiteDe = (s) => (s.n === TOTAL ? LIMITE_STORY6 : LIMITE);

function html(story, contenuHaut) {
  const fonts = readFileSync(join(SRC, 'inter', 'inter.css'), 'utf8');
  const css = readFileSync(join(SRC, 'story.css'), 'utf8');

  const cases = story.layout === 'cases'
    ? `      <div class="cases">
${CASES.map((label, i) =>
  `        <div class="ligne-case">
          <div class="case${story.coches.includes(i) ? ' case--cochee' : ''}"></div>
          <span class="etiquette">${escapeHtml(label)}</span>
        </div>`).join('\n')}
      </div>`
    : '';

  const q = story.layout === 'question'
    ? `      <div class="q">${escapeHtml(story.q)}</div>`
    : '';

  const corps = story.corps.map((c) => `      <p class="corps">${rich(c)}</p>`).join('\n');

  const final = story.final
    ? `      <p class="final"><mark>${escapeHtml(story.final)}</mark></p>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — Le quiz LLC ${story.n}/${TOTAL}</title>
<style>
${fonts}
${css}
:root { --contenu-haut: ${contenuHaut}px; }
</style>
</head>
<body>
  <div class="story">
    <div class="entete">
      <span class="titre">Le test · LLC</span>
      <span class="page">${story.n}/${TOTAL}</span>
    </div>
    <div class="contenu">
${[cases, q].filter(Boolean).join('\n')}
      <p class="accroche">${rich(story.accroche)}</p>
${corps}
${final}
    </div>
  </div>
</body>
</html>
`;
}

/** Géométrie réelle du rendu : en-tête, contenu, « Q », surlignages. */
const MESURE = () => {
  const r = (el) => {
    const b = el.getBoundingClientRect();
    return { haut: Math.round(b.top), bas: Math.round(b.bottom), gauche: Math.round(b.left) };
  };
  const entete = document.querySelector('.entete');
  const titre = document.querySelector('.entete .titre');
  const page = document.querySelector('.entete .page');
  const contenu = document.querySelector('.contenu');
  const q = document.querySelector('.q');

  // Le surligneur : sa bande est un dégradé de fond, elle n'existe donc pas dans
  // la géométrie du DOM. On lit les variables qui la définissent et on les
  // résout sur le corps réel de chaque fragment. (La hauteur effectivement
  // peinte est vérifiée séparément, sur les pixels du PNG livré.)
  const enPx = (valeur, taille) => {
    const v = valeur.trim();
    if (v.endsWith('em')) return parseFloat(v) * taille;
    return parseFloat(v);
  };
  const marks = [...document.querySelectorAll('mark')].map((m) => {
    const cs = getComputedStyle(m);
    const taille = parseFloat(cs.fontSize);
    const interligne = parseFloat(cs.lineHeight);
    const bande = enPx(cs.getPropertyValue('--bande'), taille);
    const debord = enPx(cs.getPropertyValue('--debord'), taille);
    const rects = m.getClientRects();
    return {
      mot: m.textContent.slice(0, 24),
      taille: Math.round(taille),
      bande: Math.round(bande),
      partDuCorps: +(bande / taille).toFixed(2),
      partDeLigne: +(bande / interligne).toFixed(2),
      debord: Math.round(debord),
      fragments: rects.length,
      largeur: Math.round(rects.length ? rects[0].width : 0),
    };
  });

  return {
    entete: r(entete),
    titreHaut: r(titre).haut,
    pageHaut: r(page).haut,
    filet: r(entete).bas,           // le filet est la bordure basse de l'en-tête
    contenu: r(contenu),
    q: q ? r(q) : null,
    marks,
  };
};

/**
 * Audit du PNG livré, relu pixel par pixel.
 *
 * La direction artistique n'autorise qu'un seul accent. Tout pixel coloré doit
 * donc être du jaune surligneur ou l'un de ses mélanges avec le papier et
 * l'encre ; tout le reste doit être neutre. On relève aussi la hauteur réelle
 * de chaque bande de surlignage — celle qui est peinte, pas celle qu'on a
 * demandée en CSS.
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

  const NEUTRE = 10;          // écart de canal toléré avant de parler de couleur
  const lignesJaunes = new Uint8Array(c.height);
  let sousLigne = 0, premierBas = null, intrus = null, nIntrus = 0, nJaune = 0;

  for (let y = 0; y < c.height; y++) {
    for (let px = 0; px < c.width; px++) {
      const k = (y * c.width + px) * 4;
      const R = d[k], G = d[k + 1], B = d[k + 2];

      const max = Math.max(R, G, B), min = Math.min(R, G, B);
      if (max - min > NEUTRE) {
        // Couleur : elle doit être sur la teinte du surligneur (~50°).
        const teinte = max === R
          ? (60 * (G - B)) / (max - min)
          : 999;
        if (R >= G && G > B && teinte >= 30 && teinte <= 75) {
          nJaune++;
          lignesJaunes[y] = 1;
        } else {
          nIntrus++;
          if (!intrus) intrus = { R, G, B, x: px, y };
        }
      }

      if (y >= limite && !(R > 246 && G > 246 && B > 244)) {
        sousLigne++;
        if (premierBas === null) premierBas = y;
      }
    }
  }

  // Hauteur des bandes peintes : les suites de lignes contenant du jaune.
  const bandes = [];
  let debut = null;
  for (let y = 0; y <= c.height; y++) {
    if (y < c.height && lignesJaunes[y]) { if (debut === null) debut = y; }
    else if (debut !== null) { bandes.push(y - debut); debut = null; }
  }

  return { nJaune, nIntrus, intrus, sousLigne, premierBas, bandes };
};

/* -------------------------------------------------------------- exécution */

async function main() {
  mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    // --disable-lcd-text : sans lui, Chromium rend le texte en anticrénelage
    // sous-pixel sur fond opaque et borde chaque lettre de franges rouges et
    // bleues. C'est de la couleur dans une série qui n'en admet qu'une.
    args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none', '--disable-lcd-text'],
  });

  const rapport = [];

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

    const ecris = async (story, haut) => {
      const f = join(SRC, `story-${story.n}.html`);
      writeFileSync(f, html(story, haut), 'utf8');
      await page.goto(`file://${f}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      return page.evaluate(MESURE);
    };

    /* --- 1. le haut du contenu -------------------------------------------
       Stories 2 à 5 : une seule et même valeur, pour que les « Q » se
       superposent exactement quand on tape d'une story à l'autre. On la calcule
       sur la hauteur moyenne des quatre blocs, de sorte que la série tombe au
       centre optique sans jamais y sacrifier l'alignement.
       Stories 1 et 6 : centrage optique individuel. */

    const questions = STORIES.filter((s) => s.layout === 'question');
    const hauteurs = [];
    for (const s of questions) {
      const m = await ecris(s, 600);
      hauteurs.push(m.contenu.bas - m.contenu.haut);
    }
    const moyenne = hauteurs.reduce((a, b) => a + b, 0) / hauteurs.length;
    const hautQuestions = Math.max(
      PLANCHER,
      Math.round(CENTRE_OPTIQUE - moyenne / 2)
    );
    console.log(
      `  Bloc des questions : hauteurs ${hauteurs.join(', ')}px → ` +
      `haut commun ${hautQuestions}px (« Q » alignés sur les 4)`
    );

    const hauts = {};
    for (const s of questions) hauts[s.n] = hautQuestions;

    for (const s of STORIES.filter((x) => x.layout === 'cases')) {
      const m = await ecris(s, 500);
      const hauteur = m.contenu.bas - m.contenu.haut;
      hauts[s.n] = Math.min(
        Math.max(Math.round(CENTRE_OPTIQUE - hauteur / 2), PLANCHER),
        limiteDe(s) - hauteur
      );
    }
    console.log('');

    /* --- 2. rendu et contrôles ------------------------------------------- */

    let reference = null;   // l'en-tête et le « Q » de la première story servent d'étalon

    for (const story of STORIES) {
      const limite = limiteDe(story);
      const m = await ecris(story, hauts[story.n]);

      // a. l'en-tête est-il rigoureusement le même partout ?
      const empreinte = `${m.entete.haut}/${m.titreHaut}/${m.pageHaut}/${m.filet}/${m.entete.gauche}`;
      if (reference === null) reference = { entete: empreinte };
      else if (empreinte !== reference.entete) {
        throw new Error(
          `Story ${story.n} : l'en-tête ne coïncide pas avec celui des autres ` +
          `(${empreinte} au lieu de ${reference.entete}).`
        );
      }

      // b. les « Q » se superposent-ils exactement ?
      if (m.q) {
        if (reference.q === undefined) reference.q = `${m.q.haut}/${m.q.gauche}`;
        else if (`${m.q.haut}/${m.q.gauche}` !== reference.q) {
          throw new Error(
            `Story ${story.n} : le « Q » est à ${m.q.haut}/${m.q.gauche} ` +
            `au lieu de ${reference.q} — la série perdrait son effet de calque.`
          );
        }
      }

      // c. le surligneur ressemble-t-il à un coup de stabilo ?
      for (const mk of m.marks) {
        if (mk.partDuCorps < 0.6 || mk.partDuCorps > 1.0) {
          throw new Error(
            `Story ${story.n} : la bande de « ${mk.mot} » fait ${mk.partDuCorps}× le corps ` +
            `(attendu entre 0.6 et 1.0) — ça ne se lit plus comme un stabilo.`
          );
        }
        if (mk.debord <= 0) {
          throw new Error(
            `Story ${story.n} : « ${mk.mot} » n'a pas de débord horizontal — ` +
            `le surlignage se lirait comme un fond de bouton.`
          );
        }
        if (mk.fragments !== 1) {
          throw new Error(
            `Story ${story.n} : « ${mk.mot} » est coupé en ${mk.fragments} fragments — ` +
            `la bande filerait jusqu'au bord de la colonne.`
          );
        }
        if (mk.largeur > 820) {
          throw new Error(
            `Story ${story.n} : « ${mk.mot} » fait ${mk.largeur}px de large et déborde ` +
            `la colonne de 820px.`
          );
        }
      }

      // d. la zone morte basse
      if (m.contenu.bas > limite) {
        throw new Error(
          `Story ${story.n} : le contenu descend à ${m.contenu.bas}px (limite ${limite}px).`
        );
      }

      const dst = join(OUT, `story-${story.n}.png`);
      await page.screenshot({ path: dst, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });

      // e. les dimensions, lues dans l'en-tête du fichier produit
      const png = readFileSync(dst);
      const [lx, ly] = [png.readUInt32BE(16), png.readUInt32BE(20)];
      if (lx !== W || ly !== H) throw new Error(`Story ${story.n} : export ${lx}×${ly}.`);

      // f. relecture du PNG : un seul accent, et rien sous la ligne
      const audit = await page.evaluate(
        AUDITE, `data:image/png;base64,${png.toString('base64')}`, limite
      );
      if (audit.nIntrus > 0) {
        const i = audit.intrus;
        throw new Error(
          `Story ${story.n} : ${audit.nIntrus} pixels d'une couleur qui n'est pas le ` +
          `surligneur — rgb(${i.R}, ${i.G}, ${i.B}) en ${i.x},${i.y}.`
        );
      }
      if (audit.sousLigne > 0) {
        throw new Error(
          `Story ${story.n} : ${audit.sousLigne} pixels sous la ligne des ${limite}px ` +
          `(le premier à ${audit.premierBas}px).`
        );
      }

      rapport.push({
        n: story.n, haut: hauts[story.n], ...m, limite, ...audit,
      });
      console.log(
        `  ✓ output/story-${story.n}.png — contenu ${m.contenu.haut}→${m.contenu.bas}px / ${limite}px` +
        (m.q ? `, « ${story.q} » à ${m.q.haut}px` : '') +
        `, bandes ${audit.bandes.join('/')}px, 0 couleur parasite`
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
    return `  <figure class="${s.n === TOTAL ? 'six' : ''}">
    <img src="output/story-${s.n}.png" alt="Story ${s.n}">
    <figcaption>${s.n}/${TOTAL} — contenu ${r.contenu?.haut}→${r.contenu?.bas}px${r.q ? ` · Q à ${r.q.haut}px` : ''}</figcaption>
  </figure>`;
  }).join('\n');

  writeFileSync(
    join(ROOT, 'preview.html'),
    `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — Le quiz LLC</title>
<style>
  body { background:#E8E8E4; color:#555; font:14px/1.6 ui-sans-serif,system-ui,sans-serif; margin:0; padding:40px; }
  h1 { color:#111; font-size:15px; font-weight:700; letter-spacing:4px; text-transform:uppercase; margin:0 0 6px; }
  p.sous { margin:0 0 32px; max-width:860px; }
  .planche { display:flex; flex-wrap:wrap; gap:28px; }
  figure { margin:0; flex:0 0 auto; position:relative; }
  img { width:320px; display:block; }
  figcaption { margin-top:10px; font-size:12px; letter-spacing:.06em; }
  /* repères : la ligne des « Q » sur les stories 2 à 5, et la limite basse */
  figure::before, figure::after {
    content:''; position:absolute; left:0; right:0; height:1px; pointer-events:none;
  }
  figure::before { top: calc(320px / 1080 * ${rapport.find((r) => r.q)?.q.haut ?? 600}); background:rgba(17,17,17,.22); }
  figure::after  { top: calc(320px / 1080 * 1620); background:rgba(220,38,38,.5); }
  figure.six::after { top: calc(320px / 1080 * 1450); }
</style>
</head>
<body>
  <h1>Le quiz LLC</h1>
  <p class="sous">Les 6 stories dans l'ordre de publication. Le filet gris marque la ligne où
  commence le « Q » géant — il doit passer exactement au même endroit sur les stories 2 à 5,
  c'est ce qui fait l'effet de calque quand on tape. Le filet rouge marque la limite basse :
  1620&nbsp;px partout, 1450&nbsp;px sur la story&nbsp;6 où la barre de commentaire vient se poser.</p>
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
