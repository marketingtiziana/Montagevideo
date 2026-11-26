/* Plaquette « Chaîne YouTube Fynovates » — contenus proposés (modifiables dans la plateforme). */

export type ThumbStyle = 'photo' | 'graphic'
export type Motif = 'list' | 'compare' | 'flow' | 'tree' | 'grid' | 'steps'

export interface YtVideo {
  id: string
  title: string
  big: string
  small: string
  category: string
  style: ThumbStyle
  photo?: 1 | 2 | 3 | 4
  tone?: 'navy' | 'white'
  motif?: Motif
  duration: string
  required?: boolean
}

export interface YtShort {
  id: string
  title: string
  big: string
  style: ThumbStyle
  photo?: 1 | 2 | 3 | 4
  tone?: 'navy' | 'white'
}

const V = (v: YtVideo) => v

export const YT_VIDEOS: YtVideo[] = [
  V({ id: 'v-expat', title: 'Comment t’expatrier pour quitter la France', big: 'Quitter la France', small: 'S’expatrier, étape par étape', category: 'Expatriation', style: 'photo', photo: 2, duration: '15–20 min', required: true }),
  V({ id: 'v-res-err', title: 'Résidence fiscale : les erreurs à éviter', big: 'Résidence fiscale', small: 'Les erreurs à éviter', category: 'Fiscalité', style: 'graphic', tone: 'navy', motif: 'list', duration: '15–20 min', required: true }),
  V({ id: 'v-societe', title: 'Créer une société à l’étranger : ce qu’il faut comprendre', big: 'Société à l’étranger', small: 'Ce qu’il faut comprendre', category: 'Structuration', style: 'photo', photo: 3, duration: '15–20 min', required: true }),
  V({ id: 'v-banque', title: 'Quelle banque choisir pour son activité internationale ?', big: 'Quelle banque ?', small: 'Pour une activité internationale', category: 'Banque', style: 'graphic', tone: 'white', motif: 'compare', duration: '15–20 min', required: true }),
  V({ id: 'v-erreurs', title: 'Les erreurs qui peuvent coûter cher aux entrepreneurs', big: 'Les erreurs qui coûtent cher', small: 'Ce que les entrepreneurs sous-estiment', category: 'Entrepreneuriat', style: 'photo', photo: 1, duration: '15–20 min', required: true }),
  V({ id: 'v-structurer', title: 'Comment structurer son activité à l’international ?', big: 'Structurer à l’international', small: 'Les bonnes questions, dans le bon ordre', category: 'Structuration', style: 'graphic', tone: 'navy', motif: 'tree', duration: '15–20 min', required: true }),
  // rubriques
  V({ id: 'v-fisc-orga', title: 'Comment organiser sa fiscalité à l’international ?', big: 'Fiscalité internationale', small: 'Par où commencer', category: 'Fiscalité', style: 'graphic', tone: 'white', motif: 'flow', duration: '15–20 min' }),
  V({ id: 'v-fisc-online', title: 'Quelles erreurs fiscales éviter avec une activité en ligne ?', big: 'Activité en ligne', small: 'Les erreurs fiscales à éviter', category: 'Fiscalité', style: 'photo', photo: 4, duration: '15–20 min' }),
  V({ id: 'v-res-comp', title: 'Comment comprendre sa résidence fiscale ?', big: 'Comprendre sa résidence fiscale', small: 'Les critères à examiner', category: 'Fiscalité', style: 'graphic', tone: 'navy', motif: 'grid', duration: '15–20 min' }),
  V({ id: 'v-expat-prep', title: 'Comment préparer son expatriation ?', big: 'Préparer son départ', small: 'Le calendrier d’une expatriation', category: 'Expatriation', style: 'photo', photo: 4, duration: '15–20 min' }),
  V({ id: 'v-expat-fisc', title: 'Quelles conséquences fiscales anticiper avant de quitter la France ?', big: 'Avant de partir', small: 'Les conséquences fiscales', category: 'Expatriation', style: 'graphic', tone: 'navy', motif: 'steps', duration: '15–20 min' }),
  V({ id: 'v-expat-dest', title: 'Comment choisir sa destination ?', big: 'Choisir sa destination', small: 'Les critères qui comptent vraiment', category: 'Expatriation', style: 'graphic', tone: 'white', motif: 'list', duration: '15–20 min' }),
  V({ id: 'v-bq-choisir', title: 'Comment choisir ses solutions bancaires ?', big: 'Solutions bancaires', small: 'Comment choisir', category: 'Banque', style: 'photo', photo: 1, duration: '15–20 min' }),
  V({ id: 'v-bq-flux', title: 'Comment organiser ses flux financiers internationaux ?', big: 'Flux internationaux', small: 'Organiser ses encaissements', category: 'Banque', style: 'graphic', tone: 'navy', motif: 'flow', duration: '15–20 min' }),
  V({ id: 'v-bq-diff', title: 'Quelles difficultés bancaires anticiper ?', big: 'Difficultés bancaires', small: 'Ce qu’il faut anticiper', category: 'Banque', style: 'graphic', tone: 'white', motif: 'steps', duration: '15–20 min' }),
  V({ id: 'v-str-roles', title: 'Société d’exploitation, holding : comprendre le rôle de chaque structure', big: 'Le rôle de chaque structure', small: 'Exploitation, holding', category: 'Structuration', style: 'graphic', tone: 'white', motif: 'tree', duration: '15–20 min' }),
  V({ id: 'v-str-dev', title: 'Développer son activité à l’international : par où commencer ?', big: 'Se développer à l’international', small: 'Par où commencer', category: 'Structuration', style: 'photo', photo: 2, duration: '15–20 min' }),
]

