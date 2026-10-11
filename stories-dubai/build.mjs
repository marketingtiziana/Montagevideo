#!/usr/bin/env node
/**
 * Fynovates — « Dubaï, le stress test »
 *
 * Compose les 6 stories en HTML/CSS puis les exporte en PNG 1080×1920 exactement
 * via Puppeteer, et produit la page de validation preview.html.
 *
 *   node build.mjs
 *
 * Entrées : backgrounds/bg-1.jpg … bg-6.jpg + src/story.css + src/content.js
 * Sorties : src/story-N.html   une page HTML par story
 *           output/story-N.png les 6 visuels finaux
 *           output/*.zip       les 6 PNG en une archive, pour les récupérer d'un coup
 *           preview.html       les 6 côte à côte pour validation
 *
 * Cinq contrôles bloquants à chaque build :
 *   1. rien au-dessus de la ligne des 160 px ;
 *   2. rien sous la ligne des 1620 px (zone des stickers) ;
 *   3. la pagination est géométriquement identique sur les six ;
 *   4. chaque couleur de texte atteint WCAG 2.1 AA sur son fond réel ;
 *   5. l'export fait 1080×1920 exactement.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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
const ARCHIVE = 'fynovates-dubai-stress-test.zip';
const LIGNE_HAUT = 160;   // rien au-dessus
const LIGNE_BAS = 1620;   // 1920 − 300, rien en dessous

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
 *   - apostrophe typographique U+2019 à la place de l'apostrophe droite ;
 *   - espace fine insécable comme séparateur de milliers, sinon un montant
 *     se coupe en fin de ligne et se lit en deux morceaux.
 */
const typo = (t) =>
  t.replace(/«\s/g, '« ')
   .replace(/\s»/g, ' »')
   .replace(/\s([?!;:%])/g, ' $1')
   .replace(/'/g, '’')
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

  const accroche = story.accroche
    ? `        <p class="accroche">${rich(story.accroche)}</p>\n`
    : '';

  // le relevé chiffré de la story 2
  const releve = story.chiffres
    ? `        <div class="releve">\n` +
      story.chiffres.map((c) =>
        `          <div class="ligne">` +
        `<span class="valeur">${rich(c.valeur)}</span>` +
        `<span class="legende">${rich(c.legende)}</span>` +
        `</div>`
      ).join('\n') +
      `\n        </div>\n`
    : '';

  const corps = story.corps.map((p) => `        <p class="corps">${rich(p)}</p>`).join('\n');

  const cta = story.cta
    ? `\n        <div class="cta">${escapeHtml(story.cta)}</div>` +
      `\n        <p class="consigne">${rich(story.consigne)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — Dubaï ${story.n} / ${TOTAL}</title>
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

    <!-- couche 3 : pagination -->
    <div class="compteur">${story.n}/${TOTAL}</div>

    <!-- couche 3 : le texte -->
    <div class="contenu">
${accroche}${releve}${corps}${cta}
    </div>

  </div>
</body>
</html>
`;
}

/* --------------------------------------------------------------- contrôles */

const SELECTEURS_TEXTE =
  '.compteur, .accroche, .corps, .valeur, .legende, .cta, .consigne';

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

/** Empreinte géométrique de la pagination, comparée d'une story à l'autre. */
const MESURE_ENTETE = () => {
  const n = document.querySelector('.compteur');
  const r = n.getBoundingClientRect();
  const st = getComputedStyle(n);
  return {
    top: Math.round(r.top * 100) / 100,
    hauteur: Math.round(r.height * 100) / 100,
    // la pagination est calée sur la marge droite : c'est son bord droit qui compte
    droite: Math.round((1080 - r.right) * 100) / 100,
    taille: st.fontSize,
    graisse: st.fontWeight,
    interlettre: st.letterSpacing,
  };
};

