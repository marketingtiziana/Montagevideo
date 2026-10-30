/* ============================================================
   FYNOVATES — Rendu HTML -> PDF vectoriel (Playwright / Chromium)
   Usage : node src/pdf.js --deck hongkong
           node src/pdf.js                 (carrousel « salaire »)

   Un seul PDF, une page par slide, au format exact 1080x1350 px.
   Le texte reste du texte : vectoriel, selectionnable, imprimable
   a n'importe quelle taille sans perte.
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const di = argv.indexOf('--deck');
const DECK = di !== -1 ? argv[di + 1] : null;

const { DECOR, slides } = require(DECK ? `./slides-${DECK}.js` : './slides.js');
const CSS = DECK && fs.existsSync(path.join(__dirname, `style-${DECK}.css`)) ? `style-${DECK}.css` : 'style.css';

const ROOT = path.join(__dirname, '..');
const EXPORT = path.join(ROOT, 'export');
const W = 1080, H = 1350;
const pad2 = n => String(n).padStart(2, '0');

// Chromium pre-installe : la revision change d'un conteneur a l'autre
const findChrome = () => {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (!fs.existsSync(base)) return '';
  for (const d of fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().reverse()) {
    for (const sub of ['chrome-linux', 'chrome-linux64']) {
      const bin = path.join(base, d, sub, 'chrome');
      if (fs.existsSync(bin)) return bin;
    }
  }
  return '';
};

// un seul document : les slides empilees, une coupure de page entre chacune
const document = () => `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — ${DECK || 'salaire'}</title>
<link rel="stylesheet" href="src/${CSS}">
<style>
  /* la feuille des slides fige html/body a la taille d'une slide :
     pour un document de 9 pages il faut lui rendre sa hauteur */
  html, body { width: ${W}px; height: auto; overflow: visible; }
  /* en points, pour que Chromium n'arrondisse pas la conversion px -> pt */
  @page { size: ${W * 0.75}pt ${H * 0.75}pt; margin: 0; }
  .slide { break-after: page; page-break-after: always; }
  .slide:last-child { break-after: auto; page-break-after: auto; }
</style>
</head>
<body>
${slides.map((s, i) => `<div class="slide">
${DECOR}
  <div class="num">${pad2(i + 1)}</div>
${s.main}
</div>`).join('\n')}
</body>
</html>`.split('REL_TOKEN').join('.');

(async () => {
  fs.mkdirSync(EXPORT, { recursive: true });
  // le document vit a la racine du projet : les chemins src/ et assets/ y sont relatifs
  const tmp = path.join(ROOT, `.pdf-${DECK || 'salaire'}.html`);
  fs.writeFileSync(tmp, document());

  const CHROME = findChrome();
  const browser = await chromium.launch(CHROME ? { executablePath: CHROME } : {});
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto('file://' + tmp, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);

  const out = path.join(EXPORT, `carrousel-${DECK || 'salaire'}.pdf`);
  await page.pdf({ path: out, width: `${W}px`, height: `${H}px`,
                   margin: { top: 0, right: 0, bottom: 0, left: 0 },
                   printBackground: true, preferCSSPageSize: true });
  await browser.close();
  fs.rmSync(tmp, { force: true });

  // controle : nombre de pages et format reellement ecrits dans le PDF
  const buf = fs.readFileSync(out);
  const pages = (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  const mbox = (buf.toString('latin1').match(/\/MediaBox\s*\[([^\]]+)\]/) || [])[1];
  const ko = Math.round(buf.length / 1024);
  console.log(`${path.relative(ROOT, out)}  ${pages} pages  MediaBox [${(mbox || '?').trim()}]  ${ko} Ko`);
  if (pages !== slides.length) { console.error(`ATTENDU ${slides.length} pages`); process.exit(1); }
})();
