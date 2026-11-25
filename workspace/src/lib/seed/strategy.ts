import type { Journey, MatrixRow, Rule } from '../types'
import { SRC, uid } from './helpers'

/* ---------------- Conversion journeys ---------------- */

export const journeys: Journey[] = [
  {
    id: 'J-DECOUVERTE',
    name: 'Découverte',
    summary: 'Story → Vidéo YouTube. Faire découvrir l’expertise par le contenu long, sans CTA commercial.',
    validation: 'VALIDÉ',
    steps: [
      { id: 's1', label: 'Story', detail: 'Story pédagogique sur une problématique', platform: 'ig-fn', x: 0, y: 0 },
      { id: 's2', label: 'Commentaire', detail: '« Commente et on t’envoie la vidéo YouTube complète »', platform: null, x: 280, y: 0 },
      { id: 's3', label: 'Envoi de la vidéo', detail: 'Simon transmet la vidéo correspondant à la problématique', platform: null, x: 560, y: 0 },
      { id: 's4', label: 'Vidéo YouTube', detail: 'Long format qui approfondit le sujet', platform: 'yt-fn', x: 840, y: 0 },
    ],
    edges: [
      { id: 'e1', from: 's1', to: 's2' },
      { id: 'e2', from: 's2', to: 's3' },
      { id: 'e3', from: 's3', to: 's4' },
    ],
  },
  {
    id: 'J-INTENTION',
    name: 'Intention commerciale',
    summary: 'Story → Prise de contact → Qualification. Réservé aux contenus à intention commerciale.',
    validation: 'VALIDÉ',
    steps: [
      { id: 's1', label: 'Story de conversion', detail: 'Séquence qui se termine par « Échanger avec le cabinet »', platform: 'ig-fn', x: 0, y: 0 },
      { id: 's2', label: 'Prise de contact', detail: 'Message, ou lien en bio vers le site / la prise de rendez-vous', platform: null, x: 300, y: 0 },
      { id: 's3', label: 'Qualification', detail: 'Analyse de la situation : critères de qualification À RENSEIGNER', platform: null, x: 600, y: 0 },
    ],
    edges: [
      { id: 'e1', from: 's1', to: 's2' },
      { id: 'e2', from: 's2', to: 's3' },
    ],
  },
  {
    id: 'J-BRANDING',
    name: 'Personal branding',
    summary: 'Story → Interaction avec Tiziana. Créer la relation avec la dirigeante.',
    validation: 'VALIDÉ',
    steps: [
      { id: 's1', label: 'Story Tiziana', detail: 'Photo, lieu, face caméra ou Story interactive', platform: 'ig-tz', x: 0, y: 0 },
      { id: 's2', label: 'Interaction', detail: 'Réponse, sondage, question, message à Tiziana', platform: 'ig-tz', x: 300, y: 0 },
    ],
    edges: [{ id: 'e1', from: 's1', to: 's2' }],
  },
]

/* ---------------- Rules ---------------- */

export const rules: Rule[] = [
  { id: uid('r'), scope: 'Conversion', text: 'Ne pas utiliser un CTA commercial partout.', validation: 'VALIDÉ' },
  {
    id: uid('r'),
    scope: 'Conversion',
    text: 'Arrêter les assets gratuits et calculateurs attirant des prospects insuffisamment qualifiés.',
    validation: 'VALIDÉ',
  },
  {
    id: uid('r'),
    scope: 'Conversion',
    text: 'Utiliser « Commente et on t’envoie la vidéo YouTube complète » lorsque pertinent.',
    validation: 'VALIDÉ',
  },
  { id: uid('r'), scope: 'Conversion', text: 'Simon transmet la vidéo correspondant à la problématique.', validation: 'VALIDÉ' },
  {
    id: uid('r'),
    scope: 'Conversion',
    text: 'Le lien en bio peut orienter vers le site ou la prise de rendez-vous.',
    validation: 'VALIDÉ',
  },
  {
    id: uid('r'),
    scope: 'Fidélité',
    text: 'Ne pas inventer : informations fiscales, partenariats, témoignages clients, données commerciales, photos de Tiziana, références visuelles, responsables.',
    validation: 'VALIDÉ',
  },
  {
    id: uid('r'),
    scope: 'Fidélité',
    text: 'Les cas clients sont toujours anonymisés. Les éléments évoqués en rendez-vous relevant d’une zone grise ne sont jamais publiés.',
    validation: 'VALIDÉ',
  },
  {
    id: uid('r'),
    scope: 'Fidélité',
    text: 'Toute information fiscale ou réglementaire passe par une validation technique avant publication.',
    validation: 'VALIDÉ',
  },
]

