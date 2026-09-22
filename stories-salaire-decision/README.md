# Fynovates — « Ton salaire est une décision »

Six Instagram Stories, **1080 × 1920 exactement**. Direction artistique minimaliste absolue :
texte noir sur blanc pur, une illustration au trait par story, rien d'autre.

Illustrations générées via Higgsfield, composition HTML/CSS, export PNG par Puppeteer. Le
build refuse de livrer si le blanc n'est pas pur ou si la grille n'est pas tenue — le détail
est plus bas.

## Livrables

| Chemin | Contenu |
|---|---|
| `output/story-1.png` → `story-6.png` | Les 6 visuels finaux, 1080 × 1920 |
| `preview.html` | Les 6 en planche, avec les lignes de grille tracées dessus |
| `illustrations/illu-1.png` → `illu-6.png` | Les dessins Higgsfield, bruts |
| `src/story.css` | La composition, commune aux 6 |
| `src/content.js` | Tout le contenu éditorial |
| `src/inter/` | Inter vendorisée (woff2 + CSS), pour un rendu identique hors ligne |
| `src/story-N.html` | La source HTML de chaque story — produite par le build, non versionnée |
| `prompts-higgsfield.md` | Les prompts, pour régénérer un dessin |

## Regénérer

```bash
npm install     # puppeteer-core uniquement
npm run build   # ou : node build.mjs
```

Chromium est cherché sous `/opt/pw-browsers/` ; sur une autre machine, passer le chemin par
`CHROME_PATH=/usr/bin/chromium node build.mjs`.

## La composition

### La grille

Marges latérales **110 px**, bloc de texte **820 px** de large maximum. L'illustration vit
dans la bande **220 → 850 px**. Rien ne descend sous **1620 px** (les 300 px du bas sont à
l'interface Instagram) — sauf la story 6, où rien ne descend sous **900 px**, la moitié basse
étant réservée au sticker sondage.

### Deux blocs, pas trois

L'illustration au trait, centrée horizontalement. Le texte dessous, aligné à gauche. Le
numéro de story en haut à droite, en 24 px `#BBBBBB`. C'est tout : pas de cadre, pas de
texture, pas de dégradé, pas de logo, pas d'emoji.

| | Taille | Graisse | Couleur |
|---|---|---|---|
| Accroche | 54 px / lh 1.2 | 700 | `#111111` |
| Corps | 40 px / lh 1.45 | 400 | `#333333` |
| Numéro | 24 px | 400 | `#BBBBBB` |
| Story 6 | 64 px, centré | 700 | `#111111` |

**Un seul procédé de mise en valeur** dans toute la série : un filet noir de 3 px sous
certains mots (`border-bottom`, décollé de 6 px pour ne pas manger les jambages). Aucune
couleur, aucun gras dans le corps de texte.

### Le placement vertical est calculé, pas posé

Le build mesure la hauteur réelle du texte rendu, puis pose le groupe
« illustration + texte » au **centre optique** de la zone utile, en le bornant à la bande
imposée à l'illustration. Résultat : les stories chargées s'appuient en haut de bande, les
stories courtes descendent et respirent, et aucune ne flotte.

Il choisit aussi la **taille d'illustration** : la plus grande de la série qui laisse le texte
tenir sous la ligne basse, **identique sur les stories 1 à 5** pour que la planche soit
homogène. La story 6 fait exception — c'est la seule qui doit tenir tout entière au-dessus de
900 px, ce qu'un dessin de 600 px rend arithmétiquement impossible (220 + 600 + 64 px de
texte dépasse déjà la ligne sans même un espace entre les deux).

## Les garde-fous du build

Le build échoue — il ne livre pas — si l'un des quatre contrôles ne passe pas.

**1. Le blanc est-il pur ?** Higgsfield ne rend jamais un `#FFFFFF` exact : il reste un voile
crème invisible isolément, mais qui dessine un carré net une fois posé sur le blanc de la
story. Le build désature chaque dessin (plus aucune couleur possible), écrase tout ce qui
dépasse 240/255 sur du blanc pur, réétale les traits sur la plage restante pour qu'ils gardent
leur densité, puis **remesure le pourtour** et refuse de continuer s'il n'est pas à 255.

**2. L'illustration tient-elle dans sa bande ?** Haut ≥ 220 px, bas ≤ 850 px, mesuré sur le
rendu.

**3. La ligne basse est-elle respectée ?** Rien sous 1620 px, sous 900 px pour la story 6.

**4. L'export fait-il 1080 × 1920 ?** Lu dans l'en-tête du PNG produit, pas supposé.

Le build affiche en plus, pour chaque dessin, sa **part de pixels franchement noirs**. C'est
le proxy chiffré de l'épaisseur de trait : deux illustrations de la même série doivent tomber
dans le même ordre de grandeur, et un écart franc signale un dessin à régénérer.

## Modifier les textes

Tout est dans la liste `STORIES` de `src/content.js`. Un seul balisage :

- `__mot__` → souligné du filet noir

Le build applique au passage la typographie française : espace insécable après `«`, avant `»`,
et avant `? ! ; : %`.

Relancer `npm run build` après toute modification — les garde-fous diront si la nouvelle
longueur de texte casse la grille, et le build réajustera la taille des illustrations.
