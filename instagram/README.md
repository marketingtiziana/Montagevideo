# FYNOVATES — kit Instagram (version 3, corporate, couvertures business)

- `output/fynovates-instagram-post-NN-*.png` : 12 publications 1080 × 1350 (couverture, photo et titre, carrousel).
- `output/fynovates-instagram-carrousel-slide-02.png` : diapositive intérieure.
- `output/fynovates-instagram-reel-NN.png` : couvertures de Reels 1080 × 1920.
- `output/fynovates-instagram-une-*.png` : couvertures de stories à la une (sans icône).
- `output/fynovates-instagram-profil-mockup.png` : maquette du profil.
- `assets/photos/` : photos Unsplash d'origine et versions duotone navy (`*-duo.jpg`), crédits dans `CREDITS.md`.

Modifier `FEED`, `REELS` et `HIGHLIGHTS` dans `build.mjs`, puis `node instagram/build.mjs`.
Pour ajouter une photo : la déposer dans `assets/photos/`, créer sa version `-duo.jpg` (même traitement) et l'appeler par son nom.
