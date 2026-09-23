# Fynovates — « Le client qui a annulé son départ »

Séquence narrative de 6 Instagram Stories, **1080 × 1920 exactement**, qui raconte une histoire
vraie chapitre par chapitre et se referme sur un CTA d'appel diagnostic.

Photo Higgsfield en fond, système graphique éditorial en surimpression, texte en HTML/CSS,
export PNG par Puppeteer. Le build refuse de livrer si une contrainte de composition ou de
contraste n'est pas tenue — c'est le cœur du dispositif, détaillé plus bas.

## Livrables

| Chemin | Contenu |
|---|---|
| `output/story-1.png` → `story-6.png` | Les 6 visuels finaux, 1080 × 1920 |
| `preview.html` | Les 6 en planche, avec les repères des zones mortes |
| `src/story-N.html` | La source HTML de chaque story — produite par le build, non versionnée |
| `src/story.css` | Le système de composition, commun aux 6 |
| `src/content.js` | Tout le contenu éditorial |
| `src/inter/` | Inter vendorisée (woff2 + CSS), pour un rendu identique hors ligne |
| `backgrounds/bg-1.jpg` → `bg-6.jpg` | Photos sources, 2294 × 4096 |
| `prompts-higgsfield.md` | Les prompts, pour régénérer une image |

## Regénérer

```bash
npm install     # puppeteer-core uniquement
npm run build   # ou : node build.mjs
```

Chromium est cherché sous `/opt/pw-browsers/` ; sur une autre machine, passer le chemin par
`CHROME_PATH=/usr/bin/chromium node build.mjs`.

## Le système de composition

### La grille

Marges latérales **90 px**, zone morte **160 px en haut**, zone morte **300 px en bas**
(stickers Instagram). Tout le contenu vit entre ces bornes, et rien ne descend sous la ligne
des 1620 px.

### Trois couches

**1 — La photo.** Plein cadre, `object-fit: cover`, `filter: saturate(0.85) contrast(1.08)`,
puis le calque de grading commun aux 6 : `linear-gradient(180deg, rgba(6,10,22,.25) 0%,
rgba(6,10,22,.55) 45%, rgba(4,7,16,.92) 100%)`. La photo respire en haut et s'assombrit là où
vit le texte.

Deux renforts locaux s'ajoutent — invisibles en soi, ils ne font qu'approfondir un dégradé déjà
présent, et ils existent uniquement pour tenir le contraste sans ombre portée :

- `.renfort` sous le bloc texte ;
- `.renfort-haut`, 440 px, qui ancre la ligne de chapitre dorée quand la photo est claire dans
  son premier tiers. Sur le chapitre 01 (le hall d'aéroport au couchant, la photo la plus
  exposée de la série) le doré tombait à **2,83:1** sans lui.

**2 — Le système éditorial**, identique sur les 6 et c'est lui qui fait la série :

- un filet vertical doré de 2 px (`#D4AF37`, opacité 0.8) le long du bloc texte ;
- `CHAPITRE 01 — 06` en haut à gauche, Inter 24 px, uppercase, letter-spacing 4 px, doré ;
- le numéro du chapitre en filigrane, **350 px Inter 900 blanc à 6 %**, en haut à droite,
  à moitié coupé par le bord du cadre.

**3 — Le texte**, ancré en bas de la zone utile (pas centré verticalement : la photo respire
en haut, le texte s'assoit en bas), aligné à gauche le long du filet, 780 px de large maximum.

| | Taille | Graisse | Couleur |
|---|---|---|---|
| Accroche | 58 px / lh 1.15 | 700 | `#FFFFFF` |
| Corps | 40 px / lh 1.4 | 400 | `#E5E7EB` |
| Chapitre | 24 px, ls 4 px | 700 | `#D4AF37` |
| `GO` | 140 px | 900 | `#D4AF37`, encadré |

### Les deux ruptures

- **Chapitre 04**, le pivot dramatique : texte remonté au centre, ambiance la plus sombre.
  La photo source étant déjà la plus noire de la série, le traitement ne l'écrase pas — il la
  resserre : une vignette radiale porte le regard au centre et laisse les tours lisibles.
- **Chapitre 06**, le CTA : composition entièrement centrée, filet retiré, bloc `GO` encadré
  posé au centre optique — **à 619 px du bas**, largement au-delà du minimum de 380 px.

### Interdits respectés

Aucun emoji, aucune icône décorative, **aucun `text-shadow` ni `drop-shadow`** (le dégradé fait
tout le travail), aucun texte généré à l'intérieur des photos.

## Les garde-fous du build

Le build échoue — il ne livre pas — si l'un des trois contrôles ne passe pas.

**1. Zone morte basse.** Aucun élément de texte ne dépasse 1620 px. Mesuré sur le rendu réel,
pas sur le CSS.

**2. Position du `GO`.** Le cadre doré doit rester à 380 px minimum du bas. Ce contrôle a servi
dès le premier build : le bloc était un frère de `.bloc` et tombait à 300 px.

**3. Contraste WCAG AA, mesuré sur les vrais pixels.** C'est le contrôle qui compte. Le script
rend une deuxième passe de la page **texte masqué**, dessine ce fond dans un canvas, puis pour
chaque fragment de texte (`.accroche`, `.corps`, `.cta`, `.chapitre`, et chaque `<em>`/`<i>`
doré ou rouge) échantillonne le fond réellement sous ses rectangles et calcule le ratio.

Le seuil est choisi **par élément** selon WCAG 2.1 : 4,5:1 en texte courant, **3:1 dès 24 px,
ou 18,66 px en gras** (« large scale text »). Le build affiche à chaque story le fragment le
plus faible et sa marge.

Relevé du build livré :

```
story-1.png — bas 1580px / 1620px, contraste min 3.97:1 (seuil 3, « div.chapitre »)
story-2.png — bas 1580px / 1620px, contraste min 8.26:1 (seuil 3, « div.chapitre »)
story-3.png — bas 1580px / 1620px, contraste min 4.05:1 (seuil 3, « div.chapitre »)
story-4.png — bas 1154px / 1620px, contraste min 3.48:1 (seuil 3, « i »)
story-5.png — bas 1580px / 1620px, contraste min 6.43:1 (seuil 3, « p.accroche »)
story-6.png — bas 1301px / 1620px, contraste min 5.90:1 (seuil 3, « div.cta »), GO à 619px du bas
```

Le point le plus serré reste le rouge `#E05C5C` du chapitre 04, posé sur les lueurs dorées de
la skyline : 3,48:1 après resserrage de la vignette.

## Modifier les textes

Tout est dans la liste `STORIES` de `src/content.js`. Balisage inline :

- `{{mot}}` → doré `#D4AF37`, même graisse que le contexte
- `[[mot]]` → rouge `#E05C5C`
- `//mot//` → italique

Le build applique au passage la typographie française : espace insécable après `«`, avant `»`,
et avant `? ! ; :`. Sans elle, le chapitre 06 renvoyait le guillemet fermant seul à la ligne.

Relancer `npm run build` après toute modification — les garde-fous se chargent de dire si la
nouvelle longueur de texte casse la grille.

## Cohérence des photos

Vérifiée sur `preview.html` : même grading, même grille, filigrane au même endroit, sujet dans
la moitié haute sur les 5 photos qui en ont un. **Aucune photo n'a eu besoin d'être régénérée** ;
le détail des critères est dans `prompts-higgsfield.md`.
