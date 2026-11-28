/* Exports the visuals used by the two PDF brochures (2x resolution). */
const { chromium } = require('playwright')
const path = require('path')
const R = path.join(__dirname, '..', '..')
const OUT = path.join(__dirname, '..', 'visuels')
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: 2000, height: 1400 }, deviceScaleFactor: 2 })
  const shoot = async () => {
    for (const el of await p.$$('#exp [data-o]')) {
      const o = await el.getAttribute('data-o')
      await el.screenshot({ path: path.join(OUT, o), type: 'jpeg', quality: 88 })
    }
  }
  // ---- Fynovates: texture tiles + applications
  await p.goto('file://' + path.join(R, 'fynovates-tiziana/index.html'))
  await p.waitForSelector('body[data-ready]')
  await p.evaluate(() => {
    const T = window.FN_TEXTURES, A = window.APPS
    const box = document.createElement('div')
    box.id = 'exp'
    box.style.cssText = 'position:absolute;left:0;top:0;z-index:99;background:#fff'
    const pick = ['yt', 'ig', 'cover', 'li']
    let h = ''
    T.forEach((t) => {
      h += `<div data-o="fynovates/${t.num}-${t.key}-texture.jpg" style="position:relative;width:1200px;height:800px;overflow:hidden">${t.layer(1200, 800)}</div>`
      A.FN_APPS.filter((a) => pick.includes(a.key)).forEach((a) => { h += `<div data-o="fynovates/${t.num}-${t.key}-${a.key}.jpg" style="width:${a.w}px;height:${a.h}px">${A.fnMock(t, a)}</div>` })
    })
    box.innerHTML = h
    document.body.prepend(box)
    const n = document.querySelector('nav'); if (n) n.style.display = 'none'
  })
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(800)
  await shoot()
  // ---- Tiziana V2: phone + grid + before/after tonal grade
  await p.goto('file://' + path.join(R, 'tiziana-instagram-professional/index-v2.html'))
  await p.waitForSelector('body[data-ready]')
  await p.evaluate(() => document.body.classList.add('exporting'))
  await p.evaluate(() => document.fonts.ready)
  await p.waitForTimeout(800)
  await (await p.$('section:nth-of-type(2) .phone')).screenshot({ path: path.join(OUT, 'tiziana/phone.png') })
  await (await p.$('.grid3')).screenshot({ path: path.join(OUT, 'tiziana/grid.jpg'), type: 'jpeg', quality: 88 })
  await p.evaluate(() => {
    const P = window.P, full = 'position:absolute;inset:0;width:100%;height:100%;'
    const box = document.createElement('div')
    box.id = 'exp'
    box.style.cssText = 'position:absolute;left:0;top:0;z-index:99'
    box.innerHTML = ['tz-studio-vert-bras-croises', 'tz-balcon-telephone', 'tz-voyage-valise-fenetre'].map((k) =>
      `<div data-o="tiziana/avant-${k}.jpg" style="position:relative;width:600px;height:800px;overflow:hidden"><img src="${P[k]}" style="${full}object-fit:cover;object-position:50% 25%"></div>` +
      `<div data-o="tiziana/apres-${k}.jpg" style="position:relative;width:600px;height:800px;overflow:hidden;isolation:isolate"><img src="${P[k]}" style="${full}object-fit:cover;object-position:50% 25%;filter:contrast(.96) brightness(1.04)"><div style="${full}background:#C09F7E;mix-blend-mode:color;opacity:.65"></div><div style="${full}background:linear-gradient(180deg,rgba(248,241,231,.12),rgba(122,94,72,.18));mix-blend-mode:soft-light"></div></div>`).join('')
    document.body.prepend(box)
  })
  await p.waitForTimeout(500)
  await shoot()
  await b.close()
  console.log('ok')
})()
