# Instagram personnel de Tiziana Caci — maquettes

Compte personnel, photographique et incarné, sans aucun élément de l'identité Fynovates.

## Organisation (`output/`) — six livrables séparés
| Dossier | Contenu |
|---|---|
| `A-profil/` | Profil Instagram (écran et page complète) avec la bio « Fondatrice & directrice de @fynovates » et les deux Stories à la une ; planche A (PNG + PDF) |
| `B-feed/` | « FEED INSTAGRAM — MADAME CACI » : grille sur smartphone, planche (PNG + PDF), `photos/` = les 15 photos 1080 × 1350 et le carrousel photo |
| `C-reels/` | Onglet Reels sur smartphone, 12 miniatures 1080 × 1920, planche C |
| `D-stories/1…6/` | Stories individuelles 1080 × 1920, un dossier par famille. Interactives : fichier publiable (place libre) + `apercus-avec-sticker/`. `apercus-telephone/` : affichage secondaire. PDF : une Story par page |
| `E-sequences/` | 4 séquences, un fichier publiable par écran (`ecran-1.png`…), aperçus secondaires, un PDF par séquence |
| `F-stories-a-la-une/` | « À PROPOS DE MOI » et « MON CABINET » : couvertures (photo + variante typographique), affichage sous la bio, stories de chaque rubrique, planche F |

`presentation/index.html` : page de présentation (artefact), une section par livrable.

## Sources modifiables (`src/`)
- `feed.mjs` : les 15 photos (cadrages, légendes) et les 12 Reels.
- `stories.mjs` : Stories, séquences et Stories à la une (textes et positions).
- `instagram-ui.mjs` : simulations d'interface (profil, grille, Reels, visionneuse de Story).
- `core.mjs` : recadrage des photos, polices ; `photos/grade.py` : étalonnage commun.

```bash
python3 madame-caci/photos/grade.py
node madame-caci/src/build.mjs
node madame-caci/src/planches.mjs
```

## À compléter
Identifiant du compte, parcours de Tiziana (story « Mon parcours »), photos de l'équipe, photos en réunion et avec les collaborateurs, photos d'événement, vraies photos de déplacement, captures des vidéos réelles (Reels et face caméra), nom de la chaîne YouTube. Les photos de lieux viennent des ressources du projet (Unsplash, voir `photos/CREDITS.md`). Les polices natives d'Instagram sont approchées (Liberation Serif et Liberation Sans) : les Stories finales se tapent dans l'application.
