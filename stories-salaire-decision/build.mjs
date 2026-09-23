#!/usr/bin/env node
/**
 * Fynovates — « Ton salaire est une décision »
 *
 * Compose les 6 stories en HTML/CSS puis les exporte en PNG 1080 × 1920
 * exactement via Puppeteer.
 *
 *   node build.mjs
 *
 * Entrées : illustrations/illu-1.png … illu-6.png  +  src/story.css  +  src/content.js
 * Sorties : output/story-1.png … story-6.png
 *           src/story-1.html … story-6.html   (sources, regénérées à chaque build)
 *           preview.html                      (les 6 en planche)
 *
 * Le build ne livre pas tant que quatre contrôles ne passent pas :
 *   1. le fond de chaque illustration est du blanc PUR et rien n'est coloré ;
 *   2. l'illustration tient dans la bande 220 → 850px ;
 *   3. rien ne descend sous 1620px (sous 900px pour la story 6) ;
 *   4. l'export fait 1080 × 1920 pixels exactement.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { STORIES, TOTAL } from './src/content.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const ILLU = join(ROOT, 'illustrations');
const OUT = join(ROOT, 'output');

const W = 1080;
const H = 1920;

const HAUT = 220;            // l'illustration ne commence jamais plus haut
const BANDE_BASSE = 850;     // ni ne descend plus bas
const ZONE_BASSE = 300;      // stickers Instagram
const LIMITE = H - ZONE_BASSE;       // 1620
const LIMITE_STORY6 = 900;           // la moitié basse reste au sondage
const GOUTTIERE = 96;

const TAILLES = [600, 580, 560, 540, 520, 500, 480, 460]; // tailles d'illustration candidates
const OCCUPATION = 0.94;  // part du cadre carré occupée par le dessin, identique sur les 6

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

/* ------------------------------------------------- nettoyage des illustrations */

/**
 * Ramène une illustration au noir et blanc pur.
 *
 * Higgsfield rend rarement un blanc exactement #FFFFFF : il reste un voile
 * beige ou gris très clair qui, posé sur le blanc pur de la story, dessine un
 * carré visible. On désature (donc plus aucune couleur), on écrase tout ce qui
 * est au-dessus du seuil sur du blanc pur, et on réétale le reste pour que les
 * traits gardent leur densité et leur anticrénelage.
 *
 * Tourne dans la page : c'est le canvas de Chromium qui fait le travail.
 */
