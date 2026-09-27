/**
 * Fynovates — « Le quiz LLC ».
 * Six stories 1080 × 1920, composées entièrement en HTML/CSS : aucune image,
 * aucune illustration, aucune photo. La typographie EST le design.
 *
 * Balisage inline :
 *   ==mot==   → surligné au stabilo jaune #FFE24D (le SEUL accent de la série)
 *
 * `layout` :
 *   'cases'    → stories 1 et 6 : les quatre cases à cocher au-dessus du texte
 *   'question' → stories 2 à 5 : le « Q » géant, à position fixe sur les quatre
 *
 * `coches` (layout 'cases') : les cases cochées, par index.
 */

export const TOTAL = 6;

export const STORIES = [
  {
    n: 1,
    layout: 'cases',
    coches: [],
    accroche: "Avant d’acheter une LLC américaine, il y a un test de ==4 questions== à passer.",
    corps: [
      "Ceux qui vendent des LLC prient pour que tu ne le passes jamais.",
      "Parce que si tu ne sais pas répondre aux 4, ==tu n’es pas prêt==. Vérifie par toi-même.",
    ],
  },
  {
    n: 2,
    layout: 'question',
    q: 'Q1',
    accroche: "Ta LLC est au Wyoming, mais toi tu es dans ton salon à Lyon.",
    corps: [
      "Quel pays a le droit de taxer les bénéfices ?",
      "Et pourquoi ce n’est ==pas celui que tu crois== ?",
    ],
  },
  {
    n: 3,
    layout: 'question',
    q: 'Q2',
    accroche: "Ta LLC n’a rien encaissé cette année. Zéro.",
    corps: [
      "Qu’est-ce que tu dois quand même envoyer à l’IRS avant la deadline, et combien coûte l’oubli ?",
      "Indice : c’est un montant à ==5 chiffres==. Par année.",
    ],
  },
  {
    n: 4,
    layout: 'question',
    q: 'Q3',
    accroche: "On t’a vendu la LLC « pour avoir Stripe ».",
    corps: [
      "Quelles sont les ==2 alternatives plus simples== qui existaient pour ton cas, sans obligations américaines à vie ?",
    ],
  },
  {
    n: 5,
    layout: 'question',
    q: 'Q4',
    accroche: "Dans quel cas précis la LLC devient-elle réellement un des meilleurs outils au monde ?",
    corps: [
      "Parce que ==ce cas existe==.",
      "Et si tu le connais, tu sais exactement si c’est le tien ou pas.",
    ],
  },
  {
    n: 6,
    layout: 'cases',
    // Le doute visuel : deux réponses sur quatre.
    coches: [0, 1],
    accroche: "Si tu as répondu aux 4 sans hésiter : tu n’as pas besoin de moi.",
    corps: [
      "Sinon, j’ai fait une vidéo YouTube où les 4 réponses sont expliquées en détail, avec les cas concrets.",
      "Commente LLC et je t’envoie le lien direct.",
    ],
    // Le mot à taper, repris seul sur sa ligne sous le corps : la phrase dit
    // quoi faire, le mot géant est la chose à recopier.
    final: 'LLC',
  },
];

export const CASES = ['Question 1', 'Question 2', 'Question 3', 'Question 4'];
