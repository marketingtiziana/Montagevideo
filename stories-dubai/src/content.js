/**
 * Fynovates — « Dubaï, le stress test »
 *
 * Le texte des 6 stories, et lui seul. La mise en page vit dans story.css,
 * le rendu et les contrôles dans build.mjs.
 *
 * Balisage dans les chaînes :
 *   {{doré}}    → <em>  couleur or    #D4AF37
 *   [[rouge]]   → <i>   couleur rouge #E05C5C
 *
 * Quatre gabarits :
 *   ouverture — l'annonce, texte à gauche ancré en bas
 *   chiffres  — le relevé : trois valeurs géantes et leurs légendes
 *   corps     — accroche + démonstration, texte à gauche ancré en bas
 *   cta       — texte centré autour du bloc CODEX
 */

export const TOTAL = 6;

export const KICKER = 'Dubaï · Le stress test';

export const STORIES = [
  {
    n: 1,
    layout: 'ouverture',
    bg: 'bg-1.jpg',
    accroche: "Il se passe un truc historique en ce moment. Et presque personne n'en tire la leçon.",
    corps: [
      "Dubaï, la destination qu'on te vend depuis 5 ans comme LE refuge, vit son premier vrai {{stress test}}.",
      "Et les chiffres parlent.",
    ],
  },
  {
    n: 2,
    layout: 'chiffres',
    bg: 'bg-2.jpg',
    accroche: "Depuis le début de la guerre en Iran, des frappes sur le territoire émirien.",
    chiffres: [
      { valeur: '120 Md$', legende: "effacés en Bourse en un mois" },
      { valeur: '× 10',    legende: "le coût des assurances" },
      { valeur: '2020',    legende: "la dernière fois que l'immobilier s'était retourné" },
    ],
    corps: [
      "Le « havre de stabilité » était un argument marketing. [[Pas une garantie.]]",
    ],
  },
  {
    n: 3,
    layout: 'corps',
    bg: 'bg-3.jpg',
    accroche: "Regarde ce que font les grandes fortunes installées là-bas.",
    corps: [
      "Elles ne « tiennent bon ». Elles {{redéploient}} : Singapour, la Suisse, Monaco, le Panama. Les demandes de départ ont {{triplé}} au printemps.",
      "Ceux qui ont les meilleurs conseillers bougent les premiers. Toujours.",
    ],
  },
  {
    n: 4,
    layout: 'corps',
    bg: 'bg-4.jpg',
    accroche: "La vraie leçon, elle n'est pas « Dubaï c'est fini ».",
    corps: [
      "Les Émirats ne sont pas le Liban, et le 0% existe toujours.",
      "La leçon : le {{risque géopolitique}} est un critère de choix de destination. Et personne, PERSONNE ne le mettait dans les vidéos « pourquoi Dubaï ».",
      "Un taux d'impôt ne protège de rien quand [[la région s'embrase]].",
    ],
  },
  {
    n: 5,
    layout: 'corps',
    bg: 'bg-5.jpg',
    accroche: "Une expatriation sérieuse ne se construit jamais sur UNE destination à la mode.",
    corps: [
      "Elle se construit sur un comparatif : fiscalité, oui, mais aussi {{stabilité, visa, coût réel, plan B}}.",
      "Ceux qui avaient choisi sur Instagram révisent tout aujourd'hui. Ceux qui avaient comparé dorment tranquilles.",
    ],
  },
  {
    n: 6,
    layout: 'cta',
    bg: 'bg-6.jpg',
    corps: [
      "Les destinations stables, comparées sur les vrais critères, elles sont dans le CODEX. Y compris celles qui {{gagnent de l'afflux}} en ce moment.",
    ],
    cta: 'CODEX',
    consigne: "Commente CODEX et tu le reçois direct.",
  },
];
