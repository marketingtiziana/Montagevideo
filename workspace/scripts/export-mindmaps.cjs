/* Generates the deliverables of every mind map into output/mindmaps/<slug>/:
   overview.png (2048×1536), mindmap.pdf (4:3 pages), mindmap.svg, speaker_notes.md, sources.md.
   mindmap.json is the source file itself (edited by hand or exported from the studio).
   Usage: npm run build && npx vite preview --port 4173 & node scripts/export-mindmaps.cjs [baseUrl]
   Private presenter notes are never written to these files. */
const { chromium } = require('playwright')
const fs = require('node:fs')
const path = require('node:path')

const BASE = process.argv[2] || 'http://localhost:4173/'
const OUT = path.join(__dirname, '..', 'output', 'mindmaps')
const MAPS = ['quitter-la-france', 'residence-fiscale']

;(async () => {
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 2048, height: 1536 }, deviceScaleFactor: 1 })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  for (const id of MAPS) {
    await page.goto(`${BASE}#/mindmaps/${id}/present?export=1`)
    await page.reload()
    await page.waitForFunction(() => window.__MINDMAP__)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(400)
    const data = await page.evaluate(() => window.__MINDMAP__)
    const dir = path.join(OUT, data.slug)
    fs.mkdirSync(dir, { recursive: true })
    await page.screenshot({ path: path.join(dir, 'overview.png') })
    fs.writeFileSync(path.join(dir, 'mindmap.svg'), data.svg)
    fs.writeFileSync(path.join(dir, 'speaker_notes.md'), data.notes)
    fs.writeFileSync(path.join(dir, 'sources.md'), data.sources)

    await page.goto(`${BASE}#/mindmaps/${id}/print`)
    await page.reload()
    await page.waitForSelector('[data-print-ready] [data-branch]')
    await page.evaluate(() => document.fonts.ready)
    await page.emulateMedia({ media: 'print' })
    await page.waitForTimeout(500)
    await page.pdf({ path: path.join(dir, 'mindmap.pdf'), width: '2048px', height: '1536px', printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } })
    await page.emulateMedia({ media: 'screen' })
    console.log('exported', data.slug)
  }
  await browser.close()
  if (errors.length) {
    console.error(errors)
    process.exit(1)
  }
})()
