/**
 * CONTENU DES 16 SLIDES — Carousel "Moyen-Orient"
 *
 * !!! ATTENTION !!!
 * Les textes ci-dessous sont des TEXTES PROVISOIRES de maquettage.
 * Le brief contenait encore le placeholder "[COLLE ICI LE TEXTE DES 16 SLIDES]".
 * Remplacer chaque `title` / `subtitle` / `body` par le texte validé,
 * SANS toucher à la structure. Puis relancer : npm run all
 *
 * MARQUAGE TYPOGRAPHIQUE DANS LE TEXTE
 *   **texte**  -> Inter Black 900, blanc   (chiffres cles : 108 dollars, 2,12 EUR, 9%...)
 *   *texte*    -> Inter 600, blanc         (noms propres / termes techniques : Ormuz, QFZP...)
 *   texte nu   -> Inter 400, #A8B0C8
 *
 * GABARITS
 *   'A'   couverture plein ecran + overlay navy 75%        (slide 1)
 *   'B'   texte seul sur navy plein                        (majorite)
 *   'C'   bandeau illustration 520px + texte               (slides 2, 3, 5, 9, 15)
 *   'CTA' fond indigo plein, texte navy centre             (slide 16)
 *
 * BLOCS `body`
 *   { p: "paragraphe" }
 *   { ul: ["item", "item"] }   -> puces carrees indigo 8x8
 */

const PROVISOIRE = true; // passer a false une fois les vrais textes colles

module.exports = {
  PROVISOIRE,
  slides: [
    {
      n: 1,
      tpl: 'A',
      img: 'img-01-cover.jpg',
      title: 'Titre de couverture provisoire sur deux lignes',
      subtitle: 'Sous-titre provisoire de la slide de couverture'
    },
    {
      n: 2,
      tpl: 'C',
      img: 'img-02-detroit.jpg',
      title: 'Titre provisoire slide 2',
      body: [
        { p: 'Texte provisoire de mise en page. Le detroit d *Ormuz* concentre une part decisive du trafic maritime mondial.' },
        { p: 'Chaque jour, **20 millions** de barils transitent par un couloir large de **39 kilometres** seulement.' }
      ]
    },
    {
      n: 3,
      tpl: 'C',
      img: 'img-03-pompe.jpg',
      title: 'Titre provisoire slide 3',
      body: [
        { p: 'Texte provisoire. Le baril est passe a **108 dollars** en quelques semaines.' },
        { p: 'A la pompe, cela se traduit par **2,12 EUR** le litre, soit une hausse de **27%** sur le trimestre.' }
      ]
    },
    {
      n: 4,
      tpl: 'B',
      title: 'Titre provisoire slide 4',
      body: [
        { p: 'Texte provisoire de mise en page pour verifier le rythme typographique du gabarit B.' },
        { ul: [
          'Premier point provisoire avec un chiffre cle a **9%**',
          'Deuxieme point provisoire mentionnant le *Small Business Relief*',
          'Troisieme point provisoire sur le seuil de **375 000 AED**'
        ]}
      ]
    },
    {
      n: 5,
      tpl: 'C',
      img: 'img-05-fret.jpg',
      title: 'Titre provisoire slide 5',
      body: [
        { p: 'Texte provisoire. Le cout d un conteneur quarante pieds atteint **4 300$** sur les routes Asie vers Europe.' },
        { p: 'Les compagnies repercutent une surcharge moyenne de **5%** sur l ensemble des contrats.' }
      ]
    },
    {
      n: 6,
      tpl: 'B',
      title: 'Titre provisoire slide 6',
      body: [
        { p: 'Texte provisoire de mise en page. Ce paragraphe sert uniquement a calibrer la hauteur disponible du gabarit B.' },
        { p: 'Il sera remplace par le texte valide sans aucune reformulation.' }
      ]
    },
    {
      n: 7,
      tpl: 'B',
      title: 'Titre provisoire slide 7',
      body: [
        { p: 'Texte provisoire. La regle de *de minimis* s applique sous conditions strictes.' },
        { ul: [
          'Condition provisoire numero un',
          'Condition provisoire numero deux',
          'Condition provisoire numero trois'
        ]}
      ]
    },
    {
      n: 8,
      tpl: 'B',
      title: 'Titre provisoire slide 8',
      body: [
        { p: 'Texte provisoire de mise en page pour la slide huit du carousel.' },
        { p: 'Le statut *QFZP* reste conditionne au respect permanent des criteres de substance.' }
      ]
    },
    {
      n: 9,
      tpl: 'C',
      img: 'img-09-dubai.jpg',
      title: 'Titre provisoire slide 9',
      body: [
        { p: 'Texte provisoire. Une *free zone* bien choisie change entierement l equation fiscale.' },
        { p: 'Le taux applicable descend a **9%** au dela du seuil, contre **0%** en dessous.' }
      ]
    },
    {
      n: 10,
      tpl: 'B',
      title: 'Titre provisoire slide 10',
      body: [
        { p: 'Texte provisoire de mise en page pour la slide dix.' },
        { p: 'Le recours a un *CPA* devient indispensable des le premier exercice.' }
      ]
    },
    {
      n: 11,
      tpl: 'B',
      title: 'Titre provisoire slide 11',
      body: [
        { p: 'Texte provisoire. La date butoir est fixee au **31 decembre 2026**.' },
        { ul: [
          'Echeance provisoire numero un',
          'Echeance provisoire numero deux'
        ]}
      ]
    },
    {
      n: 12,
      tpl: 'B',
      title: 'Titre provisoire slide 12',
      body: [
        { p: 'Texte provisoire de mise en page pour la slide douze du carousel.' },
        { p: 'Ce bloc verifie le comportement de l auto ajustement typographique.' }
      ]
    },
    {
      n: 13,
      tpl: 'B',
      title: 'Titre provisoire slide 13',
      body: [
        { p: 'Texte provisoire. Trois leviers restent actionnables immediatement.' },
        { ul: [
          'Levier provisoire numero un',
          'Levier provisoire numero deux',
          'Levier provisoire numero trois'
        ]}
      ]
    },
    {
      n: 14,
      tpl: 'B',
      title: 'Titre provisoire slide 14',
      body: [
        { p: 'Texte provisoire de mise en page pour la slide quatorze.' },
        { p: 'Le texte valide viendra remplacer ce paragraphe a l identique.' }
      ]
    },
    {
      n: 15,
      tpl: 'C',
      img: 'img-15-final.jpg',
      title: 'Titre provisoire slide 15',
      body: [
        { p: 'Texte provisoire de conclusion avant l appel a l action.' },
        { p: 'La fenetre de decision se referme au **31 decembre 2026**.' }
      ]
    },
    {
      n: 16,
      tpl: 'CTA',
      title: 'Appel a l action provisoire'
    }
  ]
};
