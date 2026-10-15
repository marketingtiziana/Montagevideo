/**
 * Fynovates — « Rester en France, mais structuré »
 *
 * Le texte des 6 stories, et lui seul. La mise en page vit dans story.css,
 * le rendu et les contrôles dans build.mjs.
 *
 * Balisage dans les chaînes :
 *   {{doré}}    → <em>  couleur or    #D4AF37
 *   [[rouge]]   → <i>   couleur rouge #E05C5C
 *
 * Cinq gabarits :
 *   ouverture  — l'annonce à contre-courant, texte à gauche ancré en bas
 *   opposition — les deux camps face à face, chacun avec son verdict
 *   leviers    — la liste des leviers français, filet doré à gauche
 *   corps      — accroche + démonstration, texte à gauche ancré en bas
 *   cta        — texte centré autour du bloc GO
 */

export const TOTAL = 6;

export const STORIES = [
  {
    n: 1,
    layout: 'ouverture',
    bg: 'bg-1.jpg',
    accroche: "Je vais dire un truc qu'on n'attend pas de moi.",
    corps: [
      "Pour une partie d'entre vous, la meilleure décision fiscale de 2026, ce n'est pas de partir.",
      "C'est de {{rester}}. Et de se structurer correctement en France.",
    ],
  },
  {
    n: 2,
    layout: 'opposition',
    bg: 'bg-2.jpg',
    accroche:
      "Regarde ce qui se passe en ce moment. La destination star du « 0 % » est sous les frappes, " +
      "son immobilier se retourne, et les fortunes qui y étaient redéploient en urgence.",
    // L'ordre compte : le camp sanctionné d'abord, le camp calme en dernier.
    // C'est la dernière ligne que l'œil garde.
    camps: [
      { profil: "Ceux qui sont partis sur un coup de tête", verdict: "gèrent une crise", ton: 'rouge' },
      { profil: "Ceux qui sont restés structurés", verdict: "n'ont rien à gérer", ton: 'or' },
    ],
  },
  {
    n: 3,
    layout: 'leviers',
    bg: 'bg-3.jpg',
    accroche: "Et voilà ce que personne ne te dit.",
    corps: [
      "La France mal utilisée est [[un enfer fiscal]]. La France bien utilisée est {{très défendable}}.",
    ],
    leviers: [
      "Le bon statut",
      "Une holding au bon moment",
      "Un salaire calibré, pas un chiffre au feeling",
      "Les dispositifs que ton comptable n'active jamais",
    ],
    chute: "L'écart entre les deux ? {{Des dizaines de milliers d'euros par an.}} Sans bouger de chez toi.",
  },
  {
    n: 4,
    layout: 'corps',
    bg: 'bg-4.jpg',
    accroche: "Le vrai sujet n'a jamais été France ou étranger.",
    corps: [
      "C'est [[structure par défaut]] ou {{structure par choix}}.",
      "Un entrepreneur optimisé en France est dans une meilleure position que {{90 % des expatriés bricolés}}.",
      "Et le jour où il veut vraiment partir, son dossier propre rend le départ {{10 fois plus simple}}.",
    ],
  },
  {
    n: 5,
    layout: 'corps',
    bg: 'bg-5.jpg',
    accroche: "C'est exactement pour ça qu'on a ouvert un pôle France.",
    corps: [
      "Création, restructuration, compta, optimisation : la même rigueur qu'on applique à l'international, appliquée à ceux qui restent.",
      "Parce qu'une stratégie, ce n'est pas une destination. C'est {{une structure qui tient}}, où que tu sois.",
    ],
  },
  {
    n: 6,
    layout: 'cta',
    bg: 'bg-6.jpg',
    corps: [
      "Tu veux savoir ce que ta structure actuelle te coûte, et ce qu'une structure optimisée te rapporterait, {{sans quitter la France}} ?",
    ],
    cta: 'GO',
    consigne: "Commente GO et on regarde ta situation avec un advisor.",
  },
];
