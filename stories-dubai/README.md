# Dubaï, le stress test — Fynovates

Série de 6 Instagram Stories, 1080 × 1920 (9:16 exact). Une séquence
d'actualité : le choc géopolitique sur Dubaï, ce que font les grandes fortunes,
et la leçon de méthode qui en sort — close par le CTA CODEX.

```
node build.mjs      # génère src/story-N.html, output/story-N.png et preview.html
```

> **Sur les chiffres.** Les montants, multiples et dates de la story 2 — comme
> l'ensemble du récit d'actualité de la série — viennent du client. Ils sont
> composés tels quels ; ce dépôt ne les source ni ne les vérifie.

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
| 1 | ouverture | « Il se passe un truc historique en ce moment. » |
| 2 | chiffres | le relevé : 120 Md$, × 10, 2020 |
| 3 | corps | ce que font les grandes fortunes — elles redéploient |
| 4 | corps | la vraie leçon : le risque géopolitique est un critère |
| 5 | corps | une expatriation se construit sur un comparatif |
| 6 | cta | CODEX, à commenter pour le recevoir |

## La grille

- **Zones mortes** : rien au-dessus de 160 px, rien sous 1620 px (stickers).
  Les six blocs de texte viennent tous mourir exactement sur la ligne basse.
- **Colonne** : 800 px de large, marges latérales de 100 px, alignée à gauche —
  sauf la story 6, centrée autour du bloc CODEX.
- **En-tête de série** : `DUBAÏ · LE STRESS TEST` en 24 px doré à gauche,
  pagination grise à droite, tous deux posés exactement sur la ligne des 160 px.
  Le build compare leur empreinte géométrique complète entre les six et refuse
  de livrer au moindre écart.

## Le relevé chiffré de la story 2

Trois rangées `valeur | légende` séparées de filets dorés à 1 px. La valeur est
en 76 px Inter 900 doré, dans une colonne **fixe de 340 px** — pas un
`min-width`. La différence n'est pas cosmétique : avec un minimum, « 120 Md$ »
dépassait de sa colonne et poussait sa légende 66 px plus à droite que les deux
autres, ce qui déformait le tableau. Les valeurs sont aussi en `nowrap`, sinon
celle-ci se cassait en deux lignes.

Deux contrôles verrouillent ce gabarit à chaque build : aucune valeur ne
déborde de sa colonne, et les trois légendes démarrent au même pixel. Le second
a servi : il a rattrapé un débordement résiduel de 3,75 px invisible à l'œil.

Note technique : `scrollWidth` ne sert à rien pour détecter ce débordement — sur
un item flex il rend la largeur de la colonne, pas celle du texte. Le build
bascule donc l'élément en `max-content` le temps de la mesure.

## Le traitement des photos

Grading identique sur les 6 (`saturate(0.85) contrast(1.08)`), le dégradé de
série, puis deux renforts locaux qui ne font qu'approfondir un dégradé déjà
présent.

Le renfort du haut existe à cause d'un calcul : l'or `#D4AF37` a une luminance
relative de 0,45, et pour tenir le 3:1 du « large text » il lui faut un fond
sous 0,117 — autrement dit franchement noir. C'est une bande courte, pleine
sous la ligne d'en-tête, qui retombe à zéro avant 360 px : le sujet de la photo
reste intact.

La story 6 a son propre renfort, à longue traîne, parce qu'un fondu court pose
une arête horizontale visible en travers de l'image.

## Les cinq contrôles bloquants

`build.mjs` refuse d'écrire un PNG si l'un échoue, et nomme le coupable :

1. aucun texte au-dessus de 160 px ;
2. aucun texte sous 1620 px ;
3. l'en-tête de série identique sur les six — plus, sur la story 2, la
   non-régression du relevé chiffré décrite plus haut ;
4. **contraste WCAG 2.1 AA mesuré, pas supposé** : une seconde passe rend la
   page texte masqué, et chaque run est comparé aux pixels réels du fond
   composité sous lui. Le ratio retenu est le pire de la zone. Seuil choisi par
   élément : 4,5:1 en texte normal, 3:1 dès 24 px (ou 18,66 px en gras) ;
5. dimensions relues dans l'en-tête des PNG livrés : 1080 × 1920 exactement.

Relevé du dernier build :

| # | texte | contraste min | seuil |
|---|-------|---------------|-------|
| 1 | 160 → 1620 px | 7,84:1 | 3 |
| 2 | 160 → 1620 px | 5,61:1 | 3 |
| 3 | 160 → 1620 px | 6,96:1 | 3 |
| 4 | 160 → 1620 px | 5,61:1 | 3 |
| 5 | 160 → 1620 px | 7,90:1 | 3 |
| 6 | 160 → 1620 px | 6,60:1 | 3 |

## Typographie française

`typo()` applique, avant tout rendu : espace insécable après `«`, avant `»` et
avant `? ! ; : %` ; apostrophe typographique `’` ; espace fine insécable comme
séparateur de milliers.

## Le rendu

Puppeteer, viewport 1080 × 1920, `deviceScaleFactor: 1`, capture avec `clip`
explicite. `--disable-lcd-text` est indispensable : sans lui l'anti-aliasing
sous-pixel pose des franges colorées sur les bords des lettres claires.

Photos : voir `prompts-higgsfield.md`.
