# Tiziana — The Executive Identity Book

Exploration comparative de **7 directions artistiques complètes + 3 hybrides** pour la marque personnelle de Tiziana Caci. Espace indépendant : **rien n'est modifié dans la plateforme Fynovates**.

## Ouvrir

- **PDF final** (A3 paysage) : `pdf/Tiziana-Caci-Executive-Identity-Book.pdf` — aperçus page par page dans `pdf/apercu/`.
- **Galerie locale** : `index.html` (navigation entre les 10 identités, hors ligne).
- **Version de présentation** : `document-source/book.html`.

## Les 10 identités

| | Direction | Grammaire | Signe |
|---|---|---|---|
| A | The Monochrome Executive | minimal | La ligne verticale et le cadrage |
| B | The Modern Authority | institutionnelle | Le sceau TC |
| C | The Editorial Woman | magazine | La découpe organique |
| D | The Architectural Leader | architecturale | L'arche |
| E | The Modern Power | puissance | La barre cobalt |
| F | The Burgundy Signature | trait grenat | The Red Mark |
| G | The Aubergine Executive | organique | L'orbite |
| H1 | Monochrome & Aubergine | minimal + accent | La ligne et le point |
| H2 | Architecture & Grenat | architecturale + seuil | Le seuil grenat |
| H3 | Authority & Noir et blanc | institutionnelle + N&B | Le sceau et le tirage |

Chaque direction (dossier `direction-*/` ou `hybrid-concepts/*/`) contient les mêmes supports : 12 publications Instagram + 4 slides de carrousel, profil Instagram, photo de profil, Stories à la une, bannière et page LinkedIn, bannière, miniatures, playlist, générique et habillage YouTube, chaîne YouTube, deux décors (face, trois-quarts, vertical), trois silhouettes, trois objets, signe en utilisation (document, présentation, papeterie, animation), huit plans photographiques, trois textures.

## Structure

- `document-source/` — sources modifiables : `engine.js` (moteur, objets, décors, interfaces), `directions.js` (les 10 identités : palettes, typos, signes, objets, silhouettes, rituels, notes), `grammars.js` (les 7 grammaires de mise en page), `visuals.js`, `book.js` / `book.css`.
- `photographies/` — `tiziana/` (19 photos réelles), `detourages/`, `environnements/` (CC0), `references/`.
- `brand-assets/` — polices OFL et logos Fynovates. *Ce dossier remplace `/assets/` : le `.gitignore` racine du dépôt ignore tout dossier `assets/`, et sa configuration n'a pas été modifiée.*
- `textures/`, `mockups/` — réservés aux exports transverses ; les textures et mockups propres à chaque direction sont dans son dossier.
- `sources/` — `sources-photographiques.md`, scripts de récupération CC0, planches de contrôle.

## Régénérer

```bash
cd document-source
node render-visuals.cjs all 1   # compositions (≈ 580 visuels)
node render-visuals.cjs all 2   # pages Instagram / LinkedIn / YouTube
node make-pdf.cjs               # PDF A3 + aperçus + contrôle des débordements
```

## Fiabilité

- Tiziana n'apparaît que sur ses vraies photos et des détourages ; seul l'étalonnage change. Les décors sont des photomontages de simulation. Les tenues sans photo existante sont des emplacements « photo à réaliser ».
- Aucun parcours, fonction ou opinion inventé : seuls le titre LinkedIn et le texte « Infos » validés, et la ligne « Fondatrice & directrice de Fynovates », sont repris.
- Traits, convictions, objets, tenues et rituels sont des propositions à valider avec Tiziana. Les notes sont des appréciations créatives.
