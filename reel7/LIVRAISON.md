# Livraison — Reel 7 « TVA & formation en ligne »

## Fichiers hébergés (Higgsfield, confirmés)

| Élément | Caractéristiques | URL |
|---|---|---|
| **Master 60 fps** | 1080×1920, 60 fps (3449 images), H.264 High 12,1 Mb/s, AAC 192k 48 kHz, faststart, 57,48 s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/b9192a9c-dce6-4f96-bb32-bf7592b72339.mp4 |
| **Fallback 30 fps** | 1080×1920, 30 fps, H.264 High 10,0 Mb/s, AAC 192k 48 kHz, faststart (dérivé du master) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/8c5246da-1363-44e9-8335-15a32bd4ed23.mp4 |
| Extrait hook 0–15 s (Virality Predictor) | 1080×1920, 60 fps | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/fa267bb5-d73d-411d-8a98-de2456b0ec46.mp4 |
| Rapport Virality Predictor | dashboard interactif | https://d8j0ntlcm91z4.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/hf_20261007_191124_3d7c0ce8-44f7-4779-85b3-8fe8e8ff86a9.html |

Dans le dépôt :
- `tests/contact_elements.jpg` : planche contact, une vignette par élément ;
- `tests/cuts_strip.jpg` : planche des coupes, 8 images à 0,25× par raccord ;
- mesures : `tests/qa_reel7_master_60fps.json`, `tests/av_audit.json`, `tests/audit_audio.json`, `tests/virality_hook.json`.

Les masters locaux sont dans `renders/`. Ils ne sont pas versionnés (`*.mp4` ignorés).

## QA (mesurée sur le master 60 fps livré)

| Contrôle | Cible | Mesuré | |
|---|---|---|---|
| Format | 60 fps 12M + 30 fps 10M, AAC 192k, faststart | 12,1 / 10,0 Mb/s · AAC 48 kHz · faststart sur les deux | ✅ |
| Durée | 30–60 s | 57,48 s | ✅ |
| Loudness | −14 ±1 LUFS | **−14,0 LUFS** · true peak −3,0 dBFS · LRA 2,4 LU | ✅ |
| Plancher de bruit | < −60 dBFS | **−75,5 dBFS** dans les pauses (fenêtre de 100 ms la plus calme du mix) | ✅ voir (1) |
| Coupes invisibles (4 contrôles × 10) | RMS < −32 dB, mots intacts, tête stable | 10/10 : RMS de −42,5 à −55,8 dBFS, mots intacts, coupes **a** ≤ 0,065 écart d'yeux | ✅ `CUTS.md` |
| Lip-sync (5 points) | < 1 image | **0 ms** d'écart dû au montage aux 5 points (1,0 · 17,0 · 23,0 · 37,5 · 52,2 s) | ✅ voir (2) |
| Synchro sous-titres / voix | < 60 ms | médiane **7 ms**, p90 23 ms, biais +4 ms, **98,4 %** des mots sous 60 ms (182/198 appariés) | ✅ |
| Avance des éléments (5 tirés, seed 6) | 120–180 ms | trois 143 · règle 150 · France 143 ms ; 2 mots non retrouvés par la re-transcription | ✅ 3/3 mesurés |
| Zéro statique | aucune fenêtre fixe > 1,2 s | plus longue immobilité **0,25 s** | ✅ |
| Planche contact | marges, max 2 éléments | rien dans les 250 px du haut ni les 350 px du bas, au plus 2 éléments à l'écran | ✅ |

(1) Le percentile 5 des fenêtres de 50 ms (−41,7 dBFS) mesure des fins de mots et des respirations gardées (150–250 ms après chaque phrase), pas du bruit. Dans les vraies pauses, le plancher est à −75,5 dBFS.

(2) Méthode : on mesure le retard entre l'ouverture de la bouche (MediaPipe) et l'enveloppe de la voix, sur le master et sur la référence (base 60 fps + voix traitée, alignées par construction). L'écart entre les deux est l'erreur due au montage : 0 image aux 5 points.

## Virality Predictor (hook 0–15 s ; l'outil refuse les vidéos de plus de 16 s)

| Score | Valeur |
|---|---|
| Global | **49** / 100 |
| Potentiel viral | 56 |
| Engagement | 39 |
| Hook (0–3 s) | **28** |
| Maintien | **100** |
| Pic | à 15 s (« tout le monde se plante » → « formation en ligne ») |

Lecture :
- Le maintien est maximal et la courbe monte sans creux jusqu'au pic de 15 s.
- Le point faible est l'ouverture (0–3 s), comme pour le reel 6. La première phrase est une question à plat, avant la tension.
- Piste pour un A/B : ouvrir sur « C'est là que tout le monde se plante » (14 s), puis enchaîner sur la question.
