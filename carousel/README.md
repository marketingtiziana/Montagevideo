# Carousel Instagram Fynovates — Moyen-Orient

16 slides 1080 x 1350 (ratio 4:5), design premium SaaS / fintech, illustrations
photorealistes generees via Higgsfield (Nano Banana Pro).

## Etat

Les 16 textes valides sont en place, mis en page sans aucune reformulation.
Les 16 PNG sont dans `output/carousel-moyen-orient/`, prets a publier.

Trois arbitrages de mise en page, pris parce que le brand system et le texte
source se contredisaient :

- Les marqueurs croix et coche de la slide 8 etaient des emoji, interdits par le
  brand system. Les mots sont intacts, seuls les marqueurs sont devenus un
  traitement typographique (schema `versus`).
- Les URL des sources ne sont pas imprimees : elles ne sont pas cliquables sur
  une image. Seuls les noms de sources apparaissent, en ligne discrete en bas
  de slide, via le champ `sources`.
- Les slides 2, 3 et 5 sont denses. Plutot que de rogner le texte, `build.js`
  reduit le bandeau illustre (520px vers 440 a 500px selon la slide) pour rendre
  de la place. Aucun texte n'est tronque.

## Modifier les textes


1. Ouvrir `content/slides.js`
2. Modifier le `title`, `subtitle` ou `body` concerne
3. `npm run all`

### Marquage typographique dans le texte

| Ecriture | Rendu | Usage |
|---|---|---|
| `**texte**` | Inter Black 900, couleur d'encre | chiffres cles : 108 dollars, 2,12 EUR, 4 300$, 9%, 5%, 375 000 AED, 31 decembre 2026, 27% |
| `*texte*` | Inter 600, couleur d'encre | noms propres / termes techniques : Ormuz, QFZP, Small Business Relief, de minimis, CPA, free zone |
| texte nu | Inter 400, gris secondaire | corps courant |

### Blocs de corps

```js
{ p: "un paragraphe" }
{ ul: ["premier point", "deuxieme point"] }   // puces carrees indigo 8x8, jamais de tiret
{ schema: { type: "kpi", ... } }              // schema de donnees, gabarit B uniquement
```

## Schemas de donnees

Les slides sans illustration peuvent porter un schema a la place, ou en plus, du
texte. Tout est en HTML et CSS purs, aucune librairie, aucun JS a l'execution.
Le code vit dans `schemas.js`.

| Type | Quand l'utiliser | Contenu attendu |
|---|---|---|
| `kpi` | 1 a 3 chiffres cles. Une seule entree devient un chiffre heros a 118px, deux ou trois deviennent des tuiles | `items: [{ value, label }]` |
| `bars` | comparer des grandeurs, 1 a 5 barres, serie unique | `items: [{ label, value, display, emphasis }]` |
| `meter` | un rapport face a un seuil | `caption, value, pct, threshold, min, max` |
| `steps` | un enchainement, 2 a 4 etapes numerotees | `items: ["etape", ...]` |
| `timeline` | des jalons dates, 2 a 4 | `items: [{ date, label, on }]` |
| `compare` | exactement 2 colonnes, avant contre apres | `items: [{ title, value, detail }]` |
| `flow` | une chaine de causes, 2 a 6 maillons, le dernier porte l'aboutissement | `items: ["maillon", ...]` |
| `columns` | 2 colonnes de listes, ce qui tient contre ce qui tombe | `items: [{ title, items: [...] }]` |
| `versus` | exactement 2 lignes, une a eviter et une a suivre. Remplace les emoji croix et coche | `items: [{ kind: "no"\|"yes", text }]` |
| `threshold` | une bande coupee en deux zones de taux, avec le point de bascule chiffre | `low: { value, label }, high: { value, label }, at` |
| `pairs` | 2 a 4 bascules "ceci devient cela" | `items: [{ from, to }]` |

Details utiles :

- `value` dans `bars` est le **nombre** qui dessine la barre, `display` est le texte
  affiche au bout. Les deux sont separes pour que "4 300$" reste lisible tout en
  produisant une longueur juste.
- `emphasis: false` met une barre en retrait : elle devient grise et sert de
  contexte, la barre restante porte l'information. C'est la forme la plus utile
  quand une seule valeur compte.
- `on: true` sur un jalon de `timeline` le passe en indigo, les autres restent en
  retrait.
- `pct` et `threshold` sont des pourcentages de 0 a 100. `threshold` dessine un
  repere vertical sur la jauge.
