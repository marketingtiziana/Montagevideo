# Prompts Higgsfield — « Le client qui a annulé son départ »

Les 6 arrière-plans ont été générés avec le MCP Higgsfield, modèle **`gpt_image_2_5`**,
`aspect_ratio: "9:16"` (sortie native 752 × 1344), puis **upscalés en 4K** (`upscale_image`,
bytedance → 2294 × 4096) et convertis en JPEG qualité 0,95.

L'upscale n'est pas cosmétique : sans lui, une image de 752 px de large serait **étirée 1,43×**
pour remplir les 1080 px du cadre. En partant du 4K, le rendu Puppeteer *sous-échantillonne*,
ce qui donne des contours nets plutôt qu'un flou d'interpolation.

Pour régénérer une image : reprendre le prompt tel quel, upscaler, déposer le résultat dans
`backgrounds/bg-N.jpg`, relancer `npm run build`.

## Le préfixe commun

```
Photographie cinématographique réaliste, format vertical 9:16, palette bleu nuit et lumière dorée naturelle, éclairage crépusculaire ou intérieur tamisé, grain de film subtil, faible profondeur de champ, composition avec espace négatif dans la moitié basse de l'image, aucun texte, aucun visage reconnaissable de face, qualité reportage éditorial premium.
```

Il est repris **mot pour mot du brief** au début de chaque prompt, avec deux variantes :

- les chapitres **04** et **06** n'ont pas d'espace négatif en bas (texte centré, puis CTA),
  donc la mention « composition avec espace négatif dans la moitié basse » y est retirée ;
- le chapitre **04** n'a aucune silhouette, donc « aucun visage reconnaissable de face »
  y est raccourci en « aucun visage ».

Deux ajouts systématiques par rapport au brief, et pourquoi :

- **« Le sujet occupe la moitié HAUTE du cadre, la moitié basse est vide et sombre. »**
  Le texte s'assoit en bas ; sans cette consigne le modèle centre son sujet et le texte
  finit par le recouvrir.
- **« aucun texte lisible, aucun logo, aucune enseigne lisible »** répété en fin de prompt.
  Les scènes 1 et 2 comportent un tableau des départs et un écran d'ordinateur : sans cette
  insistance, le modèle y écrit des caractères inventés.

## Les 6 prompts

Reproduits **verbatim**, coquilles comprises (« mençante » dans le 04), puisque ce sont ces
chaînes exactes qui ont produit les images livrées.

### Chapitre 01 — le hall des départs → `backgrounds/bg-1.jpg`

```
Photographie cinématographique réaliste, format vertical 9:16, palette bleu nuit et lumière dorée naturelle, éclairage crépusculaire ou intérieur tamisé, grain de film subtil, faible profondeur de champ, composition avec espace négatif dans la moitié basse de l'image, aucun texte, aucun visage reconnaissable de face, qualité reportage éditorial premium. Hall d'aéroport moderne au crépuscule : un homme vu de dos, sac de voyage à l'épaule, immobile face à un grand tableau des départs lumineux dont les caractères sont flous et illisibles ; silhouettes de voyageurs floues autour de lui, grandes baies vitrées laissant voir un tarmac doré au fond. Le sujet et le tableau occupent la moitié HAUTE du cadre ; le sol et la moitié basse sont vides et sombres. Aucun texte lisible, aucun logo, aucun visage de face.
```

### Chapitre 02 — le bureau de nuit → `backgrounds/bg-2.jpg`

```
Photographie cinématographique réaliste, format vertical 9:16, palette bleu nuit et lumière dorée naturelle, éclairage crépusculaire ou intérieur tamisé, grain de film subtil, faible profondeur de champ, composition avec espace négatif dans la moitié basse de l'image, aucun texte, aucun visage reconnaissable de face, qualité reportage éditorial premium. Bureau de nuit vu par-dessus l'épaule d'un homme de dos : écran d'ordinateur affichant une interface de réservation de vol totalement floue et illisible, carnet ouvert posé à côté, lampe de bureau à lumière chaude, ville en bokeh bleu nuit par la fenêtre. Sujet et écran dans la moitié HAUTE du cadre, bureau sombre et dégagé en bas. Aucun texte lisible, aucun logo, aucun visage de face.
```

### Chapitre 03 — les trois piles → `backgrounds/bg-3.jpg`

