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
 *   { schema: { type: ... } }  -> schema de donnees, gabarit B uniquement
 *
 * SCHEMAS DISPONIBLES (voir schemas.js et README.md)
 *   kpi       1 a 3 chiffres cles. 1 entree = chiffre heros, 2 ou 3 = tuiles
 *   bars      1 a 5 barres horizontales, comparaison de grandeurs
 *   meter     une jauge face a un seuil
 *   steps     2 a 4 etapes enchainees
 *   timeline  2 a 4 jalons dates
 *   compare   exactement 2 colonnes, avant contre apres
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
        { p: 'Texte provisoire. Demonstration du schema kpi en trois tuiles.' },
        { schema: { type: 'kpi', items: [
          { value: '9%', label: 'Taux provisoire au dela du seuil' },
          { value: '0%', label: 'Taux provisoire en dessous' },
          { value: '27%', label: 'Variation provisoire sur le trimestre' }
        ]}}
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
        { p: 'Texte provisoire. Demonstration du schema bars, serie unique.' },
        { schema: { type: 'bars', items: [
          { label: 'Libelle provisoire un', value: 4300, display: '4 300$' },
          { label: 'Libelle provisoire deux', value: 2650, display: '2 650$' },
          { label: 'Libelle provisoire trois', value: 1400, display: '1 400$' }
        ]}}
      ]
    },
    {
      n: 7,
      tpl: 'B',
      title: 'Titre provisoire slide 7',
      body: [
        { p: 'Texte provisoire. La regle de *de minimis* s applique sous conditions.' },
        { schema: { type: 'steps', items: [
          'Etape provisoire un, avec un terme en **gras**',
          'Etape provisoire deux, enchainement du raisonnement',
          'Etape provisoire trois, conclusion de la sequence'
        ]}}
      ]
    },
    {
      n: 8,
      tpl: 'B',
      title: 'Titre provisoire slide 8',
      body: [
        { p: 'Texte provisoire. Demonstration du schema meter face a un seuil.' },
        { schema: { type: 'meter',
          caption: 'Chiffre d affaires provisoire',
          value: '375 000 AED',
          pct: 62,
          threshold: 80,
          min: '0 AED',
          max: 'Seuil *Small Business Relief*'
        }}
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
        { p: 'Texte provisoire. Demonstration du schema compare en deux colonnes.' },
        { schema: { type: 'compare', items: [
          { title: 'Situation provisoire avant', value: '27%', detail: 'Detail provisoire de la colonne de gauche' },
          { title: 'Situation provisoire apres', value: '9%', detail: 'Detail provisoire de la colonne de droite' }
        ]}}
      ]
    },
    {
      n: 11,
      tpl: 'B',
      title: 'Titre provisoire slide 11',
      body: [
        { p: 'Texte provisoire. Demonstration du schema timeline.' },
        { schema: { type: 'timeline', items: [
          { date: '2024', label: 'Jalon provisoire un' },
          { date: '2025', label: 'Jalon provisoire deux' },
          { date: '31 dec. 2026', label: 'Jalon provisoire final', on: true }
        ]}}
      ]
    },
    {
      n: 12,
      tpl: 'B',
      title: 'Titre provisoire slide 12',
      body: [
        { p: 'Texte provisoire. Demonstration du chiffre heros, une seule valeur.' },
        { schema: { type: 'kpi', items: [
          { value: '2,12 EUR', label: 'Libelle provisoire du chiffre heros, le litre a la pompe' }
        ]}}
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
        { p: 'Texte provisoire. Demonstration de la forme emphase : une barre porte l information, les autres font contexte.' },
        { schema: { type: 'bars', items: [
          { label: 'Contexte provisoire un', value: 1200, display: '1 200', emphasis: false },
          { label: 'Point cle provisoire', value: 4300, display: '4 300' },
          { label: 'Contexte provisoire deux', value: 900, display: '900', emphasis: false }
        ]}}
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