/** Colonne de départ des légendes du relevé chiffré, pour les comparer. */
const MESURE_RELEVE = () => {
  const l = [...document.querySelectorAll('.legende')];
  if (!l.length) return null;
  // scrollWidth est écrêté sur un item flex : il rend la largeur de la colonne
  // et non celle du texte. On mesure donc la largeur naturelle en passant
  // l'élément en max-content le temps du relevé.
  const debordements = [];
  for (const n of document.querySelectorAll('.valeur')) {
    const colonne = n.getBoundingClientRect().width;
    const flex = n.style.flex;
    n.style.flex = '0 0 max-content';
    const naturelle = n.getBoundingClientRect().width;
    n.style.flex = flex;
    if (naturelle > colonne + 0.5) {
      debordements.push(`${n.textContent} (${Math.ceil(naturelle)}px dans ${colonne}px)`);
    }
  }
  return {
    gauches: l.map((n) => Math.round(n.getBoundingClientRect().left * 100) / 100),
    debordements,
  };
};

/** Distance du bloc CODEX au bas du cadre, pour le relevé. */
const MESURE_CTA = () => {
  const n = document.querySelector('.cta');
  if (!n) return null;
  const r = n.getBoundingClientRect();
  return { sousLeCadre: Math.round(1920 - r.bottom) };
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

      if (bornes.haut < LIGNE_HAUT) {
        throw new Error(
          `Story ${story.n} : du texte monte à ${bornes.haut}px, au-dessus de la ligne ` +
          `des ${LIGNE_HAUT}px — bloc « ${bornes.coupableHaut} ».`
        );
      }
      if (bornes.bas > LIGNE_BAS) {
        throw new Error(
          `Story ${story.n} : le texte descend à ${bornes.bas}px, au-delà de la ligne ` +
          `des ${LIGNE_BAS}px — bloc « ${bornes.coupableBas} ».`
        );
      }

      const entete = await page.evaluate(MESURE_ENTETE);
      const cta = await page.evaluate(MESURE_CTA);
      const releve = await page.evaluate(MESURE_RELEVE);

      // contrôle 3 bis : le relevé chiffré tient dans sa colonne et ses trois
      // légendes démarrent exactement au même x — sinon le tableau se déforme
      if (releve) {
        if (releve.debordements.length) {
          throw new Error(
            `Story ${story.n} : la valeur ${releve.debordements.join(', ')} déborde de sa ` +
            `colonne et décale sa légende. Élargir .valeur ou réduire son corps.`
          );
        }
        const [ref, ...autres] = releve.gauches;
        if (autres.some((g) => g !== ref)) {
          throw new Error(
            `Story ${story.n} : les légendes du relevé ne partent pas de la même colonne ` +
            `(${releve.gauches.join(', ')}).`
          );
        }
      }

      // passe « fond seul » : le texte masqué, les dégradés et la photo intacts
      await page.addStyleTag({
        content: '.contenu, .compteur { visibility: hidden !important; }',
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

      rapport.push({ n: story.n, layout: story.layout, ...bornes, entete, cta, releve, contraste });
      console.log(
        `  ✓ output/story-${story.n}.png — texte ${bornes.haut}→${bornes.bas}px ` +
        `(limite ${LIGNE_BAS}), contraste min ${contraste.ratio}:1 ` +
        `(seuil ${contraste.seuil}, « ${contraste.selecteur} »)` +
        (releve ? `, légendes à x=${releve.gauches[0]}` : '') +
        (cta ? `, CODEX à ${cta.sousLeCadre}px du bas` : '')
      );
    }
  } finally {
    await browser.close();
  }

  /* ---- contrôle 3 : la même pagination sur les six ---------------------- */
  const ref = JSON.stringify(rapport[0].entete);
  for (const r of rapport.slice(1)) {
    if (JSON.stringify(r.entete) !== ref) {
      throw new Error(
        `La pagination diffère entre les stories ${rapport[0].n} et ${r.n} :\n` +
        `  ${ref}\n  ${JSON.stringify(r.entete)}`
      );
    }
  }
  console.log(
    `  ✓ pagination identique sur les 6 — y=${rapport[0].entete.top}, ` +
    `marge droite ${rapport[0].entete.droite}px`
  );

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

  archive(rapport);
  preview(rapport);
  return rapport;
}

