/* Plaquette « Identité LinkedIn Fynovates » — textes proposés (modifiables dans la plateforme). */

export interface LfPost {
  category: string
  text: string
  visualTitle: string
  visualKicker: string
}

export const LF_DEFAULTS = {
  name: 'Fynovates',
  tagline: 'Le cabinet de conseil des entrepreneurs en ligne et internationaux · Fiscalité · Banque · Expatriation · Structuration',
  banner: {
    message: 'Le cabinet de conseil des entrepreneurs en ligne et internationaux.',
    domains: 'Fiscalité | Banque | Expatriation | Structuration internationale',
  },
  taglineOptions:
    'Comprendre avant de décider.\nLe conseil des entrepreneurs qui travaillent au-delà des frontières.\nFiscalité, banque et structuration pour les entrepreneurs internationaux.',
  about:
    'Fynovates est un cabinet de conseil qui accompagne les entrepreneurs en ligne et les entrepreneurs internationaux dans les décisions qui structurent leur activité.\n\nNous travaillons avec des créateurs d’entreprise, des dirigeants et des indépendants dont l’activité, les revenus ou le projet de vie dépassent les frontières d’un seul pays : ventes en ligne, prestations à distance, activités digitales, projets d’installation à l’étranger.\n\nLes questions que nous aidons à résoudre :\n• Où mon activité doit-elle être déclarée et imposée ?\n• Quelle structure correspond à mon projet ?\n• Comment organiser ma banque et mes encaissements ?\n• Que dois-je anticiper avant de m’installer à l’étranger ?\n\nNos domaines d’intervention : fiscalité et structuration internationale, comptabilité et obligations administratives, banque et solutions de paiement, expatriation et mobilité internationale, organisation de l’environnement entrepreneurial.\n\nNotre méthode : comprendre l’activité réelle, procéder aux vérifications, faire relire l’analyse par un second expert, remettre une recommandation écrite et motivée. Les situations évoquées publiquement sont toujours anonymisées.\n\nPour échanger avec le cabinet : prenez rendez-vous sur fynovates.com.',
  details: {
    website: 'fynovates.com',
    industry: 'Services et conseil aux entreprises',
    size: 'À RENSEIGNER',
    headquarters: 'À RENSEIGNER',
    founded: 'À RENSEIGNER',
    specialties: 'Fiscalité internationale, Structuration internationale, Comptabilité, Banque et solutions de paiement, Expatriation, Mobilité internationale, Résidence fiscale, TVA',
  },
  services: [
    { title: 'Conseil fiscal', text: 'Analyse de la situation fiscale de l’entrepreneur et de son activité, en France et à l’international.' },
    { title: 'Structuration internationale', text: 'Choix et organisation des structures au regard de l’activité réelle, des associés et des pays concernés.' },
    { title: 'Accompagnement à l’expatriation', text: 'Préparation du départ : résidence fiscale, activité, patrimoine, calendrier et coordination des démarches.' },
    { title: 'Solutions bancaires et de paiement', text: 'Organisation des comptes et des encaissements, préparation des dossiers d’ouverture.' },
    { title: 'Accompagnement comptable et administratif', text: 'Suivi des obligations comptables, déclaratives et administratives, en coordination avec les professionnels habilités.' },
  ],
  posts: [
    {
      category: 'Expertise fiscale',
      text: 'Vous vendez en ligne à des clients situés dans plusieurs pays ?\n\nAvant de vous demander où ouvrir une société, trois questions méritent une réponse claire :\n\n1. Où se trouvent réellement vos clients ?\n2. Quel est le régime de TVA applicable à vos ventes ?\n3. Où votre activité est-elle effectivement exercée et dirigée ?\n\nCes réponses déterminent vos obligations. Le pays de la société n’en est qu’une conséquence.\n\nChaque situation demande une analyse : les règles dépendent des pays concernés et de la nature de l’activité.\n\n→ Échanger avec le cabinet : fynovates.com',
      visualKicker: 'Fiscalité',
      visualTitle: 'Vendre en ligne à l’international : trois questions avant de facturer',
    },
    {
      category: 'Expatriation',
      text: 'Quitter la France ne se résume pas à changer d’adresse.\n\nAvant un départ, six sujets doivent être examinés ensemble :\n\n• le projet de départ lui-même ;\n• la résidence fiscale ;\n• les conséquences fiscales, en France et dans le pays d’accueil ;\n• l’organisation concrète du changement ;\n• les erreurs de préparation les plus fréquentes ;\n• la synthèse avant décision.\n\nUn départ se prépare en amont, avec une vision globale de la situation.\n\n→ Préparer votre départ avec le cabinet : fynovates.com',
      visualKicker: 'Expatriation',
      visualTitle: 'Quitter la France : six points à examiner avant de partir',
    },
    {
      category: 'Expertise bancaire',
      text: 'Ouvrir un compte professionnel pour une activité internationale prend souvent plus de temps que prévu.\n\nLa banque cherche avant tout à comprendre votre situation :\n\n• l’activité réelle et son modèle économique ;\n• l’origine des fonds ;\n• la structure et ses bénéficiaires ;\n• les pays de vos clients et de vos fournisseurs.\n\nUn dossier clair et cohérent facilite l’échange. Les exigences varient selon les établissements et les pays.\n\n→ Organiser vos solutions bancaires : fynovates.com',
      visualKicker: 'Banque',
      visualTitle: 'Compte professionnel à l’international : ce que la banque examine',
    },
    {
      category: 'Vie du cabinet',
      text: 'Chez Fynovates, chaque accompagnement suit la même méthode.\n\n1. Comprendre l’activité réelle, avant toute recommandation.\n2. Vérifier les règles applicables à la situation.\n3. Faire relire l’analyse par un second expert.\n4. Remettre une recommandation écrite et motivée.\n\nNotre objectif : que chaque client comprenne sa situation avant de décider.\n\n→ Prendre rendez-vous : fynovates.com',
      visualKicker: 'Le cabinet',
      visualTitle: 'Notre méthode en quatre temps',
    },
  ] as LfPost[],
  contact: {
    cta: 'Prendre rendez-vous',
    line: 'Réponse sous 48 heures ouvrées',
    channel: 'Prise de rendez-vous sur fynovates.com',
  },
}

