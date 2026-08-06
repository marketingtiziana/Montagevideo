# Collages photo N&B surréalistes (incrustations éditoriales)

Style calqué sur la référence « old money » : photomontage **noir & blanc** découpé,
collé sur **papier ivoire texturé** (grain halftone, aspect dada vintage), grande
part de vide, sans texte. Générés via Higgsfield.

- **Modèle** : `nano_banana_pro` (rendu `nano_banana_2`)
- **Format** : `9:16`
- **Sortie** : téléchargée dans `assets/col_*.png`, puis intégrée plein cadre
  par `lux_render.py` (liste `COLLAGES`, placée SOUS les sous-titres).

| Fichier | Beat (parole) | Prompt |
|---|---|---|
| `col_etat.png` | « l'État te le réclame quand même » | *A tiny elegant businesswoman in a tailored suit sits alone on a wooden chair, dwarfed by an enormous bureaucratic hand descending from above holding a large official wax seal stamp over her head. B&W cut-out photomontage on off-white torn textured paper, halftone grain, oppressive scale, lots of negative space. No text.* |
| `col_poche.png` | « il sort de ta poche » | *A businessperson turns their empty trouser pockets inside out; coins and banknotes fall and dissolve into a flock of small birds flying away. Melancholic B&W collage on off-white textured paper, halftone grain, negative space. No text.* |
| `col_guichet.png` | « une seule déclaration / le guichet unique » | *Three ornate classical stone doorways in a vast empty plain gradually overlapping and merging into one single tall luminous doorway in the center. Surreal architectural B&W collage on off-white textured paper, halftone, negative space. No text.* |
| `col_structure.png` | « la TVA internationale / ta structure » | *A grand classical columned government building, half rendered as a technical architectural blueprint with scaffolding, rising on a solid stone foundation. Surreal B&W editorial collage on beige textured paper, halftone, negative space. No text.* |

Pour régénérer : `generate_image_batch` (Higgsfield) avec ces prompts, puis
`curl` des `result_url` vers `assets/col_*.png`.

## Ajouts (v2)
| Fichier | Beat | Prompt (résumé) |
|---|---|---|
| `col_facture.png` | hook « si t'as facturé la mauvaise TVA » | grand-livre/facture épinglé, gros tampon à l'encre, coin déchiré, petite femme qui lève les yeux — collage N&B sur papier ivoire, halftone. |
| `col_place.png` | « le mettre en place correctement » | deux mains posant la clé de voûte au sommet d'une arche classique — collage N&B éditorial sur papier ivoire, halftone. |

## B-roll vidéo (ambiance New York Times) — `make_broll.py`
Clips vidéo cinématographiques N&B documentaire générés via Higgsfield **kling3_0**
(9:16, 5 s, `sound:off`, ~7,5 crédits/clip), puis pré-traités par `make_broll.py`
(cadrage 9:16, zoom-settle d'entrée, grade NYT + grain) -> `broll_ready/*.mp4`,
composés plein cadre par `lux_render.py` (couche `BROLL`, sous les sous-titres).

| Fichier | Beat | Prompt (résumé) |
|---|---|---|
| `br_facture` | hook « mauvaise TVA » | macro tampon officiel pressé sur une facture, encre qui s'étale, slow-mo N&B |
| `br_etat` | « l'État réclame » | travelling avant contre-plongée sur un bâtiment administratif néoclassique, ciel couvert |
| `br_poche` | « ta poche » | pièces et billets qui tombent au ralenti dans une lumière rasante |
| `br_pays` | « 3 pays » | macro carte d'Europe, main qui pose épingles et tampons sur 3 pays |
| `br_guichet` | « guichet unique » | porte unique dans un hall de marbre qui s'ouvre, lumière qui jaillit, travelling |
| `br_place` | « en place correctement » | deux mains posant la clé de voûte d'une arche de pierre, poussière dans la lumière |
| `br_structure` | « TVA internationale / structure » | plan d'architecte + maquette d'édifice à colonnes, lumière rasante, travelling latéral |
| `br_inter` | « si tu vends à l'international » (couvre le raccord de coupe) | globe vintage qui tourne lentement sur un bureau, lumière rasante, N&B cinéma |
