# Schéma 16:9 « Cohérent / Incohérent » à annoter sur tablette (charte Inter)

- `index.html` : page autonome HTML + CSS, mise en page en grille, police Inter (Google Fonts, repli sur une Inter installée), aucune image externe, aucun framework.
- Ouvrir `index.html` dans un navigateur pour voir le rendu en 1920 × 1080.
- Export PNG : `npm i playwright` (une fois), puis `node export.mjs` dans ce dossier.
- Résultat : `schema.png` (1920 × 1080) et `schema@2x.png` (3840 × 2160), fond blanc opaque.
- L'export vérifie et logue : police Inter, tiret cadratin, liste des couleurs du DOM (blanc, navy, indigo, gris), tailles ≥ 26 px, marges, chevauchements, 80 px du bas vides, 10 cellules vides, 1 cercle, espacements de la ligne « Montant / critère », filet indigo du titre, proportion de blanc (≥ 45 %).
- Changer un texte : modifier le texte directement dans `index.html` (chaque texte porte l'attribut `data-text`), puis relancer `node export.mjs`.
- Changer la police : la ligne `<link>` Google Fonts et `font-family` sur `body` dans `index.html`.
- Couleurs et marges : les variables CSS `:root` en tête de `index.html` ; largeur de la colonne des intitulés : `th.corner` (28 %) ; hauteur des lignes : `tbody th, tbody td`.
