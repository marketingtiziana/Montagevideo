/* Builds every board of the art-direction file. Each board has data-out = export path. */
;(function () {
  const TX = window.BEIGE_TEXTURES
  const D = window.DIRECTIONS
  const PLAN = window.PLAN
  const SL = window.SLIDES
  const { W, H } = window.POST_SIZE
  const root = document.getElementById('app')
  const nav = document.getElementById('nav')
  const boards = []
  const add = (id, title, out, cls, html) => boards.push({ id, title, html: `<section class="board ${cls}" id="${id}" data-board data-out="${out}">${html}</section>` })
  const fit = (mock, w = W, h = H, extra = '') => `<div class="fit" data-w="${w}" style="aspect-ratio:${w}/${h};${extra}">${mock}</div>`
  const sw = (list) => `<div class="sw">${list.map(([n, v]) => `<span><i style="background:${v.split(' ')[0]}"></i><span><b>${n}</b><br>${v}</span></span>`).join('')}</div>`
  const li = (a) => `<ul class="clean">${a.map((x) => `<li>${x}</li>`).join('')}</ul>`
  const texByKey = Object.fromEntries(TX.map((t) => [t.key, t]))

  /* Instagram-like profile + 3 × 4 grid (no third-party logo, counts not shown) */
  const feed = (d, small) => `
    <div class="phone ${small ? 'small' : ''}">
      <div class="ph-head"><div class="ph-av"><img src="photographies/tiziana/tz-studio-marine.jpg" alt=""></div>
        <div><div class="ph-name">tiziana.caci</div><div class="ph-bio">Tiziana Caci<br>Fondatrice &amp; directrice de @fynovates</div></div></div>
      <div class="ph-hl"><span><i></i>À propos de moi</span><span><i></i>Mon cabinet</span></div>
      <div class="ph-grid">${PLAN.map((p) => fit(d.post(p))).join('')}</div>
    </div>`

  /* ---------- 00 cover ---------- */
  add('couverture', 'Couverture', 'presentation-finale/00-couverture.jpg', 'beige', `
    <div class="eyebrow">Dossier de direction artistique · personal branding</div>
    <h1>Tiziana Caci<br><em>L’univers beige</em></h1>
    <p class="lead">Huit textures, quatre directions artistiques, quatre feeds Instagram complets de douze publications, avec les carrousels, les photographies et leurs sources. Un travail de recherche indépendant : rien n’est intégré à la plateforme Fynovates.</p>
    <div class="hr"></div>
    <div class="grid g4">${D.map((d) => `<div>${fit(d.post(PLAN[0]))}<div class="cap"><span><b>Direction ${d.num} — ${d.name}</b></span><span>${d.tagline}</span></div></div>`).join('')}</div>
    <div class="hr"></div>
    <div class="grid g3 note"><div><b>Photographies de Tiziana</b><br>Uniquement ses vraies photos (shooting studio, bureau, déplacements), recadrées et étalonnées, jamais retouchées.</div><div><b>Photographies libres de droits</b><br>13 images CC0 (domaine public) issues de rawpixel via Openverse, licence vérifiée pour chacune.</div><div><b>Textes</b><br>Titres rédigés à partir des expressions signatures et du positionnement validés. Aucun chiffre, aucune promesse.</div></div>`)

  /* ---------- 01 textures comparison ---------- */
  add('textures', '8 textures', 'presentation-finale/01-textures-comparatif.jpg', '', `
    <div class="eyebrow">Recherche matière</div><h2>Huit textures autour du beige</h2>
    <p class="lead">Chaque texture est assez discrète pour ne gêner ni une photographie ni la lecture. Le nom, l’intensité du grain et les couleurs compatibles accompagnent chaque proposition.</p>
    <div class="hr"></div>
    <div class="grid g4">${TX.map((t) => `<div class="tile">${fit(`<div class="native" style="width:900px;height:900px;position:relative;overflow:hidden">${t.layer(900, 900)}<div style="position:absolute;left:60px;bottom:56px;font-family:'Cormorant Garamond';font-size:64px;font-weight:500;color:#1D1915">${t.name}</div><div style="position:absolute;left:62px;top:56px;font-family:Inter;font-size:20px;letter-spacing:.24em;color:#6e6458">${t.num}</div></div>`, 900, 900)}
      <h3>${t.num} · ${t.name}</h3><p>${t.desc}</p><div class="meta">Grain : <b>${t.intensity}</b></div>${sw(t.hex)}<div class="meta" style="margin-top:8px">Compatibles</div>${sw(t.second)}</div>`).join('')}</div>`)

  /* ---------- 02-09 one board per texture ---------- */
  TX.forEach((t, i) =>
    add(`tx-${t.key}`, `Texture ${t.num}`, `textures/${t.num}-${t.key}.jpg`, '', `
      <div class="eyebrow">Texture ${t.num}</div><h2>${t.name}</h2><p class="lead">${t.desc}</p><div class="hr"></div>
      <div class="grid" style="grid-template-columns:1.6fr 1fr;gap:48px;align-items:start">
        <div>${fit(`<div class="native" style="width:1600px;height:1000px;position:relative;overflow:hidden">${t.layer(1600, 1000)}</div>`, 1600, 1000)}<div class="cap"><span>Aperçu grand format · 1600 × 1000</span><span>Intensité : ${t.intensity}</span></div>
          <div class="grid g2" style="margin-top:24px"><div><div style="position:relative;width:100%;aspect-ratio:1;overflow:hidden">${t.layer(420, 420)}</div><div class="cap"><span>Détail à 100 %</span></div></div>
          <div>${sw(t.hex)}<div class="meta" style="margin-top:14px">Couleurs secondaires compatibles</div>${sw(t.second)}</div></div></div>
        <div>${fit(examplePost(t))}<div class="cap"><span>Application : post Instagram</span><span>1080 × 1350</span></div></div>
      </div>`),
  )
  function examplePost(t) {
    const dark = false
    return `<div class="native" style="width:${W}px;height:${H}px;position:relative;overflow:hidden">${t.layer(W, H)}
      <img src="photographies/tiziana/tz-fenetre-ronde-lecture.jpg" style="position:absolute;left:110px;top:130px;width:860px;height:780px;object-fit:cover;object-position:center 30%">
      <div style="position:absolute;left:110px;right:110px;top:960px;font-family:'Cormorant Garamond';font-weight:500;font-size:74px;line-height:1.04;color:${dark ? '#fff' : '#1D1915'}">Lire, comparer,<br><i>puis décider.</i></div>
      <div style="position:absolute;left:110px;bottom:90px;font-family:Inter;font-size:18px;letter-spacing:.3em;text-transform:uppercase;color:#6e6458">Tiziana Caci · Texture ${t.num}</div></div>`
  }

  /* ---------- 10 directions overview ---------- */
  add('directions', '4 directions', 'presentation-finale/02-directions-comparatif.jpg', 'beige', `
    <div class="eyebrow">Systèmes graphiques</div><h2>Quatre directions artistiques</h2>
    <p class="lead">Quatre directeurs artistiques, quatre manières de composer — pas quatre couleurs de beige sur la même maquette. Le même message éditorial est traité quatre fois.</p><div class="hr"></div>
    <div class="grid g4">${D.map((d) => `<div class="tile">
      <div class="grid g2" style="gap:8px">${fit(d.post(PLAN[1]))}${fit(d.post(PLAN[3]))}</div>
      <div class="num" style="margin-top:16px">Direction ${d.num}</div><h3 style="font-size:24px">${d.name} <span style="font-weight:400;color:var(--muted)">— ${d.tagline}</span></h3><p>${d.idea}</p>
      <div style="margin-top:12px">${sw(d.palette.slice(0, 6))}</div>
      <div class="meta" style="margin-top:12px">${d.fonts.map((f) => `<b>${f[1]}</b>`).join(' · ')}</div></div>`).join('')}</div>`)

  /* ---------- per direction: system board, feed board, presentation board ---------- */
  D.forEach((d) => {
    const fontSpec = d.fonts.map(([role, name, note]) => `<div class="fontrow"><div class="meta">${role}</div><div style="font-family:'${name.replace(/ (Italic|ExtraBold)$/, '')}';${/Italic/.test(name) ? 'font-style:italic;' : ''}${/ExtraBold/.test(name) ? 'font-weight:800;' : ''}font-size:44px;line-height:1.1">${name}</div><div class="meta">${note}</div></div>`).join('')
    add(`sys-${d.key}`, `${d.num} · Système`, `directions-artistiques/${d.num}-${d.key}.jpg`, '', `
      <div class="eyebrow">Direction ${d.num} · système graphique</div><h2>${d.name} — ${d.tagline}</h2><p class="lead">${d.idea}</p><div class="hr"></div>
      <div class="grid" style="grid-template-columns:1fr 1fr 1fr;gap:40px">
        <div><h3>Palette</h3><div style="margin-top:14px">${sw(d.palette)}</div><h3 style="margin-top:30px">Typographies</h3>${fontSpec}<h3 style="margin-top:30px">Textures</h3><div class="grid g3" style="gap:10px;margin-top:12px">${d.textures.map((k) => `<div><div style="position:relative;aspect-ratio:1;overflow:hidden">${texByKey[k].layer(300, 300)}</div><div class="meta" style="margin-top:6px">${texByKey[k].num} · ${texByKey[k].name}</div></div>`).join('')}</div></div>
        <div><h3>Éléments graphiques</h3><div class="spec" style="margin-top:12px">${Object.entries(d.elements).map(([k, v]) => `<div>${k}</div><div>${v}</div>`).join('')}</div></div>
        <div><h3>Règles de composition</h3><div class="spec" style="margin-top:12px">${Object.entries(d.grid).map(([k, v]) => `<div>${k}</div><div>${v}</div>`).join('')}</div>
          <div class="grid g2" style="gap:10px;margin-top:24px">${fit(d.post(PLAN[8]))}${fit(d.post(PLAN[4]))}</div></div>
      </div>`)

    add(`feed-${d.key}`, `${d.num} · Feed`, `feeds-instagram/${d.num}-${d.key}.jpg`, 'beige', `
      <div class="grid" style="grid-template-columns:560px 1fr;gap:64px;align-items:start">
        <div>${feed(d)}</div>
        <div><div class="eyebrow">Direction ${d.num} · feed de 12 publications</div><h2>${d.name}</h2><p class="lead">${d.logic}</p>
          <div class="hr"></div><h3>Impression générale</h3><p class="lead" style="margin-top:8px">${d.impression}</p>
          <div class="hr"></div><h3>Répartition éditoriale</h3>
          <ol class="plan">${PLAN.map((p) => `<li><span>${String(p.n).padStart(2, '0')}</span><b>${p.kind}</b> — ${p.title}</li>`).join('')}</ol></div>
      </div>`)

    add(`pres-${d.key}`, `${d.num} · Présentation`, `presentation-finale/0${2 + +d.num}-direction-${d.num}-${d.key}.jpg`, '', `
      <div class="eyebrow">Direction ${d.num} · présentation</div><h2>${d.name} — ${d.tagline}</h2><div class="hr"></div>
      <div class="grid g3" style="gap:28px">${[PLAN[0], PLAN[2], PLAN[8]].map((p) => `<div>${fit(d.post(p))}<div class="cap"><span>${String(p.n).padStart(2, '0')} · ${p.kind}</span><span>1080 × 1350</span></div></div>`).join('')}</div>
      <div class="hr"></div>
      <h3>Carrousels : couverture et pages intérieures</h3>
      ${['expertise', 'reflexion', 'story']
        .map((car) => {
          const cover = PLAN.find((p) => p.carousel === car)
          return `<div class="grid g4" style="gap:18px;margin-top:18px">${fit(d.post(cover))}${SL[car].map((s, i) => fit(d.slide(car, s, i))).join('')}</div><div class="cap"><span>${cover.kind} — « ${cover.title} »</span><span>couverture + 3 pages intérieures</span></div>`
        })
        .join('')}
      <div class="hr"></div>
      <div class="grid g3"><div><h3>Logique de composition</h3><p class="lead" style="font-size:16px;margin-top:8px">${d.logic}</p></div><div><h3>Impression générale</h3><p class="lead" style="font-size:16px;margin-top:8px">${d.impression}</p></div><div><h3>Palette et typographies</h3><div style="margin-top:10px">${sw(d.palette)}</div><div class="meta" style="margin-top:10px">${d.fonts.map((f) => `<b>${f[1]}</b> (${f[0].toLowerCase()})`).join(' · ')}</div></div></div>`)
  })

  /* ---------- feeds side by side ---------- */
  add('feeds', '4 feeds', 'presentation-finale/07-feeds-comparatif.jpg', 'beige', `
    <div class="eyebrow">Comparaison</div><h2>Les quatre feeds côte à côte</h2>
    <p class="lead">Le même plan éditorial de douze publications, traité par quatre systèmes. À regarder de loin : c’est l’impression d’ensemble qui décide.</p><div class="hr"></div>
    <div class="grid g4" style="gap:28px">${D.map((d) => `<div>${feed(d, true)}<div class="cap"><span><b>${d.num} · ${d.name}</b></span><span>${d.tagline}</span></div></div>`).join('')}</div>`)

  /* ---------- photos & sources ---------- */
  add('photos', 'Photographies', 'presentation-finale/08-photographies-sources.jpg', '', `
    <div class="eyebrow">Photographies</div><h2>Sélection et sources</h2>
    <p class="lead">Les photographies de Tiziana viennent du dossier « PHOTOS Tiziana » du Drive. Les photographies d’environnement sont des images CC0 (domaine public) de rawpixel, trouvées et vérifiées via l’API Openverse ; la liste complète des liens figure dans photographies/SOURCES.md.</p><div class="hr"></div>
    <h3>Tiziana — 17 photographies réelles</h3><div class="grid g6" style="gap:10px;margin-top:14px" id="tzgrid"></div>
    <div class="hr"></div>
    <h3>Libres de droits — 13 images CC0</h3><div class="grid g6" style="gap:10px;margin-top:14px" id="exgrid"></div>
    <div class="hr"></div>
    <h3>Prises de vue à compléter</h3>${li(['Portraits en lumière naturelle chaude sur fond clair (beige, pierre, lin) : les portraits studio actuels sont sur fond gris', 'Tiziana en rendez-vous ou en présentation (de dos, de profil, sans client identifiable)', 'Déplacements : gare, aéroport, hall d’hôtel, arrivée dans une ville', 'Détails : mains, carnet, documents (sans contenu lisible), ordinateur, tasse', 'Une série homogène tournée le même jour, pour un feed parfaitement étalonné'])}`)

  /* ---------- synthesis ---------- */
  const crit = ['Élégance', 'Cohérence', 'Reconnaissabilité', 'Personnalité', 'Lisibilité', 'Facilité de déclinaison', 'Rendu photographique', 'Pertinence dirigeante']
  const score = { carnet: [5, 5, 3, 3, 5, 4, 4, 4], atelier: [4, 4, 4, 5, 4, 3, 5, 3], tribune: [4, 5, 5, 4, 5, 4, 3, 4], architecte: [4, 4, 5, 4, 4, 5, 4, 5] }
  const dots = (n) => `<span class="dots">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</span>`
  add('synthese', 'Synthèse', 'presentation-finale/09-synthese.jpg', '', `
    <div class="eyebrow">Synthèse comparative</div><h2>Évaluation des quatre directions</h2>
    <p class="lead">Notre lecture, sur cinq, pour éclairer la décision. Aucune proposition n’est écartée : chacune répond à une manière différente d’incarner Tiziana.</p><div class="hr"></div>
    <table class="score"><thead><tr><th></th>${D.map((d) => `<th>${d.num} · ${d.name}</th>`).join('')}</tr></thead>
    <tbody>${crit.map((c, i) => `<tr><td>${c}</td>${D.map((d) => `<td>${dots(score[d.key][i])}</td>`).join('')}</tr>`).join('')}
    <tr class="total"><td>Total / 40</td>${D.map((d) => `<td>${score[d.key].reduce((a, b) => a + b, 0)}</td>`).join('')}</tr></tbody></table>
    <div class="hr"></div>
    <div class="grid g4">${[
      ['Carnet', 'Le plus élégant et le plus lisible. Limite : il ressemble à d’autres comptes « éditoriaux » et met moins en avant la personnalité.'],
      ['Atelier', 'Le plus chaleureux et le meilleur rendu des photos réelles. Limite : la matière et les tirages inclinés peuvent tirer vers le lifestyle si l’on n’y prend pas garde.'],
      ['Tribune', 'Le plus reconnaissable et le plus affirmé. Limite : le noir et blanc retire la chaleur du beige ; à réserver si Tiziana veut un registre de prise de position.'],
      ['Architecte', 'Le plus « dirigeante » et le plus facile à décliner, avec un pont naturel vers Fynovates. Limite : moins intime ; les plans translucides demandent de la rigueur.'],
    ].map(([n, t]) => `<div><h3>${n}</h3><p class="note" style="margin-top:6px;font-size:14px;line-height:1.55">${t}</p></div>`).join('')}</div>`)

  add('recommandation', 'Recommandation', 'presentation-finale/10-recommandation.jpg', 'beige', `
    <div class="eyebrow">Recommandation finale</div><h2>Architecte, nourri par le Carnet</h2>
    <p class="lead">Nous recommandons la direction <b>4 — Architecte</b> comme système principal : c’est celle qui exprime le mieux une dirigeante qui structure et décide, qui se décline le plus facilement en gabarits, et qui crée un lien visible mais discret avec Fynovates (filet bleu nuit), sans jamais confondre les deux marques.</p>
    <p class="lead">Nous proposons de lui emprunter deux éléments de la direction <b>1 — Carnet</b> pour gagner en intimité : l’italique sérif pour les citations, et la marge crème autour de certaines photographies personnelles.</p>
    <div class="hr"></div>
    <div class="grid g3" style="gap:28px">${[PLAN[0], PLAN[8], PLAN[10]].map((p) => fit(D[3].post(p))).join('')}</div>
    <div class="hr"></div>
    <div class="grid g3"><div><h3>Pourquoi pas les autres en premier</h3>${li(['Carnet : très beau, mais moins singulier', 'Atelier : le plus incarné, mais un risque lifestyle', 'Tribune : idéal pour une série « tribune », moins pour tout le feed'])}</div>
    <div><h3>À garder quelle que soit la décision</h3>${li(['Une seule texture de fond, à intensité constante', 'Un index ou folio récurrent sur chaque publication', 'Un étalonnage photo unique pour tout le feed', 'Le même plan éditorial en 12 cases'])}</div>
    <div><h3>Prochaines étapes</h3>${li(['Choix de Tiziana parmi les 4 feeds', 'Shooting dédié dans la direction retenue', 'Gabarits définitifs (Figma ou Canva) à partir de ces sources', 'Point sur la règle actuelle du feed « photos seules », que ces propositions font évoluer'])}</div></div>`)

  /* ---------- individual publication exports (hidden board area) ---------- */
  const singles = []
  D.forEach((d) => {
    PLAN.forEach((p) => singles.push([`publications/${d.num}-${d.key}/${String(p.n).padStart(2, '0')}-${slug(p.kind)}.jpg`, d.post(p)]))
    ;['expertise', 'story', 'reflexion'].forEach((car) => SL[car].forEach((s, i) => singles.push([`publications/${d.num}-${d.key}/carrousels/${car}-${String(i + 2).padStart(2, '0')}.jpg`, d.slide(car, s, i)])))
  })
  TX.forEach((t) => singles.push([`textures/tuiles/${t.num}-${t.key}.jpg`, `<div class="native" style="width:${W}px;height:${H}px;position:relative;overflow:hidden">${t.layer(W, H)}</div>`]))
  function slug(s) {
    return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  root.innerHTML = boards.map((b) => b.html).join('') + `<div id="singles" style="position:absolute;left:-99999px;top:0">${singles.map(([out, html]) => `<div data-single data-out="${out}" style="width:${W}px;height:${H}px">${html}</div>`).join('')}</div>`
  nav.insertAdjacentHTML('beforeend', boards.map((b) => `<a href="#${b.id}">${b.title}</a>`).join(''))

  // photo boards
  const P = window.PHOTOS
  document.getElementById('tzgrid').innerHTML = P.tz.map((p) => `<figure><img src="${p.file}" alt=""><figcaption>${p.file.split('/').pop().replace('.jpg', '').replace('tz-', '')}</figcaption></figure>`).join('')
  document.getElementById('exgrid').innerHTML = P.ex.map((p) => `<figure><img src="${p.file}" alt=""><figcaption>${p.title} · ${p.license} · ${p.source}</figcaption></figure>`).join('')

  const scale = () => document.querySelectorAll('.fit').forEach((f) => { const n = f.firstElementChild; if (n) n.style.transform = `scale(${f.clientWidth / +f.dataset.w})` })
  scale()
  new ResizeObserver(scale).observe(document.body)
  document.fonts?.ready.then(() => document.body.setAttribute('data-ready', '1'))
})()
