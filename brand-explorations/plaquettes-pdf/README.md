# Plaquettes PDF — directions artistiques

Deux plaquettes A4 paysage, prêtes à partager :

| Fichier | Contenu | Pages |
|---|---|---|
| `Tiziana-Caci-DA-Instagram.pdf` | DA Instagram de Tiziana (V2 inspirée de la référence) : positionnement, inspiration, palette, typographies, étalonnage photo, signatures graphiques, profil, grille de 12, carrousels, Reels, règles d'usage, photos à réaliser | 18 |
| `Fynovates-DA-bleu-et-textures.pdf` | DA Fynovates : intention, palette du bleu nuit et logo, typographie Inter, 8 propositions de textures (une page chacune avec applications), lecture et prochaines étapes | 15 |

Aperçus page par page : `apercus/`.

## Régénérer
```bash
node src/export-assets.cjs   # visuels HD (dossier visuels/) (textures + applications Fynovates, profil et étalonnage Tiziana)
node src/make-pdf.cjs        # impression PDF + aperçus
```
Sources : `plaquette-tiziana.html`, `plaquette-fynovates.html`. Les visuels proviennent de `tiziana-instagram-professional/v2/` et de `fynovates-tiziana/`.

Rien n'est modifié dans la plateforme Fynovates. Photos réelles de Tiziana uniquement ; polices sous licence OFL ; logo FYNOVATES officiel non redessiné.
