# Carrousel Instagram — « Les dangers de demander des conseils fiscaux à une IA »

Fynovates / Madame Caci — design system Fynovates, déclinaison **ALERTE** (fond bleu nuit `#0E1230`
sur les slides 1-7, bascule vers le fond clair `#F7F8FC` sur les slides 8-9 : machine → humain).

- 9 slides 1080×1350 px, 100 % HTML/CSS/SVG rendus par Playwright (texte vectoriel, aucune image générée, aucun emoji).
- Sortie : `output/slide-01.png` … `output/slide-09.png`. HTML intermédiaire dans `html/`.
- Polices : Inter (système) pour les titres/corps, IBM Plex Mono (`fonts/`, licence OFL) pour les « messages IA » et les données.

## Rendu

```bash
node build.js          # les 9 slides
node build.js 1 3      # seulement certaines slides
```

Le script ajuste automatiquement la taille des titres pour que chaque ligne tienne dans la zone de 920 px
et signale tout débordement de texte dans la console.

## Langage visuel « alerte » (tout en CSS/SVG)
bandes hachurées 45° (slides 1 et 7), triangle d'avertissement outline près des badges DANGER,
bulles IA monospace avec curseur figé `▌`, tampons outline bleus `rotate(-10deg)` à cheval sur les bulles,
glitch léger (copie à 40 % décalée de 2 px) sur un mot-clé max par slide, grille filigrane en coin.
