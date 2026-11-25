import type { PlatformId } from '../types'

export interface DesignBlock {
  title: string
  imageIds: string[]
  /** Optional crop of the image (Tailwind classes), e.g. to show one part of a board. */
  crop?: string
  wide?: boolean
  specs: string[]
  warning?: string
}

/** Design de chaque compte : uniquement les visuels conçus pour cette plateforme. */
export const platformDesign: Record<PlatformId, DesignBlock[]> = {
  'ig-fn': [
    {
      title: 'Couvertures des Stories à la une',
      imageIds: ['IMG-019'],
      wide: true,
      specs: [
        'Fond bleu nuit #0D082E, plein cadre',
        'Cercle en filet fin clair, centré',
        'Intitulé en capitales espacées, blanc, graisse forte — aucune icône, aucun pictogramme',
        'Huit rubriques, dans cet ordre : BANQUE · CONTACT · ÉQUIPE · FISCALITÉ · INTERNATIONAL · LE CABINET · MÉTHODE · TVA',
      ],
      warning: 'ÉQUIPE et LE CABINET ne peuvent être alimentées qu’avec les informations réelles sur l’équipe et le cabinet (à fournir).',
    },
    {
      title: 'Gabarit Story — zones de sécurité et zone du sticker',
      imageIds: ['IMG-019'],
      crop: 'mx-auto aspect-[9/16] !w-auto h-[380px] object-cover object-right',
      specs: [
        'En-tête : wordmark FYNOVATES à gauche, rubrique à droite (ex. GUIDE), filet fin dessous',
        'Surtitre en capitales espacées (ex. SONDAGE), puis titre sur deux lignes',
        'Zone réservée au sticker (sondage, quiz, question) dans le tiers inférieur, encadrée',
        'Pied de page discret au-dessus du filet (ex. « Ta réponse reste anonyme pour les autres abonnés »)',
        'Rien d’important dans les bandes haute et basse : elles sont couvertes par l’interface Instagram',
      ],
    },
    {
      title: 'Profil et grille',
      imageIds: ['IMG-003'],
      specs: ['Bio : « Cabinet de conseil fiscal & structuration internationale »', 'Grille alternant photos désaturées et couvertures bleu nuit / blanc'],
      warning: 'La rubrique « Avis » de la maquette n’est pas validée : aucun témoignage réel fourni.',
    },
    {
      title: 'Publications',
      imageIds: ['IMG-004', 'IMG-005', 'IMG-006'],
      specs: ['1080 × 1350', 'Photo + titre sur blanc, couverture bleu nuit sur photo teintée, ou couverture de carrousel « Guide »'],
    },
    {
      title: 'Séquences Stories',
      imageIds: ['IMG-014', 'IMG-017', 'IMG-018'],
      specs: ['1080 × 1920, 5 écrans', 'Alternance fonds bleu nuit / gris clair', 'Dernier écran de conversion : « Échanger avec le cabinet »'],
    },
  ],
  'tt-fn': [
    {
      title: 'Couvertures de vidéos (variantes A / B)',
      imageIds: ['IMG-008', 'IMG-009'],
      specs: ['1080 × 1920', 'Wordmark + numéro « N° 01 », rubrique en capitales', 'Variante A bleu nuit, variante B beige', 'Un seul mot-clé mis en valeur'],
    },
    { title: 'Profil et grille', imageIds: ['IMG-007'], specs: ['Grille de couvertures numérotées, alternance des deux variantes'] },
  ],
  'li-fn': [
    {
      title: 'Infographies et carrousel PDF',
      imageIds: ['IMG-001'],
      wide: true,
      specs: ['Infographies 4:5 : en-tête wordmark + rubrique, titre fort, blocs, synthèse en aplat bleu nuit', 'Carrousel PDF 8 pages : couverture et conclusion bleu nuit, pages intérieures blanches'],
    },
  ],
  'yt-fn': [
    {
      title: 'Bannière de chaîne — propositions',
      imageIds: ['IMG-010', 'IMG-038', 'IMG-041', 'IMG-039', 'IMG-040', 'IMG-036', 'IMG-037'],
      wide: true,
      specs: [
        'Format 2560 × 1440 ; logo et texte dans la zone visible sur tous les écrans (centre, environ 1546 × 423)',
        'Conformes aux interdits du brief : « Pure wordmark » (IMG-010) et la proposition fond noir / sérif ivoire (IMG-037)',
        'Monogramme F à arbitrer : « Corporate prestige », « Expertise pédagogie », « Intelligence économique », « Média économique international », proposition à rayures',
        'Globe et carte du monde, contraires au brief : « Intelligence économique » et « Média économique international »',
        'Baselines : « Conseil fiscal & structuration internationale », « L’expertise au service de l’international », « Le monde des affaires internationales expliqué. », « Décrypter. Analyser. Comprendre. », « Comprendre les enjeux du business international. », « Fiscalité. Structure. Finance. International. », « L’expertise au service de votre entreprise. »',
      ],
      warning: 'Deux propositions vues dans le chat ne sont pas encore dans le Drive : fond à rayures (IMG-036) et fond noir / sérif ivoire (IMG-037).',
    },
    {
      title: 'Miniature',
      imageIds: ['IMG-011'],
      specs: ['1280 × 720', 'Titre deux lignes en capitales à gauche, sous-titre court', 'Portrait à droite, décor lié au sujet'],
      warning: 'La référence contient un monogramme F : interdit par la charte, à retirer. Identité de la personne à confirmer.',
    },
  ],
  'ig-tz': [
    {
      title: 'Planche du compte (proposition)',
      imageIds: ['IMG-002'],
      wide: true,
      specs: ['Feed : photographies uniquement', 'Stories : typographies natives Instagram', 'Stories à la une : uniquement À PROPOS DE MOI et MON CABINET'],
      warning: 'La planche affiche cinq Stories à la une : seules « À PROPOS DE MOI » et « MON CABINET » sont validées.',
    },
  ],
  'li-tz': [],
}