export const YT_WELCOME: YtVideo = { id: 'v-welcome', title: 'Fynovates : le cabinet de conseil des entrepreneurs en ligne et internationaux', big: 'Bienvenue chez Fynovates', small: 'Le cabinet, sa mission, ses expertises', category: 'Le cabinet', style: 'photo', photo: 1, duration: '≈ 3 min' }

export const YT_SHORTS: YtShort[] = [
  { id: 's1', title: 'Une adresse à l’étranger ne suffit pas', big: 'Une adresse ne suffit pas', style: 'photo', photo: 3 },
  { id: 's2', title: 'Compte de paiement ou compte bancaire ?', big: 'Paiement ou banque ?', style: 'graphic', tone: 'navy' },
  { id: 's3', title: 'Trois questions avant de créer ta société', big: '3 questions avant de créer', style: 'graphic', tone: 'white' },
  { id: 's4', title: 'La résidence fiscale en 30 secondes', big: 'Résidence fiscale', style: 'photo', photo: 2 },
  { id: 's5', title: 'Avant de partir : la première question à se poser', big: 'Avant de partir', style: 'photo', photo: 4 },
  { id: 's6', title: 'Vendre en ligne : où se pose la question de la TVA ?', big: 'Vendre en ligne et TVA', style: 'graphic', tone: 'navy' },
]

export const YT_SECTIONS: { id: string; title: string; ids: string[] }[] = [
  { id: 'latest', title: 'Dernières vidéos', ids: ['v-expat', 'v-res-err', 'v-societe', 'v-banque', 'v-erreurs', 'v-structurer'] },
  { id: 'fisc', title: 'Fiscalité et optimisation internationale', ids: ['v-fisc-orga', 'v-fisc-online', 'v-res-comp', 'v-res-err'] },
  { id: 'expat', title: 'Expatriation', ids: ['v-expat-prep', 'v-expat-fisc', 'v-expat-dest', 'v-expat'] },
  { id: 'bank', title: 'Banque et paiements', ids: ['v-bq-choisir', 'v-bq-flux', 'v-bq-diff', 'v-banque'] },
  { id: 'struct', title: 'Structuration et entrepreneuriat international', ids: ['v-structurer', 'v-str-roles', 'v-str-dev', 'v-societe'] },
]

export const YT_DEFAULTS = {
  name: 'Fynovates',
  handle: '@identifiant',
  banner: {
    message: 'Le cabinet de conseil des entrepreneurs en ligne et internationaux.',
    domains: 'Fiscalité • Banque • Expatriation • Structuration internationale',
  },
  description:
    'Fynovates est un cabinet de conseil qui accompagne les entrepreneurs en ligne et les entrepreneurs internationaux.\n\nSur cette chaîne, nous expliquons simplement les sujets qui structurent une activité au-delà des frontières :\n• fiscalité et structuration internationale ;\n• comptabilité et obligations administratives ;\n• banque et solutions de paiement ;\n• expatriation et mobilité internationale.\n\nChaque semaine : une vidéo de fond, présentée par Tiziana, fondatrice et directrice du cabinet, ou par nos experts — et des Shorts pour retenir l’essentiel.\n\nLes vidéos sont des informations générales : chaque situation demande une analyse personnalisée.\n\nPour échanger avec le cabinet : prise de rendez-vous sur fynovates.com.',
  website: 'fynovates.com',
  welcome: {
    title: YT_WELCOME.title,
    pitch: 'Qui est Fynovates, quelle est sa mission, quels entrepreneurs le cabinet accompagne et sur quels sujets : la vidéo d’accueil des nouveaux visiteurs.',
  },
  cta: {
    video: 'Pour aller plus loin : regardez la vidéo suivante.',
    meeting: 'Votre situation demande une analyse ? Prenez rendez-vous avec le cabinet sur fynovates.com.',
  },
}
export type YtTexts = typeof YT_DEFAULTS

export const YT_TO_VALIDATE = [
  { what: 'Identifiant de la chaîne (@…)', why: 'Non fourni : affiché « @identifiant ».' },
  { what: 'Site web et prise de rendez-vous', why: 'fynovates.com repris des maquettes existantes : adresse et page de rendez-vous à confirmer.' },
  { what: 'Photos de Tiziana sur les miniatures', why: 'Issues du shooting studio du Drive : choix et droit d’usage à confirmer.' },
  { what: 'Experts présentés à l’écran', why: 'Identité et composition de l’équipe non fournies (playbook, décision D2).' },
  { what: 'Cadence de 2 à 3 vidéos longues par semaine', why: 'Objectif à terme : dépend des moyens de production (tournage, montage, relecture experte).' },
  { what: 'Logo en format rond', why: 'Le wordmark horizontal reste petit dans un cercle : un format court officiel (sans monogramme) serait plus lisible.' },
  { what: 'Contenus fiscaux, juridiques et comptables', why: 'Chaque vidéo validée par un expert compétent avant publication ; aucun chiffre sans source.' },
  { what: 'Bannière', why: 'Cette version ajoute le message et les domaines aux propositions existantes (IMG-010…) : choix final à arbitrer.' },
]
