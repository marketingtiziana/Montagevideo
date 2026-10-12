# LIVRAISON — Short 9:16 « La guerre en Iran menace-t-elle l'expatriation à Dubaï ? »

Faits vérifiés le **12/10/2026** (FACTS.md). Rendu le 12/10/2026. 1080×1920, 58,0 s, H.264, AAC 192 k, faststart.

## Masters
| Fichier | Spéc | URL |
|---|---|---|
| final60.mp4 | 60 fps, 12 Mb/s, mix -14 LUFS / TP -1 dBTP | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/a7d21d1b-7077-4bf6-8fab-e18d3c87b928.mp4 |
| final30.mp4 | 30 fps (fallback), 10 Mb/s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/14ca7404-22b4-4921-b3bd-7e1077cdbfd8.mp4 |

## Dossier de production (ce dépôt, `short-iran-dubai/`)
- `FACTS.md` — faits datés et sourcés, liste fermée des faits autorisés à l'écran.
- `SCRIPT.md` — script validé (21 écrans).
- `SOURCES.md` — URL, auteur, licence, horodatage de chaque source (photos Commons CC0/PD/CC BY, clips Kling, carte Natural Earth, mockups, polices OFL, musique et SFX internes).
- `MARGINS.md` — contrôle mécanique des marges : 21/21 écrans conformes.
- `build/facts_diff.md` — diff automatique SCRIPT ↔ FACTS : 21/21 conformes.
- `edit.jsx` / `edit_text.jsx` / `build/fps30/edit.jsx` — projets Higgsedit (60 fps, couche texte seule, 30 fps), générés par `tools/build_edit.py`.
- `mockups/` — tableau des départs, HUD radar, bandeau (HTML → PNG alpha → .mov qtrle + .mp4 fond noir).
- `audio/` — musique 2 actes (synthèse interne), `mix.wav` normalisé ; `sfx/` — SFX synthétisés ; `build/beats_synth.json`.
- `LEGENDES.md` — 3 légendes Instagram avec date de vérification et phrase CTA.
- Contact sheets : https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/bc8800ef-cad0-4fd4-8114-a5f3ea331765.png (écrans), https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/2c79533f-af6f-4c4d-9b1a-5bd1274dceb7.png (transitions), https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/baa0ab18-d869-4bfc-a135-f925aed0ee72.png (tous les plans, brand safety).
- Mockups .mov alpha : https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/648e5989-72e7-4fc1-b15b-359225baf215.mp4, https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/10ba33e1-0562-4bd3-8367-ed33f4300593.mp4, https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/5ab12731-21a7-4588-ad72-432a9b33d679.mp4.
- Archive : https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/8f7ee986-92bf-4b6b-b287-7c6e409d3728.zip.

## QA
| Contrôle | Résultat |
|---|---|
| Marges texte (MARGINS.md, mesure PNG alpha de la couche texte, ombre comprise) | 21/21 écrans conformes (gauche/droite ≥ 131 px sauf solutions ≥ 120 px, haut ≥ 731 px, bas ≥ 604 px, centre 540 ± 4 px) |
| Diff SCRIPT ↔ FACTS (`build/facts_diff.md`) | 21/21 écrans : chaque chiffre/date/affirmation renvoie à une ligne sourcée (G1, A1, A3, A5, I1, V1, R1, T1, T3, T4) |
| Brand safety (contact sheet de tous les plans) | 23 plans réels ou abstraits ; aucun missile, soldat, combat, média identifiable, victime |
| Frames statiques > 1,0 s (diff de frames, 20 fps, seuil 0,35) | 0 (`renders/qa/qa_frames.json`) |
| Strobing sur 3 transitions à 0,25× (8,0 s · 14,0 s · 31,667 s) | 0 inversion de luminance ; extraits ralentis dans `livraison.zip/qa/` |
| Loudness (ebur128 sur les masters muxés) | -13,9 LUFS intégré, pic -1,1 dBFS (cible -14 ± 1 / TP -1) |
| Masters | 1080×1920 ; 60 fps 12 Mb/s (3 480 frames) ; 30 fps 10 Mb/s (1 740 frames) ; AAC 192 k ; faststart |
| Analyse Higgsfield `video_analysis_create` | clip k01 (hook) : scène propre, « no visible movement » artefactuel ; analyses des autres clips : voir section ci-dessous |
| Prédicteur de viralité | voir section ci-dessous |

## Variables rendues
- HANDLE : `@fynovates` (déduit du domaine de l'expéditeur — à confirmer ; changer avec `--handle` et relancer `tools/build_edit.py` + rendu).
- CTA_MÉCANIQUE : « Commente PLAN B ».
- Accents : tension `#D9822B` (ambre), solution `#3EC1A8`.
- Musique : synthèse interne (vidIQ a échoué deux fois) — structure exacte rise 9 s / drop 10 s / résolution 28 s.
