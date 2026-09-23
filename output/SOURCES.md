# SOURCES — assets tiers et mockups

## B-roll (Pexels, licence Pexels : utilisation gratuite, attribution non obligatoire mais faite)
| Asset | Page Pexels | Auteur | Extrait utilisé (source) | Usage dans le master (in → out) |
|---|---|---|---|---|
| `assets/broll/idee1_partners.mp4` | https://www.pexels.com/video/people-working-at-the-office-7691589/ | [Yan Krukau](https://www.pexels.com/@yankrukov) | 4,5 → 7,3 s, 1080×1920 | 11,17 → 13,45 s (« mon cabinet, des gens qui s'associent ») |
| `assets/broll/idee3_rings.mp4` | https://www.pexels.com/video/romantic-wedding-ring-exchange-ceremony-38359909/ | [Ebahir](https://www.pexels.com/@ebahir) | 1,5 → 4,7 s, recadré ×1,25 vers le haut (mains au-dessus des sous-titres) | 26,68 → 29,45 s (« vous vous mariez combien de fois ? ») |

Étalonnage identique sur les deux plans : `eq=saturation=0.9:contrast=1.05,unsharp=3:3:0.4`, 30 fps, puis le même grain et la même vignette GLSL que la vidéo principale.
Recherche : API Pexels `videos/search`, `orientation=portrait`. Critères : ≥ 1080p vertical, pas de visage en gros plan, pas de logo, lumière naturelle, mouvement lent.

## Mockups (Module C) — faits maison, aucune UI de marque
| Mockup | Fichiers | Contenu affiché | Usage (in → out) |
|---|---|---|---|
| Checklist (C2-4) | `mockups/checklist/index.html`, `tokens.css`, `render.py` → `mockup.mov` (ProRes 4444 + alpha, 960×580, 10,4 s) | Mots du script uniquement : « Tester la personne · Collaborer · Voir les périodes basses · Voir les périodes hautes · Et ensuite, s'associer » | 30,16 → 40,57 s |
| Typo cinétique du hook (C2-11) | natif Higgsedit (`edit.js`) | « S'IL VOUS PLAÎT · ARRÊTEZ · DE VOUS · ASSOCIER » | 0,00 → 3,60 s |

Police : Montserrat (OFL), fichier local `mockups/typo/Montserrat-wght.ttf` + `OFL.txt`, aucun CDN.

## Attribution Pexels (à mettre dans la légende ou la description)
- Texte : « Vidéos : Pexels (pexels.com) — Yan Krukau, Ebahir »
- Pour une page web : « Photos provided by Pexels » avec un lien vers https://www.pexels.com
- Logos : https://images.pexels.com/lib/api/pexels-white.png (fond sombre) / https://images.pexels.com/lib/api/pexels.png (fond clair)
