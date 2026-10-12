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

## Variante blanche minimaliste

Fond blanc pur, screen posé tel quel sans carte, compteur,
filet de progression, flèche « SUITE → », frise texte sur les slides rétroplanning.

```bash
python3 carousel/build_carousel_white.py   # -> carousel/out_white/
```

## Nouveau carrousel sur un autre sujet (même design, même écriture Threads)

`threads_text.py` reproduit le rendu texte de l'app Threads iPhone (calé sur les screens
d'origine : Inter 600 à 49 px, interligne 75 px, 23 px entre paragraphes, pastille grise n/N).
`make_carousel.py` enchaîne : texte → écrans « Threads » → slides blanches.

```bash
cp carousel/exemple_contenu.json carousel/mon_sujet.json   # éditer slug, cta, timeline, posts
python3 carousel/make_carousel.py carousel/mon_sujet.json  # -> carousel/decks/<slug>/
```

Chaque post est une liste de paragraphes ; un `\n` dans un paragraphe fait un simple retour
à la ligne (comme dans Threads). Les emoji sont rendus avec Noto Color Emoji, pas les emoji
Apple : c'est la seule différence visible avec un vrai screen.

## Illustrations et rendu HD

- `illustrations.py` : dessins vectoriels monochromes (SVG) à poser sous le texte d'une slide ;
  dans le JSON, `"illustrations": {"2": "phone_back"}` (noms : phone_front, phone_back, geo, laptop,
  trio, rules, codex). Le texte se réduit automatiquement pour laisser la place.
- Rendu en 2x (2160 × 2700, fichiers `@2x.png` non versionnés) puis réduit en 1080 × 1350 LANCZOS :
  texte et traits nets. Les écrans Threads sont aussi rendus en 2x.
- Exemple complet : `python3 carousel/make_carousel.py carousel/iphone_contenu.json`
