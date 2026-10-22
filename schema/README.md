# Schéma 16:9 à annoter à la main

- `index.html` : page autonome ; le schéma est un SVG généré depuis l'objet `schema`, traits rough.js (`rough.min.js` copié en local), textes en Caveat 700 et Patrick Hand (Google Fonts).
- Ouvrir `index.html` dans un navigateur pour voir le rendu en 1920 × 1080.
- Export PNG : `npm i playwright` (une fois), puis `node export.mjs` dans ce dossier.
- Résultat : `schema.png` (1920 × 1080) et `schema@2x.png` (3840 × 2160), fond blanc opaque.
- L'export vérifie et logue : polices chargées, fond blanc, une seule encre, tiret cadratin, tailles ≥ 30 px, marges, chevauchements (encre réelle), 60 px du bas vides, 9 cellules vides, 5 cercles, double soulignement, proportion de blanc (≥ 35 %).
- Changer un texte : modifier la chaîne dans l'objet `schema` en haut de `index.html`, puis relancer `node export.mjs`.
- Changer la police : la constante `FONT` et la ligne `<link>` Google Fonts en haut de `index.html`.
- Tailles, encre, traits, positions : les constantes `FS`, `INK`, `ROUGH` et `G` ; chaque élément a sa seed, le rendu est identique à chaque export.
