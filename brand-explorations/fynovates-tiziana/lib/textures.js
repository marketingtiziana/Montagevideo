/* Fynovates — 8 textures on the institutional navy (#0D082E).
   Each texture returns an HTML layer (absolute, full size) drawn with CSS / inline SVG only. */
;(function () {
  const NAVY = '#0D082E'
  let uid = 0
  const id = (p) => `${p}${++uid}`
  const full = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;'

  // deterministic pseudo-random
  const rnd = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646

  function noise({ freq = '0.9', octaves = 2, opacity = 0.08, blend = 'soft-light', seed = 3 }) {
    const f = id('n')
    return `<svg style="${full}mix-blend-mode:${blend}" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${octaves}" seed="${seed}" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#${f})" opacity="${opacity}"/></svg>`
  }

  function topo(w, h, { seed = 7, alpha = 0.08 } = {}) {
    const r = rnd(seed)
    const centers = [
      [w * 0.78, h * 0.3],
      [w * 0.18, h * 0.92],
      [w * 1.05, h * 1.1],
    ]
    const unit = Math.max(w, h) / 34
    let paths = ''
    centers.forEach(([cx, cy], ci) => {
      const p1 = r() * 6.28
      const p2 = r() * 6.28
      const rings = ci === 0 ? 16 : 12
      for (let k = 1; k <= rings; k++) {
        const base = k * unit * (ci === 0 ? 1 : 1.25)
        let d = ''
        for (let a = 0; a <= 64; a++) {
          const t = (a / 64) * Math.PI * 2
          const rr = base * (1 + 0.13 * Math.sin(3 * t + p1 + k * 0.18) + 0.07 * Math.sin(5 * t + p2 - k * 0.11))
          const x = cx + rr * Math.cos(t) * 1.25
          const y = cy + rr * Math.sin(t)
          d += `${a ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`
        }
        paths += `<path d="${d}Z" fill="none" stroke="rgba(255,255,255,${k % 4 === 0 ? alpha * 1.6 : alpha})" stroke-width="${k % 4 === 0 ? 1.4 : 1}"/>`
      }
    })
    return `<svg style="${full}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${paths}</svg>`
  }

  function architecture(w, h) {
    const cols = 12
    let s = ''
    for (let i = 1; i < cols; i++) s += `<line x1="${(w / cols) * i}" y1="0" x2="${(w / cols) * i}" y2="${h}" stroke="rgba(255,255,255,${i % 3 === 0 ? 0.07 : 0.035})" stroke-width="1"/>`
    const rows = 6
    for (let j = 1; j < rows; j++) s += `<line x1="0" y1="${(h / rows) * j}" x2="${w}" y2="${(h / rows) * j}" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>`
    s += `<rect x="${w * 0.58}" y="${h * 0.12}" width="${w * 0.34}" height="${h * 0.62}" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.08)"/>`
    s += `<rect x="${w * 0.66}" y="${h * 0.34}" width="${w * 0.34}" height="${h * 0.66}" fill="rgba(7,5,28,0.35)" stroke="rgba(255,255,255,0.06)"/>`
    s += `<path d="M${w * 0.58},${h * 0.74} L${w * 0.66},${h * 0.74}" stroke="rgba(255,255,255,0.12)"/>`
    return `<svg style="${full}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${s}</svg>`
  }

  function mineral(w, h) {
    const f = id('m')
    return `<svg style="${full}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><filter id="${f}" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="${(2.2 / w).toFixed(5)} ${(6 / h).toFixed(5)}" numOctaves="5" seed="11"/>
      <feColorMatrix type="matrix" values="0 0 0 0 0.66  0 0 0 0 0.68  0 0 0 0 1  1.6 0 0 0 -0.62"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.04 0.4 0.06 0 0.22 0.03 0"/></feComponentTransfer>
    </filter><rect width="100%" height="100%" filter="url(#${f})" opacity="0.1"/></svg>`
  }

  const T = [
    {
      key: 'grain',
      num: '01',
      name: 'Grain papier',
      short: 'Grain subtil',
      idea: 'Un grain très fin, comme un papier couché mat : le bleu gagne une matière sans perdre sa netteté.',
      palette: [['Bleu nuit', NAVY], ['Grain clair', '#FFFFFF · 6 %'], ['Blanc', '#FFFFFF']],
      texture: 'Bruit fractal monochrome, intensité 6 à 8 %, fusion « lumière douce »',
      elements: 'Aplat bleu, filets blancs fins, wordmark officiel',
      pros: ['Le plus discret : fonctionne sur tous les supports', 'Supprime l’aspect « écran » des aplats', 'Facile à reproduire en print comme en digital'],
      risks: ['Peut disparaître à la compression (Stories, miniatures)', 'Trop faible, il ne se voit plus ; trop fort, il salit'],
      layer: () => `<div style="${full}background:${NAVY}"></div>` + noise({ opacity: 0.17 }),
    },
    {
      key: 'tonal',
      num: '02',
      name: 'Dégradé tonal',
      short: 'Dégradé tonal',
      idea: 'Trois nuances du même bleu qui glissent l’une vers l’autre : de la profondeur, sans effet.',
      palette: [['Bleu nuit', NAVY], ['Bleu encre', '#07051C'], ['Bleu clair tonal', '#1C1763']],
      texture: 'Deux halos radiaux très étendus, écart de luminosité inférieur à 8 %',
      elements: 'Lumière en haut à droite, ombre en bas à gauche, constante sur tous les supports',
      pros: ['Donne immédiatement du volume', 'Guide l’œil vers la zone de texte', 'Aucune texture à gérer à l’export'],
      risks: ['Bandes visibles si le fichier est trop compressé (ajouter un grain léger)', 'Glisse vite vers « fond d’écran » si l’écart augmente'],
      layer: () => `<div style="${full}background:radial-gradient(120% 95% at 88% 8%, #1C1763 0%, rgba(13,8,46,0) 58%),radial-gradient(90% 85% at 0% 105%, #050314 0%, rgba(13,8,46,0) 60%),${NAVY}"></div>`,
    },
    {
      key: 'mineral',
      num: '03',
      name: 'Pierre polie',
      short: 'Texture minérale',
      idea: 'Des veines presque imperceptibles, comme une pierre bleue polie : la solidité, sans la lourdeur du marbre.',
      palette: [['Bleu nuit', NAVY], ['Veine', '#A8AEFF · 8 %'], ['Blanc', '#FFFFFF']],
      texture: 'Bruit fractal étiré horizontalement, veines extraites par seuils, opacité 10 %',
      elements: 'Veines horizontales, aplats de texte sur zones calmes',
      pros: ['Évoque la stabilité et la durée', 'Très singulier : reconnaissable sans logo', 'Belle sur les grands formats (couvertures, bannières)'],
      risks: ['Chaque génération diffère : figer 2 ou 3 fichiers de référence', 'Peut évoquer le luxe ou la décoration si les veines s’intensifient'],
      layer: (w, h) => `<div style="${full}background:${NAVY}"></div>` + mineral(w, h) + noise({ opacity: 0.06 }),
    },
    {
      key: 'microgrid',
      num: '04',
      name: 'Micro-trame',
      short: 'Micro-trame géométrique',
      idea: 'Un treillis de lignes fines en diagonale et un point régulier : la précision d’un plan d’ingénieur.',
      palette: [['Bleu nuit', NAVY], ['Trame', '#FFFFFF · 4 %'], ['Blanc', '#FFFFFF']],
      texture: 'Deux réseaux de lignes à 45° (pas de 18 px) et une trame de points (pas de 36 px)',
      elements: 'Treillis régulier, zones de texte sur aplat légèrement assombri',
      pros: ['Lisible comme « méthode » et « système »', 'Motif parfaitement reproductible', 'S’accorde avec les schémas et tableaux'],
      risks: ['Effet de moiré possible en petit format', 'Plus technique que chaleureux'],
      layer: () => `<div style="${full}background:repeating-linear-gradient(45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 18px),repeating-linear-gradient(-45deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 18px),radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 1.5px) 0 0/36px 36px,${NAVY}"></div>`,
    },
    {
      key: 'topo',
      num: '05',
      name: 'Lignes topographiques',
      short: 'Topographie',
      idea: 'Des courbes de niveau très fines : les territoires, les frontières franchies, les connexions — sans carte ni globe.',
      palette: [['Bleu nuit', NAVY], ['Courbe', '#FFFFFF · 8 %'], ['Courbe maîtresse', '#FFFFFF · 13 %']],
      texture: 'Courbes de niveau vectorielles autour de trois sommets, une courbe maîtresse sur quatre',
      elements: 'Sommet principal en haut à droite, texte dans les zones ouvertes',
      pros: ['Exprime l’international sans cliché', 'Organique : adoucit le bleu institutionnel', 'Vectoriel, net à toutes les tailles'],
      risks: ['Courant chez les marques de voyage ou d’outdoor : rester très discret', 'Demande de bien placer le texte hors des zones denses'],
      layer: (w, h) => `<div style="${full}background:${NAVY}"></div>` + topo(w, h),
    },
    {
      key: 'textile',
      num: '06',
      name: 'Trame textile',
      short: 'Effet textile',
      idea: 'Une armure de tissu fin, chaîne et trame : la référence au costume, à la tenue, à l’exigence.',
      palette: [['Bleu nuit', NAVY], ['Fil clair', '#FFFFFF · 3 %'], ['Fil sombre', '#000000 · 16 %']],
      texture: 'Lignes horizontales claires et verticales sombres au pas de 4 px, grain léger',
      elements: 'Trame continue, aucun motif dominant',
      pros: ['Évoque le sur-mesure et la tenue', 'Matière perceptible même en petit', 'Très élégant sur les couvertures imprimées'],
      risks: ['Moiré à certaines réductions d’écran', 'Peut sembler « mode » si la trame est trop visible'],
      layer: () => `<div style="${full}background:repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px),repeating-linear-gradient(90deg, rgba(0,0,0,0.16) 0 1px, transparent 1px 4px),${NAVY}"></div>` + noise({ opacity: 0.07 }),
    },
    {
      key: 'depth',
      num: '07',
      name: 'Profondeur lumineuse',
      short: 'Profondeur lumineuse',
      idea: 'Des plans ton sur ton qui se superposent sous une lumière douce : une sensation d’espace, jamais de brillance.',
      palette: [['Bleu nuit', NAVY], ['Plan clair', '#FFFFFF · 3 %'], ['Lumière', '#7A70FF · 10 %']],
      texture: 'Grands plans translucides inclinés, halo bleuté diffus en haut à gauche',
      elements: 'Plans obliques, lumière unique et cohérente',
      pros: ['Le plus « premium » à l’écran', 'Crée une hiérarchie naturelle entre fond et texte', 'Supporte bien les photos détourées'],
      risks: ['Le plus proche d’un rendu « tech » s’il est mal dosé', 'Lumière à garder identique d’un support à l’autre'],
      layer: () =>
        `<div style="${full}background:radial-gradient(70% 70% at 12% 0%, rgba(122,112,255,0.13) 0%, rgba(122,112,255,0) 60%),${NAVY};overflow:hidden">` +
        `<div style="position:absolute;left:38%;top:-40%;width:90%;height:150%;transform:rotate(-14deg);background:rgba(255,255,255,0.028)"></div>` +
        `<div style="position:absolute;left:58%;top:-30%;width:80%;height:150%;transform:rotate(-14deg);background:rgba(255,255,255,0.025)"></div>` +
        `<div style="position:absolute;left:-30%;top:55%;width:90%;height:90%;transform:rotate(-14deg);background:rgba(0,0,0,0.12)"></div></div>`,
    },
    {
      key: 'archi',
      num: '08',
      name: 'Motif architectural',
      short: 'Motif architectural',
      idea: 'Une grille de construction et deux volumes qui s’emboîtent : l’organisation, les systèmes, la structure.',
      palette: [['Bleu nuit', NAVY], ['Volume sombre', '#07051C · 35 %'], ['Ligne', '#FFFFFF · 4 à 12 %']],
      texture: 'Grille de 12 colonnes, deux volumes rectangulaires décalés, filets de liaison',
      elements: 'Colonnes, volumes, alignements stricts',
      pros: ['Traduit « structuration » littéralement', 'Sert de grille de mise en page réelle', 'Cohérent avec les visuels déjà validés (bannières, cartes mentales)'],
      risks: ['Plus rigide, moins chaleureux', 'Les volumes doivent rester derrière le texte, jamais dessus'],
      layer: (w, h) => `<div style="${full}background:${NAVY}"></div>` + architecture(w, h),
    },
  ]
  window.FN_TEXTURES = T
})()
