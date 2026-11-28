/* Graphic engine: organic shapes, layered gradients, material textures, photo masks, type tools.
   Everything is HTML / CSS / inline SVG rendered at native size (1080 × 1350 for posts). */
;(function () {
  let uid = 0
  const id = (p) => `${p}${++uid}`
  const full = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
  const A = (css, inner = '') => `<div style="position:absolute;${css}">${inner}</div>`
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

  /* ---------- organic shapes ---------- */
  // smooth closed blob through n radial points (Catmull-Rom → Bézier)
  function blob(cx, cy, r, { seed = 3, n = 7, irr = 0.28, sx = 1, sy = 1, rot = 0 } = {}) {
    const R = rnd(seed)
    const pts = []
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rot
      const rr = r * (1 - irr / 2 + irr * R())
      pts.push([cx + Math.cos(a) * rr * sx, cy + Math.sin(a) * rr * sy])
    }
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6]
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6]
      d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
    }
    return d + 'Z'
  }
  const arch = (x, y, w, h) => `M${x},${y + h} L${x},${y + w / 2} A${w / 2},${w / 2} 0 0 1 ${x + w},${y + w / 2} L${x + w},${y + h} Z`
  const pill = (x, y, w, h) => `M${x + w / 2},${y} L${x + w / 2},${y} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${y + w} L${x + w / 2},${y + h - w} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${y + h} A${w / 2},${w / 2} 0 0 1 ${x + w / 2},${y + h - w} Z`
  const wave = (x, y, w, h, amp = 60, seed = 2) => {
    const R = rnd(seed)
    let d = `M${x},${y + h}`
    d += ` L${x},${y + amp}`
    const k = 4
    for (let i = 0; i < k; i++) {
      const x0 = x + (w / k) * i, x1 = x + (w / k) * (i + 1)
      d += ` C${x0 + w / k / 3},${y + amp * (R() * 2 - 0.5)} ${x1 - w / k / 3},${y + amp * (R() * 2 - 0.5)} ${x1},${y + amp * (0.4 + R())}`
    }
    return d + ` L${x + w},${y + h} Z`
  }

  /* ---------- svg wrappers ---------- */
  const svg = (w, h, inner, style = '') => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="${full}${style}" xmlns="http://www.w3.org/2000/svg">${inner}</svg>`
  // photo clipped by any path, with CSS filter
  const masked = (w, h, d, src, { filter = 'none', fit = 'xMidYMid slice', x = 0, y = 0, iw = w, ih = h, shadow = '' } = {}) => {
    const c = id('c')
    return svg(w, h, `<defs><clipPath id="${c}"><path d="${d}"/></clipPath></defs><image href="${src}" x="${x}" y="${y}" width="${iw}" height="${ih}" preserveAspectRatio="${fit}" clip-path="url(#${c})" style="filter:${filter}"/>`, shadow ? `filter:${shadow}` : '')
  }
  const shape = (w, h, d, fill, extra = '') => svg(w, h, `<path d="${d}" fill="${fill}" ${extra}/>`)
  const gradShape = (w, h, d, stops, { type = 'radial', cx = '35%', cy = '30%', r = '75%', angle = 160, shadow = '' } = {}) => {
    const g = id('g')
    const st = stops.map(([o, c, a = 1]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')
    const def = type === 'radial' ? `<radialGradient id="${g}" cx="${cx}" cy="${cy}" r="${r}">${st}</radialGradient>` : `<linearGradient id="${g}" gradientTransform="rotate(${angle - 90} .5 .5)">${st}</linearGradient>`
    return svg(w, h, `<defs>${def}</defs><path d="${d}" fill="url(#${g})"/>`, shadow ? `filter:${shadow}` : '')
  }

  /* ---------- gradients ---------- */
  const glow = (x, y, size, color, blur = 80, alpha = 1) => A(`left:${x - size / 2}px;top:${y - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};opacity:${alpha};filter:blur(${blur}px)`)
  const mesh = (base, spots) => `<div style="${full}background:${base};overflow:hidden">${spots.map(([x, y, s, c, b, a]) => glow(x, y, s, c, b, a)).join('')}</div>`

  /* ---------- textures (alpha 0..1) ---------- */
  const noise = ({ freq = 0.9, oct = 3, alpha = 0.12, seed = 4, blend = 'overlay', rgb = [0.5, 0.45, 0.4], bias = -0.35, gain = 1.4 } = {}) => {
    const f = id('n')
    return `<svg style="${full}mix-blend-mode:${blend}" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  0 0 0 ${gain} ${bias}"/></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${alpha * 3}"/></svg>`
  }
  const film = (alpha = 0.1) => noise({ freq: 1.9, oct: 1, alpha, blend: 'overlay', rgb: [0.55, 0.5, 0.45] }) + noise({ freq: 0.9, oct: 2, alpha: alpha * 0.4, blend: 'soft-light', rgb: [0.2, 0.15, 0.1] })
  // lit relief (thick paper, crumpled paper, embossing of the paper itself)
  const relief = ({ freq = 0.04, oct = 4, scale = 2, alpha = 0.5, light = '#FBF3E6', az = 225, el = 55, seed = 8, blend = 'multiply' } = {}) => {
    const f = id('r')
    return `<svg style="${full}mix-blend-mode:${blend}" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="${freq < 0.02 ? 'turbulence' : 'fractalNoise'}" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" result="t"/><feDiffuseLighting in="t" surfaceScale="${scale}" lighting-color="${light}" diffuseConstant="1.05"><feDistantLight azimuth="${az}" elevation="${el}"/></feDiffuseLighting></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${alpha}"/></svg>`
  }
  const marble = (w, h, { alpha = 0.35, rgb = [0.42, 0.3, 0.2], seed = 21, fx = 1.6, fy = 3.2 } = {}) => {
    const f = id('m')
    return `<svg style="${full}mix-blend-mode:multiply" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${(fx / w).toFixed(5)} ${(fy / h).toFixed(5)}" numOctaves="6" seed="${seed}" result="t"/><feDisplacementMap in="t" in2="t" scale="${w * 0.08}" result="d"/><feColorMatrix in="d" type="matrix" values="0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  2.2 0 0 0 -0.9"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.1 0.65 0.15 0 0.45 0.08 0 0.3"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${alpha * 2}"/></svg>`
  }
  const sand = (alpha = 0.35) => noise({ freq: 2.2, oct: 1, alpha, blend: 'multiply', rgb: [0.45, 0.35, 0.25], bias: -0.55, gain: 2 }) + noise({ freq: 2.6, oct: 1, alpha: alpha * 0.8, blend: 'screen', rgb: [1, 0.96, 0.9], bias: -0.62, gain: 2, seed: 11 })
  const linen = (alpha = 0.06) => `<div style="${full}background:repeating-linear-gradient(0deg, rgba(60,40,20,${alpha}) 0 1px, transparent 1px 4px),repeating-linear-gradient(90deg, rgba(255,255,255,${alpha * 3}) 0 1px, transparent 1px 5px)"></div>`
  const glass = (css, { tint = 'rgba(255,248,238,0.18)', blur = 22, border = 'rgba(255,255,255,0.35)', radius = 0 } = {}) => A(`${css};background:${tint};backdrop-filter:blur(${blur}px) saturate(1.1);-webkit-backdrop-filter:blur(${blur}px);border:1.5px solid ${border};border-radius:${radius}px;box-shadow:0 30px 60px -30px rgba(20,12,6,0.45)`)
  const vignette = (alpha = 0.45, color = '20,12,6') => `<div style="${full}background:radial-gradient(120% 90% at 50% 40%, rgba(${color},0) 55%, rgba(${color},${alpha}) 100%)"></div>`

  /* ---------- lines / financial motifs ---------- */
  const flow = (w, h, { n = 28, color = 'rgba(216,194,154,0.5)', seed = 5, amp = 0.18, y0 = 0.55, spread = 0.5, width = 1.2 } = {}) => {
    const R = rnd(seed)
    const a = R() * 6.28
    let s = ''
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      const yb = h * (y0 - spread / 2 + spread * t)
      const k = amp * h * (0.6 + 0.4 * Math.sin(t * 3 + a))
      s += `<path d="M${-w * 0.05},${yb} C${w * 0.3},${yb - k} ${w * 0.55},${yb + k * 1.2} ${w * 1.05},${yb - k * 0.4}" fill="none" stroke="${color}" stroke-width="${width}" stroke-opacity="${0.25 + 0.75 * Math.sin(t * Math.PI)}"/>`
    }
    return svg(w, h, s)
  }
  const warpGrid = (w, h, { step = 60, color = 'rgba(216,194,154,0.22)', amp = 40, cx = 0.6, cy = 0.45 } = {}) => {
    let s = ''
    const warp = (x, y) => {
      const dx = x / w - cx, dy = y / h - cy
      const d = Math.exp(-(dx * dx + dy * dy) * 6)
      return [x + dx * amp * 4 * d, y + dy * amp * 4 * d - amp * d]
    }
    for (let x = 0; x <= w; x += step) {
      let d = ''
      for (let y = 0; y <= h; y += 20) { const [X, Y] = warp(x, y); d += `${y ? 'L' : 'M'}${X.toFixed(1)},${Y.toFixed(1)}` }
      s += `<path d="${d}" fill="none" stroke="${color}" stroke-width="1"/>`
    }
    for (let y = 0; y <= h; y += step) {
      let d = ''
      for (let x = 0; x <= w; x += 20) { const [X, Y] = warp(x, y); d += `${x ? 'L' : 'M'}${X.toFixed(1)},${Y.toFixed(1)}` }
      s += `<path d="${d}" fill="none" stroke="${color}" stroke-width="1"/>`
    }
    return svg(w, h, s)
  }
  const rings = (cx, cy, r0, n, color, gap = 22, w = 1080, h = 1350) => svg(w, h, Array.from({ length: n }, (_, i) => `<ellipse cx="${cx}" cy="${cy}" rx="${r0 + i * gap}" ry="${(r0 + i * gap) * 0.92}" fill="none" stroke="${color}" stroke-opacity="${1 - i / n}" stroke-width="1.2"/>`).join(''))
  const candles = (x, y, w, h, color, seed = 9) => {
    const R = rnd(seed)
    let s = '', v = 0.6
    const n = 26
    for (let i = 0; i < n; i++) {
      const o = v; v = Math.max(0.1, Math.min(0.95, v + (R() - 0.42) * 0.12))
      const top = Math.max(o, v), bot = Math.min(o, v)
      const cx = x + (w / n) * (i + 0.5)
      s += `<line x1="${cx}" y1="${y + h * (1 - top - 0.04)}" x2="${cx}" y2="${y + h * (1 - bot + 0.04)}" stroke="${color}" stroke-opacity="0.6"/><rect x="${cx - w / n / 4}" y="${y + h * (1 - top)}" width="${w / n / 2}" height="${Math.max(2, h * (top - bot))}" fill="${color}" fill-opacity="${v > o ? 0.9 : 0.35}"/>`
    }
    return s
  }

  /* ---------- type ---------- */
  const T = (css, txt) => `<div style="position:absolute;${css}">${txt}</div>`
  const outline = (color, w = 2) => `color:transparent;-webkit-text-stroke:${w}px ${color};`
  const emboss = (light = 'rgba(255,250,240,0.9)', dark = 'rgba(80,55,30,0.35)') => `text-shadow:-1.5px -1.5px 1px ${light}, 2px 2px 2px ${dark};`

  window.LIB = { id, full, A, rnd, blob, arch, pill, wave, svg, masked, shape, gradShape, glow, mesh, noise, film, relief, marble, sand, linen, glass, vignette, flow, warpGrid, rings, candles, T, outline, emboss }
})()
