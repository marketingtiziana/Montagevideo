# Carrousel Instagram — « Les dangers de demander des conseils fiscaux à une IA » (version éditoriale)

Fynovates / Madame Caci. Direction artistique minimaliste magazine : fond blanc `#FFFFFF`, texte noir `#0A0A0A`,
gris `#9A9A9A` réservé à la navigation et à la signature, photos noir et blanc à bords francs.

- 9 slides 1080×1350 px, HTML/CSS rendus par Playwright (texte 100 % vectoriel, jamais de texte dans les images).
- Sortie : `output/slide-01.png` … `slide-09.png`. HTML intermédiaire dans `html/`.
- Polices (`fonts/`, licences OFL incluses) : Playfair Display (titres, chutes italiques), IBM Plex Mono (« réponses IA ») ; Inter Light/Regular vient du système.
- Images : générées avec Higgsfield (modèle GPT Image 2.5, prompts sans texte) pour les slides 1, 3, 5 et 7.
  Originaux dans `raw/`, versions traitées (niveaux de gris + contraste +8 %) dans `img/`.

## Rendu

```bash
node build.js          # les 9 slides
node build.js 1 3      # seulement certaines slides
```

Le script signale en console toute image manquante, tout texte sorti des marges de 100 px et tout chevauchement de blocs.
