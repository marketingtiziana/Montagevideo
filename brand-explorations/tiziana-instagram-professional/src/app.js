/* Presentation boards + single exports */
;(function () {
  const FEED = window.FEED, CAR = window.CAROUSELS, REELS = window.REELS, TPL = window.TPL, P = window.P, C = window.COLORS, L = window.LIB
  const app = document.getElementById('app'), nav = document.getElementById('nav')
  const singles = []
  let bid = 0
  const H = (p) => (p.fmt === 'reel' || p.tpl?.startsWith('reel') || p.tpl === 'placeholder' ? 1920 : 1440)
  const fit = (html, nh, dw, crop = 0, extra = '') => { const s = dw / 1080; const vh = crop ? 1440 : nh; return `<div class="fit" style="width:${dw}px;height:${Math.round(vh * s)}px;${extra}"><div class="native" style="width:1080px;height:${nh}px;transform:translateY(${crop ? -240 * s : 0}px) scale(${s})">${html}</div></div>` }
  const board = (out, cls, inner, label) => { const id = 'b' + ++bid; app.insertAdjacentHTML('beforeend', `<section class="board ${cls}" id="${id}" data-board data-out="${out}">${inner}</section>`); if (label) nav.insertAdjacentHTML('beforeend', `<a href="#${id}">${label}</a>`) }
  const single = (out, html) => singles.push(`<div data-single data-out="${out}">${html}</div>`)
  const head = (eye, title, lead = '') => `<div class="eyebrow">${eye}</div><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}`
  const feedHtml = FEED.map((p) => window.renderFeed(p))
  const icon = (p) => p.fmt === 'reel' ? '<i class="ic">▶</i>' : p.fmt === 'carousel' ? '<i class="ic">❐</i>' : ''
  const thumb = (p, i, w) => `<div class="th">${fit(feedHtml[i], H(p), w, H(p) === 1920)}${icon(p)}</div>`
  const fmtName = { post: 'Publication', reel: 'Reel', carousel: 'Carrousel' }

  /* ---------- phone screens ---------- */
  const B = window.BIO
  const top = `<div class="sbar"><span>9:41</span><span>●●● ▮</span></div>`
  const phoneProfile = (w = 176) => `<div class="phone">${top}<div class="pbar"><b>${B.handle} ⌄</b><span>⊕ ☰</span></div><div class="ph"><div class="av" style="background-image:url(${P['tz-studio-marine']})"></div><div class="stats"><div><b>12</b>publications</div><div><b>—</b>followers</div><div><b>—</b>suivi(e)s</div></div></div><div class="bio"><b>${B.name}</b><span class="catg">${B.category}</span>${B.lines.map((l) => `<div>${l.replace('@fynovates', '<a>@fynovates</a>')}</div>`).join('')}<a>🔗 ${B.link}</a></div><div class="btns"><span class="blue">Suivre</span><span>Message</span><span>Contact</span></div><div class="hls">${B.highlights.map((h, i) => `<div class="hl"><div class="hlc" style="background-image:url(${P[['tz-studio-marine-reflexion', 'salle-blanche-fenetres'][i]]})"></div><span>${h}</span></div>`).join('')}</div><div class="tabs"><span class="on">▦</span><span>▶</span><span>◎</span></div><div class="pgrid">${FEED.map((p, i) => thumb(p, i, w)).join('')}</div></div>`
  const reelsAll = [...FEED.filter((p) => p.fmt === 'reel'), ...REELS]
  const phoneReels = () => `<div class="phone">${top}<div class="pbar"><b>${B.handle} ⌄</b><span>☰</span></div><div class="tabs"><span>▦</span><span class="on">▶</span><span>◎</span></div><div class="rgrid">${reelsAll.slice(0, 9).map((r) => `<div class="th">${fit(TPL[r.tpl](r), 1920, 176)}<i class="ic b">▶ —</i></div>`).join('')}</div></div>`
  const phoneCarousel = (key) => { const sl = window.renderCarousel(key); return `<div class="phone">${top}<div class="pbar"><b>Publications</b><span></span></div><div class="post-head"><div class="av s" style="background-image:url(${P['tz-studio-marine']})"></div><b>${B.handle}</b><span>•••</span></div><div class="car">${fit(sl[1], 1440, 536)}<span class="cnt">2/${sl.length}</span></div><div class="acts"><span>♡ 💬 ➤</span><span class="dots">${sl.map((_, i) => `<i class="${i === 1 ? 'on' : ''}"></i>`).join('')}</span><span>◻</span></div><div class="cap"><b>${B.handle}</b> ${CAR[key].slides[0].title} — ${CAR[key].label} : les points à analyser avant de décider. Enregistrez-le pour plus tard.</div></div>` }

  /* ---------- 00 cover */
  board('presentation/00-couverture.jpg', 'dark', `<div class="cov"><div>${head('Instagram professionnel · proposition', 'Tiziana Caci<br><em>Le profil d’une dirigeante</em>', 'Un profil business, crédible et incarné : des sujets qui donnent envie de cliquer, Tiziana présente toutes les deux ou trois publications, et une alternance de formats (portraits, Reels, carrousels, prises de position, actualité, coulisses). Le beige identifie son univers ; ce sont les sujets qui donnent envie de la suivre.')}<p class="lead"><b>Formats :</b> publications et carrousels en 1080 × 1440 (3:4, le ratio de la grille Instagram), couvertures de Reels en 1080 × 1920 avec le titre dans la zone visible en grille.</p></div>${phoneProfile(160)}</div>`, 'Couverture')

  /* ---------- 01 logic */
  const rules = [['Un sujet par vignette', 'Chaque case pose une question ou affirme quelque chose. On doit pouvoir comprendre le sujet sans ouvrir la publication.'], ['Tiziana visible', '8 vignettes sur 12 montrent Tiziana : portraits, face caméra, au travail, en déplacement.'], ['Alternance de formats', 'Jamais deux compositions identiques côte à côte : photo pleine, typographie, éditorial, Reel, carrousel.'], ['Titres lisibles en petit', 'Titres de 80 à 130 px sur 1080 : lisibles même dans la grille, sur téléphone.'], ['Rythme de couleurs', 'Brun / crème / sable alternent en diagonale pour éviter les blocs de même ton.'], ['Prudence technique', 'Fiscalité, banque, structuration : présentés comme des sujets d’analyse, jamais comme des promesses. Rappel « situation à analyser ».']]
  board('presentation/01-logique-editoriale.jpg', '', head('Logique', 'Pourquoi ce feed donne envie de cliquer', 'Le principe retenu : un profil professionnel avec une personnalité, des sujets pertinents et des titres qui suscitent une question, plutôt qu’une simple charte beige.') +
    `<div class="logic"><div class="map">${FEED.map((p, i) => `<div class="mc">${thumb(p, i, 200)}<b>${p.n} · ${fmtName[p.fmt]}</b><span>${p.topic}</span></div>`).join('')}</div><div>${rules.map(([t, d]) => `<div class="rule"><h3>${t}</h3><p>${d}</p></div>`).join('')}</div></div>`, 'Logique')

  /* ---------- 02 profile simulation */
  board('profil/simulation-profil-instagram.jpg', 'beige', head('Simulation', 'Le profil Instagram complet') + `<div class="phones">${phoneProfile()}${phoneReels()}${phoneCarousel('structuration')}</div><div class="three"><p><b>Profil</b> — photo, bio, liens, highlights validés (À propos de moi, Mon cabinet), grille de 12.</p><p><b>Onglet Reels</b> — couvertures 9:16 : titres lisibles, Tiziana présente.</p><p><b>Carrousel ouvert</b> — slide 2, légende et pagination.</p></div><p class="lead">Bio : « Fondatrice & directrice de @fynovates » est validé dans le playbook. Les deux lignes suivantes sont des propositions à valider. Abonnés et vues : À RENSEIGNER (non simulés).</p>`, 'Profil')
  board('profil/grille-12-publications.jpg', 'beige', head('Grille', '12 publications — 3 colonnes × 4 lignes') + `<div class="grid3">${FEED.map((p, i) => thumb(p, i, 500)).join('')}</div>`, 'Grille')

  /* ---------- 03 the 12 visuals with notes */
  board('publications/00-les-12-visuels.jpg', '', head('Publications', 'Les 12 visuels') + `<div class="g4 grid">${FEED.map((p, i) => `<div class="cat">${fit(feedHtml[i], H(p), 360)}<b>${p.n} · ${fmtName[p.fmt]} — ${p.topic}</b><span>${p.photo ? (p.photo.startsWith('tz-') || p.photo.startsWith('cut-') ? 'Photo réelle de Tiziana' : 'Photo libre de droits (CC0)') : 'Typographie'}${p.inset ? ' + photo de Tiziana' : ''}</span></div>`).join('')}</div>`, 'Visuels')
  FEED.forEach((p, i) => single(`publications/${String(p.n).padStart(2, '0')}-${p.fmt}-${p.topic.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.jpg`, feedHtml[i]))

  /* ---------- carousels */
  Object.entries(CAR).forEach(([k, c], ci) => {
    const sl = window.renderCarousel(k)
    sl.forEach((h, i) => single(`carrousels/${ci + 1}-${k}/slide-${String(i + 1).padStart(2, '0')}.jpg`, h))
    board(`carrousels/${ci + 1}-${k}-planche.jpg`, ci % 2 ? 'beige' : '', head(`Carrousel ${ci + 1} · ${c.label}`, c.cover.em.replace(/^5/, 'Les 5'), 'Couverture, cinq slides pédagogiques, conclusion, appel à l’action.') + `<div class="g4 grid">${sl.map((h, i) => `<div class="cat">${fit(h, 1440, 360)}<b>${['Couverture', 'Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'Slide 5', 'Conclusion', 'Appel à l’action'][i]}</b></div>`).join('')}</div>`, `Carrousel ${ci + 1}`)
  })

  /* ---------- reels */
  REELS.forEach((r) => single(`reels/couverture-${r.style}-${r.tpl}.jpg`, TPL[r.tpl](r)))
  FEED.filter((p) => p.fmt === 'reel').forEach((p) => single(`reels/feed-${p.n}-${p.topic.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}.jpg`, window.renderFeed(p)))
  board('reels/planche-couvertures-reels.jpg', 'dark', head('Reels', 'Couvertures de Reels — 6 styles', 'Format 1080 × 1920. Le cadre pointillé montre la zone visible dans la grille du profil (3:4) : le titre y reste entier.') +
    `<div class="reels">${REELS.map((r) => `<div class="cat"><div class="rz">${fit(TPL[r.tpl](r), 1920, 240)}<i class="safe"></i></div><b>${r.style} · ${r.name}</b><span>Dans la grille :</span>${fit(TPL[r.tpl](r), 1920, 150, 1, 'margin-top:8px')}</div>`).join('')}</div>`, 'Reels')

  /* ---------- palette & rules */
  const pal = [['Sable', C.sable, 'Fond signature des prises de position, carrousels pairs'], ['Beige chaud', C.beige, 'Formes, arches derrière les détourages'], ['Crème', C.creme, 'Papier : éditoriaux, slides impaires, cartouches'], ['Brun profond', C.brun, 'Texte principal, fonds de Reels et de conclusion'], ['Blanc cassé', C.blanc, 'Titres sur photo'], ['Noir chaud', C.noir, 'Actualité, contrastes ponctuels'], ['Taupe', C.taupe, 'Rubriques, signatures, textes secondaires'], ['Champagne', C.champagne, 'Accents sur fond brun, mots-clés']]
  board('direction-artistique/palette-et-regles.jpg', '', head('Direction artistique', 'Palette et règles d’usage') + `<div class="pal">${pal.map(([n, h, u]) => `<div><i style="background:${h}"></i><b>${n}</b><code>${h}</code><span>${u}</span></div>`).join('')}</div><div class="hr"></div><div class="three">${[['Dosage', 'Environ 40 % photo pleine, 30 % beige / crème texturé, 30 % brun. Le beige n’est jamais seul sur deux cases voisines.'], ['Lisibilité', 'Texte brun sur clair, blanc cassé ou crème sur photo assombrie par un dégradé brun. Jamais de texte posé directement sur un visage.'], ['Constantes', 'Rubrique en capitales avec filet, signature @tiziana.caci, grain léger identique sur tous les visuels, angles arrondis ou arches pour les cadres photo.']].map(([t, d]) => `<div><h3>${t}</h3><p>${d}</p></div>`).join('')}</div>`, 'Palette')

  /* ---------- typography */
  board('direction-artistique/typographies.jpg', 'beige', head('Typographies', 'Trois familles, une hiérarchie') + `<div class="types"><div><span class="lab">Titres — DM Serif Display · 80 à 150 px</span><p style="font:400 110px/1 'DM Serif Display';color:${C.brun}">Penser international change les règles.</p></div><div><span class="lab">Accents — Instrument Serif italique · mots-clés, chiffres de slides</span><p style="font:400 italic 110px/1 'Instrument Serif';color:#7A5536">avant de partir · 01 02 03</p></div><div><span class="lab">Texte — Inter 400 / 600 · 22 à 36 px, rubriques en capitales espacées</span><p style="font:400 34px/1.5 Inter;color:${C.brun};max-width:1100px">Une structure doit correspondre à une réalité : des moyens, des décisions, une activité.</p><p style="font:600 22px/1 Inter;letter-spacing:.22em;color:${C.taupe};margin-top:20px">EXPATRIATION · FISCALITÉ · BANQUE · STRUCTURATION</p></div></div><p class="lead">Toutes sous licence SIL Open Font License, fichiers inclus dans src/typefaces.</p>`, 'Typo')

  /* ---------- textures & photo treatments */
  const F = window.FILTER, full = L.full
  const tex = [['Papier crème', (w, h) => `<div style="${full}background:${C.creme}"></div>` + L.relief({ alpha: 0.32, freq: 0.045, scale: 1.6 }) + L.noise({ alpha: 0.045, blend: 'multiply' })], ['Sable lumineux', () => `<div style="${full}background:radial-gradient(110% 80% at 25% 15%,#F6ECDB 0%,#E2CCA8 45%,#C4A47C 100%)"></div>` + L.relief({ alpha: 0.28, freq: 0.04, scale: 1.4 })], ['Brun velours', () => L.mesh(C.brun, [[300, 300, 900, '#6B4A30', 160, 0.9]]) + L.film(0.08)], ['Grain commun', () => `<div style="${full}background:${C.taupe}"></div>` + L.film(0.2)]]
  const trt = [['Chaud naturel (par défaut)', F.warm], ['Chaud profond (Reels sombres)', F.warmDeep], ['Noir et blanc doux (rare)', F.bw], ['Environnements : sépia léger', 'sepia(.4) saturate(.8)']]
  const tl = (r) => `<div style="position:relative;width:1080px;height:1440px;overflow:hidden">${r(1080, 1440)}</div>`
  board('direction-artistique/textures-et-traitements-photo.jpg', '', head('Matières', 'Textures et traitements photographiques', 'Les textures restent discrètes : elles donnent de la tenue aux fonds sans concurrencer les photos. Un même grain est appliqué à tous les visuels pour unifier des photos prises à des moments différents.') +
    `<h3>Textures</h3><div class="g4 grid">${tex.map(([n, r]) => `<div class="cat">${fit(tl(r), 1440, 360)}<b>${n}</b></div>`).join('')}</div><h3 class="mt">Traitements photo — toujours sur les vraies photos</h3><div class="g4 grid">${trt.map(([n, f], i) => `<div class="cat">${fit(tl(() => `<img src="${P[i === 3 ? 'salle-blanche-fenetres' : 'tz-bibliotheque-sourire']}" style="${full}object-fit:cover;object-position:50% 30%;filter:${f}">` + L.film(0.07)), 1440, 360)}<b>${n}</b><code>${f}</code></div>`).join('')}</div>`, 'Textures')

  /* ---------- shots + sources */
  const ph = window.PHOTOS
  board('presentation/photos-a-realiser-et-sources.jpg', 'beige', head('Photographies', 'Photos à réaliser et sources', 'Les 19 photos actuelles couvrent les portraits studio, le travail, le déplacement et les déjeuners d’affaires. Il manque surtout des photos en réunion, face caméra au format vertical et en prise de parole.') +
    `<div class="shots">${window.SHOTS.map(([t, d], i) => `<div><span>${String(i + 1).padStart(2, '0')}</span><b>${t}</b><p>${d}</p></div>`).join('')}</div><div class="hr"></div><h3>Photos de Tiziana utilisées (${ph.tz.length}) — dossier Drive « 📸PHOTOS Tiziana »</h3><div class="thumbs">${ph.tz.map((p) => `<div><img src="${p.file}"><span>${p.file.split('/').pop()}</span></div>`).join('')}</div><h3>Détourages (${ph.cut.length}) — faits à partir de ces photos, sans retouche du visage</h3><div class="thumbs cut">${ph.cut.map((p) => `<div><img src="${p.file}"><span>${p.file.split('/').pop()}</span></div>`).join('')}</div><h3>Environnements libres de droits — licence CC0 vérifiée, crédits dans photographies/SOURCES.md</h3><div class="thumbs">${ph.free.filter((p) => /skyline|salle-blanche|facade-courbe/.test(p.file)).map((p) => `<div><img src="${p.file}"><span>${p.file.split('/').pop()} · ${p.license} · ${p.source}</span></div>`).join('')}</div>`, 'Photos')

  app.insertAdjacentHTML('beforeend', `<div id="singles">${singles.join('')}</div>`)
  document.body.dataset.ready = '1'
})()
