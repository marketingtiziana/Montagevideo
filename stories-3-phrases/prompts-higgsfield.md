# Prompts photo — Higgsfield

Séquence « Les 3 phrases de fin d'appel » — Fynovates.

Les 6 photos ont été générées ici via l'API Higgsfield (modèle `gpt_image_2_5`, ratio 9:16),
puis **upscalées en 4K** (2294 × 4096) avant composition. Les fichiers sont dans
`backgrounds/bg-1.png` … `bg-6.png`.

Ce fichier sert de référence pour **régénérer** une photo : reprendre le préfixe commun,
y coller la description de la story, puis remplacer le fichier correspondant.

> Si aucun accès Higgsfield n'est disponible, générer les images ailleurs avec ces mêmes
> prompts et les déposer dans `backgrounds/` sous les noms `bg-1.png` … `bg-6.png`
> (le `.jpg` fonctionne aussi : adapter le champ `bg` dans `src/content.js`).

## Préfixe commun — à mettre en tête de chaque prompt

> Photographie réaliste cinématographique, format vertical 9:16, palette naturelle avec
> dominante chaude dorée et ombres bleu nuit, éclairage de fin de journée ou intérieur
> tamisé, grain de film léger, faible profondeur de champ, aucun texte dans l'image,
> aucun visage reconnaissable de face, qualité éditoriale type reportage premium.

## Descriptions par story

**bg-1** — Intérieur d'un bureau moderne en fin de journée : un homme vu de dos, en chemise,
téléphone à l'oreille, debout face à une grande baie vitrée ; derrière la vitre, une ville au
crépuscule en flou de profondeur. Lumière dorée rasante traversant la pièce. Aucun texte,
aucun logo, aucun visage de face.

**bg-2** — Bureau vu de dessus en plongée verticale : ordinateur portable ouvert, carnet ouvert
couvert de notes manuscrites totalement illisibles et floues, une main tenant un stylo pointé
sur une ligne du carnet, tasse de café, lumière naturelle douce venant d'une fenêtre latérale.
Aucun texte lisible, aucun logo, aucun visage.

**bg-3** — Rue urbaine la nuit sous une pluie fine : un homme vu de dos tenant un parapluie,
tourné vers la gauche du cadre où brille une vitrine éclairée ; à droite du cadre, une ruelle
sombre plongée dans l'ombre. Réverbères dorés, reflets dorés sur le pavé mouillé. Aucun texte,
aucune enseigne lisible, aucun visage de face.

**bg-4** — Route de montagne au lever du soleil : la route serpente nettement en lacets vers un
horizon lumineux, brume dorée au fond de la vallée, crêtes bleu nuit en contre-jour, sensation
de direction retrouvée. Aucun texte, aucun panneau, aucun véhicule.

**bg-5** — Salle de réunion haut de gamme, vide de toute personne : longue table en bois sombre,
deux fauteuils en cuir se faisant face, un carnet en cuir et une montre posés sur la table,
grande fenêtre laissant entrer une lumière chaude de fin d'après-midi. Aucun texte, aucun logo,
personne dans la pièce.

**bg-6** — Terrasse en toiture au lever du soleil, vue très épurée : une silhouette d'homme vue
de dos, en contre-jour, décalée vers la droite du cadre et située dans le tiers inférieur,
accoudée à un garde-corps fin. Immense ciel dégagé au-dessus, dégradé profond du bleu nuit en
haut vers l'or chaud près de l'horizon, quelques nuages fins, lumière rasante. Le milieu du
cadre est entièrement vide, uniquement du ciel. Aucun texte, aucun logo, aucun visage de face.

### Note sur bg-6

La première version (terrasse au lever du soleil, silhouette centrée) a été **écartée** : voile
délavé sans les ombres bleu nuit de la série, et la silhouette tombait exactement derrière
l'encadré `GO`. Le prompt ci-dessus impose deux corrections qui règlent les deux problèmes :
silhouette **décalée à droite et basse**, et **dégradé franc bleu nuit → or** au lieu d'une
brume uniforme.

## Contraintes qui reviennent à chaque génération

- aucun texte, aucune enseigne lisible, aucun logo dans la photo — tout le texte est en
  overlay HTML/CSS ;
- aucun visage de face (de dos ou en contre-jour) ;
- centre du cadre dégagé : le bloc de texte est centré verticalement ;
- palette homogène sur les 6 — doré chaud + ombres bleu nuit.
