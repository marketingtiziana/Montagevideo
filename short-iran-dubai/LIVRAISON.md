# LIVRAISON — Short 9:16 « La guerre en Iran menace-t-elle l'expatriation à Dubaï ? »

Faits vérifiés le **12/10/2026** (FACTS.md). Rendu le 12/10/2026. 1080×1920, 58,0 s, H.264, AAC 192 k, faststart.

## Masters
| Fichier | Spéc | URL |
|---|---|---|
| final60.mp4 | 60 fps, 12 Mb/s, mix -14 LUFS / TP -1 dBTP | __URL_FINAL60__ |
| final30.mp4 | 30 fps (fallback), 10 Mb/s | __URL_FINAL30__ |

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
- Contact sheets : __URL_SHEET_SCREENS__ (écrans), __URL_SHEET_TRANSITIONS__ (transitions), __URL_SHEET_PLANS__ (tous les plans, brand safety).
- Mockups .mov alpha : __URL_BOARD__, __URL_HUD__, __URL_ALERT__.
- Archive : __URL_ZIP__.

## QA
__QA__

## Variables rendues
- HANDLE : `@fynovates` (déduit du domaine de l'expéditeur — à confirmer ; changer avec `--handle` et relancer `tools/build_edit.py` + rendu).
- CTA_MÉCANIQUE : « Commente PLAN B ».
- Accents : tension `#D9822B` (ambre), solution `#3EC1A8`.
- Musique : synthèse interne (vidIQ a échoué deux fois) — structure exacte rise 9 s / drop 10 s / résolution 28 s.
