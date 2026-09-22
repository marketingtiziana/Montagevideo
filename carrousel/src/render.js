/* ============================================================
   FYNOVATES — Rendu HTML -> PNG 1080x1350 (Playwright / Chromium)
   Usage : node src/render.js            (les 9 slides)
           node src/render.js 1 2 4      (seulement 01, 02 et 04)
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
// Deck a rendre : --deck <nom>  (defaut : le carrousel « salaire »)
const argv = process.argv.slice(2);
const di = argv.indexOf('--deck');
const DECK = di !== -1 ? argv[di + 1] : null;
if (di !== -1) argv.splice(di, 2);

const { DECOR, slides } = require(DECK ? `./slides-${DECK}.js` : './slides.js');

const ROOT = path.join(__dirname, '..');
const SUB = DECK ? path.join('', DECK) : '';          // sous-dossier par deck
const REL = DECK ? '../..' : '..';                     // profondeur vers la racine du projet
const DIR_HTML = path.join(ROOT, 'slides', SUB);
const DIR_PNG  = path.join(ROOT, 'output', SUB);
const W = 1080, H = 1350, MARGIN = 80;

const pad2 = n => String(n).padStart(2, '0');

function html(slide, i) {
  const n = i + 1;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — slide ${pad2(n)}</title>
<link rel="stylesheet" href="REL_TOKEN/src/style.css">
</head>
<body>
<div class="slide">
${DECOR}
  <div class="num">${pad2(n)}</div>
${slide.main}
</div>
</body>
</html>`.split('REL_TOKEN').join(REL);
}

(async () => {
  const only = argv.map(Number).filter(Boolean);

  fs.mkdirSync(DIR_HTML, { recursive: true });
  fs.mkdirSync(DIR_PNG, { recursive: true });

  slides.forEach((s, i) => {
    fs.writeFileSync(path.join(DIR_HTML, `slide-${pad2(i + 1)}.html`), html(s, i));
  });

  // Chromium pré-installé dans l'environnement (pas de téléchargement)
  const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await chromium.launch(fs.existsSync(CHROME) ? { executablePath: CHROME } : {});
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });

  const report = [];

  for (let i = 0; i < slides.length; i++) {
    const n = i + 1;
    if (only.length && !only.includes(n)) continue;

    const file = path.join(DIR_HTML, `slide-${pad2(n)}.html`);
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    const audit = await page.evaluate(MARGIN => {
      const out = { docW: document.documentElement.scrollWidth,
                    docH: document.documentElement.scrollHeight,
                    issues: [] };
      const slide = document.querySelector('.slide');
      const box = slide.getBoundingClientRect();
      const label = el => (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 42);
      // `.bleed` (décor, photo détourée) : autorisé à sortir du cadre
      const bleeds = el => el.closest('.bleed') !== null;

      document.querySelectorAll('.slide *').forEach(el => {
        if (bleeds(el)) return;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        if (r.left < box.left - 0.5 || r.right > box.right + 0.5 ||
            r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5) {
          out.issues.push(`hors-cadre: <${el.tagName.toLowerCase()}> "${label(el)}"`);
        }
        if (el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflow !== 'visible') {
          out.issues.push(`tronqué: <${el.tagName.toLowerCase()}> "${label(el)}"`);
        }
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX !== 'visible') {
          out.issues.push(`débord horizontal: <${el.tagName.toLowerCase()}> "${label(el)}"`);
        }
      });

      // marges intérieures respectées par tout le contenu non-bleed
      const in_ = { l: box.left + MARGIN, r: box.right - MARGIN,
                    t: box.top + MARGIN,  b: box.bottom - MARGIN };
      document.querySelectorAll('.slide > *').forEach(el => {
        if (bleeds(el)) return;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        if (r.left < in_.l - 0.5 || r.right > in_.r + 0.5 ||
            r.top < in_.t - 0.5 || r.bottom > in_.b + 0.5) {
          out.issues.push(`marge ${MARGIN}px: .${el.className.split(' ')[0]} "${label(el)}"`);
        }
      });
      return out;
    }, MARGIN);

    const png = path.join(DIR_PNG, `slide-${pad2(n)}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: W, height: H } });

    const buf = fs.readFileSync(png);
    report.push({
      slide: pad2(n),
      png: `${buf.readUInt32BE(16)}x${buf.readUInt32BE(20)}`,
      dims_ok: buf.readUInt32BE(16) === W && buf.readUInt32BE(20) === H,
      dom_ok: audit.docW === W && audit.docH === H,
      issues: audit.issues
    });
  }

  await browser.close();

  console.log('\n=== RENDU ===');
  let fail = 0;
  for (const r of report) {
    const ok = r.dims_ok && r.dom_ok && r.issues.length === 0;
    if (!ok) fail++;
    console.log(`slide-${r.slide}.png  ${r.png}  ${ok ? 'OK' : 'A CORRIGER'}`);
    [...new Set(r.issues)].forEach(i => console.log(`   - ${i}`));
    if (!r.dom_ok) console.log('   - DOM hors 1080x1350');
  }
  console.log(fail ? `\n${fail} slide(s) à corriger.` : '\nToutes les slides rendues sont conformes.');
})();
