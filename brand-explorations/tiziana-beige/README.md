# Tiziana Caci — dossier de direction artistique (univers beige)

Recherche créative indépendante. **Rien n’est intégré à la plateforme Fynovates** (`workspace/` n’est pas modifié).

## Consulter

- **Galerie** : ouvrir `index.html` dans un navigateur (hors ligne, sans dépendance).
- **Fichiers exportés** (JPEG) :

| Dossier | Contenu |
|---|---|
| `presentation-finale/` | 00 couverture · 01 comparatif des 8 textures · 02 comparatif des 4 directions · 03–06 présentation de chaque direction (3 publications en grand, carrousels avec pages intérieures, logique, impression, palette, typographies) · 07 les 4 feeds côte à côte · 08 photographies et sources · 09 synthèse notée · 10 recommandation |
| `textures/` | une planche par texture (aperçu grand format, HEX, intensité, couleurs compatibles, post d’exemple) ; `tuiles/` : chaque texture seule en 1080 × 1350 |
| `directions-artistiques/` | le système graphique de chaque direction : palette, typographies, textures, éléments graphiques, règles de composition |
| `feeds-instagram/` | chaque feed de 12 publications dans un profil simulé, avec la répartition éditoriale |
| `publications/<direction>/` | les 12 publications en 1080 × 1350 ; `carrousels/` : pages intérieures (expertise, récit, réflexion) |
| `photographies/` | `tiziana/` (17 photos réelles), `libres-de-droits/` (13 images CC0), `SOURCES.md` (sources et licences) |

## Les quatre directions

1. **Carnet** — le magazine de fond : Cormorant Garamond + Inter, papier éditorial, photos encadrées d’une marge crème.
2. **Atelier** — la matière et la main : Fraunces + Manrope, papier artisanal et sable, tirages photo posés sur la page.
3. **Tribune** — la prise de position : Playfair Display + Manrope, lin, manchette, pages noires, photos en noir et blanc.
4. **Architecte** — la structure et l’espace : Manrope ExtraBold + Instrument Serif italique, pierre et plans translucides, filet bleu nuit.

Toutes les polices sont gratuites (Google Fonts, licence SIL OFL) et incluses dans `src/typefaces/`.

## Modifier et réexporter

Les visuels sont des gabarits HTML/CSS générés en JavaScript, aux dimensions natives :

- `src/content.js` — titres des 12 publications et textes des carrousels
- `src/directions.js` — les 4 systèmes (palettes, typographies, compositions)
- `src/textures.js` — les 8 textures
- `src/photos.js` — liste des photographies (générée depuis `photographies/*/index.json`)

```bash
node render.cjs
```

régénère toutes les planches et toutes les publications (Playwright, lecture directe du fichier local).

## Points d’attention

- La charte actuelle prévoit un feed Instagram « photographies uniquement » : ces propositions ajoutent des publications typographiques et des carrousels. À arbitrer.
- Photos de Tiziana : recadrage et étalonnage seulement (Tribune en noir et blanc), aucune retouche des traits. Droit d’usage à confirmer.
- Images libres de droits en 1024 px : utilisées en format réduit ; à remplacer par la haute définition de la page source avant publication.
