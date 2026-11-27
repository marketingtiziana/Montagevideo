/* Editorial plan — CEO positioning. No figures, no claimed titles or results. */
;(function () {
  window.PLAN = [
    { n: 1, kind: 'Portrait CEO', tpl: 'Portrait avec titre', title: 'Décider, c’est aussi assumer ce que l’on écarte.' },
    { n: 2, kind: 'Prise de position', tpl: 'Prise de position', title: 'Une entreprise ne grandit jamais plus vite que sa structure.' },
    { n: 3, kind: 'Carrousel stratégie', tpl: 'Couverture de carrousel', title: 'Avant d’accélérer', sub: 'Quatre questions qu’une dirigeante se pose avant toute croissance', carousel: 'strategie' },
    { n: 4, kind: 'Environnement professionnel', tpl: 'Photographie business', title: 'Les décisions importantes se préparent loin des réunions.' },
    { n: 5, kind: 'Finance & économie', tpl: 'Publication finance / business', title: 'Le chiffre d’affaires ne dit pas tout.', sub: 'Ce qui reste compte autant que ce qui entre : trésorerie, marge, fiscalité, structure.' },
    { n: 6, kind: 'International', tpl: 'Publication internationale', title: 'Penser international, c’est changer d’échelle — pas seulement de pays.' },
    { n: 7, kind: 'Carrousel expérience', tpl: 'Couverture de carrousel', title: 'Ce que diriger mon cabinet m’a appris sur la décision', carousel: 'experience' },
    { n: 8, kind: 'Portrait éditorial', tpl: 'Photographie sans texte', title: '' },
    { n: 9, kind: 'Vision & leadership', tpl: 'Citation éditoriale', title: 'Diriger, c’est donner une direction. Pas seulement des réponses.' },
    { n: 10, kind: 'Business & architecture', tpl: 'Photographie business', title: 'Ce qui dure se construit dans le bon ordre.' },
    { n: 11, kind: 'Carrousel international', tpl: 'Couverture de carrousel', title: 'S’implanter à l’étranger', sub: 'Ce que les entrepreneurs sous-estiment', carousel: 'international' },
    { n: 12, kind: 'Portrait signature', tpl: 'Portrait avec titre', title: 'Je préfère comprendre le problème avant de chercher la solution.' },
  ]
  window.SLIDES = {
    strategie: [
      { n: '01', title: 'Que l’activité exige-t-elle vraiment ?', body: 'Avant de recruter, d’ouvrir un pays ou de lever des fonds : nommer ce dont le projet a besoin, pas ce qui rassure.' },
      { n: '02', title: 'Que la structure peut-elle absorber ?', body: 'Chaque étape de croissance pèse sur l’organisation, la trésorerie et la fiscalité. Mieux vaut le savoir avant.' },
      { n: '03', title: 'Que coûte une erreur d’ordre ?', body: 'Faire les bonnes choses dans le mauvais ordre reste l’erreur la plus chère et la plus discrète.' },
    ],
    experience: [
      { n: '01', title: 'Aller vite n’est pas aller loin.', body: 'Les décisions prises dans l’urgence sont rarement celles que l’on referait.' },
      { n: '02', title: 'Une mauvaise structure coûte plus qu’un mauvais mois.', body: 'Un mois difficile se rattrape. Une structure inadaptée se paie pendant des années.' },
      { n: '03', title: 'S’entourer est une décision stratégique.', body: 'Savoir qui consulter, et à quel moment, fait partie du métier de dirigeant.' },
    ],
    international: [
      { n: '01', title: 'Le temps administratif', body: 'Ouvrir, déclarer, faire reconnaître : chaque pays a son rythme, rarement celui du projet.' },
      { n: '02', title: 'Les règles qui ne voyagent pas', body: 'Ce qui est simple dans un pays peut être complexe dans un autre. Rien ne se transpose automatiquement.' },
      { n: '03', title: 'La cohérence entre pays', body: 'Une activité internationale doit rester lisible : où elle est dirigée, où elle est exercée, où elle est déclarée.' },
    ],
  }
  window.CAROUSEL_TOTAL = { strategie: 6, experience: 5, international: 5 }
  window.BIO = {
    handle: 'tiziana.caci',
    name: 'Tiziana Caci',
    lines: ['CEO & fondatrice de @fynovates', 'Entrepreneuriat international · stratégie · structuration', 'Ce que je vois, ce que je décide, ce que j’en retiens.'],
    link: 'fynovates.com',
    highlights: ['À propos de moi', 'Mon cabinet'],
  }
})()
