/* Builds every presentation board and every single export. */
;(function () {
  const D = window.DIRECTIONS, S = window.SLOTS, TT = window.TITLES, C = window.CAROUSELS, P = window.P, L = window.LIB
  const app = document.getElementById('app'), nav = document.getElementById('nav')
  const singles = []
  let bid = 0
  const fit = (html, nw, nh, dw, extra = '') => { const s = dw / nw; return `<div class="fit" style="width:${dw}px;height:${Math.round(nh * s)}px;${extra}"><div class="native" style="width:${nw}px;height:${nh}px;transform:scale(${s})">${html}</div></div>` }
  const tile = (r, w = 1080, h = 1350) => `<div class="native-tile" style="position:relative;width:${w}px;height:${h}px;overflow:hidden">${r(w, h)}</div>`
  const board = (out, cls, inner, label) => { const id = 'b' + ++bid; app.insertAdjacentHTML('beforeend', `<section class="board ${cls}" id="${id}" data-board data-out="${out}">${inner}</section>`); if (label) nav.insertAdjacentHTML('beforeend', `<a href="#${id}">${label}</a>`) }
  const single = (out, html) => singles.push(`<div data-single data-out="${out}">${html}</div>`)
  const head = (eye, title, lead = '') => `<div class="eyebrow">${eye}</div><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}`
  const swatches = (pal) => `<div class="sw">${pal.map(([n, h]) => `<div><i style="background:${h}"></i><b>${n}</b><span>${h}</span></div>`).join('')}</div>`
  const postOf = (d, k) => d.post(k, TT[d.key][k])
  const slidesOf = (d) => [d.cover(), ...C[d.key].map((s, i) => d.slide(s, i)), d.end()]

  /* ---------------- 00 cover */
  const cov = D.map((d) => fit(postOf(d, k0(d)), 1080, 1350, 380)).join('')
  function k0(d) { return { sculptural: 'sculpture', editorial: 'xxl', financial: 'sculpture', modern: 'asym' }[d.key] }
  board('presentation-finale/00-couverture.jpg', 'dark', `<div class="cover"><div><div class="eyebrow">Creative Direction Project · Recherche indépendante</div><h1 class="xl">Tiziana Caci<br><em>Direction artistique CEO</em></h1><p class="lead">Quatre directions artistiques premium, audacieuses et texturées. Le beige n’est plus un aplat : il devient matière, lumière, profondeur et signature. 48 publications, 20 slides de carrousel, 14 dégradés, 12 textures, 12 formes, 12 expériences typographiques, 10 traitements photo.</p></div><div class="row">${cov}</div></div>`, 'Couverture')

  /* ---------------- 01 intention */
  const quit = ['Carrés beige avec texte noir', 'Fond uni + photo centrée', 'Grilles répétitives, gabarits Canva', 'Rectangles uniquement', 'Dégradés timides', 'Esthétique lifestyle / influenceuse']
  const build = ['Beige = matière : pierre, sable, papier épais, marbre', 'Portraits détourés qui sortent du cadre', 'Masques organiques, arches, volumes éclairés', 'Dégradés visibles : halos, maillages, horizons', 'Typographie XXL, coupée, verticale, en relief', 'Codes des campagnes executive internationales']
  board('presentation-finale/01-intention.jpg', '', head('Intention', 'Ce que l’on quitte, <em>ce que l’on construit</em>') + `<div class="two"><div class="col no"><h3>On quitte</h3>${quit.map((q) => `<p>✕ ${q}</p>`).join('')}</div><div class="col yes"><h3>On construit</h3>${build.map((q) => `<p>→ ${q}</p>`).join('')}</div></div><div class="hr"></div><p class="lead">Règle d’or : Tiziana apparaît uniquement à travers ses <b>vraies photographies</b> (19 photos, 8 détourages réalisés à partir de ces photos). Aucun visage généré, aucune retouche de morphologie. Les images libres de droits (CC0, sources listées) ne servent qu’aux environnements : architecture, matières, bureaux.</p>`, 'Intention')

  /* ---------------- 02 synthesis */
  board('presentation-finale/02-quatre-directions.jpg', 'dark', head('Synthèse', 'Quatre directions') + `<div class="grid g4">${D.map((d) => `<div class="dcard">${fit(postOf(d, 'carrousel'), 1080, 1350, 360)}<div class="num">${d.num}</div><h2>${d.name}</h2><p class="tag">${d.tagline}</p><p>${d.idea}</p>${swatches(d.palette)}</div>`).join('')}</div>`, 'Directions')

  /* ---------------- per direction system */
  D.forEach((d) => {
    const samples = ['sable', 'strategie', 'papier', 'nb'].map((k) => fit(postOf(d, k), 1080, 1350, 300)).join('')
    board(`directions-artistiques/${d.num}-${d.key}.jpg`, '', head(`Direction ${d.num}`, d.name, d.idea) +
      `<div class="sys"><div><h3>Impression recherchée</h3><p>${d.impression}</p><h3>Palette</h3>${swatches(d.palette)}<h3>Typographie</h3>${d.fonts.map(([f, u]) => `<p><b>${f}</b> — ${u}</p>`).join('')}<h3>Dégradés</h3><p>${d.gradients}</p><h3>Textures</h3><p>${d.textures}</p><h3>Formes</h3><p>${d.shapes}</p><h3>Traitement photo</h3><p>${d.photo}</p><h3>Usage</h3><p>${d.use}</p></div><div class="big">${fit(postOf(d, 'sculpture'), 1080, 1350, 560)}</div></div><div class="row mt">${samples}</div>`, `${d.num} ${d.name.split(' ')[0]}`)
  })

  /* ---------------- catalogues */
  const cat = (arr, out, eye, title, lead, dir, dark = false, extra = (x) => '') => {
    board(out, dark ? 'dark' : '', head(eye, title, lead) + `<div class="grid g4">${arr.map((x) => `<div class="cat">${fit(tile(x.r), 1080, 1350, 360)}<b>${x.n} · ${x.name}</b>${extra(x)}</div>`).join('')}</div>`, eye)
    arr.forEach((x) => single(`${dir}/${x.n}-${slug(x.name)}.jpg`, tile(x.r)))
  }
  const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  cat(window.GRADIENTS, 'gradients/catalogue-degrades.jpg', 'Dégradés', '14 dégradés artistiques', 'Des dégradés visibles et assumés : halos, maillages flous, horizons, coniques, superpositions translucides et grain. Chaque fichier est exporté en 1080 × 1350 pour servir de fond.', 'gradients', false, (x) => `<span>${x.hex}<br>${x.use}</span>`)
  cat(window.TEXTURES, 'textures/catalogue-textures.jpg', 'Textures', '12 matières', 'Papiers épais, froissés et embossés, grain argentique, minéral, marbre, sable macro, textile, verre dépoli, translucidité, matières superposées. Toutes générées en SVG / CSS : reproductibles à n’importe quelle taille.', 'textures', false, (x) => `<span>${x.use}</span>`)
  cat(window.SHAPES, 'formes-graphiques/catalogue-formes.jpg', 'Formes graphiques', '12 formes organiques', 'Formes fluides, courbes asymétriques, découpes, silhouettes abstraites, volumes, arches, cercles déformés, contours irréguliers et masques photo non conventionnels.', 'formes-graphiques', true)
  cat(window.TYPE, 'directions-artistiques/typographie-experimentale.jpg', 'Typographie', '12 expériences typographiques', 'Titres XXL, coupés, verticaux, transparents, superposés, en relief, chiffres monumentaux, photo dans la lettre, modes de fusion. Serif contemporain et sans-serif affirmé.', 'directions-artistiques/typographie', false)

  /* ---------------- photo treatments + compositions */
  const tr = window.TREATMENTS
  board('photographies/traitements-photo.jpg', 'dark', head('Photographie', '10 traitements photo', 'Toujours sur les vraies photos de Tiziana. Les traitements changent la lumière, la matière et la couleur, jamais le visage ni la silhouette.') +
    `<div class="grid g5">${tr.map((t) => `<div class="cat">${fit(tile((w, h) => window.renderTreatment(t, w, h, ['studio-marine', 'studio-vert-reflexion', 'studio-marine-reflexion'][+t.n % 3])), 1080, 1350, 290)}<b>${t.n} · ${t.name}</b></div>`).join('')}</div>`, 'Photo')
  tr.forEach((t) => single(`photographies/traitements/${t.n}-${slug(t.name)}.jpg`, tile((w, h) => window.renderTreatment(t, w, h, ['studio-marine', 'studio-vert-reflexion', 'studio-marine-reflexion'][+t.n % 3]))))
  const comps = [
    ['Portrait détouré qui dépasse de la composition', D[0], 'sculpture'], ['Grand portrait avec typographie superposée', D[3], 'xxl'], ['Portrait dans une forme organique', D[0], 'nb'], ['Double exposition graphique', D[3], 'asym'], ['Portrait sur dégradé lumineux', D[2], 'sculpture'],
    ['Portrait noir et blanc avec matières beige', D[1], 'nb'], ['Découpe photo asymétrique', D[1], 'asym'], ['Portrait plein cadre avec typographie XXL', D[1], 'xxl'], ['Photo superposée à des textures', D[3], 'papier'], ['Campagne executive internationale', D[1], 'sculpture'],
  ]
  board('photographies/compositions-portrait.jpg', '', head('Tiziana au centre', '10 compositions de portrait', 'Les dix types de composition demandés, chacun réalisé dans la direction qui lui convient le mieux.') +
    `<div class="grid g5">${comps.map(([n, d, k], i) => `<div class="cat">${fit(postOf(d, k), 1080, 1350, 290)}<b>${String(i + 1).padStart(2, '0')} · ${n}</b><span>${d.name}</span></div>`).join('')}</div>`, 'Compositions')

  /* ---------------- feeds, carousels, XL, profiles */
  const XL = { sculptural: ['sculpture', 'sable', 'manifeste'], editorial: ['sculpture', 'xxl', 'nb'], financial: ['sculpture', 'finance', 'strategie'], modern: ['sculpture', 'asym', 'strategie'] }
  D.forEach((d) => {
    const posts = S.map((s) => postOf(d, s.key))
    posts.forEach((p, i) => single(`publications/${d.num}-${d.key}/${String(i + 1).padStart(2, '0')}-${S[i].key}.jpg`, p))
    const sl = slidesOf(d)
    sl.forEach((p, i) => single(`publications/${d.num}-${d.key}/carrousel-${i + 1}.jpg`, p))
    board(`feeds-instagram/${d.num}-${d.key}-feed.jpg`, d.key === 'sculptural' || d.key === 'editorial' ? '' : 'dark', head(`Feed ${d.num}`, `${d.name} — 12 publications`, d.tagline) +
      `<div class="feed">${posts.map((p, i) => `<div class="cat">${fit(p, 1080, 1350, 520)}<b>${String(i + 1).padStart(2, '0')} · ${S[i].label}</b></div>`).join('')}</div>`, `Feed ${d.num}`)
    board(`feeds-instagram/${d.num}-${d.key}-carrousel.jpg`, 'dark', head(`Carrousel ${d.num}`, `${d.name} — carrousel`, 'Couverture, trois slides intérieures et slide de fin. Format 1080 × 1350.') +
      `<div class="row">${sl.map((p) => fit(p, 1080, 1350, 312)).join('')}</div>`)
    board(`presentation-finale/${d.num}-${d.key}-grands-formats.jpg`, 'xl dark', `<div class="eyebrow">Grands formats · ${d.name}</div>` + XL[d.key].map((k) => `<div class="xlpost">${fit(postOf(d, k), 1080, 1350, 1080)}<p>${S.find((s) => s.key === k).label}</p></div>`).join(''), `XL ${d.num}`)
    board(`mockups/${d.num}-${d.key}-profil-instagram.jpg`, 'beige', head(`Profil ${d.num}`, `Simulation du profil — ${d.name}`) + `<div class="mock">${phone(d, posts)}<div class="mockside">${fit(posts[0], 1080, 1350, 900)}<p class="lead">Bio : textes déjà validés dans le playbook (rôle, cabinet). La ligne « Comprendre avant de décider. » est une proposition à valider. Highlights validés : À propos de moi, Mon cabinet.</p></div></div>`, `Profil ${d.num}`)
  })
  function phone(d, posts) {
    const B = window.BIO
    const av = `<div class="av" style="background:url(${P['tz-studio-marine']}) 50% 18%/180% auto"></div>`
    const hl = B.highlights.map((h, i) => `<div class="hl"><div class="hlc">${fit(posts[[0, 9][i]], 1080, 1350, 74)}</div><span>${h}</span></div>`).join('')
    return `<div class="phone"><div class="pbar"><b>${B.handle}</b><span>☰</span></div><div class="ph">${av}<div class="stats"><div><b>12</b>publications</div><div><b>—</b>followers</div><div><b>—</b>suivi(e)s</div></div></div><div class="bio"><b>${B.name}</b><span class="catg">${B.category}</span>${B.lines.map((l) => `<div>${l.replace('@fynovates', '<a>@fynovates</a>')}</div>`).join('')}<a>${B.link}</a></div><div class="btns"><span>Suivre</span><span>Message</span><span>Contact</span></div><div class="hls">${hl}</div><div class="tabs"><span class="on">▦</span><span>▶</span><span>◎</span></div><div class="pgrid">${posts.map((p) => fit(p, 1080, 1350, 176)).join('')}</div></div>`
  }
  board('mockups/comparaison-profils.jpg', 'beige', head('Comparaison', 'Les quatre profils côte à côte') + `<div class="grid g4 cmp">${D.map((d) => `<div>${phone(d, S.map((s) => postOf(d, s.key)))}<h3>${d.num} · ${d.name}</h3></div>`).join('')}</div>`, 'Comparaison')

  /* ---------------- evaluation + recommendation */
  const crit = ['Premium', 'Audace', 'Lisibilité', 'Tiziana au centre', 'Cohérence Fynovates', 'Production régulière']
  const score = { sculptural: [5, 4, 4, 5, 4, 4], editorial: [5, 4, 5, 4, 4, 5], financial: [4, 4, 4, 3, 5, 4], modern: [4, 5, 3, 5, 3, 3] }
  board('presentation-finale/evaluation-recommandation.jpg', '', head('Évaluation', 'Recommandation') +
    `<table class="ev"><tr><th></th>${crit.map((c) => `<th>${c}</th>`).join('')}<th>Total</th></tr>${D.map((d) => `<tr><td><b>${d.num} ${d.name}</b></td>${score[d.key].map((v) => `<td>${'●'.repeat(v)}<span>${'●'.repeat(5 - v)}</span></td>`).join('')}<td><b>${score[d.key].reduce((a, b) => a + b)}/30</b></td></tr>`).join('')}</table>` +
    `<div class="two mt"><div><h3>Recommandation</h3><p class="lead"><b>Socle : Sculptural Executive.</b> C’est la direction la plus propre à Tiziana : le beige y devient vraiment une matière (pierre, sable, papier), les portraits détourés lui donnent de la présence sans tomber dans le lifestyle, et la typographie monumentale porte les prises de position.</p><p class="lead"><b>Temps forts : Modern CEO Art Direction</b> pour 1 publication sur 4 (portraits signature, lancements) — ses dégradés cognac et ses doubles expositions créent l’impact. <b>Carrousels de fond : Luxury Business Editorial</b>, la plus lisible pour les sujets longs. <b>Abstract Financial World</b> reste une bonne réserve pour les sujets finance / banque, et fait le lien avec le bleu de Fynovates.</p></div><div><h3>Points à valider</h3><p class="lead">· Le playbook prévoit un feed « photographies uniquement » : ces directions ajoutent des visuels typographiques et abstraits. À arbitrer.<br>· La ligne de bio « Comprendre avant de décider. » est une proposition.<br>· Nombre d’abonnés : À RENSEIGNER (non simulé).<br>· Shooting complémentaire conseillé (voir page Sources) pour plus de portraits détourables.</p></div></div>`, 'Recommandation')
  board('presentation-finale/evaluation-mix-recommande.jpg', 'dark', head('Mix recommandé', 'Un feed, trois directions') + `<div class="feed">${[[0, 'sculpture'], [3, 'xxl'], [0, 'sable'], [1, 'carrousel'], [0, 'nb'], [3, 'asym'], [0, 'papier'], [1, 'overlay'], [0, 'strategie'], [3, 'sculpture'], [0, 'manifeste'], [1, 'asym']].map(([i, k]) => fit(postOf(D[i], k), 1080, 1350, 520)).join('')}</div>`, 'Mix')

  /* ---------------- sources + shot list */
  const ph = window.PHOTOS
  board('photographies/sources-et-shooting.jpg', '', head('Sources', 'Photographies utilisées') +
    `<h3>Photos de Tiziana (${ph.tz.length}) — dossier Drive « 📸PHOTOS Tiziana »</h3><div class="thumbs">${ph.tz.map((p) => `<div><img src="${p.file}"><span>${p.file.split('/').pop()}</span></div>`).join('')}</div>` +
    `<h3>Détourages (${ph.cut.length}) — réalisés à partir de ces photos, sans retouche du visage</h3><div class="thumbs cut">${ph.cut.map((p) => `<div><img src="${p.file}"><span>${p.file.split('/').pop()}</span></div>`).join('')}</div>` +
    `<h3>Environnements libres de droits (${ph.free.length}) — licence CC0 vérifiée, crédits dans photographies/SOURCES.md</h3><div class="thumbs">${ph.free.map((p) => `<div><img src="${p.file}"><span>${p.file.split('/').pop()} · ${p.license} · ${p.source}</span></div>`).join('')}</div>` +
    `<div class="hr"></div><h3>Shooting complémentaire conseillé</h3><p class="lead">· 6 à 8 portraits sur fond uni clair (gris chaud ou sable), lumière latérale douce : idéal pour les détourages.<br>· 2 plans en pied, 2 plans taille, 2 plans serrés, mains visibles (geste de réflexion, bras croisés, dossier).<br>· 3 plans de dos ou de trois-quarts dans une architecture (escalier, colonnes, façade).<br>· 2 tenues : une claire (crème / champagne), une sombre (marine / noir).<br>· Quelques détails : mains sur un document, stylo, montre, lunettes.</p>`, 'Sources')

  app.insertAdjacentHTML('beforeend', `<div id="singles">${singles.join('')}</div>`)
  document.body.dataset.ready = '1'
})()