- Le marquage `**gras**` et `*600*` fonctionne aussi a l'interieur des schemas.

### Schema retenu par slide

| Slide | Schema | Pourquoi |
|---|---|---|
| 3 | `flow` | le texte enonce deja une chaine : carburant vers transport vers alimentation vers factures vers budget |
| 4 | `flow` | meme chose pour le mecanisme publicitaire |
| 6 | `columns` | le texte oppose "ce qui fonctionnait" et "ce qui fonctionne maintenant" |
| 7 | `columns` | le texte oppose "ce qui resiste" et "ce qui souffre" |
| 8 | `versus` | remplace les marqueurs croix et coche, interdits par le brand system |
| 10 | `threshold` | le texte pose un taux de part et d'autre d'un seuil chiffre |
| 11 | `kpi` heros | la date et sa phrase de chute sont les mots exacts du texte |
| 12 | `pairs` | les trois lignes du texte sont toutes des bascules "ceci devient cela" |
| 9, 13, 14 | `ol` | listes numerotees deja presentes dans le texte |
| 8 | `ul` | liste a puces deja presente dans le texte |

Les slides 2, 5 et 15 portent une illustration, les slides 1 et 16 sont la
couverture et l'appel a l'action. Aucune slide de contenu n'est donc restee
en texte brut.

