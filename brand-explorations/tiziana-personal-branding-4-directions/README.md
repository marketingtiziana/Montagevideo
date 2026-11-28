# Tiziana — Personal branding, 4 directions

Une seule Tiziana, quatre univers : 01 Warm & Natural, 02 Modern Monochrome, 03 Soft Olive, 04 Deep Plum & Cream.

Grammaire commune (V2) inspirée du feed de référence : photos réelles en monochrome tonal, titres condensés Bebas Neue, accent manuscrit Allura, format « The reality behind business — l’émission ». Seuls la palette et le petit signe changent.

- `final-pdf/` : plaquette A4 paysage (40 pages) + aperçus
- `direction-0X-*/` : posts, carrousel, reels, profil, bannière, planche photo, silhouettes, signes
- `instagram/`, `linkedin/` : mises en situation des profils
- `document-source/` : sources (`identite.js`, `grammar-ref.js`, `visuals.js`, `book.js`)

Régénérer : `cd document-source && node render-visuals.cjs all 1 && node render-visuals.cjs all 2 && node make-pdf.cjs`

Photos : shooting réel de Tiziana (étalonnage uniquement). Environnements : CC0 (voir `sources/`). Réunion / collaborateurs : photos à réaliser.
