/**
 * Fynovates — « Le client qui a annulé son départ ».
 * Séquence narrative en 6 chapitres, close par un CTA d'appel diagnostic.
 *
 * Balisage inline :
 *   {{mot}}   → doré  #D4AF37, même graisse que le contexte
 *   [[mot]]   → rouge #E05C5C
 *   //mot//   → italique
 *
 * `layout` :
 *   'bas'     → composition documentaire par défaut : texte ancré en bas
 *   'centre'  → story 4, le pivot : texte remonté au centre, ambiance plus sombre
 *   'cta'     → story 6 : tout centré, bloc GO
 */

export const TOTAL = 6;

export const STORIES = [
  {
    n: 1,
    bg: 'bg-1.jpg',
    layout: 'bas',
    accroche: "Le mois dernier, on a conseillé à un client de {{ne pas s’expatrier}}.",
    corps: [
      "Oui, nous. Le cabinet dont c’est le métier.",
      "Et cette histoire dit tout sur pourquoi nos appels existent.",
    ],
  },
  {
    n: 2,
    bg: 'bg-2.jpg',
    layout: 'bas',
    accroche: "E-commerçant, 35k par mois, décidé à partir à Dubaï.",
    corps: [
      "Billet regardé, société presque montée ailleurs. Il venait nous voir pour « finaliser ».",
      "En {{20 minutes}} d’appel, on a vu ce que personne ne lui avait dit.",
    ],
  },
  {
    n: 3,
    bg: 'bg-3.jpg',
    layout: 'bas',
    accroche: "{{Trois choses}}, précisément.",
    corps: [
      "Une TVA européenne jamais gérée depuis 2 ans : partir, c’était emporter le problème et le laisser grossir.",
      "Une compagne restée en France : sa résidence fiscale n’aurait [[jamais tenu]].",
      "Un cash-flow trop juste pour le coût de vie réel de Dubaï.",
    ],
  },
  {
    n: 4,
    bg: 'bg-4.jpg',
    layout: 'centre',
    accroche: "Partir dans ces conditions, c’était le pire scénario.",
    corps: [
      "Le train de vie Dubaï, les obligations françaises toujours actives, un contrôle quasi certain dans les 3 ans.",
      "Son « départ de rêve » était [[un piège à 6 chiffres]]. Monté par lui-même, sans le savoir.",
    ],
  },
  {
    n: 5,
    bg: 'bg-5.jpg',
    layout: 'bas',
    accroche: "On lui a dit : pas comme ça. Pas maintenant.",
    corps: [
      "Régularise ta TVA, structure-toi proprement pendant 12 mois, et pars l’année prochaine dans de bonnes conditions. Il repart avec un plan. Pas celui qu’il voulait. {{Celui qui tient}}.",
      "Sa phrase en raccrochant : //« c’est le premier appel où on ne m’a pas vendu le départ. »//",
    ],
  },
  {
    n: 6,
    bg: 'bg-6.jpg',
    layout: 'cta',
    accroche: "Parfois la réponse est « pars ». Parfois « pas encore ». Parfois « pas comme ça ».",
    corps: [
      "30 minutes avec un tax advisor, et tu sais laquelle est la tienne.",
      "Commente {{GO}} et on t’envoie les infos pour réserver.",
    ],
    cta: 'GO',
  },
];
