/* Editorial plan shared by the four directions (same message, four art directions). */
;(function () {
  window.PLAN = [
    { n: 1, kind: 'Portrait', title: 'Diriger, c’est d’abord comprendre.', sub: 'Portrait' },
    { n: 2, kind: 'Prise de position', title: 'Le pays vient après le projet.', sub: 'Sur le choix d’une structure' },
    { n: 3, kind: 'Carrousel expertise', title: 'Résidence fiscale', sub: 'Cinq questions à se poser avant de partir', carousel: 'expertise' },
    { n: 4, kind: 'Photographie professionnelle', title: 'Préparer avant de conseiller.', sub: 'Au bureau' },
    { n: 5, kind: 'Réflexion personnelle', title: 'Ce que j’ai appris en créant mon cabinet', body: ['Qu’une bonne décision se prépare longtemps avant d’être prise.', 'Que la clarté vaut plus que la vitesse.', 'Et qu’on ne conseille bien que ce qu’on a vraiment compris.'] },
    { n: 6, kind: 'International', title: 'Travailler entre plusieurs pays, c’est accepter de tout réexaminer.', sub: 'Entrepreneuriat international' },
    { n: 7, kind: 'Carrousel storytelling', title: 'Histoire d’une question', sub: '« Dans quel pays dois-je créer ma société ? »', carousel: 'story' },
    { n: 8, kind: 'Portrait en situation', title: 'Lire, comparer, puis décider.', sub: 'En situation' },
    { n: 9, kind: 'Citation', title: 'Une structure doit servir un projet, pas l’inverse.', sub: 'Tiziana Caci' },
    { n: 10, kind: 'Publication éditoriale', title: 'L’architecture d’une décision', sub: 'Ce qui tient dans le temps se construit dans le bon ordre.' },
    { n: 11, kind: 'Carrousel réflexion', title: 'Croissance : faut-il tout restructurer ?', sub: 'Trois questions avant de toucher à la structure', carousel: 'reflexion' },
    { n: 12, kind: 'Personnel · international', title: 'Entre deux départs, les meilleures questions.', sub: 'En déplacement' },
  ]

  /* Interior slides (no figures, no legal conclusion: framing questions only) */
  window.SLIDES = {
    expertise: [
      { n: '01', title: 'Où se trouve votre foyer ?', body: 'Le lieu où vit votre famille et où vous séjournez principalement est l’un des premiers éléments examinés.' },
      { n: '02', title: 'Où travaillez-vous réellement ?', body: 'Ce n’est pas l’adresse de la société qui compte, c’est le lieu où l’activité est effectivement exercée.' },
      { n: '03', title: 'Où sont vos intérêts économiques ?', body: 'Revenus, investissements, centre des affaires : ils dessinent votre situation autant que votre adresse.' },
    ],
    story: [
      { n: '01', title: 'La question', body: '« Dans quel pays dois-je créer ma société ? » C’est souvent la première phrase d’un rendez-vous.' },
      { n: '02', title: 'Ce que je demande en retour', body: 'Où vivez-vous ? Où sont vos clients ? Que voulez-vous construire dans cinq ans ?' },
      { n: '03', title: 'Ce que la réponse révèle', body: 'Le pays n’est presque jamais la vraie question. Le projet, lui, l’est toujours.' },
    ],
    reflexion: [
      { n: '01', title: 'Qu’est-ce qui a changé ?', body: 'Nouveaux clients, nouveaux pays, nouveaux associés : nommer précisément ce qui a bougé.' },
      { n: '02', title: 'Qu’est-ce qui doit rester stable ?', body: 'Ce qui fonctionne déjà mérite d’être protégé avant d’être transformé.' },
      { n: '03', title: 'Que coûterait l’inaction ?', body: 'Parfois, la meilleure décision est d’attendre. Encore faut-il l’avoir décidé.' },
    ],
  }
  window.CAROUSEL_TOTAL = { expertise: 7, story: 5, reflexion: 5 }
})()