/* ---------------- Repurposing matrix ---------------- */

const cell = (angle: string, format: string, contentId: string | null = null) => ({ angle, format, contentId })

export const matrix: MatrixRow[] = [
  {
    id: 'M-BANQUE',
    order: 0,
    topic: 'Compte bancaire et financement',
    problemIds: ['PB-B01', 'PB-B05', 'PB-B06'],
    validation: 'VALIDÉ',
    source: SRC.brief,
    cells: {
      'yt-fn': cell('Analyse approfondie', 'Long format', 'FN-009'),
      'tt-fn': cell('Différences entre les comptes', 'Motion design', 'FN-025'),
      'ig-fn': cell('Explication pédagogique', 'Story', 'FN-005'),
      'li-fn': cell('Comparaison professionnelle', 'Carrousel', 'FN-020'),
      'ig-tz': cell('Réflexion personnelle', 'Reel ou Story', 'DB-004'),
      'li-tz': cell('Vision de dirigeante', 'Publication', 'DB-002'),
    },
  },
  {
    id: 'M-TVA',
    order: 1,
    topic: 'TVA et société étrangère',
    problemIds: ['PB-A01', 'PB-A05'],
    validation: 'STRATÉGIE PROPOSÉE',
    source: SRC.claude,
    cells: {
      'yt-fn': cell('Décryptage complet des critères', 'Long format', 'DB-003'),
      'tt-fn': cell('Les critères qui déterminent les obligations', 'Expert + motion design', 'FN-001'),
      'ig-fn': cell('Mécanisme en trois questions', 'Story', 'FN-006'),
      'li-fn': cell('Arbre de décision TVA', 'Infographie', 'FN-010'),
      'ig-tz': cell('Conviction : analyser avant de choisir un pays', 'Reel face caméra', 'TZ-001'),
      'li-tz': cell('Conviction : analyser avant de choisir un pays', 'Publication', 'TZ-001'),
    },
  },
  {
    id: 'M-RESIDENCE',
    order: 2,
    topic: 'Résidence fiscale',
    problemIds: ['PB-D01', 'PB-D02', 'PB-D10'],
    validation: 'STRATÉGIE PROPOSÉE',
    source: SRC.claude,
    cells: {
      'yt-fn': cell('183 jours : ce que la France vérifie', 'Long format', 'FN-040'),
      'tt-fn': cell('Les 3 critères à connaître', 'Motion design', 'FN-034'),
      'ig-fn': cell('Question reçue : partir ne suffit pas', 'Story', 'FN-002'),
      'li-fn': cell('Schéma d’analyse convergent', 'Infographie', 'FN-018'),
      'ig-tz': cell('Ce que je remarque chez ceux qui veulent s’expatrier', 'Reel', 'TZ-008'),
      'li-tz': cell('Ma vision de l’entrepreneuriat international', 'Publication', 'TZ-019'),
    },
  },
  {
    id: 'M-COACHING',
    order: 3,
    topic: 'Coaching et formation',
    problemIds: ['PB-A03'],
    validation: 'STRATÉGIE PROPOSÉE',
    source: SRC.claude,
    cells: {
      'yt-fn': cell('Qualifier son offre avant de facturer', 'Long format'),
      'tt-fn': cell('Coaching en direct ou formation enregistrée : même TVA ?', 'Motion design'),
      'ig-fn': cell('Question fiscale + réponse d’expert', 'Story', 'FN-008'),
      'li-fn': cell('Tableau comparatif 3 colonnes', 'Infographie', 'FN-012'),
      'ig-tz': cell('À RENSEIGNER', ''),
      'li-tz': cell('Ce que les entrepreneurs ne comprennent pas', 'Publication', 'TZ-016'),
    },
  },
  {
    id: 'M-IMMO',
    order: 4,
    topic: 'Immobilier',
    problemIds: ['PB-C04'],
    validation: 'STRATÉGIE PROPOSÉE',
    source: SRC.claude,
    cells: {
      'yt-fn': cell('Acheter en France en vivant à l’étranger', 'Long format'),
      'tt-fn': cell('L’origine des fonds, ce qui bloque', 'Motion design'),
      'ig-fn': cell('Cas client anonymisé en 5 Stories', 'Story', 'FN-003'),
      'li-fn': cell('Timeline des justificatifs', 'Infographie', 'FN-017'),
      'ig-tz': cell('À RENSEIGNER', ''),
      'li-tz': cell('Ce que je constate sur le terrain', 'Publication', 'TZ-018'),
    },
  },
  {
    id: 'M-TRESO',
    order: 5,
    topic: 'Trésorerie et rémunération',
    problemIds: ['PB-C01', 'PB-C02', 'PB-C05'],
    validation: 'STRATÉGIE PROPOSÉE',
    source: SRC.claude,
    cells: {
      'yt-fn': cell('Rémunération, dividendes : sortir l’argent sans erreur', 'Long format', 'FN-042'),
      'tt-fn': cell('L’argent de ta société n’est pas le tien', 'Motion design'),
      'ig-fn': cell('Parole d’expert comptable', 'Story', 'FN-007'),
      'li-fn': cell('Deux espaces et flux', 'Infographie', 'FN-015'),
      'ig-tz': cell('Ton entreprise peut gagner de l’argent sans que tu t’enrichisses', 'Reel', 'TZ-006'),
      'li-tz': cell('À RENSEIGNER', 'Publication'),
    },
  },
  {
    id: 'M-PATRIMOINE',
    order: 6,
    topic: 'Construction du patrimoine',
    problemIds: ['PB-C06', 'PB-C07'],
    validation: 'IDÉE À VALIDER',
    source: SRC.claude,
    cells: {
      'yt-fn': cell('Les étapes : entreprise, rémunération, patrimoine', 'Long format'),
      'tt-fn': cell('Holding : quand devient-elle rentable ?', 'Motion design', 'FN-024'),
      'ig-fn': cell('À RENSEIGNER', 'Story'),
      'li-fn': cell('À RENSEIGNER', 'Carrousel'),
      'ig-tz': cell('À RENSEIGNER', ''),
      'li-tz': cell('Vision de dirigeante', 'Publication'),
    },
  },
  {
    id: 'M-STRUCT',
    order: 7,
    topic: 'Structuration internationale',
    problemIds: ['PB-A09', 'PB-A10', 'PB-A11'],
    validation: 'STRATÉGIE PROPOSÉE',
    source: SRC.claude,
    cells: {
      'yt-fn': cell('Pourquoi choisir un pays avant d’analyser est dangereux', 'Décryptage', 'TZ-001'),
      'tt-fn': cell('LLC américaine : le vrai coût', 'Motion design', 'FN-033'),
      'ig-fn': cell('Structurer avant de facturer', 'Motion design', 'FN-026'),
      'li-fn': cell('7 questions avant de créer à l’étranger', 'Infographie', 'FN-019'),
      'ig-tz': cell('Une société étrangère n’est pas une solution universelle', 'Reel', 'TZ-002'),
      'li-tz': cell('Le point de vue de Tiziana', 'Publication', 'TZ-015'),
    },
  },
  {
    id: 'M-METHODE',
    order: 8,
    topic: 'Méthode Fynovates',
    problemIds: ['PB-E01', 'PB-E03', 'PB-E05'],
    validation: 'STRATÉGIE PROPOSÉE',
    source: SRC.claude,
    cells: {
      'yt-fn': cell('Comprendre plutôt que subir sa fiscalité', 'Long format'),
      'tt-fn': cell('À RENSEIGNER', ''),
      'ig-fn': cell('Coulisses d’un dossier en 5 Stories', 'Story', 'FN-004'),
      'li-fn': cell('Méthodologie', 'Étude de cas'),
      'ig-tz': cell('Ce que j’ai appris en dirigeant Fynovates', 'Reel', 'TZ-005'),
      'li-tz': cell('Construire Fynovates', 'Publication', 'TZ-017'),
    },
  },
]
