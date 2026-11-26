/* Exports every plaquette visual (LinkedIn and YouTube Fynovates) as PNG into public/plaquettes/.
   Usage: npm run build && npx vite preview --port 4173 & node scripts/export-plaquettes.cjs [baseUrl] */
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')

const BASE = process.argv[2] || 'http://localhost:4173/'
const OUT = path.join(__dirname, '..', 'public', 'plaquettes')

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 2800, height: 1600 }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  await page.goto(`${BASE}#/plaquettes/assets`)
  await page.waitForSelector('[data-assets-ready]')
  await page.evaluate(() => document.fonts.ready)
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))))
  await page.waitForTimeout(500)
  const names = await page.$$eval('[data-export]', (els) => els.map((e) => e.getAttribute('data-export')))
  for (const name of names) {
    const el = await page.$(`[data-export="${name}"] > *`)
    const file = path.join(OUT, `${name}.png`)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    // LinkedIn banner and logo at 2x for sharpness
    if (name === 'linkedin/banniere' || name === 'linkedin/logo') {
      const p2 = await browser.newPage({ viewport: { width: 2800, height: 1600 }, deviceScaleFactor: 2 })
      await p2.goto(`${BASE}#/plaquettes/assets`)
      await p2.waitForSelector('[data-assets-ready]')
      await p2.evaluate(() => document.fonts.ready)
      await p2.waitForTimeout(400)
      await (await p2.$(`[data-export="${name}"] > *`)).screenshot({ path: file, omitBackground: name === 'youtube/photo-profil' })
      await p2.close()
    } else {
      await el.screenshot({ path: file, omitBackground: name === 'youtube/photo-profil' })
    }
  }
  console.log('exported', names.length, 'files')
  await browser.close()
  if (errors.length) {
    console.error(errors)
    process.exit(1)
  }
})()
