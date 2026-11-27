# Explorations de direction artistique — Fynovates & Tiziana

Recherche créative indépendante. **Rien ici n’est appliqué à la plateforme** (`workspace/` n’est pas modifié, aucun asset remplacé, aucune rubrique ajoutée).

## Consulter

- **Galerie interactive** : ouvrir `index.html` dans un navigateur (fonctionne hors ligne, aucune dépendance).
- **Planches PNG** (1600 px de large) : dossier `exports/`.

| Planche | Contenu |
|---|---|
| 00 | Introduction et constantes |
| 01 | Fynovates — 8 textures bleues, planche comparative |
| 02 | Fynovates — matrice 8 textures × 6 supports |
| 03 à 10 | Une planche par texture : palette HEX, texture, typographies, éléments, avantages, risques, 6 applications |
| 11 | Tiziana — 6 directions beige, planche comparative |
| 12 | Tiziana — matrice 6 directions × 6 supports |
| 13 à 18 | Une planche par direction |
| 19 | Les deux univers côte à côte, éléments de liaison |
| 20 | Synthèse et lecture des quatre questions |

Supports Fynovates : bannière LinkedIn, miniature YouTube, visuel pédagogique Instagram, couverture de présentation, fond de publication corporate, slide d’expertise.
Supports Tiziana : bannière LinkedIn personnelle, miniature YouTube, post Instagram (photo seule, règle du feed), couverture de carrousel, citation, couverture de présentation.

## Régénérer les planches

```bash
node render-boards.cjs
```

(Playwright, rendu direct du fichier local.)

## Sources

- Logo : wordmark officiel FYNOVATES (SVG du dossier Drive « LOGOS »), jamais redessiné.
- Photos : shooting studio réel de Tiziana (dossier Drive « PHOTOS Tiziana »), sans retouche.
- Textes : expressions signatures et méthode issues des playbooks (`workspace/brand/`). Aucun chiffre ni promesse.
- Polices : Inter, Manrope, Fraunces, Cormorant Garamond, Playfair Display, DM Serif Display, Instrument Serif — licence libre SIL OFL (`assets/fonts/`).

## Fichiers

- `index.html`, `assets/styles.css` — galerie
- `assets/textures.js` — les 8 textures (CSS / SVG génératif)
- `assets/directions.js` — les 6 directions beige
- `assets/applications.js` — gabarits des supports
- `assets/app.js` — composition des planches
- `render-boards.cjs` — export PNG
