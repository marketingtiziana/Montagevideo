/**
 * Fynovates — « Ton salaire est une décision », version tout-texte.
 * Six stories 1080 × 1920, noir sur blanc, sans illustration.
 *
 * Balisage inline :
 *   __mot__   → souligné d'un filet noir de 3px (le SEUL procédé de mise en valeur
 *               autorisé par la direction artistique : pas de couleur, pas de gras
 *               dans le corps de texte)
 *
 * `layout` :
 *   'milieu'  → le bloc de texte est centré dans la story, sur les deux axes
 *   'haut'    → story 6 : le même centrage, remonté pour dégager la moitié basse
 *               où viendra se poser le sticker sondage Instagram
 */

export const TOTAL = 6;

export const STORIES = [
  {
    n: 1,
    layout: 'milieu',
    accroche: "Question que je pose souvent en appel : « pourquoi tu te verses ce montant-là, __précisément__ ? »",
    corps: [
      "Les réponses : « parce que j’ai besoin de ça pour vivre », « parce que mon comptable a dit ça », « je sais pas, j’ai mis un chiffre rond ».",
      "Aucune de ces réponses n’est une __stratégie__.",
    ],
  },
  {
    n: 2,
    layout: 'milieu',
    accroche: "Pourtant ce chiffre décide de presque tout.",
    corps: [
      "Combien tu paies de charges. Combien ta société garde. Ce que tu peux investir. Ta retraite. Et même la solidité d’un futur départ à l’étranger.",
      "C’est le __levier fiscal numéro 1__ que tu contrôles à 100%. Et tu l’as réglé __au feeling__.",
    ],
  },
  {
    n: 3,
    layout: 'milieu',
    accroche: "Deux entrepreneurs, même société, même bénéfice.",
    corps: [
      "L’un se verse tout en salaire : charges maximales, société vide en fin d’année.",
      "L’autre calibre : un salaire cohérent, le reste piloté ou réinvesti. À revenus égaux, __des dizaines de milliers d’euros d’écart__ sur une année.",
    ],
  },
  {
    n: 4,
    layout: 'milieu',
    accroche: "Et il n’y a pas UNE bonne réponse.",
    corps: [
      "Le bon montant dépend de ta structure, de ton statut, de tes projets, de ta situation familiale, et de si tu comptes partir un jour.",
      "C’est exactement pour ça que le copier-coller du chiffre d’un pote est __la pire méthode__.",
    ],
  },
  {
    n: 5,
    layout: 'milieu',
    // La plus épurée de la série : l'accroche et une seule ligne de corps, avec
    // un peu plus d'air entre les deux.
    espace: { interligne: 56 },
    accroche: "Ton salaire n’est pas ce qui reste. C’est __ce qui se décide__.",
    corps: [
      "Une fois par an minimum, ce chiffre mérite un vrai calcul. Pas un feeling.",
    ],
  },
  {
    n: 6,
    layout: 'haut',
    // Le sticker sondage Instagram viendra se poser dans la moitié basse : le
    // bloc est remonté et rien ne descend sous 900px.
    accroche: "Alors dis-moi la vérité.",
    corps: [],
  },
];
