# Fynovates — « Le quiz LLC »

Six Instagram Stories, **1080 × 1920 exactement** : le test de 4 questions à passer avant
d'acheter une LLC américaine.

**Aucune image, aucune illustration, aucune photo, rien d'importé.** Tout est composé en
HTML/CSS — y compris les cases à cocher et leurs coches, dessinées au trait CSS. La
typographie est le seul matériau.

## Livrables

| Chemin | Contenu |
|---|---|
| `output/story-1.png` → `story-6.png` | Les 6 visuels finaux, 1080 × 1920 |
| `preview.html` | Les 6 en planche, avec la ligne des « Q » et la limite basse tracées dessus |
| `src/story.css` | La composition, commune aux 6 |
| `src/content.js` | Tout le contenu éditorial |
| `src/inter/` | Inter vendorisée (woff2 + CSS), pour un rendu identique hors ligne |
| `src/story-N.html` | La source HTML de chaque story — produite par le build, non versionnée |

## Regénérer

```bash
npm install     # puppeteer-core uniquement
npm run build   # ou : node build.mjs
```

Chromium est cherché sous `/opt/pw-browsers/` ; sur une autre machine, passer le chemin par
`CHROME_PATH=/usr/bin/chromium node build.mjs`.

## La composition

Papier `#FAFAF8`, encre `#111111`, corps `#3A3A3A`. Marges latérales 110 px, largeur utile
860 px (celle du filet d'en-tête), bloc de texte 820 px maximum, aligné à gauche.

**L'en-tête**, identique sur les six : `LE TEST · LLC` en 26 px uppercase, letter-spacing
4 px, `#999999`, la pagination `N/6` à droite, un filet de 1 px `#DDDDDD` sous les deux. C'est
lui qui donne le côté copie d'examen — et c'est le premier contrôle du build.

**Les « Q » géants** — 220 px Inter 900, interlignage resserré à 0.78 pour que le texte vienne
s'appuyer sous le chiffre au lieu de flotter derrière une ligne vide. Le `letter-spacing`
négatif rogne la droite du bloc ; une marge gauche de `-0.012em` rend ce rognage, sinon le
« Q » serait décalé d'un ou deux pixels par rapport à la colonne de texte.

**Les cases à cocher** (stories 1 et 6) : carrés de 64 px, bordure 3 px noire. La coche de la
story 6 est faite de deux bordures d'une boîte vide, pivotées de 42° — pas un glyphe, pas une
image, donc une graisse de trait qu'on contrôle exactement.

| | Taille | Graisse | Couleur |
|---|---|---|---|
| « Q » | 220 px / lh 0.78 | 900 | `#111111` |
| Accroche | 52 px / lh 1.2 | 700 | `#111111` |
| Corps | 40 px / lh 1.5 | 400 | `#3A3A3A` |
| Étiquettes des cases | 36 px | 400 | `#3A3A3A` |
| En-tête et pagination | 26 px, ls 4 px | 400 | `#999999` |
| `LLC` final | 110 px | 900 | `#111111` |

### Le surligneur, seul accent de la série

Un vrai coup de stabilo, pas un fond de bouton : une bande de `#FFE24D` **calée sur la hauteur
des lettres et non sur la boîte de ligne**, qui déborde de `0.10em` de part et d'autre du mot
et laisse dépasser le haut des capitales. Pas d'arrondi, pas de padding qui pousse le texte —
le débord mord sur les mots voisins, comme un marqueur.

La bande est exprimée en `em`, donc **identique d'un corps à l'autre** : une bande
proportionnelle à l'interligne aurait donné l'impression de deux marqueurs différents entre
l'accroche (lh 1.2) et le corps (lh 1.5).

Un surlignage est rendu **insécable**. Coupé en fin de ligne, le fragment de gauche étire sa
bande jusqu'au bord de la colonne et on ne lit plus un trait de marqueur mais un aplat — c'est
ce qui arrivait à « 4 questions » au premier rendu.

### Le placement vertical

Le contenu est calé au **centre optique**, à 46 % de la hauteur (883 px) plutôt qu'au centre
vrai (960 px).

Sur les stories 2 à 5, le haut du bloc est une **constante** — pas un centrage individuel :
les quatre « Q » doivent se superposer exactement quand on tape d'une story à l'autre. Le
build calcule cette constante sur la hauteur **moyenne** des quatre blocs, de sorte que la
série tombe au centre optique sans jamais sacrifier l'alignement. Elle vaut 571 px, et les
centres des quatre blocs tombent entre 850 et 924 px.

Les stories 1 et 6 sont centrées individuellement, n'ayant pas de « Q » à aligner. La story 6
part plus haut que les autres (353 px) : son bloc fait 1061 px — quatre cases, trois
paragraphes et un mot de 110 px — pour 1150 px disponibles au-dessus de la ligne des 1450 px.
C'est le budget du brief, pas un choix de composition ; il ne reste que 89 px de jeu.

## Les garde-fous du build

Six contrôles. Le build échoue — il ne livre pas — si l'un d'eux tombe.

**1. L'en-tête est-il rigoureusement le même partout ?** Le build compare l'empreinte
géométrique de l'en-tête (haut du bloc, haut du titre, haut de la pagination, position du
filet, marge gauche) entre les six et s'arrête à la moindre divergence. C'est ce qui garantit
la sensation de série.

