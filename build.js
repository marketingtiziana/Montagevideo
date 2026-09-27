// Exporte slides/slide-XX.html -> output/carousel-solitude/XX.png (1080x1350).
// Rendu Playwright en deviceScaleFactor 2 (2160x2700), puis downscale Lanczos via sharp.
// Slides 02-14 : si le bloc dépasse la hauteur utile (1350 - 2x120), le corps est réduit
// par paliers de 2px (34 -> 26). Sous 26px, le build s'arrête sans tronquer.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const sharp = require('sharp');

const SLIDES_DIR = path.join(__dirname, 'slides');
const OUT_DIR = path.join(__dirname, 'output', 'carousel-solitude');
const WIDTH = 1080;
const HEIGHT = 1350;
const MARGIN = 120;
const USABLE_HEIGHT = HEIGHT - 2 * MARGIN;
const MIN_BODY = 26;

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const files = fs.readdirSync(SLIDES_DIR).filter((f) => /^slide-\d{2}\.html$/.test(f)).sort();

  const launch = {};
  if (process.env.HTTPS_PROXY) launch.proxy = { server: process.env.HTTPS_PROXY };
  const browser = await chromium.launch(launch);
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2 });
  // Les polices Google transitent par Node (Playwright) : fonctionne aussi derrière un proxy
  // TLS d'entreprise que Chromium ne reconnaît pas. Sans proxy, c'est transparent.
  await page.route(/fonts\.(googleapis|gstatic)\.com/, async (route) => {
    route.fulfill({ response: await route.fetch() });
  });

  const blocked = [];
  for (const file of files) {
    const n = file.match(/\d{2}/)[0];
    const src = path.join(SLIDES_DIR, file);
    let html = fs.readFileSync(src, 'utf8');
    if (html.includes('—')) throw new Error(`${file} : tiret cadratin interdit`);

    await page.goto('file://' + src, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Chaque graisse réellement utilisée doit avoir une fonte Inter chargée (pas de police de repli).
    const missing = await page.evaluate(() => {
      const used = new Set([...document.querySelectorAll('.block h1, .block p, .block strong')].map((el) => getComputedStyle(el).fontWeight));
      const loaded = new Set([...document.fonts].filter((f) => f.family.replace(/["']/g, '') === 'Inter' && f.status === 'loaded').map((f) => f.weight));
      return [...used].filter((w) => !loaded.has(w));
    });
    if (missing.length) throw new Error(`${file} : Inter ${missing.join('/')} non chargée depuis Google Fonts`);

    const measure = () => page.evaluate(() => {
      const b = document.querySelector('.block').getBoundingClientRect();
      return { height: Math.ceil(b.height), width: Math.ceil(b.width) };
    });

    const hasBody = /--body-size:\s*(\d+)px/.test(html);
    let size = hasBody ? Number(html.match(/--body-size:\s*(\d+)px/)[1]) : null;
    let { height } = await measure();
    while (hasBody && height > USABLE_HEIGHT && size - 2 >= MIN_BODY) {
      size -= 2;
      await page.evaluate((s) => document.documentElement.style.setProperty('--body-size', s + 'px'), size);
      ({ height } = await measure());
    }
    if (height > USABLE_HEIGHT) {
      blocked.push(`${file} : ${height}px > ${USABLE_HEIGHT}px même avec le corps à ${size ?? '-'}px`);
      continue;
    }
    if (hasBody && html !== (html = html.replace(/--body-size:\s*\d+px/, `--body-size: ${size}px`))) {
      fs.writeFileSync(src, html);
    }

    const shot = await page.screenshot({ type: 'png' });
    await sharp(shot).resize(WIDTH, HEIGHT, { kernel: 'lanczos3' }).png().toFile(path.join(OUT_DIR, `${n}.png`));
    console.log(`${n}.png  bloc ${height}px / ${USABLE_HEIGHT}px${hasBody ? `  corps ${size}px` : ''}`);
  }

  await browser.close();
  if (blocked.length) {
    console.error('\nSTOP : texte trop long, rien n\'a été tronqué ni reformulé :\n' + blocked.join('\n'));
    process.exit(1);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
