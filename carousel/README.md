# Carrousel « Octobre, le bon mois » — propale visuelle

Carrousel 10 slides (1080×1350, format 4:5) construit autour des screens Threads
`screens/1.jpg … 10.jpg`, intégrés tels quels dans une carte « post Threads ».

Habillage : fond sombre premium + liseré doré, chapitre (kicker + titre) par slide,
compteur, barre de progression, frise OCT → NOV → DÉC → 1ER JANV sur les slides
rétroplanning (4 à 7), CTA doré « Commente JANVIER » sur la dernière.

```bash
python3 carousel/build_carousel.py   # -> carousel/out/slide_01.png … slide_10.png, planche.jpg, preview.html
```

Textes de chapitres et couleurs d'accent : liste `SLIDES` en tête de `build_carousel.py`.
