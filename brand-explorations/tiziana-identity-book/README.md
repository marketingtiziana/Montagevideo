# Tiziana — Personal Brand Strategy & Identity Book

Livre d'identité personnelle de Tiziana Caci : positionnement « The Reality Behind Business », personnalité publique, convictions, système visuel « The Red Mark », signes physiques, apparence, décor, langage, formats, présence par plateforme, guide d'application et plan sur 30 jours.

Espace indépendant : **rien n'est modifié dans la plateforme Fynovates.**

## Livrables

| Livrable | Emplacement |
|---|---|
| PDF final (44 pages, A4 paysage, sommaire cliquable) | `final-pdf/Tiziana-Caci-Personal-Brand-Identity-Book.pdf` |
| Aperçu page par page | `final-pdf/apercu/` |
| Version consultable dans le navigateur | `document-source/book.html` (ou `index.html` à la racine) |
| Fichiers sources | `document-source/` |
| Mockups | `mockups/` (Instagram, LinkedIn, YouTube, Point de Contrôle, objets, geste, décor, silhouettes, animation du trait) |
| Textures | `textures/` |
| Photographies | `photographies/` (réelles, étalonnées, détourages, ambiance CC0) |
| Assets de marque | `brand-assets/` : trait grenat en SVG (7 variantes × 2 tons), palette JSON et CSS, polices OFL, logos Fynovates |
| Bibliographie et sources photographiques | `sources/` |

`brand-assets/` remplace le dossier `/assets/` demandé : le `.gitignore` racine du dépôt ignore tout dossier nommé `assets/`, et sa configuration n'a pas été modifiée.

## Mettre à jour le document

```bash
cd document-source
node render-visuals.cjs          # régénère mockups, textures et photos étalonnées (filtre possible : node render-visuals.cjs instagram)
node export-brand-assets.cjs     # régénère le trait SVG et la palette
node make-pdf.cjs                # imprime le PDF, crée les aperçus et signale les débordements
```

- Textes et pages : `book.js` (chaque affirmation porte un statut : Fait / Hypothèse / Proposition / À valider).
- Mise en page : `book.css`.
- Système de marque (palette, trait, textures, étalonnage) : `brand.js`.
- Visuels : `visuals.js`.
- Moodboard : `python3 sources/build_inspiration_js.py` après modification de `photographies/inspiration/inspiration.json`.

## Fiabilité

- Tiziana n'apparaît que sur ses vraies photos ; les décors sont des photomontages de simulation, signalés comme tels.
- Aucune anecdote, citation, expérience, fonction ou opinion n'est inventée. Les traits, convictions, objets, tenues et expressions sont des propositions marquées « À valider ».
- Les informations réglementaires (ViDA, DAC8, AMLR, droit au compte, facturation électronique) viennent de sources officielles consultées le 28 novembre 2026.
