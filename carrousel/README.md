# Carrousel Instagram — Fynovates / Madame Caci

Carrousel 9 slides **1080×1350** (4:5), sujet : *« Personne ne devient riche avec un salaire. »*

Les slides sont construites en **HTML/CSS + SVG inline** puis rendues en PNG via Chromium headless
(Playwright) — texte net et vectoriel, aucun layout généré en image.

## Utilisation

```bash
bash setup.sh                 # dépendances + police Inter
node src/render.js            # rend les 9 slides -> output/slide-01..09.png
node src/render.js 1 2 4      # ne rend que les slides 1, 2 et 4
node src/contrast.js          # audit des contrastes WCAG du design system
```

Chromium : le script utilise le binaire pré-installé de l'environnement,
surchargeable via `CHROME_PATH`.

## Fichiers
| Fichier | Rôle |
|---|---|
| `src/slides.js` | Contenu des 9 slides, décor en filigrane, flèches SVG |
| `src/style.css` | Design system : couleurs, typographie, composants, grille |
| `src/render.js` | Génère `slides/*.html` puis les PNG, avec contrôles de conformité |
| `src/contrast.js` | Vérifie les ratios de contraste des couples couleur/fond |
| `assets/` | `tiziana-cutout.png` (photo détourée, slide 1) |
| `slides/` | HTML généré (une page par slide, inspectable au navigateur) |
| `output/` | PNG finaux `slide-01.png` … `slide-09.png` |

## Design system
Fond `#F7F8FC` · noir bleuté `#12121F` · bleu signature `#4353FF` · gris `#8A8FA3` ·
cards claires `#EFF1F7` · filets `#E3E6F0`. Marges 80px, cards radius 24px,
ombre bleue diffuse `0 20px 60px rgba(67,83,255,0.35)` sous les cards bleues.

Composants dans `style.css` : `.num` (numéro outline), `.badge` (pill catégorie),
`.stat` (card stat claire/bleue), `.rows` / `.row-card` (lignes comparatives),
`.pill` (tags), `.swipe` (bouton), `.float` (badge outline flottant),
`.flow` (flux de cards + flèches), `.duo` (deux cards), `.ticks` (liste à puces carrées).

### Photo slide 1
`assets/tiziana-cutout.png` — photo détourée (alpha), placée en bas gauche, 742px de haut
(55% de la slide), le parapluie débordant sur le bord gauche. Si le fichier est retiré,
un placeholder en pointillés matérialise l'emplacement.

## Contrôles automatiques
`render.js` vérifie pour chaque slide : dimensions PNG exactes (1080×1350), aucun élément
hors cadre, marges 80px respectées, aucun texte tronqué ou débordant de son conteneur.
Les éléments marqués `.bleed` (décor, photo détourée) sont exclus de ces contrôles.

`contrast.js` relève les ratios du design system. Le gris `#8A8FA3` ressort à **3,03:1**
sur le fond et **2,84:1** sur card claire, sous le seuil AA de 4,5:1 : c'est la couleur de
marque, conservée telle quelle. `#6B7085` est proposé dans l'audit comme variante lisible
(4,62:1 sur le fond) si le choix doit être arbitré.
