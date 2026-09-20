/**
 * build.js
 * Exporte slides/slide-01..16.html en PNG 1080x1350.
 *
 * Rendu Playwright en 1080x1350 @ deviceScaleFactor 2 (soit 2160x2700 retina),
 * puis downscale Lanczos en 1080x1350 via sharp.
 *
 * Auto-ajustement : si le corps deborde, la taille est reduite par paliers de 2px
 * jusqu'au minimum declare (26px). En dessous, le build signale la slide au lieu
 * de tronquer (aucun texte n'est coupe, le rapport final liste les slides en cause).
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const sharp = require('sharp');
const { PROVISOIRE } = require('./content/slides.js');

/** Chromium pre-installe de l'environnement, sinon celui de Playwright. */
function chromePath() {
  const candidates = [
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    process.env.CHROME_PATH
  ].filter(Boolean);
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return undefined; // laisse Playwright resoudre son propre binaire
}

const W = 1080, H = 1350, SCALE = 2;
const SRC = path.join(__dirname, 'slides');
const OUT = path.join(__dirname, 'output', 'carousel-moyen-orient');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(SRC).filter(f => /^slide-\d{2}\.html$/.test(f)).sort();
  if (!files.length) throw new Error('Aucune slide trouvee dans slides/ . Lancer d abord : node gen-slides.js');

  const browser = await chromium.launch({ executablePath: chromePath() });
  const page = await browser.newPage({
    viewport: { width: W, height: H },
    deviceScaleFactor: SCALE
  });

  const report = [];

  for (const f of files) {
    await page.goto('file://' + path.join(SRC, f), { waitUntil: 'networkidle' });

    // polices + images totalement pretes avant capture
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    });

    // auto-ajustement de la mise en page
    const fit = await page.evaluate(() => {
      const slide = document.querySelector('.slide');
      const tpl = slide.dataset.tpl;
      const out = { size: null, base: null, min: null, overflow: false, titleLines: null, banner: null };

      /* Gabarit A : le titre de couverture se reduit par paliers de 4px tant
         qu'il empiete sur la carte visuelle du bas. */
      if (tpl === 'A') {
        const title = document.querySelector('.title');
        const sub = document.querySelector('.subtitle');
        const card = document.querySelector('.cover-card');
        if (!title || !sub) return out;
        const limit = card ? card.getBoundingClientRect().top - 48 : 1350 - 90;
        const base = parseFloat(title.dataset.base), min = parseFloat(title.dataset.min);
        out.base = base; out.min = min;
        let size = base;
        title.style.fontSize = size + 'px';
        const fits = () => sub.getBoundingClientRect().bottom <= limit;
        while (!fits() && size - 4 >= min) { size -= 4; title.style.fontSize = size + 'px'; }
        out.size = size;
        out.overflow = !fits();
        return out;
      }

      const el = document.querySelector('.body') || document.querySelector('.cta');

      const title = (tpl === 'B' || tpl === 'C') ? document.querySelector('.title') : null;
      if (title) {
        const lh = parseFloat(getComputedStyle(title).lineHeight);
        out.titleLines = Math.round(title.getBoundingClientRect().height / lh);
      }
      if (!el) return out;

      const base = parseFloat(el.dataset.base);
      const min = parseFloat(el.dataset.min);
      out.base = base; out.min = min;

      // .body a une hauteur contrainte (flex:1 + overflow hidden) : on compare son
      // contenu a sa boite. .cta est en hauteur automatique : on le compare a la
      // boite interieure de .frame. Tolerance de 2px pour les arrondis sub-pixel.
      const isCta = el.classList.contains('cta');
      const frame = el.closest('.frame');
      const fits = () => {
        if (!isCta) return el.scrollHeight <= el.clientHeight + 2;
        const cs = getComputedStyle(frame);
        const availH = frame.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
        return el.getBoundingClientRect().height <= availH + 2;
      };

      let size = base;
      el.style.fontSize = size + 'px';
      while (!fits() && size - 2 >= min) { size -= 2; el.style.fontSize = size + 'px'; }

      /* Gabarit C : plutot que de descendre le texte sous son minimum, on rend
         de la place en reduisant le bandeau illustre, par paliers de 20px. */
      if (tpl === 'C' && !fits()) {
        const BANNER_MIN = 320;
        let h = parseFloat(getComputedStyle(slide).getPropertyValue('--banner')) || 520;
        while (!fits() && h - 20 >= BANNER_MIN) {
          h -= 20;
          slide.style.setProperty('--banner', h + 'px');
        }
        out.banner = h;
      }

      out.size = size;
      out.overflow = !fits();
      return out;
    });

    const buf = await page.locator('.slide').screenshot({ type: 'png' });
    const png = path.join(OUT, f.replace('.html', '.png'));
    await sharp(buf)
      .resize(W, H, { kernel: sharp.kernel.lanczos3, fit: 'fill' })
      .png({ compressionLevel: 9 })
      .toFile(png);

    report.push({ file: f, png: path.basename(png), ...fit });
  }

  await browser.close();

  /* ---------------------------------------------------------------- */
  console.log('\n  slide            corps      titre     etat');
  console.log('  ' + '-'.repeat(54));
  const warnings = [];
  for (const r of report) {
    const corps = r.size ? `${r.size}px${r.size !== r.base ? ` (base ${r.base})` : '     '}` : '  n/a  ';
    const bandeau = r.banner ? ` / bandeau ${r.banner}px` : '';
    const titre = r.titleLines != null ? `${r.titleLines} ligne${r.titleLines > 1 ? 's' : ''}` : ' n/a   ';
    let etat = 'ok';
    if (r.overflow) { etat = 'DEBORDE AU MINIMUM'; warnings.push(`${r.file} : le corps deborde encore a ${r.min}px. Texte a raccourcir, rien n a ete tronque.`); }
    else if (r.size && r.size !== r.base) { etat = 'reduit'; }
    etat += bandeau;
    if (r.titleLines > 2) { etat += ' / TITRE > 2 LIGNES'; warnings.push(`${r.file} : le titre occupe ${r.titleLines} lignes (max 2).`); }
    console.log(`  ${r.file.padEnd(16)} ${corps.padEnd(10)} ${titre.padEnd(9)} ${etat}`);
  }

  writePreview(report, warnings);

  console.log(`\nOK  ${report.length} PNG 1080x1350 dans output/carousel-moyen-orient/`);
  console.log('OK  preview.html regenere');
  if (warnings.length) {
    console.log('\nA CORRIGER :');
    for (const w of warnings) console.log('  - ' + w);
  }
})();

