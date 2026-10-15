/**
 * Fynovates — « Ton salaire est une décision ».
 * Six stories 1080 × 1920, noir sur blanc, une illustration au trait par story.
 *
 * Balisage inline :
 *   __mot__   → souligné d'un filet noir de 3px (le SEUL procédé de mise en valeur
 *               autorisé par la direction artistique : pas de couleur, pas de gras
 *               dans le corps de texte)
 *
 * `layout` :
 *   'gauche'  → composition par défaut : illustration en haut, texte aligné à gauche
 *   'centre'  → story 6 : une seule phrase centrée, moitié basse laissée vide
 */

export const TOTAL = 6;

export const STORIES = [
  {
    n: 1,
    illu: 'illu-1.png',
    layout: 'gauche',
    accroche: "Question que je pose souvent en appel : « pourquoi tu te verses ce montant-là, __précisément__ ? »",
    corps: [
      "Les réponses : « parce que j’ai besoin de ça pour vivre », « parce que mon comptable a dit ça », « je sais pas, j’ai mis un chiffre rond ».",
      "Aucune de ces réponses n’est une __stratégie__.",
    ],
  },
  {
    n: 2,
    illu: 'illu-2.png',
    layout: 'gauche',
    accroche: "Pourtant ce chiffre décide de presque tout.",
    corps: [
      "Combien tu paies de charges. Combien ta société garde. Ce que tu peux investir. Ta retraite. Et même la solidité d’un futur départ à l’étranger.",
      "C’est le __levier fiscal numéro 1__ que tu contrôles à 100%. Et tu l’as réglé __au feeling__.",
    ],
  },
  {
    n: 3,
    illu: 'illu-3.png',
    layout: 'gauche',
    accroche: "Deux entrepreneurs, même société, même bénéfice.",
    corps: [
      "L’un se verse tout en salaire : charges maximales, société vide en fin d’année.",
      "L’autre calibre : un salaire cohérent, le reste piloté ou réinvesti. À revenus égaux, __des dizaines de milliers d’euros d’écart__ sur une année.",
    ],
  },
  {
    n: 4,
    illu: 'illu-4.png',
    layout: 'gauche',
    accroche: "Et il n’y a pas UNE bonne réponse.",
    corps: [
      "Le bon montant dépend de ta structure, de ton statut, de tes projets, de ta situation familiale, et de si tu comptes partir un jour.",
      "C’est exactement pour ça que le copier-coller du chiffre d’un pote est __la pire méthode__.",
    ],
  },
  {
    n: 5,
    illu: 'illu-5.png',
    layout: 'gauche',
    // La plus épurée de la série : l'accroche et une seule ligne de corps, et
    // l'air entre les blocs élargi pour que ça respire au lieu de flotter.
    espace: { gouttiere: 136, interligne: 56 },
    accroche: "Ton salaire n’est pas ce qui reste. C’est __ce qui se décide__.",
    corps: [
      "Une fois par an minimum, ce chiffre mérite un vrai calcul. Pas un feeling.",
    ],
  },
  {
    n: 6,
    illu: 'illu-6.png',
    layout: 'centre',
    // Le sticker sondage Instagram viendra se poser dans la moitié basse : rien
    // ne descend sous 900px.
    accroche: "Alors dis-moi la vérité.",
    corps: [],
  },
];
