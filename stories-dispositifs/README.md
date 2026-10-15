# Les dispositifs que personne n'active — Fynovates

Série de 6 Instagram Stories, 1080 × 1920 (9:16 exact). La séquence
démonstrative : trois exemples concrets de dispositifs français que le
contribuable ne connaît pas, puis la révélation — la France a deux fiscalités —
close par le CTA GO.

```
node build.mjs      # génère src/story-N.html, output/story-N.png et preview.html
```

> **Sur le contenu.** Les textes et le positionnement viennent du client. Les
> dispositifs sont nommés, jamais chiffrés : ce dépôt ne vérifie ni les
> conditions d'éligibilité ni les taux, qui dépendent de la situation et de
> l'année. Le seul chiffre de la série — « divisée par quatre » pour le pacte
> Dutreil — est repris tel quel du brief.

## Ce que produit le build

| Fichier | Rôle |
|---|---|
| `output/story-1.png` … `story-6.png` | les 6 visuels finaux, 1080 × 1920 |
| `output/fynovates-dispositifs.zip` | les 6 PNG en une archive, pour les récupérer d'un coup |
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
| 1 | ouverture | « Phrase interdite sur ce compte… » |
| 2 | exemple | Exemple 1 — JEI et Crédit Impôt Recherche |
| 3 | exemple | Exemple 2 — apport-cession et pacte Dutreil |
| 4 | exemple | Exemple 3 — holding, salaire calibré, PEA |
| 5 | deux | les deux fiscalités : brutale / redoutable |
| 6 | cta | GO, à commenter pour faire regarder sa situation |

## L'entrée nommée

C'est la signature de la série. Un filet doré à `rgba(212, 175, 55, 0.45)`, le
nom du dispositif en capitales dorées, son effet en clair juste dessous.

Le nom est ce que le client répétera à son conseil : il doit se lire comme une
référence, pas comme une phrase. D'où la règle d'**une seule ligne**, vérifiée au
build. Le même filet, à la même opacité, sépare les deux fiscalités de la
story 5 : la story 5 est l'entrée nommée retournée contre elle-même.

## La grille

| Repère | Valeur | Raison |
|---|---|---|
| marges latérales | 100 px | identiques sur les 6 |
| colonne de texte | 800 px max | |
| ligne haute | 160 px | rien au-dessus : zone des stickers Instagram |
| ligne basse | 1620 px | rien en dessous : 1920 − 300 |
| ligne des exemples | 860 px | d'où partent les stories 2 à 4 |

Les stories 1, 5 et 6 ancrent leur bloc sur la ligne basse. **Les stories 2 à 4
font l'inverse** : elles partent toutes les trois de la ligne des exemples et
descendent. C'est ce qui fige l'étiquette « Exemple N » au pixel quand on tape
de l'une à l'autre — voir ci-dessous, c'est le contrôle qui a servi.

La valeur 860 px n'est pas décorative : c'est le bloc le plus haut des trois
(749 px, la story 4 et ses trois entrées) posé de façon à dégager la ligne
basse. Le plus chargé des trois descend à 1609 px, 11 px sous la limite.

## Les contrôles bloquants

`node build.mjs` refuse de livrer si l'un des huit échoue, et nomme le coupable.

1. **Zone morte haute** — rien ne monte au-dessus de 160 px.
2. **Zone morte basse** — rien ne descend sous 1620 px.
3. **Pagination** — empreinte géométrique identique sur les six.
4. **Étiquette « Exemple N »** — même position, même fonte sur les trois stories
   qui en portent une.
5. **Entrées nommées** — noms et effets partent de la même colonne, et aucun nom
   ne passe à la ligne.
6. **Les deux fiscalités** — même colonne, et deux couleurs de qualificatif
   différentes. Sans ce dernier point, une erreur de `ton` dans `content.js`
   ferait disparaître l'opposition sans rien casser visiblement.
7. **Contraste WCAG 2.1 AA, mesuré et pas supposé** — une seconde passe rend la
   page texte masqué, la dessine dans un canvas, et échantillonne le fond
   réellement composité sous chaque fragment de texte. Le seuil est choisi par
   élément (4,5:1 en texte normal, 3:1 dès 24 px ou 18,66 px en gras), et c'est
   le pire pixel de la zone qui décide.
8. **Dimensions** — 1080 × 1920 relus dans l'en-tête du PNG produit.

### Ce que le contrôle n°4 a corrigé ici

Il a sauté au premier build, et il avait raison. Les blocs étaient ancrés en bas
comme sur les séries précédentes : l'étiquette se retrouvait donc à 915 px sur la
story 2, 968 px sur la story 3 et 871 px sur la story 4, parce que les trois
blocs n'ont pas la même hauteur. Soit un sautillement de près de 100 px sur le
seul élément censé rester fixe pendant qu'on tape.

Rien ne débordait, le contraste passait, les six visuels étaient « bons ». Seule
une comparaison entre stories pouvait voir le défaut — une relecture visuelle
story par story ne l'aurait jamais trouvé. La correction est l'ancrage par le
haut décrit plus haut.

### Le relevé de contraste

Plancher de la série à **4,97:1** pour un seuil à 3,0, sur le qualificatif
« redoutable » de la story 5. C'est le fond le plus difficile : la lampe allumée
projette une traînée de lumière chaude qui descend en plein dans la colonne de
texte. Les cinq autres stories sont entre 6,4 et 7,9:1, portées par la
pagination en haut du cadre.

## Les photos

Six photos générées via Higgsfield (`gpt_image_2_5`), upscalées en 2K avant
composition pour que le cadre sous-échantillonne au lieu d'étirer. Les prompts
et la direction artistique sont dans `prompts-higgsfield.md`.

Sur la story 5, le hasard a bien fait les choses : la lampe éteinte tombe à
gauche, au-dessus de « par défaut / brutale », et la lampe allumée à droite,
au-dessus de « par conception / redoutable ». Rien dans le CSS ne le force —
le texte occupe toute la colonne — mais l'image et le propos se répondent.

**Le texte n'est jamais dans la photo.** Il est composé en HTML/CSS par-dessus,
donc corrigible sans rien régénérer.
