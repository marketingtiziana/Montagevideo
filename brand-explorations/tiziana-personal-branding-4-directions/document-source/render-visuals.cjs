/* Renders all visuals. Usage: node render-visuals.cjs [dirId] [stage]   e.g. node render-visuals.cjs A   |   node render-visuals.cjs all 2 */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')
const ONLY = process.argv[2] && process.argv[2] !== 'all' ? process.argv[2] : null
const STAGES = process.argv[3] ? [+process.argv[3]] : [1, 2]
const IDS = ['01', '02', '03', '04']
;(async () => {
  const b = await chromium.launch()
  for (const stage of STAGES) for (const id of ONLY ? [ONLY] : IDS) for (const scale of [1, 2]) {
    const p = await b.newPage({ viewport: { width: 2100, height: 1400 }, deviceScaleFactor: scale })
    const errs = []
    p.on('pageerror', (e) => errs.push(e.message))
    p.on('requestfailed', (r) => errs.push('missing ' + r.url().split('/').slice(-3).join('/')))
    await p.goto('file://' + path.join(__dirname, 'visuals.html') + `?stage=${stage}&dir=${id}`)
    await p.waitForSelector('body[data-ready]', { timeout: 180000 })
    await p.waitForTimeout(600)
    const list = await p.$$eval('[data-out]', (els) => els.map((e) => [e.dataset.out, +e.dataset.scale]))
    const els = await p.$$('[data-out]')
    let n = 0
    for (let i = 0; i < list.length; i++) {
      const [out, s] = list[i]
      if (s !== scale) continue
      const file = path.join(__dirname, '..', out)
      fs.mkdirSync(path.dirname(file), { recursive: true })
      await els[i].screenshot(out.endsWith('.png') ? { path: file, omitBackground: true } : { path: file, type: 'jpeg', quality: 84 })
      n++
    }
    if (n) console.log(`stage ${stage} ${id} x${scale}: ${n}`, errs.length ? errs.slice(0, 4) : '')
    await p.close()
  }
  await b.close()
})()