const NETTOIE = async (dataUri, seuil, occupation) => {
  const img = new Image();
  img.src = dataUri;
  await img.decode();

  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);

  const d = ctx.getImageData(0, 0, c.width, c.height);
  const px = d.data;

  // État avant nettoyage, mesuré sur le pourtour de l'image.
  const bord = [];
  const pas = 4;
  for (let x = 0; x < c.width; x += pas) {
    for (const y of [0, c.height - 1]) bord.push((y * c.width + x) * 4);
  }
  for (let y = 0; y < c.height; y += pas) {
    for (const x of [0, c.width - 1]) bord.push((y * c.width + x) * 4);
  }
  let minBord = 255;
  let teinteAvant = 0;
  for (const i of bord) {
    const [r, g, b] = [px[i], px[i + 1], px[i + 2]];
    minBord = Math.min(minBord, r, g, b);
    teinteAvant = Math.max(teinteAvant, Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  }

  let encre = 0;
  for (let i = 0; i < px.length; i += 4) {
    // Désaturation : luminance perçue.
    const l = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
    let v;
    if (l >= seuil) {
      v = 255;                                  // fond → blanc pur
    } else {
      v = Math.max(0, Math.round((l * 255) / seuil)); // trait → réétalé
      if (v < 128) encre++;
    }
    px[i] = px[i + 1] = px[i + 2] = v;
    px[i + 3] = 255;
  }
  ctx.putImageData(d, 0, 0);

  // État après nettoyage, sur le même pourtour.
  const d2 = ctx.getImageData(0, 0, c.width, c.height).data;
  let minApres = 255;
  for (const i of bord) minApres = Math.min(minApres, d2[i]);

  // --- recadrage : boîte englobante de l'encre --------------------------
  // Higgsfield cadre chaque dessin à sa guise : l'un flotte en haut à gauche,
  // l'autre remplit le carré. Posés à la même taille dans six stories, ils
  // n'auraient ni la même échelle apparente ni le même centre. On recadre donc
  // sur l'encre, puis on repose le dessin au centre d'un carré dont le côté est
  // calculé pour que l'encre occupe toujours la même part du cadre.
  let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
  for (let y = 0; y < c.height; y++) {
    for (let x = 0; x < c.width; x++) {
      if (d2[(y * c.width + x) * 4] < 200) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  if (x1 < 0) throw new Error('image vide : aucune encre détectée');

  const bw = x1 - x0 + 1;
  const bh = y1 - y0 + 1;
  const cote = Math.round(Math.max(bw, bh) / occupation);

  const carre = document.createElement('canvas');
  carre.width = cote;
  carre.height = cote;
  const cx = carre.getContext('2d');
  cx.fillStyle = '#FFFFFF';
  cx.fillRect(0, 0, cote, cote);
  cx.drawImage(
    c, x0, y0, bw, bh,
    Math.round((cote - bw) / 2), Math.round((cote - bh) / 2), bw, bh
  );

  return {
    uri: carre.toDataURL('image/png'),
    largeur: c.width,
    hauteur: c.height,
    minBordAvant: minBord,
    teinteAvant,
    minBordApres: minApres,
    boite: `${bw}×${bh}`,
    cadre: cote,
    // part de pixels franchement noirs : le proxy d'épaisseur de trait
    encre: +((encre / (c.width * c.height)) * 100).toFixed(2),
  };
};

/* ------------------------------------------------------------------ rendu */

const gouttiereDe = (s) => s.espace?.gouttiere ?? GOUTTIERE;

function html(story, uriIllu, tailleIllu, hautIllu) {
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
:root {
  --illu-taille: ${tailleIllu}px;
  --illu-haut: ${hautIllu}px;
  --gouttiere: ${gouttiereDe(story)}px;
}${story.espace?.interligne ? `
.accroche + .corps { margin-top: ${story.espace.interligne}px; }` : ''}
</style>
</head>
<body>
  <div class="story story--${story.layout}">
    <span class="numero">${story.n}/${TOTAL}</span>
    <img class="illustration" src="${uriIllu}" alt="">
    <div class="texte">
      <p class="accroche">${rich(story.accroche)}</p>
${corps}
    </div>
  </div>
</body>
</html>
`;
}

/** Mesure, dans la page rendue, la géométrie réelle des deux blocs. */
const MESURE = () => {
  const illu = document.querySelector('.illustration').getBoundingClientRect();
  const texte = document.querySelector('.texte').getBoundingClientRect();
  return {
    illuHaut: Math.round(illu.top),
    illuBas: Math.round(illu.bottom),
    texteHaut: Math.round(texte.top),
    texteBas: Math.round(texte.bottom),
    texteHauteur: Math.round(texte.height),
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

  const manquantes = STORIES.filter((s) => !existsSync(join(ILLU, s.illu)));
  if (manquantes.length) {
    console.error(
      `Illustrations manquantes dans illustrations/ : ${manquantes.map((s) => s.illu).join(', ')}\n` +
      `Voir prompts-higgsfield.md, déposer les PNG, puis relancer.`
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
    await page.goto('about:blank');

    /* --- 1. nettoyage + contrôle du blanc ------------------------------- */

    const propres = {};
    console.log('  Nettoyage des illustrations (désaturation + blanc pur)');
    for (const story of STORIES) {
      const brut = 'data:image/png;base64,' +
        readFileSync(join(ILLU, story.illu)).toString('base64');
      const r = await page.evaluate(NETTOIE, brut, 240, OCCUPATION);

      if (r.minBordApres !== 255) {
        throw new Error(
          `${story.illu} : le pourtour n'est pas blanc pur après nettoyage ` +
          `(minimum ${r.minBordApres}/255). Baisser le seuil ou régénérer l'image.`
        );
      }
      propres[story.n] = r.uri;
      rapport.push({
        n: story.n,
        source: `${r.largeur}×${r.hauteur}`,
        fondAvant: r.minBordAvant,
        teinteAvant: r.teinteAvant,
        encre: r.encre,
      });
      console.log(
        `    illu-${story.n} ${r.largeur}×${r.hauteur} — fond d'origine ${r.minBordAvant}/255 ` +
        `(teinte ${r.teinteAvant}) → 255/255, encre ${r.encre}%, ` +
        `dessin ${r.boite} recadré sur ${r.cadre}×${r.cadre}`
      );
    }

    /* --- 2. taille d'illustration : la plus grande qui tienne ------------ */

    const limiteDe = (s) => (s.layout === 'centre' ? LIMITE_STORY6 : LIMITE);

    const maxParStory = {};
    for (const story of STORIES) {
      let retenue = null;
      for (const t of TAILLES) {
        const f = join(SRC, `story-${story.n}.html`);
        writeFileSync(f, html(story, propres[story.n], t, HAUT), 'utf8');
        await page.goto(`file://${f}`, { waitUntil: 'networkidle0' });
        await page.evaluate(() => document.fonts.ready);
        const m = await page.evaluate(MESURE);
        if (m.texteBas <= limiteDe(story) && m.illuBas <= BANDE_BASSE) { retenue = t; break; }
      }
      if (retenue === null) {
        throw new Error(
          `Story ${story.n} : le texte ne tient pas sous ${limiteDe(story)}px même avec ` +
          `l'illustration à ${TAILLES[TAILLES.length - 1]}px. Raccourcir le texte.`
        );
      }
      maxParStory[story.n] = retenue;
    }

    // Les stories 1 à 5 partagent une seule taille — la série doit être homogène.
    // La story 6 est l'exception assumée du brief (phrase centrée, moitié basse vide).
    const communes = STORIES.filter((s) => s.layout !== 'centre').map((s) => maxParStory[s.n]);
    const tailleSerie = Math.min(...communes);
    console.log(
      `\n  Illustration : ${tailleSerie}px sur les stories 1 à 5 ` +
      `(la plus grande taille commune qui tienne), ${maxParStory[6]}px sur la story 6`
    );

    /* --- 3. rendu final ------------------------------------------------- */

    console.log('');
    for (const story of STORIES) {
      const taille = story.layout === 'centre' ? maxParStory[6] : tailleSerie;
      const limite = limiteDe(story);

      // Placement au centre optique, borné par la bande imposée à l'illustration.
      const f = join(SRC, `story-${story.n}.html`);
      writeFileSync(f, html(story, propres[story.n], taille, HAUT), 'utf8');
      await page.goto(`file://${f}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      const sonde = await page.evaluate(MESURE);

      const groupe = taille + gouttiereDe(story) + sonde.texteHauteur;
      const haut = Math.min(
        Math.max(Math.round((limite - groupe) / 2), HAUT),
        BANDE_BASSE - taille
      );

      writeFileSync(f, html(story, propres[story.n], taille, haut), 'utf8');
      await page.goto(`file://${f}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);
      const m = await page.evaluate(MESURE);

      if (m.illuHaut < HAUT || m.illuBas > BANDE_BASSE) {
        throw new Error(
          `Story ${story.n} : l'illustration sort de la bande ${HAUT}–${BANDE_BASSE}px ` +
          `(${m.illuHaut} → ${m.illuBas}).`
        );
      }
      if (m.texteBas > limite) {
        throw new Error(
          `Story ${story.n} : le texte descend à ${m.texteBas}px (limite ${limite}px).`
        );
      }

      const dst = join(OUT, `story-${story.n}.png`);
      await page.screenshot({ path: dst, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });

      const png = readFileSync(dst);
      const [lx, ly] = [png.readUInt32BE(16), png.readUInt32BE(20)];
      if (lx !== W || ly !== H) throw new Error(`Story ${story.n} : export ${lx}×${ly}.`);

      // Relecture du PNG livré : aucune couleur, aucune encre sous la ligne.
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

      const ligne = rapport.find((r) => r.n === story.n);
      Object.assign(ligne, { taille, ...m, limite, ...audit });
      console.log(
        `  ✓ output/story-${story.n}.png — illustration ${taille}px à ${m.illuHaut}→${m.illuBas}px, ` +
        `texte ${m.texteHaut}→${m.texteBas}px / ${limite}px, ` +
        `${audit.partBlanche}% de blanc pur, teinte ${audit.teinte}`
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
    return `  <figure class="${s.layout === 'centre' ? 'six' : ''}">
    <img src="output/story-${s.n}.png" alt="Story ${s.n}">
    <figcaption>${s.n}/${TOTAL} — illustration ${r.taille}px · texte jusqu'à ${r.texteBas}px · encre ${r.encre}%</figcaption>
  </figure>`;
  }).join('\n');

  writeFileSync(
    join(ROOT, 'preview.html'),
    `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — Ton salaire est une décision</title>
<style>
  body { background:#F4F4F5; color:#555; font:14px/1.6 ui-sans-serif,system-ui,sans-serif; margin:0; padding:40px; }
  h1 { color:#111; font-size:15px; font-weight:700; letter-spacing:4px; text-transform:uppercase; margin:0 0 6px; }
  p.sous { margin:0 0 32px; max-width:820px; }
  .planche { display:flex; flex-wrap:wrap; gap:28px; }
  figure { margin:0; flex:0 0 auto; position:relative; }
  img { width:320px; display:block; border:1px solid #E4E4E7; }
  figcaption { margin-top:10px; font-size:12px; letter-spacing:.06em; }
  /* repères : la bande de l'illustration, et la ligne basse à ne pas franchir */
  figure::before, figure::after {
    content:''; position:absolute; left:0; right:0; height:1px; pointer-events:none;
  }
  figure::before { top: calc(320px / 1080 * 220); background:rgba(17,17,17,.18); }
  figure::after  { top: calc(320px / 1080 * 1620); background:rgba(220,38,38,.45); }
  figure.six::after { top: calc(320px / 1080 * 900); }
</style>
</head>
<body>
  <h1>Ton salaire est une décision</h1>
  <p class="sous">Les 6 stories dans l'ordre de publication. Le filet gris marque la ligne des
  220&nbsp;px où commence l'illustration ; le filet rouge, la limite basse — 1620&nbsp;px partout,
  900&nbsp;px sur la story&nbsp;6 où la moitié basse est réservée au sticker sondage.</p>
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