**2. Les « Q » se superposent-ils exactement ?** Position verticale **et** horizontale, au
pixel, sur les stories 2 à 5. Un décalage de 2 px ne se voit pas sur une story isolée mais
saute aux yeux quand on tape.

**3. Le surlignage ressemble-t-il à un coup de stabilo ?** La bande doit faire entre 0,6 et
1,0 fois le corps, avoir un débord horizontal non nul, et **ne jamais être coupée en
plusieurs fragments** ni dépasser la colonne de 820 px.

**4. La zone morte basse.** Rien sous 1620 px ; rien sous 1450 px sur la story 6, où la barre
de commentaire vient se poser.

**5. L'export fait-il 1080 × 1920 ?** Lu dans l'en-tête du PNG produit, pas supposé.

**6. Un seul accent, vérifié sur les pixels livrés.** Le build relit son propre PNG pixel par
pixel. Tout pixel dont les canaux s'écartent de plus de 10 doit être du jaune surligneur ou
l'un de ses mélanges avec le papier et l'encre — teinte entre 30° et 75°, `R ≥ G > B`.
N'importe quelle autre couleur, ne serait-ce qu'un pixel, arrête le build et sa valeur RGB est
affichée avec ses coordonnées. Le même passage relève la **hauteur réellement peinte** de
chaque bande de surlignage, celle des pixels et non celle demandée en CSS.

Chromium est lancé avec `--disable-lcd-text` : sans lui, son anticrénelage sous-pixel borde
chaque lettre de franges rouges et bleues, et le contrôle 6 refuse le rendu à juste titre.

Relevé du build livré :

```
story-1 — contenu  435→1332px / 1620px,                   bandes 45/34px, 0 couleur parasite
story-2 — contenu  571→1157px / 1620px, « Q1 » à 571px,   bandes 34px,    0 couleur parasite
story-3 — contenu  571→1277px / 1620px, « Q2 » à 571px,   bandes 34px,    0 couleur parasite
story-4 — contenu  571→1129px / 1620px, « Q3 » à 571px,   bandes 34px,    0 couleur parasite
story-5 — contenu  571→1220px / 1620px, « Q4 » à 571px,   bandes 34px,    0 couleur parasite
story-6 — contenu  353→1414px / 1450px,                   bandes 88px,    0 couleur parasite
```

## Modifier les textes

Tout est dans la liste `STORIES` de `src/content.js`. Un seul balisage :

- `==mot==` → surligné au stabilo jaune

Le build applique au passage la typographie française : espace insécable après `«`, avant `»`,
et avant `? ! ; : %`.

Relancer `npm run build` après toute modification — les six contrôles diront si la nouvelle
longueur de texte casse l'alignement, la grille ou la zone basse.