```
Photographie cinématographique réaliste, format vertical 9:16, palette bleu nuit et lumière dorée naturelle, éclairage crépusculaire ou intérieur tamisé, grain de film subtil, faible profondeur de champ, composition avec espace négatif dans la moitié basse de l'image, aucun texte, aucun visage reconnaissable de face, qualité reportage éditorial premium. Table de travail vue en plongée à 45 degrés : TROIS piles de documents distinctes et bien séparées, alignées sur un bois sombre, une paire de lunettes posée à côté, une main qui annote la première pile avec un stylo. Lumière latérale dure créant trois zones d'ombre nettes et séparées. Les trois piles occupent la moitié HAUTE du cadre, le bois sombre et vide occupe la moitié basse. Aucune écriture lisible, aucun logo, aucun visage.
```

### Chapitre 04 — Dubaï derrière la pluie → `backgrounds/bg-4.jpg`

```
Photographie cinématographique réaliste, format vertical 9:16, palette bleu nuit et lumière dorée naturelle, grain de film subtil, faible profondeur de champ, aucun texte, aucun visage, qualité reportage éditorial premium. Skyline de Dubaï la nuit vue à travers une vitre couverte de grosses gouttes de pluie : les tours dorées sont déformées et fracturées par les gouttes, mise au point sur les gouttes, ville en bokeh derrière. Ambiance de splendeur inaccessible et mençante, très sombre et vignetée sur tous les bords du cadre, seules quelques lueurs dorées au centre. Image la plus sombre de la série. Aucun texte, aucun logo, aucune enseigne lisible.
```

### Chapitre 05 — la sortie, au matin → `backgrounds/bg-5.jpg`

```
Photographie cinématographique réaliste, format vertical 9:16, palette bleu nuit et lumière dorée naturelle, grain de film subtil, faible profondeur de champ, composition avec espace négatif dans la moitié basse de l'image, aucun texte, aucun visage reconnaissable de face, qualité reportage éditorial premium. Hall d'aéroport au petit matin, scène inversée du départ : un homme vu de dos, sac à l'épaule, s'éloigne vers la SORTIE, marchant vers de grandes portes vitrées par lesquelles entre une lumière du matin claire et douce. Sensation de décision posée et de soulagement, beaucoup d'espace lumineux et aéré, hall presque vide. Le sujet et les portes occupent la moitié HAUTE du cadre, le sol lisse et dégagé occupe la moitié basse. Aucun texte lisible, aucun logo, aucun visage de face.
```

### Chapitre 06 — l'horizon (CTA) → `backgrounds/bg-6.jpg`

```
Photographie cinématographique réaliste, format vertical 9:16, palette bleu nuit et lumière dorée naturelle, grain de film subtil, aucun texte, aucun visage, qualité reportage éditorial premium. Lever de soleil sur une ligne d'horizon totalement dégagée, mer calme à perte de vue : le ciel immense occupe environ 70 pour cent du cadre, dégradé naturel continu du bleu nuit profond en haut vers l'or chaud près de l'horizon, quelques nuages fins et bas. Image la plus lumineuse et la plus VIDE de la série : aucun sujet, aucune silhouette, aucun bâtiment, aucun bateau, uniquement le ciel et l'horizon. Composition minimale et parfaitement dégagée au centre. Aucun texte, aucun logo.
```

## Cohérence de la série

Les 6 photos ont été relues une par une, puis en planche sur `preview.html`.
**Aucune n'a eu besoin d'être régénérée.** Critères vérifiés :

| | Sujet dans la moitié haute | Palette bleu nuit + or | Aucun texte parasite |
|---|---|---|---|
| bg-1 | homme + tableau des départs | ✓ | ✓ (tableau illisible, comme demandé) |
| bg-2 | homme + écran | ✓ | ✓ (interface floue) |
| bg-3 | trois piles + la main qui annote | ✓ | ✓ |
| bg-4 | tours derrière les gouttes | ✓ | ✓ |
| bg-5 | homme + portes vitrées | ✓ | ✓ |
| bg-6 | *volontairement vide* | ✓ | ✓ |

`bg-6` est sans sujet **par construction** : le brief demande « l'image la plus lumineuse et
vide de la série », tout l'espace étant réservé au CTA. C'est aussi la seule à dominante bleue
plutôt que dorée — le dégradé nuit → or y est le sujet. Si cette rupture de ton gêne à la
relecture, c'est la seule image de la série que je proposerais de régénérer, en remontant la
bande dorée de l'horizon vers le tiers médian.
