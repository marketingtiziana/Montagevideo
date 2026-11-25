# Instagram personnel de Tiziana Caci — maquettes

Compte personnel, photographique et incarné, sans aucun élément de l'identité Fynovates.

## Organisation (`output/`)
| Dossier | Contenu |
|---|---|
| `01-profil/` | Mockup 1 : profil complet (page entière et écran), bio « Fondatrice & directrice de @fynovates » |
| `02-feed/` | 15 photographies 1080 × 1350 (aucun texte), carrousel photo de la publication 5, mockup 2 de la grille |
| `03-reels/` | 12 miniatures 1080 × 1920 (image de la vidéo + sous-titre sobre), mockup de l'onglet Reels |
| `04-stories/style-1…6/` | 18 Stories 1080 × 1920 aux codes natifs (sérif sur bandeaux blancs, sans-sérif, texte court, face caméra, lieu + réflexion, interactives). `apercu-telephone/` : la même Story dans la visionneuse. Interactives : version de production (emplacement libre) + aperçu avec sticker simulé |
| `05-sequences/` | 4 séquences complètes (17 écrans), en fichiers seuls et dans la visionneuse |
| `06-stories-a-la-une/` | 5 couvertures (À propos, Mon entreprise, International, Mes réflexions, Médias) et leur Story d'introduction |
| `07-presentation/` | Présentation PDF (16 diapositives), diapositives PNG, planche globale |
| `08-planches/` | Planches séparées Feed, Stories et Stories à la une (PNG + PDF) — `node madame-caci/src/planches.mjs` |

`presentation/index.html` : page de présentation publiée en artefact.

## Sources modifiables (`src/`)
- `feed.mjs` : les 15 photos (cadrages, légendes) et les 12 Reels.
- `stories.mjs` : Stories, séquences et Stories à la une (textes et positions).
- `instagram-ui.mjs` : simulations d'interface (profil, grille, Reels, visionneuse de Story).
- `core.mjs` : recadrage des photos, polices ; `photos/grade.py` : étalonnage commun.

```bash
python3 madame-caci/photos/grade.py
node madame-caci/src/build.mjs
node madame-caci/src/presentation.mjs
```

## À compléter
Identifiant du compte, photos en réunion et avec les collaborateurs, photos d'événement, vraies photos de déplacement, captures des vidéos réelles (Reels et face caméra), nom de la chaîne YouTube. Les photos de lieux viennent des ressources du projet (Unsplash, voir `photos/CREDITS.md`). Les polices natives d'Instagram sont approchées (Liberation Serif et Liberation Sans) : les Stories finales se tapent dans l'application.
