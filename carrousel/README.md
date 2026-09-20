# Carrousel Instagram — Fynovates

Carrousel 9 slides **1080×1350** (4:5), sujet : *« Personne ne devient riche avec un salaire. »*

Les slides sont construites en **HTML/CSS + SVG inline** puis rendues en PNG via Chromium headless
(Playwright) — texte net, schémas vectoriels, aucun texte généré en image.

## Utilisation

```bash
bash setup.sh                 # dépendances + polices (Inter, Space Grotesk)
node src/render.js            # rend les 9 slides -> output/slide-01..09.png
node src/render.js 2 4        # ne rend que les slides 2 et 4
node src/contrast.js          # audit des contrastes WCAG de la charte
```

Chromium : le script utilise le binaire pré-installé (`/opt/pw-browsers/chromium-1194/...`),
surchargeable via `CHROME_PATH`.

## Fichiers
| Fichier | Rôle |
|---|---|
| `src/slides.js` | Contenu des 9 slides (textes + schémas SVG) |
| `src/style.css` | Charte : couleurs, typographie, grille, chrome de marque |
| `src/render.js` | Génère `slides/*.html` puis les PNG, avec contrôles de conformité |
| `src/contrast.js` | Vérifie les ratios de contraste des couples couleur/fond |
| `slides/` | HTML généré (une page par slide, inspectable au navigateur) |
| `output/` | PNG finaux `slide-01.png` … `slide-09.png` |

## Charte
Fond `#0A0A0F` → `#0D1526` · bleu `#2563EB` · bleu clair `#60A5FA` · texte `#F5F5F7` · gris `#9CA3AF`.
Aucune autre couleur, aucun emoji. Marges intérieures 90px.

`#2563EB` sur le fond noir ne donne que **3,82:1** : il est réservé au grand texte gras (≥24px),
aux bordures et aux traits de schéma. Tout petit texte bleu utilise `#60A5FA` (7,77:1).

## Contrôles automatiques
`render.js` vérifie pour chaque slide : dimensions PNG exactes (1080×1350), DOM sans débordement
hors cadre, marges 90px respectées, aucun texte tronqué par son conteneur.