export type LfTexts = typeof LF_DEFAULTS

export const LF_TO_VALIDATE = [
  { what: 'Site web fynovates.com', why: 'Repris des maquettes existantes : adresse exacte et page de prise de rendez-vous à confirmer.' },
  { what: '« Réponse sous 48 heures ouvrées »', why: 'Engagement visible sur les maquettes Stories : à confirmer avant de l’afficher sur LinkedIn.' },
  { what: 'Méthode en quatre temps, relecture par un second expert', why: 'Présentée comme « démontrable sous réserve de confirmation de son application systématique » dans le playbook.' },
  { what: 'Périmètre des services (comptabilité, banque, fiscalité)', why: 'Certains domaines peuvent relever d’activités réglementées : qui intervient, sous quel statut, dans quels pays (playbook, section 4.2).' },
  { what: 'Logo carré', why: 'Le logo officiel est un wordmark horizontal : un format carré officiel (sans monogramme) améliorerait la lisibilité en petit.' },
  { what: 'Secteur, taille, siège, date de création', why: 'Informations de la page entreprise non fournies.' },
  { what: 'Contenu technique des publications', why: 'Textes pédagogiques sans chiffre : à relire par un expert avant toute publication.' },
  { what: 'Lisibilité de la bannière sur mobile', why: 'La bannière d’entreprise est très réduite sur téléphone : le message reste secondaire, à vérifier dans l’application une fois en ligne.' },
  { what: 'Bouton personnalisé', why: 'Le libellé « Prendre rendez-vous » dépend des options disponibles sur la page entreprise.' },
]
