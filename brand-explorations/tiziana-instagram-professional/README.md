# Tiziana Caci — Profil Instagram professionnel

Proposition indépendante : rien n'est modifié dans la plateforme Fynovates.

Ouvrir `index.html` dans un navigateur pour voir toutes les planches. Pour tout ré-exporter : `node render.cjs` (Playwright).

## Livrables
| # | Livrable | Fichier(s) |
|---|---|---|
| 1 | Simulation complète du profil (profil, onglet Reels, carrousel ouvert) | `profil/simulation-profil-instagram.jpg`, `presentation/00-couverture.jpg` |
| 2 | Grille de 12 publications | `profil/grille-12-publications.jpg` |
| 3 | Les 12 visuels individuels | `publications/01…12-*.jpg` (+ planche `00-les-12-visuels.jpg`) |
| 4 | Trois carrousels complets (8 slides chacun) | `carrousels/1-expatriation/`, `2-structuration/`, `3-banque/` + planches |
| 5 | Couvertures de Reels (6 styles + 3 du feed) | `reels/` |
| 6 | Palette et règles d'usage | `direction-artistique/palette-et-regles.jpg` |
| 7 | Typographies | `direction-artistique/typographies.jpg` |
| 8 | Textures et traitements photo | `direction-artistique/textures-et-traitements-photo.jpg` |
| 9 | Photos à réaliser + sources | `presentation/photos-a-realiser-et-sources.jpg` |
| — | Logique éditoriale du feed | `presentation/01-logique-editoriale.jpg` |

## Formats
- Publications et slides de carrousel : 1080 × 1440 (3:4, ratio de la grille du profil).
- Couvertures de Reels : 1080 × 1920, titre dans la zone visible en grille (y 240 → 1680).

## Règles respectées
- Uniquement de vraies photos de Tiziana (dossier Drive « 📸PHOTOS Tiziana ») et des détourages faits à partir de ces photos. Aucun visage généré.
- Les environnements (skyline, bureau, façade) sont en CC0, licence vérifiée ; crédits dans `photographies/SOURCES.md`.
- Pas de chiffres, de clients, de diplômes ni de résultats inventés. Abonnés : À RENSEIGNER.
- Les sujets fiscalité, banque et structuration sont présentés comme des sujets d'analyse, avec un rappel « à analyser avec un professionnel compétent ».

## À valider
- Les deux dernières lignes de la bio (seule « Fondatrice & directrice de @fynovates » vient du playbook).
- Le playbook prévoit un feed « photographies uniquement » : la proposition ajoute des publications typographiques et éditoriales.
- Les contenus techniques des carrousels sont à relire par un expert avant publication.

## Sources modifiables
`src/content.js` (textes), `src/design.js` (gabarits), `src/app.js` (planches), `src/lib.js` (textures), `src/styles.css`.
