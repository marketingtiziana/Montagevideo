# FYNOVATES — couvertures TikTok et feed

- `output/fynovates-tiktok-couverture-NN-X.png` : couvertures 1080 × 1920 (X = gabarit A navy, B pierre, C blanc).
- `output/fynovates-tiktok-feed-mockup.png` : maquette du profil avec les douze vidéos.
- `proposition.html` : planche de proposition (gabarits, feed, règles, zones de sécurité).

## Ajouter une vidéo
1. Ajouter `['RUBRIQUE', 'Titre avec un *mot clé* mis en valeur']` à la fin de `EPISODES` dans `covers.mjs` (et un gabarit à `PATTERN`).
2. Lancer `node tiktok/covers.mjs`.

Le titre reste entre 330 et 1 500 px de haut : visible dans la vignette 3:4 du profil et au-dessus de la légende de la vidéo.
