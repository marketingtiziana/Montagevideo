/* Four directions, one family. Same grammar for all four: the differences come from palette, tone, photo grade and signs.
   Validated texts: role line, LinkedIn headline and "Infos", signature expressions from the playbook. Everything else is a proposal. */
;(function () {
  const E = window.ENG, L = window.LIB, O = E.obj, { A, T, box, photo } = E, full = E.full

  const D = (window.DIRS = [
    { id: '01', slug: 'warm-natural', folder: 'direction-01-warm-natural', name: 'Warm & Natural', short: 'Chaleureux',
      concept: 'Une identité chaleureuse, élégante et naturelle : crème, sable, chocolat. Tiziana apparaît comme une entrepreneure affirmée, accessible, avec une vraie présence.',
      impression: 'Élégante, humaine, sûre d’elle.',
      pal: { bg: '#F0E9DF', light: '#FAF8F4', mid: '#A89887', sand: '#D4C2AE', ink: '#49372D', dark: '#49372D', accent: '#49372D' },
      swatches: [['Crème', '#F0E9DF', 'Fond principal'], ['Beige sable', '#D4C2AE', 'Fonds secondaires, formes'], ['Brun chocolat', '#49372D', 'Texte, fonds sombres'], ['Taupe', '#A89887', 'Légendes, filets'], ['Blanc cassé', '#FAF8F4', 'Respirations']],
      fonts: { title: "'Cormorant Garamond'", tw: 500, italic: true, text: 'Manrope', label: 'Manrope', spec: 'Cormorant Garamond 500 et italique · Manrope 400 / 600' },
      grade: { f: 'saturate(.88) contrast(1.02) sepia(.12) brightness(1.04)' }, gradeAlt: null, ring: '#A89887',
      gradients: ['radial-gradient(90% 80% at 25% 15%,#FAF8F4,#F0E9DF 60%,#E3D6C6)', 'linear-gradient(180deg,#F0E9DF,#D4C2AE)', 'radial-gradient(110% 90% at 25% 15%,#5E4A3D,#49372D 60%,#382A22)'],
      textures: ['Papier crème', 'Pierre calcaire', 'Lin'], light: 'Douce, naturelle, latérale (fenêtre)', colors: 'Chaudes, peau lumineuse, blancs crème', contrast: 'Doux', framing: 'Plans taille et trois-quarts, regard caméra ou légèrement hors champ', decor: 'Bureau lumineux, bois clair, matières minérales', poses: 'Assise, en lecture, en conversation, sourire franc', treatment: 'Chaud, légèrement désaturé',
      signs: [['Les bracelets qu’elle porte déjà', 'Visibles sur ses photos studio : un détail réel, à garder présent dans les plans serrés (mains, documents).', 'bracelets'], ['Une signature manuscrite « Tiziana »', 'En fin de publication et de carrousel, comme on signe une note.', 'script'], ['La lumière chaude de côté', 'Une constante photographique plutôt qu’un objet : on la reconnaît sans logo.', 'light']],
      silhouettes: [['Crème structuré', 'Robe ou tailleur crème, ceinture, bijoux discrets.', 'voyage-valise-fenetre', ['#F0E9DF', '#D4C2AE']], ['Chemise ivoire', 'Chemise ivoire, pantalon chocolat, au bureau.', 'bibliotheque-sourire', ['#FAF8F4', '#49372D']], ['Chocolat et taupe', 'Veste chocolat, haut crème. Photo à réaliser.', null, ['#49372D', '#A89887', '#F0E9DF']]],
      env: ['interieur-beige-2', 'carnet-2'], strengths: 'La plus chaleureuse et la plus naturelle ; met la peau et le sourire en valeur.', risks: 'Univers beige fréquent sur Instagram : la signature doit être tenue.', scores: [9, 9, 8, 7, 7, 9, 9, 9] },
    { id: '02', slug: 'modern-monochrome', folder: 'direction-02-modern-monochrome', name: 'Modern Monochrome', short: 'Monochrome',
      concept: 'Une identité minimaliste et contemporaine qui mise sur le visage, la photographie et la personnalité plutôt que sur la couleur. Noir et blanc doux, couleur ponctuelle.',
      impression: 'Indépendante, intéressante, affirmée, moderne — jamais froide.',
      pal: { bg: '#F5F4F0', light: '#FFFFFF', mid: '#AAA8A2', sand: '#E7E1D7', ink: '#242321', dark: '#242321', accent: '#242321' },
      swatches: [['Blanc cassé', '#F5F4F0', 'Fond principal'], ['Noir doux', '#242321', 'Texte, fonds sombres'], ['Gris chaud', '#AAA8A2', 'Légendes'], ['Beige clair', '#E7E1D7', 'Touche chaude']],
      fonts: { title: "'Inter'", tw: 300, italic: false, text: 'Inter', label: 'Inter', spec: 'Inter 300 / 600 — titres légers, affirmés par la taille' },
      grade: { f: 'grayscale(1) contrast(1.06) brightness(1.06)' }, gradeAlt: { f: 'saturate(.8) sepia(.06) brightness(1.03)' }, ring: '#242321',
      gradients: ['linear-gradient(180deg,#FFFFFF,#F5F4F0)', 'linear-gradient(180deg,#F5F4F0,#E7E1D7)', 'linear-gradient(180deg,#34322f,#242321)'],
      textures: ['Papier blanc mat', 'Grain photo doux', 'Lin clair'], light: 'Naturelle, douce, un seul côté', colors: 'Noir et blanc doux ; couleur naturelle sur 1 photo sur 3', contrast: 'Doux (pas de noirs bouchés)', framing: 'Serré, décentré ; espace négatif', decor: 'Murs clairs, architecture simple, fenêtres', poses: 'Spontanées, en mouvement, regard direct', treatment: 'Monochrome doux, grain léger',
      signs: [['Les lunettes', 'Elle les porte déjà sur plusieurs photos de travail : un signe réel, à assumer dans les portraits de réflexion.', 'glasses'], ['Le cadrage serré décentré', 'Le visage toujours décentré, avec de l’air : on reconnaît le compte au premier coup d’œil.', 'framing'], ['Une ligne fine sous le nom', 'Signature typographique minimale en bas de chaque visuel.', 'line']],
      silhouettes: [['Noir et blanc', 'Veste noire à liseré clair, portrait.', 'studio-marine', ['#242321', '#F5F4F0']], ['Chemise blanche', 'Chemise blanche, pantalon sombre, en mouvement.', 'balcon-telephone', ['#FFFFFF', '#242321']], ['Gris et beige', 'Pull gris, pantalon beige. Photo à réaliser.', null, ['#AAA8A2', '#E7E1D7']]],
      env: ['salle-blanche-fenetres', 'escalier-beton'], strengths: 'Le visage d’abord ; très moderne et facile à décliner.', risks: 'Froideur si le noir et blanc devient systématique : garder des photos couleur.', scores: [9, 7, 8, 9, 8, 9, 9, 9] },
    { id: '03', slug: 'soft-olive', folder: 'direction-03-soft-olive', name: 'Soft Olive', short: 'Olive',
      concept: 'Une identité plus singulière, inspirée des matières naturelles et de l’architecture : ivoire et sable dominants, vert olive doux par touches.',
      impression: 'Réfléchie, indépendante, posée, authentique.',
      pal: { bg: '#F0EDE4', light: '#F8F6F0', mid: '#B5B0A5', sand: '#D1C2AD', ink: '#483A30', dark: '#6D7259', accent: '#6D7259' },
      swatches: [['Ivoire', '#F0EDE4', 'Fond principal'], ['Vert olive doux', '#6D7259', 'Touches, fonds de prise de position'], ['Sable', '#D1C2AD', 'Formes, matières'], ['Brun', '#483A30', 'Texte'], ['Gris chaud', '#B5B0A5', 'Légendes']],
      fonts: { title: "'Fraunces'", tw: 300, italic: false, text: 'Manrope', label: 'Manrope', spec: 'Fraunces 300 (éditoriale contemporaine) · Manrope' },
      grade: { f: 'saturate(.8) contrast(1.0) sepia(.1) brightness(1.05)' }, gradeAlt: null, ring: '#6D7259',
      gradients: ['radial-gradient(90% 80% at 75% 20%,#F8F6F0,#F0EDE4 60%,#E2DCCF)', 'linear-gradient(180deg,#F0EDE4,#D1C2AD)', 'radial-gradient(110% 90% at 25% 15%,#80856b,#6D7259 60%,#5b604a)'],
      textures: ['Lin naturel', 'Pierre claire', 'Papier ivoire'], light: 'Lumineuse, diffuse, lumière du jour', colors: 'Naturelles, légèrement adoucies', contrast: 'Faible à moyen', framing: 'Plans larges dans l’espace, puis serrés', decor: 'Architecture claire, bois, plantes absentes ou très discrètes', poses: 'Posées, réflexion, lecture, marche', treatment: 'Lumineux, doux',
      signs: [['Un carnet olive', 'Un objet de travail réellement utilisable : il apparaît dans les plans de réflexion.', 'notebook'], ['Une forme de galet', 'Une forme organique très discrète en arrière-plan de certaines publications.', 'pebble'], ['La texture lin', 'Une matière reconnaissable dans les fonds, jamais envahissante.', 'linen']],
      silhouettes: [['Le vert', 'Veste verte (plus soutenue que l’olive proposé).', 'studio-vert-reflexion', ['#3b5a4a', '#F0EDE4']], ['Crème et taupe', 'Chemise crème, au travail.', 'table-reflexion', ['#F8F6F0', '#B5B0A5']], ['Olive et brun', 'Pièce olive, pantalon brun. Photo à réaliser.', null, ['#6D7259', '#483A30']]],
      env: ['table-minimaliste', 'facade-ondulee'], strengths: 'La plus singulière tout en restant sobre ; très posée.', risks: 'Glisser vers un univers « naturel / bien-être » si l’olive domine.', scores: [8, 8, 8, 8, 8, 8, 7, 8] },
    { id: '04', slug: 'deep-plum', folder: 'direction-04-deep-plum', name: 'Deep Plum & Cream', short: 'Aubergine',
      concept: 'Une identité un peu plus affirmée et plus mémorisable : l’aubergine apporte la personnalité, la crème et le taupe préservent la sobriété.',
      impression: 'Affirmée, sophistiquée, indépendante, facilement identifiable.',
      pal: { bg: '#F1E9DE', light: '#F8F3EC', mid: '#B4A18D', sand: '#D9C7BD', ink: '#302820', dark: '#49283F', accent: '#49283F' },
      swatches: [['Crème', '#F1E9DE', 'Fond principal'], ['Aubergine profond', '#49283F', 'Signature, ponctuelle'], ['Brun espresso', '#302820', 'Texte'], ['Taupe', '#B4A18D', 'Légendes'], ['Beige rosé', '#D9C7BD', 'Dégradés doux']],
      fonts: { title: "'Instrument Serif'", tw: 400, italic: false, text: 'Inter', label: 'Inter', spec: 'Instrument Serif (droit et italique) · Inter' },
      grade: { f: 'saturate(.86) contrast(1.04) sepia(.1) brightness(1.03)' }, gradeAlt: null, ring: '#49283F',
      gradients: ['radial-gradient(90% 80% at 80% 15%,#F8F3EC,#F1E9DE 55%,#E4D3C9)', 'linear-gradient(200deg,#D9C7BD,#F1E9DE 60%)', 'radial-gradient(110% 90% at 25% 15%,#5e3953,#49283F 60%,#35202f)'],
      textures: ['Papier crème', 'Grain doux', 'Velours (très discret)'], light: 'Douce avec un peu de clair-obscur', colors: 'Chaudes, ombres légèrement prune', contrast: 'Moyen', framing: 'Compositions asymétriques légères', decor: 'Intérieurs crème, bois sombre, une touche aubergine', poses: 'Trois-quarts, regard affirmé, mains visibles', treatment: 'Chaud, ombres prune subtiles',
      signs: [['Le point aubergine', 'Une seule touche de couleur, toujours au même endroit (après le nom, en fin de titre).', 'dot'], ['Un folio aubergine', 'Objet de travail testé dans les plans de réunion ; à garder seulement s’il est utilisé.', 'folio'], ['Le dégradé asymétrique', 'Un halo aubergine très doux dans un coin des visuels clairs.', 'gradient']],
      silhouettes: [['Aubergine', 'Veste aubergine, haut crème. Photo à réaliser.', null, ['#49283F', '#F1E9DE']], ['Crème naturel', 'Chemise crème, rendez-vous d’affaires.', 'dejeuner-affaires', ['#F8F3EC', '#B4A18D']], ['Monochrome sombre', 'Silhouette sombre, portrait affirmé.', 'studio-marine-reflexion', ['#302820', '#F1E9DE']]],
      env: ['stylo-2', 'facade-courbe'], strengths: 'La plus mémorisable ; une signature couleur nette.', risks: 'Trop « mode » ou romantique si l’aubergine est trop présente.', scores: [8, 7, 9, 8, 9, 8, 8, 8] },
  ])
  window.CRITERIA = ['Élégance', 'Naturel', 'Personnalité', 'Modernité', 'Reconnaissabilité', 'Mise en valeur de Tiziana', 'Facilité d’utilisation', 'Cohérence Instagram / LinkedIn']
  D.forEach((d) => { d.bio = ['Fondatrice & directrice de @fynovates', 'The reality behind business.']; d.sign = { name: d.signs[0][0] }; d.channel = 'Tiziana Caci' })

  /* ---------------- shared grammar ---------------- */
  const tt = (d, t, size, c, css = '', lh = 1.04) => T(`${css};font:${d.fonts.tw} ${size}px/${lh} ${d.fonts.title};letter-spacing:${d.id === '02' ? '-.02em' : '-.01em'};color:${c}`, t)
  const em = (d, t) => (d.fonts.italic || d.id === '04' ? `<i>${t}</i>` : t)
  const lab = (d, t, c, css, size = 20) => T(`${css};font:600 ${size}px/1 ${d.fonts.label};letter-spacing:.2em;text-transform:uppercase;color:${c}`, t)
  const txt = (d, t, c, css, size = 28) => T(`${css};font:400 ${size}px/1.5 ${d.fonts.text};color:${c}`, t)
  const cap = (d, t, c, css) => T(`${css};font:${d.fonts.italic ? 'italic 500' : '400'} ${d.fonts.italic ? 34 : 24}px/1.2 ${d.fonts.italic ? d.fonts.title : d.fonts.text};color:${c}`, t)
  // the small signature of each direction
  const mark = (d, c, css = 'left:80px;bottom:70px') => {
    const P = d.pal
    if (d.id === '01') return T(`${css};font:italic 500 40px/1 'Cormorant Garamond';color:${c}`, 'Tiziana')
    if (d.id === '02') return A(css, `<div style="width:80px;height:2px;background:${c}"></div><div style="margin-top:12px;font:600 15px Inter;letter-spacing:.3em;color:${c}">TIZIANA CACI</div>`)
    if (d.id === '03') return A(`${css};display:flex;align-items:center;gap:14px`, `<div style="width:22px;height:16px;border-radius:55% 45% 50% 50%/60% 55% 45% 40%;background:${P.accent}"></div><div style="font:500 16px Manrope;letter-spacing:.24em;color:${c}">TIZIANA CACI</div>`)
    return A(`${css};display:flex;align-items:baseline;gap:4px`, `<div style="font:400 34px 'Instrument Serif';color:${c}">Tiziana Caci</div><div style="width:12px;height:12px;border-radius:50%;background:${P.accent}"></div>`)
  }
  const bgLight = (d) => `<div style="${full}background:${d.gradients[0]}"></div>` + L.noise({ alpha: 0.03, blend: 'multiply' }) + (d.id === '04' ? A('right:-260px;top:-260px;width:760px;height:760px;border-radius:50%;background:radial-gradient(circle,rgba(73,40,63,.16),rgba(73,40,63,0) 70%)') : '') + (d.id === '03' ? A('right:-120px;bottom:-140px;width:620px;height:460px;border-radius:55% 45% 50% 50%/60% 55% 45% 40%;background:rgba(109,114,89,.12)') : '') + (d.id === '01' ? A('left:-200px;top:-200px;width:800px;height:800px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.6),rgba(255,255,255,0) 70%)') : '')
  const bgDark = (d) => `<div style="${full}background:${d.gradients[2]}"></div>` + L.noise({ alpha: 0.04, blend: 'soft-light' })
  const fade = (c = 'rgba(0,0,0,.55)', from = 50) => A(`inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) ${from}%,${c})`)
  const ph = (d, k, css, pos, alt = false) => photo(d, k, css, pos, alt)
  const alt = (d) => d.id === '02' // colour breathing in the monochrome direction

  const TOPICS = (window.TOPICS = ['Portrait', 'Réflexion personnelle', 'Couverture de Reel', 'Photographie professionnelle', 'Carrousel pédagogique', 'Tiziana en situation', 'Prise de position', 'Photographie spontanée', 'Actualité économique', 'Environnement international', 'Réflexion personnelle', 'Portrait éditorial'])
  window.POST = (d, i) => {
    const P = d.pal, W = '#FAF8F4'
    switch (i) {
      case 0: return box(1080, 1440, P.dark, ph(d, 'studio-marine', 'inset:0', '50% 16%') + fade('rgba(0,0,0,.35)', 70) + mark(d, W))
      case 1: return box(1080, 1440, P.bg, bgLight(d) + lab(d, 'Réflexion', P.mid, 'left:90px;top:100px', 18) + tt(d, `Je préfère comprendre le problème avant de chercher ${em(d, 'la solution.')}`, 92, P.ink, 'left:90px;top:420px;width:880px') + mark(d, P.ink, 'left:90px;bottom:90px'))
      case 2: return box(1080, 1920, P.dark, ph(d, 'balcon-telephone', 'inset:0', '50% 20%') + fade('rgba(0,0,0,.85)', 35) + T(`left:80px;top:300px;padding:10px 22px;border:1.5px solid rgba(255,255,255,.7);border-radius:30px;font:600 18px ${d.fonts.label};letter-spacing:.2em;color:#fff`, 'REEL') + tt(d, `Résidence fiscale : ce que l’adresse ${em(d, 'ne prouve pas')}`, 88, '#fff', 'left:80px;top:1180px;width:900px') + mark(d, '#fff', 'left:80px;top:1580px'))
      case 3: return box(1080, 1440, P.dark, ph(d, 'bibliotheque-ordinateur', 'inset:0', '40% 35%') + fade('rgba(0,0,0,.4)', 70) + cap(d, 'Au bureau.', '#fff', 'left:80px;bottom:80px'))
      case 4: return box(1080, 1440, P.light, bgLight(d) + lab(d, 'Carrousel · banque', P.mid, 'left:90px;top:100px', 18) + tt(d, `5 questions avant de choisir sa banque ${em(d, 'à l’étranger')}`, 80, P.ink, 'left:90px;top:170px;width:620px') + A(`right:0;bottom:0;width:560px;height:760px;border-radius:280px 0 0 0;overflow:hidden`, ph(d, 'bibliotheque-sourire', 'inset:0', '50% 25%')) + T(`left:90px;bottom:90px;font:400 40px ${d.fonts.text};color:${P.ink}`, '→'))
      case 5: return box(1080, 1440, P.dark, ph(d, 'fenetre-ronde-ordinateur', 'inset:0', '50% 40%', alt(d)) + mark(d, '#fff', 'left:80px;bottom:70px'))
      case 6: return box(1080, 1440, P.dark, bgDark(d) + lab(d, 'Point de vue', 'rgba(255,255,255,.6)', 'left:90px;top:100px', 18) + tt(d, `Une structure doit servir un projet, ${em(d, 'pas l’inverse.')}`, 96, '#FAF8F4', 'left:90px;top:430px;width:900px') + mark(d, 'rgba(255,255,255,.8)', 'left:90px;bottom:90px'))
      case 7: return box(1080, 1440, P.dark, ph(d, 'dejeuner-affaires', 'inset:0', '50% 30%', alt(d)) + fade('rgba(0,0,0,.4)', 70) + cap(d, 'Entre deux rendez-vous.', '#fff', 'left:80px;bottom:80px'))
      case 8: return box(1080, 1440, P.bg, bgLight(d) + lab(d, 'Actualité · 1er septembre 2026', P.mid, 'left:90px;top:100px', 18) + tt(d, `Factures électroniques : ${em(d, 'ce qui a changé')}`, 90, P.ink, 'left:90px;top:360px;width:880px') + txt(d, 'Réception obligatoire pour toutes les entreprises ; émission pour les PME au 1<sup>er</sup> septembre 2027.', P.ink, 'left:90px;top:740px;width:820px', 30) + txt(d, 'Source : impots.gouv.fr', P.mid, 'left:90px;bottom:90px', 20))
      case 9: return box(1080, 1440, P.dark, ph(d, 'voyage-valise-fenetre', 'inset:0', '50% 40%', alt(d)) + fade('rgba(0,0,0,.4)', 70) + cap(d, 'En déplacement.', '#fff', 'left:80px;bottom:80px'))
      case 10: return box(1080, 1440, P.bg, bgLight(d) + A('left:0;top:0;width:1080px;height:800px;border-radius:0 0 360px 0;overflow:hidden', ph(d, 'table-reflexion', 'inset:0', '50% 25%')) + tt(d, `Ce qui est adapté à un entrepreneur ne l’est pas ${em(d, 'nécessairement à un autre.')}`, 60, P.ink, 'left:90px;top:880px;width:880px') + mark(d, P.ink, 'left:90px;bottom:80px'))
      case 11: return box(1080, 1440, P.dark, ph(d, 'studio-marine-reflexion', 'inset:0', '50% 18%') + fade('rgba(0,0,0,.75)', 50) + tt(d, `The reality ${em(d, 'behind business')}`, 92, '#fff', 'left:80px;bottom:180px;width:800px') + mark(d, 'rgba(255,255,255,.85)', 'left:80px;bottom:80px'))
    }
  }
  window.SLIDE = (d, j) => {
    const P = d.pal, S = [['01', 'Quels flux, quelles devises ?', 'Vos besoins réels — clients, fournisseurs, pays — déterminent le type d’établissement adapté.'], ['02', 'Où êtes-vous résident, où est la société ?', 'Les établissements regardent la cohérence entre votre résidence, la société et l’activité.'], ['03', 'Pouvez-vous documenter votre activité ?', 'Contrats, factures, origine des fonds : la conformité fait partie de l’ouverture.']]
    if (j === 3) return box(1080, 1440, P.dark, bgDark(d) + tt(d, `Une solution bancaire se choisit à partir de ${em(d, 'votre situation.')}`, 84, '#FAF8F4', 'left:90px;top:440px;width:880px') + txt(d, 'Chaque situation est différente : à analyser avec un professionnel compétent.', 'rgba(255,255,255,.7)', 'left:90px;bottom:200px;width:800px', 26) + mark(d, 'rgba(255,255,255,.85)', 'left:90px;bottom:90px'))
    const [n, t, b] = S[j]
    return box(1080, 1440, P.light, bgLight(d) + tt(d, n, 200, P.sand, 'left:80px;top:120px', 1) + tt(d, t, 82, P.ink, 'left:90px;top:520px;width:880px') + txt(d, b, P.ink, 'left:90px;top:840px;width:820px', 32) + T(`right:90px;bottom:90px;font:400 24px ${d.fonts.text};color:${P.mid}`, `${j + 2} / 5`))
  }
  window.EXTRA_REELS = (d, k) => box(1080, 1920, d.pal.dark, ph(d, ['voyage-valise', 'fenetre-ronde-lecture'][k], 'inset:0', '50% 30%', alt(d)) + fade('rgba(0,0,0,.85)', 35) + T(`left:80px;top:300px;padding:10px 22px;border:1.5px solid rgba(255,255,255,.7);border-radius:30px;font:600 18px ${d.fonts.label};letter-spacing:.2em;color:#fff`, 'REEL') + tt(d, [`Avant de partir : ${em(d, 'trois questions')}`, `Ce que la banque ${em(d, 'vérifie')}`][k], 96, '#fff', 'left:80px;top:1200px;width:900px') + mark(d, '#fff', 'left:80px;top:1560px'))
  window.BANNER = (d, w = 1584, h = 396) => box(w, h, d.pal.bg, bgLight(d) + A(`right:0;top:0;width:${w * 0.3}px;height:${h}px;border-radius:${h}px 0 0 ${h}px;overflow:hidden`, ph(d, 'bibliotheque-sourire', 'inset:0', '50% 22%')) + tt(d, `The reality ${em(d, 'behind business')}`, h * 0.17, d.pal.ink, `left:${w * 0.34}px;top:${h * 0.26}px;width:${w * 0.36}px`, 1) + T(`left:${w * 0.34}px;top:${h * 0.66}px;font:500 ${h * 0.05}px ${d.fonts.text};letter-spacing:.16em;color:${d.pal.mid}`, 'TIZIANA CACI · FONDATRICE & DIRECTRICE DE FYNOVATES'))
  window.AVATAR = (d) => box(800, 800, d.pal.bg, ph(d, 'studio-marine', 'left:-60px;top:-30px;width:920px;height:1230px', '50% 12%'))
  window.HL = (d, k) => box(300, 300, [d.pal.bg, d.pal.accent, d.pal.sand][k], k === 0 ? ph(d, 'bibliotheque-sourire', 'inset:0', '50% 25%') : A('inset:0;display:flex;align-items:center;justify-content:center', mark(d, k === 1 ? '#fff' : d.pal.ink, 'position:relative')))
  window.SIGNTILE = (d, k) => {
    const [n, , kind] = d.signs[k], P = d.pal
    const inner = {
      bracelets: ph(d, 'studio-marine', 'inset:0', '64% 74%').replace('object-fit:cover', 'object-fit:cover;transform:scale(2.6);transform-origin:64% 74%'),
      script: bgLight(d) + T(`left:0;right:0;top:250px;text-align:center;font:italic 500 160px 'Cormorant Garamond';color:${P.ink}`, 'Tiziana'),
      light: ph(d, 'fenetre-ronde-lecture', 'inset:0', '50% 30%'),
      glasses: ph(d, 'bibliotheque-sourire', 'inset:0', '52% 22%').replace('object-fit:cover', 'object-fit:cover;transform:scale(2.2);transform-origin:52% 22%'),
      framing: `<div style="${full}background:${P.bg}"></div>` + A('left:260px;top:60px;width:560px;height:580px;overflow:hidden', ph(d, 'studio-marine-reflexion', 'inset:0', '30% 18%')) + A(`left:240px;top:40px;width:600px;height:620px;border:1.5px dashed ${P.mid}`),
      line: bgLight(d) + mark(d, P.ink, 'left:300px;top:300px'),
      notebook: bgLight(d) + A('left:300px;top:110px;transform:rotate(-6deg)', O.notebook(300, 420, '#6D7259', '#D1C2AD')),
      pebble: bgLight(d) + A('left:240px;top:180px;width:420px;height:320px;border-radius:55% 45% 50% 50%/60% 55% 45% 40%;background:#6D7259;opacity:.8'),
      linen: `<img src="${E.PH('env:lin-textile')}" style="${full}object-fit:cover;filter:sepia(.35) saturate(.6) brightness(1.5) contrast(.8)">`,
      dot: bgLight(d) + mark(d, P.ink, 'left:250px;top:300px').replace('font:400 34px', 'font:400 80px').replace('width:12px;height:12px', 'width:26px;height:26px'),
      folio: bgLight(d) + A('left:300px;top:100px;transform:rotate(-5deg)', O.folio(320, 440, '#49283F', '#6b3f5d')),
      gradient: box(900, 700, P.bg, bgLight(d) + A('right:-200px;top:-200px;width:700px;height:700px;border-radius:50%;background:radial-gradient(circle,rgba(73,40,63,.55),rgba(73,40,63,0) 70%)') + tt(d, 'Un halo, pas un aplat.', 64, P.ink, 'left:80px;bottom:90px;width:500px')),
    }[kind]
    return box(900, 700, P.bg, inner)
  }
  window.SHOTS = [['Portrait face caméra', 'studio-marine', '50% 16%'], ['Portrait souriant', 'bibliotheque-sourire', '50% 25%'], ['Portrait sérieux', 'studio-marine-reflexion', '50% 18%'], ['Trois-quarts', 'studio-vert-reflexion', '50% 18%'], ['En pied', 'studio-en-pied', '50% 30%'], ['Au bureau', 'bibliotheque-ordinateur', '40% 35%'], ['Devant un écran', 'fenetre-ronde-ordinateur', '50% 40%'], ['Spontanée · rendez-vous', 'dejeuner-affaires', '50% 30%'], ['Spontanée · téléphone', 'balcon-message', '50% 25%'], ['Environnement 1', 'env', '50% 50%'], ['Environnement 2', 'env', '50% 50%'], ['Réunion, collaborateurs', null, '']]
})()
