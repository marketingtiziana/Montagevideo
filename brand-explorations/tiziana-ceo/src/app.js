/* Builds every board of the CEO branding file. data-out = export path (see render.cjs). */
;(function () {
  const TX = window.CEO_TEXTURES
  const D = window.DIRECTIONS
  const PLAN = window.PLAN
  const SL = window.SLIDES
  const BIO = window.BIO
  const { W, H } = window.POST_SIZE
  const root = document.getElementById('app')
  const nav = document.getElementById('nav')
  const boards = []
  const add = (id, title, out, cls, html) => boards.push({ id, title, html: `<section class="board ${cls}" id="${id}" data-board data-out="${out}">${html}</section>` })
  const fit = (mock, w = W, h = H) => `<div class="fit" data-w="${w}" style="aspect-ratio:${w}/${h}">${mock}</div>`
  const sw = (list) => `<div class="sw">${list.map(([n, v]) => `<span><i style="background:${v.split(' ')[0]}"></i><span><b>${n}</b><br>${v}</span></span>`).join('')}</div>`
  const li = (a) => `<ul class="clean">${a.map((x) => `<li>${x}</li>`).join('')}</ul>`
  const tex = Object.fromEntries(TX.map((t) => [t.key, t]))
  const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const TEMPLATES = [
    ['Portrait avec titre', 1],
    ['Prise de position', 2],
    ['Couverture de carrousel', 3],
    ['Publication finance / business', 5],
    ['Citation éditoriale', 9],
    ['Photographie sans texte', 8],
    ['Publication internationale', 6],
  ]
  const meter = (n) => `<span class="meter">${[1, 2, 3].map((k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</span> ${['', 'très discrète', 'discrète', 'perceptible'][n]}`

  const phone = (d, small) => `
    <div class="phone ${small ? 'small' : ''}">
      <div class="ph-head"><div class="ph-av">${fit(d.post(PLAN[0]).replace('class="native post"', 'class="native"'))}</div>
        <div><div class="ph-name">${BIO.handle}</div><div class="ph-bio"><b>${BIO.name}</b><br>${BIO.lines.join('<br>')}<br><span class="ph-link">${BIO.link}</span></div></div></div>
      <div class="ph-hl">${BIO.highlights.map((h, i) => `<span><i style="background:${d.palette[i === 0 ? 0 : 2][1]}"></i>${h}</span>`).join('')}</div>
      <div class="ph-grid">${PLAN.map((p) => fit(d.post(p))).join('')}</div>
    </div>`

  /* ---------------- cover ---------------- */
  add('couverture', 'Couverture', 'presentation-finale/00-couverture.jpg', 'dark', `
    <div class="eyebrow">Personal branding · CEO & international leadership</div>
    <h1>Tiziana Caci</h1>
    <p class="lead">Quatre directions artistiques pour l’image personnelle d’une dirigeante internationale. Tiziana est la marque : chaque système est construit autour de sa présence photographique. Le beige n’est qu’une signature — en touches, en matières, en cartouches.</p>
    <div class="hr"></div>
    <div class="grid g4">${D.map((d) => `<div>${fit(d.post(PLAN[0]))}<div class="cap"><span><b>${d.num} · ${d.name}</b></span><span>${d.tagline}</span></div></div>`).join('')}</div>`)

  /* ---------------- textures ---------------- */
  function texApp(t) {
    const photo = (n, css, pos = 'center 20%') => `<img src="photographies/tiziana/tz-${n}.jpg" style="position:absolute;object-fit:cover;object-position:${pos};${css}">`
    const base = `<div class="native" style="width:${W}px;height:${H}px;position:relative;overflow:hidden">`
    if (t.key === 'grain-photo') return base + photo('studio-marine', 'inset:0;width:100%;height:100%;filter:saturate(.85) contrast(1.06)', 'center 15%') + t.layer(W, H, 'transparent').replace(/background:transparent/, 'background:transparent') + `<div style="position:absolute;left:84px;bottom:96px;font-family:'Instrument Serif';font-size:88px;line-height:1.02;color:#fff">Le grain unifie<br><i>le feed.</i></div></div>`
    if (t.key === 'translucide') return base + photo('bibliotheque-ordinateur', 'inset:0;width:100%;height:100%;filter:saturate(.85)', 'center 40%') + `<div style="position:absolute;left:72px;bottom:96px;width:720px;padding:46px 50px;background:rgba(237,229,216,0.88)"><div style="font-family:Inter;font-size:16px;letter-spacing:.26em;text-transform:uppercase;color:#0E1626;font-weight:700">Stratégie</div><div style="margin-top:20px;font-family:'Instrument Serif';font-size:80px;line-height:1.02;color:#0E1626">Avant d’accélérer</div></div></div>`
    return base + t.layer(W, H) + photo('studio-marine-reflexion', 'right:84px;top:110px;width:420px;height:540px;filter:saturate(.85)', 'center 15%') + `<div style="position:absolute;left:84px;top:110px;font-family:Inter;font-size:16px;letter-spacing:.28em;text-transform:uppercase;color:#6b6155">Tiziana Caci</div><div style="position:absolute;left:84px;right:84px;bottom:110px;font-family:'Instrument Serif';font-size:92px;line-height:1.02;color:#0E1626">Un business solide se construit <i>bien avant sa croissance.</i></div></div>`
  }
  add('textures', '8 textures', 'presentation-finale/01-textures-comparatif.jpg', '', `
    <div class="eyebrow">Le beige comme signature</div><h2>Huit textures pour une identité de dirigeante</h2>
    <p class="lead">Aucune texture n’est décorative : chacune a un rôle précis — un papier pour les prises de position, une pierre pour la finance, un grain pour unifier les photos, un plan translucide pour poser un titre sur un portrait.</p><div class="hr"></div>
    <div class="grid g4">${TX.map((t) => `<div class="tile">${fit(`<div class="native" style="width:900px;height:900px;position:relative;overflow:hidden">${t.layer(900, 900)}</div>`, 900, 900)}<h3>${t.num} · ${t.name}</h3><div class="meta">Intensité : ${meter(t.level)}</div><p>${t.usage}</p>${sw(t.hex)}</div>`).join('')}</div>`)
  TX.forEach((t) =>
    add(`tx-${t.key}`, `Texture ${t.num}`, `textures-beige/${t.num}-${t.key}.jpg`, '', `
      <div class="eyebrow">Texture ${t.num}</div><h2>${t.name}</h2><p class="lead">${t.desc}</p><div class="hr"></div>
      <div class="grid" style="grid-template-columns:1.6fr 1fr;gap:48px;align-items:start">
        <div>${fit(`<div class="native" style="width:1600px;height:1000px;position:relative;overflow:hidden">${t.layer(1600, 1000)}</div>`, 1600, 1000)}<div class="cap"><span>Aperçu grand format</span><span>Intensité : ${meter(t.level)}</span></div>
          <div class="grid g2" style="margin-top:24px"><div><div style="position:relative;aspect-ratio:1;overflow:hidden">${t.layer(420, 420)}</div><div class="cap"><span>Détail à 100 %</span></div></div>
          <div><h3>Codes</h3>${sw(t.hex)}<h3 style="margin-top:24px">Où l’utiliser</h3><p class="note" style="margin-top:6px;font-size:14.5px">${t.usage}</p></div></div></div>
        <div>${fit(texApp(t))}<div class="cap"><span>Application sur un visuel professionnel</span><span>1080 × 1350</span></div></div>
      </div>`),
  )

  /* ---------------- directions overview ---------------- */
  add('directions', '4 directions', 'presentation-finale/02-directions-comparatif.jpg', 'dark', `
    <div class="eyebrow">Quatre univers complets</div><h2>Quatre directions artistiques</h2>
    <p class="lead">Quatre manières différentes de photographier, de cadrer, de titrer et d’organiser un feed — pas quatre palettes posées sur la même maquette.</p><div class="hr"></div>
    <div class="grid g4">${D.map((d) => `<div class="tile"><div class="grid g2" style="gap:8px">${fit(d.post(PLAN[3]))}${fit(d.post(PLAN[1]))}</div>
      <div class="num" style="margin-top:16px">Direction ${d.num}</div><h3 style="font-size:24px">${d.name}</h3><p>${d.idea}</p>${sw(d.palette)}<div class="meta" style="margin-top:10px">${d.fonts.map((f) => `<b>${f[1]}</b>`).join(' · ')}</div></div>`).join('')}</div>`)

  /* ---------------- per direction ---------------- */
  D.forEach((d) => {
    const spec = [
      ['Palette', sw(d.palette)],
      ['Place du beige', d.beige],
      ['Typographies', d.fonts.map(([r, n, a]) => `<div style="margin-bottom:10px"><span class="meta">${r}</span><div style="font-family:'${n.replace(/ (Italic|ExtraBold)$/, '')}';${/Italic/.test(n) ? 'font-style:italic;' : ''}${/ExtraBold/.test(n) ? 'font-weight:800;' : ''}font-size:34px;line-height:1.1">${n}</div><span class="meta">${a}</span></div>`).join('')],
      ['Hiérarchie', d.hierarchy],
      ['Cadrage', d.framing],
      ['Traitement des portraits', d.portrait],
      ['Textures', d.textures.map((k) => `${tex[k].num} · ${tex[k].name}`).join(' — ')],
      ['Filets et bordures', d.lines],
      ['Motifs graphiques', d.motifs],
      ['Grille, marges', d.grid],
      ['Position des titres', d.titles],
      ['Couvertures de carrousel', d.carousel],
    ]
    add(`sys-${d.key}`, `${d.num} · Système`, `directions-artistiques/${d.num}-${d.key}.jpg`, '', `
      <div class="eyebrow">Direction ${d.num} · système graphique</div><h2>${d.name} — ${d.tagline}</h2><p class="lead">${d.idea}</p><div class="hr"></div>
      <div class="grid" style="grid-template-columns:1.2fr 1fr;gap:56px">
        <div class="spec">${spec.map(([k, v]) => `<div>${k}</div><div>${v}</div>`).join('')}</div>
        <div><div class="grid g2" style="gap:12px">${[0, 3, 4, 8].map((k) => fit(d.post(PLAN[k]))).join('')}</div>
          <div class="grid g3" style="gap:10px;margin-top:16px">${d.textures.map((k) => `<div><div style="position:relative;aspect-ratio:1;overflow:hidden">${tex[k].layer(300, 300)}</div><div class="meta">${tex[k].num} · ${tex[k].name}</div></div>`).join('')}</div></div>
      </div>`)

    add(`tpl-${d.key}`, `${d.num} · Templates`, `templates/${d.num}-${d.key}-templates.jpg`, 'beige', `
      <div class="eyebrow">Direction ${d.num} · templates réutilisables</div><h2>Sept gabarits — ${d.name}</h2>
      <p class="lead">Reconnaissables, mais assez variés pour qu’un feed ne se répète pas. Chaque gabarit est un fichier source modifiable (src/directions.js) et un export 1080 × 1350.</p><div class="hr"></div>
      <div class="grid" style="grid-template-columns:repeat(7,1fr);gap:16px">${TEMPLATES.map(([name, k]) => `<div>${fit(d.post(PLAN[k - 1]))}<div class="cap" style="flex-direction:column;gap:2px"><b>${name}</b><span>modèle : publication ${String(k).padStart(2, '0')}</span></div></div>`).join('')}</div>`)

    add(`feed-${d.key}`, `${d.num} · Feed`, `feeds-instagram/${d.num}-${d.key}.jpg`, 'beige', `
      <div class="grid" style="grid-template-columns:600px 1fr;gap:70px;align-items:start">
        <div>${phone(d)}</div>
        <div><div class="eyebrow">Direction ${d.num} · feed de 12 publications</div><h2>${d.name}</h2><p class="lead">${d.logic}</p>
          <div class="hr"></div><h3>Impression générale</h3><p class="lead" style="margin-top:8px">${d.impression}</p>
          <div class="hr"></div><h3>Répartition</h3><ol class="plan">${PLAN.map((p) => `<li><span>${String(p.n).padStart(2, '0')}</span><b>${p.kind}</b>${p.title ? ` — ${p.title}` : ' — photographie seule'}</li>`).join('')}</ol>
          <div class="meta" style="margin-top:16px">Tiziana apparaît sur ${PLAN.filter((p) => /tz-/.test(d.post(p))).length} publications sur 12.</div></div>
      </div>`)

    add(`mock-${d.key}`, `${d.num} · Profil`, `mockups/${d.num}-${d.key}-profil.jpg`, 'dark', `
      <div class="grid" style="grid-template-columns:1fr 560px;gap:70px;align-items:center">
        <div><div class="eyebrow">Direction ${d.num} · simulation du profil</div><h2>${d.name}</h2>
          <div class="hero">${fit(d.post(PLAN[7]))}${fit(d.post(PLAN[0]))}${fit(d.post(PLAN[11]))}</div>
          <div class="hr"></div>
          <div class="grid g2"><div><h3>Bio proposée</h3><p class="lead" style="margin-top:8px"><b>${BIO.name}</b><br>${BIO.lines.join('<br>')}<br>${BIO.link}</p><p class="note" style="margin-top:10px">Aucun titre, diplôme ou résultat non confirmé : « CEO & fondatrice de @fynovates » reprend le rôle validé dans le playbook.</p></div>
          <div><h3>Impression du profil</h3><p class="lead" style="margin-top:8px">${d.impression}</p></div></div></div>
        <div>${phone(d)}</div>
      </div>`)

    add(`pres-${d.key}`, `${d.num} · Présentation`, `presentation-finale/0${2 + +d.num}-direction-${d.num}-${d.key}.jpg`, '', `
      <div class="eyebrow">Direction ${d.num} · présentation</div><h2>${d.name} — ${d.tagline}</h2><div class="hr"></div>
      <div class="grid g3" style="gap:28px">${[PLAN[0], PLAN[4], PLAN[11]].map((p) => `<div>${fit(d.post(p))}<div class="cap"><span>${String(p.n).padStart(2, '0')} · ${p.kind}</span><span>1080 × 1350</span></div></div>`).join('')}</div>
      <div class="hr"></div><h3>Carrousels : couvertures et pages intérieures</h3>
      ${['strategie', 'experience', 'international'].map((car) => { const c = PLAN.find((p) => p.carousel === car); return `<div class="grid g4" style="gap:18px;margin-top:18px">${fit(d.post(c))}${SL[car].map((s, i) => fit(d.slide(car, s, i))).join('')}</div><div class="cap"><span>${c.kind} — « ${c.title} »</span><span>couverture + 3 pages intérieures</span></div>` }).join('')}`)
  })

  /* ---------------- comparisons ---------------- */
  add('feeds', '4 profils', 'presentation-finale/07-profils-comparatif.jpg', 'beige', `
    <div class="eyebrow">Comparaison</div><h2>Les quatre profils côte à côte</h2>
    <p class="lead">Même plan éditorial, mêmes photographies réelles, quatre identités. À regarder à distance : c’est l’impression d’ensemble du profil qui compte.</p><div class="hr"></div>
    <div class="grid g4" style="gap:28px">${D.map((d) => `<div>${phone(d, true)}<div class="cap"><span><b>${d.num} · ${d.name}</b></span><span>${d.tagline}</span></div></div>`).join('')}</div>`)

  const P = window.PHOTOS
  add('photos', 'Photographies', 'presentation-finale/08-photographies-sources.jpg', '', `
    <div class="eyebrow">Photographies</div><h2>Tiziana au centre</h2>
    <p class="lead">Dix-neuf photographies réelles de Tiziana (dossier « PHOTOS Tiziana » du Drive), sélectionnées pour leur potentiel « dirigeante » : portraits face caméra, travail sur ordinateur, appel en déplacement, voyage, rendez-vous. Les images libres de droits (CC0, rawpixel via Openverse) ne servent que d’environnement : architecture, bureaux, ville.</p><div class="hr"></div>
    <h3>Tiziana — ${P.tz.length} photographies réelles</h3><div class="grid g6" style="gap:10px;margin-top:14px">${P.tz.map((p) => `<figure><img src="${p.file}" alt=""><figcaption>${p.file.split('/').pop().replace('.jpg', '').replace('tz-', '')}</figcaption></figure>`).join('')}</div>
    <div class="hr"></div><h3>Environnements — images CC0</h3><div class="grid g6" style="gap:10px;margin-top:14px">${P.ex.filter((p) => !/papier|lin/.test(p.file)).map((p) => `<figure><img src="${p.file}" alt=""><figcaption>${p.title} · ${p.license}</figcaption></figure>`).join('')}</div>
    <div class="hr"></div>
    <div class="grid g2"><div><h3>Ce que les photos actuelles permettent</h3>${li(['Portraits CEO face caméra (shooting studio)', 'Travail et réflexion : bureau-bibliothèque, ordinateur, lecture', 'Déplacement : appel au téléphone, valise, hall d’hôtel', 'Rendez-vous et déjeuners d’affaires'])}</div>
    <div><h3>Prises de vue à organiser</h3>${li(['Portraits sur fond architectural sombre (hall de bureau, verre, pierre) — pour remplacer les fonds gris', 'Tiziana en réunion, de profil ou de dos, sans client identifiable', 'Tiziana devant un écran ou des documents (contenu non lisible)', 'Environnements internationaux : aéroport, gare, rue d’affaires, terrasse de bureau', 'Portraits en pied et assis, avec espace négatif pour les titres', 'Une série complète le même jour, même lumière, pour un étalonnage parfait'])}</div></div>`)

  const crit = ['Autorité et leadership', 'Crédibilité business', 'Dimension internationale', 'Mise en valeur de Tiziana', 'Élégance', 'Cohérence photographique', 'Reconnaissabilité', 'Facilité de déclinaison']
  const score = { 'international-ceo': [5, 5, 5, 5, 5, 4, 4, 4], 'business-woman': [4, 4, 3, 5, 4, 4, 5, 4], 'financial-strategist': [4, 5, 4, 3, 4, 5, 4, 5], 'modern-executive': [5, 4, 4, 5, 4, 4, 5, 4] }
  const dots = (n) => `<span class="dots">${[1, 2, 3, 4, 5].map((k) => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</span>`
  add('synthese', 'Évaluation', 'presentation-finale/09-evaluation.jpg', '', `
    <div class="eyebrow">Évaluation comparative</div><h2>Quatre directions, huit critères</h2>
    <p class="lead">Notre lecture, sur cinq. Les quatre propositions restent consultables : elles répondent à quatre manières différentes d’incarner une dirigeante.</p><div class="hr"></div>
    <table class="score"><thead><tr><th></th>${D.map((d) => `<th>${d.num} · ${d.short}</th>`).join('')}</tr></thead><tbody>
    ${crit.map((c, i) => `<tr><td>${c}</td>${D.map((d) => `<td>${dots(score[d.key][i])}</td>`).join('')}</tr>`).join('')}
    <tr class="total"><td>Total / 40</td>${D.map((d) => `<td>${score[d.key].reduce((a, b) => a + b, 0)}</td>`).join('')}</tr></tbody></table>
    <div class="hr"></div>
    <div class="grid g4">${[
      ['International CEO', 'La plus complète : Tiziana en grand, une envergure internationale immédiate, une élégance éditoriale. Limite : les fonds gris des portraits studio s’accordent moins avec le bleu nuit — un shooting dédié la ferait passer un cap.'],
      ['Business Woman', 'La plus reconnaissable et la plus incarnée, grâce aux découpes et à la grotesque grasse. Limite : la dimension internationale et financière est moins lisible.'],
      ['Financial Strategist', 'La plus crédible sur la finance et la plus facile à décliner en carrousels d’analyse. Limite : Tiziana y est plus petite, le registre peut devenir froid.'],
      ['Modern Executive', 'La plus moderne et la plus affirmée, avec les titres géants et les découpes. Limite : demande des photos très fortes pour tenir la mise en page.'],
    ].map(([n, t]) => `<div><h3>${n}</h3><p class="note" style="margin-top:6px;font-size:14px;line-height:1.55">${t}</p></div>`).join('')}</div>`)

  const best = D[0]
  add('recommandation', 'Recommandation', 'presentation-finale/10-recommandation.jpg', 'dark', `
    <div class="eyebrow">Recommandation</div><h2>The International CEO, avec la rigueur du Financial Strategist</h2>
    <p class="lead">Nous recommandons <b>The International CEO</b> comme système principal. C’est la direction qui met le plus Tiziana au centre — huit publications sur douze la montrent en grand —, qui exprime le mieux l’envergure internationale et l’autorité, et dont le beige reste une signature (cartouche, filet, papier de citation) sans jamais envahir le feed.</p>
    <p class="lead">Pour les contenus finance et les carrousels d’analyse, nous proposons d’emprunter au <b>Financial Strategist</b> sa grille légendée et ses schémas sans chiffres : la crédibilité technique, sans quitter la signature bleu nuit et crème.</p>
    <div class="hr"></div>
    <div class="grid g4" style="gap:24px">${[PLAN[0], PLAN[2], PLAN[5], PLAN[8]].map((p) => fit(best.post(p))).join('')}</div>
    <div class="hr"></div>
    <div class="grid g3"><div><h3>Pourquoi</h3>${li(['La présence de Tiziana est maximale', 'Le registre « presse économique internationale » crédibilise sans intimider', 'Le beige est une signature, pas un fond', 'Système simple à tenir semaine après semaine'])}</div>
    <div><h3>Conditions de réussite</h3>${li(['Un shooting dédié : fonds architecturaux sombres, bureaux, déplacements', 'Un étalonnage unique pour tout le feed (preset)', 'Le grain photographique à intensité constante', 'Deux pages typographiques sur douze maximum'])}</div>
    <div><h3>À valider</h3>${li(['La bio « CEO & fondatrice de @fynovates »', 'L’usage public des photos du shooting et des déplacements', 'La règle actuelle du feed « photos seules », que ces propositions font évoluer', 'Les licences des polices (toutes gratuites, OFL)'])}</div></div>`)

  /* ---------------- singles ---------------- */
  const singles = []
  D.forEach((d) => {
    PLAN.forEach((p) => singles.push([`feeds-instagram/${d.num}-${d.key}/${String(p.n).padStart(2, '0')}-${slug(p.kind)}.jpg`, d.post(p)]))
    ;['strategie', 'experience', 'international'].forEach((car) => SL[car].forEach((s, i) => singles.push([`feeds-instagram/${d.num}-${d.key}/carrousels/${car}-${String(i + 2).padStart(2, '0')}.jpg`, d.slide(car, s, i)])))
    TEMPLATES.forEach(([name, k]) => singles.push([`templates/${d.num}-${d.key}/${slug(name)}.jpg`, d.post(PLAN[k - 1])]))
  })
  TX.forEach((t) => singles.push([`textures-beige/tuiles/${t.num}-${t.key}.jpg`, `<div class="native" style="width:${W}px;height:${H}px;position:relative;overflow:hidden">${t.layer(W, H)}</div>`]))

  root.innerHTML = boards.map((b) => b.html).join('') + `<div id="singles" style="position:absolute;left:-99999px;top:0">${singles.map(([out, html]) => `<div data-single data-out="${out}" style="width:${W}px;height:${H}px">${html}</div>`).join('')}</div>`
  nav.insertAdjacentHTML('beforeend', boards.map((b) => `<a href="#${b.id}">${b.title}</a>`).join(''))
  const scale = () => document.querySelectorAll('.fit').forEach((f) => { const n = f.firstElementChild; if (n) n.style.transform = `scale(${f.clientWidth / +f.dataset.w})` })
  scale()
  new ResizeObserver(scale).observe(document.body)
  document.fonts?.ready.then(() => document.body.setAttribute('data-ready', '1'))
})()
