#!/usr/bin/env node
/**
 * Fynovates — « Les 3 phrases de fin d'appel »
 *
 * Compose les 6 stories en HTML/CSS puis les exporte en PNG 1080x1920 exactement
 * via Puppeteer.
 *
 *   node build.mjs
 *
 * Entrées  : backgrounds/bg-1.png … bg-6.png  +  src/story.css  +  src/content.js
 * Sorties  : out/story-1.png … story-6.png
 *            src/story-1.html … story-6.html  (sources HTML conservées)
 *            out/planche-contact.html         (relecture des 6 côte à côte)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import puppeteer from 'puppeteer-core';
import { STORIES, TOTAL } from './src/content.js';

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, 'src');
const BG = join(ROOT, 'backgrounds');
const OUT = join(ROOT, 'out');

const W = 1080;
const H = 1920;

/* ------------------------------------------------------------------ rendu */

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** **gras** → <b>, {{doré}} → <em>, [[rouge]] → <i>. Le reste est échappé. */
function rich(text) {
  const re = /\*\*(.+?)\*\*|\{\{(.+?)\}\}|\[\[(.+?)\]\]/gs;
  let out = '';
  let pos = 0;
  for (const m of text.matchAll(re)) {
    out += escapeHtml(text.slice(pos, m.index));
    if (m[1] !== undefined) out += `<b>${escapeHtml(m[1])}</b>`;
    else if (m[2] !== undefined) out += `<em>${escapeHtml(m[2])}</em>`;
    else out += `<i>${escapeHtml(m[3])}</i>`;
    pos = m.index + m[0].length;
  }
  return out + escapeHtml(text.slice(pos));
}

function findChrome() {
  const candidates = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    '/opt/pw-browsers/chromium/chrome-linux/chrome',
    process.env.CHROME_PATH,
  ].filter(Boolean);
  for (const c of candidates) if (existsSync(c)) return c;
  // dernier recours : premier chromium trouvé sous /opt/pw-browsers
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
  const fonts = readFileSync(join(SRC, 'inter', 'inter-google.css'), 'utf8');
  const css = readFileSync(join(SRC, 'story.css'), 'utf8');

  const blocks = story.blocks
    .map((b) =>
      b.type === 'cta'
        ? `      <div class="cta">${rich(b.text)}</div>`
        : `      <p class="${b.type}">${rich(b.text)}</p>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — story ${story.n}/${TOTAL}</title>
<!-- Inter (Google Fonts), vendorisé dans src/inter/ pour un rendu déterministe hors ligne -->
<style>
${fonts}
${css}
</style>
</head>
<body>
  <div class="story">
    <img class="photo" src="../backgrounds/${story.bg}" alt="">
    <div class="scrim"></div>
    <div class="content">
      <span class="count">${story.n}/${TOTAL}</span>
      <div class="bloc">
${blocks}
      </div>
    </div>
  </div>
</body>
</html>
`;
}

/* -------------------------------------------------------------- contrôles */

/** Vérifie qu'aucun contenu ne descend dans les 280 px du bas. */
const CHECK_SAFE_BOTTOM = () => {
  const limit = 1920 - 280;
  const nodes = document.querySelectorAll('.bloc > *, .count');
  let lowest = 0;
  let culprit = null;
  for (const n of nodes) {
    const b = n.getBoundingClientRect().bottom;
    if (b > lowest) { lowest = b; culprit = n.className; }
  }
  return { lowest: Math.round(lowest), limit, ok: lowest <= limit, culprit };
};

/* ---------------------------------------------------------------- exécution */

async function main() {
  mkdirSync(OUT, { recursive: true });

  const missing = STORIES.filter((s) => !existsSync(join(BG, s.bg)));
  if (missing.length) {
    console.error(
      `Photos manquantes dans backgrounds/ : ${missing.map((s) => s.bg).join(', ')}\n` +
      `Voir prompts-higgsfield.md puis relancer.`
    );
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    args: ['--no-sandbox', '--disable-gpu', '--font-render-hinting=none'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });

    for (const story of STORIES) {
      const file = join(SRC, `story-${story.n}.html`);
      writeFileSync(file, html(story), 'utf8');

      await page.goto(`file://${file}`, { waitUntil: 'networkidle0' });
      await page.evaluate(() => document.fonts.ready);

      const safe = await page.evaluate(CHECK_SAFE_BOTTOM);
      if (!safe.ok) {
        throw new Error(
          `Story ${story.n} : le contenu descend à ${safe.lowest}px (limite ${safe.limit}px) — bloc « ${safe.culprit} ».`
        );
      }

      const dst = join(OUT, `story-${story.n}.png`);
      await page.screenshot({ path: dst, type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
      console.log(`  ✓ out/story-${story.n}.png — bas du contenu ${safe.lowest}px / ${safe.limit}px`);
    }
  } finally {
    await browser.close();
  }

  contactSheet();
}

function contactSheet() {
  const cards = STORIES.map(
    (s) =>
      `<figure><img src="story-${s.n}.png" alt="Story ${s.n}"><figcaption>${s.n}/${TOTAL}</figcaption></figure>`
  ).join('\n');

  writeFileSync(
    join(OUT, 'planche-contact.html'),
    `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8">
<title>Fynovates — Les 3 phrases de fin d'appel</title>
<style>body{background:#111;color:#bbb;font:14px/1.5 system-ui;margin:0;padding:32px}
h1{font-size:15px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:#D4AF37;margin:0 0 28px}
.grid{display:flex;gap:20px;overflow-x:auto;padding-bottom:16px}
figure{margin:0;flex:0 0 auto}img{width:300px;display:block;border-radius:6px}
figcaption{margin-top:8px;letter-spacing:.14em;font-size:12px}</style></head>
<body><h1>Fynovates — Les 3 phrases de fin d'appel</h1>
<div class="grid">${cards}</div></body></html>
`,
    'utf8'
  );
  console.log('  ✓ out/planche-contact.html');
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
