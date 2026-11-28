/* Prints the brochures to PDF (A4 landscape) and a PNG preview of every page. Usage: node src/make-pdf.cjs */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')
const D = path.join(__dirname, '..')
;(async () => {
  const b = await chromium.launch()
  for (const [html, pdf] of [['plaquette-tiziana.html', 'Tiziana-Caci-DA-Instagram.pdf'], ['plaquette-fynovates.html', 'Fynovates-DA-bleu-et-textures.pdf']]) {
    const p = await b.newPage({ viewport: { width: 1200, height: 900 } })
    await p.goto('file://' + path.join(D, html))
    await p.waitForSelector('body[data-ready]', { timeout: 60000 })
    await p.pdf({ path: path.join(D, pdf), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true })
    // previews
    const dir = path.join(D, 'apercus', pdf.replace('.pdf', ''))
    fs.mkdirSync(dir, { recursive: true })
    const pages = await p.$$('.page')
    for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(dir, `page-${String(i + 1).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 80 })
    console.log(pdf, pages.length, 'pages')
    await p.close()
  }
  await b.close()
})()
