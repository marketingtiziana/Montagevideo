/* Editorial content — professional Instagram profile of Tiziana Caci.
   Rules: no figures, no invented clients, results, titles or diplomas. Tax / legal / banking topics are framed
   as subjects of analysis, never as promises; each technical post ends with a "situation à analyser" reminder. */
;(function () {
  window.BIO = {
    handle: 'tiziana.caci',
    name: 'Tiziana Caci',
    category: 'Entrepreneur',
    lines: ['Fondatrice & directrice de @fynovates', 'Business international · fiscalité · expatriation · banque', 'Ce que l’international change vraiment pour les entrepreneurs.'],
    link: 'fynovates.com',
    highlights: ['À propos de moi', 'Mon cabinet'],
  }

  // 12 posts, grid order (top-left = most recent). fmt: post | reel | carousel
  window.FEED = [
    { n: 1, fmt: 'post', topic: 'Portrait · positionnement', tpl: 'portrait', photo: 'tz-studio-marine', kicker: 'Tiziana Caci · CEO de Fynovates', title: 'L’international, vu de l’intérieur.', sub: 'Business, fiscalité, expatriation, banque : ce que j’observe chez les entrepreneurs qui changent d’échelle.' },
    { n: 2, fmt: 'reel', topic: 'Expatriation', tpl: 'reelPortrait', photo: 'tz-studio-vert-reflexion', kicker: 'Expatriation', title: 'Partir à l’étranger ne suffit pas pour changer de résidence fiscale.' },
    { n: 3, fmt: 'post', topic: 'Business international', tpl: 'editorialCity', photo: 'skyline-ville', kicker: 'Business international', title: 'Se développer à l’international : ce qu’il faut anticiper.', sub: 'Avant le premier client à l’étranger.' },
    { n: 4, fmt: 'post', topic: 'Prise de position', tpl: 'typo', kicker: 'Point de vue', title: 'Le chiffre d’affaires ne raconte pas <em>toute l’histoire</em> d’une entreprise.', avatar: 'tz-studio-marine' },
    { n: 5, fmt: 'reel', topic: 'Fiscalité', tpl: 'reelLesson', photo: 'cut-studio-marine-reflexion', kicker: 'Fiscalité · vidéo pédagogique', title: 'Quitter la France : les erreurs à éviter <em>avant</em> de partir.', tag: '3 erreurs' },
    { n: 6, fmt: 'reel', topic: 'Banque', tpl: 'reelPhoto', photo: 'tz-balcon-telephone', kicker: 'Banque', title: 'Compte pro à l’étranger : plus compliqué qu’on ne le pense.' },
    { n: 7, fmt: 'post', topic: 'Vision entrepreneuriale', tpl: 'portraitSide', photo: 'tz-bibliotheque-ordinateur', kicker: 'Vision', title: 'La liberté d’entreprendre demande une vraie organisation.' },
    { n: 8, fmt: 'post', topic: 'Actualité · évolution des métiers', tpl: 'news', photo: 'tz-fenetre-ronde-ordinateur', kicker: 'Actualité', title: 'L’IA transforme les métiers.', sub: 'Mais qu’est-ce que cela change vraiment pour les entrepreneurs ?' },
    { n: 9, fmt: 'carousel', topic: 'Structuration', tpl: 'carouselCover', carousel: 'structuration' },
    { n: 10, fmt: 'post', topic: 'Portrait · déplacement', tpl: 'photoOnly', photo: 'tz-voyage-valise-fenetre', kicker: 'En déplacement' },
    { n: 11, fmt: 'post', topic: 'Coulisses du cabinet', tpl: 'behind', photo: 'salle-blanche-fenetres', inset: 'tz-table-reflexion', kicker: 'Coulisses du cabinet', title: 'Ce qu’on analyse avant d’accompagner un entrepreneur à l’international.', list: ['Sa situation personnelle', 'Son activité réelle', 'Les pays concernés', 'Ses objectifs à 3 ans'] },
    { n: 12, fmt: 'post', topic: 'Prise de position', tpl: 'cutoutStatement', photo: 'cut-studio-vert-bras-croises', kicker: 'Point de vue', title: 'Une bonne décision fiscale commence par une bonne compréhension de sa situation.' },
  ]

  const CHECK = 'Chaque situation est différente : à analyser avec un professionnel compétent.'
  window.CAROUSELS = {
    expatriation: {
      label: 'Expatriation', cover: { kicker: 'Expatriation · carrousel', title: 'Avant de partir à l’étranger', em: '5 points à anticiper', photo: 'tz-voyage-valise' },
      slides: [
        { title: 'La résidence fiscale', body: 'Elle ne dépend pas seulement de votre adresse. Le foyer, le séjour principal, l’activité professionnelle et le centre des intérêts économiques entrent en compte.' },
        { title: 'Les conventions entre pays', body: 'Quand deux États peuvent considérer que vous êtes résident, ce sont souvent les conventions fiscales qui permettent de trancher. Elles diffèrent d’un pays à l’autre.' },
        { title: 'La protection sociale', body: 'Santé, retraite, prévoyance : le changement de pays change souvent de régime. À vérifier avant le départ, pas après.' },
        { title: 'La banque et les justificatifs', body: 'Nouvelle adresse, nouveau pays, nouvelles exigences de conformité : prévoir les documents et le calendrier d’ouverture des comptes.' },
        { title: 'Le calendrier du départ', body: 'La date de départ a des conséquences sur les déclarations de l’année. Certaines situations patrimoniales entraînent aussi des obligations spécifiques.' },
      ],
      conclusion: 'Une expatriation réussie se prépare comme un projet : dans le bon ordre, avec les bonnes questions.',
      cta: 'Enregistrez ce carrousel pour préparer votre départ.',
    },
    structuration: {
      label: 'Structuration', cover: { kicker: 'Structuration · carrousel', title: 'Une société à l’étranger ne fait pas une entreprise internationale.', em: '5 erreurs de structuration', photo: 'facade-courbe' },
      slides: [
        { title: 'Créer une société sans activité réelle sur place', body: 'Une structure doit correspondre à une réalité : des moyens, des décisions, une activité. Sinon, elle fragilise plus qu’elle ne protège.' },
        { title: 'Oublier où l’entreprise est réellement dirigée', body: 'Le lieu où les décisions sont prises compte. Une société immatriculée dans un pays peut être considérée comme dirigée depuis un autre.' },
        { title: 'Copier le montage d’un autre entrepreneur', body: 'Ce qui est adapté à un entrepreneur ne l’est pas nécessairement à un autre. Situation familiale, pays, activité : tout change.' },
        { title: 'Penser la fiscalité avant le projet', body: 'Une structure doit servir un projet, pas l’inverse. On commence par comprendre l’activité et ses objectifs.' },
        { title: 'Ne pas anticiper la banque', body: 'Une structure sans compte bancaire opérationnel reste théorique. Les banques analysent la cohérence de l’ensemble.' },
      ],
      conclusion: 'Avant de choisir une structure, il faut comprendre la situation.',
      cta: 'Partagez-le à un entrepreneur qui pense à l’international.',
    },
    banque: {
      label: 'Banque', cover: { kicker: 'Banque · carrousel', title: 'Choisir ses solutions bancaires', em: '5 questions à se poser', photo: 'tz-balcon-message' },
      slides: [
        { title: 'Quels flux, quelles devises ?', body: 'Volume, fréquence, pays des clients et des fournisseurs : vos besoins réels déterminent le type de banque adapté.' },
        { title: 'Où êtes-vous résident, où est la société ?', body: 'Les établissements regardent la cohérence entre votre résidence, celle de la société et l’activité exercée.' },
        { title: 'Pouvez-vous documenter votre activité ?', body: 'Contrats, factures, origine des fonds : les exigences de conformité font partie du processus d’ouverture.' },
        { title: 'Banque ou établissement de paiement ?', body: 'Les services, les garanties et les usages ne sont pas les mêmes. Chaque option a sa logique.' },
        { title: 'Quel est votre plan B ?', body: 'Dépendre d’un seul compte est un risque. Prévoir une solution de secours fait partie d’une bonne organisation.' },
      ],
      conclusion: 'Une solution bancaire se choisit comme une structure : à partir de votre situation, pas d’une recommandation générique.',
      cta: 'Enregistrez-le avant votre prochaine ouverture de compte.',
    },
  }
  window.CHECK = CHECK

  // Reel cover proposals (5 styles) — 1080 × 1920, grid-safe zone 1080 × 1440 in the centre
  window.REELS = [
    { style: 'A', name: 'Portrait de Tiziana avec grand titre', tpl: 'reelPortrait', photo: 'tz-studio-marine', kicker: 'Expatriation', title: 'Résidence fiscale : ce qui compte vraiment.' },
    { style: 'B', name: 'Photographie professionnelle avec accroche', tpl: 'reelPhoto', photo: 'tz-dejeuner-affaires', kicker: 'Business international', title: 'Un rendez-vous d’affaires à l’étranger ne se prépare pas pareil.' },
    { style: 'C', name: 'Fond beige texturé avec titre', tpl: 'reelPaper', kicker: 'Fiscalité', title: '3 questions avant de <em>quitter la France</em>.', avatar: 'tz-studio-marine-reflexion' },
    { style: 'D', name: 'Photographie avec typographie superposée', tpl: 'reelOverlay', photo: 'tz-studio-vert-bras-croises', kicker: 'Vision', word: 'Structurer', title: 'avant d’accélérer.' },
    { style: 'E', name: 'Composition éditoriale titre + sous-titre', tpl: 'reelEditorial', photo: 'tz-bibliotheque-sourire', kicker: 'Entrepreneuriat', title: 'Entreprendre seul, décider seul ?', sub: 'Pourquoi s’entourer fait partie du métier de dirigeant.' },
    { style: 'F', name: 'Emplacement photo à réaliser', tpl: 'placeholder', kicker: 'Coulisses', title: 'Une journée au cabinet.', need: 'Tiziana en réunion avec son équipe ou face caméra au bureau (vertical 9:16).' },
  ]

  window.SHOTS = [
    ['Face caméra, vertical 9:16', 'Plan taille, regard caméra, fond uni clair ou bureau. Pour toutes les couvertures de Reels pédagogiques.'],
    ['En réunion', 'Tiziana avec un interlocuteur (dos ou flou), documents sur la table. Pour « Coulisses du cabinet ».'],
    ['Au bureau, en analyse', 'Mains sur un dossier, carnet, écran avec tableau (contenu flouté). Pour les sujets fiscalité / structuration.'],
    ['En déplacement', 'Gare, aéroport, hall d’hôtel, rue d’une capitale. Pour les sujets expatriation et international.'],
    ['Prise de parole', 'Conférence, atelier, échange en petit groupe. Pour les publications vision et leadership.'],
    ['Portraits studio clairs', '4 à 6 photos sur fond sable ou gris chaud, lumière latérale : faciles à détourer.'],
    ['Détails professionnels', 'Stylo, agenda, passeport, carte bancaire de dos, montre. Pour les visuels sans visage.'],
    ['Tenue claire + tenue sombre', 'Deux tenues pour alterner les tonalités dans la grille.'],
  ]
})()
