# Mindmap reel 9:16, 9 états, style feutre sur papier

- `index.html` : page autonome ; la mindmap est un SVG généré depuis l'objet `tree`, traits rough.js (`rough.min.js` copié en local), textes en Caveat et Patrick Hand (Google Fonts).
- Ouvrir `index.html?state=N` (N de 1 à 9) dans un navigateur ; flèches gauche / droite pour changer d'état en live.
- Export PNG : `npm i playwright` (une fois), puis `node export.mjs` dans ce dossier.
- Résultat : `out/mindmap_01.png` à `out/mindmap_09.png`, 1080 × 1920, fond blanc opaque, 800 px du haut vides, plus `out/mindmap_png.zip` qui regroupe les 9 PNG.
- L'export vérifie et logue : taille, zone haute vide, marges, chevauchements (encre réelle), une seule encre, tiret cadratin, formes fermées à l'état 6, diff des coordonnées et des paths entre états.
- Changer un texte : modifier la chaîne dans l'objet `tree` en haut de `index.html`, puis relancer `node export.mjs`.
- Changer la police : la constante `FONT` (titres et détails) et la ligne `<link>` Google Fonts en haut de `index.html`.
- Changer les états (qui apparaît quand, qui passe à 35 %) : les tableaux `show` et `dim` juste sous `tree`.
- Encre, tailles, traits, positions : les constantes `INK`, `FS`, `LINE`, `ROUGH` et `GEO` ; le layout est calculé une fois, chaque nœud a sa seed, rien ne bouge entre les états.
