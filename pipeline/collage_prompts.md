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
