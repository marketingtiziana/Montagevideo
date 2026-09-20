# Carousel Instagram Fynovates — Moyen-Orient

16 slides 1080 x 1350 (ratio 4:5), design premium SaaS / fintech, illustrations
photorealistes generees via Higgsfield (Nano Banana Pro).

## Etat actuel

**Les textes des slides sont PROVISOIRES.** Le brief contenait encore le placeholder
`[COLLE ICI LE TEXTE DES 16 SLIDES]`. Toute la chaine (images, gabarits, export, preview)
est operationnelle ; il ne reste qu'a coller les 16 textes valides.

## Coller les textes valides

1. Ouvrir `content/slides.js`
2. Remplacer chaque `title` / `subtitle` / `body` par le texte valide (aucune reformulation)
3. Passer `PROVISOIRE` a `false`
4. `npm run all`

### Marquage typographique dans le texte

| Ecriture | Rendu | Usage |
|---|---|---|
| `**texte**` | Inter Black 900, blanc | chiffres cles : 108 dollars, 2,12 EUR, 4 300$, 9%, 5%, 375 000 AED, 31 decembre 2026, 27% |
| `*texte*` | Inter 600, blanc | noms propres / termes techniques : Ormuz, QFZP, Small Business Relief, de minimis, CPA, free zone |
| texte nu | Inter 400, `#A8B0C8` | corps courant |

### Blocs de corps

```js
{ p: "un paragraphe" }
{ ul: ["premier point", "deuxieme point"] }   // puces carrees indigo 8x8, jamais de tiret
```

## Commandes

```bash
npm install
npm run gen     # content/slides.js -> slides/slide-01..16.html
npm run build   # slides/*.html    -> output/carousel-moyen-orient/*.png + preview.html
npm run all     # les deux
```

Ouvrir ensuite `preview.html` pour valider les 16 slides d'un coup d'oeil.

## Brand system

| Jeton | Valeur |
|---|---|
| Navy principal | `#0F1535` |
| Indigo accent | `#4F6BFF` |
| Blanc | `#FFFFFF` |
| Gris texte secondaire | `#A8B0C8` |

Police Inter uniquement (400 / 600 / 900), aucune serif, aucune couleur chaude,
aucun degrade, aucun tiret cadratin, aucun emoji. Logo en bas a droite, 40px,
blanc a 60% d'opacite. `gen-slides.js` echoue explicitement si un tiret cadratin
ou un emoji est trouve dans le contenu.

## Gabarits

| Gabarit | Slides | Description |
|---|---|---|
| A | 1 | Couverture : illustration plein cadre, overlay navy 75%, filet indigo 80x4, titre 88px, sous-titre 34px |
| B | 4, 6, 7, 8, 10, 11, 12, 13, 14 | Navy plein, numero "NN / 16" indigo 22px, titre 56px, corps 32px, marges 90px |
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

Le logo est actuellement un bloc-mot CSS (`FYNOVATES`, Inter Black 900, 40px de haut,
blanc a 60%). Pour utiliser le vrai logo, deposer le SVG et remplacer la constante
`LOGO` dans `gen-slides.js` par `<img class="logo" src="../assets/logo.svg" alt="">`.

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
