# Mindmap reel 9:16, 9 états, style feutre sur papier

- `index.html` : page autonome ; la mindmap est un SVG généré depuis l'objet `tree`, traits rough.js (`rough.min.js` copié en local), textes en Caveat et Patrick Hand (Google Fonts).
- Ouvrir `index.html?state=N` (N de 1 à 9) dans un navigateur ; flèches gauche / droite pour changer d'état en live. Deux formats : `?format=9x16` (reel, défaut) et `?format=16x9` (1920 × 1080, écran large).
- Export PNG : `npm i playwright` (une fois), puis `node export.mjs` dans ce dossier (les deux formats), ou `node export.mjs 16x9` pour un seul.
- Résultat : `out/9x16/` (1080 × 1920, 800 px du haut vides pour la facecam) et `out/16x9/` (1920 × 1080, plein cadre), 9 PNG `mindmap_01.png` à `mindmap_09.png` et un ZIP par format.
- L'export vérifie et logue : taille, zone haute vide, marges, chevauchements (encre réelle), une seule encre, tiret cadratin, formes fermées à l'état 6, diff des coordonnées et des paths entre états.
- Changer un texte : modifier la chaîne dans l'objet `tree` en haut de `index.html`, puis relancer `node export.mjs`.
- Changer la police : la constante `FONT` (titres et détails) et la ligne `<link>` Google Fonts en haut de `index.html`.
- Changer les états (qui apparaît quand, qui passe à 35 %) : les tableaux `show` et `dim` juste sous `tree`.
- Encre, tailles, traits : `INK`, `FS`, `LINE`, `ROUGH` ; positions par format : `FORMATS` ; le layout est calculé une fois, chaque nœud a sa seed, rien ne bouge entre les états.
