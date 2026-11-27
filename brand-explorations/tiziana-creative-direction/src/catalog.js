/* Catalogues: 14 gradients, 12 textures, 12 shapes, 12 typographic experiments, 10 photo treatments, 10 portrait compositions.
   Each tile renders at native size (w × h) and is reused by the boards and the single exports. */
;(function () {
  const L = window.LIB
  const { A, T, svg, blob, arch, masked, gradShape, glow, mesh, noise, film, relief, marble, sand, linen, glass, vignette, flow, warpGrid, rings, outline, emboss } = L
  const P = window.P
  const full = L.full
  const bg = (css) => `<div style="${full}background:${css}"></div>`

  window.GRADIENTS = [
    { n: '01', name: 'Beige → champagne lumineux', hex: '#D9C3A0 → #F3E4C6', use: 'Fonds de citation, couvertures claires', r: (w, h) => bg('linear-gradient(165deg,#F6EBD5 0%,#EAD6B2 40%,#D2B78E 100%)') + glow(w * 0.3, h * 0.25, w * 0.9, '#FFF7E8', w * 0.12, 0.9) + film(0.06) },
    { n: '02', name: 'Sable → brun profond', hex: '#D8BF98 → #2A1D15', use: 'Titres monumentaux, manifestes', r: () => bg('linear-gradient(180deg,#E3CCA6 0%,#B8976E 35%,#6B4F38 68%,#2A1D15 100%)') + film(0.08) },
    { n: '03', name: 'Radial champagne sur expresso', hex: '#F0DDBC · #1C130D', use: 'Visuels finance, portraits sur halo', r: () => bg('radial-gradient(60% 50% at 50% 45%,#F6E6C8 0%,#C8A97E 30%,#5A4330 62%,#1C130D 100%)') + film(0.08) },
    { n: '04', name: 'Halo lumineux', hex: '#FFFFFF · #9A836B', use: 'Portrait détouré sur dégradé lumineux', r: (w, h) => bg('#9A836B') + glow(w * 0.55, h * 0.4, w * 0.8, '#FFF8EC', w * 0.08, 1) + glow(w * 0.55, h * 0.4, w * 1.4, '#E8D3AE', w * 0.15, 0.8) + film(0.06) },
    { n: '05', name: 'Maillage flou sable', hex: '4 couleurs · flou 140 px', use: 'Fonds vivants, couvertures de carrousel', r: (w, h) => mesh('#C9AE88', [[w * 0.2, h * 0.2, w * 0.9, '#F4E5C9', w * 0.13, 1], [w * 0.9, h * 0.4, w * 0.7, '#9A7A58', w * 0.14, 1], [w * 0.4, h * 0.95, w * 0.8, '#5A4330', w * 0.14, 0.9]]) + film(0.07) },
    { n: '06', name: 'Zones de lumière', hex: 'Faisceaux #FFF6E6 · 35 %', use: 'Architecture, environnements', r: (w, h) => bg('linear-gradient(170deg,#2A1D15,#6B523A)') + [[0.15, 0.35, 0.9], [0.45, 0.22, 0.6], [0.7, 0.12, 0.45]].map(([x, wd, o]) => A(`left:${w * x}px;top:${-h * 0.2}px;width:${w * wd}px;height:${h * 1.5}px;transform:rotate(28deg);transform-origin:0 0;background:linear-gradient(90deg,rgba(255,240,214,0),rgba(255,240,214,${o * 0.55}),rgba(255,240,214,0));filter:blur(${w * 0.03}px)`)).join('') + glow(w * 0.2, h * 0.1, w * 0.6, '#FFF1D8', w * 0.1, 0.5) + film(0.08) },
    { n: '07', name: 'Superpositions translucides', hex: '3 plans · 40–85 %', use: 'Cartouches de titre sur photo', r: (w, h) => bg('#2A1D15') + A(`left:${w * 0.1}px;top:${h * 0.08}px;width:${w * 0.7}px;height:${h * 0.6}px;border-radius:${w}px;background:linear-gradient(160deg,rgba(234,216,184,.7),rgba(234,216,184,0))`) + A(`left:${w * 0.35}px;top:${h * 0.35}px;width:${w * 0.7}px;height:${h * 0.6}px;border-radius:${w}px;background:linear-gradient(200deg,rgba(201,168,120,.6),rgba(201,168,120,0))`) + A(`left:${-w * 0.1}px;top:${h * 0.55}px;width:${w * 0.7}px;height:${h * 0.5}px;border-radius:${w}px;background:linear-gradient(20deg,rgba(255,245,228,.5),rgba(255,245,228,0))`) + film(0.06) },
    { n: '08', name: 'Diffus et grain', hex: '#C68B52 → #3A1A0E · grain 20 %', use: 'Direction Modern CEO', r: (w, h) => mesh('#3A1A0E', [[w * 0.25, h * 0.25, w, '#F0C894', w * 0.13, 1], [w * 0.8, h * 0.6, w * 0.8, '#C2562F', w * 0.14, 0.9]]) + film(0.22) },
    { n: '09', name: 'Horizon nuit → champagne', hex: '#0C1626 → #EADCC0', use: 'Direction Abstract Financial', r: () => bg('linear-gradient(180deg,#0C1626 0%,#17253B 38%,#6F6150 62%,#D8C29A 80%,#EADCC0 100%)') + film(0.06) },
    { n: '10', name: 'Conique sculpturale', hex: '#F3E6CD · #5A4330', use: 'Volumes, sphères, socles', r: () => bg('conic-gradient(from 210deg at 40% 40%,#F3E6CD,#C8AC85 25%,#5A4330 50%,#C8AC85 75%,#F3E6CD)') + bg('radial-gradient(circle at 40% 40%,rgba(255,255,255,.0) 0,rgba(42,29,21,.5) 100%)') + film(0.07) },
    { n: '11', name: 'Brouillard blanc cassé → gris chaud', hex: '#F4EEE4 → #A39A8E', use: 'Pages respirantes, carrousels pédagogiques', r: (w, h) => bg('linear-gradient(180deg,#F4EEE4,#D6CEC2 55%,#A39A8E)') + glow(w * 0.7, h * 0.3, w * 0.8, '#FFFFFF', w * 0.12, 0.8) + film(0.05) },
    { n: '12', name: 'Cognac → brique (audacieux)', hex: '#9E3B26 · #E8B57E', use: 'Lancements, prises de position fortes', r: (w, h) => mesh('#7A3E1D', [[w * 0.2, h * 0.2, w, '#E8B57E', w * 0.13, 1], [w * 0.9, h * 0.15, w * 0.6, '#9E3B26', w * 0.13, 0.9], [w * 0.7, h, w * 0.9, '#141010', w * 0.13, 1]]) + film(0.14) },
    { n: '13', name: 'Marine → sable diagonal', hex: '#17253B → #E6D6B8', use: 'Couvertures internationales', r: () => bg('linear-gradient(135deg,#0C1626 0%,#24385A 35%,#8F826D 65%,#E6D6B8 100%)') + film(0.06) },
    { n: '14', name: 'Taupe velours', hex: '#9C8670 · #5E4A3A', use: 'Fonds de portrait noir et blanc', r: (w, h) => bg('radial-gradient(120% 90% at 30% 10%,#C2AE94,#9C8670 40%,#5E4A3A 100%)') + noise({ alpha: 0.08, freq: 0.6, oct: 4, blend: 'soft-light' }) },
  ]

  window.TEXTURES = [
    { n: '01', name: 'Papier épais embossé', use: 'Citations signées, pièces rares', r: () => bg('radial-gradient(90% 80% at 30% 20%,#FAF1E1,#E8D6B6 70%,#CDB48C)') + relief({ alpha: 0.6, freq: 0.03, scale: 3.5 }) + noise({ alpha: 0.04, blend: 'multiply' }) },
    { n: '02', name: 'Papier froissé subtil', use: 'Manifestes, publications « opinion »', r: () => bg('#E9DCC6') + relief({ alpha: 0.85, freq: 0.008, oct: 6, scale: 9, el: 40, seed: 31 }) },
    { n: '03', name: 'Grain analogique', use: 'Sur toutes les photos d’un feed', r: () => bg('linear-gradient(160deg,#6B523A,#2A1D15)') + film(0.22) },
    { n: '04', name: 'Minéral', use: 'Fonds de citation institutionnelle', r: (w, h) => bg('#CDB89A') + marble(w, h, { alpha: 0.12, rgb: [0.35, 0.28, 0.2], fx: 4, fy: 4, seed: 12 }) + noise({ alpha: 0.12, freq: 0.5, oct: 5, blend: 'multiply' }) + relief({ alpha: 0.3, freq: 0.08, scale: 1.2 }) },
    { n: '05', name: 'Marbre beige abstrait', use: 'Sculptural Executive', r: (w, h) => bg('linear-gradient(160deg,#F1E5D0,#D9C3A0)') + marble(w, h, { alpha: 0.35 }) },
    { n: '06', name: 'Sable macro', use: 'Dégradés sable, publications « temps long »', r: () => bg('radial-gradient(90% 70% at 30% 20%,#F0DDBC,#C8A97E 60%,#8B6C4C)') + sand(0.6) },
    { n: '07', name: 'Texture textile', use: 'Cartouches, encadrés', r: () => bg('#D9C7A8') + linen(0.08) + img('lin-textile', 0.25) },
    { n: '08', name: 'Verre dépoli', use: 'Titres sur photo, données', r: (w, h) => `<img src="${P['facade-ondulee']}" style="${full}object-fit:cover;filter:sepia(.5)">` + glass(`left:${w * 0.1}px;top:${h * 0.15}px;width:${w * 0.8}px;height:${h * 0.7}px`, { tint: 'rgba(240,226,200,.25)', blur: 18, radius: w * 0.06 }) },
    { n: '09', name: 'Effet translucide', use: 'Superposition sur portrait', r: (w, h) => `<img src="${P['tz-balcon-message']}" style="${full}object-fit:cover;object-position:50% 25%;filter:sepia(.2)">` + A(`left:0;top:${h * 0.45}px;width:${w}px;height:${h * 0.55}px;background:linear-gradient(180deg,rgba(234,216,184,0),rgba(234,216,184,.85))`) + A(`left:${w * 0.45}px;top:0;width:${w * 0.55}px;height:${h}px;background:rgba(201,168,120,.35);mix-blend-mode:multiply`) },
    { n: '10', name: 'Emboss typographique', use: 'Mots-signatures en relief', r: (w, h) => bg('#E4D0AC') + relief({ alpha: 0.4, freq: 0.04, scale: 2 }) + T(`left:0;right:0;top:${h * 0.32}px;text-align:center;font:500 ${w * 0.3}px/1 'Cormorant Garamond';color:#E4D0AC;${emboss('rgba(255,252,244,1)', 'rgba(110,80,48,.55)')}`, 'TC') },
    { n: '11', name: 'Matières superposées', use: 'Compositions multi-plans', r: (w, h) => bg('#3A2A1E') + A(`left:${w * 0.08}px;top:${h * 0.1}px;width:${w * 0.6}px;height:${h * 0.7}px;overflow:hidden;box-shadow:20px 30px 40px rgba(0,0,0,.45)`, bg('#E9DCC6') + relief({ alpha: 0.8, freq: 0.01, oct: 5, scale: 7 })) + A(`left:${w * 0.35}px;top:${h * 0.3}px;width:${w * 0.55}px;height:${h * 0.6}px;overflow:hidden;box-shadow:20px 30px 40px rgba(0,0,0,.45)`, bg('#CDB89A') + marble(w, h, { alpha: 0.3 })) + A(`left:${w * 0.2}px;top:${h * 0.55}px;width:${w * 0.4}px;height:${h * 0.3}px;overflow:hidden;box-shadow:20px 30px 40px rgba(0,0,0,.45)`, bg('#D9C7A8') + linen(0.1)) },
    { n: '12', name: 'Pellicule argentique', use: 'Portraits noir et blanc', r: (w, h) => `<img src="${P['tz-studio-marine']}" style="${full}object-fit:cover;object-position:50% 20%;filter:grayscale(1) contrast(1.3) brightness(.95)">` + film(0.3) + vignette(0.6, '10,8,6') + A(`left:0;right:0;top:0;height:${h * 0.05}px;background:#0B0907`) + A(`left:0;right:0;bottom:0;height:${h * 0.05}px;background:#0B0907`) + svg(w, h, Array.from({ length: 10 }, (_, i) => `<rect x="${w * 0.04 + i * w * 0.1}" y="${h * 0.012}" width="${w * 0.04}" height="${h * 0.025}" rx="3" fill="#E9DCC6" opacity=".7"/><rect x="${w * 0.04 + i * w * 0.1}" y="${h * 0.963}" width="${w * 0.04}" height="${h * 0.025}" rx="3" fill="#E9DCC6" opacity=".7"/>`).join('')) },
  ]
  function img(k, a) { return `<img src="${P[k]}" style="${full}object-fit:cover;mix-blend-mode:multiply;opacity:${a}">` }

  window.SHAPES = [
    { n: '01', name: 'Forme fluide', r: (w, h) => bg('#E9D9BC') + gradShape(w, h, blob(w / 2, h / 2, w * 0.38, { seed: 3, irr: 0.35 }), [['0%', '#F6EBD6'], ['60%', '#C8AC85'], ['100%', '#6A513B']], { shadow: 'drop-shadow(20px 30px 30px rgba(40,25,10,.35))' }) },
    { n: '02', name: 'Courbe asymétrique', r: (w, h) => bg('#2A1D15') + gradShape(w, h, `M0,${h * 0.55} C${w * 0.3},${h * 0.3} ${w * 0.6},${h * 0.95} ${w},${h * 0.45} L${w},${h} L0,${h} Z`, [['0%', '#EAD8B8'], ['100%', '#9A836B']], { type: 'linear', angle: 180 }) },
    { n: '03', name: 'Découpe', r: (w, h) => `<img src="${P['skyline-ville']}" style="${full}object-fit:cover;filter:sepia(.4)">` + svg(w, h, `<path fill-rule="evenodd" d="M0,0 H${w} V${h} H0 Z ${blob(w / 2, h * 0.48, w * 0.3, { seed: 7, irr: 0.25 })}" fill="#E6D3B2"/>`) },
    { n: '04', name: 'Silhouette abstraite', r: (w, h) => bg('#CDB89A') + [[0.5, 0.78, 0.3, 5], [0.48, 0.52, 0.2, 9], [0.52, 0.32, 0.13, 2]].map(([x, y, r, s]) => gradShape(w, h, blob(w * x, h * y, w * r, { seed: s, irr: 0.2, sy: 0.75 }), [['0%', '#F3E6CD'], ['100%', '#5A4330']], { cx: '30%', cy: '20%', shadow: 'drop-shadow(10px 20px 20px rgba(40,25,10,.35))' })).join('') },
    { n: '05', name: 'Volumes arrondis', r: (w, h) => bg('linear-gradient(180deg,#EADBC2,#BFA27C)') + [[0.3, 0.6, 0.22], [0.66, 0.45, 0.16], [0.6, 0.78, 0.1]].map(([x, y, r]) => gradShape(w, h, blob(w * x, h * y, w * r, { irr: 0.01, n: 8 }), [['0%', '#FFF7E6'], ['55%', '#D2B48A'], ['100%', '#5E4630']], { cx: '32%', cy: '25%', shadow: 'drop-shadow(18px 28px 24px rgba(40,25,10,.4))' })).join('') },
    { n: '06', name: 'Arches architecturales', r: (w, h) => bg('#1C130D') + [0, 1, 2].map((i) => gradShape(w, h, arch(w * (0.1 + i * 0.28), h * (0.3 - i * 0.08), w * 0.24, h * (0.6 + i * 0.08)), [['0%', '#EAD8B8'], ['100%', '#6B523A']], { type: 'linear', angle: 180 })).join('') },
    { n: '07', name: 'Cercle déformé', r: (w, h) => bg('#0C1626') + gradShape(w, h, blob(w / 2, h / 2, w * 0.34, { seed: 11, irr: 0.12, n: 9 }), [['0%', '#FFF5E0'], ['50%', '#D8C29A'], ['100%', '#4A3424']]) + rings(w / 2, h / 2, w * 0.36, 5, 'rgba(216,194,154,.5)', w * 0.03, w, h) },
    { n: '08', name: 'Contours irréguliers', r: (w, h) => bg('#EBD8B8') + svg(w, h, Array.from({ length: 6 }, (_, i) => `<path d="${blob(w / 2, h / 2, w * (0.12 + i * 0.05), { seed: 4, irr: 0.35 })}" fill="none" stroke="#7A3E1D" stroke-opacity="${1 - i * 0.14}" stroke-width="2"/>`).join('')) },
    { n: '09', name: 'Masque photo organique', r: (w, h) => bg('#C68B52') + masked(w, h, blob(w / 2, h / 2, w * 0.42, { seed: 25, irr: 0.35, sy: 1.2 }), P['tz-studio-vert-reflexion'], { filter: 'sepia(.15)', shadow: 'drop-shadow(0 20px 30px rgba(40,15,5,.45))' }) },
    { n: '10', name: 'Masque photo arche', r: (w, h) => bg('#E9D9BC') + masked(w, h, arch(w * 0.2, h * 0.1, w * 0.6, h * 0.85), P['tz-fenetre-ronde-contre-jour'], { filter: 'sepia(.15)' }) + svg(w, h, `<path d="${arch(w * 0.16, h * 0.07, w * 0.68, h * 0.9)}" fill="none" stroke="#2A1D15" stroke-width="1.5"/>`) },
    { n: '11', name: 'Galets empilés en capsule', r: (w, h) => bg('#3A2A1E') + [0, 1, 2, 3].map((i) => A(`left:${w * (0.12 + i * 0.2)}px;top:${h * (0.18 + (i % 2) * 0.12)}px;width:${w * 0.16}px;height:${h * 0.6}px;border-radius:${w}px;background:linear-gradient(180deg,${['#F3E6CD', '#D8BF98', '#C8AC85', '#9A836B'][i]},rgba(42,29,21,.2));box-shadow:14px 24px 30px rgba(0,0,0,.4)`)).join('') },
    { n: '12', name: 'Orbites et flux', r: (w, h) => bg('#141010') + flow(w, h, { n: 30, color: '#E8B57E', y0: 0.5, spread: 0.6, amp: 0.2, seed: 9 }) + rings(w * 0.65, h * 0.4, w * 0.08, 9, 'rgba(246,240,231,.5)', w * 0.035, w, h) },
  ]

  const ph = (k, pos = '50% 25%', f = 'sepia(.12)') => `<img src="${P[k]}" style="${full}object-fit:cover;object-position:${pos};filter:${f}">`
  window.TYPE = [
    { n: '01', name: 'Titre XXL', r: (w, h) => bg('#2A1D15') + T(`left:-${w * 0.04}px;top:${h * 0.2}px;font:500 ${w * 0.42}px/0.8 'Cormorant Garamond';color:#EAD8B8;letter-spacing:-.04em`, 'Vision') },
    { n: '02', name: 'Titre coupé par le cadre', r: (w, h) => bg('#E6D7BE') + T(`left:-${w * 0.1}px;bottom:-${w * 0.09}px;font:400 ${w * 0.5}px/0.8 'DM Serif Display';color:#0F0C0A;letter-spacing:-.05em;white-space:nowrap`, 'Décider') },
    { n: '03', name: 'Serif contemporain', r: (w, h) => bg('#F4EEE4') + T(`left:${w * 0.08}px;top:${h * 0.22}px;width:${w * 0.85}px;font:300 ${w * 0.12}px/0.95 Fraunces;color:#2A1D15;letter-spacing:-.03em`, 'La clarté <i style="font-weight:800">est</i> une décision.') },
    { n: '04', name: 'Sans-serif affirmé', r: (w, h) => bg('#0C1626') + T(`left:${w * 0.07}px;top:${h * 0.2}px;width:${w * 0.9}px;font:800 ${w * 0.15}px/0.88 Manrope;color:#F2ECE2;letter-spacing:-.06em`, 'CLARTÉ AVANT VITESSE') },
    { n: '05', name: 'Lettres superposées', r: (w, h) => bg('#141010') + 'TC'.split('').map((c, i) => T(`left:${w * (0.1 + i * 0.3)}px;top:${h * 0.12}px;font:900 ${w * 0.6}px/0.8 Fraunces;color:${['#E8B57E', '#9E3B26'][i]};mix-blend-mode:screen`, c)).join('') },
    { n: '06', name: 'Texte vertical', r: (w, h) => bg('#D9C3A0') + T(`left:${w * 0.08}px;top:${h * 0.06}px;writing-mode:vertical-rl;transform:rotate(180deg);font:500 ${w * 0.18}px/1 'Cormorant Garamond';color:#2A1D15;height:${h * 0.88}px`, 'Structurer') + T(`left:${w * 0.42}px;top:${h * 0.08}px;writing-mode:vertical-rl;font:600 ${w * 0.04}px/1 Manrope;letter-spacing:.4em;color:#6B4F38`, 'AVANT D’ACCÉLÉRER') },
    { n: '07', name: 'Chiffre monumental', r: (w, h) => bg('linear-gradient(160deg,#EAD8B8,#9A836B)') + T(`left:-${w * 0.03}px;top:-${h * 0.06}px;font:500 ${w * 0.95}px/1 'Cormorant Garamond';color:#2A1D15;letter-spacing:-.06em`, '04') },
    { n: '08', name: 'Titre transparent (contour)', r: (w, h) => ph('tz-studio-marine-reflexion', '50% 20%', 'grayscale(1) contrast(1.1)') + T(`left:${w * 0.04}px;top:${h * 0.55}px;font:800 ${w * 0.25}px/0.8 Manrope;${outline('#F6F0E7', 2)}letter-spacing:-.06em`, 'CEO') },
    { n: '09', name: 'Styles mélangés', r: (w, h) => bg('#E6D7BE') + T(`left:${w * 0.08}px;top:${h * 0.18}px;width:${w * 0.86}px;font:400 ${w * 0.12}px/1 'DM Serif Display';color:#0F0C0A`, 'Penser <span style="font-family:\'Instrument Serif\';font-style:italic;color:#7B5A3C">international</span> <span style="font:800 .6em Manrope;letter-spacing:-.02em">CHANGE</span> les règles.') },
    { n: '10', name: 'Titre en relief (emboss)', r: (w, h) => bg('#E4D0AC') + relief({ alpha: 0.45, freq: 0.03, scale: 3 }) + T(`left:${w * 0.08}px;top:${h * 0.3}px;font:500 ${w * 0.2}px/0.9 'Cormorant Garamond';color:#E4D0AC;${emboss('rgba(255,252,244,1)', 'rgba(110,80,48,.55)')}`, 'Temps<br>long') },
    { n: '11', name: 'Photo dans la lettre', r: (w, h) => bg('#2A1D15') + `<div style="position:absolute;left:${w * 0.04}px;top:${h * 0.18}px;font:900 ${w * 0.5}px/0.85 Fraunces;letter-spacing:-.06em;background:url(${P['tz-studio-vert-bras-croises']}) 50% 20%/cover;-webkit-background-clip:text;background-clip:text;color:transparent">TC</div>` },
    { n: '12', name: 'Mode de fusion sur portrait', r: (w, h) => ph('tz-bibliotheque-sourire', '50% 30%') + T(`left:-${w * 0.02}px;top:${h * 0.58}px;font:900 ${w * 0.34}px/0.8 Fraunces;color:#E8B57E;letter-spacing:-.06em;mix-blend-mode:difference`, 'Agir') },
  ]

  window.TREATMENTS = [
    { n: '01', name: 'Couleur chaude naturelle', f: 'saturate(.82) contrast(1.06) sepia(.14) brightness(1.02)' },
    { n: '02', name: 'Noir et blanc contrasté', f: 'grayscale(1) contrast(1.25)' },
    { n: '03', name: 'Duotone expresso / champagne', duo: ['#2A1D15', '#EAD8B8'] },
    { n: '04', name: 'Duotone nuit / sable', duo: ['#0C1626', '#E6D6B8'] },
    { n: '05', name: 'Duotone cognac / crème', duo: ['#7A3E1D', '#F6E2C0'] },
    { n: '06', name: 'Grain argentique', f: 'grayscale(.4) contrast(1.15) sepia(.25)', grain: 0.25 },
    { n: '07', name: 'Profondeur de champ (fond flou)', blur: true },
    { n: '08', name: 'Double exposition architecture', dbl: 'facade-ondulee' },
    { n: '09', name: 'Détourage + ombre portée', cut: true },
    { n: '10', name: 'Noir et blanc + aplat multiplié', mult: '#C68B52' },
  ]
  window.renderTreatment = (t, w, h, k = 'studio-marine') => {
    const src = P['tz-' + k]
    const im = (f, extra = '') => `<img src="${src}" style="${full}object-fit:cover;object-position:50% 22%;filter:${f};${extra}">`
    if (t.f) return im(t.f) + (t.grain ? film(t.grain) : '')
    if (t.duo) return `<div style="${full}isolation:isolate;overflow:hidden">${im('grayscale(1) contrast(1.15)')}<div style="${full}background:${t.duo[0]};mix-blend-mode:screen"></div><div style="${full}background:${t.duo[1]};mix-blend-mode:multiply"></div></div>`
    if (t.blur) return im('blur(14px) sepia(.3) brightness(.9)', 'transform:scale(1.15)') + `<img src="${P['cut-' + k]}" style="position:absolute;left:50%;bottom:0;height:${h * 0.92}px;transform:translateX(-50%);filter:sepia(.1) drop-shadow(0 20px 30px rgba(0,0,0,.4))">`
    if (t.dbl) return `<div style="${full}isolation:isolate">${im('grayscale(1) contrast(1.2)')}<img src="${P[t.dbl]}" style="${full}object-fit:cover;mix-blend-mode:screen;opacity:.8;filter:sepia(.6) saturate(1.3)"></div>`
    if (t.cut) return `<div style="${full}background:radial-gradient(70% 60% at 50% 40%,#F3E4C6,#B89A72 70%,#6B4F38)"></div><img src="${P['cut-' + k]}" style="position:absolute;left:50%;bottom:0;height:${h * 0.95}px;transform:translateX(-50%);filter:drop-shadow(${w * 0.04}px ${w * 0.05}px ${w * 0.04}px rgba(30,18,8,.55))">`
    if (t.mult) return `<div style="${full}isolation:isolate">${im('grayscale(1) contrast(1.2)')}<svg style="${full}mix-blend-mode:multiply"><path d="${blob(w * 0.3, h * 0.75, w * 0.4, { seed: 9, irr: 0.4 })}" fill="${t.mult}"/></svg></div>`
  }
})()
