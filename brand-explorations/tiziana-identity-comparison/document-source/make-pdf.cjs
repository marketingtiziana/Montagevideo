/* Prints book.html (A3 landscape) to ../pdf/, saves page previews and reports overflow / missing images. */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1700, height: 1200 } })
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('requestfailed', (r) => errs.push('missing ' + r.url().split('/').slice(-3).join('/')))
  await p.goto('file://' + path.join(__dirname, 'book.html'))
  await p.waitForSelector('body[data-ready]', { timeout: 240000 })
  await p.waitForTimeout(1500)
  const over = await p.$$eval('.page', (pages) => pages.map((pg, i) => {
    const r = pg.getBoundingClientRect(), bad = []
    pg.querySelectorAll('*').forEach((el) => {
      if (el.closest('.bg') || el.closest('svg') || el.closest('.foot')) return
      const q = el.getBoundingClientRect()
      if (q.width && (q.bottom > r.bottom - 16 || q.right > r.right + 1)) bad.push((el.className || el.tagName) + ' ' + Math.round(q.bottom - r.bottom))
    })
    return bad.length ? `p${i + 1}: ${bad.slice(0, 2).join(' | ')}` : null
  }).filter(Boolean))
  const out = path.join(__dirname, '..', 'pdf')
  fs.mkdirSync(path.join(out, 'apercu'), { recursive: true })
  for (const f of fs.readdirSync(path.join(out, 'apercu'))) if (/^page-\d+\.jpg$/.test(f)) fs.unlinkSync(path.join(out, 'apercu', f))
  await p.pdf({ path: path.join(out, 'Tiziana-Caci-Executive-Identity-Book.pdf'), width: '420mm', height: '297mm', printBackground: true, preferCSSPageSize: true })
  const pages = await p.$$('.page')
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(out, 'apercu', `page-${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 72 })
  console.log('pages', pages.length, '\noverflow', over, '\nerrors', [...new Set(errs)].slice(0, 12))
  await b.close()
})()
