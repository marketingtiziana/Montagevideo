# Stories Instagram — « Fermer une LLC » (1/6 → 6/6)

Série de 6 stories verticales **1080 × 1920**, rendues en PNG depuis du HTML/CSS.
Direction artistique : fond dégradé bleu nuit → noir, filigrane de formulaire IRS 5472,
fines lignes de grille, typographie Inter, mots-clés en doré `#D4AF37` et rouge alerte
`#E05C5C`. Fil rouge graphique : une porte en line art doré qui évolue d'une story à
l'autre (entrouverte → documents → mur de documents → enchaînée → sablier → grande ouverte).

| Fichier | Visuel | Accent |
|---|---|---|
| `story-1.png` | porte entrouverte, halo | « fermer » en doré |
| `story-2.png` | pile de documents + tampon 5472 | « 5472 », « chaque année » en doré |
| `story-3.png` | mur de documents, années barrées | « 25 000 $ » en rouge |
| `story-4.png` | porte enchaînée + cadenas rouge | « qu'en règle » doré, « pour toujours » rouge |
| `story-5.png` | sablier, dégradé plus clair | « avant » en doré |
| `story-6.png` | porte grande ouverte, CTA `LLC` | `LLC` en doré, très grand |

## Fabrication

```bash
python3 stories/build_stories.py     # textes + SVG -> story-1.html … story-6.html
node stories/render.js               # HTML -> story-1.png … story-6.png (+ vérifications)
node stories/render.js 3 6           # ne re-rendre que certaines stories
```

`render.js` utilise le Chromium de Playwright (`NODE_PATH=/opt/node22/lib/node_modules`
si Playwright est installé globalement).

## Contraintes respectées, vérifiées au rendu

`render.js` échoue (code de sortie 1) si l'une de ces règles est cassée :

- **export exactement 1080 × 1920** ;
- **280 px du bas laissés vides** (stickers + barre de réponse Instagram) : aucun texte ni
  élément graphique ne franchit `y = 1640` — le rendu affiche la position réelle du bas
  du contenu ;
- **contraste texte / fond** mesuré sur le rendu lui-même : le contenu est masqué, le fond
  est re-photographié, puis chaque bloc de texte est comparé au pixel de fond le plus
  défavorable sous sa boîte. Seuils WCAG AA : 4,5:1, ou 3:1 pour les grands corps
  (≥ 32 px, ou ≥ 24 px en gras).

Autres contraintes de la commande : aucune image externe (porte, chaînes, sablier,
documents et filigrane sont des SVG inline), aucun emoji, texte aligné à gauche,
numéro de story en haut à droite.

## Polices

Inter vient de Google Fonts et est **embarquée en base64** dans `webfonts/inter.css`
(sous-ensembles latin + latin-ext) : le rendu ne fait aucune requête réseau et les
fichiers HTML s'ouvrent tels quels. Pour la mettre à jour :

```bash
bash stories/webfonts/fetch-inter.sh
```

## Modifier les textes

Tout le contenu rédactionnel est dans `STORIES`, à la fin de `build_stories.py`
(`.gold` / `.red` / `.strong` pour les mots accentués). Les réglages visuels communs
sont dans `story.css`. Après modification : relancer `build_stories.py` puis `render.js`.
