/* Exports the reusable brand assets: The Red Mark variants as standalone SVG (grenat and craie versions) and the palette (JSON + CSS). */
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')
const OUT = path.join(__dirname, '..', 'brand-assets')
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage()
  await p.goto('file://' + path.join(__dirname, 'visuals.html'))
  await p.waitForSelector('body[data-ready]', { timeout: 120000 })
  const data = await p.evaluate(() => {
    const { C, MARK } = window.BRAND
    const sizes = { horizontal: [400, 60], underline: [400, 40], vertical: [40, 300], annotation: [400, 90], circle: [300, 160], bracket: [60, 300], signature: [300, 80] }
    const svgs = {}
    for (const [k, [w, h]] of Object.entries(sizes)) for (const [tone, col] of [['grenat', C.grenat], ['craie', C.craie]]) svgs[`red-mark-${k}-${tone}.svg`] = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><title>The Red Mark — ${k}</title><path d="${MARK[k](w, h)}" fill="${col}"/></svg>\n`
    return { svgs, C }
  })
  fs.mkdirSync(path.join(OUT, 'red-mark'), { recursive: true })
  for (const [f, s] of Object.entries(data.svgs)) fs.writeFileSync(path.join(OUT, 'red-mark', f), s)
  const pal = { 'beige-craie': data.C.craie, sable: data.C.sable, espresso: data.C.espresso, 'grenat-profond': data.C.grenat, bronze: data.C.bronze, 'craie-clair': data.C.craieClair, 'espresso-profond': data.C.espressoProfond, 'grenat-clair': data.C.grenatClair, ivoire: data.C.ivoire }
  fs.writeFileSync(path.join(OUT, 'palette.json'), JSON.stringify({ name: 'The Red Mark — Tiziana Caci', repartition: { 'craie+sable': '55%', espresso: '30%', grenat: '10%', bronze: '5%' }, colors: pal }, null, 1) + '\n')
  fs.writeFileSync(path.join(OUT, 'palette.css'), ':root{\n' + Object.entries(pal).map(([k, v]) => `  --tz-${k}:${v};`).join('\n') + '\n}\n')
  console.log(Object.keys(data.svgs).length, 'svg')
  await b.close()
})()
