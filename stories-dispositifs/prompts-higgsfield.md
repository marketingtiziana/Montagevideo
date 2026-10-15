# Photos d'arrière-plan — prompts Higgsfield

Série « Les dispositifs que personne n'active », 6 arrière-plans.

**Modèle** `gpt_image_2_5` · **Ratio** `9:16` · rendu natif 752 × 1344, puis
upscale `bytedance_image_upscale` en 2K (2160 × 3856) avant composition. Les
fichiers finaux vivent dans `backgrounds/bg-1.jpg` … `bg-6.jpg` et sont
recadrés en `object-fit: cover` vers 1080 × 1920.

> Les fichiers portent l'extension `.jpg` par cohérence avec les autres séries
> du dépôt, mais leur contenu est du PNG — c'est ce que rend l'upscaler.
> Chromium charge d'après le contenu et non d'après le nom ; rien à corriger.

## Préfixe commun aux 6 générations

> photographie réaliste cinématographique, format vertical 9:16, palette
> naturelle avec dominante chaude dorée et ombres bleu nuit, grain de film
> léger, faible profondeur de champ, aucun texte dans l'image, aucun visage
> reconnaissable, qualité éditoriale type reportage premium.

C'est le préfixe des séries 7 à 9, repris à l'identique : les quatre séries
doivent pouvoir se suivre dans un même feed sans rupture de traitement.

Trois consignes reviennent dans chaque scène parce que la composition en dépend :
sujet **dans la moitié haute**, moitié basse **sombre et vide** (c'est là que vit
le texte), et l'interdiction explicite de tout caractère lisible.

Le registre est celui de l'objet de métier : laiton, cuir, papier, bois sombre,
cuivre. Pas de ville, pas d'architecture, pas de paysage — la série parle de
dispositifs qu'on actionne, donc elle montre des objets qu'on manipule.

## Les 6 scènes

| # | Story | Scène demandée |
|---|-------|----------------|
| 1 | La phrase interdite | épais volume relié en cuir sombre posé ouvert sur un bureau en noyer, tranches de pages dorées à l'or fin, papier bible très fin, lumière dorée rasante venant de la gauche qui accroche la dorure, pages absolument illisibles et floues sans aucun caractère déchiffrable |
| 2 | Exemple 1 — innovation | établi d'atelier de prototypage vu en légère plongée, carte électronique nue aux pistes cuivrées, pied à coulisse en laiton, carnet ouvert couvert de croquis techniques illisibles, lumière dorée chaude d'une lampe d'architecte hors cadre |
| 3 | Exemple 2 — transmission | une grosse clé ancienne en laiton posée sur un sous-main de cuir patiné, à côté une enveloppe épaisse fermée d'un cachet de cire rouge sombre, lumière dorée rasante de fin d'après-midi, idée de transmission et de succession |
| 4 | Exemple 3 — le quotidien | balance de précision ancienne en laiton poli sur un bureau en noyer sombre, série de poids en laiton alignés par taille à côté, plateaux parfaitement équilibrés, lumière dorée rasante venant de la droite, idée de calibrage et de mesure juste |
| 5 | Les deux fiscalités | deux lampes de banquier en laiton identiques côte à côte sur une longue table sombre, celle de gauche éteinte dans l'ombre froide, celle de droite allumée d'une lumière dorée chaude, symétrie frontale nette, idée de deux régimes opposés |
| 6 | CTA GO | haute double porte de bureau privé en bois sombre à panneaux, poignées et plaques en laiton massif, entrebâillée de quelques centimètres, une lumière dorée chaude s'échappe de l'interstice et se pose sur le parquet, couloir sombre au premier plan |

**Aucune des six n'a eu besoin d'être régénérée.** Les six ont été relues avant
upscale : sujet bien dans la moitié haute, aucun caractère lisible, aucun
visage, aucune plaque gravée, aucun drapeau.

Sur une série dont le sujet est *le texte de loi*, le risque numéro un était que
le modèle écrive. D'où l'insistance, scène par scène, sur des pages et des
croquis explicitement **illisibles et flous** plutôt qu'un simple « aucun texte » :
c'est ce qui a tenu sur les stories 1 et 2, les deux seules qui montrent du
papier.

## Le fond qui demandait le plus d'attention

La story 5 — les deux lampes — a une traînée de lumière chaude qui descend de la
lampe allumée jusqu'au bas du cadre, c'est-à-dire en plein dans la colonne de
texte. C'est l'image la plus juste de la série (deux régimes, un seul éclairé) et
il n'était pas question de la perdre : c'est au renfort bas de `story.css` de
l'absorber, et au contrôle de contraste de dire si ça suffit. Le relevé du build
est dans le `README.md`.

## Si Higgsfield est indisponible

Déposer six fichiers nommés `bg-1.jpg` … `bg-6.jpg` dans `backgrounds/`, au
format vertical, idéalement 1080 × 1920 ou plus. `node build.mjs` refuse de
produire quoi que ce soit tant qu'un fichier manque, et nomme celui qui manque.
