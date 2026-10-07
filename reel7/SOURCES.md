# Sources — Reel 7 « TVA & formation en ligne »

| Élément | Source | Licence |
|---|---|---|
| Vidéo et voix | Rush fourni (Google Drive `1iOFaTaRiJrlkdYV0wR6FhMzRYdH5eEkJ`) | fourni par la cliente |
| Interpolation 60 fps | Higgsfield `upscale_video` (ByteDance, preset `ugc`, 1080p, 60 fps) sur le montage : la source n'a qu'environ 25 images uniques par seconde | traitement de la vidéo fournie |
| Détourage (matte) | Higgsfield `remove_background` (vidéo), en 6 segments de 7 à 12 s calés sur les coupes (le service refuse 57 s d'un bloc). L'alpha est reconstruit par `tools/depth.py` (rapport matte / source, trous comblés, micro réintégré au premier plan). | traitement de la vidéo fournie |
| Page impots.gouv.fr « J'utilise le guichet unique TVA (IOSS-OSS) » (blocs 15, 16 et iPhone 13) | https://www.impots.gouv.fr/node/14108, capturée le 7 octobre 2026 par `tools/capture.py` (Playwright, desktop 1440×900 @2x + pleine page, iPhone 393×852 @3x, bandeau cookies refusé) | capture d'écran d'un site public, utilisée à titre d'illustration |
| Drapeaux France, Belgique, Suisse | SVG redessinés aux proportions officielles (`assets/logos/*.svg`) | domaine public (emblèmes nationaux) |
| Facture (bloc 12) | `mockups/facture/index.html`, capture Playwright @2x : **facture générique**, sans vendeur, sans client nommé, sans numéro, sans montant (barres grises) | création originale |
| Notification « TVA due » (bloc 13) | `mockups/notification/index.html`, rendue image par image en .mov alpha 60 fps (`tools/render_mockup.py`). Sans montant, sans logo, sans organisme. | création originale |
| Icônes | Lucide, catalogue intégré à Higgsedit : receipt, user, monitor-play, scale, triangle-alert, wallet, globe, building-2, circle-help, message-circle, lock | ISC |
| Typographies | Montserrat 800 / 900 (sous-titres, titres, typographie cinétique), Inter 400 / 600 / 700 (UI des fenêtres) — Google Fonts via `higgsedit fonts add` | SIL Open Font License 1.1 |
| Sound design | pop, click, whoosh, tick, impact, sub, shimmer synthétisés en Python (`audio/sfx.py`) | création originale |
| Cartes, compteurs, flux, typographie cinétique, onde de choc, light sweep | dessinés en natif dans `edit.jsx` (formes et shaders GLSL Higgsedit) | — |

## Ce qui n'est PAS dans le reel

- Aucune image ou vidéo générée par IA, aucune génération ni retouche sur la personne. L'interpolation 60 fps crée des images intermédiaires à partir de ses propres images ; le détourage ne modifie pas la personne.
- Aucune fausse preuve : la facture et la notification sont des maquettes génériques, sans montant ni données ; aucune interface officielle inventée.
- Aucun chiffre affiché qu'elle ne prononce pas : 20 % (TVA française), 3 pays / 3 TVA. Les taux 19 % / 21 % / 23 % sont partis au montage (voir CUTS.md).
- Pas de B-roll (aucun déclencheur « imagine / tu es à »), pas de musique (non fournie), pas de clé Pexels / Unsplash utilisée.
