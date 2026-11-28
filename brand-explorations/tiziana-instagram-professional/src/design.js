/* Design system + templates. Feed posts and carousel slides: 1080 × 1440 (3:4, the profile-grid ratio).
   Reel covers: 1080 × 1920, everything important inside the central 1080 × 1440 band (y 240 → 1680). */
;(function () {
  const L = window.LIB, P = window.P
  const { A, T, svg, blob, arch, noise, film, relief, glow, mesh, linen } = L
  const full = L.full
  const C = window.COLORS = { sable: '#D8C3A0', beige: '#C9AD86', creme: '#F3EADB', brun: '#3A2618', blanc: '#F8F4EE', noir: '#15110E', taupe: '#8C7A68', champagne: '#E6D3B0' }
  const SER = "'DM Serif Display'", IT = "'Instrument Serif'", SANS = 'Inter'
  window.FILTER = { warm: 'saturate(.86) contrast(1.05) sepia(.12) brightness(1.03)', warmDeep: 'saturate(.8) contrast(1.1) sepia(.18) brightness(.96)', bw: 'grayscale(1) contrast(1.12) brightness(1.04)' }
  const F = window.FILTER
  const W = 1080
  const fr = (t) => t.replace(/ ([?:!;»])/g, '\u00A0$1').replace(/« /g, '«\u00A0')
  const frame = (h, bg, inner) => `<div class="native post" style="width:${W}px;height:${h}px;position:relative;overflow:hidden;background:${bg}">${fr(inner)}</div>`
  const ph = (k, css, f = F.warm, pos = '50% 28%') => `<img src="${P[k]}" style="position:absolute;${css};object-fit:cover;object-position:${pos};filter:${f}">`
  const cut = (k, css, sh = 'drop-shadow(0 30px 40px rgba(40,24,12,.35))') => `<img src="${P[k]}" style="position:absolute;${css};filter:${sh}">`
  const paper = (c = C.creme, a = 0.32) => `<div style="${full}background:${c}"></div>` + relief({ alpha: a, freq: 0.045, scale: 1.6 }) + noise({ alpha: 0.045, blend: 'multiply' })
  const sandBg = () => `<div style="${full}background:radial-gradient(110% 80% at 25% 15%,#F6ECDB 0%,#E2CCA8 45%,#C4A47C 100%)"></div>` + relief({ alpha: 0.28, freq: 0.04, scale: 1.4 }) + noise({ alpha: 0.05, blend: 'multiply' })
  const kick = (txt, c = C.brun, css = '') => T(`left:80px;top:90px;display:flex;align-items:center;gap:18px;font:600 22px/1 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${c};${css}`, `<span style="width:46px;height:2px;background:${c};display:inline-block"></span>${txt}`)
  const pill = (txt, bg, c, css) => T(`${css};padding:14px 26px;border-radius:40px;background:${bg};font:600 21px/1 ${SANS};letter-spacing:.18em;text-transform:uppercase;color:${c}`, txt)
  const handle = (c, css = 'left:80px;bottom:80px') => T(`${css};font:500 22px/1 ${SANS};letter-spacing:.08em;color:${c}`, '@tiziana.caci')
  const em = (s, c) => s.replace(/<em>(.*?)<\/em>/g, `<span style="font-family:${IT};font-style:italic;color:${c}">$1</span>`)
  const avatar = (k, size, css) => A(`${css};width:${size}px;height:${size}px;border-radius:50%;overflow:hidden;box-shadow:0 0 0 4px ${C.creme}`, ph(k, 'inset:0;width:100%;height:100%', F.warm, '50% 18%'))
  const grain = () => film(0.07)

  const tpl = {}
  /* ---------- feed posts (H = 1440) ---------- */
  tpl.portrait = (p, H = 1440) => frame(H, C.brun, ph(p.photo, 'inset:0;width:100%;height:100%', F.warm, '50% 18%') +
    A(`inset:0;background:linear-gradient(180deg,rgba(58,38,24,0) 40%,rgba(58,38,24,.72) 66%,rgba(42,27,17,.96) 100%)`) +
    T(`left:80px;top:${H - 610}px;font:600 22px/1 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${C.champagne}`, p.kicker) +
    T(`left:80px;top:${H - 560}px;width:900px;font:400 104px/0.98 ${SER};color:${C.blanc};letter-spacing:-.01em`, p.title) +
    T(`left:80px;top:${H - 290}px;width:820px;font:400 30px/1.4 ${SANS};color:${C.creme}`, p.sub) + handle(C.champagne) + grain())

  tpl.editorialCity = (p, H = 1440) => frame(H, C.creme, paper() +
    A('left:80px;top:80px;width:920px;height:820px;overflow:hidden;border-radius:460px 460px 0 0', ph(p.photo, 'inset:0;width:100%;height:100%', 'sepia(.35) saturate(.85) contrast(1.05)', '50% 60%') + A('inset:0;background:linear-gradient(180deg,rgba(216,195,160,0) 50%,rgba(58,38,24,.35))')) +
    pill(p.sub, C.brun, C.creme, 'left:120px;top:820px') +
    T(`left:80px;top:950px;font:600 22px/1 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${C.taupe}`, p.kicker) +
    T(`left:80px;top:1000px;width:920px;font:400 86px/1 ${SER};color:${C.brun}`, p.title) + handle(C.taupe, 'right:80px;bottom:70px'))

  tpl.typo = (p, H = 1440) => frame(H, C.sable, sandBg() +
    T(`left:56px;top:110px;font:400 400px/0.7 ${SER};color:${C.brun};opacity:.9`, '“') + kick(p.kicker, C.brun, 'left:auto;right:80px') +
    T(`left:80px;top:470px;width:930px;font:400 108px/1 ${SER};color:${C.brun};letter-spacing:-.01em`, em(p.title, '#7A5536')) +
    avatar(p.avatar, 96, `left:80px;top:${H - 200}px`) + T(`left:200px;top:${H - 180}px;font:600 26px/1.3 ${SANS};color:${C.brun}`, 'Tiziana Caci<br><span style="font-weight:400;color:#6B5440">CEO de Fynovates</span>') + grain())

  tpl.portraitSide = (p, H = 1440) => frame(H, C.creme, paper() +
    ph(p.photo, `left:0;top:0;width:560px;height:${H}px`, F.warm, '30% 40%') +
    A(`left:560px;top:0;width:6px;height:${H}px;background:${C.sable}`) +
    T(`left:620px;top:110px;font:600 20px/1 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${C.taupe}`, p.kicker) +
    T(`left:620px;top:170px;width:400px;font:400 70px/1.04 ${SER};color:${C.brun}`, p.title) +
    T(`left:620px;bottom:80px;width:400px;font:400 italic 40px/1.1 ${IT};color:#7A5536`, 'Liberté ≠ improvisation.') + grain())

  tpl.news = (p, H = 1440) => frame(H, C.noir, ph(p.photo, `left:0;top:560px;width:1080px;height:${H - 560}px`, F.warmDeep, '50% 22%') +
    A(`left:0;top:0;width:1080px;height:560px`, paper(C.creme, 0.25)) +
    T(`left:80px;top:80px;right:80px;display:flex;justify-content:space-between;font:600 20px/1 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${C.brun};border-bottom:2px solid ${C.brun};padding-bottom:20px`, `<span>${p.kicker} · Évolution des métiers</span><span>Analyse</span>`) +
    T(`left:80px;top:170px;width:940px;font:400 128px/0.94 ${SER};color:${C.brun};letter-spacing:-.02em`, p.title) +
    A(`left:80px;top:${H - 270}px;width:920px;height:200px;border-radius:24px;background:rgba(243,234,219,.93);box-shadow:0 30px 60px -20px rgba(0,0,0,.4)`) +
    T(`left:120px;top:${H - 238}px;width:840px;font:400 italic 48px/1.1 ${IT};color:${C.brun}`, p.sub) + grain())

  tpl.photoOnly = (p, H = 1440) => frame(H, C.creme, paper() + ph(p.photo, `left:50px;top:50px;width:980px;height:${H - 180}px`, F.warm, '50% 40%') +
    T(`left:60px;bottom:50px;font:600 20px/1 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${C.brun}`, p.kicker) + handle(C.taupe, 'right:60px;bottom:50px'))

  tpl.behind = (p, H = 1440) => frame(H, C.brun, ph(p.photo, 'inset:0;width:100%;height:100%', 'sepia(.4) saturate(.8) brightness(.92) blur(2px)', '50% 50%') +
    A('inset:0;background:rgba(58,38,24,.35)') +
    A(`left:60px;top:300px;width:960px;height:${H - 360}px;border-radius:28px;overflow:hidden;box-shadow:0 40px 80px -30px rgba(0,0,0,.6)`, paper(C.creme, 0.25)) +
    A('left:700px;top:90px;width:300px;height:400px;border-radius:150px;overflow:hidden;box-shadow:0 0 0 10px #F3EADB,0 30px 50px -10px rgba(0,0,0,.5)', ph(p.inset, 'inset:0;width:100%;height:100%', F.warm, '50% 30%')) +
    T(`left:110px;top:140px;font:600 22px/1.4 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${C.creme}`, p.kicker) +
    T(`left:110px;top:560px;width:840px;font:400 76px/1.02 ${SER};color:${C.brun}`, p.title) +
    T(`left:110px;top:910px;width:860px;font:500 32px/1 ${SANS};color:${C.brun}`, p.list.map((l, i) => `<div style="display:flex;gap:22px;align-items:center;padding:16px 0;border-top:1.5px solid rgba(58,38,24,.18)"><span style="font:400 italic 40px/1 ${IT};color:#9A7550;width:44px">0${i + 1}</span>${l}</div>`).join('')) + grain())

  tpl.cutoutStatement = (p, H = 1440) => frame(H, C.sable, sandBg() +
    A(`left:540px;top:380px;width:620px;height:1200px;border-radius:350px 350px 0 0;background:linear-gradient(180deg,#EFE2CB,#CDB18A)`) +
    cut(p.photo, `height:1120px;left:560px;bottom:0`) + kick(p.kicker) +
    T(`left:80px;top:180px;width:480px;font:400 72px/1.04 ${SER};color:${C.brun}`, p.title) + handle(C.brun) + grain())

  tpl.carouselCover = (c, H = 1440) => frame(H, C.brun, ph(c.cover.photo, 'inset:0;width:100%;height:100%', 'sepia(.55) saturate(.8) contrast(1.05) brightness(.9)', '40% 50%') +
    A('inset:0;background:linear-gradient(180deg,rgba(42,27,17,.92) 0%,rgba(42,27,17,.55) 55%,rgba(42,27,17,.2) 100%)') + kick(c.cover.kicker, C.champagne) +
    T(`left:80px;top:200px;width:920px;font:400 ${c.cover.title.length > 40 ? 96 : 116}px/0.98 ${SER};color:${C.blanc};letter-spacing:-.01em`, c.cover.title) +
    pill(c.cover.em, C.creme, C.brun, `left:80px;top:${c.cover.title.length > 40 ? 780 : 560}px`) +
    T(`right:80px;bottom:80px;font:600 24px/1 ${SANS};letter-spacing:.2em;color:${C.creme}`, 'GLISSEZ →') + handle(C.champagne) + grain())

  /* ---------- reel covers (H = 1920, safe band 240 → 1680) ---------- */
  const safeTop = 240, safeBot = 1680
  tpl.reelPortrait = (p, H = 1920) => frame(H, C.brun, ph(p.photo, 'inset:0;width:100%;height:100%', F.warm, '50% 15%') +
    A('inset:0;background:linear-gradient(180deg,rgba(42,27,17,.0) 35%,rgba(42,27,17,.78) 62%,rgba(42,27,17,.95) 88%)') +
    pill(p.kicker, C.creme, C.brun, `left:80px;top:${safeTop + 70}px`) +
    T(`left:80px;top:1000px;width:930px;font:400 108px/0.98 ${SER};color:${C.blanc};letter-spacing:-.01em`, em(p.title, C.champagne)) +
    T(`left:80px;top:${safeBot + 60}px;font:600 22px/1 ${SANS};letter-spacing:.2em;color:${C.champagne}`, '▶ REEL · @TIZIANA.CACI') + grain())
  tpl.reelLesson = (p, H = 1920) => frame(H, C.sable, sandBg() +
    A(`left:500px;top:560px;width:640px;height:1500px;border-radius:320px 320px 0 0;background:linear-gradient(180deg,#F1E5CF,#C7A980)`) +
    cut(p.photo, 'height:1360px;left:420px;bottom:0') +
    pill(p.kicker, C.brun, C.creme, `left:80px;top:${safeTop + 70}px`) +
    T(`left:72px;top:${safeTop + 170}px;font:400 italic 170px/0.9 ${IT};color:#7A5536`, p.tag) +
    T(`left:80px;top:${safeTop + 370}px;width:560px;font:400 92px/1 ${SER};color:${C.brun}`, em(p.title, '#7A5536')) +
    T(`left:80px;top:${safeBot - 120}px;width:400px;font:500 24px/1.4 ${SANS};color:${C.brun}`, 'Vidéo pédagogique · situations à analyser au cas par cas') + grain())
  tpl.reelPhoto = (p, H = 1920) => frame(H, C.brun, ph(p.photo, 'inset:0;width:100%;height:100%', F.warm, '50% 20%') +
    A('inset:0;background:linear-gradient(180deg,rgba(42,27,17,.35) 0%,rgba(42,27,17,0) 30%)') +
    A(`left:60px;top:1040px;width:960px;height:560px;border-radius:32px;overflow:hidden;box-shadow:0 40px 80px -30px rgba(0,0,0,.55)`, paper(C.creme, 0.25)) +
    T(`left:110px;top:1100px;font:600 22px/1 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${C.taupe}`, p.kicker) +
    T(`left:110px;top:1160px;width:860px;font:400 88px/1 ${SER};color:${C.brun}`, p.title) +
    T(`right:110px;top:1100px;font:600 22px/1 ${SANS};letter-spacing:.2em;color:${C.brun}`, '▶ REEL') + grain())
  tpl.reelPaper = (p, H = 1920) => frame(H, C.creme, paper(C.creme, 0.4) + glow(800, 500, 900, '#E2CCA8', 160, 0.8) +
    pill(p.kicker, C.brun, C.creme, `left:80px;top:${safeTop + 80}px`) +
    T(`left:80px;top:${safeTop + 260}px;width:930px;font:400 140px/0.95 ${SER};color:${C.brun}`, em(p.title, '#9A6B40')) +
    T(`left:80px;top:${safeTop + 700}px;width:920px;font:500 40px/1 ${SANS};color:${C.brun}`, ['Où serai-je résident ?', 'Quand partir ?', 'Quelle protection sociale ?'].map((l, i) => `<div style="display:flex;gap:26px;align-items:center;padding:30px 0;border-top:2px solid rgba(58,38,24,.2)"><span style="font:400 italic 64px/1 ${IT};color:#9A6B40;width:70px">0${i + 1}</span>${l}</div>`).join('')) +
    avatar(p.avatar, 150, `left:80px;top:${safeBot - 260}px`) +
    T(`left:260px;top:${safeBot - 230}px;font:600 30px/1.35 ${SANS};color:${C.brun}`, 'Tiziana Caci<br><span style="font-weight:400;color:#6B5440">CEO de Fynovates</span>') + grain())
  tpl.reelOverlay = (p, H = 1920) => frame(H, C.noir, ph(p.photo, 'inset:0;width:100%;height:100%', F.warmDeep, '50% 18%') +
    A('inset:0;background:linear-gradient(180deg,rgba(21,17,14,.0) 45%,rgba(21,17,14,.85) 80%)') +
    T(`left:40px;top:1040px;font:400 236px/0.8 ${SER};color:${C.champagne};letter-spacing:-.04em;mix-blend-mode:normal`, p.word) +
    T(`left:90px;top:1250px;font:400 italic 110px/1 ${IT};color:${C.blanc}`, p.title) +
    pill(p.kicker, 'rgba(243,234,219,.92)', C.brun, `left:80px;top:${safeTop + 70}px`) + T(`left:80px;top:${safeBot - 40}px;font:600 22px/1 ${SANS};letter-spacing:.2em;color:${C.champagne}`, '▶ REEL') + grain())
  tpl.reelEditorial = (p, H = 1920) => frame(H, C.creme, paper() +
    A(`left:80px;top:${safeTop + 60}px;width:920px;height:2px;background:${C.brun}`) +
    T(`left:80px;top:${safeTop + 90}px;font:600 22px/1 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${C.brun}`, `${p.kicker} · Réflexion`) +
    T(`left:80px;top:${safeTop + 160}px;width:940px;font:400 118px/0.95 ${SER};color:${C.brun};letter-spacing:-.02em`, p.title) +
    T(`left:80px;top:${safeTop + 450}px;width:760px;font:400 italic 54px/1.1 ${IT};color:#7A5536`, p.sub) +
    A(`left:80px;top:${safeTop + 650}px;width:920px;height:${H - safeTop - 650}px;border-radius:460px 460px 0 0;overflow:hidden`, ph(p.photo, 'inset:0;width:100%;height:100%', F.warm, '50% 25%')) + grain())
  tpl.placeholder = (p, H = 1920) => frame(H, C.sable, sandBg() +
    A(`left:80px;top:${safeTop + 60}px;width:920px;height:1000px;border:3px dashed ${C.brun};border-radius:20px;background:repeating-linear-gradient(45deg,rgba(58,38,24,.06) 0 20px,transparent 20px 40px)`) +
    T(`left:130px;top:${safeTop + 420}px;width:820px;text-align:center;font:700 30px/1.4 ${SANS};letter-spacing:.16em;color:${C.brun}`, 'EMPLACEMENT PHOTO<br>À RÉALISER') +
    T(`left:150px;top:${safeTop + 560}px;width:780px;text-align:center;font:400 28px/1.45 ${SANS};color:${C.brun}`, p.need) +
    pill(p.kicker, C.brun, C.creme, `left:80px;top:${safeTop + 1110}px`) +
    T(`left:80px;top:${safeTop + 1200}px;width:920px;font:400 110px/1 ${SER};color:${C.brun}`, p.title) + grain())

  /* ---------- carousel slides (H = 1440) ---------- */
  const bar = (c, kicker, i, tot) => T(`left:80px;top:80px;right:80px;display:flex;justify-content:space-between;font:600 20px/1 ${SANS};letter-spacing:.22em;text-transform:uppercase;color:${c}`, `<span>${kicker}</span><span>${String(i).padStart(2, '0')} / ${String(tot).padStart(2, '0')}</span>`)
  tpl.slide = (c, s, i, tot, H = 1440) => { const alt = i % 2 === 0; return frame(H, alt ? C.sable : C.creme, (alt ? sandBg() : paper()) + bar(C.brun, c.label, i + 2, tot) +
    T(`left:66px;top:180px;font:400 italic 300px/0.9 ${IT};color:${alt ? '#A88660' : '#D2BA93'}`, String(i + 1).padStart(2, '0')) +
    A(`left:80px;top:540px;width:120px;height:3px;background:${C.brun}`) +
    T(`left:80px;top:590px;width:920px;font:400 92px/1 ${SER};color:${C.brun}`, s.title) +
    T(`left:80px;top:${s.title.length > 34 ? 930 : 830}px;width:860px;font:400 36px/1.5 ${SANS};color:#4E3826`, s.body) +
    handle(C.taupe) + T(`right:80px;bottom:80px;font:600 22px/1 ${SANS};letter-spacing:.2em;color:${C.brun}`, '→') + grain()) }
  tpl.conclusion = (c, tot, H = 1440) => frame(H, C.brun, mesh(C.brun, [[200, 200, 900, '#6B4A30', 160, 0.9]]) + bar(C.champagne, c.label, tot - 1, tot) +
    T(`left:66px;top:220px;font:400 300px/0.7 ${SER};color:${C.champagne}`, '“') +
    T(`left:80px;top:450px;width:920px;font:400 90px/1.02 ${SER};color:${C.blanc}`, c.conclusion) +
    A(`left:80px;top:${H - 330}px;width:920px;height:1.5px;background:rgba(230,211,176,.4)`) +
    T(`left:80px;top:${H - 290}px;width:880px;font:400 26px/1.5 ${SANS};color:${C.champagne}`, window.CHECK) + handle(C.champagne) + grain())
  tpl.cta = (c, tot, H = 1440) => frame(H, C.sable, sandBg() + bar(C.brun, c.label, tot, tot) +
    A('left:540px;top:420px;width:620px;height:1100px;border-radius:310px 310px 0 0;background:linear-gradient(180deg,#EFE2CB,#C4A47C)') +
    cut('cut-studio-marine', 'height:1030px;left:520px;bottom:0') +
    T(`left:80px;top:220px;width:520px;font:400 88px/1 ${SER};color:${C.brun}`, c.cta) +
    T(`left:80px;top:720px;width:460px;font:500 30px/1.9 ${SANS};color:${C.brun}`, '<div>◻ Enregistrer</div><div>➤ Partager</div><div>＋ Suivre @tiziana.caci</div>') + grain())

  window.TPL = tpl
  window.renderFeed = (p) => p.fmt === 'carousel' ? tpl.carouselCover(window.CAROUSELS[p.carousel]) : tpl[p.tpl](p)
  window.renderCarousel = (key) => { const c = window.CAROUSELS[key], tot = c.slides.length + 3; return [tpl.carouselCover(c), ...c.slides.map((s, i) => tpl.slide(c, s, i, tot)), tpl.conclusion(c, tot), tpl.cta(c, tot)] }
})()
