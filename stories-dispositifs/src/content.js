/**
 * Fynovates — « Les dispositifs que personne n'active »
 *
 * Le texte des 6 stories, et lui seul. La mise en page vit dans story.css,
 * le rendu et les contrôles dans build.mjs.
 *
 * Balisage dans les chaînes :
 *   {{doré}}    → <em>  couleur or    #D4AF37
 *   [[rouge]]   → <i>   couleur rouge #E05C5C
 *
 * Quatre gabarits :
 *   ouverture  — la phrase interdite, texte à gauche ancré en bas
 *   exemple    — étiquette « Exemple N », question, dispositifs nommés, chute
 *   deux       — les deux fiscalités françaises, l'une sous l'autre
 *   cta        — texte centré autour du bloc GO
 *
 * Le gabarit « exemple » porte les stories 2, 3 et 4 : c'est lui qui fait la
 * série. Un dispositif = un nom (ce qu'on demande à son conseil) + un effet
 * (ce que ça produit). Jamais de chiffre inventé ici : les montants et taux
 * exacts dépendent de la situation, la story nomme le levier et s'arrête là.
 */

export const TOTAL = 6;

export const STORIES = [
  {
    n: 1,
    layout: 'ouverture',
    bg: 'bg-1.jpg',
    accroche: "Phrase interdite sur ce compte : « la France est un paradis fiscal ».",
    corps: [
      "Pas pour tout le monde. Pour ceux qui {{savent lire les règles}}.",
      "Laisse-moi te montrer ce que ton comptable n'active jamais.",
    ],
  },
  {
    n: 2,
    layout: 'exemple',
    bg: 'bg-2.jpg',
    etiquette: 'Exemple 1',
    accroche: "Tu crées une boîte innovante ?",
    dispositifs: [
      { nom: 'Statut JEI', effet: "Exonération d'une grande partie des charges sociales pendant des années." },
      { nom: 'Crédit Impôt Recherche', effet: "Remboursement d'une partie de tes dépenses de R&D." },
    ],
    chute: "Des entrepreneurs étrangers viennent {{en France}} pour ça. Pendant que des Français partent sans avoir regardé.",
  },
  {
    n: 3,
    layout: 'exemple',
    bg: 'bg-3.jpg',
    etiquette: 'Exemple 2',
    accroche: "Tu revends ta boîte un jour ?",
    dispositifs: [
      { nom: 'Apport-cession', effet: "Report de l'impôt sur la plus-value si tu réinvestis, via une holding." },
      { nom: 'Pacte Dutreil', effet: "La facture divisée par quatre sur une transmission familiale." },
    ],
    chute: "Des dispositifs que les fiscalités « simples » des pays à la mode n'ont même pas.",
  },
  {
    n: 4,
    layout: 'exemple',
    bg: 'bg-4.jpg',
    etiquette: 'Exemple 3',
    accroche: "Et puis il y a le quotidien.",
    // Trois entrées ici contre deux ailleurs : c'est le gabarit le plus chargé
    // de la série, et donc celui qui fixe la hauteur des effets dans story.css.
    dispositifs: [
      { nom: 'Holding', effet: "L'argent circule entre tes sociétés quasi sans frottement." },
      { nom: 'Salaire calibré', effet: "Un montant construit, pas un chiffre au feeling." },
      { nom: 'PEA', effet: "Plus-values exonérées après cinq ans." },
    ],
    chute: "Rien d'exotique. {{Tout est dans le code.}} Personne ne l'ouvre.",
  },
  {
    n: 5,
    layout: 'deux',
    bg: 'bg-5.jpg',
    accroche: "Le vrai sujet : la France a deux fiscalités.",
    // L'ordre compte : celle qu'on subit d'abord, celle qu'on choisit en
    // dernier. C'est la dernière que l'œil garde.
    fiscalites: [
      { nom: 'Par défaut',     qualif: 'brutale',    pour: 'pour ceux qui subissent',   ton: 'rouge' },
      { nom: 'Par conception', qualif: 'redoutable', pour: 'pour ceux qui structurent', ton: 'or' },
    ],
    chute: "La différence entre les deux n'est pas la chance. C'est de s'être posé la question {{une fois, sérieusement}}.",
  },
  {
    n: 6,
    layout: 'cta',
    bg: 'bg-6.jpg',
    corps: [
      "Tu veux savoir dans laquelle des deux tu es, et ce que la version optimisée donnerait pour {{ta situation}} ?",
    ],
    cta: 'GO',
    consigne: "Commente GO et on regarde ça avec un advisor.",
  },
];
