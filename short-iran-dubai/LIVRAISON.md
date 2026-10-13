# LIVRAISON — Short 9:16 « La guerre en Iran menace-t-elle l'expatriation à Dubaï ? »

Faits vérifiés le **12/10/2026** (FACTS.md). Rendu v1 le 12/10/2026, rendu v2 (correctif brand safety, voir § Analyses) le 13/10/2026. 1080×1920, 58,0 s, H.264, AAC 192 k, faststart.

## Masters
| Fichier | Spéc | URL |
|---|---|---|
| **final60_v2.mp4** (à publier) | 60 fps, 12 Mb/s, mix -14 LUFS / TP -1 dBTP — s08 et s14 corrigés | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/7a5e1563-03ce-4c81-9712-42027bf123fd.mp4 |
| **final30_v2.mp4** (à publier) | 30 fps (fallback), 10 Mb/s — s08 et s14 corrigés | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/68e2bbc1-bfa9-44c0-8b1b-5ab28a2a9b0d.mp4 |
| final60.mp4 (v1, remplacé) | 60 fps, 12 Mb/s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/a7d21d1b-7077-4bf6-8fab-e18d3c87b928.mp4 |
| final30.mp4 (v1, remplacé) | 30 fps, 10 Mb/s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/14ca7404-22b4-4921-b3bd-7e1077cdbfd8.mp4 |
| hook15.mp4 (15,5 s, entrée du prédicteur de viralité) | 60 fps, 12 Mb/s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/af8ad3fa-4e32-4d94-83fd-07bffc7c549b.mp4 |

Contact sheets v2 : https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/58c45402-b03e-4f3e-b13f-12002ec1c315.png (écrans), https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/a620b778-310b-45b5-8d05-c42e54fa12f8.png (transitions). Archive v2 (masters v2 + sheets + QA) : https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/a666c444-dbad-4684-8bc8-13abf35862f3.zip.

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
| Analyse Higgsfield `video_analysis_create` (21 clips) | 19/21 propres ; 2 anomalies corrigées dans la v2 (voir § Analyses) |
| Prédicteur de viralité (hook 15,5 s) | overall 46 / 100, hook 31, viral potential 44, sustain 97, pic à 14 s (voir § Viralité) |

## Variables rendues
- HANDLE : `@fynovates` (déduit du domaine de l'expéditeur — à confirmer ; changer avec `--handle` et relancer `tools/build_edit.py` + rendu).
- CTA_MÉCANIQUE : « Commente PLAN B ».
- Accents : tension `#D9822B` (ambre), solution `#3EC1A8`.
- Musique : synthèse interne (vidIQ a échoué deux fois) — structure exacte rise 9 s / drop 10 s / résolution 28 s.

## Analyses vidéo Higgsfield (`video_analysis_create`, 21 clips, ids dans `build/analyses.json`)
Chaque clip 60 fps 9:16 a été décrit par l'analyseur ; la description a servi de contrôle brand safety indépendant du contact sheet.
- 19 clips propres : aucun visage, aucune personne, aucun objet ajouté, aucun média identifiable (k01 Terre de nuit, k02 aéroport vu du ciel, k03 skyline golden hour, k05 tarmac, k06 contrat, k08 skyline nuit, k09 hublot, k10 hublot aile, k11 marina coucher, k12 tour, k14 piste POV, k15 skyline nuit, k16 autoroute nuit, k17 marina, k19 Burj Khalifa nuit, k26 désert, k31 brume, k32 nuages d'orage, k33 gouttes/bokeh).
- **k07 (écran s08, contrat + stylo)** : Kling a ajouté deux mains à partir de 1 s — contraire à la consigne « no new elements ». Correctif v2 : s08 utilise k32 (nuages d'orage, t2v abstrait, sans lieu ni événement). `tools/build_edit.py` et `SOURCES.md` mis à jour.
- **k13 (écran s14, Banque nationale de Roumanie)** : une passante (≈ 60 px, non identifiable) et un halo orange (artefact de lens-flare Kling) en bas à gauche. Correctif v2 : zoom 1,25× ancré en haut à droite (`ZOOM = {'s14': 1.25}`), la zone est hors cadre ; vérifié image par image à 36,4 s et 38,5 s.
- Ces deux points n'apparaissaient pas sur le contact sheet des plans (frame unique à 2 s) : la v1 reste en ligne pour comparaison mais **ne doit pas être publiée**.

## Viralité (`virality_predictor`, modèle brain_activity, entrée hook15.mp4 = 15,5 premières secondes, limite 16 s de l'outil)
Rapport interactif : https://d8j0ntlcm91z4.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/hf_20261012_192913_a2315a34-b334-453a-8420-b7a8f79dae98.html — données brutes : `build/virality_analysis.json`.

| Indicateur (proxies normalisés 0–100, non garantis) | Valeur |
|---|---|
| Overall score | 46 |
| Hook score (fenêtre 0–3 s) | 31 |
| Viral potential | 44 |
| Brain engagement | 40 |
| Sustain | 97 (activité quasi constante 0,38 → 0,42, aucune chute) |
| Pic d'activité | 14 s (« C'est ta structure. » : noir 4 f + flash 2 f à 12 s, puis s07 compteur –31 %) |
| Visual cortex (moyenne 0,51, pic 12 s) | zone la plus activée : les coupes et le compteur fonctionnent |
| Default mode (lower better, 0,61, pic à 0 s) | élevé sur les 2 premières secondes : le hook texte seul retient moins que la suite |

Lecture : la rétention prédite est très stable (sustain 97) mais le hook (0–3 s) est le point faible. Pistes sans retourner un plan : avancer le compteur « 150 km » de 0,6 s, ou ouvrir directement sur la carte (s02) avant la question titre. Les scores sont des proxies prédictifs, pas une mesure de performance.
