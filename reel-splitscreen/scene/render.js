// Deterministic frame-by-frame renderer: loads scene.html, drives GSAP global timeline by seeking.
// usage: node render.js <scene.html> <outdir> <fps> <startFrame> <endFrame> [width] [height]
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const [html, outdir, fpsS, sS, eS, wS, hS] = process.argv.slice(2);
  const fps = +fpsS, start = +sS, end = +eS, W = +(wS||1080), H = +(hS||1060);
  fs.mkdirSync(outdir, { recursive: true });
  const browser = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none', '--disable-lcd-text', '--force-device-scale-factor=1'] });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGEERROR', e.message); });
  page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto('file://' + path.resolve(html), { waitUntil: 'load' });
  await page.evaluate(async () => { await document.fonts.ready; });
  await page.evaluate(() => { gsap.ticker.lagSmoothing(0); gsap.globalTimeline.pause(); });
  const t0 = Date.now();
  for (let f = start; f < end; f++) {
    const t = f / fps;
    await page.evaluate((t) => { window.__seek(t); }, t);
    await page.screenshot({ path: path.join(outdir, `f_${String(f).padStart(5, '0')}.png`), type: 'png', omitBackground: false });
    if ((f - start) % 100 === 0) console.log(`frame ${f}/${end} ${(Date.now() - t0) / 1000}s`);
  }
  await browser.close();
  console.log('done', start, end, (Date.now() - t0) / 1000, 's');
})().catch(e => { console.error(e); process.exit(1); });
