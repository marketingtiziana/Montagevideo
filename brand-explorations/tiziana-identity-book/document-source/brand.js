/* THE RED MARK — shared brand system (palette, the mark, textures, photo grade).
   Used by visuals.js (mockups rendered to JPEG) and book.js (the PDF, where marks stay vector). */
;(function () {
  const L = window.LIB
  const C = window.RM = {
    craie: '#E7DED2', sable: '#C7B39B', espresso: '#302820', grenat: '#702B40', bronze: '#9B8267',
    craieClair: '#F2ECE4', espressoProfond: '#1F1914', grenatClair: '#8E3E56', ivoire: '#F7F3EE',
  }
  const full = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'

  /* ---------- the mark: a tapered, slightly irregular brush stroke ---------- */
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646
  function stroke(pts, W, { taper = 0.6, seed = 3, min = 0.18 } = {}) {
    // pts: polyline of the stroke centre; W: max thickness
    const R = rnd(seed), top = [], bot = []
    const n = pts.length
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const [x, y] = pts[i]
      const [xa, ya] = pts[Math.max(0, i - 1)], [xb, yb] = pts[Math.min(n - 1, i + 1)]
      let nx = -(yb - ya), ny = xb - xa
      const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l
      // pressure: quick attack, long body, light release
      const ss = (e0, e1, v) => { const k = Math.min(1, Math.max(0, (v - e0) / (e1 - e0))); return k * k * (3 - 2 * k) }
      const p = (min + (1 - min) * ss(0, 0.07 + taper * 0.05, t) * (1 - ss(0.8, 1, t) * 0.75)) * (0.93 + 0.07 * R())
      const w = (W * p) / 2
      top.push([x + nx * w, y + ny * w]); bot.push([x - nx * w, y - ny * w])
    }
    const f = (a) => a.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')
    return `M${f(top)} L${f(bot.reverse())} Z`
  }
  const along = (fn, n = 60) => Array.from({ length: n }, (_, i) => fn(i / (n - 1)))
  const cubic = (p0, p1, p2, p3) => (t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k]) }

  // variants, in a local box w × h, returned as <path d>
  const MARK = {
    horizontal: (w, h) => stroke(along(cubic([w * 0.01, h * 0.62], [w * 0.3, h * 0.46], [w * 0.7, h * 0.5], [w * 0.99, h * 0.4])), h * 0.34),
    underline: (w, h) => stroke(along(cubic([w * 0.005, h * 0.6], [w * 0.3, h * 0.4], [w * 0.7, h * 0.5], [w * 0.995, h * 0.38])), h * 0.62, { seed: 21 }),
    vertical: (w, h) => stroke(along(cubic([w * 0.55, h * 0.01], [w * 0.42, h * 0.3], [w * 0.6, h * 0.7], [w * 0.48, h * 0.99])), w * 0.42, { seed: 7 }),
    annotation: (w, h) => stroke(along(cubic([w * 0.01, h * 0.55], [w * 0.35, h * 0.66], [w * 0.7, h * 0.64], [w * 0.88, h * 0.5])), h * 0.22, { seed: 5 }) + ' ' + stroke(along(cubic([w * 0.84, h * 0.66], [w * 0.9, h * 0.45], [w * 0.95, h * 0.25], [w * 0.99, h * 0.06]), 24), h * 0.16, { seed: 9, min: 0.4 }),
    circle: (w, h) => stroke(along((t) => { const a = -2.3 + t * 5.6; return [w / 2 + Math.cos(a) * w * 0.46 * (1 + 0.04 * Math.sin(t * 9)), h / 2 + Math.sin(a) * h * 0.42] }, 90), Math.min(w, h) * 0.07, { taper: 0.35, seed: 11, min: 0.3 }),
    bracket: (w, h) => stroke(along(cubic([w * 0.95, h * 0.02], [w * 0.1, h * 0.0], [w * 0.05, h * 0.5], [w * 0.1, h * 0.98]), 70), w * 0.16, { taper: 0.4, seed: 13, min: 0.3 }),
    signature: (w, h) => stroke(along(cubic([w * 0.02, h * 0.6], [w * 0.25, h * 0.44], [w * 0.55, h * 0.52], [w * 0.8, h * 0.4])), h * 0.26, { seed: 17 }) + ` M${w * 0.92},${h * 0.42} m-${h * 0.11},0 a${h * 0.11},${h * 0.11} 0 1,0 ${h * 0.22},0 a${h * 0.11},${h * 0.11} 0 1,0 -${h * 0.22},0`,
  }
  // inline svg (absolute or inline-block)
  const mark = (variant, w, h, css = '', color = C.grenat, extra = '') => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="${css}" xmlns="http://www.w3.org/2000/svg"><path d="${MARK[variant](w, h)}" fill="${color}" ${extra}/></svg>`
  // partially drawn mark (for animation frames): clip to progress p
  const markAt = (variant, w, h, p, css = '', color = C.grenat) => { const id = 'cl' + Math.random().toString(36).slice(2, 8); return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="${css}"><defs><clipPath id="${id}"><rect x="0" y="0" width="${w * p}" height="${h}"/></clipPath></defs><path d="${MARK[variant](w, h)}" fill="${color}" clip-path="url(#${id})"/></svg>` }

  /* ---------- textures ---------- */
  const TEX = {
    enduit: (base = C.craie) => `<div style="${full}background:${base}"></div>` + L.relief({ alpha: 0.42, freq: 0.012, oct: 5, scale: 3.2, el: 50, light: '#FBF6EF' }) + L.noise({ alpha: 0.05, blend: 'multiply', rgb: [0.4, 0.33, 0.26] }) + `<div style="${full}background:radial-gradient(90% 70% at 20% 20%,rgba(255,250,242,.35),rgba(48,40,32,.0) 60%,rgba(48,40,32,.12))"></div>`,
    travertin: () => `<div style="${full}background:linear-gradient(180deg,#E9DFD1,#D8C8B3)"></div>` + `<div style="${full}background:repeating-linear-gradient(178deg,rgba(155,130,103,.0) 0 26px,rgba(155,130,103,.16) 27px,rgba(155,130,103,0) 31px)"></div>` + L.noise({ alpha: 0.08, freq: 0.5, oct: 4, blend: 'multiply', rgb: [0.5, 0.42, 0.33] }) + L.relief({ alpha: 0.25, freq: 0.06, scale: 1.5 }),
    papier: () => `<div style="${full}background:${C.craieClair}"></div>` + L.relief({ alpha: 0.3, freq: 0.05, scale: 1.3 }) + L.noise({ alpha: 0.04, blend: 'multiply' }),
    espresso: () => `<div style="${full}background:radial-gradient(110% 90% at 25% 15%,#4A3E33 0%,${C.espresso} 45%,${C.espressoProfond} 100%)"></div>` + L.noise({ alpha: 0.05, freq: 0.8, oct: 3, blend: 'soft-light', rgb: [0.9, 0.85, 0.8] }),
    cuir: (base = C.grenat) => `<div style="${full}background:radial-gradient(120% 90% at 30% 20%,${C.grenatClair},${base} 50%,#4A1B2A)"></div>` + L.relief({ alpha: 0.45, freq: 0.35, oct: 3, scale: 1.2, light: '#F0D5DC', blend: 'soft-light' }) + L.noise({ alpha: 0.06, freq: 0.9, blend: 'multiply', rgb: [0.2, 0.05, 0.1] }),
    bois: () => `<div style="${full}background:linear-gradient(180deg,#5A4230,#3B2A1E)"></div>` + `<div style="${full}background:repeating-linear-gradient(1deg,rgba(0,0,0,0) 0 14px,rgba(20,10,4,.18) 15px,rgba(0,0,0,0) 22px,rgba(255,220,180,.05) 30px,rgba(0,0,0,0) 38px)"></div>` + L.noise({ alpha: 0.08, freq: 0.04, oct: 3, blend: 'overlay', rgb: [0.4, 0.28, 0.18] }),
    murBrun: () => `<div style="${full}background:#3A2E25"></div>` + L.relief({ alpha: 0.35, freq: 0.014, oct: 5, scale: 3, light: '#8C7865', blend: 'soft-light' }) + L.noise({ alpha: 0.05, blend: 'multiply' }),
    grain: (a = 0.06) => L.film(a),
  }

  /* ---------- photo grade: warm, lightly desaturated, espresso shadows ---------- */
  const GRADE = 'saturate(.8) contrast(1.05) sepia(.1) brightness(1.02)'
  const photo = (src, css, pos = '50% 25%', grade = GRADE, shade = true) => `<div style="position:absolute;${css};overflow:hidden;isolation:isolate"><img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};filter:${grade}">${shade ? `<div style="${full}background:linear-gradient(180deg,rgba(48,40,32,0) 55%,rgba(48,40,32,.25));mix-blend-mode:multiply"></div>` : ''}</div>`

  window.BRAND = { C, MARK, mark, markAt, stroke, TEX, GRADE, photo, full }
})()
