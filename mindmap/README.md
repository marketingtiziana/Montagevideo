# Mindmap reel 9:16, 9 états

- `index.html` : page autonome, la mindmap est dessinée en SVG depuis l'objet `tree` (aucune dépendance).
- Ouvrir `index.html?state=N` (N de 1 à 9) dans un navigateur ; flèches gauche / droite pour changer d'état en live.
- Export PNG : `npm i playwright` (une fois), puis `node export.mjs` dans ce dossier.
- Résultat : `out/mindmap_01.png` à `out/mindmap_09.png`, 1080 × 1920, fond opaque, 800 px du haut vides, plus `out/mindmap_png.zip` qui regroupe les 9 PNG.
- L'export vérifie et logue : taille, zone haute vide, marges, chevauchements, palette, tiret cadratin, diff des coordonnées entre états.
- Changer un texte : modifier la chaîne dans l'objet `tree` en haut de `index.html`, puis relancer `node export.mjs`.
- Changer les états (qui apparaît quand, qui passe à 35 %) : les tableaux `show` et `dim` juste sous `tree`.
- Couleurs, tailles, positions : les constantes `C`, `FS`, `LINE` et `GEO` ; le layout est calculé une fois sur l'arbre complet.
- Police : Inter via Google Fonts, avec repli sur une Inter installée en local.
