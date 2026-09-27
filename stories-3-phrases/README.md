# Fynovates — « Les 3 phrases de fin d'appel »

Séquence de 6 Instagram Stories, **1080 × 1920 (9:16)**, qui pousse à réserver un appel
diagnostic. Photo plein écran + dégradé sombre + texte en overlay HTML/CSS, exporté en PNG
via Puppeteer.

## Livrables

| Chemin | Contenu |
|---|---|
| `out/story-1.png` → `out/story-6.png` | Les 6 visuels finaux, **1080 × 1920 exactement** |
| `out/planche-contact.html` | Planche de relecture : les 6 côte à côte |
| `src/story-N.html` | La source HTML de chaque story (regénérée à chaque build) |
| `src/story.css` | La grille et la typographie, communes aux 6 |
| `src/content.js` | Tout le contenu éditorial |
| `backgrounds/bg-1.png` → `bg-6.png` | Photos sources, 2294 × 4096 |
| `prompts-higgsfield.md` | Les prompts photo, pour régénérer une image |

## Regénérer

```bash
npm install     # puppeteer-core uniquement
npm run build   # ou : node build.mjs
```

Le script compose chaque story en HTML, l'ouvre dans le Chromium local via Puppeteer
(viewport 1080 × 1920, `deviceScaleFactor: 1`), **vérifie que rien ne descend dans les
280 px du bas**, puis capture le PNG. Le build échoue si la contrainte est violée — la
marge réelle est affichée à chaque story.

Chromium est cherché sous `/opt/pw-browsers/` ; sur une autre machine, passer le chemin
par `CHROME_PATH=/usr/bin/chromium node build.mjs`.

## Composition (identique sur les 6)

- **Photo** plein écran, `object-fit: cover`, centrée.
- **Dégradé sombre** systématique par-dessus : noir 0 % en haut → **65 % vers le
  centre-bas**, maintenu jusqu'en bas. Un léger voile (34 %) sur les tout premiers pixels
  garde la pagination lisible sur les photos claires.
- **Bloc texte** centré horizontalement **et** verticalement (flexbox), `text-align: center`,
  `max-width: 850px`.
- **Pagination** `1/6` … `6/6` en haut à droite, `#9CA3AF` à 60 % d'opacité.
- **Zone basse de 280 px strictement vide**, vérifiée au build.

### Typographie

Inter, chargée depuis Google Fonts puis **vendorisée dans `src/inter/`** (woff2 + CSS) pour
que le rendu soit identique hors ligne et d'un build à l'autre.

| Classe | Taille | Graisse | Usage |
|---|---|---|---|
| `badge` | 26 px | 700, uppercase, letter-spacing 3 px | « PHRASE 1/3 », doré |
| `quote` | 68 px | 700 | Les trois citations |
| `lead` | 42 px | 600 | Accroche |
| `body` | 38 px | 400 | Corps de texte |
| `cta` | 128 px | 800 | Le mot `GO`, encadré doré |

### Couleurs

| Rôle | Valeur |
|---|---|
| Texte | `#FFFFFF` |
| Mots-clés | `#D4AF37` (doré) |
| Accent | `#E05C5C` (rouge, story 3 uniquement) |
| Pagination | `#9CA3AF` à 60 % |

## Modifier les textes

Tout est dans la liste `STORIES` de `src/content.js`. Balisage inline :

- `{{mot}}` → doré `#D4AF37`
- `[[mot]]` → rouge `#E05C5C`
- `**mot**` → gras blanc

Relancer `npm run build` après modification.

## Cohérence des photos

Les 6 partagent la palette demandée — doré chaud, ombres bleu nuit, lumière de fin de
journée ou intérieur tamisé.

`bg-6` a été **régénérée une fois** : la première version était un voile délavé sans les
ombres bleu nuit de la série, et la silhouette tombait exactement derrière l'encadré `GO`.
La version retenue décale la silhouette à droite et bas, et rétablit le dégradé bleu nuit →
or. Détail et prompt corrigé dans `prompts-higgsfield.md`.
