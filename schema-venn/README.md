# Schéma 16:9 « Trois cercles, une seule zone sûre » à annoter sur tablette (charte Inter)

- `index.html` : page autonome HTML + SVG inline, police Inter (Google Fonts, repli sur une Inter installée), aucune image externe, aucun framework. Les cercles sont des `<circle>` SVG, les étiquettes du texte SVG.
- Ouvrir `index.html` dans un navigateur pour voir le rendu en 1920 × 1080.
- Export PNG : `npm i playwright` (une fois), puis `node export.mjs` dans ce dossier.
- Résultat : `schema.png` (1920 × 1080) et `schema@2x.png` (3840 × 2160), fond blanc opaque.
- L'export vérifie et logue : police Inter, tiret cadratin, liste des couleurs du DOM, 3 cercles sans remplissage à contour 2 px gris, largeurs des trois intersections deux à deux et de la zone centrale, étiquettes hors des cercles, marges, chevauchements, 80 px du bas vides, 160 px de vide après « 1 · 2 · 3 », filet indigo du titre, proportion de blanc (≥ 60 %).
- Changer un texte : modifier les chaînes dans le tableau `circles` du script, ou le texte HTML du titre et du bas de page, puis relancer `node export.mjs`.
- Changer la géométrie (rayon, écart des cercles, descente du cercle du bas) : la constante `G` dans le script ; l'export remesure les intersections.
- Changer la police : la ligne `<link>` Google Fonts et `font-family` dans le CSS.
- Couleurs et marges : les variables CSS `:root` en tête de `index.html`.
