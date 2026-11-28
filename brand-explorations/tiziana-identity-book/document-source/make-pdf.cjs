/* Prints book.html to ../final-pdf/ and saves a JPEG preview of every page for QA. Also reports pages whose content overflows. */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1300, height: 950 } })
  const errs = []
  p.on('pageerror', (e) => errs.push(e.message))
  p.on('requestfailed', (r) => errs.push('missing ' + r.url()))
  await p.goto('file://' + path.join(__dirname, 'book.html'))
  await p.waitForSelector('body[data-ready]', { timeout: 120000 })
  await p.waitForTimeout(1000)
  // overflow check: any element whose box goes outside its page (except backgrounds)
  const over = await p.$$eval('.page', (pages) => pages.map((pg, i) => {
    const r = pg.getBoundingClientRect(), bad = []
    pg.querySelectorAll('*').forEach((el) => {
      if (el.closest('.bg') || el.closest('svg')) return
      const q = el.getBoundingClientRect()
      if (q.width && (q.bottom > r.bottom - 12 || q.right > r.right + 1) && !el.classList.contains('foot') && !el.closest('.foot')) bad.push((el.className || el.tagName) + ' ' + Math.round(q.bottom - r.bottom))
    })
    return bad.length ? `p${i + 1}: ${bad.slice(0, 3).join(' | ')}` : null
  }).filter(Boolean))
  const out = path.join(__dirname, '..', 'final-pdf')
  fs.mkdirSync(path.join(out, 'apercu'), { recursive: true })
  for (const f of fs.readdirSync(path.join(out, 'apercu'))) if (/^page-\d+\.jpg$/.test(f)) fs.unlinkSync(path.join(out, 'apercu', f)) // stale previews
  await p.pdf({ path: path.join(out, 'Tiziana-Caci-Personal-Brand-Identity-Book.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true })
  const pages = await p.$$('.page')
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(out, 'apercu', `page-${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 78 })
  console.log('pages', pages.length)
  console.log('overflow', over)
  console.log('errors', errs.slice(0, 10))
  await b.close()
})()
