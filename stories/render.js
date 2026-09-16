/**
 * Rendu des stories : story-N.html -> story-N.png (1080 x 1920 exactement).
 *
 * Vérifie au passage :
 *   - qu'aucun texte ne descend dans les 280 px réservés en bas (ni ne déborde
 *     latéralement) ;
 *   - le contraste texte / fond réel (fond ré-échantillonné sous chaque bloc de
 *     texte, texte masqué) — seuil WCAG AA : 4.5:1, ou 3:1 pour les grands corps.
 *
 * Usage : node render.js [numéros de story…]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const W = 1080, H = 1920, SAFE_BOTTOM = 280, SAFE_Y = H - SAFE_BOTTOM;
const HERE = __dirname;
const TMP = fs.mkdtempSync(path.join(require('os').tmpdir(), 'stories-'));

const srgb = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const lum = (r, g, b) => 0.2126 * srgb(r / 255) + 0.7152 * srgb(g / 255) + 0.0722 * srgb(b / 255);
const contrast = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

async function collectText(page) {
  return page.evaluate(() => {
    const out = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const el = n.parentElement;
      if (el.closest('.layer')) continue; // filigrane décoratif
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      out.push({
        text: n.textContent.trim().slice(0, 42),
        color: cs.color,
        size: parseFloat(cs.fontSize),
        weight: parseInt(cs.fontWeight, 10) || 400,
        x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom, right: r.right,
      });
    }
    // les éléments graphiques doivent aussi rester hors de la zone réservée
    const arts = [...document.querySelectorAll('.art svg')].map((s) => {
      const r = s.getBoundingClientRect();
      return { bottom: r.bottom, right: r.right, x: r.x };
    });
    return { texts: out, arts };
  });
}

async function sampleBackground(sampler, pngPath, rects) {
  await sampler.goto('about:blank');
  return sampler.evaluate(async ({ src, rects }) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    c.getContext('2d').drawImage(img, 0, 0);
    const ctx = c.getContext('2d');
    return rects.map((r) => {
      const x0 = Math.max(0, Math.floor(r.x) - 2), y0 = Math.max(0, Math.floor(r.y) - 2);
      const w = Math.min(c.width - x0, Math.ceil(r.w) + 4);
      const h = Math.min(c.height - y0, Math.ceil(r.h) + 4);
      if (w <= 0 || h <= 0) return null;
      const d = ctx.getImageData(x0, y0, w, h).data;
      const px = [];
      for (let y = 0; y < h; y += 2) {
        for (let x = 0; x < w; x += 2) {
          const i = (y * w + x) * 4;
          px.push([d[i], d[i + 1], d[i + 2]]);
        }
      }
      return px;
    });
  }, { src: 'data:image/png;base64,' + fs.readFileSync(pngPath).toString('base64'), rects });
}

(async () => {
  const wanted = process.argv.slice(2).map(Number).filter(Boolean);
  const ids = wanted.length ? wanted : [1, 2, 3, 4, 5, 6];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const sampler = await browser.newPage();
  let failures = 0;

  for (const id of ids) {
    const file = path.join(HERE, `story-${id}.html`);
    await page.goto('file://' + file);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);

    const { texts, arts } = await collectText(page);

    // fond seul : masque le contenu pour ré-échantillonner les pixels derrière le texte
    await page.evaluate(() => { document.querySelector('.content').style.visibility = 'hidden'; });
    const bgPath = path.join(TMP, `bg-${id}.png`);
    await page.screenshot({ path: bgPath, clip: { x: 0, y: 0, width: W, height: H } });
    await page.evaluate(() => { document.querySelector('.content').style.visibility = ''; });

    const out = path.join(HERE, `story-${id}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: W, height: H } });

    const samples = await sampleBackground(sampler, bgPath, texts);

    const problems = [];
    let worst = { ratio: Infinity, text: '' };
    texts.forEach((t, i) => {
      if (t.bottom > SAFE_Y) problems.push(`texte dans la zone réservée (bas ${Math.round(t.bottom)} px) : "${t.text}"`);
      if (t.right > W - 8 || t.x < 8) problems.push(`texte hors marge (x ${Math.round(t.x)} → ${Math.round(t.right)}) : "${t.text}"`);
      const px = samples[i];
      if (!px) return;
      const [r, g, b] = t.color.match(/[\d.]+/g).map(Number);
      const lt = lum(r, g, b);
      // pire cas : le pixel de fond le plus proche du texte en luminance
      const ratios = px.map(([R, G, B]) => contrast(lt, lum(R, G, B)));
      const ratio = Math.min(...ratios);
      const large = t.size >= 24 && (t.size >= 32 || t.weight >= 700);
      const min = large ? 3 : 4.5;
      if (ratio < worst.ratio) worst = { ratio, text: t.text };
      if (ratio < min) problems.push(`contraste ${ratio.toFixed(2)}:1 < ${min}:1 sur "${t.text}"`);
    });
    arts.forEach((a) => {
      if (a.bottom > SAFE_Y) problems.push(`visuel dans la zone réservée (bas ${Math.round(a.bottom)} px)`);
    });

    const dim = await sampler.evaluate(async (src) => {
      const img = new Image(); img.src = src; await img.decode();
      return [img.width, img.height];
    }, 'data:image/png;base64,' + fs.readFileSync(out).toString('base64'));

    const lowest = Math.max(...texts.map((t) => t.bottom), ...arts.map((a) => a.bottom));
    const ok = problems.length === 0 && dim[0] === W && dim[1] === H;
    if (!ok) failures++;
    console.log(
      `story-${id}.png  ${dim[0]}x${dim[1]}  bas du contenu : ${Math.round(lowest)} px ` +
      `(limite ${SAFE_Y})  contraste min : ${worst.ratio.toFixed(2)}:1  ${ok ? 'OK' : 'ÉCHEC'}`
    );
    problems.forEach((p) => console.log(`   ! ${p}`));
  }

  await browser.close();
  fs.rmSync(TMP, { recursive: true, force: true });
  process.exit(failures ? 1 : 0);
})();
