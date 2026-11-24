# FYNOVATES — Branding LinkedIn : trois directions artistiques

Maquettes finalisées de la page entreprise LinkedIn FYNOVATES et de ses publications, en trois directions :

- **A — The Institutional Advisory** : serif institutionnelle (Source Serif), grands blancs, filets fins, numérotation romaine, ivoire et navy.
- **B — The Modern Financial Journal** : en-tête de journal, titres Playfair Display, texte Source Serif, métadonnées IBM Plex Mono, figures et tableaux numérotés, accent brique.
- **C — The Corporate Precision** : grille modulaire visible, Inter seule en graisses fortes, index numériques, aplats navy, bleu ardoise.

Même contenu dans les trois directions : seuls la composition et le traitement changent. Logo : le logo officiel FYNOVATES, vectorisé à l'identique (`brand/fynovates-logo-*.svg`), sans icône ni monogramme.

## Organisation (`output/<direction>/`)
| Dossier | Contenu |
|---|---|
| `00-planche/` | Planche de branding complète (PNG + PDF) |
| `01-identite/` | Bannière LinkedIn 1128×191 (PNG 2× + SVG) et photo de profil 400×400 (PNG + SVG, polices intégrées) |
| `02-publications/` | 10 publications 1080×1350 : éditorial (2 variantes), infographie, comparatif, actualité, expert, méthodologie, partenariat, corporate, événement |
| `03-carrousel-pdf/` | Document « Compte de paiement ou compte bancaire » : PDF 8 pages + pages PNG |
| `04-etude-de-cas/` | Étude de cas TVA e-commerce : PDF 5 pages + pages PNG |
| `05-page-linkedin/` | Page entreprise simulée : ordinateur (page entière + écran) et mobile (page entière + écran) |

`presentation/index.html` : page de comparaison des trois directions (publiée en artefact).

## Modifier et régénérer
- Textes : `src/content.mjs` (communs aux trois directions).
- Mises en page : `src/dir-a.mjs`, `src/dir-b.mjs`, `src/dir-c.mjs` ; simulation LinkedIn : `src/linkedin-page.mjs` ; planche : `src/board.mjs`.
```bash
node linkedin-branding/src/build.mjs          # toutes les directions (ou : A, B, C)
python3 linkedin-branding/presentation/build.py
```
Prérequis : Playwright (Chromium), Python avec Pillow et fonttools (`pip install fonttools brotli`) pour les SVG.

## À compléter avant publication
- Emplacements entre crochets : nom, fonction, domaine et présentation de l'expert, photos, logo du partenaire, ville du siège, taille de l'entreprise, nombre d'abonnés, numéros de dossier, informations d'événement.
- Le partenariat est un **exemple fictif**. L'étude de cas est un cas type pédagogique, avec des chiffres fictifs.
- Tous les contenus fiscaux, comptables, juridiques et bancaires doivent être validés par les experts FYNOVATES.
- Photos d'illustration : Unsplash (voir `instagram/assets/photos/CREDITS.md`).
