/* V2 — inspired by the reference feed the user shared (tonal beige photos, condensed XXL headlines,
   handwritten accents, provocative questions, recurring "series" logos, pills, mood images).
   Adapted to Tiziana's business topics. Posts / slides 1080 × 1440, reel covers 1080 × 1920 (safe band 240 → 1680). */
;(function () {
  const L = window.LIB, P = window.P
  const { A, T, noise, film, relief, glow } = L
  const full = L.full
  const W = 1080
  const K = window.C2 = { cream: '#F8F1E7', sand: '#E4D3BC', beige: '#CDB49A', taupe: '#A88C72', mocha: '#7A5E48', brown: '#4A3020', ink: '#2B1D14' }
  const BB = "'Bebas Neue'", OS = 'Oswald', SC = 'Allura', IN = 'Inter'
  const fr = (t) => t.replace(/ ([?:!;»])/g, ' $1').replace(/« /g, '« ')
  const frame = (h, bg, inner) => `<div class="native post" style="width:${W}px;height:${h}px;position:relative;overflow:hidden;background:${bg}">${fr(inner)}</div>`
  // tonal grade: every photo pulled into the same warm beige hue, luminance kept
  const tone = (k, css = 'inset:0;width:100%;height:100%', pos = '50% 25%', amt = 0.62) => A(`${css};overflow:hidden;isolation:isolate`,
    `<img src="${P[k]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${pos};filter:contrast(.96) brightness(1.04)">` +
    `<div style="${full}background:#C09F7E;mix-blend-mode:color;opacity:${amt}"></div><div style="${full}background:linear-gradient(180deg,rgba(248,241,231,.12),rgba(122,94,72,.18));mix-blend-mode:soft-light"></div>`)
  const warmBg = (a = '#D9C4AA', b = '#A88C72') => `<div style="${full}background:linear-gradient(170deg,${a} 0%,${b} 100%)"></div>` + glow(300, 250, 900, 'rgba(255,246,232,.55)', 160, 1) + noise({ alpha: 0.04, blend: 'soft-light' })
  const paperBg = () => `<div style="${full}background:linear-gradient(180deg,#EADBC6,#D5BFA3)"></div>` + relief({ alpha: 0.25, freq: 0.04, scale: 1.4 }) + glow(700, 300, 800, 'rgba(255,248,236,.6)', 150, 1)
  const big = (txt, size, color, css, extra = '') => T(`${css};font:400 ${size}px/0.88 ${BB};color:${color};letter-spacing:.005em;${extra}`, txt)
  const cond = (txt, size, color, css, extra = '') => T(`${css};font:600 ${size}px/1.02 ${OS};color:${color};text-transform:uppercase;letter-spacing:.01em;${extra}`, txt)
  const script = (txt, size, color, css) => T(`${css};font:400 ${size}px/1 ${SC};color:${color}`, txt)
  const small = (txt, color, css, size = 22) => T(`${css};font:700 ${size}px/1.2 ${IN};letter-spacing:.14em;text-transform:uppercase;color:${color}`, txt)
  const pill = (txt, css, bg = K.cream, c = K.brown, rot = -3) => T(`${css};transform:rotate(${rot}deg);padding:14px 34px 12px;border-radius:14px;background:${bg};font:italic 600 44px/1 ${OS};text-transform:uppercase;color:${c};box-shadow:0 10px 24px -12px rgba(0,0,0,.35)`, txt)
  const swoosh = (x, y, w, c = K.cream) => `<svg style="position:absolute;left:${x}px;top:${y}px;overflow:visible" width="${w}" height="30"><path d="M4,22 C${w * 0.3},6 ${w * 0.7},4 ${w - 4},14" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/></svg>`
  const sw = (w, c = K.cream, center = true) => `<svg width="${w}" height="30" style="display:block;margin:18px ${center ? 'auto' : '0'} 0;overflow:visible"><path d="M4,22 C${w * 0.3},6 ${w * 0.7},4 ${w - 4},14" fill="none" stroke="${c}" stroke-width="5" stroke-linecap="round"/></svg>`
  const series = (main, sub, c, css) => A(`${css};text-align:center;padding:18px 34px 14px;border:3px solid ${c};border-left-width:0;border-right-width:0`, `<span style="position:absolute;left:0;top:-3px;width:14px;height:calc(100% + 6px);border:3px solid ${c};border-right:0"></span><span style="position:absolute;right:0;top:-3px;width:14px;height:calc(100% + 6px);border:3px solid ${c};border-left:0"></span><div style="font:400 74px/0.9 ${BB};color:${c}">${main}</div><div style="font:600 22px/1 ${OS};letter-spacing:.12em;color:${c};margin-top:6px">${sub}</div>`)
  const sign = (c, css) => script('Tiziana.', 110, c, css)

  /* ---------------- the 12 posts ---------------- */
  const F = []
  // 1 — pinned portrait, positioning
  F[0] = () => frame(1440, K.beige, tone('tz-studio-marine', undefined, '50% 15%') + A('inset:0;background:linear-gradient(180deg,rgba(74,48,32,0) 45%,rgba(74,48,32,.7) 100%)') +
    small('Fondatrice & directrice de Fynovates', K.cream, 'left:0;right:0;top:960px;text-align:center', 22) +
    big('Le business<br>sans frontières', 150, K.cream, 'left:0;right:0;top:1010px;text-align:center') +
    script('par Tiziana', 96, K.sand, 'left:0;right:0;top:1290px;text-align:center'))
  // 2 — reel expatriation: quote hook on portrait (cf. "Ça sert à rien de me lancer…")
  F[1] = (H = 1920) => frame(H, K.beige, tone('tz-studio-vert-reflexion', undefined, '50% 15%', 0.7) + A('inset:0;background:linear-gradient(180deg,rgba(43,29,20,0) 40%,rgba(43,29,20,.75) 75%)') +
    small('Idée reçue n°1 en expatriation', K.cream, 'left:0;right:0;top:1090px;text-align:center', 24) +
    big('“Je pars vivre à l’étranger,<br>donc je ne suis plus<br>résidente fiscale française.”', 90, K.cream, 'left:40px;right:40px;top:1140px;text-align:center', 'text-shadow:0 4px 20px rgba(0,0,0,.25)') +
    script('Pas si simple…', 100, K.sand, 'left:0;right:0;top:1520px;text-align:center'))
  // 3 — business international: series logo + pill + italic question
  F[2] = () => frame(1440, K.taupe, tone('skyline-ville', undefined, '50% 55%', 0.75) + A('inset:0;background:linear-gradient(180deg,rgba(205,180,154,.72) 0%,rgba(205,180,154,.25) 55%,rgba(74,48,32,.55) 100%)') +
    series('Le brief', 'INTERNATIONAL', K.brown, 'left:340px;top:150px;width:400px') +
    pill('S’implanter à l’étranger', 'left:0;right:0;margin:auto;width:fit-content;top:560px') +
    cond('Ce qu’il faut anticiper<br>avant le premier client' + sw(420, K.cream, true), 74, K.cream, 'left:60px;right:60px;top:680px;text-align:center', 'font-style:italic;text-shadow:0 3px 14px rgba(0,0,0,.3)'))
  // 4 — prise de position, text only (cf. "L'IA a mangé mon métier")
  F[3] = () => frame(1440, K.beige, warmBg('#D2BBA0', '#A3866C') +
    big('Le chiffre<br>d’affaires<br>ne dit pas tout', 190, K.cream, 'left:0;right:0;top:390px;text-align:center') +
    T(`right:150px;top:1010px;font:500 34px/1.3 ${IN};color:${K.cream}`, 'Ce qui reste compte autant.') + sign(K.cream, 'right:140px;top:1110px'))
  // 5 — reel fiscalité, text on paper (cf. "Tu payes combien… Faut qu'on cause !")
  F[4] = (H = 1920) => frame(H, K.sand, paperBg() +
    small('Fiscalité · vidéo', K.mocha, 'left:0;right:0;top:420px;text-align:center', 24) +
    big('Quitter<br>la France', 250, K.brown, 'left:0;right:0;top:470px;text-align:center') +
    small('Les 3 erreurs à éviter avant de partir', K.brown, 'left:0;right:0;top:960px;text-align:center', 30) +
    script('On en parle ?', 150, K.mocha, 'left:0;right:0;top:1060px;text-align:center') +
    T(`left:0;right:0;top:1450px;text-align:center;font:500 24px/1.4 ${IN};color:${K.mocha}`, 'Chaque situation se regarde au cas par cas.'))
  // 6 — reel banque: photo + pill + question + swoosh (cf. "Les métiers vont-ils survivre ?")
  F[5] = (H = 1920) => frame(H, K.taupe, tone('tz-balcon-telephone', undefined, '50% 20%', 0.65) + A('inset:0;background:linear-gradient(180deg,rgba(74,48,32,0) 35%,rgba(74,48,32,.7) 70%)') +
    pill('Banque', 'left:0;right:0;margin:auto;width:fit-content;top:1020px') +
    cond('Compte pro à l’étranger :<br>pourquoi ça bloque ?' + sw(480, K.cream, true), 92, K.cream, 'left:40px;right:40px;top:1140px;text-align:center', 'font-style:italic'))
  // 7 — vision: photo + XXL word + script
  F[6] = () => frame(1440, K.beige, tone('tz-bibliotheque-ordinateur', undefined, '50% 35%', 0.6) + A('inset:0;background:linear-gradient(0deg,rgba(74,48,32,.65) 0%,rgba(74,48,32,0) 45%)') +
    big('La liberté', 230, K.cream, 'left:0;right:0;top:1000px;text-align:center') +
    script('s’organise.', 140, K.sand, 'left:0;right:0;top:1190px;text-align:center'))
  // 8 — actualité IA
  F[7] = () => frame(1440, K.beige, warmBg('#D9C4AA', '#B39478') +
    A('left:610px;top:120px;width:420px;height:620px;border-radius:250px 250px 24px 24px;overflow:hidden;box-shadow:0 30px 60px -30px rgba(0,0,0,.45)', tone('tz-fenetre-ronde-ordinateur', 'inset:0;width:100%;height:100%', '50% 30%', 0.6)) +
    small('Actualité · métiers', K.brown, 'left:70px;top:150px', 22) +
    big('L’IA<br>transforme<br>les métiers', 132, K.brown, 'left:64px;top:200px') +
    cond('Et pour les entrepreneurs,<br>ça change quoi ?' + sw(520, K.cream, false), 72, K.cream, 'left:70px;top:880px', 'font-style:italic') +
    script('On décrypte.', 110, K.brown, 'left:70px;top:1150px'))
  // 9 — carrousel structuration: split word (cf. "CHEV / ALIER")
  F[8] = () => frame(1440, K.mocha, warmBg('#9C7E64', '#6E523E') +
    big('STRUC<br>TURER', 330, K.cream, 'left:0;right:0;top:300px;text-align:center', 'line-height:.8') +
    small('5 erreurs à éviter à l’international', K.sand, 'left:0;right:0;top:900px;text-align:center', 26) + script('glissez →', 90, K.sand, 'left:0;right:0;top:980px;text-align:center'))
  // 10 — mood / déplacement, faint overlay text (cf. "This is my Chanel")
  F[9] = () => frame(1440, K.beige, tone('tz-voyage-valise-fenetre', undefined, '50% 40%', 0.62) +
    T(`left:0;right:0;top:150px;text-align:center;font:500 96px/1 'Cormorant Garamond';letter-spacing:.08em;color:#F8F1E7;text-transform:uppercase;text-shadow:0 2px 18px rgba(43,29,20,.55)`, 'Next stop'))
  // 11 — coulisses: series logo + photo
  F[10] = () => frame(1440, K.beige, tone('salle-blanche-fenetres', undefined, '50% 50%', 0.7) + A('inset:0;background:rgba(205,180,154,.55)') +
    series('Coulisses', 'DU CABINET', K.brown, 'left:330px;top:150px;width:420px') +
    A('left:390px;top:420px;width:300px;height:300px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 8px #F8F1E7', tone('tz-table-reflexion', 'inset:0;width:100%;height:100%', '50% 25%', 0.5)) +
    cond('Ce qu’on analyse avant<br>d’accompagner un entrepreneur<br>à l’international', 64, K.brown, 'left:40px;right:40px;top:780px;text-align:center') +
    pill('Situation · activité · pays · objectifs', 'left:0;right:0;margin:auto;width:fit-content;top:1060px', K.brown, K.cream, 2))
  // 12 — portrait point de vue (cf. "-62 abonnés." small serif)
  F[11] = () => frame(1440, K.beige, tone('tz-studio-vert-bras-croises', undefined, '50% 20%', 0.72) +
    T(`left:60px;top:80px;font:400 italic 44px/1 'Instrument Serif';color:${K.cream}`, 'Point de vue.') + A('inset:0;background:linear-gradient(0deg,rgba(74,48,32,.7),rgba(74,48,32,0) 40%)') +
    cond('Une bonne décision fiscale commence<br>par comprendre sa situation.', 56, K.cream, 'left:40px;right:40px;top:1220px;text-align:center'))

  window.FEED2 = [
    { n: 1, fmt: 'post', pin: true, topic: 'Portrait · positionnement' }, { n: 2, fmt: 'reel', topic: 'Expatriation' }, { n: 3, fmt: 'post', topic: 'Business international' },
    { n: 4, fmt: 'post', topic: 'Prise de position' }, { n: 5, fmt: 'reel', topic: 'Fiscalité' }, { n: 6, fmt: 'reel', topic: 'Banque' },
    { n: 7, fmt: 'post', topic: 'Vision entrepreneuriale' }, { n: 8, fmt: 'post', topic: 'Actualité · IA' }, { n: 9, fmt: 'carousel', topic: 'Structuration' },
    { n: 10, fmt: 'post', topic: 'Déplacement · mood' }, { n: 11, fmt: 'post', topic: 'Coulisses du cabinet' }, { n: 12, fmt: 'post', topic: 'Point de vue' },
  ].map((p, i) => ({ ...p, render: F[i] }))

  /* ---------------- carousels ---------------- */
  const bar = (c, label, i, tot) => small(`${label} · ${String(i).padStart(2, '0')}/${String(tot).padStart(2, '0')}`, c, 'left:70px;top:80px', 20)
  const covers = {
    expatriation: () => frame(1440, K.beige, tone('tz-voyage-valise', undefined, '50% 30%', 0.65) + A('inset:0;background:linear-gradient(180deg,rgba(74,48,32,.0) 35%,rgba(74,48,32,.75) 85%)') + pill('Expatriation', 'left:0;right:0;margin:auto;width:fit-content;top:820px') + big('Avant de partir', 170, K.cream, 'left:0;right:0;top:940px;text-align:center') + script('5 points à anticiper', 96, K.sand, 'left:0;right:0;top:1110px;text-align:center')),
    structuration: F[8],
    banque: () => frame(1440, K.beige, tone('tz-balcon-message', undefined, '50% 25%', 0.65) + A('inset:0;background:linear-gradient(180deg,rgba(74,48,32,.0) 35%,rgba(74,48,32,.75) 85%)') + series('Le brief', 'BANQUE', K.cream, 'left:340px;top:120px;width:400px') + cond('5 questions à se poser<br>avant de choisir<br>ses solutions bancaires' + sw(420, K.cream, true), 82, K.cream, 'left:40px;right:40px;top:930px;text-align:center', 'font-style:italic')),
  }
  const slide = (c, s, i, tot) => { const dark = i % 2 === 1, fg = dark ? K.cream : K.brown; return frame(1440, dark ? K.mocha : K.sand, (dark ? warmBg('#9C7E64', '#6E523E') : paperBg()) + bar(fg, c.label, i + 2, tot) +
    big(String(i + 1).padStart(2, '0'), 300, dark ? '#B99A7E' : '#CDB49A', 'left:60px;top:150px') +
    big(s.title, s.title.length > 34 ? 118 : 140, fg, 'left:70px;top:460px;width:940px') +
    T(`left:70px;top:${s.title.length > 34 ? 830 : 770}px;width:860px;font:400 38px/1.5 ${IN};color:${fg}`, s.body) + script('glissez →', 70, fg, 'right:70px;bottom:60px')) }
  const conclusion = (c, tot) => frame(1440, K.beige, warmBg('#D2BBA0', '#A3866C') + bar(K.cream, c.label, tot - 1, tot) + script('En résumé', 120, K.cream, 'left:0;right:0;top:250px;text-align:center') +
    big(c.conclusion, 120, K.cream, 'left:70px;right:70px;top:430px;text-align:center') + T(`left:120px;right:120px;bottom:240px;text-align:center;font:500 26px/1.5 ${IN};color:${K.cream}`, window.CHECK) + sign(K.cream, 'left:0;right:0;bottom:90px;text-align:center'))
  const cta = (c, tot) => frame(1440, K.beige, tone('tz-studio-marine-reflexion', undefined, '50% 15%', 0.65) + A('inset:0;background:linear-gradient(180deg,rgba(74,48,32,0) 40%,rgba(74,48,32,.8) 80%)') + bar(K.cream, c.label, tot, tot) +
    script('Faut qu’on en parle ?', 110, K.sand, 'left:0;right:0;top:930px;text-align:center') + big(c.cta, 96, K.cream, 'left:60px;right:60px;top:1060px;text-align:center') + small('Enregistrer · partager · suivre @tiziana.caci', K.sand, 'left:0;right:0;top:1340px;text-align:center', 20))
  window.renderCarousel2 = (key) => { const c = window.CAROUSELS[key], tot = c.slides.length + 3; return [covers[key](), ...c.slides.map((s, i) => slide(c, s, i, tot)), conclusion(c, tot), cta(c, tot)] }

  /* ---------------- extra reel covers ---------------- */
  window.REELS2 = [
    { name: 'Question choc sur portrait', r: () => frame(1920, K.beige, tone('tz-studio-marine', undefined, '50% 15%', 0.65) + A('inset:0;background:linear-gradient(180deg,rgba(43,29,20,0) 40%,rgba(43,29,20,.75) 75%)') + big('Société à Dubaï :<br>bonne idée ?', 170, K.cream, 'left:0;right:0;top:1120px;text-align:center') + script('ça dépend…', 110, K.sand, 'left:0;right:0;top:1480px;text-align:center')) },
    { name: 'Série « Le brief »', r: () => frame(1920, K.taupe, tone('facade-courbe', undefined, '50% 50%', 0.75) + A('inset:0;background:rgba(205,180,154,.6)') + series('Le brief', 'INTERNATIONAL', K.brown, 'left:340px;top:420px;width:400px') + pill('Épisode 01', 'left:0;right:0;margin:auto;width:fit-content;top:760px') + cond('Résidence fiscale :<br>les critères qui comptent' + sw(440, K.brown, true), 92, K.brown, 'left:40px;right:40px;top:900px;text-align:center', 'font-style:italic')) },
    { name: 'Texte seul + script', r: () => frame(1920, K.sand, paperBg() + big('Ouvrir<br>une banque<br>à l’étranger', 220, K.brown, 'left:0;right:0;top:500px;text-align:center') + script('Faut qu’on cause !', 130, K.mocha, 'left:0;right:0;top:1230px;text-align:center')) },
    { name: 'Mot coupé XXL', r: () => frame(1920, K.mocha, warmBg('#9C7E64', '#6E523E') + big('EXPA<br>TRIA<br>TION', 330, K.cream, 'left:0;right:0;top:360px;text-align:center', 'line-height:.8') + small('Ce qu’on oublie de préparer', K.sand, 'left:0;right:0;top:1400px;text-align:center', 30)) },
    { name: 'Mood + accroche discrète', r: () => frame(1920, K.beige, tone('tz-fenetre-ronde-contre-jour', undefined, '50% 40%', 0.62) + T(`left:0;right:0;top:330px;text-align:center;font:500 92px/1.05 'Cormorant Garamond';letter-spacing:.06em;color:#F8F1E7;text-transform:uppercase;text-shadow:0 2px 18px rgba(43,29,20,.6)`, 'Une journée<br>de dirigeante')) },
    { name: 'Emplacement — Tiziana face caméra au bureau', r: () => frame(1920, K.sand, paperBg() + A('left:80px;top:300px;width:920px;height:1100px;border:3px dashed #7A5E48;border-radius:20px;background:repeating-linear-gradient(45deg,rgba(74,48,32,.06) 0 20px,transparent 20px 40px)') + small('Emplacement photo à réaliser<br><br>Tiziana face caméra, au bureau,<br>vertical 9:16', K.brown, 'left:120px;right:120px;top:700px;text-align:center', 26) + big('Une journée au cabinet', 130, K.brown, 'left:0;right:0;top:1460px;text-align:center')) },
  ]
})()