Dans tous les cas le schema reprend les mots du texte source : le gabarit
change, jamais la formulation. Seules exceptions, signalees ici : les libelles
propres au diagramme de la slide 10 ("sous le seuil", "sur les benefices
au-dessus"), et les mots de liaison "peut devenir" et "peut avoir" de la
slide 12, remplaces par la fleche du schema.

### Palette des schemas

Validee avec le validateur de la methode dataviz, surface `#F4F6FC` :

| Role | Valeur | Controle |
|---|---|---|
| Rampe ordinale indigo | `#93A6FF` `#4F6BFF` `#2F46C9` | monotone, ecarts de clarte suffisants, bout clair a 2,13:1, teinte unique |
| Paire deux nuances | `#93A6FF` + `#4F6BFF` | dans la bande de clarte, au-dessus du plancher de chroma, ecart CVD 16,4 |
| Mise en retrait | `#C3CAE0` | canal de recul, hors rampe categorielle |
| Fond de jauge | `#DDE3F5` | mobilier |
| Filets et axes | `#E2E6F2` | un cran au-dessus de la surface |

`#4F6BFF` et `#2F46C9` ne doivent jamais coder deux series distinctes : leur ecart
en vision normale est de 12,8, sous le plancher de 15.

Regles appliquees : le texte ne porte jamais la couleur de donnee, les barres font
20px d'epaisseur avec un bout arrondi a 4px et un pied carre, une serie unique n'a
pas de boite de legende. Le livrable etant un PNG, aucune infobulle n'est possible :
chaque valeur porte donc une etiquette directe, posee au bout de sa barre.

## Commandes

```bash
npm install
npm run gen     # content/slides.js -> slides/slide-01..16.html
npm run build   # slides/*.html    -> output/carousel-moyen-orient/*.png + preview.html
npm run all     # les deux
```

Ouvrir ensuite `preview.html` pour valider les 16 slides d'un coup d'oeil.

## Theme et logo

Deux reglages en tete de `gen-slides.js` :

```js
const THEME = 'clair';       // 'clair' ou 'sombre'
const LOGO_SLIDES = [];      // numeros des slides portant le logo
const CTA_STYLE = 'halo';    // 'halo', 'massif' ou 'bloc' (slide 16)
```

`THEME = 'clair'` (reglage actuel) : fond `#F4F6FC`, titres et mots mis en avant en
navy `#0F1535`, corps en `#545E80`, accent indigo inchange. La couverture place le
visuel en carte basse sur fond clair.

`THEME = 'sombre'` : fond navy plein, texte blanc, corps `#A8B0C8`. La couverture
repasse en illustration plein cadre avec overlay navy a 75%.

`LOGO_SLIDES = []` (reglage actuel) : aucune slide ne porte le logo. Mettre `[1]`
pour la seule couverture, `[1, 15]` pour couverture et derniere slide de contenu.

### Slide 16, l'appel a l'action

Trois styles, surchargeables a la volee : `CTA_STYLE=massif node gen-slides.js`

| Style | Rendu |
|---|---|
| `halo` (actuel) | fond navy profond, halo indigo radial, filet, fleche ronde. Rupture forte apres 15 slides claires |
| `massif` | fond indigo plein, typo navy massive, trois chevrons de progression |
| `bloc` | fond clair, grand bloc indigo arrondi, fleche blanche. Le plus proche du reste du carousel |

La fleche et les chevrons sont dessines en CSS : aucun emoji, aucune dependance.

## Brand system

| Jeton | Valeur |
|---|---|
| Navy principal | `#0F1535` |
| Indigo accent | `#4F6BFF` |
| Blanc | `#FFFFFF` |
| Gris texte sur fond sombre | `#A8B0C8` |
| Gris texte sur fond clair | `#545E80` |

Police Inter uniquement (400 / 600 / 900), aucune serif, aucune couleur chaude,
aucun degrade, aucun tiret cadratin, aucun emoji. `gen-slides.js` echoue
explicitement si un tiret cadratin ou un emoji est trouve dans le contenu.

## Gabarits

| Gabarit | Slides | Description |
|---|---|---|
| A | 1 | Couverture : filet indigo 80x4, titre 88px, sous-titre 34px, visuel en carte basse (theme clair) ou plein cadre avec overlay 75% (theme sombre) |
| B | 4, 6, 7, 8, 10, 11, 12, 13, 14 | Fond plein, numero "NN / 16" indigo 22px, titre 56px, corps 32px, marges 90px |
| C | 2, 3, 5, 9, 15 | Bandeau illustration 520px, rayon 24px, overlay navy 20%, puis typo du gabarit B avec corps a 28px |
| CTA | 16 | Fond indigo plein, texte navy Inter Black 900 72px centre, rien d'autre |

## Auto-ajustement typographique

Si un corps deborde de la hauteur disponible, `build.js` reduit sa taille par paliers
de 2px jusqu'a 26px minimum. En dessous, la slide est signalee dans le rapport de build
et dans `preview.html` : **rien n'est jamais tronque**. Le rapport signale aussi les
titres de gabarit B ou C depassant 2 lignes.

## Illustrations

Generees avec Higgsfield, modele `nano_banana_pro` (Google Nano Banana Pro), 16:9, 2k,
puis recadrees en 1080 x 520 par `object-fit: cover` au moment de l'export.

| Fichier | Slide |
|---|---|
| `assets/img/img-01-cover.jpg` | 1 |
| `assets/img/img-02-detroit.jpg` | 2 |
| `assets/img/img-03-pompe.jpg` | 3 |
| `assets/img/img-05-fret.jpg` | 5 |
| `assets/img/img-09-dubai.jpg` | 9 |
| `assets/img/img-15-final.jpg` | 15 |

Direction artistique commune : cinematic photography, ultra realistic, 35mm, cold blue
color grading, deep navy and indigo tones only, desaturated, dramatic directional
lighting, high contrast shadows, no warm tones, editorial quality, photorealistic.
Contraintes appliquees a chaque prompt : aucun visage identifiable, aucun drapeau ou
symbole politique ou religieux, aucune scene de guerre, aucune arme, aucun texte ni logo
genere, aucun militaire.

## Rendu

Playwright + Chromium, viewport 1080 x 1350 en `deviceScaleFactor: 2` (rendu retina
2160 x 2700), puis downscale Lanczos3 en 1080 x 1350 via sharp.

Inter est declaree via Google Fonts, doublee d'une copie locale des memes fichiers
woff2 Google Fonts dans `assets/fonts/`. Sans cette copie, Chromium retombe sur Arial
au moment de l'export et tout le rendu typographique est faux.

## Remplacer le logo

Le logo est desactive sur toutes les slides (`LOGO_SLIDES = []`). Quand il est actif,
c'est un bloc-mot CSS (`FYNOVATES`, Inter Black 900, 40px de haut). Pour utiliser le
vrai logo, deposer le SVG et remplacer le corps de la fonction `logo()` dans
`gen-slides.js` par `<img class="logo" src="../assets/logo.svg" alt="">`.

## Arborescence

```
carousel/
  content/slides.js     contenu des 16 slides (le seul fichier a editer)
  gen-slides.js         contenu -> 16 HTML autonomes
  slides/               slide-01.html ... slide-16.html (generes)
  build.js              HTML -> PNG + preview.html
  assets/img/           6 illustrations Higgsfield
  assets/fonts/         Inter woff2 (Google Fonts, copie locale)
  output/carousel-moyen-orient/   slide-01.png ... slide-16.png  <- livrable
  preview.html          les 16 PNG cote a cote (genere)
```
