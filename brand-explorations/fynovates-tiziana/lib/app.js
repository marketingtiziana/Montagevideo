/* Builds the presentation boards. */
;(function () {
  const T = window.FN_TEXTURES
  const D = window.TZ_DIRECTIONS
  const { FN_APPS, TZ_APPS, fnMock, tzMock, wm } = window.APPS
  const app = document.getElementById('app')
  const nav = document.getElementById('nav')
  const boards = []
  const board = (id, title, cls, html) => boards.push({ id, title, html: `<section class="board ${cls}" id="${id}" data-board="${id}">${html}</section>` })
  const fit = (mock, w, h) => `<div class="fit" data-w="${w}" data-h="${h}" style="aspect-ratio:${w}/${h}">${mock}</div>`
  const swatches = (list) => `<div class="sw">${list.map(([n, v]) => `<span><i style="background:${v.split(' ')[0]}"></i><span><b>${n}</b><br>${v}</span></span>`).join('')}</div>`
  const li = (arr) => `<ul class="clean">${arr.map((x) => `<li>${x}</li>`).join('')}</ul>`
  const fnApp = (k) => FN_APPS.find((a) => a.key === k)
  const tzApp = (k) => TZ_APPS.find((a) => a.key === k)

  /* ---------- 00 cover ---------- */
  board(
    'intro',
    'Introduction',
    '',
    `<div class="eyebrow">Recherche créative · document de travail</div>
     <h1>Fynovates &amp; Tiziana<br>Explorations de direction artistique</h1>
     <p class="lead">Huit textures pour enrichir le bleu institutionnel de Fynovates, six directions beige pour l’univers personnel de Tiziana, chacune montrée sur six supports réels. Aucune direction n’est retenue ici : ces planches servent à comparer et à décider. Rien n’est appliqué à la plateforme.</p>
     <div class="hr"></div>
     <div class="grid g2">
       <div>${fit(fnMock(T[1], fnApp('cover')), 1920, 1080)}<div class="cap"><span>Fynovates — bleu institutionnel, 8 textures</span><span>Planches 01 à 10</span></div></div>
       <div>${fit(tzMock(D[0], tzApp('cover')), 1920, 1080)}<div class="cap"><span>Tiziana — univers beige, 6 directions</span><span>Planches 11 à 18</span></div></div>
     </div>
     <div class="hr"></div>
     <div class="grid g3 note">
       <div><b>Constantes conservées</b><br>Wordmark officiel FYNOVATES (fichier vectoriel), bleu nuit #0D082E, typographie sans-sérif pour Fynovates.</div>
       <div><b>Photographies</b><br>Uniquement les photos réelles du shooting studio de Tiziana (dossier « PHOTOS Tiziana »), sans retouche. Fond gris d’origine.</div>
       <div><b>Textes</b><br>Phrases issues des playbooks validés (expressions signatures, méthode). Aucun chiffre, aucune promesse.</div>
     </div>`,
  )

  /* ---------- 01 textures comparison ---------- */
  board(
    'fn-compare',
    'Fynovates · 8 textures',
    'dark',
    `<div class="eyebrow">Territoire 1 · Fynovates</div><h2>Le bleu et ses textures — planche comparative</h2>
     <p class="lead">Le même bleu nuit #0D082E, la même composition, huit matières. Chaque carré est une couverture de présentation recadrée : seule la texture change.</p>
     <div class="hr"></div>
     <div class="grid g4">${T.map(
       (t) => `<div class="tile">${fit(`<div class="native" style="width:900px;height:900px;position:relative;overflow:hidden;color:#fff;font-family:Inter">${t.layer(900, 900)}<div style="position:absolute;left:70px;bottom:70px">${wm(240)}<div style="margin-top:26px;font-size:46px;font-weight:700;letter-spacing:-0.01em">${t.name}</div></div></div>`, 900, 900)}
         <div class="num" style="margin-top:14px">${t.num}</div><h3 style="margin-top:4px">${t.name}</h3><p>${t.idea}</p></div>`,
     ).join('')}</div>`,
  )

  /* ---------- 02 matrix ---------- */
  board(
    'fn-matrix',
    'Fynovates · matrice',
    '',
    `<div class="eyebrow">Territoire 1 · Fynovates</div><h2>Matrice : chaque texture sur les six supports</h2>
     <p class="lead">Lecture en ligne pour juger une texture ; lecture en colonne pour juger un support. Une texture qui ne tient pas sur la miniature ou la bannière LinkedIn (petits formats) ne tiendra pas dans la durée.</p>
     <div class="hr"></div>
     <div class="matrix"><div></div>${FN_APPS.map((a) => `<div class="collabel">${a.label}</div>`).join('')}
     ${T.map((t) => `<div class="rowlabel"><span class="num">${t.num}</span><br>${t.name}</div>` + FN_APPS.map((a) => fit(fnMock(t, a), a.w, a.h)).join('')).join('')}</div>`,
  )

  /* ---------- 03-10 texture details ---------- */
  T.forEach((t) =>
    board(
      `fn-${t.key}`,
      `Texture ${t.num}`,
      '',
      `<div class="eyebrow">Fynovates · texture ${t.num}</div><h2>${t.name}</h2><p class="lead">${t.idea}</p>
       <div class="hr"></div>
       <div class="grid" style="grid-template-columns:1.25fr 1fr;gap:56px">
         <div>${fit(fnMock(t, fnApp('cover')), 1920, 1080)}<div class="cap"><span>Couverture de présentation · 1920 × 1080</span></div></div>
         <div class="spec">
           <div>Palette</div><div>${swatches(t.palette)}</div>
           <div>Texture</div><div>${t.texture}</div>
           <div>Typographies</div><div>Inter (titres et texte) et wordmark officiel — inchangés, pour isoler l’effet de la texture</div>
           <div>Éléments graphiques</div><div>${t.elements}</div>
           <div>Avantages</div><div>${li(t.pros)}</div>
           <div>Risques et limites</div><div>${li(t.risks)}</div>
         </div>
       </div>
       <div class="hr"></div>
       <div>${fit(fnMock(t, fnApp('li')), 1128, 191)}<div class="cap"><span>Bannière LinkedIn · 1128 × 191</span></div></div>
       <div class="grid g4" style="margin-top:28px;align-items:start">
         <div>${fit(fnMock(t, fnApp('yt')), 1280, 720)}<div class="cap"><span>Miniature YouTube</span><span>1280 × 720</span></div>
              <div style="margin-top:20px">${fit(fnMock(t, fnApp('slide')), 1920, 1080)}<div class="cap"><span>Slide d’expertise</span><span>1920 × 1080</span></div></div></div>
         <div>${fit(fnMock(t, fnApp('ig')), 1080, 1350)}<div class="cap"><span>Visuel pédagogique Instagram</span><span>1080 × 1350</span></div></div>
         <div>${fit(fnMock(t, fnApp('post')), 1080, 1080)}<div class="cap"><span>Fond de publication corporate</span><span>1080 × 1080</span></div></div>
         <div><div style="width:330px;height:330px;position:relative;overflow:hidden">${t.layer(330, 330)}</div><div class="cap"><span>Texture seule</span><span>détail à 100 %</span></div></div>
       </div>`,
    ),
  )

  /* ---------- 11 Tiziana comparison ---------- */
  board(
    'tz-compare',
    'Tiziana · 6 directions',
    'beige',
    `<div class="eyebrow">Territoire 2 · Tiziana</div><h2>L’univers beige — planche comparative</h2>
     <p class="lead">Six directions réellement différentes, de même niveau d’aboutissement. Toutes parlent d’une dirigeante : aucune n’emprunte les codes de l’influence, de la mode ou du coaching.</p>
     <div class="hr"></div>
     <div class="grid g3" style="gap:32px">${D.map(
       (d) => `<div class="tile">${fit(tzMock(d, tzApp('quote')), 1080, 1080)}
         <div class="num" style="margin-top:16px">Direction ${d.num}</div><h3 style="margin-top:4px">${d.name}</h3><p>${d.idea}</p>
         <div style="margin-top:14px">${swatches(Object.entries(d.c).filter(([k]) => ['bg', 'bg2', 'ink', 'accent', 'line', 'bridge'].includes(k)).map(([k, v]) => [{ bg: 'Fond', bg2: 'Clair', ink: 'Texte', accent: 'Accent', line: 'Filet', bridge: 'Pont' }[k], v]))}</div>
         <div style="margin-top:16px;font-family:'${d.fonts.display}';font-weight:${d.fonts.dWeight};font-size:40px;line-height:1.05;color:${d.c.ink}">Aa — Comprendre</div><div class="note" style="margin-top:4px">${d.fontNote}</div></div>`,
     ).join('')}</div>`,
  )

  /* ---------- 12 Tiziana matrix ---------- */
  board(
    'tz-matrix',
    'Tiziana · matrice',
    '',
    `<div class="eyebrow">Territoire 2 · Tiziana</div><h2>Matrice : chaque direction sur les six supports</h2>
     <p class="lead">Le post Instagram reste une photographie seule, sans texte : c’est la règle du feed de Tiziana. Les directions s’y expriment uniquement par le cadre et la marge.</p>
     <div class="hr"></div>
     <div class="matrix"><div></div>${TZ_APPS.map((a) => `<div class="collabel">${a.label}</div>`).join('')}
     ${D.map((d) => `<div class="rowlabel"><span class="num">${d.num}</span><br>${d.name}</div>` + TZ_APPS.map((a) => fit(tzMock(d, a), a.w, a.h)).join('')).join('')}</div>`,
  )

  /* ---------- 13-18 direction details ---------- */
  D.forEach((d) =>
    board(
      `tz-${d.key}`,
      `Direction ${d.num}`,
      '',
      `<div class="eyebrow">Tiziana · direction ${d.num}</div><h2>${d.name}</h2><p class="lead">${d.idea}</p>
       <div class="hr"></div>
       <div class="grid" style="grid-template-columns:1.25fr 1fr;gap:56px">
         <div>${fit(tzMock(d, tzApp('cover')), 1920, 1080)}<div class="cap"><span>Couverture de présentation personnelle · 1920 × 1080</span></div></div>
         <div class="spec">
           <div>Palette</div><div>${swatches(Object.entries(d.c).map(([k, v]) => [{ bg: 'Fond', bg2: 'Fond clair', ink: 'Texte', muted: 'Secondaire', line: 'Filet', accent: 'Accent', bridge: 'Pont Fynovates' }[k], v]))}</div>
           <div>Typographies</div><div>${d.fontNote}<div style="margin-top:8px;font-family:'${d.fonts.display}';font-weight:${d.fonts.dWeight};font-size:34px;color:${d.c.ink}">Tiziana Caci</div></div>
           <div>Texture</div><div>${d.texture}</div>
           <div>Éléments graphiques</div><div>${d.elements}</div>
           <div>Avantages</div><div>${li(d.pros)}</div>
           <div>Risques et limites</div><div>${li(d.risks)}</div>
         </div>
       </div>
       <div class="hr"></div>
       <div>${fit(tzMock(d, tzApp('li')), 1584, 396)}<div class="cap"><span>Bannière LinkedIn personnelle · 1584 × 396 (contenu à droite, la photo de profil recouvre la gauche)</span></div></div>
       <div class="grid g4" style="margin-top:28px;align-items:start">
         <div>${fit(tzMock(d, tzApp('yt')), 1280, 720)}<div class="cap"><span>Miniature YouTube</span><span>1280 × 720</span></div>
              <div style="margin-top:20px">${fit(tzMock(d, tzApp('quote')), 1080, 1080)}<div class="cap"><span>Citation</span><span>1080 × 1080</span></div></div></div>
         <div>${fit(tzMock(d, tzApp('ig')), 1080, 1350)}<div class="cap"><span>Post Instagram (photo seule)</span><span>1080 × 1350</span></div></div>
         <div>${fit(tzMock(d, tzApp('carousel')), 1080, 1350)}<div class="cap"><span>Couverture de carrousel</span><span>1080 × 1350</span></div></div>
         <div class="note" style="line-height:1.6;padding-top:6px"><b>Photographies</b><br>Photos réelles du shooting studio, fond gris d’origine, sans retouche. Un shooting sur fond clair et chaud (beige, pierre, lumière naturelle) servirait mieux cette direction.</div>
       </div>`,
    ),
  )

  /* ---------- 19 side by side ---------- */
  const t0 = T[0]
  const d0 = D[0]
  board(
    'both',
    'Les deux univers',
    '',
    `<div class="eyebrow">Coexistence</div><h2>Deux identités, une même famille</h2>
     <p class="lead">Fynovates parle au nom d’un cabinet ; Tiziana parle en son nom. Les couleurs et les typographies les distinguent ; la grille, les filets, la numérotation et le wordmark les relient.</p>
     <div class="hr"></div>
     <div class="two">
       <div style="background:#0D082E;color:#fff">
         <div class="eyebrow" style="color:rgba(255,255,255,.6)">Fynovates</div><h3 style="font-size:30px;margin-top:8px">Bleu institutionnel</h3>
         <p style="margin-top:8px;color:rgba(255,255,255,.7);font-size:14px">Expertise · Structure · Conseil · Crédibilité · Cabinet international</p>
         <div style="margin-top:24px">${fit(fnMock(t0, fnApp('yt')), 1280, 720)}</div>
         <div class="grid g2" style="margin-top:16px;gap:16px"><div>${fit(fnMock(T[4], fnApp('post')), 1080, 1080)}</div><div>${fit(fnMock(T[7], fnApp('post')), 1080, 1080)}</div></div>
         <ul class="clean" style="margin-top:24px">${['Voix du « nous »', 'Sans-sérif (Inter), capitales espacées', 'Bleu nuit dominant, texture discrète', 'Schémas, grilles, numérotation'].map((x) => `<li style="color:rgba(255,255,255,.85)">${x}</li>`).join('')}</ul>
       </div>
       <div style="background:${d0.c.bg};color:${d0.c.ink}">
         <div class="eyebrow">Tiziana</div><h3 style="font-size:30px;margin-top:8px">Univers beige</h3>
         <p style="margin-top:8px;color:${d0.c.muted};font-size:14px">Personnalité · Vision · Leadership · Expérience · Univers éditorial personnel</p>
         <div style="margin-top:24px">${fit(tzMock(D[2], tzApp('yt')), 1280, 720)}</div>
         <div class="grid g2" style="margin-top:16px;gap:16px"><div>${fit(tzMock(D[3], tzApp('quote')), 1080, 1080)}</div><div>${fit(tzMock(D[5], tzApp('quote')), 1080, 1080)}</div></div>
         <ul class="clean" style="margin-top:24px">${['Voix du « je »', 'Sérif éditoriale + sans-sérif', 'Beige dominant, photo réelle', 'Citations, prises de position, portraits'].map((x) => `<li>${x}</li>`).join('')}</ul>
       </div>
     </div>
     <div class="hr"></div>
     <h3>Ce qui relie les deux marques</h3>
     <div class="grid g4" style="margin-top:16px">
       ${[
         ['Le wordmark', 'Seul élément commun visible : en blanc chez Fynovates, en signature discrète chez Tiziana (« Fondatrice & directrice de Fynovates »).'],
         ['La grille', 'Mêmes marges proportionnelles, même placement du titre en bas, même filet court sous le titre.'],
         ['La numérotation', '01, 02, 03 en petites capitales espacées : la trace de la méthode dans les deux univers.'],
         ['Le pont bleu', 'Le bleu nuit peut apparaître chez Tiziana en filet ou en signature (direction F) — jamais le beige chez Fynovates.'],
       ]
         .map(([a, b]) => `<div><h3 style="font-size:16px">${a}</h3><p class="note" style="margin-top:6px;font-size:13.5px;line-height:1.55">${b}</p></div>`)
         .join('')}
     </div>`,
  )

  /* ---------- 20 synthesis ---------- */
  board(
    'synthese',
    'Synthèse',
    '',
    `<div class="eyebrow">Synthèse des recommandations graphiques</div><h2>Lire les planches et décider</h2>
     <p class="lead">Aucune direction n’est imposée. Voici notre lecture, question par question, pour guider la décision — à confronter au regard de Tiziana et de l’équipe.</p>
     <div class="hr"></div>
     <div class="qa">
       <div><h3>1 · Quelle texture bleue est la plus premium ?</h3><ul class="clean" style="margin-top:10px">
         <li><b>01 Grain papier</b> — le plus sûr : invisible comme effet, visible comme qualité. Peut devenir la base de tous les supports.</li>
         <li><b>02 Dégradé tonal</b> et <b>07 Profondeur lumineuse</b> — les plus « premium » à l’écran, à associer au grain pour éviter les bandes.</li>
         <li><b>05 Topographie</b> et <b>08 Architectural</b> — les plus porteuses de sens (international, structuration) : à réserver aux supports d’autorité (couvertures, bannières).</li>
         <li>Plus risquées : <b>03 Pierre</b> (registre décoratif), <b>04 Micro-trame</b> et <b>06 Textile</b> (moiré en petit format).</li></ul></div>
       <div><h3>2 · Quelle direction beige pour Tiziana ?</h3><ul class="clean" style="margin-top:10px">
         <li><b>A Éditorial clair</b> et <b>D Beige et noir</b> — les plus proches du positionnement « Modern Executive » : parole frontale, sans décor.</li>
         <li><b>C Beige et brun</b> — la plus affirmée et la plus reconnaissable en miniature.</li>
         <li><b>F Architectural</b> — la plus cohérente avec Fynovates, au prix d’un univers moins incarné.</li>
         <li>À doser : <b>B Sable</b> (risque lifestyle) et <b>E Champagne</b> (risque registre luxe).</li></ul></div>
       <div><h3>3 · Comment faire coexister les deux univers ?</h3><ul class="clean" style="margin-top:10px">
         <li>Une règle de couleur à sens unique : le bleu peut entrer chez Tiziana (filet, signature), le beige n’entre jamais chez Fynovates.</li>
         <li>Une règle de voix : « nous » chez Fynovates, « je » chez Tiziana.</li>
         <li>Une règle typographique : sans-sérif seule pour Fynovates ; sérif éditoriale + sans-sérif pour Tiziana.</li>
         <li>Une grille commune : marges, position du titre, filet court, numérotation.</li></ul></div>
       <div><h3>4 · Quels éléments deviennent récurrents ?</h3><ul class="clean" style="margin-top:10px">
         <li>Le filet court sous le titre (blanc chez Fynovates, encre chez Tiziana).</li>
         <li>La numérotation 01 · 02 · 03 en capitales espacées.</li>
         <li>Le wordmark officiel en en-tête Fynovates ; la signature « Fondatrice & directrice de Fynovates » chez Tiziana.</li>
         <li>Une seule texture Fynovates retenue, déclinée partout à la même intensité.</li>
         <li>La photographie réelle de Tiziana, toujours sans texte sur son feed Instagram.</li></ul></div>
     </div>
     <div class="hr"></div>
     <h3>Prochaines étapes proposées</h3>
     <ul class="clean" style="margin-top:10px;columns:2;column-gap:48px">
       <li>Présélection de 2 textures et 2 directions par Tiziana et l’équipe</li>
       <li>Tests sur publications réelles (une semaine par option)</li>
       <li>Shooting photo adapté à la direction beige retenue</li>
       <li>Validation de la palette (couleurs observées D4 du playbook) et des licences typographiques</li>
       <li>Gabarits définitifs, puis seulement intégration dans la plateforme</li>
       <li>Toutes les polices proposées sont sous licence libre (OFL) ; à remplacer si une police propriétaire est retenue</li>
     </ul>`,
  )

  /* ---------- render ---------- */
  app.innerHTML = boards.map((b) => b.html).join('')
  nav.insertAdjacentHTML('beforeend', boards.map((b) => `<a href="#${b.id}">${b.title}</a>`).join(''))

  const scale = () =>
    document.querySelectorAll('.fit').forEach((f) => {
      const w = +f.dataset.w
      const k = f.clientWidth / w
      const n = f.firstElementChild
      if (n) n.style.transform = `scale(${k})`
    })
  scale()
  new ResizeObserver(scale).observe(document.body)
  document.fonts?.ready.then(() => document.body.setAttribute('data-ready', '1'))
})()
