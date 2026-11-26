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
  profileImageId: string
  profile: string[]
  profileAdaptation: string[]
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
]

export const inspirationFor = (p: PlatformId) => inspirations.find((i) => i.platform === p)
