/* Editorial content. Business / finance / strategy / international topics.
   No invented experience, figures, clients, titles or results. Signature lines come from the validated playbook. */
;(function () {
  // the 12 composition slots every feed must cover (brief, section "Créer des feeds")
  window.SLOTS = [
    { n: 1, key: 'sculpture', label: 'Portrait détouré sur forme sculpturale' },
    { n: 2, key: 'xxl', label: 'Titre XXL sur photographie professionnelle' },
    { n: 3, key: 'sable', label: 'Dégradé sable et texture minérale' },
    { n: 4, key: 'nb', label: 'Portrait noir et blanc et formes abstraites' },
    { n: 5, key: 'strategie', label: 'Publication stratégie, typographie expérimentale' },
    { n: 6, key: 'archi', label: 'Architecture et dégradé translucide' },
    { n: 7, key: 'carrousel', label: 'Couverture de carrousel éditoriale' },
    { n: 8, key: 'overlay', label: 'Portrait plein cadre et overlays graphiques' },
    { n: 9, key: 'finance', label: 'Visuel abstrait finance' },
    { n: 10, key: 'papier', label: 'Papier en relief' },
    { n: 11, key: 'asym', label: 'Photo asymétrique de Tiziana' },
    { n: 12, key: 'manifeste', label: 'Manifeste' },
  ]

  window.TITLES = {
    sculptural: {
      sculpture: 'L’ambition demande une vraie architecture.',
      xxl: ['Structure', 'Une structure doit servir un projet, pas l’inverse.'],
      sable: 'La croissance sans structure est une fragilité.',
      nb: 'Comprendre les systèmes avant de prendre des décisions.',
      strategie: ['Ordre', 'Faire les bonnes choses, dans le bon ordre.'],
      archi: 'Ce qui dure se construit lentement.',
      carrousel: ['Grandir', 'sans se fragiliser', 'Trois questions avant toute croissance'],
      overlay: 'Avant de choisir une structure, il faut comprendre la situation.',
      finance: ['Trésorerie · marge · fiscalité · structure', 'Le chiffre d’affaires ne dit pas tout.'],
      papier: 'Une décision stratégique se mesure dans le temps.',
      asym: 'Calme. Méthode. Direction.',
      manifeste: ['Comprendre', 'avant d’agir.', 'Structurer', 'avant d’accélérer.', 'Décider', 'pour durer.'],
    },
    editorial: {
      sculpture: 'Penser international change les règles du jeu.',
      xxl: ['Décider', 'Une décision stratégique se mesure dans le temps.'],
      sable: 'La liberté entrepreneuriale a un prix : la responsabilité.',
      nb: 'Je préfère comprendre le problème avant de chercher la solution.',
      strategie: ['Vision', 'La vision sans méthode reste une intention.'],
      archi: 'Une frontière n’est pas une limite. C’est un cadre à comprendre.',
      carrousel: ['Penser', 'international', 'Ce qui change vraiment quand on passe une frontière'],
      overlay: 'Le business ne se construit pas uniquement sur le chiffre d’affaires.',
      finance: ['Économie · cycles · décisions', 'L’environnement change. Les principes restent.'],
      papier: 'Ce qui est adapté à un entrepreneur ne l’est pas nécessairement à un autre.',
      asym: 'Diriger, c’est choisir ce que l’on n’ira pas faire.',
      manifeste: ['Moins de bruit.', 'Plus de structure.', 'Moins d’urgence.', 'Plus de vision.', 'Moins de recettes.', 'Plus de compréhension.'],
    },
    financial: {
      sculpture: 'Comprendre les systèmes avant de prendre des décisions.',
      xxl: ['Système', 'Une entreprise est un système, pas une addition.'],
      sable: 'Le temps long est un avantage.',
      nb: 'La croissance sans structure est une fragilité.',
      strategie: ['Flux', 'Ce qui entre compte. Ce qui reste compte davantage.'],
      archi: 'L’ambition demande une vraie architecture.',
      carrousel: ['Lire', 'les systèmes', 'Avant de décider : flux, structure, fiscalité, pays'],
      overlay: 'Penser international change les règles du jeu.',
      finance: ['Banque · finance · stratégie', 'Le business ne se construit pas uniquement sur le chiffre d’affaires.'],
      papier: 'Une structure doit servir un projet, pas l’inverse.',
      asym: 'Clarté avant vitesse.',
      manifeste: ['01 Comprendre', '02 Structurer', '03 Décider', '04 Mesurer', '05 Ajuster', '06 Durer'],
    },
    modern: {
      sculpture: 'La liberté entrepreneuriale a un prix : la responsabilité.',
      xxl: ['Vision', 'L’ambition demande une vraie architecture.'],
      sable: 'Grandir, c’est d’abord s’organiser.',
      nb: 'Une décision stratégique se mesure dans le temps.',
      strategie: ['Choisir', 'Diriger, c’est donner une direction. Pas seulement des réponses.'],
      archi: 'Penser international change les règles du jeu.',
      carrousel: ['Décider', 'dans le temps', 'Pourquoi une bonne décision se juge plus tard'],
      overlay: 'Je préfère comprendre le problème avant de chercher la solution.',
      finance: ['Croissance · structuration · vision', 'La croissance sans structure est une fragilité.'],
      papier: 'Avant de choisir une structure, il faut comprendre la situation.',
      asym: 'Assumer. Structurer. Avancer.',
      manifeste: ['Ambition', 'Architecture', 'Responsabilité', 'Vision', 'Temps long'],
    },
  }

  window.CAROUSELS = {
    sculptural: [
      { n: '01', title: 'Que l’activité exige-t-elle vraiment ?', body: 'Avant de recruter, d’ouvrir un pays ou d’investir : nommer ce dont le projet a besoin, pas ce qui rassure.' },
      { n: '02', title: 'Que la structure peut-elle absorber ?', body: 'Chaque étape de croissance pèse sur l’organisation, la trésorerie et la fiscalité. Mieux vaut le savoir avant.' },
      { n: '03', title: 'Que coûte une erreur d’ordre ?', body: 'Faire les bonnes choses dans le mauvais ordre reste l’erreur la plus chère et la plus discrète.' },
    ],
    editorial: [
      { n: '01', title: 'Les règles ne voyagent pas.', body: 'Ce qui est simple dans un pays peut être complexe dans un autre. Rien ne se transpose automatiquement.' },
      { n: '02', title: 'Le temps administratif change.', body: 'Ouvrir, déclarer, faire reconnaître : chaque pays a son rythme, rarement celui du projet.' },
      { n: '03', title: 'La cohérence devient centrale.', body: 'Où l’activité est dirigée, où elle est exercée, où elle est déclarée : tout doit rester lisible.' },
    ],
    financial: [
      { n: '01', title: 'Les flux', body: 'D’où vient l’argent, où il va, à quel rythme. La trésorerie raconte ce que le chiffre d’affaires tait.' },
      { n: '02', title: 'La structure', body: 'Une forme juridique est un outil. Elle doit correspondre à l’activité réelle et à ses perspectives.' },
      { n: '03', title: 'Les pays', body: 'Chaque juridiction ajoute ses règles. Comprendre leur articulation avant de choisir.' },
    ],
    modern: [
      { n: '01', title: 'L’urgence déforme.', body: 'Les décisions prises sous pression sont rarement celles que l’on referait avec du recul.' },
      { n: '02', title: 'Le résultat arrive tard.', body: 'Une structure, un pays, un associé : leurs effets se mesurent sur des années, pas sur un trimestre.' },
      { n: '03', title: 'Le critère, c’est la durée.', body: 'Une bonne décision est celle qui tient encore quand le contexte a changé.' },
    ],
  }

  window.BIO = {
    handle: 'tiziana.caci',
    name: 'Tiziana Caci',
    category: 'Entrepreneur',
    lines: ['Fondatrice & directrice de @fynovates', 'Entrepreneuriat international · stratégie · structuration', 'Comprendre avant de décider.'],
    link: 'fynovates.com',
    highlights: ['À propos de moi', 'Mon cabinet'],
  }
})()
