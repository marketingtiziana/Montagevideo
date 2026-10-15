# Rester en France, mais structuré — Fynovates

Série de 6 Instagram Stories, 1080 × 1920 (9:16 exact). La séquence à
contre-courant : pour une partie de l'audience, la bonne décision fiscale n'est
pas de partir mais de rester et de se structurer — close par le CTA GO et
l'annonce du pôle France.

```
node build.mjs      # génère src/story-N.html, output/story-N.png et preview.html
```

> **Sur le contenu.** Les textes, le positionnement et l'annonce du pôle France
> viennent du client. La story 2 s'appuie sur la même actualité géopolitique que
> la série `stories-dubai/` ; elle est composée telle quelle, ce dépôt ne la
> source ni ne la vérifie.

## Ce que produit le build

| Fichier | Rôle |
|---|---|
| `output/story-1.png` … `story-6.png` | les 6 visuels finaux, 1080 × 1920 |
| `output/fynovates-rester-en-france.zip` | les 6 PNG en une archive, pour les récupérer d'un coup |
| `preview.html` | les 6 côte à côte, avec les repères de grille posés à l'échelle |
| `src/story-N.html` | une page par story, régénérée à chaque build — ne pas éditer à la main |

L'archive est un contenant, pas une conversion : les PNG y sont copiés tels
quels, sans réencodage. Ce qu'on en extrait est bit à bit ce qu'il y a dans
`output/`. Elle n'est pas versionnée — elle dupliquerait des fichiers déjà
présents dans le dépôt ; `node build.mjs` la régénère.

Le texte vit dans `src/content.js`, la mise en page dans `src/story.css`. Les
pages HTML sont dérivées : toute modification directe est écrasée au build
suivant.

## La séquence

| # | Gabarit | Contenu |
|---|---------|---------|
| 1 | ouverture | « Je vais dire un truc qu'on n'attend pas de moi. » |
| 2 | opposition | les deux camps : gèrent une crise / n'ont rien à gérer |
| 3 | leviers | les quatre leviers français, et l'écart qu'ils produisent |
| 4 | corps | structure par défaut ou structure par choix |
| 5 | corps | l'annonce du pôle France |
| 6 | cta | GO, à commenter pour faire regarder sa situation |

## Le filet doré

C'est la signature de la série, et la seule chose que les deux gabarits
inventés ici ont en commun avec les autres séries : une ligne dorée à
`rgba(212, 175, 55, 0.45)`, déclarée une seule fois dans `--filet`.

- **Story 2** — il est horizontal et sépare les deux camps. Chaque camp porte un
  profil en gris puis un verdict en 54 px : le premier en rouge (la sanction),
  le second en or (la position tenue). L'ordre n'est pas neutre — c'est la
  dernière ligne que l'œil garde.
- **Story 3** — il passe à la verticale et tient la liste des quatre leviers.

Les deux blocs sont vérifiés au build : même colonne de départ, couleurs de
verdict distinctes, leviers sur deux lignes au maximum.

## La grille

| Repère | Valeur | Raison |
|---|---|---|
| marges latérales | 100 px | identiques sur les 6 |
| colonne de texte | 800 px max | |
| ligne haute | 160 px | rien au-dessus : zone des stickers Instagram |
| ligne basse | 1620 px | rien en dessous : 1920 − 300 |

Les stories 1 à 5 ancrent leur bloc sur la ligne basse, la story 6 est centrée
horizontalement autour du bloc GO. La pagination `N/6` est le seul élément de
la ligne haute : la série ne porte pas de titre répété.

## Les contrôles bloquants

`node build.mjs` refuse de livrer si l'un des sept échoue, et nomme le coupable.

1. **Zone morte haute** — rien ne monte au-dessus de 160 px.
2. **Zone morte basse** — rien ne descend sous 1620 px.
3. **Pagination** — empreinte géométrique identique sur les six (position,
   taille, graisse, interlettre). Un pixel d'écart arrête le build.
4. **Les deux camps** — profils et verdicts partent de la même colonne, et les
   deux verdicts portent deux couleurs différentes. Sans ce dernier point, une
   erreur de `ton` dans `content.js` ferait disparaître l'opposition sans rien
   casser visiblement.
5. **Les leviers** — même colonne de départ, et deux lignes au maximum par
   levier. Un levier qui passe à trois lignes casse la lecture en un coup d'œil
   bien avant d'atteindre la ligne des 1620 px : le contrôle de débordement ne
   le verrait pas.
6. **Contraste WCAG 2.1 AA, mesuré et pas supposé** — une seconde passe rend la
   page texte masqué, la dessine dans un canvas, et échantillonne le fond
   réellement composité sous chaque fragment de texte. Le seuil est choisi par
   élément (4,5:1 en texte normal, 3:1 dès 24 px ou 18,66 px en gras), et c'est
   le pire pixel de la zone qui décide.
7. **Dimensions** — 1080 × 1920 relus dans l'en-tête du PNG produit.

### Ce que le contrôle de contraste a corrigé ici

Trois des six fonds sont lumineux là où le texte vit — le plan d'architecte
éclairé en biais, les colonnes de pierre au soleil, le marbre réfléchissant du
hall. Au premier build, le rouge de « un enfer fiscal » mesurait **3,18:1** sur
le papier du plan, soit 0,18 au-dessus du seuil : techniquement conforme, mais
une marge que le moindre réglage aurait reprise.

Le renfort bas a donc été rallongé (1280 → 1400 px) et sa montée avancée. Après
correction, le plancher de la série est à **4,1:1** pour un seuil à 3,0, et la
story 4 est passée de 4,32 à 5,01. Les stories 1, 2, 5 et 6 n'ont pas bougé :
leur minimum est porté par la pagination en haut du cadre, que ce renfort ne
touche pas.

## Les photos

Six photos générées via Higgsfield (`gpt_image_2_5`), upscalées en 2K avant
composition pour que le cadre sous-échantillonne au lieu d'étirer. Les prompts
et la direction artistique sont dans `prompts-higgsfield.md`.

**Le texte n'est jamais dans la photo.** Il est composé en HTML/CSS par-dessus,
donc corrigible sans rien régénérer.
