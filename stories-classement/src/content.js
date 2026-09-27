/**
 * Fynovates — « Le classement des pires conseils fiscaux d'Instagram »
 *
 * Le texte des 6 stories, et lui seul. La mise en page vit dans story.css,
 * le rendu et les contrôles dans build.mjs.
 *
 * Balisage dans les chaînes :
 *   {{doré}}    → <em>  couleur or   #D4AF37
 *   [[rouge]]   → <i>   couleur rouge #E05C5C
 *
 * Trois gabarits :
 *   ouverture — annonce du classement, texte à gauche, ancré en bas
 *   rang      — N°4 à N°1 : numéro géant, filet doré, citation, démontage
 *   faq       — texte centré, ancré dans le tiers haut (sticker questions en bas)
 */

export const TOTAL = 6;

export const KICKER = 'Le classement · Conseils toxiques';

export const STORIES = [
  {
    n: 1,
    layout: 'ouverture',
    bg: 'bg-1.jpg',
    accroche: "J'ai fait un classement.",
    corps: [
      "Les {{4 pires conseils}} fiscaux que je vois passer sur Instagram. Ceux qui coûtent le plus cher à ceux qui les suivent.",
      "Du moins grave au plus dangereux. C'est parti.",
    ],
  },
  {
    n: 2,
    layout: 'rang',
    bg: 'bg-2.jpg',
    rang: 'N°4',
    citation: "« Passe tout en frais pro, personne ne vérifie. »",
    corps: [
      "Si. On vérifie. Et un train de vie déguisé en charges, c'est le redressement le plus facile à faire pour un contrôleur.",
      "Chaque dépense doit avoir un lien réel avec l'activité. Le reste, c'est un rattrapage avec [[majorations]] qui t'attend.",
    ],
  },
  {
    n: 3,
    layout: 'rang',
    bg: 'bg-3.jpg',
    rang: 'N°3',
    citation: "« Reste moins de 183 jours en France et tu ne paies plus rien. »",
    corps: [
      "Les 183 jours ne sont qu'{{UN critère parmi quatre}}. Ta famille à Paris, tes clients français, ton argent en France : un seul suffit à te garder résident fiscal.",
      "Des gens organisent leur vie entière autour d'un compteur de jours qui ne les protège de rien.",
    ],
  },
  {
    n: 4,
    layout: 'rang',
    bg: 'bg-4.jpg',
    rang: 'N°2',
    citation: "« Monte une LLC américaine, c'est 0% et invisible. »",
    corps: [
      "Une LLC gérée depuis ton salon en France est imposable en France. Et elle n'a jamais été invisible : tu l'as toi-même enregistrée à l'IRS.",
      "Bonus caché : un formulaire annuel obligatoire dont l'oubli coûte jusqu'à [[25 000 dollars]]. Par année.",
    ],
  },
  {
    n: 5,
    layout: 'rang',
    bg: 'bg-5.jpg',
    rang: 'N°1',
    citation: "« Fais-le d'abord, tu régulariseras si on te demande. »",
    corps: [
      "C'est l'inverse absolu de comment la fiscalité fonctionne. Régulariser APRÈS, c'est majorations, intérêts, et parfois activité occulte.",
      "Tout ce qui est simple avant devient cher après. [[Sans exception]].",
    ],
  },
  {
    n: 6,
    layout: 'faq',
    bg: 'bg-6.jpg',
    accroche:
      "Le point commun de ces 4 conseils : ils viennent de gens qui ne seront pas là le jour du contrôle.",
    corps: [
      "Alors on inverse. Aujourd'hui, c'est toi qui demandes, et c'est {{une experte qui répond}}.",
      "Pose ta question fiscale ici. La vraie, celle que tu n'oses poser nulle part. Je réponds en story.",
    ],
  },
];
