# FYNOVATES — Bibliothèque de visuels LinkedIn

Dix familles de visuels, un seul univers : logo FYNOVATES d'origine (sans icône), navy #0D082E, blanc, gris papier #F5F5F7, Inter + Montserrat (+ Source Serif pour les citations).

## Fichiers
- `output/visuels/` : 26 visuels PNG finalisés (1080×1350 portrait ou 1200×627 paysage).
- `output/documents/` : 2 documents PDF de 8 pages (1080×1350, vectoriels) + les pages en PNG.
  - `fynovates-linkedin-02-document-tva.pdf` — Société étrangère et TVA française : les 5 éléments à vérifier
  - `fynovates-linkedin-02-document-comptes.pdf` — Compte de paiement ou compte bancaire : comprendre les différences
- `planche/index.html` : planche comparative (familles, variantes, textes de publication, usages, matrice).
- Sources modifiables : `content.mjs` (textes, données, textes des posts), `templates.mjs` (mises en page), `build.mjs` (export).

## Régénérer
```bash
node linkedin/build.mjs
```

## À compléter avant publication
- Emplacements entre crochets ou en pointillés : `[Prénom Nom]`, `[Fonction]`, photos, logos de partenaires, dates, lieux d'événements.
- Les familles 8 (expert/équipe) et 10 (corporate) ne doivent être utilisées qu'avec des personnes, événements et partenariats réels.
- Tout contenu fiscal, comptable, juridique ou bancaire doit être validé par les experts du cabinet. Le calendrier de la facturation électronique (note 06) est à vérifier à la date de publication.
