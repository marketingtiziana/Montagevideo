/* Exports all boards and every individual publication / slide / texture tile as JPEG.
   Usage: node render.cjs            (Playwright, file:// — no server) */
const { chromium } = require('playwright')
const path = require('node:path')
const fs = require('node:fs')
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1900, height: 1200 }, deviceScaleFactor: 1 })
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('requestfailed', (r) => errs.push('failed ' + r.url()))
  await p.goto('file://' + path.join(__dirname, 'index.html'))
  await p.waitForSelector('body[data-ready]')
  await p.evaluate(() => document.body.classList.add('exporting'))
  await p.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))
  await p.waitForTimeout(800)
  const save = async (sel, out) => {
    const file = path.join(__dirname, out)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    await (await p.$(sel)).screenshot({ path: file, type: 'jpeg', quality: 90 })
  }
  const boards = await p.$$eval('[data-board]', (els) => els.map((e) => [e.id, e.dataset.out]))
  for (const [id, out] of boards) await save(`#${id}`, out)
  // singles: bring each into view at native size
  await p.evaluate(() => { const s = document.getElementById('singles'); s.style.left = '0'; s.style.position = 'relative' })
  const singles = await p.$$eval('[data-single]', (els) => els.map((e) => e.dataset.out))
  for (let i = 0; i < singles.length; i++) await save(`[data-single]:nth-of-type(${i + 1})`, singles[i])
  console.log('boards', boards.length, 'singles', singles.length, errs.slice(0, 5))
  await b.close()
})()
