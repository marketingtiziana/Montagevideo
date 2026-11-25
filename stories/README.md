# FYNOVATES — système de Stories Instagram

- `STRATEGIE.md` : stratégie éditoriale (piliers, rythme, calendrier 4 semaines, 40 idées, CTA, indicateurs, validation).
- `output/` : 60 PNG 1080 × 1920 prêts à publier (zones des stickers laissées vides).
  - `sequence-A…F-*` : six séquences complètes.
  - `modele-NN-*` : variantes des neuf familles de modèles.
  - `une-*` : couvertures des stories à la une.
- `apercus/` : mêmes écrans avec stickers Instagram simulés (pour la planche, pas pour la publication).
- `planche/index.html` : planche de présentation.
- `content.mjs` : **tous les textes, photos et options**, à modifier.
- `templates.mjs` : mise en page des neuf familles (ne modifier que pour faire évoluer le design).
- `build.mjs` : génère `output/` et `apercus/`.

## Créer une nouvelle Story
1. Copier une ligne existante dans `content.mjs` (dans `SEQUENCES` ou `VARIANTES`) et changer ses textes.
2. Lancer :

```bash
node stories/build.mjs
```

3. Importer le PNG dans Instagram et ajouter le sticker natif (sondage, quiz, questions, lien) dans la zone libre.

Les `[Prénom]` sont à remplacer par le prénom réel des experts. Les photos (`instagram/assets/photos/`) sont des exemples Unsplash à remplacer par des photos de l'équipe.