/* ------------------------------------------------------------------ */
/* preview.html : les 16 PNG cote a cote pour validation d un coup d oeil */
/* ------------------------------------------------------------------ */
function writePreview(report, warnings) {
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
  const v = Date.now(); // anti-cache navigateur

  const cards = report.map(r => {
    const n = r.file.match(/\d{2}/)[0];
    const tags = [];
    if (r.size && r.base && r.size !== r.base) tags.push(`corps reduit ${r.base} -> ${r.size}px`);
    if (r.banner) tags.push(`bandeau reduit a ${r.banner}px`);
    if (r.overflow) tags.push('DEBORDE');
    if (r.titleLines > 2) tags.push(`titre ${r.titleLines} lignes`);
    const bad = r.overflow || r.titleLines > 2;
    return `    <figure class="card${bad ? ' bad' : ''}">
      <a href="output/carousel-moyen-orient/${r.png}?v=${v}" target="_blank">
        <img src="output/carousel-moyen-orient/${r.png}?v=${v}" alt="Slide ${n}" loading="lazy">
      </a>
      <figcaption><span class="n">${n}</span>${tags.length ? `<span class="tag">${tags.join(' / ')}</span>` : ''}</figcaption>
    </figure>`;
  }).join('\n');

  const banner = PROVISOIRE
    ? `  <div class="banner">MAQUETTE : les textes affiches sont PROVISOIRES. Coller les 16 textes valides dans content/slides.js, passer PROVISOIRE a false, puis relancer npm run all.</div>`
    : '';

  const warnBlock = warnings.length
    ? `  <div class="warn"><b>A corriger</b><ul>${warnings.map(w => `<li>${w}</li>`).join('')}</ul></div>`
    : '';

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Fynovates | Preview carousel Moyen-Orient</title>
<style>
  :root { --navy:#0F1535; --indigo:#4F6BFF; --grey:#A8B0C8; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: #080C1E; color: #fff; padding: 48px;
    font-family: 'Inter', -apple-system, system-ui, sans-serif;
  }
  header { margin-bottom: 8px; }
  h1 { font-size: 26px; font-weight: 900; letter-spacing: -0.02em; }
  .meta { margin-top: 8px; font-size: 14px; color: var(--grey); }
  .banner {
    margin: 24px 0 0; padding: 16px 20px; border-radius: 12px;
    background: rgba(79,107,255,.14); border: 1px solid var(--indigo);
    font-size: 14px; font-weight: 600; line-height: 1.5;
  }
  .warn {
    margin: 16px 0 0; padding: 16px 20px; border-radius: 12px;
    background: rgba(255,255,255,.05); border: 1px solid #5a2b4a;
    font-size: 14px; line-height: 1.6;
  }
  .warn ul { margin: 8px 0 0 18px; color: var(--grey); }
  .grid {
    margin-top: 32px;
    display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
  }
  @media (max-width: 1500px) { .grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, 1fr); } }
  .card { background: var(--navy); border-radius: 14px; overflow: hidden; border: 1px solid #1d2547; }
  .card.bad { border-color: #8a3d6b; }
  .card img { width: 100%; display: block; aspect-ratio: 4/5; }
  figcaption {
    display: flex; align-items: center; gap: 10px;
    padding: 12px 14px; font-size: 12px;
  }
  .n { font-weight: 900; color: var(--indigo); letter-spacing: .12em; }
  .tag { color: var(--grey); }
  .card.bad .tag { color: #ff9ecb; }
</style>
</head>
<body>
  <header>
    <h1>Carousel Moyen-Orient : 16 slides, 1080 x 1350</h1>
    <div class="meta">Export du ${stamp} &middot; PNG dans output/carousel-moyen-orient/ &middot; cliquer une vignette pour l ouvrir en taille reelle</div>
  </header>
${banner}
${warnBlock}
  <div class="grid">
${cards}
  </div>
</body>
</html>
`;
  fs.writeFileSync(path.join(__dirname, 'preview.html'), html, 'utf8');
}
