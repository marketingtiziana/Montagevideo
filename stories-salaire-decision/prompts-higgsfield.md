# Prompts Higgsfield — « Ton salaire est une décision »

Six illustrations au trait, générées avec le MCP Higgsfield, modèle **`gpt_image_2_5`**,
`aspect_ratio: "1:1"` (le cadre de destination est carré : environ 600 × 600 px dans la story).

Pour régénérer une image : reprendre le prompt tel quel, déposer le PNG dans
`illustrations/illu-N.png`, relancer `npm run build`. Le build se charge du nettoyage du
fond — inutile de détourer à la main.

## Le préfixe commun

```
Illustration minimaliste au trait noir sur fond blanc pur, style line art épuré une seule épaisseur de trait fine et constante, dessin élégant type éditorial du New Yorker, aucune couleur, aucun remplissage, aucune ombre, aucun texte ni chiffre ni lettre dans l'image, beaucoup d'espace blanc, composition centrée, fond parfaitement blanc.
```

Repris du brief, avec trois durcissements et leur raison :

- **« une seule épaisseur de trait fine et constante »** au lieu de « une seule épaisseur de
  trait ». Sans « constante », le modèle épaissit les contours extérieurs et affine les
  détails intérieurs : les six dessins n'auraient plus la même graisse en planche.
- **« aucun texte ni chiffre ni lettre »** au lieu de « aucun texte ni chiffre ». Le mot
  « lettre » est ce qui empêche les caractères isolés décoratifs, que « texte » seul laisse
  passer.
- **« aucune écriture, aucun chiffre »** répété en fin de prompt. Les scènes 1, 3 et 5
  contiennent un billet de banque ou des pièces : sans cette insistance, le modèle y grave
  une valeur faciale et un symbole monétaire.

## Les 6 prompts

### Story 1 — Le point d'interrogation en billet → `illustrations/illu-1.png`

```
Illustration minimaliste au trait noir sur fond blanc pur, style line art épuré une seule épaisseur de trait fine et constante, dessin élégant type éditorial du New Yorker, aucune couleur, aucun remplissage, aucune ombre, aucun texte ni chiffre ni lettre dans l'image, beaucoup d'espace blanc, composition centrée, fond parfaitement blanc. Un grand point d'interrogation dessiné d'un seul trait fin, dont la courbe supérieure se transforme et se termine en un billet de banque plié ; le point sous le point d'interrogation est un petit cercle simple. Un seul objet au centre du cadre. Aucune écriture, aucun symbole monétaire, aucun motif sur le billet.
```

### Story 2 — Le levier et ses cinq effets → `illustrations/illu-2.png`

```
Illustration minimaliste au trait noir sur fond blanc pur, style line art épuré une seule épaisseur de trait fine et constante, dessin élégant type éditorial du New Yorker, aucune couleur, aucun remplissage, aucune ombre, aucun texte ni chiffre ni lettre dans l'image, beaucoup d'espace blanc, composition centrée, fond parfaitement blanc. Un levier mécanique simple dessiné au trait : une barre inclinée posée sur un petit point d'appui triangulaire, une main stylisée posée sur l'extrémité haute de la barre. De l'autre extrémité du levier partent cinq fines lignes droites rayonnantes vers cinq petits pictogrammes très épurés, bien séparés : une pièce ronde, un bâtiment simple, une flèche montante, un parasol, un avion en papier. Composition claire et aérée. Aucune écriture, aucun chiffre.
```

### Story 3 — Les deux seaux → `illustrations/illu-3.png`

```
Illustration minimaliste au trait noir sur fond blanc pur, style line art épuré une seule épaisseur de trait fine et constante, dessin élégant type éditorial du New Yorker, aucune couleur, aucun remplissage, aucune ombre, aucun texte ni chiffre ni lettre dans l'image, beaucoup d'espace blanc, composition centrée, fond parfaitement blanc. Deux silhouettes humaines identiques debout au trait, côte à côte, très simples et sans visage. Sous la silhouette de gauche, un seau percé de plusieurs trous d'où tombent quelques gouttes. Sous la silhouette de droite, le même seau intact, posé sur une petite pile de trois pièces rondes. Symétrie nette entre les deux moitiés du dessin. Aucune écriture, aucun chiffre, aucun symbole monétaire.
```

