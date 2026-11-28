/* Four CEO art directions. Each = a composition system rendering 12 posts (1080 × 1350) and carousel slides. */
;(function () {
  const W = 1080
  const H = 1350
  const TX = Object.fromEntries(window.CEO_TEXTURES.map((t) => [t.key, t]))
  const GR = window.GRAIN
  const A = (css, inner = '') => `<div style="position:absolute;${css}">${inner}</div>`
  const tz = (n) => `photographies/tiziana/tz-${n}.jpg`
  const ex = (n) => `photographies/libres-de-droits/${n}.jpg`
  const img = (src, css, filter, pos = 'center') => `<img src="${src}" alt="" style="position:absolute;display:block;object-fit:cover;object-position:${pos};filter:${filter};${css}">`
  const caps = (font, size, color, ls = 0.24, w = 600) => `font-family:'${font}';font-size:${size}px;font-weight:${w};letter-spacing:${ls}em;text-transform:uppercase;color:${color}`
  const pad = (n) => String(n).padStart(2, '0')
  const page = (bg, inner) => `<div class="native post" style="width:${W}px;height:${H}px;position:relative;overflow:hidden">${bg}${inner}</div>`
  const solid = (c) => `<div style="position:absolute;inset:0;background:${c}"></div>`
  const total = (car) => window.CAROUSEL_TOTAL[car]

  /* ====================================================================== 1 */
  const N1 = { navy: '#0E1626', navy2: '#18233A', cream: '#E9DFCF', white: '#F6F3EE', grey: '#8B857C', ink: '#0E1626' }
  const f1 = 'saturate(0.85) contrast(1.06) brightness(0.97)'
  const s1 = (size, color = '#fff', extra = '') => `font-family:'Instrument Serif';font-weight:400;font-size:${size}px;line-height:1.02;letter-spacing:-0.012em;color:${color};${extra}`
  const it1 = 'font-style:italic'
  const frame1 = (c = 'rgba(233,223,207,0.55)') => A(`inset:36px;border:1.5px solid ${c}`)
  const label1 = (t, dark) => `<span style="display:inline-block;padding:9px 16px;background:${dark ? N1.navy : N1.cream};${caps('Inter', 16, dark ? N1.cream : N1.navy, 0.26, 700)}">${t}</span>`
  const sig1 = (c = 'rgba(246,243,238,0.8)') => A(`left:84px;top:84px;${caps('Inter', 16, c, 0.3, 600)}`, 'Tiziana Caci')
  const shade1 = (from = 0.15, to = 0.88) => A(`inset:0;background:linear-gradient(180deg, rgba(14,22,38,${from}) 0%, rgba(14,22,38,0) 32%, rgba(14,22,38,0) 48%, rgba(14,22,38,${to}) 100%)`)
  const photo1 = (src, pos, title, label, size = 86) => page(img(tz(src), 'inset:0;width:100%;height:100%', f1, pos) + shade1() + GR(0.07) + frame1() + sig1() + A(`left:84px;right:84px;bottom:96px`, `${label ? label1(label) : ''}<div style="margin-top:28px;${s1(size)}">${title}</div>`))

  const ceo = {
    key: 'international-ceo', num: '1', name: 'The International CEO', short: 'International CEO',
    tagline: 'La couverture du magazine économique',
    idea: 'Le registre des couvertures de la presse économique internationale : Tiziana en grand, des photos plein cadre assombries vers le bleu nuit, une sérif éditoriale fine en blanc et un cartouche crème qui signe chaque publication.',
    impression: 'Autorité calme, envergure internationale. On a l’impression de suivre une dirigeante que la presse interviewe.',
    logic: 'Huit publications sur douze portent une photographie plein cadre. Le filet crème intérieur, la signature « Tiziana Caci » en haut à gauche et le cartouche de rubrique reviennent partout ; les pages typographiques bleu nuit rythment la grille en diagonale.',
    palette: [['Bleu nuit', N1.navy], ['Bleu nuit clair', N1.navy2], ['Crème (signature)', N1.cream], ['Blanc cassé', N1.white], ['Gris chaud', N1.grey]],
    beige: 'Le crème n’apparaît qu’en filet, en cartouche et sur deux pages sur douze.',
    fonts: [['Titres', 'Instrument Serif', 'Google Fonts · SIL OFL — romain et italique'], ['Texte et capitales', 'Inter', 'Google Fonts · SIL OFL — 400 à 700']],
    hierarchy: 'Titre 86–112 px · sous-titre 30 px · rubrique 16 px capitales espacées · signature 16 px',
    framing: 'Plein cadre, sujet au tiers supérieur, espace négatif bas pour le titre ; un filet crème intérieur à 36 px',
    portrait: 'Saturation −15 %, contraste +6 %, dégradé bleu nuit en pied (88 %), grain photo 7 %',
    textures: ['grain-photo', 'translucide', 'micro-relief'],
    lines: 'Filet crème 1,5 px à 36 px du bord sur les photos ; soulignement crème de 60 px sous les titres typographiques',
    motifs: 'Cartouche crème rectangulaire pour la rubrique ; aucun motif décoratif',
    grid: 'Marges 84 px ; titre calé en pied à 96 px ; signature en tête à 84 px',
    titles: 'En pied, fer à gauche, sur la partie assombrie de la photo',
    carousel: 'Photo plein cadre + cartouche crème « 01 — 04 » ; pages intérieures bleu nuit, grand numéro crème',
    filter: f1,
    post(p) {
      const n = p.n
      if (n === 1) return photo1('studio-marine', 'center 15%', p.title, 'Portrait', 92)
      if (n === 2) return page(solid(N1.navy) + GR(0.05), sig1() + A(`left:84px;right:84px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `${label1('Point de vue')}<div style="margin-top:40px;${s1(110)}">Une entreprise ne grandit jamais plus vite que <span style="${it1};color:${N1.cream}">sa structure.</span></div><div style="margin-top:46px;display:flex;align-items:center;gap:20px"><div style="width:72px;height:72px;border-radius:50%;overflow:hidden">${img(tz('studio-marine'), 'position:relative;width:72px;height:72px', f1, 'center 15%')}</div><span style="${caps('Inter', 16, N1.cream, 0.26, 600)}">Tiziana Caci</span></div>`))
      if (n === 3) return page(img(tz('bibliotheque-plan-large'), 'inset:0;width:100%;height:100%', f1, 'center 40%') + shade1(0.1, 0.4) + GR(0.07) + frame1(), sig1() + A(`left:84px;right:84px;bottom:96px;background:${N1.cream};padding:46px 50px`, `<div style="display:flex;justify-content:space-between;${caps('Inter', 16, N1.navy, 0.26, 700)}"><span>Stratégie</span><span>01 — 04</span></div><div style="margin-top:26px;${s1(100, N1.navy)}">${p.title}</div><div style="margin-top:14px;font-family:'Inter';font-size:27px;line-height:1.4;color:${N1.navy}">${p.sub}</div>`))
      if (n === 4) return photo1('bibliotheque-ordinateur', 'center 40%', p.title, 'Au bureau', 78)
      if (n === 5) return page(solid(N1.navy) + GR(0.05), sig1() + img(tz('fenetre-ronde-ordinateur'), 'right:84px;top:170px;width:400px;height:500px', f1, 'center 30%') + A(`left:84px;top:170px;width:470px`, `${label1('Finance')}<div style="margin-top:30px;${s1(92)}">${p.title}</div>`) + A(`left:84px;right:84px;bottom:96px`, `<div style="font-family:'Inter';font-size:27px;line-height:1.45;color:rgba(246,243,238,0.78);margin-bottom:34px">${p.sub}</div>${['Trésorerie', 'Marge', 'Fiscalité', 'Structure'].map((x) => `<div style="display:flex;justify-content:space-between;padding:18px 0;border-top:1px solid rgba(233,223,207,0.35);${s1(40)}"><span>${x}</span><span style="color:${N1.cream}">→</span></div>`).join('')}`))
      if (n === 6) return photo1('voyage-valise-fenetre', 'center 30%', p.title, 'International', 74)
      if (n === 7) return page(solid(N1.navy), img(tz('balcon-telephone'), 'left:0;top:0;width:640px;height:1350px', f1, 'center 25%') + GR(0.07) + A(`left:676px;right:60px;top:84px;bottom:96px;display:flex;flex-direction:column`, `${label1('Expérience')}<div style="margin-top:auto;${s1(74)}">${p.title}</div><div style="margin-top:30px;${caps('Inter', 16, N1.cream, 0.26, 600)}">1 / ${total('experience')} →</div>`))
      if (n === 8) return page(img(tz('studio-en-pied'), 'inset:0;width:100%;height:100%', f1 + ' brightness(0.96)', 'center 20%') + A(`inset:0;background:linear-gradient(180deg, rgba(14,22,38,0) 60%, rgba(14,22,38,0.45) 100%)`) + GR(0.06) + frame1(), sig1('rgba(14,22,38,0.75)'))
      if (n === 9) return page(TX['micro-relief'].layer(W, H), A(`left:110px;right:110px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${caps('Inter', 16, N1.grey, 0.3, 600)}">Vision</div><div style="margin-top:34px;${s1(98, N1.navy, it1)}">« Diriger, c’est donner une direction. Pas seulement des réponses. »</div><div style="margin-top:44px;width:60px;height:2px;background:${N1.navy}"></div><div style="margin-top:22px;${caps('Inter', 16, N1.navy, 0.3, 700)}">Tiziana Caci</div>`))
      if (n === 10) return page(img(ex('salle-blanche-fenetres'), 'inset:0;width:100%;height:100%', f1 + ' saturate(0.7)', 'center') + shade1(0.2, 0.9) + GR(0.06) + frame1(), sig1() + A(`left:84px;right:84px;bottom:96px`, `${label1('Méthode')}<div style="margin-top:28px;${s1(90)}">${p.title}</div>`))
      if (n === 11) return page(img(ex('skyline-ville'), 'inset:0;width:100%;height:100%', f1, 'center 40%') + shade1(0.3, 0.6) + GR(0.06) + frame1(), sig1() + A(`left:84px;right:84px;bottom:96px;background:${N1.cream};padding:46px 50px`, `<div style="display:flex;justify-content:space-between;${caps('Inter', 16, N1.navy, 0.26, 700)}"><span>International</span><span>01 — 03</span></div><div style="margin-top:26px;${s1(100, N1.navy)}">${p.title}</div><div style="margin-top:12px;font-family:'Inter';font-size:27px;color:${N1.navy}">${p.sub}</div>`))
      return photo1('table-reflexion', 'center 30%', `« ${p.title} »`, 'Signature', 64)
    },
    slide(car, s, i) {
      return page(solid(N1.navy) + GR(0.05), sig1() + A(`left:84px;right:84px;top:200px;bottom:96px;display:flex;flex-direction:column`, `<div style="${s1(220, N1.cream)};line-height:0.85">${s.n}</div><div style="margin-top:44px;${s1(84)}">${s.title}</div><div style="margin-top:auto;font-family:'Inter';font-size:33px;line-height:1.5;color:rgba(246,243,238,0.85)">${s.body}</div><div style="margin-top:44px;display:flex;justify-content:space-between;${caps('Inter', 16, N1.cream, 0.26, 600)}"><span>${i + 2} / ${total(car)}</span><span>→</span></div>`))
    },
  }

  /* ====================================================================== 2 */
  const N2 = { sand: '#D8C6AD', black: '#0E0E0E', white: '#FFFFFF', brown: '#2B1F18', warm: '#C9A27A', ink: '#0E0E0E' }
  const f2 = 'saturate(0.92) sepia(0.08) contrast(1.06)'
  const d2 = (size, color = N2.black, extra = '') => `font-family:'Manrope';font-weight:800;font-size:${size}px;line-height:1.0;letter-spacing:-0.04em;color:${color};${extra}`
  const it2 = (size, color) => `font-family:'Cormorant Garamond';font-style:italic;font-weight:500;font-size:${size}px;letter-spacing:-0.01em;color:${color}`
  const foot2 = (n, c = N2.black) => A(`left:72px;right:72px;bottom:64px;display:flex;justify-content:space-between;font-family:'Manrope';font-size:20px;font-weight:600;color:${c}`, `<span>Tiziana Caci —</span><span>${pad(n)}</span>`)
  const sandT = (w = W, h = H) => TX['trame'].layer(w, h, N2.sand)

  const bw = {
    key: 'business-woman', num: '2', name: 'The Business Woman', short: 'Business Woman',
    tagline: 'La présence et l’assurance',
    idea: 'Des compositions coupées net : une moitié photographie, une moitié noir ou sable, une grotesque très grasse en minuscules et une italique sérif pour la nuance. Une personnalité forte, sans détour.',
    impression: 'Assurée, directe, magnétique. Une femme d’affaires qui occupe l’espace et qu’on reconnaît au premier coup d’œil.',
    logic: 'Le feed alterne trois découpes : photo / bloc noir, photo / bloc sable, pleine page. La signature « Tiziana Caci — 01 » en pied et la grotesque grasse rendent chaque case identifiable, même en miniature.',
    palette: [['Noir profond', N2.black], ['Sable (signature)', N2.sand], ['Blanc', N2.white], ['Brun très foncé', N2.brown], ['Beige chaud', N2.warm]],
    beige: 'Le sable occupe des blocs, jamais une page entière de photo : un tiers des publications au plus.',
    fonts: [['Titres', 'Manrope ExtraBold', 'Google Fonts · SIL OFL — 800, minuscules serrées'], ['Accent', 'Cormorant Garamond Italic', 'Google Fonts · SIL OFL'], ['Texte', 'Manrope', 'Google Fonts · SIL OFL — 400 à 600']],
    hierarchy: 'Titre 72–128 px (interlettrage −4 %) · accent italique 1,1× · texte 28 px · signature 20 px',
    framing: 'Découpes franches 50/50 ou 60/40, verticales ou horizontales ; portraits cadrés serré, regard caméra',
    portrait: 'Couleur chaude : saturation −8 %, sépia 8 %, contraste +6 %',
    textures: ['trame', 'papier-premium', 'degrade-gris'],
    lines: 'Aucun filet : ce sont les découpes qui structurent',
    motifs: 'Bloc plein (noir, sable ou brun) accolé à la photo',
    grid: 'Marges 72 px ; découpe sur la colonne 7/12 ou à mi-hauteur',
    titles: 'Dans le bloc plein, calés en haut ou en bas, jamais sur le visage',
    carousel: 'Fond noir ou brun, photo en tête sur 60 %, titre sable ; pages intérieures sable, numéro italique',
    filter: f2,
    post(p) {
      const n = p.n
      if (n === 1) return page(solid(N2.black), img(tz('studio-vert-bras-croises'), 'left:0;top:0;width:620px;height:1350px', f2, 'center 20%') + A(`left:660px;right:56px;top:110px;bottom:140px;display:flex;flex-direction:column`, `<div style="${it2(34, N2.warm)}">Portrait</div><div style="margin-top:auto;${d2(66, N2.white)}">Décider, c’est aussi assumer ce que l’on <span style="${it2(74, N2.sand)}">écarte.</span></div>`) + foot2(n, N2.white))
      if (n === 2) return page(sandT(), A(`left:72px;right:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${d2(124)}">Une entreprise ne grandit jamais plus vite que sa <span style="${it2(136, N2.brown)}">structure.</span></div>`) + foot2(n))
      if (n === 3) return page(solid(N2.black), img(tz('fenetre-ronde-ordinateur'), 'left:0;top:0;width:1080px;height:780px', f2, 'center 35%') + A(`left:72px;right:72px;top:830px`, `<div style="${it2(34, N2.warm)}">Stratégie · 4 questions</div><div style="margin-top:16px;${d2(104, N2.sand)}">${p.title}</div><div style="margin-top:16px;font-family:'Manrope';font-size:27px;color:rgba(255,255,255,0.7)">${p.sub}</div>`) + foot2(n, N2.white))
      if (n === 4) return page(img(tz('bibliotheque-sourire'), 'left:0;top:0;width:100%;height:940px', f2, 'center 35%') + A(`left:0;right:0;top:940px;bottom:0`, sandT(W, 410)), A(`left:72px;right:72px;top:990px`, `<div style="${d2(62)}">Les décisions importantes se préparent <span style="${it2(70, N2.brown)}">loin des réunions.</span></div>`) + foot2(n))
      if (n === 5) return page(solid(N2.white), img(tz('dejeuner-affaires'), 'right:72px;top:72px;width:400px;height:480px', f2, 'center 30%') + A(`left:72px;top:110px;width:500px`, `<div style="${it2(34, N2.warm)}">Finance</div><div style="margin-top:18px;${d2(80)}">${p.title}</div>`) + A(`left:72px;right:72px;bottom:140px`, `<div style="font-family:'Manrope';font-size:28px;line-height:1.45;color:#333;margin-bottom:30px">${p.sub}</div>${['Trésorerie', 'Marge', 'Fiscalité', 'Structure'].map((x, i) => `<div style="display:flex;justify-content:space-between;padding:20px 0;border-top:2px solid ${N2.black};${d2(40)}"><span>${x}</span><span style="${it2(40, N2.warm)}">0${i + 1}</span></div>`).join('')}`) + foot2(n))
      if (n === 6) return page(img(tz('salle-restaurant'), 'inset:0;width:100%;height:100%', f2, 'center 40%') + GR(0.05), A(`left:72px;right:72px;bottom:130px;background:${N2.black};padding:40px 44px`, `<div style="${it2(32, N2.warm)}">International</div><div style="margin-top:14px;${d2(58, N2.white)}">${p.title}</div>`) + foot2(n, N2.white))
      if (n === 7) return page(sandT(), img(tz('balcon-telephone'), 'left:72px;top:110px;width:560px;height:720px', f2, 'center 25%') + img(tz('balcon-message'), 'left:560px;top:380px;width:448px;height:560px', f2, 'center 30%') + A(`left:72px;right:72px;top:990px`, `<div style="${it2(32, N2.brown)}">Expérience · 1 / ${total('experience')}</div><div style="margin-top:12px;${d2(58)}">${p.title}</div>`) + foot2(n))
      if (n === 8) return page(img(tz('restaurant-bras-croises'), 'inset:0;width:100%;height:100%', f2, 'center 30%') + GR(0.05), foot2(n, N2.white))
      if (n === 9) return page(solid(N2.black), A(`left:72px;right:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${d2(104, N2.white)}">Diriger, c’est donner une direction.</div><div style="margin-top:20px;${it2(96, N2.sand)}">Pas seulement des réponses.</div>`) + foot2(n, N2.white))
      if (n === 10) return page(img(ex('facade-courbe'), 'left:0;top:0;width:100%;height:1050px', f2 + ' saturate(0.6)', 'center') + A(`left:0;right:0;top:1050px;bottom:0;background:${N2.black}`), A(`left:72px;right:72px;top:1090px`, `<div style="${d2(64, N2.white)}">Ce qui dure se construit dans le bon <span style="${it2(70, N2.sand)}">ordre.</span></div>`) + foot2(n, N2.white))
      if (n === 11) return page(solid(N2.brown), img(tz('voyage-valise'), 'left:72px;top:72px;width:936px;height:700px', f2, 'center 30%') + A(`left:72px;right:72px;top:820px`, `<div style="${it2(34, N2.warm)}">International · 3 points</div><div style="margin-top:14px;${d2(100, N2.sand)}">${p.title}</div><div style="margin-top:14px;font-family:'Manrope';font-size:27px;color:rgba(255,255,255,0.7)">${p.sub}</div>`) + foot2(n, N2.white))
      return page(sandT(), img(tz('studio-en-pied'), 'left:0;top:0;width:560px;height:1350px', f2, 'center 15%') + A(`left:600px;right:60px;top:110px;bottom:140px;display:flex;flex-direction:column;justify-content:flex-end`, `<div style="${it2(64, N2.brown)}">« Je préfère comprendre le problème</div><div style="margin-top:8px;${d2(58)}">avant de chercher la solution. »</div>`) + foot2(n))
    },
    slide(car, s, i) {
      return page(sandT(), A(`left:72px;right:72px;top:110px;bottom:140px;display:flex;flex-direction:column`, `<div style="${it2(240, N2.brown)};line-height:0.8">${s.n}</div><div style="margin-top:50px;${d2(84)}">${s.title}</div><div style="margin-top:auto;font-family:'Manrope';font-size:33px;line-height:1.5;color:${N2.black}">${s.body}</div>`) + foot2(i + 2))
    },
  }

  /* ====================================================================== 3 */
  const N3 = { blue: '#0A1A33', min: '#DCD3C4', stone: '#A39E95', white: '#FAFAF8', ink: '#0A1A33', line: 'rgba(10,26,51,0.22)' }
  const f3 = 'saturate(0.72) contrast(1.05) brightness(0.99)'
  const c3 = (size, color = N3.blue, extra = '') => `font-family:'Libre Caslon Text';font-weight:400;font-size:${size}px;line-height:1.08;letter-spacing:-0.01em;color:${color};${extra}`
  const head3 = (n, section, dark) => {
    const c = dark ? N3.min : N3.blue
    return A(`left:72px;right:72px;top:64px;display:flex;justify-content:space-between;padding-bottom:16px;border-bottom:1.5px solid ${c};${caps('Inter', 16, c, 0.22, 600)}`, `<span>Tiziana Caci — ${section}</span><span style="font-variant-numeric:tabular-nums">N° ${pad(n)}</span>`)
  }
  const fig3 = (t, dark) => `<div style="margin-top:12px;font-family:'Inter';font-size:18px;color:${dark ? 'rgba(220,211,196,0.75)' : N3.stone}">${t}</div>`
  const tint3 = A(`inset:0;background:rgba(10,26,51,0.12);mix-blend-mode:multiply`)
  const ph3 = (src, css, pos) => A(css, img(tz(src), 'inset:0;width:100%;height:100%', f3, pos) + tint3)
  const chart3 = (w, h, c) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><line x1="0" y1="${h}" x2="${w}" y2="${h}" stroke="${c}" stroke-width="1.5"/><line x1="0" y1="0" x2="0" y2="${h}" stroke="${c}" stroke-width="1.5"/>${[0.25, 0.5, 0.75].map((k) => `<line x1="0" y1="${h * k}" x2="${w}" y2="${h * k}" stroke="${c}" stroke-opacity="0.25" stroke-dasharray="4 6"/>`).join('')}<path d="M0,${h * 0.82} C${w * 0.2},${h * 0.7} ${w * 0.35},${h * 0.62} ${w * 0.5},${h * 0.45} S${w * 0.8},${h * 0.18} ${w},${h * 0.1}" fill="none" stroke="${c}" stroke-width="3"/><path d="M0,${h * 0.9} C${w * 0.25},${h * 0.86} ${w * 0.45},${h * 0.8} ${w * 0.6},${h * 0.72} S${w * 0.85},${h * 0.62} ${w},${h * 0.58}" fill="none" stroke="#C8B79C" stroke-width="3"/></svg>`
  const mineralBg = () => TX['minerale'].layer(W, H, N3.min)

  const fin = {
    key: 'financial-strategist', num: '3', name: 'The Financial Strategist', short: 'Financial Strategist',
    tagline: 'Le rapport de banque privée',
    idea: 'La rigueur d’un rapport de banque privée ou d’une lettre de stratégie : une grille stricte, des filets, des légendes « Fig. », une sérif de banque classique et des schémas économiques sans chiffres. Tiziana apparaît comme l’analyste et la décideuse.',
    impression: 'Intelligence, maîtrise, précision. On a le sentiment de lire une analyse qui fait autorité.',
    logic: 'Chaque publication porte le même bandeau de tête (rubrique + N°) et respecte la même grille de 12 colonnes. Photos, schémas et tableaux sont traités comme des figures légendées. Le bleu très profond n’apparaît que sur une publication sur trois.',
    palette: [['Bleu très profond', N3.blue], ['Beige minéral (signature)', N3.min], ['Gris pierre', N3.stone], ['Blanc', N3.white]],
    beige: 'Le beige minéral sert de papier aux analyses et aux citations ; les photos restent neutres et froides.',
    fonts: [['Titres', 'Libre Caslon Text', 'Google Fonts · SIL OFL — 400 et 700'], ['Texte, légendes, tableaux', 'Inter', 'Google Fonts · SIL OFL — chiffres tabulaires']],
    hierarchy: 'Titre 72–104 px · texte 28 px · légende « Fig. » 18 px · bandeau 16 px capitales',
    framing: 'Photos dans la grille (8/12 ou 12/12 colonnes), toujours légendées ; jamais de photo sans cadre',
    portrait: 'Saturation −28 %, voile bleu profond 12 % en multiplication : froid, neutre, sérieux',
    textures: ['minerale', 'architecturale', 'papier-premium'],
    lines: 'Bandeau de tête : filet 1,5 px ; filets de tableau 1 px à 22 %',
    motifs: 'Courbes économiques abstraites (sans valeurs), tableaux sans chiffres, index numérotés',
    grid: '12 colonnes, marges 72 px, bandeau à 64 px ; texte justifié à gauche sur 6 colonnes',
    titles: 'En haut sous le bandeau, ou sous la figure',
    carousel: 'Page de sommaire : titre + index 01–04 en tableau ; pages intérieures blanches, numéro en sérif',
    filter: f3,
    post(p) {
      const n = p.n
      if (n === 1) return page(solid(N3.white), head3(n, 'Portrait') + ph3('studio-marine', 'left:360px;top:150px;width:648px;height:860px', 'center 15%') + A(`left:72px;top:170px;width:260px`, `<div style="${c3(46)}">Décider, c’est aussi assumer ce que l’on écarte.</div>`) + A(`left:360px;top:1024px`, fig3('Fig. 01 — Portrait')) + A(`left:72px;right:72px;bottom:72px;height:150px;overflow:hidden`, TX['minerale'].layer(936, 150, N3.min) + A('left:36px;top:0;bottom:0;right:36px;display:flex;align-items:center;justify-content:space-between', `<span style="font-family:'Inter';font-size:24px;color:${N3.blue}">Tiziana Caci — CEO de Fynovates</span><span style="${caps('Inter', 16, N3.blue, 0.22, 600)}">Portrait</span>`)))
      if (n === 2) return page(solid(N3.blue), head3(n, 'Point de vue', true) + A(`left:72px;right:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${c3(96, N3.white)}">Une entreprise ne grandit jamais plus vite que sa structure.</div><div style="margin-top:40px;width:120px;height:1.5px;background:${N3.min}"></div><div style="margin-top:22px;font-family:'Inter';font-size:22px;color:rgba(220,211,196,0.8)">Note 02 — sur la croissance et l’organisation</div>`))
      if (n === 3) return page(mineralBg(), head3(n, 'Stratégie') + A(`left:72px;right:72px;top:190px;bottom:72px;display:flex;flex-direction:column`, `<div style="${c3(104)}">${p.title}</div><div style="margin-top:20px;font-family:'Inter';font-size:28px;line-height:1.45;color:${N3.blue}">${p.sub}</div><div style="margin-top:auto">${['L’exigence réelle de l’activité', 'La capacité de la structure', 'Le coût d’une erreur d’ordre', 'Ce qui doit rester maîtrisé'].map((x, i) => `<div style="display:grid;grid-template-columns:90px 1fr 60px;padding:22px 0;border-top:1px solid ${N3.line};align-items:baseline"><span style="${c3(30)}">0${i + 1}</span><span style="font-family:'Inter';font-size:28px;color:${N3.blue}">${x}</span><span style="font-family:'Inter';font-size:22px;color:${N3.stone};text-align:right">p. ${i + 2}</span></div>`).join('')}</div>`))
      if (n === 4) return page(solid(N3.white), head3(n, 'Méthode') + ph3('bibliotheque-plan-large', 'left:72px;top:150px;width:936px;height:760px', 'center 40%') + A(`left:72px;top:922px`, fig3('Fig. 04 — Au bureau')) + A(`left:72px;right:72px;top:990px`, `<div style="${c3(66)}">${p.title}</div>`))
      if (n === 5) return page(solid(N3.blue), head3(n, 'Finance', true) + A(`left:72px;top:170px;width:600px`, `<div style="${c3(84, N3.white)}">${p.title}</div>`) + A(`left:72px;top:520px`, chart3(936, 360, N3.min)) + A(`left:72px;top:892px`, fig3('Fig. 05 — Schéma illustratif, sans données', true)) + A(`left:72px;right:72px;bottom:72px`, `<div style="font-family:'Inter';font-size:27px;line-height:1.45;color:rgba(250,250,248,0.85);margin-bottom:26px">${p.sub}</div>${['Ce qui entre', 'Ce qui reste'].map((x) => `<div style="display:flex;justify-content:space-between;padding:16px 0;border-top:1px solid rgba(220,211,196,0.35);font-family:'Inter';font-size:26px;color:${N3.min}"><span>${x}</span><span>—</span></div>`).join('')}`))
      if (n === 6) return page(solid(N3.white), head3(n, 'International') + ph3('voyage-valise-fenetre', 'left:72px;top:150px;width:456px;height:760px', 'center 30%') + A(`left:552px;top:150px;width:456px;height:760px`, img(ex('skyline-ville'), 'inset:0;width:100%;height:100%', f3, 'center 40%') + tint3) + A(`left:72px;top:922px`, fig3('Fig. 06 — En déplacement ; paysage urbain (CC0)')) + A(`left:72px;right:72px;top:990px`, `<div style="${c3(60)}">${p.title}</div>`))
      if (n === 7) return page(TX['papier-premium'].layer(W, H, '#F1ECE3'), head3(n, 'Expérience') + ph3('balcon-telephone', 'left:72px;top:150px;width:620px;height:820px', 'center 25%') + A(`left:716px;top:150px;width:292px;font-family:'Inter';font-size:22px;line-height:1.5;color:${N3.blue}`, `Trois enseignements, cinq pages.<div style="margin-top:20px;${c3(120, N3.stone)}">03</div>`) + A(`left:72px;right:72px;top:1010px`, `<div style="${c3(64)}">${p.title}</div><div style="margin-top:18px;font-family:'Inter';font-size:20px;color:${N3.stone}">1 / ${total('experience')} →</div>`))
      if (n === 8) return page(solid(N3.white), ph3('fenetre-ronde-ordinateur', 'left:72px;top:72px;width:936px;height:1140px', 'center 30%') + A(`left:72px;top:1226px`, fig3('Fig. 08 — Tiziana Caci')))
      if (n === 9) return page(mineralBg(), head3(n, 'Leadership') + A(`left:72px;right:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${c3(92, N3.blue, 'font-style:italic')}">« Diriger, c’est donner une direction. Pas seulement des réponses. »</div><div style="margin-top:40px;padding-top:20px;border-top:1px solid ${N3.line};font-family:'Inter';font-size:22px;color:${N3.blue}">Tiziana Caci, CEO de Fynovates</div>`))
      if (n === 10) return page(TX['architecturale'].layer(W, H, '#EFE9DF'), head3(n, 'Structure') + A(`left:72px;top:150px;width:624px;height:820px`, img(ex('colonnes-beton'), 'inset:0;width:100%;height:100%', f3) + tint3) + A(`left:72px;top:982px`, fig3('Fig. 10 — Architecture (CC0)')) + A(`left:72px;right:72px;top:1040px`, `<div style="${c3(64)}">${p.title}</div>`))
      if (n === 11) return page(solid(N3.blue), head3(n, 'International', true) + A(`left:72px;top:170px;width:936px;height:520px`, img(tz('dejeuner-affaires'), 'inset:0;width:100%;height:100%', f3, 'center 30%') + A(`inset:0;background:rgba(10,26,51,0.25)`)) + A(`left:72px;right:72px;top:740px`, `<div style="${c3(100, N3.white)}">${p.title}</div><div style="margin-top:18px;font-family:'Inter';font-size:28px;color:rgba(220,211,196,0.85)">${p.sub}</div>`) + A(`left:72px;right:72px;bottom:72px;display:flex;gap:16px`, [1, 2, 3].map((k) => `<div style="flex:1;border-top:1.5px solid ${N3.min};padding-top:14px;font-family:'Inter';font-size:20px;color:${N3.min}">0${k}</div>`).join('')))
      return page(solid(N3.white), head3(n, 'Signature') + ph3('studio-marine-reflexion', 'left:72px;top:150px;width:456px;height:640px', 'center 15%') + A(`left:552px;top:150px;width:456px`, `<div style="${c3(50, N3.blue, 'font-style:italic')}">« Je préfère comprendre le problème avant de chercher la solution. »</div>`) + A(`left:72px;top:802px`, fig3('Fig. 12 — Tiziana Caci')) + A(`left:72px;right:72px;bottom:72px;height:380px;overflow:hidden`, TX['minerale'].layer(936, 380, N3.min) + A('left:40px;top:40px;right:40px', `<div style="font-family:'Inter';font-size:26px;line-height:1.5;color:${N3.blue}">Une méthode avant une réponse : comprendre la situation, vérifier, puis décider.</div>`)))
    },
    slide(car, s, i) {
      return page(solid(N3.white), head3(i + 2, car === 'strategie' ? 'Stratégie' : car === 'experience' ? 'Expérience' : 'International') + A(`left:72px;right:72px;top:190px;bottom:72px;display:flex;flex-direction:column`, `<div style="${c3(200, N3.stone)};line-height:0.9">${s.n}</div><div style="margin-top:40px;padding-top:30px;border-top:1.5px solid ${N3.blue};${c3(78)}">${s.title}</div><div style="margin-top:auto;font-family:'Inter';font-size:33px;line-height:1.5;color:${N3.blue}">${s.body}</div><div style="margin-top:40px;display:flex;justify-content:space-between;font-family:'Inter';font-size:20px;color:${N3.stone}"><span>${i + 2} / ${total(car)}</span><span>→</span></div>`))
    },
  }

  /* ====================================================================== 4 */
  const N4 = { cream: '#EDE5D8', black: '#111111', anth: '#2E2E30', off: '#F7F4EE', petrol: '#2F4B4A', ink: '#111111' }
  const f4 = 'saturate(0.88) contrast(1.1)'
  const s4 = (size, color = N4.black, extra = '') => `font-family:'DM Serif Display';font-weight:400;font-size:${size}px;line-height:0.95;letter-spacing:-0.02em;color:${color};${extra}`
  const mark4 = (c = N4.petrol) => A(`left:72px;top:72px;width:22px;height:22px;background:${c}`)
  const tag4 = (n, c = N4.black) => A(`left:110px;top:72px;${caps('Manrope', 17, c, 0.22, 700)};line-height:22px`, `Tiziana Caci · ${pad(n)}`)
  const notch = 'polygon(0 0, 100% 0, 100% 78%, 70% 78%, 70% 100%, 0 100%)'
  const creamPaper = (w = W, h = H) => TX['papier-premium'].layer(w, h, N4.cream)

  const exec = {
    key: 'modern-executive', num: '4', name: 'The Modern Executive', short: 'Modern Executive',
    tagline: 'L’affirmation contemporaine',
    idea: 'Des photographies plein cadre au fort contraste, des titres très grands qui débordent sur l’image, des découpes graphiques et des blocs crème asymétriques. Une couleur secondaire rare — un vert pétrole — signe le système.',
    impression: 'Moderne, affirmé, haut de gamme et humain. Une dirigeante contemporaine, à la fois présente et accessible.',
    logic: 'Le carré vert pétrole et la signature en haut à gauche reviennent sur chaque publication. Les titres géants chevauchent la limite photo / bloc ; les découpes en encoche et les blocs crème décalés évitent toute répétition tout en gardant une même écriture.',
    palette: [['Noir', N4.black], ['Anthracite', N4.anth], ['Crème (signature)', N4.cream], ['Blanc cassé', N4.off], ['Vert pétrole (secondaire)', N4.petrol]],
    beige: 'Le crème vient en blocs décalés et en papier sur deux pages ; jamais sur toute une photo.',
    fonts: [['Titres', 'DM Serif Display', 'Google Fonts · SIL OFL — très grands corps'], ['Texte et signature', 'Manrope', 'Google Fonts · SIL OFL — 400 à 700']],
    hierarchy: 'Titre 96–150 px (interlignage 0,95) · texte 28 px · signature 17 px capitales',
    framing: 'Plein cadre ou découpe en encoche ; le visage toujours dans le tiers haut, le titre chevauche la limite',
    portrait: 'Contraste +10 %, saturation −12 % : franc, sans filtre chaud',
    textures: ['papier-premium', 'grain-photo', 'degrade-gris'],
    lines: 'Aucun filet ; un carré vert pétrole de 22 px comme signature',
    motifs: 'Encoche découpée dans la photo, bloc crème décalé, titres débordants',
    grid: 'Marges 72 px ; asymétrie volontaire : blocs calés sur 7/12 ou 9/12',
    titles: 'Très grands, chevauchant la photo et le bloc crème ou noir',
    carousel: 'Photo découpée en encoche + titre géant sur bloc crème ; pages intérieures anthracite',
    filter: f4,
    post(p) {
      const n = p.n
      if (n === 1) return page(solid(N4.off), img(tz('studio-marine'), 'left:0;top:0;width:1080px;height:960px', f4, 'center 15%') + GR(0.05) + A(`left:0;top:880px;width:860px;height:470px`, creamPaper(860, 470)) + A(`left:72px;top:930px;width:760px`, `<div style="${s4(82)}">Décider, c’est aussi assumer ce que l’on écarte.</div>`) + mark4() + tag4(n, '#fff'))
      if (n === 2) return page(solid(N4.anth), A(`left:72px;top:260px;right:0;bottom:200px`, creamPaper(1008, 890)) + A(`left:130px;top:330px;right:80px`, `<div style="${s4(118)}">Une entreprise ne grandit jamais plus vite que sa structure.</div>`) + mark4(N4.petrol) + tag4(n, N4.cream))
      if (n === 3) return page(solid(N4.black), A(`left:0;top:0;width:1080px;height:1000px;clip-path:${notch}`, img(tz('bibliotheque-ordinateur'), 'inset:0;width:100%;height:100%', f4, 'center 40%') + GR(0.05)) + A(`left:72px;top:820px;width:700px;height:420px`, creamPaper(700, 420)) + A(`left:110px;top:860px;width:640px`, `<div style="${s4(118)}">${p.title}</div><div style="margin-top:20px;font-family:'Manrope';font-size:26px;line-height:1.4;color:${N4.anth}">${p.sub}</div>`) + A(`right:72px;bottom:110px;${caps('Manrope', 17, N4.cream, 0.22, 700)}`, '1 / 6 →') + mark4() + tag4(n, '#fff'))
      if (n === 4) return page(img(tz('fenetre-ronde-contre-jour'), 'inset:0;width:100%;height:100%', f4, 'center 35%') + GR(0.06) + A(`inset:0;background:linear-gradient(180deg, rgba(17,17,17,0) 55%, rgba(17,17,17,0.85) 100%)`), A(`left:72px;right:72px;bottom:96px`, `<div style="${s4(84, '#fff')}">${p.title}</div>`) + mark4(N4.cream) + tag4(n, '#fff'))
      if (n === 5) return page(creamPaper(), A(`right:0;top:0;width:420px;height:620px`, img(tz('fenetre-ronde-ordinateur'), 'inset:0;width:100%;height:100%', f4 + ' grayscale(1)', 'center 30%')) + A(`left:72px;top:170px;width:560px`, `<div style="${s4(96)}">${p.title}</div>`) + A(`left:72px;right:72px;bottom:110px`, `<div style="font-family:'Manrope';font-size:28px;line-height:1.45;color:${N4.anth};margin-bottom:34px;max-width:780px">${p.sub}</div><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">${['Trésorerie', 'Marge', 'Fiscalité', 'Structure'].map((x, i) => `<div style="background:${i === 0 ? N4.petrol : N4.black};color:${N4.off};padding:26px 20px;min-height:150px;display:flex;align-items:flex-end;font-family:'Manrope';font-weight:700;font-size:24px">${x}</div>`).join('')}</div>`) + mark4() + tag4(n))
      if (n === 6) return page(img(tz('voyage-valise'), 'inset:0;width:100%;height:100%', f4, 'center 30%') + GR(0.05) + A(`inset:0;background:linear-gradient(90deg, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.55) 45%, rgba(17,17,17,0) 75%)`), A(`left:72px;top:200px;width:520px`, `<div style="${caps('Manrope', 17, N4.cream, 0.22, 700)}">International</div><div style="margin-top:26px;${s4(80, '#fff')}">${p.title}</div>`) + mark4(N4.cream) + tag4(n, '#fff'))
      if (n === 7) return page(solid(N4.anth), img(tz('balcon-message'), 'left:300px;top:0;width:780px;height:1100px', f4, 'center 30%') + A(`left:72px;top:760px;width:700px;height:480px`, creamPaper(700, 480)) + A(`left:110px;top:800px;width:630px`, `<div style="${s4(70)}">${p.title}</div><div style="margin-top:20px;${caps('Manrope', 17, N4.petrol, 0.22, 700)}">Expérience · 1 / ${total('experience')}</div>`) + mark4() + tag4(n, N4.cream))
      if (n === 8) return page(img(tz('studio-vert-bras-croises'), 'inset:0;width:100%;height:100%', f4, 'center 20%') + GR(0.05), mark4() + tag4(n))
      if (n === 9) return page(solid(N4.black), A(`left:72px;right:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${s4(124, N4.cream)}">Diriger, c’est donner une direction.</div><div style="margin-top:30px;font-family:'Manrope';font-size:40px;font-weight:600;color:${N4.off}">Pas seulement des réponses.</div>`) + mark4() + tag4(n, N4.cream))
      if (n === 10) return page(solid(N4.off), A(`left:0;top:0;width:1080px;height:1050px;clip-path:polygon(0 0, 100% 0, 100% 100%, 30% 100%, 30% 86%, 0 86%)`, img(ex('facade-ondulee'), 'inset:0;width:100%;height:100%', f4 + ' grayscale(1)')) + A(`left:72px;top:960px;width:720px`, `<div style="${s4(84)}">${p.title}</div>`) + mark4() + tag4(n))
      if (n === 11) return page(solid(N4.petrol), A(`left:380px;top:0;width:700px;height:900px`, img(ex('skyline-ville'), 'inset:0;width:100%;height:100%', f4 + ' grayscale(1)', 'center 40%')) + A(`left:72px;top:620px;width:760px;height:600px`, creamPaper(760, 600)) + A(`left:110px;top:670px;width:690px`, `<div style="${s4(110)}">${p.title}</div><div style="margin-top:20px;font-family:'Manrope';font-size:27px;color:${N4.anth}">${p.sub}</div>`) + mark4(N4.cream) + tag4(n, N4.cream))
      return page(img(tz('restaurant-bras-croises'), 'inset:0;width:100%;height:100%', f4, 'center 30%') + GR(0.05) + A(`inset:0;background:linear-gradient(180deg, rgba(17,17,17,0) 50%, rgba(17,17,17,0.8) 100%)`), A(`left:72px;right:72px;bottom:96px`, `<div style="${s4(70, '#fff')}">« Je préfère comprendre le problème avant de chercher la solution. »</div>`) + mark4() + tag4(n, '#fff'))
    },
    slide(car, s, i) {
      return page(solid(N4.anth), A(`left:72px;top:150px;width:520px;height:520px`, creamPaper(520, 520)) + A(`left:110px;top:180px;${s4(300, N4.petrol)}`, s.n) + A(`left:72px;right:72px;top:740px`, `<div style="${s4(88, N4.off)}">${s.title}</div><div style="margin-top:36px;font-family:'Manrope';font-size:33px;line-height:1.5;color:rgba(247,244,238,0.85)">${s.body}</div>`) + A(`right:72px;bottom:96px;${caps('Manrope', 17, N4.cream, 0.22, 700)}`, `${i + 2} / ${total(car)} →`) + mark4() + tag4(i + 2, N4.cream))
    },
  }

  window.DIRECTIONS = [ceo, bw, fin, exec]
  window.POST_SIZE = { W, H }
})()
