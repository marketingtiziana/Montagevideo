/* Texture macros: each texture layer rendered on a 300 px tile at 4x, i.e. a real 4x zoom of the matter. */
const { chromium } = require('playwright')
const path = require('path')
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 1400, height: 1000 }, deviceScaleFactor: 4 })
  await p.goto('file://' + path.join(__dirname, '../../fynovates-tiziana/index.html'))
  await p.waitForSelector('body[data-ready]')
  await p.evaluate(() => {
    const box = document.createElement('div')
    box.id = 'exp'
    box.style.cssText = 'position:absolute;left:0;top:0;z-index:99'
    box.innerHTML = window.FN_TEXTURES.map((t) => `<div data-o="${t.num}-${t.key}" style="position:relative;width:300px;height:300px;overflow:hidden">${t.layer(1200, 800)}</div>`).join('')
    document.body.prepend(box)
  })
  await p.waitForTimeout(600)
  for (const el of await p.$$('#exp [data-o]')) await el.screenshot({ path: path.join(__dirname, '../visuels/fynovates', (await el.getAttribute('data-o')) + '-macro.jpg'), type: 'jpeg', quality: 92 })
  await b.close()
})()
