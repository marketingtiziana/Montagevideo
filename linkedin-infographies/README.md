# FYNOVATES — 10 infographies et 1 carrousel LinkedIn

Charte appliquée : celle du projet (`charte/polices.mjs`) — logo officiel FYNOVATES vectorisé (sans icône), Inter SemiBold pour les titres, Inter Regular pour les textes, Montserrat en capitales espacées pour les rubriques, navy #0D082E, gris #6B6980, papier #F5F5F7.

## Fichiers
- `output/infographies/` : les 10 infographies, 1080 × 1350, une par fichier PNG.
- `output/carrousel/` : PDF 8 pages (vectoriel, 1080 × 1350), `pages/` avec un PNG par page, `fynovates-carrousel-planche.png` (8 pages côte à côte).
- `output/fynovates-planche-globale.png` : les 10 infographies et les 8 pages du carrousel réunies.
- Sources modifiables : `src/infographies.mjs`, `src/carrousel.mjs`, `src/style.mjs` (charte), `src/build.mjs` (export + contrôle des débordements).

| N° | Sujet | Construction |
|---|---|---|
| 01 | TVA : où dois-tu payer ? | Arbre de décision |
| 02 | Le seuil européen de 10 000 € | Repère chiffré, jauge à seuil, encadrés |
| 03 | Coaching individuel vs module préenregistré | Tableau comparatif en 3 colonnes |
| 04 | Le parcours d'un encaissement | Flux horizontal en 6 étapes |
| 05 | Chiffre d'affaires, résultat, trésorerie | Cascade financière (exemple fictif) |
| 06 | Argent de la société vs argent personnel | Deux espaces et flux entre eux |
| 07 | Capacité d'emprunt | Dossier central et blocs d'analyse |
| 08 | Achat immobilier : justificatifs | Timeline et checklist |
| 09 | Résidence fiscale | Schéma d'analyse convergent |
| 10 | Avant de créer une société à l'étranger | Grille de diagnostic en 7 questions |

## Régénérer
```bash
node linkedin-infographies/src/build.mjs
```
Le script signale tout texte qui déborde de sa zone.

## Avant publication
Tous les contenus fiscaux, comptables, juridiques et bancaires sont des informations générales à faire valider par un expert. Les chiffres de l'infographie 05 sont fictifs (200 000 − 150 000 = 50 000 ; 50 000 − 30 000 + 8 000 − 12 000 = 16 000 ; 20 000 + 16 000 = 36 000).
