import type { PlatformId, Validation } from '../types'

/* Structures de posts inspirées d'un compte tiers, adaptées à la marque.
   Les captures sont des références internes : ne jamais republier leur contenu ni leurs chiffres. */

export interface PostStructure {
  id: string
  name: string
  when: string
  imageIds: string[]
  steps: string[]
  adaptation: string[]
  warning?: string
  validation: Validation
}

export interface InspirationAccount {
  platform: PlatformId
  label: string
  why: string
  profileImageId?: string
  profile?: string[]
  profileAdaptation?: string[]
  title?: string
  structures: PostStructure[]
}

export const inspirations: InspirationAccount[] = [
  {
    platform: 'li-tz',
    label: 'Dirigeant fondateur d’un family office (compte tiers)',
    why: 'Profil de dirigeant qui publie chaque jour des contenus concrets pour une cible de chefs d’entreprise : même logique que celle visée pour Tiziana (personne + cabinet, publication quotidienne).',
    profileImageId: 'IMG-043',
    profile: [
      'Bannière de marque : nom du cabinet, promesse en trois verbes, phrase de positionnement, site et contact — le tout à droite, hors de la photo',
      'Titre construit en blocs séparés par « | » : fonction, cabinet, preuve, légitimité, réseau',
      'Bouton « Prendre un rendez-vous » directement sous le profil',
      'Photo studio, cadrage serré, regard caméra',
    ],
    profileAdaptation: [
      'Titre de Tiziana déjà validé : aucune preuve chiffrée (type « +200 clients ») tant qu’elle n’est pas confirmée',
      'Bannière : logo officiel et baseline ; site et contact à ajouter seulement s’ils sont validés',
      'Bouton de prise de rendez-vous : option à valider (dépend des fonctionnalités du compte)',
    ],
    structures: [
      {
        id: 'decryptage',
        name: 'Décryptage d’une information qui circule',
        when: 'Une règle, une rumeur ou un visuel fait parler les entrepreneurs',
        imageIds: ['IMG-045'],
        steps: [
          'Accroche : reprendre l’affirmation telle qu’elle circule (« Une information circule : … »)',
          'Verdict en une ligne (vrai, faux, imprécis)',
          'La règle exacte, en 3 puces maximum, avec le texte et sa date d’effet',
          'Qui est concerné, qui ne l’est pas',
          'Cas concret anonymisé, chiffré seulement si les chiffres sont validés',
          'Conséquence pratique, puis chute courte',
          'Signature fixe',
        ],
        adaptation: [
          'Série « Ce que les entrepreneurs ne comprennent pas »',
          'Sujets : résidence fiscale, TVA, structuration, idées reçues sur l’expatriation',
          'Tiziana donne son regard de dirigeante ; la règle technique est validée par un expert Fynovates avant publication',
        ],
        warning: 'Aucune règle, date ni montant sans source officielle vérifiée.',
        validation: 'STRATÉGIE PROPOSÉE',
      },
      {
        id: 'actualite',
        name: 'Réaction à l’actualité',
        when: 'Une déclaration ou une décision publique touche les entrepreneurs',
        imageIds: ['IMG-044'],
        steps: ['Accroche : la citation entre guillemets', 'Contexte en une phrase', 'Lecture d’entrepreneur : ce que cela change concrètement', 'Point de vue personnel argumenté', 'Question ouverte pour les commentaires'],
        adaptation: [
          'Angle entrepreneurial et pédagogique, sans prise de position partisane',
          'Visuel : photo réelle de Tiziana ou visuel Fynovates — jamais une image de presse sans droits',
        ],
        warning: 'Sujet politique : à valider avant publication. Ne jamais attribuer à Fynovates une opinion personnelle de Tiziana.',
        validation: 'IDÉE À VALIDER',
      },
      {
        id: 'exemple-chiffre',
        name: 'Exemple chiffré en infographie',
        when: 'Montrer l’impact d’une décision (ordre des opérations, choix de structure)',
        imageIds: ['IMG-047'],
        steps: [
          'Titre-promesse : « [Sujet] : exemple pour [situation] »',
          'Infographie : le contexte, la solution, deux scénarios côte à côte',
          'Tableau comparatif, puis la conclusion en un chiffre',
          'Points d’attention obligatoires (conditions, risques, limites)',
          'Texte du post : l’enseignement en 3 lignes',
        ],
        adaptation: ['Infographie à la charte Fynovates (bleu nuit / blanc)', 'Cas anonymisé, hypothèses affichées', 'Toujours rappeler que chaque situation demande une analyse'],
        warning: 'Chiffres et calculs validés par un expert avant toute publication.',
        validation: 'STRATÉGIE PROPOSÉE',
      },
      {
        id: 'signature',
        name: 'Signature de fin de post',
        when: 'À la fin de chaque post',
        imageIds: ['IMG-046'],
        steps: ['Qui je suis et ce que je dirige', 'Pour qui', 'Ce que je publie et à quel rythme', '➡️ Appel à suivre'],
        adaptation: [
          'Proposition : « Je m’appelle Tiziana Caci. Je dirige Fynovates, un cabinet qui accompagne les entrepreneurs dans leurs projets de développement et d’organisation à l’international. Chaque jour, je partage ici mon regard sur les décisions qui façonnent le parcours d’un entrepreneur. ➡️ Suivez-moi pour ne rien manquer. »',
        ],
        validation: 'IDÉE À VALIDER',
      },
    ],
  },
  {
    platform: 'ig-tz',
    title: 'Comptes d’inspiration & structures de contenus',
    label: 'Entrepreneurs et cabinets sur Instagram (comptes tiers)',
    why: 'Stories à la première personne qui mêlent vie réelle (déplacements, événements, terrain) et prise de parole : la logique visée pour les Stories quotidiennes de Tiziana.',
    profileImageId: 'IMG-058',
    profile: [
      'Bio en deux lignes : la légitimité, puis ce que le compte apporte',
      'Un lien unique vers la prise de contact',
      'Stories à la une nommées par prénom : chacune regroupe le retour d’un client',
      'Onglet Reels mis en avant : une série reconnaissable au premier coup d’œil',
    ],
    profileAdaptation: [
      'Bio de Tiziana : « Fondatrice & directrice de @fynovates » et sa vision, sans titre ni diplôme non confirmé',
      'Stories à la une : seules « À PROPOS DE MOI » et « MON CABINET » sont validées ; aucune rubrique de témoignages tant qu’aucun retour réel et consenti n’existe',
      'Lien unique vers la prise de rendez-vous Fynovates',
    ],
    structures: [
      {
        id: 'manifeste',
        name: 'Manifeste sur photo réelle',
        when: 'Affirmer une conviction, une valeur, une façon de travailler',
        imageIds: ['IMG-050'],
        steps: [
          'Photo réelle en situation (déplacement, lieu de travail, ville)',
          'Titre court en sérif sur bandeau blanc',
          '3 à 4 lignes parallèles : « Je crois à …, mais pas à … »',
          'Aucun appel à l’action',
        ],
        adaptation: [
          'Convictions de Tiziana sur l’entrepreneuriat et la décision (ex. analyse avant la structure, rigueur, vision globale)',
          'Reprend le code déjà prévu pour ses Stories : texte sérif noir sur bandeaux blancs sur photographie',
        ],
        validation: 'STRATÉGIE PROPOSÉE',
      },
      {
        id: 'coulisses',
        name: 'Coulisses d’un déplacement ou d’un événement',
        when: 'Avant ou pendant un rendez-vous, un salon, un voyage professionnel',
        imageIds: ['IMG-051'],
        steps: ['Photo du lieu, sans mise en scène', 'Une phrase de contexte', 'Sticker de localisation', 'Éventuellement une deuxième Story le lendemain (l’événement lui-même)'],
        adaptation: ['Uniquement des déplacements et événements réels', 'Ne jamais montrer un client, un document ou un écran confidentiel'],
        validation: 'STRATÉGIE PROPOSÉE',
      },
      {
        id: 'sequence-texte',
        name: 'Séquence pédagogique en texte sur photo',
        when: 'Expliquer un sujet en 6 à 10 écrans (résidence fiscale, erreurs d’expatriation, méthode)',
        imageIds: ['IMG-052', 'IMG-053'],
        steps: [
          'Écran d’ouverture : le problème que vivent les entrepreneurs',
          'Écrans de développement : texte court en blanc sur photo assombrie, un mot-clé mis en valeur par écran',
          'Listes à puces ou à flèches pour les points clés',
          'Écran « méthode » : comment on aborde le sujet',
          'Dernier écran : sticker question ou invitation à écrire',
        ],
        adaptation: [
          'Voix de Tiziana à la première personne (« ce que je constate »), pas le discours du cabinet (« nous intervenons »)',
          'Mise en valeur en gras ou sur bandeau blanc : pas de couleur d’accent hors palette',
          'Aucune promesse de résultat (« expatriations sécurisées », « montages qui passent »)',
        ],
        warning: 'Toute règle fiscale citée est validée par un expert avant publication.',
        validation: 'STRATÉGIE PROPOSÉE',
      },
      {
        id: 'face-camera',
        name: 'Face caméra spontané',
        when: 'Partager une réflexion du moment, en marchant ou en déplacement',
        imageIds: ['IMG-054'],
        steps: ['Vidéo selfie, cadrage serré, son direct', 'Une idée, 15 à 30 secondes', 'Phrase clé en sous-titre sur bandeau blanc'],
        adaptation: ['Ton naturel, tutoiement ou vouvoiement selon l’arbitrage de la charte', 'Sous-titres obligatoires (Stories souvent vues sans le son)'],
        validation: 'STRATÉGIE PROPOSÉE',
      },
      {
        id: 'feed-lifestyle',
        name: 'Feed photographique lifestyle professionnel',
        when: 'Publications du feed',
        imageIds: ['IMG-055', 'IMG-042'],
        steps: [
          'Uniquement des photographies réelles, sans texte incrusté',
          'Alternance : prise de parole et événements, réunions, déplacements, moments de vie, lieux',
          'Photos prises par un tiers plutôt que des selfies, lumière naturelle',
          'Étalonnage cohérent d’une photo à l’autre',
        ],
        adaptation: [
          'Confirme la règle du feed de Tiziana : photographies réelles uniquement, pas de logo ni d’infographie',
          'Base disponible : shootings du dossier « PHOTOS Tiziana » du Drive',
        ],
        warning: 'Photos d’agence (type Getty) ou d’un tiers : droits à vérifier avant publication.',
        validation: 'STRATÉGIE PROPOSÉE',
      },
      {
        id: 'vocal-client',
        name: 'Retour client en message vocal',
        when: 'Un client envoie spontanément un retour',
        imageIds: ['IMG-056'],
        steps: ['Fond sombre uni', 'Une phrase de contexte (« Petit retour d’un client ce matin »)', 'Le message vocal en lecture', 'Sticker lien vers la prise de contact'],
        adaptation: [
          'Uniquement un retour réel, avec l’accord écrit du client',
          'Anonymisé : aucun nom, aucune information sur sa situation',
          'Lien vers la page de contact ou le rendez-vous Fynovates',
        ],
        warning: 'Aucun témoignage fourni à ce jour : ne jamais en créer ni en reformuler un. Format à activer seulement avec un retour réel et consenti.',
        validation: 'IDÉE À VALIDER',
      },
      {
        id: 'reel-pov',
        name: 'Série de Reels « POV » face caméra',
        when: 'Réagir à une question fréquente, une actualité, une idée reçue',
        imageIds: ['IMG-059', 'IMG-060'],
        steps: [
          'Titre « POV : … » sur bandeau blanc en haut de l’écran, toujours au même endroit',
          'Face caméra, cadrage serré, réponse dès la première phrase',
          'Sous-titres en bas, phrase par phrase',
          'Décor récurrent qui situe la personne (bureau, déplacement)',
          'Épisodes numérotés (« partie 1, 2, 3 ») quand le sujet est long',
        ],
        adaptation: [
          'Titres d’entrepreneurs : « POV : on te dit qu’une société à l’étranger suffit », « POV : tu pars vivre à l’étranger le mois prochain »',
          'Titre en sérif sur bandeau blanc, comme les Stories de Tiziana',
          'Décors réels : son bureau, ses déplacements — jamais de document client à l’écran',
        ],
        warning: 'Aucune référence à un diplôme, un titre ou des résultats non confirmés.',
        validation: 'STRATÉGIE PROPOSÉE',
      },
      {
        id: 'reel-micro',
        name: 'Reel face caméra au micro',
        when: 'Une idée forte en 30 à 60 secondes',
        imageIds: ['IMG-057'],
        steps: [
          'Face caméra au micro, plan fixe',
          'Titre-question sur bandeau blanc, sous-titre court entre parenthèses',
          'Sous-titres dynamiques en capitales',
          'Une seule idée, réponse dans les premières secondes',
        ],
        adaptation: [
          'Questions d’entrepreneurs : « Pourquoi ta société étrangère ne fait pas de toi un non-résident », etc.',
          'Décor sobre (bureau, bibliothèque), tenue professionnelle',
          'Titre en sérif sur bandeau blanc pour rester dans les codes de Tiziana',
        ],
        warning: 'Tout contenu fiscal validé par un expert avant publication.',
        validation: 'STRATÉGIE PROPOSÉE',
      },
    ],
  },
]

export const inspirationFor = (p: PlatformId) => inspirations.find((i) => i.platform === p)
