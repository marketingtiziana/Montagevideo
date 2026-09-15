# Séquence Instagram Story — « Les 3 pays que je déconseille en 2026 »

Marque : **Fynovates** — conseil en fiscalité internationale. Ton premium et éditorial.
6 visuels verticaux **1080 × 1920 (9:16)**, prêts à publier.

## Livrables

| Fichier | Contenu |
|---|---|
| `out/story-1.png` → `out/story-6.png` | Les 6 visuels finaux, 1080 × 1920 |
| `out/planche-contact.html` | Planche de relecture : les 6 côte à côte |
| `backgrounds/*.png` | Photos d'arrière-plan sources (générées, 9:16) |

`backgrounds/01b-planisphere.png` est l'**option de repli** prévue pour la story 1
(planisphère sombre à trois points rouges). La version retenue est la vue aérienne
qui fusionne skyline désertique, côte atlantique et jungle en une seule image.

## Direction artistique

Identique sur les 6 visuels — même grille, même typo, même traitement d'image.

- **Photo plein écran**, cadrage `cover`, centré.
- **Dégradé vertical noir** unique : léger en haut (lisibilité de la pagination),
  ≈ 60 % en zone de texte, appuyé jusqu'à 93 % en bas.
- **Typographie** : Inter (variable), blanc, aligné à gauche, largeur de bloc 856 px.
  - `kicker` 70 px / 700 — « Numéro 1 : Dubaï. »
  - `lead` 58 px / 600 — accroche des stories 1 et 5
  - `body` 42 px / 400 — corps de texte
  - `cta` 48 px / 600 — appel à l'action de la story 6
  - `hero` 156 px / 800 doré — le mot **CODEX**
- **Mots-clés** : 2 à 3 par visuel, en **gras blanc** ou en **doré sobre** `#E5C07B`.
- **Pagination** discrète en haut à droite (`1/6` … `6/6`), signature `FYNOVATES`
  en haut à gauche.
- Filet doré de 64 × 3 px au-dessus de chaque bloc de texte — seul élément graphique.
- Aucun emoji, aucun sticker, aucun cadre.

### Zones réservées à l'interface Instagram

- **Haut** : 168 px libres au-dessus de l'en-tête (avatar et pseudo).
- **Bas** : 400 px dégagés (barre « Répondre »).
- **Story 6** : 620 px dégagés en bas pour poser le sticker.

## Regénérer les visuels

```bash
python3 stories/build_stories.py
```

Le script télécharge Inter depuis le miroir `google/fonts` si nécessaire, compose
chaque story en HTML puis la capture en PNG via le Chromium fourni par Playwright.
Aucune dépendance Python à installer.

## Modifier les textes

Tout le contenu éditorial est dans la liste `STORIES` de `build_stories.py`.
Balisage inline :

- `**mot**` → gras blanc
- `{{mot}}` → doré `#E5C07B`

Relancer le script après modification.