/**
 * Les 6 PNG en une archive, pour les récupérer d'un seul téléchargement.
 *
 * Les PNG sont déjà compressés : l'archive ne les réduit quasiment pas et ne
 * les réencode surtout pas — c'est un contenant, pas une conversion. La qualité
 * livrée est donc exactement celle des fichiers de output/.
 */
function archive(rapport) {
  const dst = join(OUT, ARCHIVE);
  rmSync(dst, { force: true });          // zip ajoute à l'existant, il faut repartir à zéro
  execFileSync(
    'zip',
    // -j : pas d'arborescence dans l'archive — les 6 PNG à la racine
    // -X : pas d'attributs de fichier superflus
    ['-j', '-q', '-X', dst, ...rapport.map((r) => join(OUT, `story-${r.n}.png`))],
    { stdio: 'inherit' },
  );
  const ko = Math.round(statSync(dst).size / 1024);
  console.log(`  ✓ output/${ARCHIVE} — les ${rapport.length} PNG, ${ko} ko`);
}

function preview(rapport) {
  const ECHELLE = 320 / W;
  const TITRES = {
    ouverture: 'Ouverture',
    chiffres: 'Le relevé',
    corps: 'Démonstration',
    cta: 'CTA CODEX',
  };
  const cartes = STORIES.map((s) => {
    const r = rapport.find((x) => x.n === s.n);
    return `  <figure>
    <img src="output/story-${s.n}.png" alt="Story ${s.n} — ${TITRES[s.layout]}">
    <figcaption>${s.n}/${TOTAL} · ${TITRES[s.layout]}<br><span>texte ${r.haut}→${r.bas}px · AA ${r.contraste.ratio}:1 · ${r.poids} ko</span></figcaption>
  </figure>`;
  }).join('\n');

  writeFileSync(
    join(ROOT, 'preview.html'),
    `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — Dubaï, le stress test</title>
<style>
  :root { color-scheme: dark; --ech: ${ECHELLE}; }
  body { background:#0B0E16; color:#9CA3AF; font:14px/1.6 ui-sans-serif,system-ui,sans-serif; margin:0; padding:40px; }
  h1 { color:#D4AF37; font-size:15px; font-weight:700; letter-spacing:4px; text-transform:uppercase; margin:0 0 6px; }
  p.sous { margin:0 0 26px; max-width:820px; }
  .planche { display:flex; flex-wrap:wrap; gap:28px; padding-bottom:24px; }
  figure { margin:0; flex:0 0 auto; position:relative; }
  img { width:320px; display:block; border-radius:8px; box-shadow:0 8px 40px rgba(0,0,0,.5); }
  figcaption { margin-top:10px; font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#E5E7EB; }
  figcaption span { letter-spacing:0; text-transform:none; color:#6B7280; }

  /* Repères de grille superposés au visuel, pour vérifier les zones mortes
     d'un seul coup d'œil. */
  .repere { position:absolute; left:0; width:320px; height:1px; pointer-events:none;
            background:rgba(212,175,55,.55); }
  .r-haut { top:calc(160px  * var(--ech)); }
  .r-bas  { top:calc(1620px * var(--ech)); }
  .legende { margin:0 0 26px; font-size:12px; }
  .pastille { display:inline-block; width:22px; height:2px; vertical-align:middle; margin-right:7px; background:#D4AF37; }
</style>
</head>
<body>
  <h1>Dubaï, le stress test</h1>
  <p class="sous">Les 6 stories dans l'ordre de publication. Même grading, même grille,
  même pagination. Les repères sont posés à l'échelle&nbsp;: aucun texte ne les franchit.</p>
  <p class="legende"><i class="pastille"></i><b>160&nbsp;px / 1620&nbsp;px</b> — zones mortes des stickers Instagram</p>
  <div class="planche">
${cartes}
  </div>
  <script>
    // les repères sont injectés plutôt qu'écrits six fois dans le HTML
    for (const f of document.querySelectorAll('figure')) {
      for (const c of ['r-haut', 'r-bas']) {
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