### Story 4 — Quatre clés, une serrure → `illustrations/illu-4.png`

```
Illustration minimaliste au trait noir sur fond blanc pur, style line art épuré une seule épaisseur de trait fine et constante, dessin élégant type éditorial du New Yorker, aucune couleur, aucun remplissage, aucune ombre, aucun texte ni chiffre ni lettre dans l'image, beaucoup d'espace blanc, composition centrée, fond parfaitement blanc. Quatre clés dessinées au trait, alignées verticalement en colonne à gauche, toutes de longueur identique mais chacune avec un panneton de forme nettement différente. Face à elles, à droite, une seule serrure ronde simple dessinée au trait. L'idée : aucune des quatre clés n'est évidemment la bonne. Beaucoup de blanc entre les clés et la serrure. Aucune écriture, aucun chiffre.
```

### Story 5 — La balance à l'équilibre → `illustrations/illu-5.png`

```
Illustration minimaliste au trait noir sur fond blanc pur, style line art épuré une seule épaisseur de trait fine et constante, dessin élégant type éditorial du New Yorker, aucune couleur, aucun remplissage, aucune ombre, aucun texte ni chiffre ni lettre dans l'image, beaucoup d'espace blanc, composition centrée, fond parfaitement blanc. Une balance à deux plateaux très épurée, parfaitement horizontale et à l'équilibre. Sur le plateau de gauche, un billet de banque plié. Sur le plateau de droite, un petit compas de géomètre. Dessin symétrique, extrêmement simple, un seul objet central. Aucune écriture, aucun chiffre, aucune graduation, aucun symbole monétaire.
```

### Story 6 — La confidence → `illustrations/illu-6.png`

```
Illustration minimaliste au trait noir sur fond blanc pur, style line art épuré une seule épaisseur de trait fine et constante, dessin élégant type éditorial du New Yorker, aucune couleur, aucun remplissage, aucune ombre, aucun texte ni chiffre ni lettre dans l'image, beaucoup d'espace blanc, composition centrée, fond parfaitement blanc. Un visage humain de profil dessiné d'un seul trait continu très fin, réduit à l'essentiel, presque un pictogramme élégant. Une main stylisée levée devant la bouche, paume de côté, en geste de confidence, comme pour chuchoter un secret. Extrêmement simple et épuré, un seul sujet au centre. Aucune écriture, aucun chiffre.
```

## Le fond blanc, et pourquoi le build le retouche

Le brief demande un fond `#FFFFFF` parfait. Higgsfield n'en produit jamais tout à fait un :
il reste un voile crème ou gris très clair, invisible isolément mais qui dessine un **carré
net** une fois posé sur le blanc pur de la story.

Le build corrige ça avant tout rendu, dans le canvas de Chromium, en trois temps :

1. **désaturation** par luminance perçue — plus aucune couleur ne peut subsister ;
2. **écrasement du fond** : tout ce qui dépasse 240/255 devient du blanc pur exactement ;
3. **réétalement des traits** sur la plage restante, pour qu'ils gardent leur densité et leur
   anticrénelage au lieu de devenir gris.

Le build mesure le pourtour de chaque image avant et après, et **échoue** si le blanc pur
n'est pas atteint. Le relevé est affiché à chaque exécution.

Il mesure aussi la **part de pixels franchement noirs** de chaque dessin. C'est le proxy
chiffré de l'épaisseur de trait : deux illustrations de la même série doivent tomber dans le
même ordre de grandeur. Un écart franc signale un dessin trop chargé ou trop maigre, à
régénérer plutôt qu'à garder.
