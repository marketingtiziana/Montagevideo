# Photos d'arrière-plan — prompts Higgsfield

Série « Le classement des pires conseils fiscaux d'Instagram », 6 arrière-plans.

**Modèle** `gpt_image_2_5` · **Ratio** `9:16` · rendu natif 752 × 1344, puis
upscale `bytedance_image_upscale` en 2K avant composition. Les fichiers finaux
vivent dans `backgrounds/bg-1.jpg` … `bg-6.jpg` et sont recadrés en
`object-fit: cover` vers 1080 × 1920 (le natif est en 0,5595, la cible en
0,5625 : la rognure est de 0,5 %, invisible).

## Préfixe commun aux 6 générations

> photographie réaliste cinématographique, format vertical 9:16, palette
> naturelle avec dominante chaude dorée et ombres bleu nuit, éclairage
> crépusculaire ou intérieur tamisé, grain de film léger, faible profondeur de
> champ, composition avec espace négatif dans la moitié basse, aucun texte dans
> l'image, aucun visage reconnaissable de face, qualité éditoriale type
> reportage premium.

Trois consignes reviennent dans chaque scène parce que la composition en dépend :
sujet **dans la moitié haute**, moitié basse **sombre et vide** (c'est là que vit
le texte), et l'interdiction explicite de tout caractère lisible — un chiffre sur
un agenda ou une plaque sur une façade suffirait à casser la série.

## Les 6 scènes

| # | Story | Scène demandée |
|---|-------|----------------|
| 1 | Ouverture | une main tenant un smartphone dans la pénombre d'une pièce, l'écran allumé éclaire le cadre par le bas, contenu de l'écran totalement illisible et flou de mouvement vertical (défilement), ambiance nocturne de doomscrolling, reflets bleu nuit et dorés sur la peau et le mur |
| 2 | N°4 | table de restaurant haut de gamme en fin de repas, un porte-addition en cuir fermé posé sur la nappe, une carte bancaire métallique premium à côté, verres à vin à moitié vides, lumière de bougie chaude, nappe sombre, ambiance de train de vie et de dépense, aucune personne visible |
| 3 | N°3 | gros plan macro sur un agenda papier ouvert posé sur un bureau, une grille de cases vierges dont beaucoup sont barrées d'une croix au stylo bille, une main de dos en train de barrer une case, lampe de bureau chaude en lumière rasante, très faible profondeur de champ, ambiance de décompte obsessionnel, aucun chiffre ni mot lisible |
| 4 | N°2 | drapeau américain flottant au vent devant la façade d'un bâtiment administratif fédéral classique en pierre claire avec de hautes colonnes, contre-jour de fin de journée, soleil bas derrière le drapeau, ambiance solennelle et légèrement menaçante, aucune inscription ni plaque lisible sur la façade |
| 5 | N°1 | gros plan macro d'une rangée de dominos noirs en train de tomber sur une surface sombre et réfléchissante, le premier domino déjà couché, netteté précise sur le point de bascule au milieu de la rangée, éclairage latéral dramatique doré qui dessine les arêtes, fond noir profond, métaphore de la réaction en chaîne, aucun point ni marque sur les dominos |
| 6 | FAQ | bureau épuré et très lumineux au petit matin, une chaise en bois vide tournée vers l'objectif de l'autre côté d'une table propre, un carnet ouvert aux pages parfaitement blanches et vierges et un stylo posés sur la table, grande fenêtre qui inonde la pièce de lumière naturelle douce du petit matin, ambiance « la place est prête, on vous écoute », image la plus claire et la plus ouverte de la série, aucune écriture sur le carnet |

## Écart assumé sur la story 6

Le préfixe impose un « éclairage crépusculaire ou intérieur tamisé ». La story 6
doit être **la plus claire de la série** : sa scène demande explicitement une
lumière naturelle douce de petit matin, qui prend le pas sur la clause du
préfixe. La clause d'éclairage est donc retirée du préfixe pour cette seule
génération — tout le reste (palette, grain, profondeur de champ, espace négatif,
absence de texte et de visage) est identique.

## Si Higgsfield est indisponible

Déposer six fichiers nommés `bg-1.jpg` … `bg-6.jpg` dans `backgrounds/`, au
format vertical, idéalement 1080 × 1920 ou plus. `node build.mjs` refuse de
produire quoi que ce soit tant qu'un fichier manque, et nomme celui qui manque.
