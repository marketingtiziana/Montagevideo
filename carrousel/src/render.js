/* ============================================================
   FYNOVATES — Rendu HTML -> PNG 1080x1350 (Playwright / Chromium)
   Usage : node src/render.js            (toutes les slides)
           node src/render.js 2 4        (seulement 02 et 04)
   ============================================================ */

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const slides = require('./slides.js');

const ROOT = path.join(__dirname, '..');
const W = 1080, H = 1350;

const pad2 = n => String(n).padStart(2, '0');

function html(slide, i) {
  const n = i + 1;
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates — slide ${pad2(n)}</title>
<link rel="stylesheet" href="../src/style.css">
</head>
<body>
<div class="slide">
  <div class="top"><span class="idx">${pad2(n)} / ${pad2(slides.length)}</span></div>
${slide.main}
  <div class="foot">
    <span>FYNOVATES</span>
    ${slide.extraFoot || ''}
    <span>@madame.caci</span>
  </div>
</div>
</body>
</html>`;
}

(async () => {
  const only = process.argv.slice(2).map(Number).filter(Boolean);

  fs.mkdirSync(path.join(ROOT, 'slides'), { recursive: true });
  fs.mkdirSync(path.join(ROOT, 'output'), { recursive: true });

  // 1) écriture des fichiers HTML (un par slide)
  slides.forEach((s, i) => {
    fs.writeFileSync(path.join(ROOT, 'slides', `slide-${pad2(i + 1)}.html`), html(s, i));
  });

  // 2) rendu headless
  // Chromium pré-installé dans l'environnement (pas de téléchargement)
  const CHROME = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  const browser = await chromium.launch(
    fs.existsSync(CHROME) ? { executablePath: CHROME } : {}
  );
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: 1
  });

  const report = [];

  for (let i = 0; i < slides.length; i++) {
    const n = i + 1;
    if (only.length && !only.includes(n)) continue;

    const file = path.join(ROOT, 'slides', `slide-${pad2(n)}.html`);
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);

    // --- contrôle de débordement dans la page ---
    const audit = await page.evaluate(() => {
      const out = { docW: document.documentElement.scrollWidth,
                    docH: document.documentElement.scrollHeight,
                    overflow: [] };
      const slide = document.querySelector('.slide');
      const box = slide.getBoundingClientRect();
      document.querySelectorAll('.slide *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        // sort du cadre 1080x1350 ?
        if (r.left < box.left - 0.5 || r.right > box.right + 0.5 ||
            r.top < box.top - 0.5 || r.bottom > box.bottom + 0.5) {
          out.overflow.push(`hors-cadre: <${el.tagName.toLowerCase()}> "${(el.textContent || '').trim().slice(0, 38)}"`);
        }
        // texte tronqué par son propre conteneur ?
        if (el.scrollHeight > el.clientHeight + 1 && getComputedStyle(el).overflow !== 'visible') {
          out.overflow.push(`tronqué: <${el.tagName.toLowerCase()}> "${(el.textContent || '').trim().slice(0, 38)}"`);
        }
      });
      // marge intérieure de 90px respectée par le contenu
      const inner = { l: box.left + 90, r: box.right - 90, t: box.top + 90, b: box.bottom - 90 };
      document.querySelectorAll('.slide > *').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.left < inner.l - 0.5 || r.right > inner.r + 0.5 ||
            r.top < inner.t - 0.5 || r.bottom > inner.b + 0.5) {
          out.overflow.push(`marge 90px: <${el.className}>`);
        }
      });
      return out;
    });

    const png = path.join(ROOT, 'output', `slide-${pad2(n)}.png`);
    await page.screenshot({ path: png, clip: { x: 0, y: 0, width: W, height: H } });

    // --- contrôle des dimensions réelles du PNG (en-tête IHDR) ---
    const buf = fs.readFileSync(png);
    const pw = buf.readUInt32BE(16), ph = buf.readUInt32BE(20);

    report.push({
      slide: pad2(n),
      png: `${pw}x${ph}`,
      dims_ok: pw === W && ph === H,
      dom_ok: audit.docW === W && audit.docH === H,
      issues: audit.overflow
    });
  }

  await browser.close();

  console.log('\n=== RENDU ===');
  let fail = 0;
  for (const r of report) {
    const ok = r.dims_ok && r.dom_ok && r.issues.length === 0;
    if (!ok) fail++;
    console.log(`slide-${r.slide}.png  ${r.png}  ${ok ? 'OK' : 'A CORRIGER'}`);
    r.issues.forEach(i => console.log(`   - ${i}`));
    if (!r.dom_ok) console.log('   - DOM hors 1080x1350');
  }
  console.log(fail ? `\n${fail} slide(s) à corriger.` : '\nToutes les slides rendues sont conformes.');
})();
