# Photos d'arrière-plan — prompts Higgsfield

Série « Dubaï, le stress test », 6 arrière-plans.

**Modèle** `gpt_image_2_5` · **Ratio** `9:16` · rendu natif 752 × 1344, puis
upscale `bytedance_image_upscale` en 2K (2160 × 3856) avant composition. Les
fichiers finaux vivent dans `backgrounds/bg-1.jpg` … `bg-6.jpg` et sont
recadrés en `object-fit: cover` vers 1080 × 1920.

## Préfixe commun aux 6 générations

> photographie réaliste cinématographique, format vertical 9:16, palette
> naturelle avec dominante chaude dorée et ombres bleu nuit, grain de film
> léger, faible profondeur de champ, composition avec espace négatif dans la
> moitié basse, aucun texte dans l'image, aucun visage reconnaissable, qualité
> éditoriale type reportage premium.

La clause d'éclairage varie selon la scène (crépusculaire, nocturne, intérieur
tamisé, lever de soleil) — c'est la seule partie du préfixe qui bouge.

Trois consignes reviennent dans chaque scène parce que la composition en dépend :
sujet **dans la moitié haute**, moitié basse **sombre et vide** (c'est là que vit
le texte), et l'interdiction explicite de tout caractère lisible.

## Les 6 scènes

| # | Story | Scène demandée |
|---|-------|----------------|
| 1 | Ouverture | skyline de gratte-ciel du Golfe vue de loin au crépuscule, très haute tour effilée au centre, brume de chaleur et poussière, ciel orageux et lourd qui se referme sur la ville, dernière lumière dorée rasante sur les façades, atmosphère de bascule et de tension sourde |
| 2 | Le relevé | façade de verre d'une tour de quartier d'affaires la nuit en contre-plongée, reflets de lueurs d'écrans rouges et ambrées totalement flous et illisibles dans les vitres, impression diffuse de courbes qui descendent sans qu'aucun chiffre ne soit lisible, salle de marché vue de l'extérieur |
| 3 | Les départs | jet privé blanc de trois quarts arrière sur le tarmac à l'aube, passerelle dépliée, deux valises rigides au pied des marches, personne dans le cadre, contre-jour doré et ombres longues, départ discret et organisé, aucune immatriculation lisible |
| 4 | La leçon | vue depuis une pièce sombre à travers une grande baie vitrée, ville du désert en contrebas la nuit, et au fond sur l'horizon une lueur orange diffuse de chaleur lointaine, silhouette d'une chaise vide de dos près de la vitre, veille et menace distante |
| 5 | Le comparatif | long couloir sobre avec quatre portes identiques en bois sombre alignées, une seule entrouverte laissant passer une lumière dorée chaude sur le sol, les autres fermées dans l'ombre bleutée, perspective centrée, aucune plaque ni numéro sur les portes |
| 6 | CTA CODEX | mur de casiers d'archives en bois noble à petits tiroirs, un seul tiroir légèrement tiré, lumière dorée rasante sur les poignées en laiton, bibliothèque feutrée de cabinet privé, savoir ordonné et précieux, aucune étiquette lisible |

**Aucune des six n'a eu besoin d'être régénérée.**

## Si Higgsfield est indisponible

Déposer six fichiers nommés `bg-1.jpg` … `bg-6.jpg` dans `backgrounds/`, au
format vertical, idéalement 1080 × 1920 ou plus. `node build.mjs` refuse de
produire quoi que ce soit tant qu'un fichier manque, et nomme celui qui manque.
