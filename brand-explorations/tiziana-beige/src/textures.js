/* Tiziana — 8 beige textures. Each returns an absolute full-size layer (CSS / inline SVG / CC0 paper scans). */
;(function () {
  const full = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'
  let uid = 0
  const id = (p) => `${p}${++uid}`

  // warm monochrome noise; `alpha` = intensity
  const grain = ({ freq = 0.85, oct = 3, alpha = 0.08, seed = 4, blend = 'multiply', r = 0.42, g = 0.35, b = 0.27 } = {}) => {
    const f = id('g')
    return `<svg style="${full}mix-blend-mode:${blend}" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 ${r}  0 0 0 0 ${g}  0 0 0 0 ${b}  0 0 0 1.4 -0.35"/></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${alpha * 4}"/></svg>`
  }
  const lightGrain = (alpha) => {
    const f = id('l')
    return `<svg style="${full}mix-blend-mode:screen" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="9" stitchTiles="stitch"/><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 0.97  0 0 0 0 0.92  0 0 0 1.5 -0.55"/></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${alpha * 4}"/></svg>`
  }
  const veins = (w, h, alpha = 0.12) => {
    const f = id('v')
    return `<svg style="${full}mix-blend-mode:multiply" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${(2.4 / w).toFixed(5)} ${(5 / h).toFixed(5)}" numOctaves="5" seed="21"/><feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.47  0 0 0 0 0.38  1.5 0 0 0 -0.6"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.06 0.5 0.1 0 0.35 0.05 0"/></feComponentTransfer></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${alpha * 3}"/></svg>`
  }
  const scan = (file, opacity, blend = 'multiply', extra = '') => `<img src="photographies/libres-de-droits/${file}" alt="" style="${full}object-fit:cover;mix-blend-mode:${blend};opacity:${opacity};${extra}">`

  window.BEIGE_TEXTURES = [
    {
      key: 'papier-editorial', num: '01', name: 'Papier éditorial', intensity: 'Très faible · 5 %',
      base: '#EFE8DC', hex: [['Crème', '#EFE8DC'], ['Ivoire', '#F8F4EC'], ['Sable clair', '#E2D6C3']], second: [['Encre', '#1D1915'], ['Espresso', '#3A2D24'], ['Terre cuite', '#A0714F']],
      desc: 'Un papier couché mat de magazine : le grain ne se voit qu’en approchant. Il retire l’effet « écran » sans jamais concurrencer une photo.',
      layer: (w, h, base) => `<div style="${full}background:${base || '#EFE8DC'}"></div>` + grain({ alpha: 0.05, freq: 0.95 }),
    },
    {
      key: 'papier-artisanal', num: '02', name: 'Papier artisanal', intensity: 'Modérée · 14 %',
      base: '#E6DACA', hex: [['Papier', '#E6DACA'], ['Fibre', '#D6C6AF'], ['Blanc cassé', '#F3ECE1']], second: [['Brun', '#4A3B2A'], ['Argile', '#A86F4C'], ['Encre', '#2E251C']],
      desc: 'Une vraie fibre de papier (scan CC0), légèrement irrégulière : la sensation tactile d’un carnet ou d’une carte de correspondance.',
      layer: (w, h, base) => `<div style="${full}background:${base || '#E6DACA'}"></div>` + scan('papier-beige.jpg', 0.55) + grain({ alpha: 0.06 }),
    },
    {
      key: 'sable', num: '03', name: 'Sable', intensity: 'Faible · 8 %',
      base: '#E4D6C1', hex: [['Sable', '#E4D6C1'], ['Dune', '#D9C6AA'], ['Lumière', '#F1E8DA']], second: [['Brun chaud', '#5A4532'], ['Ocre doux', '#B48A5E'], ['Encre', '#2F261E']],
      desc: 'Un dégradé très doux et un fin pigment minéral, comme du sable fin en lumière rasante : lumineux, naturel, jamais plat.',
      layer: (w, h, base) => `<div style="${full}background:radial-gradient(120% 90% at 20% 10%, #F1E8DA 0%, rgba(241,232,218,0) 60%),linear-gradient(160deg, ${base || '#E4D6C1'} 0%, #D9C6AA 100%)"></div>` + grain({ alpha: 0.08, freq: 1.3, oct: 2 }),
    },
    {
      key: 'lin', num: '04', name: 'Lin', intensity: 'Faible · 7 %',
      base: '#E8E0D2', hex: [['Écru', '#E8E0D2'], ['Lin', '#D8CCB8'], ['Blanc lin', '#F5F1EA']], second: [['Noir', '#111111'], ['Gris pierre', '#6E675D'], ['Sable', '#CDBFA8']],
      desc: 'Une trame textile très fine, chaîne et trame à peine visibles : la référence au tissu, à la tenue, au sur-mesure.',
      layer: (w, h, base) =>
        `<div style="${full}background:repeating-linear-gradient(0deg, rgba(90,75,55,0.045) 0 1px, transparent 1px 4px),repeating-linear-gradient(90deg, rgba(255,255,255,0.22) 0 1px, transparent 1px 5px),${base || '#E8E0D2'}"></div>` +
        grain({ alpha: 0.05, freq: 0.6 }),
    },
    {
      key: 'mineral', num: '05', name: 'Pierre beige', intensity: 'Faible · 9 %',
      base: '#E3D9C9', hex: [['Pierre', '#E3D9C9'], ['Travertin', '#CBBBA2'], ['Calcaire', '#F5F0E8']], second: [['Bleu nuit', '#0D082E'], ['Taupe', '#8C7F6E'], ['Encre', '#1F1B17']],
      desc: 'Des micro-veines de travertin, presque imperceptibles : l’architecture, la durée, la pierre d’un hall de bureau.',
      layer: (w, h, base) => `<div style="${full}background:${base || '#E3D9C9'}"></div>` + veins(w, h, 0.1) + grain({ alpha: 0.04 }),
    },
    {
      key: 'degrade-chaud', num: '06', name: 'Dégradé chaud', intensity: 'Aucun grain · dégradé seul',
      base: '#E9DCC8', hex: [['Clair', '#F2E9DC'], ['Moyen', '#E2D1B8'], ['Profond', '#C9B190']], second: [['Brun profond', '#3B2A20'], ['Caramel', '#9A6E47'], ['Ivoire', '#FAF6EF']],
      desc: 'Du beige clair au beige profond, en diagonale : de la profondeur et une direction de lumière, sans aucun effet artificiel.',
      layer: () => `<div style="${full}background:linear-gradient(155deg, #F2E9DC 0%, #E2D1B8 55%, #C9B190 100%)"></div>`,
    },
    {
      key: 'translucide', num: '07', name: 'Superpositions translucides', intensity: 'Aucun grain · plans à 35–60 %',
      base: '#E6DCCB', hex: [['Base', '#E6DCCB'], ['Plan crème', '#F7F2EA · 60 %'], ['Plan sable', '#CDBDA5 · 45 %']], second: [['Encre', '#1F1B17'], ['Bleu nuit', '#0D082E'], ['Taupe', '#8C7F6E']],
      desc: 'Des plans translucides crème et sable qui se chevauchent : une composition contemporaine, presque architecturale, toujours légère.',
      layer: (w, h, base) =>
        `<div style="${full}background:${base || '#E6DCCB'};overflow:hidden"><div style="position:absolute;left:44%;top:-8%;width:62%;height:70%;background:rgba(247,242,234,0.6)"></div><div style="position:absolute;left:-10%;top:52%;width:70%;height:60%;background:rgba(205,189,165,0.45)"></div><div style="position:absolute;left:30%;top:36%;width:40%;height:34%;background:rgba(247,242,234,0.35)"></div></div>`,
    },
    {
      key: 'photographique', num: '08', name: 'Grain photographique', intensity: 'Modérée · 12 %, lumineux',
      base: '#E7DCCB', hex: [['Tirage', '#E7DCCB'], ['Halo', '#F4ECDF'], ['Ombre chaude', '#C7B39A']], second: [['Encre', '#231D17'], ['Sépia', '#7A5E45'], ['Blanc cassé', '#F8F3EB']],
      desc: 'Le grain d’un tirage argentique et un halo de lumière naturelle : analogique, chaleureux, éditorial. Il s’applique aussi sur les photos.',
      layer: (w, h, base) => `<div style="${full}background:radial-gradient(90% 80% at 75% 20%, #F4ECDF 0%, rgba(244,236,223,0) 65%),radial-gradient(120% 100% at 50% 120%, rgba(150,120,90,0.25) 0%, rgba(150,120,90,0) 60%),${base || '#E7DCCB'}"></div>` + grain({ alpha: 0.1, freq: 1.6, oct: 1 }) + lightGrain(0.05),
    },
  ]

  /* photo finishing reused by directions: film grain on top of a photo */
  window.PHOTO_GRAIN = (alpha = 0.08) => grain({ alpha, freq: 1.7, oct: 1, blend: 'overlay', r: 0.5, g: 0.45, b: 0.4 })
})()
