/**
 * Contenu éditorial de la séquence « Les 3 phrases de fin d'appel » — Fynovates.
 *
 * Balisage inline disponible dans chaque chaîne :
 *   {{mot}}   → doré  #D4AF37
 *   [[mot]]   → rouge #E05C5C
 *   **mot**   → gras blanc
 *
 * Types de blocs :
 *   badge  26px uppercase letter-spacing 3px, doré
 *   quote  citation, 64-72px bold
 *   lead   accroche, 42px
 *   body   corps, 38px
 *   cta    « GO » encadré doré (story 6)
 */

export const TOTAL = 6;

export const STORIES = [
  {
    n: 1,
    bg: 'bg-1.png',
    blocks: [
      { type: 'lead', text: "Il y a {{3 phrases}} qui reviennent tout le temps à la fin de nos appels diagnostic." },
      { type: 'body', text: "Toujours les mêmes. Peu importe le profil, le CA, le pays." },
      { type: 'body', text: "Je te les donne, elles disent tout." },
    ],
  },
  {
    n: 2,
    bg: 'bg-2.png',
    blocks: [
      { type: 'badge', text: 'Phrase 1/3' },
      { type: 'quote', text: "« Pourquoi personne ne m’a dit ça avant ? »" },
      { type: 'body', text: "Parce qu’en 30 minutes, on regarde ta situation réelle. Structure, résidence, TVA, flux." },
      { type: 'body', text: "Et il y a presque toujours un truc que ni le comptable, ni YouTube, ni le pote à Dubaï n’avait vu." },
    ],
  },
  {
    n: 3,
    bg: 'bg-3.png',
    blocks: [
      { type: 'badge', text: 'Phrase 2/3' },
      { type: 'quote', text: "« En fait je m’inquiétais pour la mauvaise chose. »" },
      { type: 'body', text: "Les gens arrivent stressés par leur taux d’impôt." },
      { type: 'body', text: "Ils repartent en ayant compris que leur vrai sujet c’était la TVA, la résidence fiscale, ou une LLC oubliée." },
      { type: 'body', text: "[[Le danger n’était pas où ils regardaient.]]" },
    ],
  },
  {
    n: 4,
    bg: 'bg-4.png',
    blocks: [
      { type: 'badge', text: 'Phrase 3/3' },
      { type: 'quote', text: "« Ok, et maintenant on fait quoi ? »" },
      { type: 'body', text: "C’est la meilleure. Après l’appel, tu sais exactement où tu en es : ce qui va, ce qui ne va pas, et dans quel ordre traiter." },
      { type: 'body', text: "Certains continuent avec nous. D’autres repartent juste avec {{la clarté}}. Les deux sont ok." },
    ],
  },
  {
    n: 5,
    bg: 'bg-5.png',
    blocks: [
      { type: 'lead', text: "L’appel est fait pour les entrepreneurs qui ont un business qui tourne et qui veulent structurer ou partir proprement." },
      { type: 'body', text: "{{30 minutes}} avec un {{tax advisor}} de l’équipe. Ta situation, tes chiffres, tes options." },
      { type: 'body', text: "Pas de blabla, pas de plaquette commerciale." },
    ],
  },
  {
    n: 6,
    bg: 'bg-6.png',
    blocks: [
      { type: 'lead', text: "Tu veux ta place ?" },
      { type: 'body', text: "Commente {{GO}} et on t’envoie les infos pour réserver ton créneau." },
      { type: 'body', text: "Les créneaux partent vite, on en prend peu pour faire chaque appel sérieusement." },
      { type: 'cta', text: 'GO' },
    ],
  },
];
