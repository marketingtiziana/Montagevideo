/* Four art directions = four composition systems. Each renders 12 posts (1080 × 1350) and carousel slides. */
;(function () {
  const W = 1080
  const H = 1350
  const TX = Object.fromEntries(window.BEIGE_TEXTURES.map((t) => [t.key, t]))
  const GR = window.PHOTO_GRAIN
  const A = (css, inner = '') => `<div style="position:absolute;${css}">${inner}</div>`
  const tzp = (name) => `photographies/tiziana/tz-${name}.jpg`
  const exp = (name) => `photographies/libres-de-droits/${name}.jpg`
  const img = (src, css, filter = 'none', pos = 'center') => `<img src="${src}" alt="" style="position:absolute;display:block;object-fit:cover;object-position:${pos};filter:${filter};${css}">`
  const caps = (font, size, color, ls = 0.24, w = 600) => `font-family:'${font}';font-size:${size}px;font-weight:${w};letter-spacing:${ls}em;text-transform:uppercase;color:${color}`
  const pad = (n) => String(n).padStart(2, '0')
  const page = (bg, inner) => `<div class="native post" style="width:${W}px;height:${H}px;position:relative;overflow:hidden">${bg}${inner}</div>`

  /* =========================================================================
     D1 — CARNET : magazine éditorial, papier fin, photos encadrées d’une marge crème
     ========================================================================= */
  const C = { bg: '#EFE8DC', bg2: '#E2D6C3', white: '#F8F4EC', ink: '#1D1915', contrast: '#3A2D24', accent: '#A0714F', muted: '#7A6E60' }
  const F1 = { d: 'Cormorant Garamond', t: 'Inter' }
  const f1 = 'saturate(0.9) sepia(0.07) contrast(1.02)'
  const head1 = (n, light) =>
    A(`left:80px;right:80px;top:64px;display:flex;justify-content:space-between;align-items:center;${caps(F1.t, 17, light ? 'rgba(255,255,255,0.85)' : C.muted, 0.3)}`, `<span>Tiziana Caci</span><span>Carnet · N° ${pad(n)}</span>`) +
    A(`left:80px;right:80px;top:104px;height:1px;background:${light ? 'rgba(255,255,255,0.5)' : C.ink};opacity:${light ? 1 : 0.35}`)
  const serif1 = (size, color = C.ink, extra = '') => `font-family:'${F1.d}';font-weight:500;font-size:${size}px;line-height:1.04;letter-spacing:-0.01em;color:${color};${extra}`
  const ital1 = `font-style:italic;font-weight:400`
  const bg1 = (b = C.bg) => TX['papier-editorial'].layer(W, H, b)

  const carnet = {
    key: 'carnet',
    num: '1',
    name: 'Carnet',
    tagline: 'Le magazine de fond',
    idea: 'La page d’un magazine économique haut de gamme. Beaucoup d’air, une grande sérif à fort contraste, des photographies posées sur une marge crème comme dans une revue. Tiziana s’exprime en peu de mots.',
    impression: 'Calme, cultivé, intemporel. On a le sentiment de feuilleter une revue que l’on garde.',
    logic: 'Damier régulier : une photographie encadrée, une page de texte, une couverture. Le folio « Carnet · N° » et le filet d’en-tête reviennent sur chaque publication et signent le feed.',
    palette: [['Beige principal', C.bg], ['Beige secondaire', C.bg2], ['Blanc cassé', C.white], ['Contraste', C.contrast], ['Typographie', C.ink], ['Accent', C.accent]],
    textures: ['papier-editorial', 'photographique'],
    fonts: [
      ['Titres', 'Cormorant Garamond', 'Google Fonts · SIL OFL — 500 et italique'],
      ['Lecture', 'Inter', 'Google Fonts · SIL OFL — 400 à 600'],
      ['Accent', 'Cormorant Garamond Italic', 'Google Fonts · SIL OFL'],
    ],
    elements: {
      Bordures: 'Marge crème de 80 px autour des photos encadrées ; aucune bordure tracée',
      Filets: 'Un filet encre de 1 px sous l’en-tête, à 35 % d’opacité',
      Cadres: 'Photo encadrée (marges 80 px, haut 150 px) ou pleine page',
      Formes: 'Aucune forme : la typographie fait la composition',
      Superpositions: 'Texte blanc sur photo pleine page uniquement',
      Numérotations: 'Folio « Carnet · N° 01 » en capitales espacées',
      Séparateurs: 'Tiret cadratin, petites capitales',
      Photographies: 'Couleur naturelle, saturation −10 %, sépia 7 %',
      Textures: 'Papier éditorial à 5 % sur toutes les pages ; grain photo léger sur les pleines pages',
    },
    grid: {
      Marges: '80 px latérales, 150 px en tête (en-tête + filet), 110 px en pied',
      Alignements: 'Centré pour les citations et prises de position, fer à gauche pour les textes longs',
      'Position des titres': 'Sous la photo, ou au tiers inférieur sur les pleines pages',
      'Photo / texte': '1/3 photo encadrée, 1/3 texte seul, 1/3 pleine page photo',
      Hiérarchie: 'Titre 64–110 px sérif · sous-titre 28 px italique · capitales 17 px',
      Espacement: 'Interlignage serré pour les titres (1,04), aéré pour la lecture (1,5)',
      Contraste: 'Encre #1D1915 sur crème : contraste > 13:1',
    },
    photo: f1,
    post(p) {
      const n = p.n
      if (n === 1) return page(bg1(), head1(n) + img(tzp('studio-vert-reflexion'), `left:80px;top:150px;width:920px;height:880px`, f1, 'center 20%') + A(`left:80px;right:80px;top:1072px;text-align:center`, `<div style="${serif1(62)}">${p.title}</div><div style="margin-top:16px;${caps(F1.t, 16, C.muted, 0.3)}">${p.sub}</div>`))
      if (n === 2) return page(bg1(), head1(n) + A(`left:110px;right:110px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;text-align:center`, `<div style="${serif1(118)}">Le pays vient<br><span style="${ital1}">après</span> le projet.</div><div style="margin:48px auto 0;width:60px;height:1px;background:${C.ink}"></div><div style="margin-top:28px;${serif1(32, C.muted, ital1)}">${p.sub}</div>`))
      if (n === 3) return page(bg1(C.white), head1(n) + A(`left:80px;right:80px;top:200px;bottom:110px;display:flex;flex-direction:column`, `<div style="${caps(F1.t, 18, C.accent, 0.3)}">Expertise · à garder</div><div style="margin-top:34px;${serif1(118)}">${p.title}</div><div style="margin-top:14px;${serif1(50, C.ink, ital1)}">${p.sub.toLowerCase()}</div><div style="margin-top:auto">${['Le foyer', 'L’activité réelle', 'Les intérêts économiques', 'Les règles de chaque pays', 'Les conventions fiscales'].map((x, i) => `<div style="display:flex;gap:28px;padding:20px 0;border-top:1px solid rgba(29,25,21,0.22);${serif1(36)}"><span style="${caps(F1.t, 16, C.muted, 0.2)};padding-top:12px">${pad(i + 1)}</span>${x}</div>`).join('')}</div><div style="margin-top:26px;text-align:right;${caps(F1.t, 16, C.muted)}">Faire défiler →</div>`))
      if (n === 4) return page(img(tzp('bibliotheque-ordinateur'), `inset:0;width:100%;height:100%`, f1, 'center 40%') + A(`inset:0;background:linear-gradient(180deg, rgba(20,14,8,0.35) 0%, rgba(20,14,8,0) 30%, rgba(20,14,8,0) 55%, rgba(20,14,8,0.55) 100%)`) + GR(0.05) + head1(n, true) + A(`left:80px;right:80px;bottom:110px;color:#fff`, `<div style="${caps(F1.t, 16, 'rgba(255,255,255,0.8)', 0.3)}">${p.sub}</div><div style="margin-top:18px;${serif1(84, '#fff')}">${p.title}</div>`))
      if (n === 5) return page(bg1(), head1(n) + A(`left:80px;right:80px;top:210px;bottom:110px;display:flex;flex-direction:column`, `<div style="${caps(F1.t, 17, C.accent, 0.3)}">Réflexion</div><div style="margin-top:30px;${serif1(80)}">${p.title}</div><div style="margin-top:auto">${p.body.map((x) => `<p style="font-family:'${F1.t}';font-size:31px;line-height:1.5;color:${C.ink};margin-top:26px">${x}</p>`).join('')}</div><div style="margin-top:40px;${serif1(34, C.muted, ital1)}">— Tiziana</div>`))
      if (n === 6) return page(bg1(), head1(n) + img(exp('skyline-ville'), `left:440px;top:150px;width:560px;height:1090px`, f1 + ' grayscale(0.2)', 'center') + A(`left:80px;top:150px;width:320px;bottom:110px;display:flex;flex-direction:column`, `<div style="${caps(F1.t, 16, C.accent, 0.3)}">International</div><div style="margin-top:auto;${serif1(50)}">${p.title}</div>`))
      if (n === 7) return page(bg1(C.bg2), head1(n) + img(tzp('balcon-telephone'), `left:80px;top:150px;width:920px;height:700px`, f1, 'center 25%') + A(`left:80px;right:80px;top:890px;bottom:110px;display:flex;flex-direction:column`, `<div style="${caps(F1.t, 17, C.accent, 0.3)}">Récit · 1 / 5</div><div style="margin-top:20px;${serif1(86)}">${p.title}</div><div style="margin-top:14px;${serif1(38, C.ink, ital1)}">${p.sub}</div>`))
      if (n === 8) return page(img(tzp('fenetre-ronde-lecture'), `inset:0;width:100%;height:100%`, f1, 'center 30%') + GR(0.06) + head1(n, true))
      if (n === 9) return page(bg1(C.white), head1(n) + A(`left:120px;right:120px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;text-align:center`, `<div style="${serif1(220, C.accent)};line-height:0.5;height:110px">“</div><div style="${serif1(88, C.ink, ital1)}">${p.title}</div><div style="margin-top:50px;${caps(F1.t, 17, C.muted, 0.3)}">${p.sub}</div>`))
      if (n === 10) return page(bg1(), head1(n) + img(exp('facade-classique'), `left:80px;top:150px;width:920px;height:760px`, f1 + ' grayscale(0.15)', 'center') + A(`left:80px;right:80px;top:950px`, `<div style="${serif1(78)}">${p.title}</div><div style="margin-top:18px;${serif1(36, C.muted, ital1)}">${p.sub}</div>`))
      if (n === 11) return page(TX['papier-editorial'].layer(W, H, C.contrast), head1(n, true) + A(`left:80px;right:80px;top:220px;bottom:110px;display:flex;flex-direction:column;color:${C.white}`, `<div style="${caps(F1.t, 17, 'rgba(248,244,236,0.7)', 0.3)}">Réflexion · à garder</div><div style="margin-top:auto;${serif1(104, C.white)}">Croissance :<br><span style="${ital1}">faut-il tout</span><br>restructurer ?</div><div style="margin-top:34px;width:60px;height:1px;background:${C.white}"></div><div style="margin-top:26px;font-family:'${F1.t}';font-size:28px;color:rgba(248,244,236,0.8)">${p.sub}</div>`))
      return page(bg1(), head1(n) + img(tzp('voyage-valise-fenetre'), `left:190px;top:150px;width:700px;height:900px`, f1, 'center 30%') + A(`left:80px;right:80px;top:1086px;text-align:center`, `<div style="${serif1(56)}">${p.title}</div><div style="margin-top:14px;${caps(F1.t, 16, C.muted, 0.3)}">${p.sub}</div>`))
    },
    slide(car, s, i) {
      const total = window.CAROUSEL_TOTAL[car]
      return page(bg1(car === 'reflexion' ? C.bg2 : C.white), head1(car === 'reflexion' ? 11 : car === 'story' ? 7 : 3) + A(`left:80px;right:80px;top:210px;bottom:110px;display:flex;flex-direction:column`, `<div style="${serif1(200, C.accent)};line-height:0.9">${s.n}</div><div style="margin-top:40px;${serif1(86)}">${s.title}</div><div style="margin-top:auto;font-family:'${F1.t}';font-size:33px;line-height:1.5;color:${C.ink}">${s.body}</div><div style="margin-top:40px;display:flex;justify-content:space-between;${caps(F1.t, 16, C.muted)}"><span>${i + 2} / ${total}</span><span>→</span></div>`))
    },
  }

  /* =========================================================================
     D2 — ATELIER : papier artisanal, tirages photo posés sur la page, bandeaux sable
     ========================================================================= */
  const K = { bg: '#E6DACA', bg2: '#D9C6AA', white: '#F3ECE1', ink: '#2E251C', contrast: '#4A3B2A', accent: '#A86F4C', muted: '#7D6A55' }
  const F2 = { d: 'Fraunces', t: 'Manrope' }
  const f2 = 'sepia(0.16) saturate(0.86) contrast(1.03) brightness(1.02)'
  const serif2 = (size, color = K.ink, extra = '') => `font-family:'${F2.d}';font-weight:380;font-size:${size}px;line-height:1.05;letter-spacing:-0.015em;color:${color};font-variation-settings:'SOFT' 100, 'WONK' 0;${extra}`
  const ital2 = `font-style:italic;font-weight:340`
  const bg2 = (b) => TX['papier-artisanal'].layer(W, H, b || K.bg)
  const sandBg = () => TX['sable'].layer(W, H)
  const tag2 = (n, label, color = K.accent) => A(`left:84px;top:78px;display:flex;align-items:center;gap:16px;${caps(F2.t, 18, color, 0.22, 700)}`, `<span style="display:inline-block;width:12px;height:12px;border-radius:12px;background:${color}"></span>${label}<span style="opacity:.6;margin-left:8px">${pad(n)}</span>`)
  const print = (src, css, rot = -1.2, pos = 'center') => A(`${css};background:#FBF8F2;padding:18px 18px 64px;box-shadow:0 18px 40px -22px rgba(60,40,20,0.45);transform:rotate(${rot}deg)`, `<div style="position:relative;width:100%;height:100%;overflow:hidden">${img(src, 'inset:0;width:100%;height:100%', f2, pos)}${GR(0.07)}</div>`)
  const band = (title, sub, label) => A(`left:0;right:0;bottom:0;height:430px`, TX['sable'].layer(W, 430) + A(`left:84px;right:84px;top:62px`, `<div style="${caps(F2.t, 18, K.accent, 0.22, 700)}">${label}</div><div style="margin-top:20px;${serif2(70)}">${title}</div>${sub ? `<div style="margin-top:16px;font-family:'${F2.t}';font-size:27px;color:${K.muted}">${sub}</div>` : ''}`))

  const atelier = {
    key: 'atelier',
    num: '2',
    name: 'Atelier',
    tagline: 'La matière et la main',
    idea: 'Un papier artisanal, une sérif douce à forte personnalité, des tirages photo posés sur la page. L’identité la plus tactile et la plus chaleureuse : on sent la personne derrière la dirigeante.',
    impression: 'Chaleureux, incarné, artisanal au sens noble. Une dirigeante accessible, qui montre sa manière de travailler.',
    logic: 'Alternance de trois gestes : le tirage posé (photo à bord blanc légèrement incliné), la pleine page avec bandeau sable, la page de texte sur papier. La pastille argile et le numéro reviennent partout.',
    palette: [['Beige principal', K.bg], ['Beige secondaire', K.bg2], ['Blanc cassé', K.white], ['Contraste', K.contrast], ['Typographie', K.ink], ['Accent argile', K.accent]],
    textures: ['papier-artisanal', 'sable', 'photographique'],
    fonts: [
      ['Titres', 'Fraunces', 'Google Fonts · SIL OFL — variable, axes SOFT et WONK'],
      ['Lecture', 'Manrope', 'Google Fonts · SIL OFL — 400 à 700'],
      ['Accent', 'Fraunces Italic', 'Google Fonts · SIL OFL'],
    ],
    elements: {
      Bordures: 'Bord blanc de 18 px (64 px en pied) autour des tirages',
      Filets: 'Aucun filet : la matière du papier suffit',
      Cadres: 'Tirage photo incliné de −1,5° à +1,5°, ombre portée douce',
      Formes: 'Pastille ronde argile de 12 px devant chaque rubrique',
      Superpositions: 'Bandeau sable en pied de photo, deux tirages qui se chevauchent',
      Numérotations: 'Numéro à côté de la rubrique ; grand chiffre en couverture de carrousel',
      Séparateurs: 'Pastille argile',
      Photographies: 'Ton chaud : sépia 16 %, saturation −14 %, grain argentique',
      Textures: 'Papier artisanal (scan CC0) sur les pages de texte, sable sur les bandeaux',
    },
    grid: {
      Marges: '84 px ; tirages libres dans la page avec au moins 80 px d’air',
      Alignements: 'Fer à gauche partout',
      'Position des titres': 'Dans le bandeau sable (bas) ou sous le tirage',
      'Photo / texte': 'Photos dominantes : 2/3 des publications portent une photographie',
      Hiérarchie: 'Titre Fraunces 70–110 px · rubrique Manrope 18 px capitales · texte 30 px',
      Espacement: 'Interlignage 1,05 titres, 1,55 lecture',
      Contraste: 'Encre #2E251C sur papier : contraste > 11:1',
    },
    photo: f2,
    post(p) {
      const n = p.n
      if (n === 1) return page(bg2(), tag2(n, 'Portrait') + print(tzp('bibliotheque-sourire'), 'left:150px;top:160px;width:780px;height:800px', -1.4, 'center 30%') + A(`left:84px;right:84px;top:1078px`, `<div style="${serif2(70)}">${p.title}</div>`))
      if (n === 2) return page(bg2(K.white), tag2(n, 'Point de vue') + A(`left:84px;right:84px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${serif2(124)}">Le pays vient <span style="${ital2};color:${K.accent}">après</span> le projet.</div><div style="margin-top:48px;font-family:'${F2.t}';font-size:28px;color:${K.muted}">${p.sub}</div>`))
      if (n === 3) return page(sandBg(), tag2(n, 'Expertise') + A(`right:-30px;top:80px;${serif2(860, 'rgba(168,111,76,0.16)', ital2)};line-height:0.9`, '5') + A(`left:84px;right:84px;bottom:120px`, `<div style="${serif2(108)}">${p.title}</div><div style="margin-top:22px;${serif2(46, K.ink, ital2)}">${p.sub.toLowerCase()}</div><div style="margin-top:56px;display:flex;justify-content:space-between;${caps(F2.t, 18, K.muted, 0.2, 700)}"><span>Carrousel · 7 pages</span><span>Faire glisser →</span></div>`))
      if (n === 4) return page(img(tzp('bibliotheque-plan-large'), 'inset:0;width:100%;height:100%', f2, 'center 40%') + GR(0.07) + band(p.title, '', p.sub))
      if (n === 5) return page(bg2(), tag2(n, 'Réflexion') + A(`left:84px;right:84px;top:210px;bottom:120px;display:flex;flex-direction:column`, `<div style="${serif2(86)}">${p.title}</div><div style="margin-top:auto">${p.body.map((x, i) => `<div style="display:flex;gap:26px;margin-top:30px"><span style="${serif2(44, K.accent, ital2)}">${i + 1}.</span><span style="font-family:'${F2.t}';font-size:31px;line-height:1.5;color:${K.ink}">${x}</span></div>`).join('')}</div><div style="margin-top:48px;${serif2(38, K.muted, ital2)}">Tiziana</div>`))
      if (n === 6) return page(img(exp('skyline-ville'), 'inset:0;width:100%;height:100%', f2 + ' sepia(0.25)', 'center 40%') + GR(0.06) + band('Travailler entre plusieurs pays, c’est tout réexaminer.', '', 'International'))
      if (n === 7) return page(bg2(), tag2(n, 'Récit') + print(tzp('balcon-telephone'), 'left:90px;top:170px;width:560px;height:640px', -2.2, 'center 25%') + print(tzp('balcon-message'), 'left:470px;top:300px;width:520px;height:600px', 1.6, 'center 30%') + A(`left:84px;right:84px;top:1010px`, `<div style="${serif2(80)}">${p.title}</div><div style="margin-top:14px;${serif2(36, K.muted, ital2)}">${p.sub}</div>`))
      if (n === 8) return page(img(tzp('fenetre-ronde-ordinateur'), 'inset:0;width:100%;height:100%', f2, 'center 35%') + GR(0.08))
      if (n === 9) return page(sandBg(), A(`left:84px;right:84px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${serif2(98, K.ink, ital2)}">Une structure doit servir un projet, <span style="font-style:normal;color:${K.accent}">pas l’inverse.</span></div><div style="margin-top:60px;display:flex;align-items:center;gap:16px;${caps(F2.t, 18, K.muted, 0.22, 700)}"><span style="display:inline-block;width:12px;height:12px;border-radius:12px;background:${K.accent}"></span>Tiziana Caci</div>`))
      if (n === 10) return page(bg2(K.white), tag2(n, 'Regard') + print(exp('colonnes-beton'), 'left:240px;top:170px;width:600px;height:780px', 1.2) + A(`left:84px;right:84px;top:1040px`, `<div style="${serif2(76)}">${p.title}</div><div style="margin-top:14px;font-family:'${F2.t}';font-size:27px;color:${K.muted}">${p.sub}</div>`))
      if (n === 11) return page(TX['papier-artisanal'].layer(W, H, K.contrast), tag2(n, 'Réflexion', '#E4C9A8') + A(`left:84px;right:84px;bottom:120px;color:${K.white}`, `<div style="${serif2(108, K.white)}">Croissance :<br>faut-il <span style="${ital2};color:#E4C9A8">tout</span><br>restructurer ?</div><div style="margin-top:30px;font-family:'${F2.t}';font-size:28px;color:rgba(243,236,225,0.75)">${p.sub}</div>`))
      return page(img(tzp('voyage-valise'), 'inset:0;width:100%;height:100%', f2, 'center 30%') + GR(0.07) + band(p.title, '', p.sub))
    },
    slide(car, s, i) {
      const total = window.CAROUSEL_TOTAL[car]
      const dark = car === 'reflexion'
      return page(dark ? TX['papier-artisanal'].layer(W, H, K.contrast) : bg2(), A(`right:-10px;top:40px;${serif2(560, dark ? 'rgba(228,201,168,0.14)' : 'rgba(168,111,76,0.14)', ital2)};line-height:0.9`, s.n.replace(/^0/, '')) + tag2(i + 2, car === 'reflexion' ? 'Réflexion' : car === 'story' ? 'Récit' : 'Expertise', dark ? '#E4C9A8' : K.accent) + A(`left:84px;right:84px;bottom:130px`, `<div style="${serif2(92, dark ? K.white : K.ink)}">${s.title}</div><div style="margin-top:34px;font-family:'${F2.t}';font-size:33px;line-height:1.5;color:${dark ? 'rgba(243,236,225,0.85)' : K.ink}">${s.body}</div><div style="margin-top:50px;${caps(F2.t, 18, dark ? 'rgba(243,236,225,0.6)' : K.muted, 0.2, 700)}">${i + 2} / ${total} →</div>`))
    },
  }

  /* =========================================================================
     D3 — TRIBUNE : quotidien économique, noir et beige, photos noir et blanc
     ========================================================================= */
  const T = { bg: '#E8E0D2', bg2: '#D6CCBB', white: '#F4F0E8', ink: '#111111', contrast: '#111111', muted: '#5A544B' }
  const F3 = { d: 'Playfair Display', t: 'Manrope' }
  const f3 = 'grayscale(1) contrast(1.12) brightness(1.02)'
  const disp3 = (size, color = T.ink, extra = '') => `font-family:'${F3.d}';font-weight:700;font-size:${size}px;line-height:1.02;letter-spacing:-0.015em;color:${color};${extra}`
  const bg3 = (b) => TX['lin'].layer(W, H, b || T.bg)
  const mast = (n, dark) => {
    const c = dark ? T.bg : T.ink
    return A(`left:72px;right:72px;top:60px;height:8px;background:${c}`) + A(`left:72px;right:72px;top:76px;height:1.5px;background:${c}`) + A(`left:72px;right:72px;top:96px;display:flex;justify-content:space-between;${caps(F3.t, 17, c, 0.26, 700)}`, `<span>Tiziana Caci</span><span>Tribune — N° ${pad(n)}</span>`)
  }
  const kick3 = (label, dark) => `<span style="display:inline-block;background:${dark ? T.bg : T.ink};color:${dark ? T.ink : T.bg};padding:8px 14px;${caps(F3.t, 17, dark ? T.ink : T.bg, 0.22, 800)}">${label}</span>`
  const black = (inner) => page(`<div style="position:absolute;inset:0;background:${T.ink}"></div>`, inner)

  const tribune = {
    key: 'tribune',
    num: '3',
    name: 'Tribune',
    tagline: 'La prise de position',
    idea: 'Les codes d’un grand quotidien économique : une manchette, des titres très noirs, des photographies en noir et blanc, des pages inversées pour les idées fortes. Tiziana signe des tribunes.',
    impression: 'Affirmé, frontal, intellectuel. Une dirigeante qui a un point de vue et l’assume.',
    logic: 'Une manchette identique en tête de chaque publication. Le rythme alterne pages claires (photo + titre) et pages noires (idée forte), en damier, ce qui donne au feed un contraste immédiatement reconnaissable.',
    palette: [['Beige principal', T.bg], ['Beige secondaire', T.bg2], ['Blanc cassé', T.white], ['Contraste', '#111111'], ['Typographie', T.ink], ['Gris texte', T.muted]],
    textures: ['lin'],
    fonts: [
      ['Titres', 'Playfair Display', 'Google Fonts · SIL OFL — 700 et italique'],
      ['Lecture', 'Manrope', 'Google Fonts · SIL OFL — 400 à 800'],
      ['Accent', 'Playfair Display Italic', 'Google Fonts · SIL OFL'],
    ],
    elements: {
      Bordures: 'Aucune ; les photos sont coupées à fond perdu latéral',
      Filets: 'Manchette : filet épais de 8 px + filet fin de 1,5 px',
      Cadres: 'Étiquette noire pleine pour la rubrique (« DOSSIER », « TRIBUNE »)',
      Formes: 'Pages inversées noires pour les prises de position et citations',
      Superpositions: 'Cartouche beige sur photo noir et blanc',
      Numérotations: '« Tribune — N° 01 » dans la manchette',
      Séparateurs: 'Filets noirs pleine largeur',
      Photographies: 'Noir et blanc, contraste +12 % (traitement, sans retouche des traits)',
      Textures: 'Lin très fin à 7 % sur les pages beige ; aucune texture sur le noir',
    },
    grid: {
      Marges: '72 px ; manchette en haut à 60 px',
      Alignements: 'Fer à gauche, titres en drapeau',
      'Position des titres': 'Sous la photo, ou plein cadre sur page noire',
      'Photo / texte': '50 / 50 : la moitié des publications est typographique',
      Hiérarchie: 'Titre Playfair 72–130 px · rubrique 17 px capitales grasses · texte 30 px',
      Espacement: 'Titres serrés (1,02) ; colonnes de texte justifiées à gauche',
      Contraste: 'Noir #111 sur beige et inversement : contraste maximal',
    },
    photo: f3,
    post(p) {
      const n = p.n
      if (n === 1) return page(bg3(), mast(n) + img(tzp('studio-marine'), 'left:0;right:0;top:150px;width:100%;height:760px', f3, 'center 18%') + A(`left:72px;right:72px;top:950px`, `${kick3('Portrait')}<div style="margin-top:26px;${disp3(80)}">${p.title}</div>`))
      if (n === 2) return black(mast(n, true) + A(`left:72px;right:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `${kick3('Tribune', true)}<div style="margin-top:40px;${disp3(140, T.bg)}">Le pays vient après le projet.</div><div style="margin-top:44px;font-family:'${F3.t}';font-size:28px;color:rgba(232,224,210,0.75)">${p.sub}</div>`))
      if (n === 3) return page(bg3(T.white), mast(n) + A(`left:72px;right:72px;top:180px;bottom:100px;display:flex;flex-direction:column`, `${kick3('Dossier')}<div style="margin-top:34px;${disp3(126)}">Résidence fiscale</div><div style="margin-top:16px;${disp3(50, T.ink, 'font-style:italic;font-weight:400')}">${p.sub}</div><div style="margin-top:auto;display:grid;grid-template-columns:1fr 1fr;column-gap:40px;border-top:1.5px solid ${T.ink}">${['Le foyer', 'L’activité réelle', 'Les intérêts économiques', 'Les règles nationales', 'Les conventions', 'Les documents'].map((x, i) => `<div style="padding:20px 0;border-bottom:1px solid rgba(17,17,17,0.25);display:flex;gap:16px;font-family:'${F3.t}';font-size:28px;font-weight:600"><span style="font-weight:800">${i + 1}.</span>${x}</div>`).join('')}</div><div style="margin-top:22px;${caps(F3.t, 17, T.ink, 0.2, 800)}">Lire le dossier →</div>`))
      if (n === 4) return page(img(tzp('bibliotheque-ordinateur'), 'inset:0;width:100%;height:100%', f3, 'center 40%') + mast(n, true) + A(`left:72px;bottom:90px;max-width:820px;background:${T.bg};padding:36px 40px`, `${kick3(p.sub)}<div style="margin-top:22px;${disp3(68)}">${p.title}</div>`))
      if (n === 5) return page(bg3(), mast(n) + A(`left:72px;right:72px;top:180px;bottom:100px;display:flex;flex-direction:column`, `${kick3('Réflexion')}<div style="margin-top:30px;${disp3(86)}">${p.title}</div><div style="margin-top:auto;display:grid;grid-template-columns:1fr 1fr;column-gap:44px;border-top:1.5px solid ${T.ink};padding-top:28px">${p.body.map((x) => `<p style="font-family:'${F3.t}';font-size:29px;line-height:1.5;color:${T.ink};margin-bottom:24px">${x}</p>`).join('')}<p style="${disp3(36, T.ink, 'font-style:italic;font-weight:400')}">— T. C.</p></div>`))
      if (n === 6) return page(bg3(), mast(n) + img(exp('skyline-ville'), 'left:0;top:150px;width:100%;height:700px', f3, 'center 60%') + A(`left:72px;right:72px;top:890px`, `${kick3('International')}<div style="margin-top:24px;${disp3(64)}">${p.title}</div>`))
      if (n === 7) return black(mast(n, true) + img(tzp('balcon-telephone'), 'left:72px;top:160px;width:936px;height:640px', f3, 'center 25%') + A(`left:72px;right:72px;top:850px`, `${kick3('Récit', true)}<div style="margin-top:26px;${disp3(96, T.bg)}">${p.title}</div><div style="margin-top:16px;${disp3(40, 'rgba(232,224,210,0.8)', 'font-style:italic;font-weight:400')}">${p.sub}</div>`))
      if (n === 8) return page(img(tzp('fenetre-ronde-contre-jour'), 'inset:0;width:100%;height:100%', f3, 'center 35%') + mast(n, true))
      if (n === 9) return black(mast(n, true) + A(`left:72px;right:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${disp3(300, T.bg)};line-height:0.6;height:150px">“</div><div style="${disp3(96, T.bg, 'font-style:italic;font-weight:400')}">${p.title}</div><div style="margin-top:48px;${caps(F3.t, 18, T.bg, 0.26, 800)}">— Tiziana Caci</div>`))
      if (n === 10) return page(bg3(T.white), mast(n) + img(exp('escalier-beton'), 'left:72px;top:150px;width:936px;height:760px', f3) + A(`left:72px;right:72px;top:950px`, `${kick3('Éditorial')}<div style="margin-top:24px;${disp3(80)}">${p.title}</div><div style="margin-top:14px;font-family:'${F3.t}';font-size:28px;color:${T.muted}">${p.sub}</div>`))
      if (n === 11) return black(mast(n, true) + A(`left:72px;right:72px;top:200px;bottom:100px;display:flex;flex-direction:column`, `${kick3('Dossier', true)}<div style="margin-top:auto;${disp3(124, T.bg)}">Croissance : faut-il tout restructurer ?</div><div style="margin-top:30px;border-top:1.5px solid ${T.bg};padding-top:24px;font-family:'${F3.t}';font-size:28px;color:rgba(232,224,210,0.8)">${p.sub}</div>`))
      return page(bg3(), mast(n) + img(tzp('voyage-valise-fenetre'), 'left:0;top:150px;width:100%;height:820px', f3, 'center 30%') + A(`left:72px;right:72px;top:1010px`, `${kick3(p.sub)}<div style="margin-top:24px;${disp3(62)}">${p.title}</div>`))
    },
    slide(car, s, i) {
      const total = window.CAROUSEL_TOTAL[car]
      const dark = car === 'reflexion'
      const c = dark ? T.bg : T.ink
      const inner = mast(car === 'reflexion' ? 11 : car === 'story' ? 7 : 3, dark) + A(`left:72px;right:72px;top:190px;bottom:100px;display:flex;flex-direction:column`, `<div style="${disp3(240, c)};line-height:0.9">${s.n}</div><div style="margin-top:30px;border-top:1.5px solid ${c};padding-top:30px;${disp3(92, c)}">${s.title}</div><div style="margin-top:auto;font-family:'${F3.t}';font-size:34px;line-height:1.5;color:${c}">${s.body}</div><div style="margin-top:44px;display:flex;justify-content:space-between;${caps(F3.t, 17, c, 0.2, 800)}"><span>${i + 2} / ${total}</span><span>→</span></div>`)
      return dark ? black(inner) : page(bg3(T.white), inner)
    },
  }

  /* =========================================================================
     D4 — ARCHITECTE : pierre, plans translucides, modules asymétriques, filet bleu nuit
     ========================================================================= */
  const R = { bg: '#E3D9C9', bg2: '#CBBBA2', white: '#F5F0E8', ink: '#1F1B17', contrast: '#0D082E', muted: '#7C7063', taupe: '#8C7F6E' }
  const F4 = { d: 'Manrope', t: 'Manrope', a: 'Instrument Serif' }
  const f4 = 'saturate(0.82) contrast(1.04) brightness(1.01)'
  const disp4 = (size, color = R.ink, extra = '') => `font-family:'${F4.d}';font-weight:800;font-size:${size}px;line-height:0.98;letter-spacing:-0.035em;text-transform:uppercase;color:${color};${extra}`
  const ital4 = (size, color = R.ink) => `font-family:'${F4.a}';font-style:italic;font-weight:400;font-size:${size}px;line-height:1.05;letter-spacing:-0.01em;text-transform:none;color:${color}`
  const stone = () => TX['mineral'].layer(W, H)
  const navyLine = (css) => A(`${css};height:5px;background:${R.contrast}`)
  const idx4 = (n, color = R.muted) => A(`right:72px;top:70px;${caps(F4.t, 17, color, 0.26, 700)}`, `TC / ${pad(n)}`)
  const veil = (css, alpha = 0.72) => A(`${css};background:rgba(245,240,232,${alpha});backdrop-filter:blur(2px)`)

  const architecte = {
    key: 'architecte',
    num: '4',
    name: 'Architecte',
    tagline: 'La structure et l’espace',
    idea: 'Une pierre beige, des plans translucides, des modules asymétriques et une capitale grotesque très dense, adoucie par une italique sérif. Un filet bleu nuit fait le lien avec Fynovates.',
    impression: 'Contemporain, construit, international. Une dirigeante qui organise et qui décide.',
    logic: 'Une grille de modules : la photo n’est jamais centrée, toujours décalée et chevauchée par un plan crème translucide qui porte le texte. L’index « TC / 01 » et le filet bleu nuit reviennent partout.',
    palette: [['Beige principal', R.bg], ['Beige secondaire', R.bg2], ['Blanc cassé', R.white], ['Contraste bleu nuit', R.contrast], ['Typographie', R.ink], ['Taupe', R.taupe]],
    textures: ['mineral', 'translucide', 'degrade-chaud'],
    fonts: [
      ['Titres', 'Manrope ExtraBold', 'Google Fonts · SIL OFL — 800, capitales serrées'],
      ['Lecture', 'Manrope', 'Google Fonts · SIL OFL — 400 à 600'],
      ['Accent', 'Instrument Serif Italic', 'Google Fonts · SIL OFL'],
    ],
    elements: {
      Bordures: 'Aucune ; les photos sont des modules découpés',
      Filets: 'Filet bleu nuit de 5 px, toujours horizontal, toujours court',
      Cadres: 'Modules photo décalés, débordant d’un bord',
      Formes: 'Plans rectangulaires crème et sable translucides (35 à 72 %)',
      Superpositions: 'Plan translucide chevauchant un angle de la photo, texte posé dessus',
      Numérotations: 'Index « TC / 01 » en haut à droite ; grands chiffres en couverture',
      Séparateurs: 'Filet bleu nuit',
      Photographies: 'Saturation −18 %, contraste +4 % : neutre et minéral',
      Textures: 'Pierre beige à 9 % sur les pages de texte, plans translucides, dégradé chaud en couverture',
    },
    grid: {
      Marges: '72 px ; grille de 4 colonnes de 216 px, gouttière 24 px',
      Alignements: 'Fer à gauche ; titres calés sur une colonne',
      'Position des titres': 'Sur le plan translucide, au croisement photo / fond',
      'Photo / texte': 'Photo à 55–70 % de la surface, jamais plein cadre centré',
      Hiérarchie: 'Titre Manrope 800 capitales 64–110 px · italique Instrument Serif · index 17 px',
      Espacement: 'Titres très serrés (0,98 ; −3,5 %), lecture 1,5',
      Contraste: 'Encre #1F1B17 sur pierre ; bleu nuit réservé aux filets et à une page sur douze',
    },
    photo: f4,
    post(p) {
      const n = p.n
      if (n === 1) return page(stone(), img(tzp('studio-marine-reflexion'), 'left:330px;top:0;width:750px;height:1000px', f4, 'center 15%') + veil('left:72px;top:760px;width:700px;height:440px') + A(`left:112px;top:810px;width:620px`, `<div style="${disp4(76)}">Diriger,<br>c’est d’abord<br><span style="${ital4(86)}">comprendre.</span></div>`) + navyLine('left:112px;top:1160px;width:110px') + idx4(n))
      if (n === 2) return page(TX['translucide'].layer(W, H), idx4(n) + A(`left:72px;right:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${disp4(118)}">Le pays<br>vient après<br>le <span style="${ital4(132)}">projet.</span></div>`) + navyLine('left:72px;bottom:200px;width:140px') + A(`left:72px;bottom:130px;font-family:'${F4.t}';font-size:27px;color:${R.muted}`, p.sub))
      if (n === 3) return page(TX['degrade-chaud'].layer(W, H), idx4(n) + A(`left:72px;top:120px;display:grid;grid-template-columns:repeat(5,1fr);gap:14px;width:936px`, [1, 2, 3, 4, 5].map((k) => `<div style="height:170px;background:rgba(245,240,232,${k === 1 ? 0.95 : 0.45});display:flex;align-items:flex-end;padding:18px;${disp4(48, k === 1 ? R.contrast : R.ink)}">${pad(k)}</div>`).join('')) + A(`left:72px;right:72px;bottom:120px`, `<div style="${disp4(110)}">Résidence<br>fiscale</div><div style="margin-top:22px;${ital4(50)}">cinq questions avant de partir</div>`) + navyLine('left:72px;bottom:80px;width:140px'))
      if (n === 4) return page(img(tzp('bibliotheque-sourire'), 'inset:0;width:100%;height:100%', f4, 'center 35%') + veil('left:0;top:0;width:430px;height:100%', 0.78) + A(`left:72px;top:120px;width:300px;bottom:120px;display:flex;flex-direction:column`, `<div style="${caps(F4.t, 17, R.muted, 0.26, 700)}">${p.sub}</div><div style="margin-top:auto;${disp4(58)}">Préparer<br>avant de<br><span style="${ital4(64)}">conseiller.</span></div>`) + navyLine('left:72px;bottom:80px;width:110px') + idx4(n, '#fff'))
      if (n === 5) return page(stone(), idx4(n) + A(`left:72px;top:150px;width:700px`, `<div style="${disp4(80)}">Ce que j’ai appris en créant <span style="${ital4(88)}">mon cabinet</span></div>`) + navyLine('left:72px;top:640px;width:140px') + A(`left:312px;right:72px;bottom:120px`, p.body.map((x, i) => `<div style="display:grid;grid-template-columns:70px 1fr;padding:22px 0;border-top:1px solid rgba(31,27,23,0.2)"><span style="${disp4(30, R.taupe)}">${pad(i + 1)}</span><span style="font-family:'${F4.t}';font-size:30px;line-height:1.45;color:${R.ink}">${x}</span></div>`).join('')))
      if (n === 6) return page(stone(), img(exp('tour-blanche'), 'left:0;top:0;width:600px;height:1350px', f4, 'center') + veil('left:420px;top:520px;width:588px;height:560px', 0.82) + A(`left:470px;top:570px;width:500px`, `<div style="${caps(F4.t, 17, R.muted, 0.26, 700)}">International</div><div style="margin-top:24px;${disp4(52)}">Travailler entre plusieurs pays, <span style="${ital4(60)}">c’est accepter de tout réexaminer.</span></div>`) + navyLine('left:470px;top:1030px;width:110px') + idx4(n))
      if (n === 7) return page(stone(), img(tzp('balcon-telephone'), 'left:72px;top:72px;width:560px;height:720px', f4, 'center 25%') + img(tzp('balcon-message'), 'left:656px;top:72px;width:352px;height:470px', f4, 'center 30%') + A(`left:656px;top:566px;width:352px;height:226px;background:${R.contrast};display:flex;align-items:flex-end;padding:24px;${caps(F4.t, 17, R.white, 0.24, 700)}`, 'Récit · 1 / 5') + A(`left:72px;right:72px;top:850px`, `<div style="${disp4(86)}">Histoire d’une <span style="${ital4(96)}">question</span></div><div style="margin-top:20px;font-family:'${F4.t}';font-size:29px;color:${R.muted}">${p.sub}</div>`))
      if (n === 8) return page(stone(), img(tzp('fenetre-ronde-lecture'), 'left:72px;top:72px;width:936px;height:1206px', f4, 'center 30%') + navyLine('left:72px;top:1300px;width:110px') + idx4(n))
      if (n === 9) return page(TX['translucide'].layer(W, H), A(`left:72px;right:72px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center`, `<div style="${ital4(104)}">« Une structure doit servir un projet,</div><div style="margin-top:10px;${disp4(104)}">pas l’inverse. »</div>`) + navyLine('left:72px;bottom:200px;width:140px') + A(`left:72px;bottom:130px;${caps(F4.t, 17, R.muted, 0.26, 700)}`, 'Tiziana Caci') + idx4(n))
      if (n === 10) return page(stone(), img(exp('facade-ondulee'), 'left:240px;top:0;width:840px;height:900px', f4) + veil('left:72px;top:720px;width:760px;height:480px', 0.85) + A(`left:112px;top:770px;width:680px`, `<div style="${disp4(76)}">L’architecture <span style="${ital4(84)}">d’une décision</span></div><div style="margin-top:22px;font-family:'${F4.t}';font-size:28px;line-height:1.45;color:${R.muted}">${p.sub}</div>`) + navyLine('left:112px;top:1150px;width:110px') + idx4(n))
      if (n === 11) return page(`<div style="position:absolute;inset:0;background:${R.contrast}"></div>`, A(`left:72px;top:120px;width:450px;height:620px;background:rgba(245,240,232,0.08)`) + A(`left:300px;top:300px;width:708px;height:540px;background:rgba(245,240,232,0.06)`) + A(`left:72px;right:72px;bottom:120px`, `<div style="${disp4(106, R.white)}">Croissance :<br>faut-il tout<br><span style="${ital4(118, '#E3D9C9')}">restructurer ?</span></div><div style="margin-top:28px;font-family:'${F4.t}';font-size:28px;color:rgba(245,240,232,0.7)">${p.sub}</div>`) + idx4(n, 'rgba(245,240,232,0.7)'))
      return page(stone(), img(tzp('voyage-valise'), 'left:0;top:180px;width:760px;height:1170px', f4, 'center 30%') + veil('left:560px;top:72px;width:448px;height:520px', 0.85) + A(`left:600px;top:120px;width:370px`, `<div style="${caps(F4.t, 17, R.muted, 0.26, 700)}">${p.sub}</div><div style="margin-top:28px;${disp4(52)}">Entre deux départs, <span style="${ital4(58)}">les meilleures questions.</span></div>`) + navyLine('left:600px;top:540px;width:110px') + idx4(n))
    },
    slide(car, s, i) {
      const total = window.CAROUSEL_TOTAL[car]
      const dark = car === 'reflexion'
      const fg = dark ? R.white : R.ink
      const bg = dark ? `<div style="position:absolute;inset:0;background:${R.contrast}"></div>` : stone()
      return page(bg, A(`left:72px;top:110px;width:440px;height:440px;background:${dark ? 'rgba(245,240,232,0.08)' : 'rgba(245,240,232,0.7)'};display:flex;align-items:flex-end;padding:30px;${disp4(170, dark ? '#E3D9C9' : R.contrast)}`, s.n) + A(`left:72px;right:72px;top:640px`, `<div style="${disp4(76, fg)}">${s.title}</div><div style="margin-top:34px;font-family:'${F4.t}';font-size:33px;line-height:1.5;color:${dark ? 'rgba(245,240,232,0.85)' : R.ink}">${s.body}</div>`) + navyLine(`left:72px;bottom:120px;width:110px;${dark ? 'background:#E3D9C9' : ''}`) + A(`right:72px;bottom:108px;${caps(F4.t, 17, dark ? 'rgba(245,240,232,0.7)' : R.muted, 0.24, 700)}`, `${i + 2} / ${total} →`))
    },
  }

  window.DIRECTIONS = [carnet, atelier, tribune, architecte]
  window.POST_SIZE = { W, H }
})()
