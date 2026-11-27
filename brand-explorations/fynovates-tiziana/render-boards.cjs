/* Exports every board of index.html as a PNG in exports/ (Playwright, file:// — no server needed).
   Usage: node render-boards.cjs */
const { chromium } = require('playwright')
const path = require('node:path')
const fs = require('node:fs')
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1700, height: 1200 }, deviceScaleFactor: 1 })
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  await p.goto('file://' + path.join(__dirname, 'index.html'))
  await p.waitForSelector('body[data-ready]')
  await p.evaluate(() => document.body.classList.add('exporting'))
  await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))
  await p.waitForTimeout(600)
  const ids = await p.$$eval('[data-board]', (els) => els.map((e) => e.id))
  const out = path.join(__dirname, 'exports')
  fs.mkdirSync(out, { recursive: true })
  for (let i = 0; i < ids.length; i++) {
    const el = await p.$(`#${ids[i]}`)
    await el.screenshot({ path: path.join(out, `${String(i).padStart(2, '0')}-${ids[i]}.png`) })
  }
  console.log('boards', ids.length, errs)
  await b.close()
})()
