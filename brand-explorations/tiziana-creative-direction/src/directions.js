/* Four art-direction systems. Each one renders the 12 feed compositions (1080 × 1350) and its carousel slides.
   Only real photographs of Tiziana (photographies/tiziana) and their cutouts are used for her portraits. */
;(function () {
  const L = window.LIB
  const { A, T, svg, blob, arch, masked, gradShape, glow, mesh, noise, film, relief, marble, sand, linen, glass, vignette, flow, warpGrid, rings, candles, outline, emboss } = L
  const P = window.P
  const W = 1080, H = 1350
  const page = (bg, inner) => `<div class="native post" style="width:${W}px;height:${H}px;position:relative;overflow:hidden;background:${bg}">${inner}</div>`
  const img = (src, css, filter = 'none', pos = '50% 30%') => `<img src="${P[src] || src}" style="position:absolute;${css};object-fit:cover;object-position:${pos};filter:${filter}">`
  const cut = (name, css, shadow = 'drop-shadow(0 50px 60px rgba(25,14,6,.5))', filter = '') => `<img src="${P['cut-' + name]}" style="position:absolute;${css};${''}filter:${filter} ${shadow}">`
  const F = { warm: 'saturate(.82) contrast(1.06) sepia(.14) brightness(1.02)', bw: 'grayscale(1) contrast(1.18) brightness(1.03)', soft: 'saturate(.7) contrast(.96) sepia(.22) brightness(1.04)', cool: 'saturate(.75) contrast(1.08) hue-rotate(-6deg) brightness(.96)' }
  const duo = (src, css, dark, light, pos = '50% 30%') => A(`${css};overflow:hidden;isolation:isolate`, img(src, 'inset:0;width:100%;height:100%', 'grayscale(1) contrast(1.2)', pos) + A(`inset:0;background:${dark};mix-blend-mode:screen`) + A(`inset:0;background:${light};mix-blend-mode:multiply`))
  const sig = (c, extra = '') => T(`left:70px;bottom:56px;font:600 15px/1 Manrope;letter-spacing:.32em;color:${c};${extra}`, 'TIZIANA CACI')
  const folio = (c, txt, extra = '') => T(`right:70px;bottom:56px;font:600 15px/1 Manrope;letter-spacing:.32em;color:${c};${extra}`, txt)
  const swipe = (c, n, tot) => T(`right:70px;top:70px;font:600 16px/1 Manrope;letter-spacing:.3em;color:${c}`, `${String(n).padStart(2, '0')} / ${String(tot).padStart(2, '0')} &nbsp;→`)
  const TOTAL = 5

  /* =========================================================== 1. SCULPTURAL EXECUTIVE */
  const S = {
    key: 'sculptural', num: '01', name: 'Sculptural Executive', tagline: 'La puissance calme des volumes.',
    idea: 'Le beige devient matière sculptée : volumes arrondis éclairés de biais, ombres profondes, pierre et sable. Tiziana est détourée et posée sur ces volumes comme sur un socle. La typographie est monumentale, serif, lente.',
    impression: 'Calme, autorité, permanence. Une fondation privée, une galerie, un siège social en pierre.',
    palette: [['Sable', '#D8BF98'], ['Champagne', '#EAD8B8'], ['Taupe', '#9A836B'], ['Expresso', '#2A1D15'], ['Ombre', '#140D08'], ['Blanc cassé', '#F4EEE4']],
    fonts: [['Cormorant Garamond 500 / italique', 'Titres monumentaux, 120 à 320 px'], ['Manrope 600 capitales', 'Signatures, folios, 15–18 px, interlettrage 0,3 em']],
    textures: 'Minéral, sable macro, papier épais embossé, marbre beige.',
    shapes: 'Volumes sphériques, galets, arches, socles. Toujours éclairés d’en haut à gauche, ombre portée longue.',
    photo: 'Portraits détourés posés sur les volumes, étalonnage chaud, peau naturelle. Noir et blanc réservé aux fonds de pierre.',
    gradients: 'Sable → champagne en rayonnant, ombre expresso dans les angles. Les dégradés modèlent les volumes.',
    use: 'Prises de position, portraits signature, publications « structure » et « temps long ».',
  }
  const sBg = (x = 380, y = 380) => mesh('#C9AE88', [[x, y, 1100, '#F1E3C8', 140, 1], [900, 1200, 900, '#6E5640', 160, 0.9], [100, 1300, 700, '#3A2A1E', 160, 0.8]])
  const pebble = (cx, cy, r, seed, lit = '#F3E6CD', mid = '#C8AC85', dark = '#5A4330', irr = 0.2, sx = 1, sy = 0.9) => gradShape(W, H, blob(cx, cy, r, { seed, irr, sx, sy }), [['0%', lit], ['55%', mid], ['100%', dark]], { cx: '32%', cy: '22%', r: '85%', shadow: 'drop-shadow(30px 50px 50px rgba(20,12,6,.45))' })
  S.post = (k, t) => {
    const ser = 'Cormorant Garamond', ink = '#2A1D15', cream = '#F6EEDF'
    switch (k) {
      case 'sculpture': return page('#C9AE88', sBg(700, 300) + marble(W, H, { alpha: 0.18 }) +
        pebble(700, 1180, 520, 4) + svg(W, H, `<path d="${arch(470, 230, 560, 1000)}" fill="none" stroke="rgba(255,246,230,.55)" stroke-width="2"/>`) +
        cut('studio-marine', 'height:1040px;left:440px;bottom:0') +
        T(`left:70px;top:110px;width:400px;font:500 82px/0.98 '${ser}';color:${ink};letter-spacing:-.01em`, t) + film(0.09) + sig(ink))
      case 'xxl': return page('#2A1D15', img('tz-studio-vert-reflexion', 'inset:0;width:100%;height:100%', F.warm, '50% 22%') +
        A('inset:0;background:linear-gradient(180deg,rgba(42,29,21,0) 45%,rgba(42,29,21,.85) 82%,#2A1D15 100%)') +
        T(`left:-30px;bottom:150px;font:500 300px/0.8 '${ser}';color:#EAD8B8;letter-spacing:-.035em;mix-blend-mode:normal;white-space:nowrap`, t[0]) +
        T(`left:70px;bottom:90px;width:720px;font:500 italic 40px/1.15 '${ser}';color:${cream}`, t[1]) + film(0.1) + folio('#EAD8B8', 'N° 02'))
      case 'sable': return page('#B89A72', `<div style="${L.full}background:radial-gradient(90% 70% at 30% 20%,#F3E4C6 0%,#D9BF97 38%,#9C7D5C 72%,#4B3626 100%)"></div>` + sand(0.45) + marble(W, H, { alpha: 0.22, seed: 7 }) +
        pebble(860, 260, 300, 9, '#F7ECD8', '#D3B78F', '#7A5F45', 0.15) +
        T(`left:70px;top:560px;width:900px;font:500 112px/0.95 '${ser}';color:#2A1D15;letter-spacing:-.02em`, t) + sig('#2A1D15') + folio('#2A1D15', 'STRUCTURE'))
      case 'nb': return page('#1E1510', mesh('#1E1510', [[300, 300, 900, '#5A4532', 160, 0.9]]) + marble(W, H, { alpha: 0.25, rgb: [0.9, 0.82, 0.7], seed: 3 }) +
        pebble(250, 1080, 380, 12, '#EFE0C4', '#B99B74', '#3E2C1E', 0.25, 1.2, 0.7) + pebble(880, 300, 210, 5, '#E3CFAE', '#9F8262', '#2A1D15') +
        masked(W, H, blob(560, 560, 400, { seed: 21, irr: 0.22, sy: 1.12 }), P['tz-studio-marine-reflexion'], { filter: 'grayscale(1) contrast(1.15)', x: 140, y: 110, iw: 840, ih: 1120, shadow: 'drop-shadow(0 40px 40px rgba(0,0,0,.5))' }) +
        T(`left:70px;bottom:120px;width:860px;font:500 64px/1.02 '${ser}';color:#F1E3C8`, t) + film(0.12) + sig('#D8BF98', 'bottom:56px'))
      case 'strategie': return page('#E9D9BC', `<div style="${L.full}background:linear-gradient(160deg,#F4E8D2,#DCC6A2 60%,#BFA27C)"></div>` + relief({ alpha: 0.55, freq: 0.035, scale: 3 }) +
        T(`left:-20px;top:40px;font:500 430px/0.78 '${ser}';${emboss('rgba(255,250,240,.95)', 'rgba(90,62,36,.45)')}color:#E2CDA9;letter-spacing:-.04em`, t[0]) +
        T(`left:60px;top:430px;font:500 italic 430px/0.78 '${ser}';${outline('rgba(42,29,21,.55)', 2)}letter-spacing:-.04em`, t[0]) +
        A('left:70px;top:900px;width:120px;height:2px;background:#2A1D15') +
        T(`left:70px;top:940px;width:760px;font:500 70px/1.02 '${ser}';color:#2A1D15`, t[1]) + sig('#2A1D15') + folio('#2A1D15', 'MÉTHODE'))
      case 'archi': return page('#2A1D15', img('colonnes-beton', 'inset:0;width:100%;height:100%', 'grayscale(.4) sepia(.35) contrast(1.05) brightness(.95)', '50% 50%') +
        A('inset:0;background:linear-gradient(200deg,rgba(234,216,184,0) 30%,rgba(196,166,124,.55) 60%,rgba(42,29,21,.92) 100%)') +
        glass('left:70px;top:760px;width:820px;height:420px', { tint: 'rgba(244,232,210,.16)', blur: 18, radius: 220 }) +
        T(`left:140px;top:860px;width:680px;font:500 82px/1 '${ser}';color:#F6EEDF`, t) + film(0.1) + sig('#EAD8B8'))
      case 'carrousel': return S.cover()
      case 'overlay': return page('#2A1D15', img('tz-bibliotheque-sourire', 'inset:0;width:100%;height:100%', F.warm, '50% 30%') +
        gradShape(W, H, blob(900, 1150, 520, { seed: 8, irr: 0.3 }), [['0%', '#EAD8B8', 0.9], ['70%', '#B89A72', 0.85], ['100%', '#6E5640', 0.8]], { cx: '30%', cy: '20%' }) +
        rings(860, 330, 120, 7, 'rgba(255,240,215,.7)', 26) +
        T(`left:430px;top:890px;width:580px;font:500 58px/1.02 '${ser}';color:#2A1D15`, t) + film(0.09) + sig('#F6EEDF'))
      case 'finance': return page('#1C130D', mesh('#1C130D', [[540, 640, 1100, '#6B523A', 170, 0.95], [540, 560, 380, '#F0DDBC', 120, 0.8]]) +
        flow(W, H, { n: 34, color: '#E8D2AC', y0: 0.52, spread: 0.35, amp: 0.12, seed: 3 }) +
        pebble(540, 600, 230, 2, '#FFF4DE', '#D2B48A', '#5E4630', 0.08, 1, 1) + pebble(360, 760, 120, 6, '#F3E2C2', '#B5966E', '#3E2C1E', 0.12) + pebble(760, 470, 90, 11, '#F3E2C2', '#B5966E', '#3E2C1E', 0.12) +
        T(`left:70px;top:80px;font:600 16px/1.4 Manrope;letter-spacing:.3em;color:#D8BF98`, t[0].toUpperCase()) +
        T(`left:70px;top:1000px;width:880px;font:500 92px/0.96 '${ser}';color:#F4E6CB`, t[1]) + film(0.1) + sig('#9A836B'))
      case 'papier': return page('#EEE1C8', `<div style="${L.full}background:radial-gradient(80% 70% at 40% 30%,#FAF1E1,#E8D6B6 70%,#CDB48C)"></div>` + relief({ alpha: 0.75, freq: 0.012, oct: 5, scale: 6, el: 48 }) + noise({ alpha: 0.05, blend: 'multiply' }) +
        T(`left:90px;top:300px;width:900px;font:500 104px/1 '${ser}';color:#DCC59E;text-shadow:-2px -2px 1px rgba(255,252,244,1),3px 3px 3px rgba(100,70,40,.75),0 0 1px rgba(100,70,40,.5)`, t) +
        A('left:90px;top:1080px;width:80px;height:1.5px;background:#7A5F45') + sig('#7A5F45', 'bottom:200px;left:90px') + folio('#7A5F45', 'TEMPS LONG'))
      case 'asym': return page('#E4CFAD', sBg(800, 200) + sand(0.25) +
        masked(W, H, arch(420, -120, 640, 1320), P['tz-fenetre-ronde-contre-jour'], { filter: F.warm, x: 300, y: -120, iw: 860, ih: 1350, shadow: 'drop-shadow(-30px 40px 50px rgba(30,18,8,.45))' }) +
        T(`left:70px;top:120px;writing-mode:vertical-rl;transform:rotate(180deg);font:500 120px/1 '${ser}';color:#2A1D15;letter-spacing:-.01em;height:1100px`, t) + film(0.08) + folio('#2A1D15', 'SIGNATURE'))
      case 'manifeste': return page('#1A110B', mesh('#1A110B', [[880, 200, 800, '#7C6248', 170, 0.9], [150, 1250, 700, '#4A3424', 170, 0.9]]) + marble(W, H, { alpha: 0.2, rgb: [0.95, 0.85, 0.7], seed: 40 }) +
        T(`left:70px;top:80px;font:600 16px/1 Manrope;letter-spacing:.34em;color:#D8BF98`, 'MANIFESTE') +
        T(`left:70px;top:200px;width:960px;font:500 128px/0.92 '${ser}';color:#F4E6CB;letter-spacing:-.02em`, t.map((l, i) => i % 2 ? `<span style="font-style:italic;color:#C9A878;font-size:96px">${l}</span><br>` : `${l}<br>`).join('')) + film(0.1) + sig('#9A836B'))
    }
  }
  S.cover = () => { const t = window.TITLES.sculptural.carrousel; return page('#C9AE88', sBg(300, 260) + marble(W, H, { alpha: 0.16 }) +
    gradShape(W, H, arch(520, 300, 520, 1100), [['0%', '#F3E6CD'], ['60%', '#C8AC85'], ['100%', '#6A513B']], { cx: '30%', cy: '15%', shadow: 'drop-shadow(30px 40px 50px rgba(20,12,6,.4))' }) +
    cut('studio-vert-bras-croises', 'height:1100px;left:560px;bottom:0') +
    T(`left:64px;top:150px;font:500 230px/0.82 'Cormorant Garamond';color:#2A1D15;letter-spacing:-.04em`, t[0]) +
    T(`left:70px;top:350px;font:500 italic 78px/1 'Cormorant Garamond';color:#4A3424`, t[1]) +
    T(`left:70px;top:470px;width:360px;font:500 22px/1.45 Manrope;color:#2A1D15`, t[2]) + swipe('#2A1D15', 1, TOTAL) + film(0.08) + sig('#2A1D15')) }
  S.slide = (s, i) => page('#E9D9BC', `<div style="${L.full}background:radial-gradient(90% 80% at 20% 10%,#F6EBD6,#DEC8A4 60%,#B79874)"></div>` + marble(W, H, { alpha: 0.18, seed: 30 + i }) +
    pebble(900 - i * 120, 1250, 360, 14 + i, '#F3E6CD', '#C8AC85', '#6A513B', 0.2, 1.2, 0.8) +
    T(`left:40px;top:60px;font:500 420px/0.8 'Cormorant Garamond';${outline('rgba(42,29,21,.35)', 2)}`, s.n) +
    T(`left:70px;top:520px;width:880px;font:500 96px/0.98 'Cormorant Garamond';color:#2A1D15`, s.title) +
    T(`left:70px;top:820px;width:640px;font:500 28px/1.5 Manrope;color:#3E2C1E`, s.body) + swipe('#2A1D15', i + 2, TOTAL) + sig('#2A1D15'))
  S.end = () => page('#2A1D15', sBg(540, 500) + A('inset:0;background:rgba(42,29,21,.55)') + pebble(540, 640, 300, 3) +
    T(`left:0;right:0;top:1040px;text-align:center;font:500 80px/1 'Cormorant Garamond';color:#F4E6CB`, 'Grandir, c’est d’abord s’organiser.') +
    T(`left:0;right:0;top:1160px;text-align:center;font:600 16px/1 Manrope;letter-spacing:.32em;color:#D8BF98`, 'ENREGISTRER · PARTAGER · @TIZIANA.CACI') + swipe('#EAD8B8', 5, TOTAL) + film(0.1))

  /* =========================================================== 2. LUXURY BUSINESS EDITORIAL */
  const E = {
    key: 'editorial', num: '02', name: 'Luxury Business Editorial', tagline: 'Un magazine économique de luxe.',
    idea: 'La grammaire d’une couverture de magazine d’affaires : photos plein cadre, titres XXL coupés par le bord, colonnes, folios, filets. Le beige est le papier ; le noir et le brun sont l’encre. Grain argentique sur toutes les images.',
    impression: 'Influence, culture, sérieux. Une dirigeante en couverture d’un hebdomadaire économique international.',
    palette: [['Encre', '#0F0C0A'], ['Brun', '#3B2618'], ['Papier', '#E6D7BE'], ['Blanc cassé', '#F3ECDF'], ['Champagne', '#CDB184'], ['Gris chaud', '#8C8378']],
    fonts: [['DM Serif Display', 'Titres XXL, 200 à 380 px, coupés par le cadre'], ['Instrument Serif italique', 'Chapeaux, citations'], ['Inter 600 capitales', 'Folios, rubriques, 14–16 px']],
    textures: 'Papier ancien, papier froissé, grain argentique, trame textile.',
    shapes: 'Découpes asymétriques, bandeaux, cercles pleins, filets. Peu de courbes, beaucoup de tension.',
    photo: 'Plein cadre, recadrages audacieux, noir et blanc contrasté ou couleur chaude désaturée, grain constant.',
    gradients: 'Dégradés d’encre (noir → transparent) pour la lisibilité, papier sable → brun.',
    use: 'Publications d’opinion, carrousels de fond, couvertures et portraits forts.',
  }
  const paper = (c = '#E6D7BE') => `<div style="${L.full}background:${c}"></div>` + img('papier-ancien', 'inset:0;width:100%;height:100%;mix-blend-mode:multiply;opacity:.55', 'sepia(.2)', '50% 50%') + relief({ alpha: 0.35, freq: 0.05, scale: 1.5 }) + noise({ alpha: 0.05, blend: 'multiply' })
  const rubric = (c, txt) => T(`left:70px;top:70px;right:70px;display:flex;justify-content:space-between;font:600 15px/1 Inter;letter-spacing:.3em;color:${c};border-bottom:1.5px solid ${c};padding-bottom:18px`, `<span>${txt}</span><span>TIZIANA CACI</span>`)
  E.post = (k, t) => {
    const dm = 'DM Serif Display', ink = '#0F0C0A', pap = '#F3ECDF'
    switch (k) {
      case 'sculpture': return page('#0F0C0A', glow(540, 760, 900, '#6A4A30', 150, 0.8) +
        T(`left:-14px;top:250px;font:400 196px/0.82 '${dm}';color:#CDB184;letter-spacing:-.03em;white-space:nowrap`, 'Penser<br>inter—<br>national') +
        A('left:400px;top:560px;width:680px;height:900px;border-radius:360px 360px 0 0;overflow:hidden', paper('#E2CFAF')) +
        cut('studio-marine', 'height:1060px;left:400px;bottom:0', 'drop-shadow(-20px 30px 40px rgba(0,0,0,.55))') +
        rubric('#CDB184', 'N°01 — INTERNATIONAL') + T(`left:70px;bottom:80px;width:300px;font:400 italic 36px/1.15 'Instrument Serif';color:${pap}`, t) + film(0.12))
      case 'xxl': return page(ink, img('tz-studio-marine', 'inset:0;width:100%;height:100%', 'grayscale(.9) contrast(1.25) sepia(.15)', '50% 18%') +
        A('inset:0;background:linear-gradient(0deg,rgba(15,12,10,.9) 0%,rgba(15,12,10,0) 45%)') +
        T(`right:-40px;bottom:300px;font:400 330px/0.8 '${dm}';color:${pap};letter-spacing:-.04em`, t[0]) +
        rubric(pap, 'N°02 — DÉCISION') + T(`left:70px;bottom:90px;width:620px;font:400 italic 50px/1.05 'Instrument Serif';color:${pap}`, t[1]) + film(0.16))
      case 'sable': return page('#C9AE88', `<div style="${L.full}background:linear-gradient(175deg,#E9DABD 0%,#CDB184 45%,#7B5A3C 80%,#3B2618 100%)"></div>` + film(0.12) + linen(0.05) +
        rubric('#3B2618', 'N°03 — LIBERTÉ') +
        T(`left:70px;top:200px;font:400 260px/0.84 '${dm}';color:#3B2618;letter-spacing:-.04em`, 'Le prix') +
        T(`left:70px;top:430px;font:400 italic 260px/0.84 'Instrument Serif';color:#F3ECDF;letter-spacing:-.03em`, 'de la liberté') +
        A('left:70px;top:900px;width:940px;height:1.5px;background:#F3ECDF') +
        T(`left:70px;top:940px;width:700px;font:400 56px/1.05 '${dm}';color:${pap}`, t) + folio(pap, 'P. 03'))
      case 'nb': return page('#E6D7BE', paper() +
        img('tz-bibliotheque-ordinateur', 'left:430px;top:0;width:650px;height:1350px', 'grayscale(1) contrast(1.25)', '35% 40%') +
        A('left:330px;top:780px;width:300px;height:300px;border-radius:50%;background:#0F0C0A') +
        rubric(ink, 'N°04 — MÉTHODE') +
        T(`left:70px;top:190px;font:400 300px/0.8 '${dm}';color:${ink}`, '“') +
        T(`left:70px;top:380px;width:360px;font:400 50px/1.06 '${dm}';color:${ink}`, t) + film(0.1) + folio(ink, 'P. 04', 'color:#F3ECDF'))
      case 'strategie': return page('#E6D7BE', paper('#E9DCC6') +
        T(`left:40px;top:150px;writing-mode:vertical-rl;transform:rotate(180deg);font:400 330px/0.8 '${dm}';color:${ink};letter-spacing:-.03em`, t[0]) +
        rubric(ink, 'N°05 — VISION') +
        A('left:420px;top:180px;width:1.5px;height:1000px;background:#0F0C0A') +
        T(`left:470px;top:200px;width:540px;font:400 76px/1 '${dm}';color:${ink}`, t[1]) +
        T(`left:470px;top:640px;width:250px;font:400 21px/1.5 Inter;color:#3B2618;text-align:justify`, 'Une ambition se formule en une phrase. Une méthode se construit en étapes, en priorités, en renoncements.') +
        T(`left:760px;top:640px;width:250px;font:400 21px/1.5 Inter;color:#3B2618;text-align:justify`, 'Sans cette architecture, la vision reste une intention : sincère, mais impossible à piloter.') + folio(ink, 'P. 05'))
      case 'archi': return page(ink, img('facade-classique', 'inset:0;width:100%;height:100%', 'sepia(.45) contrast(1.15) brightness(.85)', '50% 50%') +
        A('inset:0;background:linear-gradient(180deg,rgba(59,38,24,.2) 0%,rgba(59,38,24,.65) 55%,rgba(15,12,10,.95) 100%)') +
        rubric(pap, 'N°06 — FRONTIÈRES') + T(`left:70px;bottom:120px;width:900px;font:400 84px/0.98 '${dm}';color:${pap}`, t) + film(0.14))
      case 'carrousel': return E.cover()
      case 'overlay': return page(ink, img('tz-dejeuner-affaires', 'inset:0;width:100%;height:100%', F.warm + ' contrast(1.1)', '50% 30%') +
        A('left:0;right:0;bottom:0;height:470px;background:#0F0C0A') + A('left:0;top:0;width:28px;bottom:470px;background:#CDB184') +
        svg(W, H, ['M70,130 h40 M70,130 v40', 'M1010,130 h-40 M1010,130 v40', 'M70,830 h40 M70,830 v-40', 'M1010,830 h-40 M1010,830 v-40'].map((d) => `<path d="${d}" stroke="#F3ECDF" stroke-width="2" fill="none"/>`).join('')) +
        T(`left:70px;top:940px;width:940px;font:400 62px/1.02 '${dm}';color:${pap}`, t) + folio('#CDB184', 'N°08 — BUSINESS') + sig('#CDB184') + film(0.12))
      case 'finance': return page('#3B2618', `<div style="${L.full}background:linear-gradient(160deg,#5C3E28,#2A1A10)"></div>` + film(0.14) +
        svg(W, H, Array.from({ length: 9 }, (_, i) => `<rect x="${110 + i * 100}" y="${880 - [180, 260, 220, 340, 300, 420, 380, 500, 470][i]}" width="56" height="${[180, 260, 220, 340, 300, 420, 380, 500, 470][i]}" fill="${i === 8 ? '#CDB184' : 'rgba(243,236,223,.16)'}"/>`).join('') + `<line x1="70" y1="880" x2="1010" y2="880" stroke="#CDB184" stroke-width="1.5"/>`) +
        rubric('#CDB184', 'N°09 — ÉCONOMIE') + T(`left:70px;top:930px;font:600 15px/1 Inter;letter-spacing:.3em;color:#CDB184`, t[0].toUpperCase() + ' — ILLUSTRATION, SANS DONNÉES') +
        T(`left:70px;top:990px;width:900px;font:400 76px/1 '${dm}';color:${pap}`, t[1]))
      case 'papier': return page('#E6D7BE', `<div style="${L.full}background:#E9DCC6"></div>` + relief({ alpha: 0.8, freq: 0.008, oct: 6, scale: 9, el: 40, seed: 31 }) + noise({ alpha: 0.06, blend: 'multiply' }) +
        T(`left:60px;top:120px;font:400 420px/0.7 '${dm}';color:#3B2618`, '“') +
        T(`left:90px;top:440px;width:880px;font:400 italic 82px/1.04 'Instrument Serif';color:#0F0C0A`, t) + sig('#3B2618') + folio('#3B2618', 'P. 10'))
      case 'asym': return page('#E6D7BE', paper() +
        img('tz-restaurant-bras-croises', 'left:70px;top:160px;width:430px;height:1030px', F.warm, '50% 40%') +
        img('tz-restaurant-bras-croises', 'left:540px;top:160px;width:470px;height:480px', F.bw, '48% 18%') +
        rubric(ink, 'N°11 — DIRIGER') + T(`left:540px;top:700px;width:470px;font:400 64px/1.02 '${dm}';color:${ink}`, t) + film(0.08) + folio(ink, 'P. 11'))
      case 'manifeste': return page(ink, film(0.14) + rubric('#CDB184', 'MANIFESTE') +
        T(`left:70px;top:200px;width:980px;font:400 106px/1.02 '${dm}';color:${pap};letter-spacing:-.02em`, t.map((l, i) => i % 2 ? `<span style="font-family:'Instrument Serif';font-style:italic;color:#CDB184">${l}</span><br>` : `${l}<br>`).join('')) + sig('#8C8378'))
    }
  }
  E.cover = () => { const t = window.TITLES.editorial.carrousel; return page('#0F0C0A', img('tz-voyage-valise-fenetre', 'inset:0;width:100%;height:100%', 'saturate(.7) contrast(1.15) sepia(.2) brightness(.85)', '50% 40%') +
    A('inset:0;background:linear-gradient(90deg,rgba(15,12,10,.88) 0%,rgba(15,12,10,.2) 70%)') +
    T(`left:60px;top:200px;font:400 230px/0.82 'DM Serif Display';color:#F3ECDF;letter-spacing:-.04em`, t[0]) +
    T(`left:70px;top:390px;font:400 italic 150px/0.9 'Instrument Serif';color:#CDB184`, t[1]) +
    T(`left:70px;top:600px;width:440px;font:500 26px/1.4 Inter;color:#F3ECDF`, t[2]) + rubric('#CDB184', 'DOSSIER — INTERNATIONAL') + swipe('#F3ECDF', 1, TOTAL).replace('top:70px', 'top:120px') + film(0.14)) }
  E.slide = (s, i) => page('#E6D7BE', paper() + rubric('#0F0C0A', 'DOSSIER — INTERNATIONAL') +
    T(`right:40px;top:150px;font:400 400px/0.8 'DM Serif Display';color:#3B2618;opacity:.9`, s.n) +
    A('left:70px;top:600px;width:940px;height:1.5px;background:#0F0C0A') +
    T(`left:70px;top:650px;width:900px;font:400 92px/0.98 'DM Serif Display';color:#0F0C0A`, s.title) +
    T(`left:70px;top:900px;width:620px;font:400 italic 40px/1.2 'Instrument Serif';color:#3B2618`, s.body) + folio('#0F0C0A', `${i + 2} / ${TOTAL}`) + film(0.06))
  E.end = () => page('#0F0C0A', film(0.14) + rubric('#CDB184', 'À RETENIR') +
    T(`left:70px;top:330px;width:940px;font:400 124px/0.92 'DM Serif Display';color:#F3ECDF`, 'Rien ne se transpose automatiquement.') +
    T(`left:70px;top:1100px;font:600 15px/1 Inter;letter-spacing:.3em;color:#CDB184`, 'ENREGISTRER · PARTAGER · @TIZIANA.CACI') + folio('#8C8378', `5 / ${TOTAL}`))

  /* =========================================================== 3. ABSTRACT FINANCIAL WORLD */
  const Fi = {
    key: 'financial', num: '03', name: 'Abstract Financial World', tagline: 'Comprendre les systèmes.',
    idea: 'Un monde financier abstrait mais chaud : courbes de flux, grilles déformées, anneaux, verre dépoli, écrans. Bleu nuit profond comme fond, champagne et sable comme lumière. Aucun cliché « tech » : pas de néon, pas de circuit, pas de bleu électrique.',
    impression: 'Intelligence, maîtrise, lecture des systèmes. Une banque privée, un rapport stratégique, une salle de marché silencieuse.',
    palette: [['Bleu nuit', '#0C1626'], ['Marine profond', '#17253B'], ['Champagne', '#D8C29A'], ['Sable', '#E6D6B8'], ['Brun', '#4A3424'], ['Blanc cassé', '#F2ECE2']],
    fonts: [['Manrope 800', 'Titres affirmés, 120 à 300 px, interlettrage serré'], ['Instrument Serif italique', 'Mots-clés, contrepoints'], ['Manrope 600 capitales', 'Coordonnées, légendes']],
    textures: 'Verre dépoli, grain numérique fin, minéral sombre, translucidité.',
    shapes: 'Courbes de flux, grilles déformées, anneaux concentriques, sphères champagne, chandeliers abstraits.',
    photo: 'Étalonnage légèrement froid sur fond chaud, cercles et réticules, portraits détourés sur sphères lumineuses.',
    gradients: 'Bleu nuit → marine → halo champagne ; horizons sable sur bleu.',
    use: 'Finance, banque, fiscalité, international, carrousels pédagogiques.',
  }
  const night = (x = 760, y = 380, c = '#D8C29A') => mesh('#0C1626', [[x, y, 900, c, 170, 0.55], [150, 1200, 900, '#24385A', 160, 0.9], [1000, 1300, 600, '#4A3424', 160, 0.7]]) + noise({ alpha: 0.05, freq: 1.4, oct: 1, blend: 'screen', rgb: [0.9, 0.85, 0.75] })
  const sphere = (cx, cy, r, shadow = 'drop-shadow(0 40px 60px rgba(0,0,0,.5))') => gradShape(W, H, blob(cx, cy, r, { irr: 0.02, n: 8 }), [['0%', '#FFF5E0'], ['45%', '#D8C29A'], ['85%', '#6B5638'], ['100%', '#2A2218']], { cx: '35%', cy: '28%', r: '80%', shadow })
  Fi.post = (k, t) => {
    const mn = 'Manrope', is = 'Instrument Serif', ch = '#D8C29A', off = '#F2ECE2'
    switch (k) {
      case 'sculpture': return page('#0C1626', night(540, 500) + flow(W, H, { n: 40, color: ch, y0: 0.62, spread: 0.45, amp: 0.1, seed: 8 }) +
        sphere(560, 820, 380) + rings(560, 820, 400, 6, 'rgba(216,194,154,.5)', 30) +
        cut('studio-marine-reflexion', 'height:1060px;left:250px;bottom:0', 'drop-shadow(0 30px 50px rgba(0,0,0,.6))') +
        T(`left:70px;top:90px;width:880px;font:800 64px/1 '${mn}';color:${off};letter-spacing:-.03em`, t) + sig(ch))
      case 'xxl': return page('#0C1626', img('tz-fenetre-ronde-ordinateur', 'inset:0;width:100%;height:100%', F.cool, '50% 40%') +
        A('inset:0;background:linear-gradient(180deg,rgba(12,22,38,.6) 0%,rgba(12,22,38,.1) 35%,rgba(12,22,38,.92) 78%)') +
        T(`left:50px;bottom:250px;font:800 238px/0.8 '${mn}';${outline(ch, 2.5)}letter-spacing:-.06em`, t[0]) +
        T(`left:70px;bottom:120px;width:860px;font:400 italic 52px/1.05 '${is}';color:${off}`, t[1]) + sig(ch, 'bottom:56px') + film(0.06))
      case 'sable': return page('#0C1626', `<div style="${L.full}background:linear-gradient(180deg,#0C1626 0%,#17253B 38%,#6F6150 62%,#D8C29A 80%,#EADCC0 100%)"></div>` + sand(0.35) + marble(W, H, { alpha: 0.12, rgb: [0.3, 0.25, 0.2] }) +
        glow(540, 840, 700, '#FFF0D0', 120, 0.55) +
        T(`left:70px;top:180px;width:900px;font:800 118px/0.92 '${mn}';color:${off};letter-spacing:-.04em`, t) + sig('#17253B'))
      case 'nb': return page('#0C1626', night(800, 300) + warpGrid(W, H, { step: 54, color: 'rgba(216,194,154,.18)', amp: 50, cx: 0.5, cy: 0.42 }) +
        rings(540, 560, 330, 8, 'rgba(216,194,154,.55)', 18) +
        masked(W, H, blob(540, 560, 320, { irr: 0.01, n: 8 }), P['tz-studio-vert-reflexion'], { filter: 'grayscale(1) contrast(1.15) brightness(1.05)', x: 180, y: 180, iw: 720, ih: 960 }) +
        T(`left:70px;top:1000px;width:900px;font:800 60px/1.02 '${mn}';color:${off};letter-spacing:-.02em`, t) + sig(ch))
      case 'strategie': return page('#0C1626', night(300, 300) + warpGrid(W, H, { step: 60, color: 'rgba(216,194,154,.14)', amp: 60, cx: 0.55, cy: 0.35 }) +
        T(`left:30px;top:80px;font:800 420px/0.8 '${mn}';color:transparent;-webkit-text-stroke:2px ${ch};letter-spacing:-.07em`, t[0]) +
        T(`left:30px;top:80px;font:800 420px/0.8 '${mn}';color:${ch};letter-spacing:-.07em;clip-path:inset(0 0 52% 0)`, t[0]) +
        flow(W, H, { n: 22, color: off, y0: 0.34, spread: 0.14, amp: 0.06, seed: 12, width: 1.5 }) +
        T(`left:70px;top:780px;width:880px;font:400 italic 78px/1.02 '${is}';color:${off}`, t[1]) + sig(ch))
      case 'archi': return page('#0C1626', img('facade-courbe', 'inset:0;width:100%;height:100%', 'saturate(.6) contrast(1.1)', '30% 50%') +
        A('inset:0;background:linear-gradient(120deg,rgba(12,22,38,.95) 0%,rgba(23,37,59,.7) 40%,rgba(216,194,154,.35) 100%)') +
        glass('left:70px;top:700px;width:940px;height:480px', { tint: 'rgba(242,236,226,.1)', blur: 26, border: 'rgba(216,194,154,.45)', radius: 40 }) +
        T(`left:120px;top:760px;font:600 15px/1 '${mn}';letter-spacing:.3em;color:${ch}`, 'ARCHITECTURE · 46°N') +
        T(`left:120px;top:820px;width:840px;font:800 76px/1 '${mn}';color:${off};letter-spacing:-.03em`, t) + sig(ch))
      case 'carrousel': return Fi.cover()
      case 'overlay': return page('#0C1626', img('tz-balcon-telephone', 'inset:0;width:100%;height:100%', F.cool, '50% 25%') +
        A('inset:0;background:linear-gradient(180deg,rgba(12,22,38,.1) 40%,rgba(12,22,38,.95) 85%)') +
        svg(W, H, `<circle cx="560" cy="330" r="190" fill="none" stroke="${ch}" stroke-width="1.5"/><circle cx="560" cy="330" r="240" fill="none" stroke="${ch}" stroke-opacity=".4" stroke-dasharray="4 8"/><line x1="560" y1="60" x2="560" y2="120" stroke="${ch}"/><line x1="820" y1="330" x2="1010" y2="330" stroke="${ch}"/><line x1="70" y1="700" x2="1010" y2="700" stroke="${ch}" stroke-opacity=".35"/>`) +
        T(`left:830px;top:300px;font:600 13px/1.5 '${mn}';letter-spacing:.2em;color:${off}`, 'FOCUS<br>DÉCISION') +
        T(`left:70px;top:960px;width:900px;font:800 66px/1 '${mn}';color:${off};letter-spacing:-.03em`, t) + sig(ch))
      case 'finance': return page('#0C1626', night(700, 600) + warpGrid(W, H, { step: 72, color: 'rgba(216,194,154,.12)', amp: 70, cx: 0.65, cy: 0.5 }) +
        svg(W, H, candles(70, 380, 940, 420, ch, 4)) + flow(W, H, { n: 18, color: '#E6D6B8', y0: 0.45, spread: 0.2, amp: 0.1, seed: 21 }) +
        glass('left:600px;top:150px;width:410px;height:200px', { tint: 'rgba(242,236,226,.08)', blur: 14, border: 'rgba(216,194,154,.4)', radius: 24 }) +
        T(`left:640px;top:190px;font:600 14px/1.7 '${mn}';letter-spacing:.24em;color:${ch}`, t[0].toUpperCase().replace(/ · /g, '<br>')) +
        T(`left:70px;top:900px;width:920px;font:800 70px/1 '${mn}';color:${off};letter-spacing:-.03em`, t[1]) + sig(ch))
      case 'papier': return page('#E6D6B8', `<div style="${L.full}background:linear-gradient(160deg,#F2E8D4,#DCC8A4)"></div>` + relief({ alpha: 0.55, freq: 0.03, scale: 3 }) +
        svg(W, H, Array.from({ length: 13 }, (_, i) => `<line x1="${70 + i * 78}" y1="0" x2="${70 + i * 78}" y2="${H}" stroke="rgba(255,255,255,.7)" stroke-width="1"/><line x1="${71 + i * 78}" y1="0" x2="${71 + i * 78}" y2="${H}" stroke="rgba(90,70,40,.18)" stroke-width="1"/>`).join('')) +
        T(`left:70px;top:420px;width:900px;font:800 98px/0.96 '${mn}';color:#D6C098;letter-spacing:-.04em;${emboss('rgba(255,252,244,1)', 'rgba(40,30,20,.75)')}`, t) +
        T(`left:70px;top:1180px;font:600 15px/1 '${mn}';letter-spacing:.3em;color:#17253B`, 'TIZIANA CACI — STRUCTURE'))
      case 'asym': return page('#0C1626', night(200, 200) +
        masked(W, H, 'M300,0 L1080,0 L1080,1350 L520,1350 C380,1100 260,780 300,0 Z', P['tz-bibliotheque-plan-large'], { filter: F.cool, x: 200, y: 0, iw: 900, ih: 1350 }) +
        A('left:0;top:0;width:520px;height:1350px;background:linear-gradient(90deg,rgba(12,22,38,.85),rgba(12,22,38,0))') +
        T(`left:70px;top:160px;width:420px;font:800 128px/0.9 '${mn}';color:${off};letter-spacing:-.05em`, t.replace(' ', '<br>')) +
        svg(W, H, `<path d="M300,0 C260,780 380,1100 520,1350" fill="none" stroke="${ch}" stroke-width="2"/>`) + sig(ch))
      case 'manifeste': return page('#0C1626', night(900, 200) +
        T(`left:70px;top:80px;font:600 16px/1 '${mn}';letter-spacing:.34em;color:${ch}`, 'MÉTHODE — SIX TEMPS') +
        T(`left:70px;top:190px;width:960px;font:800 118px/1.02 '${mn}';color:${off};letter-spacing:-.04em`, t.map((l, i) => `<div style="display:flex;gap:28px;align-items:baseline"><span style="font:400 italic 54px 'Instrument Serif';color:${ch};width:70px">${l.slice(0, 2)}</span><span style="${i % 2 ? outline(off, 1.5) : ''}">${l.slice(3)}</span></div>`).join('')) + sig(ch))
    }
  }
  Fi.cover = () => { const t = window.TITLES.financial.carrousel; return page('#0C1626', night(760, 520) + warpGrid(W, H, { step: 60, amp: 60, cx: 0.7, cy: 0.6 }) +
    sphere(760, 900, 300) + cut('bibliotheque-sourire', 'height:820px;left:380px;bottom:0', 'drop-shadow(0 30px 50px rgba(0,0,0,.6))') +
    T(`left:64px;top:160px;font:800 220px/0.82 'Manrope';color:#F2ECE2;letter-spacing:-.06em`, t[0]) +
    T(`left:70px;top:360px;font:400 italic 120px/0.9 'Instrument Serif';color:#D8C29A`, t[1]) +
    glass('left:70px;top:540px;width:420px;height:150px', { tint: 'rgba(242,236,226,.08)', blur: 16, border: 'rgba(216,194,154,.4)', radius: 20 }) +
    T(`left:100px;top:570px;width:370px;font:600 22px/1.45 Manrope;color:#F2ECE2`, t[2]) + swipe('#D8C29A', 1, TOTAL) + sig('#D8C29A')) }
  Fi.slide = (s, i) => page('#0C1626', night(900 - i * 200, 300 + i * 200) + flow(W, H, { n: 26, color: '#D8C29A', y0: 0.3, spread: 0.3, amp: 0.1, seed: 40 + i }) +
    T(`left:70px;top:150px;font:800 300px/0.8 'Manrope';${outline('#D8C29A', 2)}letter-spacing:-.06em`, s.n) +
    glass('left:70px;top:600px;width:940px;height:560px', { tint: 'rgba(242,236,226,.07)', blur: 22, border: 'rgba(216,194,154,.4)', radius: 36 }) +
    T(`left:120px;top:660px;width:840px;font:800 96px/0.95 'Manrope';color:#F2ECE2;letter-spacing:-.04em`, s.title) +
    T(`left:120px;top:820px;width:760px;font:500 30px/1.5 Manrope;color:#E6D6B8`, s.body) + swipe('#D8C29A', i + 2, TOTAL) + sig('#D8C29A'))
  Fi.end = () => page('#0C1626', night(540, 560) + rings(540, 560, 80, 14, 'rgba(216,194,154,.6)', 24) + sphere(540, 560, 110) +
    T(`left:70px;right:70px;top:960px;text-align:center;font:800 76px/1 'Manrope';color:#F2ECE2;letter-spacing:-.03em`, 'Comprendre avant de choisir.') +
    T(`left:0;right:0;top:1120px;text-align:center;font:600 15px/1 Manrope;letter-spacing:.3em;color:#D8C29A`, 'ENREGISTRER · PARTAGER · @TIZIANA.CACI') + swipe('#D8C29A', 5, TOTAL))

  /* =========================================================== 4. MODERN CEO ART DIRECTION */
  const M = {
    key: 'modern', num: '04', name: 'Modern CEO Art Direction', tagline: 'Audace, contraste, présence.',
    idea: 'La direction la plus audacieuse : portraits très présents, masques organiques, dégradés caramel et cognac assumés, typographie expressive qui se superpose au portrait, doubles expositions. Le beige devient lumière, le cognac et la brique apportent le contraste.',
    impression: 'Énergie, modernité, singularité. Une campagne de marque de luxe contemporaine, pas une page de conseil.',
    palette: [['Caramel', '#C68B52'], ['Cognac', '#7A3E1D'], ['Brique', '#9E3B26'], ['Champagne', '#EBD8B8'], ['Noir chaud', '#141010'], ['Blanc cassé', '#F6F0E7']],
    fonts: [['Fraunces 300 → 900', 'Titres expressifs, superposés, 140 à 360 px'], ['Inter 700 / 400', 'Textes courts, capitales espacées']],
    textures: 'Grain analogique fort, pellicule argentique, matières superposées, verre translucide.',
    shapes: 'Blobs fluides, cercles déformés, découpes organiques, contours irréguliers, masques photo non conventionnels.',
    photo: 'Doubles expositions, noir et blanc + aplats colorés en multiplication, détourages qui sortent du cadre.',
    gradients: 'Maillages caramel → cognac → noir, halos champagne, dégradés flous très visibles.',
    use: 'Portraits signature, lancements, prises de position fortes, couvertures de carrousel.',
  }
  const hot = (a = [300, 300], b = [900, 1100]) => mesh('#7A3E1D', [[a[0], a[1], 1000, '#E8B57E', 150, 1], [b[0], b[1], 900, '#3A1A0E', 150, 1], [900, 200, 600, '#9E3B26', 160, 0.8], [200, 1200, 600, '#C68B52', 150, 0.9]])
  M.post = (k, t) => {
    const fr = 'Fraunces', off = '#F6F0E7', ink = '#141010'
    switch (k) {
      case 'sculpture': return page('#7A3E1D', hot() +
        gradShape(W, H, blob(560, 900, 480, { seed: 17, irr: 0.35 }), [['0%', '#F4DDB8'], ['60%', '#C68B52'], ['100%', '#7A3E1D']], { cx: '30%', cy: '20%', shadow: 'drop-shadow(0 50px 60px rgba(30,10,4,.5))' }) +
        T(`left:-20px;top:120px;font:900 250px/0.8 '${fr}';color:${off};letter-spacing:-.05em;opacity:.95`, 'Libre.') +
        cut('studio-vert-bras-croises', 'height:1110px;left:300px;bottom:0', 'drop-shadow(0 40px 50px rgba(30,10,4,.55))') +
        T(`left:70px;top:420px;width:300px;font:400 30px/1.25 '${fr}';color:${off}`, t) + film(0.14) + sig(off))
      case 'xxl': return page(ink, img('tz-studio-marine-reflexion', 'inset:0;width:100%;height:100%', F.warm + ' contrast(1.1)', '50% 20%') +
        A('inset:0;background:linear-gradient(0deg,rgba(122,62,29,.95) 0%,rgba(122,62,29,0) 50%)') +
        T(`left:-30px;top:760px;font:900 330px/0.8 '${fr}';color:#E8B57E;letter-spacing:-.06em;mix-blend-mode:hard-light`, t[0]) +
        T(`left:70px;bottom:90px;width:640px;font:500 38px/1.15 '${fr}';color:${off}`, t[1]) + film(0.14))
      case 'sable': return page('#7A3E1D', mesh('#3A1A0E', [[250, 300, 1100, '#F0C894', 140, 1], [800, 700, 800, '#C2562F', 150, 0.9], [600, 1300, 900, '#141010', 150, 1]]) + film(0.2) +
        T(`left:70px;top:520px;width:950px;font:300 132px/0.9 '${fr}';color:${off};letter-spacing:-.04em`, t.replace('d’abord', '<i style="font-weight:900">d’abord</i>')) + sig(off))
      case 'nb': return page('#EBD8B8', `<div style="${L.full}background:#EBD8B8"></div>` + film(0.12) +
        img('tz-table-reflexion', 'left:120px;top:80px;width:880px;height:1000px', F.bw, '50% 30%') +
        shapeBlend(blob(250, 900, 300, { seed: 9, irr: 0.4 }), '#C68B52') + shapeBlend(blob(900, 220, 220, { seed: 4, irr: 0.45 }), '#9E3B26') +
        svg(W, H, `<path d="${blob(560, 560, 470, { seed: 2, irr: 0.25 })}" fill="none" stroke="${ink}" stroke-width="2"/>`) +
        T(`left:70px;top:1110px;width:940px;font:600 54px/1.04 '${fr}';color:${ink};letter-spacing:-.02em`, t) + sig(ink, 'bottom:40px'))
      case 'strategie': return page(ink, mesh(ink, [[800, 300, 800, '#7A3E1D', 160, 0.9]]) + film(0.12) +
        T(`left:40px;top:130px;font:900 300px/0.8 '${fr}';color:#9E3B26;letter-spacing:-.07em;mix-blend-mode:screen`, t[0]) +
        T(`left:62px;top:190px;font:300 300px/0.8 '${fr}';color:#E8B57E;letter-spacing:-.07em;mix-blend-mode:screen;opacity:.85`, t[0]) +
        T(`left:84px;top:250px;font:900 300px/0.8 '${fr}';${outline('#F6F0E7', 2)}letter-spacing:-.07em`, t[0]) +
        T(`left:70px;top:820px;width:900px;font:400 70px/1.02 '${fr}';color:${off};letter-spacing:-.02em`, t[1]) + sig('#E8B57E'))
      case 'archi': return page('#7A3E1D', img('tour-blanche', 'inset:0;width:100%;height:100%', 'grayscale(.6) contrast(1.15)', '50% 50%') +
        A('inset:0;background:linear-gradient(200deg,rgba(232,181,126,.2) 0%,rgba(198,139,82,.75) 50%,rgba(122,62,29,.95) 100%);mix-blend-mode:multiply') +
        gradShape(W, H, blob(300, 1150, 520, { seed: 6, irr: 0.35 }), [['0%', '#F6F0E7', 0.55], ['100%', '#E8B57E', 0.2]]) +
        T(`left:70px;top:820px;width:900px;font:800 90px/0.94 '${fr}';color:${off};letter-spacing:-.04em`, t) + film(0.12) + sig(off))
      case 'carrousel': return M.cover()
      case 'overlay': return page(ink, img('tz-balcon-message', 'inset:0;width:100%;height:100%', F.warm, '50% 25%') +
        shapeBlend(blob(180, 1000, 420, { seed: 31, irr: 0.4 }), '#C68B52', 'multiply', 0.9) + shapeBlend(blob(980, 260, 260, { seed: 3, irr: 0.4 }), '#9E3B26', 'multiply', 0.85) +
        svg(W, H, `<path d="${blob(560, 470, 360, { seed: 12, irr: 0.3 })}" fill="none" stroke="${off}" stroke-width="2.5"/><path d="${blob(560, 470, 400, { seed: 13, irr: 0.3 })}" fill="none" stroke="${off}" stroke-opacity=".45" stroke-width="1.5"/>`) +
        glass('left:70px;top:900px;width:940px;height:300px', { tint: 'rgba(20,16,16,.35)', blur: 22, border: 'rgba(246,240,231,.35)', radius: 150 }) +
        T(`left:140px;top:960px;width:820px;font:500 50px/1.06 '${fr}';color:${off}`, t) + film(0.12))
      case 'finance': return page('#3A1A0E', hot([800, 250], [200, 1200]) + flow(W, H, { n: 30, color: '#F6F0E7', y0: 0.5, spread: 0.4, amp: 0.16, seed: 17 }) +
        svg(W, H, candles(70, 520, 940, 320, '#F4DDB8', 12)) +
        T(`left:70px;top:90px;font:700 16px/1 Inter;letter-spacing:.3em;color:${off}`, t[0].toUpperCase()) +
        T(`left:70px;top:930px;width:940px;font:800 86px/0.94 '${fr}';color:${off};letter-spacing:-.04em`, t[1]) + film(0.14) + sig(off))
      case 'papier': return page('#EBD8B8', `<div style="${L.full}background:radial-gradient(90% 80% at 30% 20%,#F8ECD8,#E3C9A2 70%,#C68B52)"></div>` + relief({ alpha: 0.7, freq: 0.01, oct: 5, scale: 7, el: 45, seed: 51 }) +
        masked(W, H, blob(820, 320, 200, { seed: 41, irr: 0.3 }), P['tz-studio-vert-reflexion'], { filter: F.warm, x: 560, y: 40, iw: 520, ih: 693, shadow: 'drop-shadow(0 20px 30px rgba(60,30,10,.35))' }) +
        T(`left:70px;top:620px;width:940px;font:600 92px/0.96 '${fr}';color:#D9B98C;letter-spacing:-.03em;${emboss('rgba(255,250,240,1)', 'rgba(110,45,15,.8)')}`, t) + sig('#7A3E1D'))
      case 'asym': return page(ink, mesh(ink, [[700, 400, 900, '#7A3E1D', 160, 0.9]]) +
        A('left:180px;top:0;width:900px;height:1350px;overflow:hidden;clip-path:path(\'' + blob(450, 640, 520, { seed: 25, irr: 0.35, sy: 1.25 }) + '\');isolation:isolate',
          img('tz-studio-marine', 'inset:0;width:100%;height:100%', 'grayscale(1) contrast(1.2)', '50% 20%') + img('skyline-ville', 'inset:0;width:100%;height:100%;mix-blend-mode:screen;opacity:.75', 'sepia(.6) saturate(1.4) contrast(1.1)', '50% 60%') + A('inset:0;background:#C68B52;mix-blend-mode:multiply;opacity:.55')) +
        T(`left:60px;top:140px;font:900 150px/0.86 '${fr}';color:${off};letter-spacing:-.05em`, t.split(' ').join('<br>')) + film(0.14) + sig('#E8B57E'))
      case 'manifeste': return page('#141010', film(0.16) +
        T(`left:-10px;top:90px;width:1200px;font:900 150px/0.9 '${fr}';letter-spacing:-.05em;white-space:nowrap`, t.map((l, i) => `<div style="${i % 2 ? outline('#E8B57E', 2) : `color:${['#F6F0E7', '#C68B52', '#9E3B26'][i % 3]}`};margin-left:${[60, 0, 120, 30, 90][i]}px">${l}</div>`).join('')) + sig('#E8B57E'))
    }
  }
  function shapeBlend(d, color, blend = 'multiply', alpha = 0.85) { return `<svg width="${W}" height="${H}" style="${L.full}mix-blend-mode:${blend}"><path d="${d}" fill="${color}" fill-opacity="${alpha}"/></svg>` }
  M.cover = () => { const t = window.TITLES.modern.carrousel; return page('#7A3E1D', hot([800, 300], [200, 1100]) +
    gradShape(W, H, blob(720, 860, 430, { seed: 44, irr: 0.35 }), [['0%', '#F6E2C0'], ['100%', '#C68B52']], { cx: '30%', cy: '20%' }) +
    T(`left:50px;top:130px;font:900 240px/0.8 'Fraunces';color:#F6F0E7;letter-spacing:-.06em`, t[0]) +
    cut('voyage-valise', 'height:1080px;left:610px;bottom:-20px', 'drop-shadow(0 40px 50px rgba(30,10,4,.5))') +
    T(`left:70px;top:340px;font:300 italic 110px/0.9 'Fraunces';color:#141010`, t[1].replace(' ', '<br>')) +
    T(`left:70px;top:620px;width:380px;font:500 24px/1.45 Inter;color:#F6F0E7`, t[2]) + swipe('#F6F0E7', 1, TOTAL) + film(0.14) + sig('#F6F0E7')) }
  M.slide = (s, i) => page('#141010', mesh('#141010', [[200 + i * 300, 300, 900, ['#C68B52', '#9E3B26', '#7A3E1D'][i], 160, 0.9]]) + film(0.14) +
    gradShape(W, H, blob(860, 1150, 320, { seed: 60 + i, irr: 0.4 }), [['0%', '#F4DDB8'], ['100%', '#C68B52']]) +
    T(`left:50px;top:100px;font:900 380px/0.8 'Fraunces';color:#E8B57E;letter-spacing:-.06em;mix-blend-mode:screen`, s.n) +
    T(`left:70px;top:560px;width:900px;font:800 100px/0.94 'Fraunces';color:#F6F0E7;letter-spacing:-.04em`, s.title) +
    T(`left:70px;top:800px;width:620px;font:400 30px/1.5 Inter;color:#EBD8B8`, s.body) + swipe('#F6F0E7', i + 2, TOTAL) + sig('#E8B57E'))
  M.end = () => page('#7A3E1D', hot() + T(`left:70px;top:300px;width:940px;font:900 150px/0.86 'Fraunces';color:#F6F0E7;letter-spacing:-.05em`, 'Une bonne décision <i style="font-weight:300">tient</i> dans le temps.') +
    T(`left:70px;top:1120px;font:700 15px/1 Inter;letter-spacing:.3em;color:#F6F0E7`, 'ENREGISTRER · PARTAGER · @TIZIANA.CACI') + swipe('#F6F0E7', 5, TOTAL) + film(0.14))

  window.DIRECTIONS = [S, E, Fi, M]
  window.PAGE = page
  window.IMG = img
  window.CUT = cut
  window.FILTERS = F
  window.DUO = duo
})()
