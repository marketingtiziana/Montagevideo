# Photos d'arrière-plan — prompts Higgsfield

Série « Rester en France, mais structuré », 6 arrière-plans.

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

C'est le préfixe des séries 7 et 8, repris à l'identique : les trois séries
doivent pouvoir se suivre dans un même feed sans rupture de traitement.

Trois consignes reviennent dans chaque scène parce que la composition en dépend :
sujet **dans la moitié haute**, moitié basse **sombre et vide** (c'est là que vit
le texte), et l'interdiction explicite de tout caractère lisible.

Le registre change en revanche complètement par rapport à Dubaï : pierre,
zinc, laiton, bois et fer forgé remplacent le verre et le désert. C'est le
sujet de la série qui l'impose — la France tenue, pas la destination à la mode.

## Les 6 scènes

| # | Story | Scène demandée |
|---|-------|----------------|
| 1 | Ouverture | toits de zinc parisiens vus depuis l'intérieur d'un appartement haussmannien à travers une grande fenêtre à petits carreaux, montants en silhouette sombre sur les bords du cadre, cheminées en terre cuite alignées, lumière dorée rasante de lever de soleil sur le zinc humide, brume légère au loin, calme et décision assumée |
| 2 | Les deux camps | bureau privé parisien la nuit, une seule lampe de banquier en laiton allumée près d'une haute fenêtre, à travers la vitre au loin des lueurs urbaines rouges et ambrées totalement floues et illisibles qui évoquent une agitation lointaine, intérieur feutré et parfaitement calme, contraste entre le dedans ordonné et le dehors trouble |
| 3 | Les leviers | plan de travail d'architecte en bois sombre vu en légère plongée, plan technique d'un immeuble classique en coupe aux traits fins, réglet en laiton, compas, stylo à plume posé en travers, lumière dorée rasante venant de la gauche, précision et métier |
| 4 | La bascule | façade de pierre d'un grand bâtiment classique français vue en forte contre-plongée à l'heure dorée, colonnes massives et corniche sculptée, pierre de taille claire chauffée par le soleil bas, ciel bleu nuit qui s'assombrit en haut du cadre, impression de solidité et de permanence |
| 5 | Le pôle France | salle de réunion sobre d'un cabinet parisien en fin d'après-midi, longue table en noyer, deux fauteuils en cuir se faisant face, haute fenêtre haussmannienne au fond avec les toits de Paris en arrière-plan flou, lumière dorée de fin de journée, personne dans le cadre |
| 6 | CTA GO | hall d'entrée d'un hôtel particulier parisien, escalier de pierre qui s'élève en courbe avec une rampe en fer forgé ouvragé, lumière dorée chaude qui descend d'une verrière hors cadre, sol de marbre sombre qui reflète faiblement, élégance discrète d'un cabinet privé |

**Aucune des six n'a eu besoin d'être régénérée.** Les six ont été relues avant
upscale : sujet bien dans la moitié haute, aucun caractère lisible, aucun
visage, aucun drapeau — sur un sujet « France » c'était le risque à surveiller.

## Le prix payé côté lisibilité

Trois de ces fonds sont nettement plus lumineux dans leur moitié basse que ceux
des séries précédentes : le papier du plan (story 3), la pierre éclairée
(story 4), le marbre réfléchissant (story 6). C'est voulu — c'est ce qui donne
à la série sa chaleur — mais ça se paie sur le contraste du texte, et le
renfort bas de `story.css` est plus opaque que celui de `stories-dubai/` pour
cette seule raison. Le détail de la correction est dans le `README.md`.

## Si Higgsfield est indisponible

Déposer six fichiers nommés `bg-1.jpg` … `bg-6.jpg` dans `backgrounds/`, au
format vertical, idéalement 1080 × 1920 ou plus. `node build.mjs` refuse de
produire quoi que ce soit tant qu'un fichier manque, et nomme celui qui manque.
