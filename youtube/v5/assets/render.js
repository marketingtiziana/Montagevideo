// Rend une page HTML animée en séquence PNG transparente (Web Animations API pilotée image par image).
// usage : node render.js page.html outdir duration_s [fps] [only_frame]
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
(async () => {
  const [page_, out, dur, fpsArg, only] = process.argv.slice(2);
  const fps = +(fpsArg || 25); const n = Math.round(+dur * fps);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.resolve(page_));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForFunction(() => !document.querySelector('#m') || window.READY === true, null, { timeout: 30000 });
  await p.waitForTimeout(200);
  // intervalles où au moins une animation est active -> sinon image identique à la précédente
  const spans = await p.evaluate(() => document.getAnimations().map(a => {
    const t = a.effect.getComputedTiming(); return [t.delay || 0, (t.delay || 0) + (t.duration || 0)];
  }));
  const active = t => spans.some(([s, e]) => t >= s - 1 && t <= e + 1);   // ms, marge 1 ms
  let prevFile = null, prevStatic = false;
  const frames = only !== undefined ? [+only] : [...Array(n).keys()];
  for (const i of frames) {
    const t = i / fps * 1000;
    const file = `${out}/f${String(i).padStart(4, '0')}.png`;
    const isStatic = !active(t);
    if (isStatic && prevStatic && prevFile) { try { fs.unlinkSync(file); } catch (e) {} fs.linkSync(prevFile, file); continue; }
    await p.evaluate((t) => { document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }); }, t);
    await p.screenshot({ path: file, omitBackground: true });
    prevFile = file; prevStatic = isStatic;
  }
  await b.close();
})();
