/* Renders every mockup of visuals.html to ../<out>. Usage: node render-visuals.cjs [filter] */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')
const only = process.argv[2]
;(async () => {
  const b = await chromium.launch()
  for (const scale of [1, 2]) {
    const p = await b.newPage({ viewport: { width: 2000, height: 1400 }, deviceScaleFactor: scale })
    const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    await p.goto('file://' + path.join(__dirname, 'visuals.html'))
    await p.waitForSelector('body[data-ready]', { timeout: 120000 })
    await p.evaluate(() => { document.body.style.background = 'transparent' })
    await p.waitForTimeout(800)
    const list = await p.$$eval('[data-out]', (els) => els.map((e) => [e.dataset.out, +e.dataset.scale]))
    const els = await p.$$('[data-out]')
    for (let i = 0; i < list.length; i++) {
      const [out, s] = list[i]
      if (s !== scale || (only && !out.includes(only))) continue
      const file = path.join(__dirname, '..', out)
      fs.mkdirSync(path.dirname(file), { recursive: true })
      await els[i].screenshot(out.endsWith('.png') ? { path: file, omitBackground: true } : { path: file, type: 'jpeg', quality: 90 })
    }
    if (errs.length) console.log('errors', errs)
    await p.close()
  }
  await b.close()
  console.log('done')
})()
