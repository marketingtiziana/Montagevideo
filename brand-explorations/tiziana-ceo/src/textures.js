/* CEO identity — 8 beige textures used as a signature (touches, bands, panels), never as a default background. */
;(function () {
  const full = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
  let uid = 0
  const id = (p) => `${p}${++uid}`
  const noise = ({ freq = 0.9, oct = 3, alpha = 0.06, seed = 4, blend = 'multiply', rgb = [0.42, 0.35, 0.27] } = {}) => {
    const f = id('n')
    return `<svg style="${full}mix-blend-mode:${blend}" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  0 0 0 1.4 -0.35"/></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${alpha * 4}"/></svg>`
  }
  const relief = (alpha = 0.5) => {
    const f = id('r')
    return `<svg style="${full}mix-blend-mode:multiply" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="8" result="t"/><feDiffuseLighting in="t" surfaceScale="1.6" lighting-color="#F6EFE4" diffuseConstant="1"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${alpha}"/></svg>`
  }
  const veins = (w, h, alpha = 0.1) => {
    const f = id('v')
    return `<svg style="${full}mix-blend-mode:multiply" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${(2.4 / w).toFixed(5)} ${(5 / h).toFixed(5)}" numOctaves="5" seed="21"/><feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.48  0 0 0 0 0.4  1.5 0 0 0 -0.6"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.06 0.5 0.1 0 0.35 0.05 0"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${alpha * 3}"/></svg>`
  }
  const grid = (w, h, color = 'rgba(120,100,80,0.10)') => {
    let s = ''
    for (let i = 1; i < 12; i++) s += `<line x1="${(w / 12) * i}" y1="0" x2="${(w / 12) * i}" y2="${h}" stroke="${color}" stroke-width="${i % 4 === 0 ? 1.4 : 0.8}"/>`
    for (let j = 1; j < 8; j++) s += `<line x1="0" y1="${(h / 8) * j}" x2="${w}" y2="${(h / 8) * j}" stroke="${color}" stroke-width="0.8"/>`
    s += `<rect x="${w * 0.5}" y="${h * 0.125}" width="${w * 0.333}" height="${h * 0.5}" fill="rgba(255,250,242,0.35)" stroke="${color}"/>`
    return `<svg style="${full}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${s}</svg>`
  }

  window.CEO_TEXTURES = [
    { key: 'papier-premium', num: '01', name: 'Papier premium grainé', level: 2, base: '#EDE5D8', hex: [['Crème', '#EDE5D8'], ['Ivoire', '#F7F3EC'], ['Grain', '#6B5A45 · 5 %']], usage: 'Pages de prise de position, citations, couvertures de carrousel claires. La texture par défaut de toutes les surfaces beige.',
      desc: 'Le papier d’un rapport annuel imprimé : un grain fin, régulier, qui donne de la tenue aux aplats sans jamais se voir de loin.',
      layer: (w, h, b) => `<div style="${full}background:${b || '#EDE5D8'}"></div>` + noise({ alpha: 0.05, freq: 0.95 }) },
    { key: 'minerale', num: '02', name: 'Minéral discret', level: 2, base: '#E2D9CB', hex: [['Pierre', '#E2D9CB'], ['Veine', '#8C7A64 · 8 %'], ['Calcaire', '#F2EDE5']], usage: 'Publications finance et économie, couvertures de rapports, fonds de citation institutionnelle.',
      desc: 'Une pierre de hall de siège social : des micro-veines presque invisibles qui évoquent la permanence et la solidité.',
      layer: (w, h, b) => `<div style="${full}background:${b || '#E2D9CB'}"></div>` + veins(w, h, 0.09) + noise({ alpha: 0.03 }) },
    { key: 'degrade-gris', num: '03', name: 'Beige vers gris chaud', level: 1, base: '#E6DED2', hex: [['Beige', '#E9E1D4'], ['Gris chaud', '#B9B1A6'], ['Anthracite chaud', '#5E5A55']], usage: 'Bandeaux de titre sur photo, transitions entre une photo et un bloc de texte, couvertures sombres.',
      desc: 'Un dégradé du beige vers un gris chaud : il relie naturellement les tons chair des photos aux couleurs sombres de l’identité.',
      layer: () => `<div style="${full}background:linear-gradient(170deg, #E9E1D4 0%, #D3CABD 45%, #B9B1A6 100%)"></div>` },
    { key: 'trame', num: '04', name: 'Trame textile fine', level: 2, base: '#E8E0D3', hex: [['Écru', '#E8E0D3'], ['Fil sombre', '#5A4B37 · 4 %'], ['Fil clair', '#FFFFFF · 20 %']], usage: 'Encadrés et cartouches posés sur photo, couvertures de carrousel « expérience ». Rappelle le costume, la tenue.',
      desc: 'Une armure de tissu à peine perceptible : la référence au costume sur mesure, à l’exigence de la tenue.',
      layer: (w, h, b) => `<div style="${full}background:repeating-linear-gradient(0deg, rgba(90,75,55,0.04) 0 1px, transparent 1px 4px),repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0 1px, transparent 1px 5px),${b || '#E8E0D3'}"></div>` + noise({ alpha: 0.04, freq: 0.6 }) },
    { key: 'grain-photo', num: '05', name: 'Grain photographique', level: 3, base: '#1A1D24', hex: [['Grain clair', '#F3EBDF · 6 %'], ['Grain sombre', '#000000 · 8 %'], ['Ton chaud', '#C8B49A · 10 %']], usage: 'Sur toutes les photographies d’un même feed, à intensité constante : il unifie des photos prises à des moments différents.',
      desc: 'Le grain d’un tirage de presse économique : il harmonise les photos, adoucit les écarts de lumière et donne un caractère éditorial.',
      layer: (w, h, b) => `<div style="${full}background:${b || '#2A2B2E'}"></div>` + noise({ alpha: 0.1, freq: 1.7, oct: 1, blend: 'screen', rgb: [0.95, 0.92, 0.87] }) },
    { key: 'architecturale', num: '06', name: 'Architecture ton sur ton', level: 2, base: '#E6DDCF', hex: [['Beige', '#E6DDCF'], ['Ligne', '#78644E · 10 %'], ['Module', '#FFFAF2 · 35 %']], usage: 'Publications « méthode », carrousels stratégiques, schémas. La grille devient la mise en page.',
      desc: 'Une grille de construction de 12 colonnes, ton sur ton : la structure, l’organisation, la rigueur.',
      layer: (w, h, b) => `<div style="${full}background:${b || '#E6DDCF'}"></div>` + grid(w, h) },
    { key: 'translucide', num: '07', name: 'Plans beige translucides', level: 2, base: '#141823', hex: [['Plan crème', '#EDE5D8 · 85 %'], ['Plan sable', '#D5C6AE · 40 %'], ['Fond', 'photo ou couleur sombre']], usage: 'Superposé à une photo de Tiziana pour poser un titre sans masquer son visage. Signature des portraits avec titre.',
      desc: 'Des plans crème et sable translucides, posés sur une photo ou un fond sombre : le beige devient un cartouche, une signature.',
      layer: (w, h, b) => `<div style="${full}background:${b || '#141823'};overflow:hidden"><div style="position:absolute;left:52%;top:10%;width:56%;height:46%;background:rgba(213,198,174,0.40)"></div><div style="position:absolute;left:8%;top:44%;width:58%;height:40%;background:rgba(237,229,216,0.85)"></div></div>` },
    { key: 'micro-relief', num: '08', name: 'Papier crème micro-relief', level: 3, base: '#EFE7DA', hex: [['Crème', '#EFE7DA'], ['Ombre de relief', '#B9A98F'], ['Lumière', '#FBF7F0']], usage: 'Citations signées, cartes de vœux, couvertures de présentation : un papier vergé, presque un faire-part d’entreprise.',
      desc: 'Un papier épais avec un léger relief éclairé de biais : la matière la plus luxueuse, à réserver aux pièces rares.',
      layer: (w, h, b) => `<div style="${full}background:${b || '#EFE7DA'}"></div>` + relief(0.42) + noise({ alpha: 0.03 }) },
  ]
  window.GRAIN = (alpha = 0.07) => noise({ alpha, freq: 1.8, oct: 1, blend: 'overlay', rgb: [0.5, 0.46, 0.42] })
})()
