# Le classement des pires conseils fiscaux d'Instagram — Fynovates

Série de 6 Instagram Stories, 1080 × 1920 (9:16 exact). Classement inversé du
N°4 au N°1, qui se referme sur une story FAQ.

```
node build.mjs      # génère src/story-N.html, output/story-N.png et preview.html
```

## Ce que produit le build

| Fichier | Rôle |
|---|---|
| `output/story-1.png` … `story-6.png` | les 6 visuels finaux, 1080 × 1920 |
| `preview.html` | les 6 côte à côte, avec les repères de grille posés à l'échelle |
| `src/story-N.html` | une page par story, régénérée à chaque build — ne pas éditer à la main |

Le texte vit dans `src/content.js`, la mise en page dans `src/story.css`. Les
pages HTML sont dérivées : toute modification directe est écrasée au build
suivant.

## La séquence

| # | Gabarit | Contenu |
|---|---------|---------|
| 1 | ouverture | « J'ai fait un classement. » — l'annonce |
| 2 | N°4 | « Passe tout en frais pro, personne ne vérifie. » |
| 3 | N°3 | « Reste moins de 183 jours en France et tu ne paies plus rien. » |
| 4 | N°2 | « Monte une LLC américaine, c'est 0% et invisible. » |
| 5 | N°1 | « Fais-le d'abord, tu régulariseras si on te demande. » |
| 6 | faq | sticker « Posez-moi une question » — toute la moitié basse est laissée libre |

## La grille

- **Zones mortes** : rien au-dessus de 160 px, rien sous 1620 px (stickers).
  La story 6 est plus stricte encore : tout son texte s'arrête avant 950 px,
  pour que le sticker questions occupe le centre-bas.
- **Colonne** : 800 px de large, marges latérales de 100 px, alignée à gauche —
  sauf la story 6, centrée.
- **Numéro de classement** : posé à `y = 706 px` sur les quatre rangs, suivi du
  filet doré à `y = 900 px`. Le build refuse de livrer si l'un des quatre bouge
  d'un seul pixel.
- Le 706 n'est pas arbitraire : c'est la valeur pour laquelle la story la plus
  longue (N°3) vient mourir exactement sur la ligne des 1620 px. Les rangs plus
  courts s'arrêtent un peu plus haut, le repère du haut reste commun.

## Le traitement des photos

Grading identique sur les 6 : `saturate(0.85) contrast(1.08)`. Par-dessus, le
dégradé imposé par la direction artistique, puis deux renforts locaux :

- **en haut** — l'or `#D4AF37` a une luminance relative de 0,45 ; pour tenir le
  3:1 du « large text » il lui faut un fond sous 0,117, autrement dit
  franchement noir. Le renfort est donc une bande courte et pleine sous la ligne
  d'en-tête, qui retombe à zéro avant 360 px : le sujet de la photo reste intact.
- **en bas** — sous le bloc texte, là où l'or et le rouge à 40 px doivent passer
  le AA même sur une photo claire.

La story 6 a son propre renfort, plus léger (la photo doit rester la plus claire
de la série) et à très longue traîne : un fondu court laissait une arête
horizontale parfaitement visible en travers de la table, juste sous la dernière
ligne de texte.

## Les cinq contrôles bloquants

`build.mjs` refuse d'écrire un PNG si l'un échoue, et nomme le coupable :

1. aucun texte au-dessus de 160 px ;
2. aucun texte sous 1620 px — 950 px pour la story 6 ;
3. le numéro de classement au pixel près sur les quatre rangs (`top`, `left`,
   `hauteur`, et position du filet) ;
4. **contraste WCAG 2.1 AA mesuré, pas supposé** : une seconde passe rend la page
   texte masqué, et chaque run est comparé aux pixels réels du fond composité
   sous lui. Le ratio retenu est le pire de la zone. Seuil choisi par élément :
   4,5:1 en texte normal, 3:1 dès 24 px (ou 18,66 px en gras). Le texte
   semi-transparent est composité sur le fond avant mesure ;
5. dimensions relues dans l'en-tête des PNG livrés : 1080 × 1920 exactement.

Relevé du dernier build :

| # | texte | contraste min | seuil |
|---|-------|---------------|-------|
| 1 | 160 → 1620 px | 7,55:1 | 3 |
| 2 | 160 → 1494 px | 5,61:1 | 3 |
| 3 | 160 → 1620 px | 7,81:1 | 3 |
| 4 | 160 → 1552 px | 3,46:1 | 3 |
| 5 | 160 → 1562 px | 4,28:1 | 3 |
| 6 | 160 → 920 px | 5,03:1 | 3 |

## Typographie française

`typo()` applique, avant tout rendu : espace insécable après `«`, avant `»` et
avant `? ! ; : %` ; apostrophe typographique `’` ; espace fine insécable comme
séparateur de milliers. Sans cette dernière, « 25 000 dollars » se coupait en fin
de ligne et le montant se lisait en deux morceaux.

## Le rendu

Puppeteer, viewport 1080 × 1920, `deviceScaleFactor: 1`, capture avec `clip`
explicite. `--disable-lcd-text` est indispensable : sans lui l'anti-aliasing
sous-pixel pose des franges colorées sur les bords des lettres claires, fatales
sur un PNG destiné à Instagram.

## Les photos

Générées via Higgsfield (`gpt_image_2_5`, ratio 9:16), puis passées en upscale 2K
avant composition — le rendu natif fait 752 × 1344, soit une interpolation de
1,44× à l'export. Prompts et écarts assumés : `prompts-higgsfield.md`.

Sans accès Higgsfield, déposer six fichiers verticaux `bg-1.jpg` … `bg-6.jpg`
dans `backgrounds/` : le build refuse de produire quoi que ce soit tant qu'un
fichier manque, et nomme celui qui manque.
