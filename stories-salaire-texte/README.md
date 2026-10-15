# Fynovates — « Ton salaire est une décision » (version tout-texte)

Les six mêmes stories que `../stories-salaire-decision/`, **sans les illustrations** :
uniquement le texte, noir sur blanc pur, **centré dans la story sur les deux axes**.

Sur la story 6, le bloc est **remonté** pour dégager toute la moitié basse au sticker sondage
Instagram.

Export PNG **1080 × 1920 exactement** par Puppeteer. Le build refuse de livrer si le centrage,
la ligne basse, les dimensions ou l'absence de couleur ne sont pas tenus.

## Livrables

| Chemin | Contenu |
|---|---|
| `output/story-1.png` → `story-6.png` | Les 6 visuels finaux, 1080 × 1920 |
| `preview.html` | Les 6 en planche, avec l'axe médian et la ligne basse tracés dessus |
| `src/story.css` | La composition, commune aux 6 |
| `src/content.js` | Tout le contenu éditorial |
| `src/inter/` | Inter vendorisée (woff2 + CSS), pour un rendu identique hors ligne |
| `src/story-N.html` | La source HTML de chaque story — produite par le build, non versionnée |

Pas de dossier d'illustrations et pas de `prompts-higgsfield.md` : cette version n'utilise
aucune image.

## Regénérer

```bash
npm install     # puppeteer-core uniquement
npm run build   # ou : node build.mjs
```

Chromium est cherché sous `/opt/pw-browsers/` ; sur une autre machine, passer le chemin par
`CHROME_PATH=/usr/bin/chromium node build.mjs`.

## La composition

Sans illustration, il ne reste que le texte — et donc plus rien pour tenir la composition.
C'est le centrage qui fait la grille.

- Le bloc est **centré sur l'axe des 960 px**, verticalement et horizontalement.
- Marges latérales 110 px, bloc de **820 px** de large maximum, `text-align: center`.
- Le numéro de story reste en haut à droite, 24 px `#BBBBBB`.
- Rien ne descend sous **1620 px** (les 300 px du bas sont à l'interface Instagram).

| | Taille | Graisse | Couleur |
|---|---|---|---|
| Accroche | 54 px / lh 1.2 | 700 | `#111111` |
| Corps | 40 px / lh 1.45 | 400 | `#333333` |
| Numéro | 24 px | 400 | `#BBBBBB` |
| Story 6 | 64 px | 700 | `#111111` |

**Un seul procédé de mise en valeur** dans toute la série : un filet noir de 3 px sous
certains mots. Aucune couleur, aucun gras dans le corps.

L'accroche est composée en `text-wrap: balance` : les lignes d'un titre centré sont réparties
pour éviter le mot orphelin en dernière ligne, qui saute aux yeux dès qu'un texte est centré.

### La story 6

Son bloc est posé à **43 % de la hauteur, soit 826 px** au lieu de 960 — assez haut pour
dégager franchement la moitié basse, assez bas pour que ça reste un centrage et pas un texte
collé en haut du cadre. La phrase se termine à 864 px : tout ce qui est en dessous est libre
pour le sondage.

## Les garde-fous du build

Le build échoue — il ne livre pas — si l'un des quatre contrôles ne passe pas.

**1. Le centrage est-il celui qu'on a demandé ?** Le build mesure le centre réel du bloc rendu
et le compare à la cible (960 px, ou 826 px sur la story 6). Plus de 2 px d'écart et il
s'arrête. C'est le contrôle qui remplace l'œil : un bloc « à peu près » centré ne se voit pas
sur une story isolée, mais se voit en enfilade.

**2. La ligne basse est-elle respectée ?** Rien sous 1620 px, sous 900 px pour la story 6.

**3. L'export fait-il 1080 × 1920 ?** Lu dans l'en-tête du PNG produit, pas supposé.

**4. Le PNG livré tient-il la direction artistique ?** Le build **relit son propre export pixel
par pixel** : l'écart de teinte maximal doit être de 0 — aucune couleur nulle part — et le
compte de pixels encrés sous la ligne basse doit être nul.

Ce quatrième contrôle a servi dès le premier rendu, avec un écart de teinte de **134**. En
l'absence d'image, Chromium composite le texte directement sur le fond opaque et l'anticrénelage
passe en **sous-pixel** : chaque lettre se borde de franges rouges et bleues. Invisible à l'œil
sur un écran, mais c'est de la couleur dans une série qui n'en admet aucune. Le build lance donc
Chromium avec `--disable-lcd-text`, et le rendu est redevenu strictement gris.

Relevé du build livré :

```
story-1 — bloc  619→1301px, centré sur 960px, 96.2% de blanc pur, teinte 0
story-2 — bloc  655→1265px, centré sur 960px, 96.9% de blanc pur, teinte 0
story-3 — bloc  684→1236px, centré sur 960px, 96.7% de blanc pur, teinte 0
story-4 — bloc  684→1236px, centré sur 960px, 97.2% de blanc pur, teinte 0
story-5 — bloc  809→1111px, centré sur 960px, 98.1% de blanc pur, teinte 0
story-6 — bloc  788→ 864px, centré sur 826px (remonté de 134px), 99.3% de blanc pur, teinte 0
```

## Modifier les textes

Tout est dans la liste `STORIES` de `src/content.js`. Un seul balisage :

- `__mot__` → souligné du filet noir

Une locution soulignée de 18 caractères ou moins est rendue **insécable** : coupée en fin de
ligne, son filet se briserait en deux morceaux et se lirait comme une coquille.

Le build applique au passage la typographie française : espace insécable après `«`, avant `»`,
et avant `? ! ; : %`.

Relancer `npm run build` après toute modification — le contrôle de centrage et celui de la
ligne basse diront si la nouvelle longueur de texte casse la composition.
