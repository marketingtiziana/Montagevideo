# Tiziana Caci — personal branding CEO & international leadership

Recherche créative indépendante. **Rien n’est intégré à la plateforme Fynovates** (`workspace/` n’est pas modifié).

## Consulter

- **Galerie** : ouvrir `index.html` (hors ligne, sans dépendance).
- **Exports JPEG** :

| Dossier | Contenu |
|---|---|
| `presentation-finale/` | 00 couverture · 01 les 8 textures · 02 les 4 directions · 03–06 présentation de chaque direction (publications en grand, 3 carrousels avec pages intérieures) · 07 les 4 profils côte à côte · 08 photographies et prises de vue à organiser · 09 évaluation sur 8 critères · 10 recommandation |
| `directions-artistiques/` | système graphique complet de chaque direction (palette, place du beige, typographies, hiérarchie, cadrage, traitement des portraits, textures, filets, motifs, grille, titres, carrousels) |
| `textures-beige/` | une planche par texture (aperçu, HEX, intensité, application professionnelle, usage) ; `tuiles/` en 1080 × 1350 |
| `templates/` | 7 gabarits par direction (portrait avec titre, prise de position, couverture de carrousel, finance / business, citation, photo sans texte, international) |
| `feeds-instagram/` | planche du feed de chaque direction ; sous-dossiers : les 12 publications et les pages intérieures des carrousels |
| `mockups/` | simulation du profil Instagram complet (photo de profil, bio, Stories à la une, grille) |
| `photographies/` | 19 photos réelles de Tiziana, 13 images CC0, `SOURCES.md` |

## Les quatre directions

1. **The International CEO** — couverture de magazine économique : photos plein cadre étalonnées bleu nuit, Instrument Serif, cartouche crème.
2. **The Business Woman** — découpes franches photo / bloc noir ou sable, Manrope ExtraBold + Cormorant italique.
3. **The Financial Strategist** — rapport de banque privée : grille légendée, Libre Caslon + Inter, schémas sans chiffres.
4. **The Modern Executive** — titres géants DM Serif Display, encoches, blocs crème décalés, vert pétrole en couleur secondaire.

Recommandation : **The International CEO**, avec la grille légendée du Financial Strategist pour les contenus finance.

Polices : toutes gratuites (Google Fonts, SIL OFL), incluses dans `src/typefaces/`.

## Modifier et réexporter

- `src/content.js` — titres, carrousels, bio
- `src/directions.js` — les 4 systèmes et leurs gabarits
- `src/textures.js` — les 8 textures

```bash
node render.cjs
```

## Points d’attention

- Bio : « CEO & fondatrice de @fynovates » reprend le rôle indiqué dans le playbook ; aucun titre, diplôme ou résultat ajouté.
- Photos de Tiziana : recadrage et étalonnage uniquement, aucune retouche des traits ; droit d’usage à confirmer.
- Schémas « finance » : courbes illustratives sans valeurs ni données.
- La charte actuelle prévoit un feed « photographies seules » : ces propositions ajoutent des pages typographiques. À arbitrer.
