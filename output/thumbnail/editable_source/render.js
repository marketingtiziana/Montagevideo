// Render concept_X.html -> 2560x1440 supersampled screenshots (downscaled by render.py).
// Usage: node render.js A B C
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const list = process.argv.slice(2).length ? process.argv.slice(2) : ['A', 'B', 'C', 'final'];
  const b = await chromium.launch();
  const pg = await b.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  for (const c of list) {
    await pg.goto('file://' + path.join(__dirname, `concept_${c}.html`));
    await pg.waitForSelector('body[data-ready="1"]', { state: 'attached' });
    await pg.waitForTimeout(300);
    await pg.screenshot({ path: path.join(__dirname, 'previews', `_hi_${c}.png`), clip: { x: 0, y: 0, width: 1280, height: 720 } });
    console.log('shot', c);
  }
  await b.close();
})();
