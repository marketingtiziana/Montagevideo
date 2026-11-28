/* V2 boards — inspired by the user's reference feed */
;(function () {
  const FEED = window.FEED2, P = window.P, K = window.C2, B = window.BIO
  const app = document.getElementById('app'), nav = document.getElementById('nav')
  const singles = []
  let bid = 0
  const Hh = (p) => (p.fmt === 'reel' ? 1920 : 1440)
  const fit = (html, nh, dw, crop = 0) => { const s = dw / 1080; return `<div class="fit" style="width:${dw}px;height:${Math.round((crop ? 1440 : nh) * s)}px"><div class="native" style="width:1080px;height:${nh}px;transform:translateY(${crop ? -240 * s : 0}px) scale(${s})">${html}</div></div>` }
  const board = (out, cls, inner, label) => { const id = 'b' + ++bid; app.insertAdjacentHTML('beforeend', `<section class="board ${cls}" id="${id}" data-board data-out="${out}">${inner}</section>`); if (label) nav.insertAdjacentHTML('beforeend', `<a href="#${id}">${label}</a>`) }
  const single = (out, html) => singles.push(`<div data-single data-out="${out}">${html}</div>`)
  const head = (eye, title, lead = '') => `<div class="eyebrow">${eye}</div><h1>${title}</h1>${lead ? `<p class="lead">${lead}</p>` : ''}`
  const html = FEED.map((p) => p.render())
  const icon = (p) => p.pin ? '<i class="ic2 pin">📌</i>' : p.fmt === 'reel' ? '<i class="ic2">▶</i>' : p.fmt === 'carousel' ? '<i class="ic2">❐</i>' : ''
  const thumb = (p, i, w) => `<div class="th">${fit(html[i], Hh(p), w, Hh(p) === 1920)}${icon(p)}</div>`
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const top = `<div class="sbar"><span>9:41</span><span>●●● ▮</span></div>`
  const phone = (w = 176) => `<div class="phone">${top}<div class="pbar"><b>${B.handle} ⌄</b><span>⊕ ☰</span></div><div class="ph"><div class="av" style="background-image:url(${P['tz-studio-marine']})"></div><div class="stats"><div><b>12</b>publications</div><div><b>—</b>followers</div><div><b>—</b>suivi(e)s</div></div></div><div class="bio"><b>${B.name}</b><span class="catg">${B.category}</span>${B.lines.map((l) => `<div>${l.replace('@fynovates', '<a>@fynovates</a>')}</div>`).join('')}<a>🔗 ${B.link}</a></div><div class="btns"><span class="blue">Suivre</span><span>Message</span><span>Contact</span></div><div class="hls">${B.highlights.map((h, i) => `<div class="hl"><div class="hlc" style="background-image:url(${P[['tz-studio-marine-reflexion', 'salle-blanche-fenetres'][i]]});filter:sepia(.5) saturate(.6)"></div><span>${h}</span></div>`).join('')}</div><div class="tabs"><span class="on">▦</span><span>▶</span><span>◎</span></div><div class="pgrid">${FEED.map((p, i) => thumb(p, i, w)).join('')}</div></div>`

  const ana = [
    ['Des photos tonales', 'Toutes les photos sont ramenées dans la même teinte beige-taupe : la grille paraît homogène même avec des lieux très différents.', 'Les 19 photos de Tiziana passent par un même étalonnage « couleur beige » (luminance conservée, teinte unifiée).'],
    ['Des titres condensés XXL', 'Une linéale condensée en capitales, énorme, lisible même en vignette.', 'Bebas Neue pour les titres, Oswald italique pour les questions.'],
    ['Une touche manuscrite', '« Faut qu’on cause ! », « Chai. » : une signature humaine, presque parlée.', 'Allura : « Pas si simple… », « On en parle ? », « Tiziana. »'],
    ['Des accroches qui interpellent', 'Questions directes, citations entre guillemets, idées reçues.', '« Je pars vivre à l’étranger, donc je ne suis plus résidente fiscale française. » → Pas si simple…'],
    ['Des séries récurrentes', 'Un logo d’émission encadré (« Station Business ») installe un rendez-vous.', '« Le brief international », « Coulisses du cabinet ».'],
    ['Pastilles et soulignés', 'Une étiquette inclinée et un trait manuscrit guident l’œil.', 'Pastilles « Banque », « S’implanter à l’étranger », soulignés crème.'],
    ['Respirations', 'Des images d’ambiance sans titre (dunes, scène de vie) entre deux publications denses.', 'Tiziana en déplacement, « Next stop ».'],
    ['Ce qu’on ne reprend pas', 'Le côté show, danse, voiture, chat : trop lifestyle pour une dirigeante du conseil.', 'On garde l’énergie, pas la mise en scène personnelle.'],
  ]
  board('v2/00-analyse-reference.jpg', '', head('Version 2 · inspirée de ta référence', 'Ce que je reprends du feed de référence', 'La V1 reste disponible pour comparer. La V2 adopte la grammaire visuelle de la référence, appliquée aux sujets de Tiziana.') + `<div class="ana">${ana.map(([t, d, a]) => `<div><b>${t}</b><p>${d}</p><p><i>Pour Tiziana :</i> ${a}</p></div>`).join('')}</div>`, 'V2 Analyse')
  board('v2/01-simulation-profil.jpg', 'beige', `<div class="cov"><div>${head('V2 · Profil', 'Le profil complet', 'Grille 3 × 4 avec les icônes Instagram (épinglé, Reel, carrousel). Publication 1 épinglée : le positionnement.')}<p class="lead">Bio : seule « Fondatrice & directrice de @fynovates » vient du playbook, le reste est à valider. Abonnés : À RENSEIGNER.</p></div>${phone(160)}</div>`, 'V2 Profil')
  board('v2/02-grille-12.jpg', 'beige', head('V2 · Grille', '12 publications') + `<div class="grid3">${FEED.map((p, i) => thumb(p, i, 500)).join('')}</div>`, 'V2 Grille')
  board('v2/03-les-12-visuels.jpg', '', head('V2 · Publications', 'Les 12 visuels') + `<div class="g4 grid">${FEED.map((p, i) => `<div class="cat">${fit(html[i], Hh(p), 360)}<b>${p.n} · ${p.fmt === 'reel' ? 'Reel' : p.fmt === 'carousel' ? 'Carrousel' : 'Publication'} — ${p.topic}</b></div>`).join('')}</div>`, 'V2 Visuels')
  FEED.forEach((p, i) => single(`v2/publications/${String(p.n).padStart(2, '0')}-${p.fmt}-${slug(p.topic)}.jpg`, html[i]))
  Object.keys(window.CAROUSELS).forEach((k, ci) => {
    const sl = window.renderCarousel2(k)
    sl.forEach((h, i) => single(`v2/carrousels/${ci + 1}-${k}/slide-${String(i + 1).padStart(2, '0')}.jpg`, h))
    board(`v2/carrousel-${ci + 1}-${k}.jpg`, ci % 2 ? 'beige' : '', head(`V2 · Carrousel ${ci + 1} · ${window.CAROUSELS[k].label}`, window.CAROUSELS[k].cover.em), `V2 Carrousel ${ci + 1}`)
    app.lastElementChild.insertAdjacentHTML('beforeend', `<div class="g4 grid">${sl.map((h, i) => `<div class="cat">${fit(h, 1440, 360)}<b>${['Couverture', 'Slide 1', 'Slide 2', 'Slide 3', 'Slide 4', 'Slide 5', 'Conclusion', 'Appel à l’action'][i]}</b></div>`).join('')}</div>`)
  })
  window.REELS2.forEach((r, i) => single(`v2/reels/${i + 1}-${slug(r.name)}.jpg`, r.r()))
  board('v2/reels-couvertures.jpg', 'dark', head('V2 · Reels', 'Couvertures de Reels', 'Format 1080 × 1920 ; en dessous, l’aperçu tel qu’il apparaît dans la grille.') + `<div class="reels">${window.REELS2.map((r) => `<div class="cat">${fit(r.r(), 1920, 240)}<b>${r.name}</b>${fit(r.r(), 1920, 150, 1)}</div>`).join('')}</div>`, 'V2 Reels')
  board('v2/charte-v2.jpg', 'beige', head('V2 · Charte', 'Couleurs, typographies, étalonnage') + `<div class="pal">${Object.entries(K).map(([n, h]) => `<div><i style="background:${h}"></i><b>${n}</b><code>${h}</code></div>`).join('')}</div><div class="types mt"><div><span class="lab">Titres — Bebas Neue (OFL)</span><p style="font:400 140px/0.9 'Bebas Neue';color:${K.brown}">LE CHIFFRE D’AFFAIRES NE DIT PAS TOUT</p></div><div><span class="lab">Questions — Oswald italique 600 (OFL)</span><p style="font:italic 600 70px/1 Oswald;color:${K.mocha};text-transform:uppercase">Compte pro à l’étranger : pourquoi ça bloque ?</p></div><div><span class="lab">Manuscrit — Allura (OFL)</span><p style="font:400 120px/1 Allura;color:${K.mocha}">Pas si simple… · On en parle ? · Tiziana.</p></div></div><p class="lead"><b>Étalonnage :</b> chaque photo reçoit un calque « couleur » #C09F7E à 60–75 % (la teinte est unifiée, la lumière d’origine conservée) et un léger voile chaud. Règle : jamais de texte sur le visage, titres centrés dans le tiers bas ou sur fond uni.</p>`, 'V2 Charte')

  app.insertAdjacentHTML('beforeend', `<div id="singles">${singles.join('')}</div>`)
  document.body.dataset.ready = '1'
})()
