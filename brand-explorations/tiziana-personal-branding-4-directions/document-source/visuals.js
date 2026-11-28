/* Renders every visual. ?stage=1 compositions, ?stage=2 Instagram / LinkedIn pages built from stage-1 JPEGs. */
;(function () {
  const E = window.ENG, { A, T, box, photo } = E, full = E.full
  const qs = new URLSearchParams(location.search), STAGE = +(qs.get('stage') || 1), ONLY = qs.get('dir')
  const items = [], add = (out, w, h, html, scale = 1) => items.push({ out, w, h, html, scale })
  const placeholder = (d, w, h, t) => box(w, h, d.pal.bg, `<div style="${full}background:${d.gradients[0]}"></div>` + A(`left:40px;top:40px;right:40px;bottom:40px;border:3px dashed ${d.pal.mid};border-radius:16px`) + T(`left:60px;right:60px;top:${h * 0.38}px;text-align:center;font:600 22px/1.5 Manrope;letter-spacing:.16em;color:${d.pal.ink}`, 'PHOTO À RÉALISER') + T(`left:80px;right:80px;top:${h * 0.38 + 60}px;text-align:center;font:400 24px/1.5 Manrope;color:${d.pal.ink}`, t))
  for (const d of window.DIRS) {
    if (ONLY && d.id !== ONLY) continue
    const F = d.folder
    if (STAGE === 1) {
      for (let i = 0; i < 12; i++) add(`${F}/instagram/post-${String(i + 1).padStart(2, '0')}.jpg`, 1080, i === 2 ? 1920 : 1440, window.POST(d, i))
      for (let j = 0; j < 4; j++) add(`${F}/instagram/carrousel-${j + 2}.jpg`, 1080, 1440, window.SLIDE(d, j))
      ;[0, 1].forEach((k) => add(`${F}/instagram/reel-${k + 2}.jpg`, 1080, 1920, window.EXTRA_REELS(d, k)))
      add(`${F}/profil/avatar.jpg`, 800, 800, window.AVATAR(d))
      ;[0, 1, 2].forEach((k) => add(`${F}/profil/highlight-${k + 1}.jpg`, 300, 300, window.HL(d, k)))
      add(`${F}/linkedin/banniere.jpg`, 1584, 396, window.BANNER(d))
      window.SHOTS.forEach(([n, k, pos], i) => { const out = `${F}/photographie/${String(i + 1).padStart(2, '0')}.jpg`; if (!k) add(out, 600, 800, placeholder(d, 600, 800, 'Tiziana en réunion ou en échange avec ses collaborateurs.')); else add(out, 600, 800, box(600, 800, '#222', photo(d, k === 'env' ? 'env:' + d.env[i - 9] : k, 'inset:0', pos, d.id === '02' && [1, 7, 8].includes(i)))) })
      d.silhouettes.forEach((s, k) => add(`${F}/silhouettes/silhouette-${k + 1}.jpg`, 900, 1200, s[2] ? box(900, 1200, '#222', photo(d, s[2], 'inset:0', '50% 22%')) : placeholder(d, 900, 1200, s[1])))
      d.signs.forEach((s, k) => add(`${F}/signes/signe-${k + 1}.jpg`, 900, 700, window.SIGNTILE(d, k)))
    } else {
      const posts = Array.from({ length: 12 }, (_, i) => `../${F}/instagram/post-${String(i + 1).padStart(2, '0')}.jpg`)
      add(`instagram/${d.id}-${d.slug}-profil.png`, 600, 1700, `<div style="padding:20px">${E.igPhone(d, { avatar: `../${F}/profil/avatar.jpg`, posts, reel: [2] }, [[`../${F}/profil/highlight-1.jpg`, 'À propos'], [`../${F}/profil/highlight-2.jpg`, 'Le cabinet'], [`../${F}/profil/highlight-3.jpg`, 'Réflexions']])}</div>`, 2)
      add(`linkedin/${d.id}-${d.slug}-page.jpg`, 1240, 1320, E.linkedinPage(d, { banner: `../${F}/linkedin/banniere.jpg`, avatar: `../${F}/profil/avatar.jpg`, signHtml: `<img src="../${F}/signes/signe-1.jpg" style="width:100%;border-radius:8px">`, posts: [[posts[1], 'Je préfère comprendre le problème avant de chercher la solution. Ce que cela change dans la manière d’accompagner un entrepreneur.', 'Réflexion'], [posts[7], 'Entre deux rendez-vous : ce qu’on apprend en écoutant vraiment le projet d’un entrepreneur avant de parler de structure.', 'Coulisses'], [posts[6], 'Une structure doit servir un projet, pas l’inverse.', 'Prise de position']] }))
    }
  }
  document.getElementById('v').innerHTML = items.map((it) => `<div data-out="${it.out}" data-scale="${it.scale}" style="width:${it.w}px;height:${it.h}px;margin:0 0 20px">${it.html}</div>`).join('')
  document.fonts.ready.then(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {})))).then(() => (document.body.dataset.ready = '1'))
})()
