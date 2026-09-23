# Livraison — Reel « Collaborer avant de s'associer »

## Fichiers hébergés (Higgsfield)
| Élément | URL |
|---|---|
| **Master v4 (Modules B + C : voix studio, B-roll Pexels, typo cinétique, checklist)** 1080×1920, 30 fps, 46,67 s, −14,2 LUFS | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/235d65b8-5e0d-4027-9340-f5b069698e1f.mp4 |
| B-roll 1 étalonnée (Yan Krukau / Pexels) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/3ceecd20-aaaf-4cdc-8758-26f5b57cfe2e.mp4 |
| B-roll 2 étalonnée (Ebahir / Pexels) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/823163eb-54dc-4e4d-bd32-0fc76971cb68.mp4 |
| Mockup checklist (ProRes 4444 + alpha) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/56fafbfb-a006-4b3f-85fc-9c51ab8f30c9.mp4 |
| Master v3 (voix studio + sous-titre « cabinet » corrigé) 1080×1920, 30 fps, 46,67 s, −14,2 LUFS | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/ea493262-e6f7-4c11-b29e-dd9be148bfac.mp4 |
| Master v2 (voix studio, Module B) 1080×1920, 30 fps, 46,67 s, −14,2 LUFS | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/f01e44ba-6313-4247-b067-e1b2db145e60.mp4 |
| Master v1 (voix ffmpeg) 1080×1920, 30 fps, 46,67 s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/df43cb8d-ae45-4b7c-910f-b2de89b56856.mp4 |
| Contact sheet (10 moments) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/4aff40d6-758f-48b2-8388-7350674532ca.png |
| Rush monté (jump cuts + upscale, sans graphisme) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/a43a817f-9781-450e-876f-9d3e2240e59b.mp4 |
| Voix nettoyée (voice_clean = mix, pas de musique), MP3 320k | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/6e8e33aa-e55c-44fd-bc49-a774b716334a.mp3 |
| Upscale Topaz 1080p de la source | https://d8j0ntlcm91z4.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/hf_20260923_134245_38e7be2e-257b-4d1e-a84b-08ad81349e58.mp4 |

## QA master (mesures)
| Contrôle | Cible | Mesuré |
|---|---|---|
| Résolution / fps | 1080×1920 / 30 | 1080×1920 / 30/1, yuv420p |
| Vidéo | H.264, 10 Mb/s | H.264 High, 9,77 Mb/s |
| Audio | AAC 192k | AAC LC 48 kHz stéréo, 184 kb/s |
| Faststart | oui | `moov` avant `mdat` |
| Durée | 30–60 s | 46,67 s (44,67 s de parole + CTA 2 s) |
| Loudness | −14 ±1 LUFS | **−14,4 LUFS**, true peak −3,7 dBTP, LRA 3,7 LU |
| Synchro sous-titres ↔ voix | < 80 ms | Whisper medium re-transcrit sur le master, 131/154 mots appariés : **médiane 20 ms, p90 67 ms**, biais moyen +11 ms |
| Synchro labiale | exacte | coupes à l'image près (1340 images = 44,667 s) |
| Safe zones IG | rien dans 0–250 px / 1570–1920 px | graphismes y 1000–1400, captions y 1395–1571 |
| Éléments graphiques simultanés | ≤ 1 (hors captions) | 1 max (vérifié sur la timeline, voir `timeline.json`) |

Sonde brouillon → master : le brouillon (540×960, 51 s de rendu) a servi à valider les transitions et à mesurer un décalage systématique de ~70 ms des captions. Ce décalage est corrigé (+60 ms) dans le master.

## Viralité
Le `virality_predictor` de Higgsfield n'accepte que des vidéos de 16 s maximum. J'ai donc analysé les **15 premières secondes du master** (hook, idée 1 et début de l'idée 2), la partie qui décide de la rétention. Job `7d752bd7-0e6f-44ad-a533-7e716436673e` (media `2f259867-6f7f-455b-908a-092da3e81b96`).

| Score (proxy 0–100) | Valeur |
|---|---|
| Overall | **48** |
| Hook (fenêtre 0–3 s) | **34** |
| Brain engagement | 42 |
| Viral potential | 47 |
| Sustain | **93** |
| Pic d'activité | 0:00 |

Rapport interactif : https://d8j0ntlcm91z4.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/hf_20260923_141217_7d752bd7-0e6f-44ad-a533-7e716436673e.html

Lecture : la rétention est très bonne (93), mais l'accroche est faible (34). Les 1,5 premières secondes (« S'il vous plaît, ») sont calmes, et le mot fort « ARRÊTEZ » n'arrive qu'à 1,48 s. Piste pour une V2 : démarrer directement sur « Arrêtez de vous associer » et remonter le titre à 0 s. Ce n'est pas appliqué, le PLAN validé prévoyait ce hook.

## Fichiers dans ce dossier
- `PLAN.md` : plan validé + timeline finale exécutée
- `edit.js` : script Higgsedit final (généré, données incluses) ; `edit.template.js` + `gen_edit.py` : sources
- `prep.py` / `cuts.json` : jump cuts à l'image près ; `transcript.json` : transcription mot à mot corrigée
- `timeline.json` : captions, cartes, schémas et keyframes caméra sur la timeline finale
- `contact_sheet.png` : contact sheet du master v4 (une image par mockup et par B-roll)
- `mockups/checklist/` : mockup HTML + tokens + script de rendu ; `SOURCES.md` : crédits Pexels et mockups ; `audio/` : chaîne voix studio
- `tests/probe.js` : script de validation des primitives Higgsedit

## Reproduire
```bash
python3 prep.py && python3 gen_edit.py          # cuts.json, edit.js, timeline.json
# sandbox Higgsfield, avec /home/user/w/cut.mp4 (rush monté ci-dessus) :
REEL_MODE=frames higgsedit build edit.js        # images de contrôle
REEL_MODE=draft  higgsedit build edit.js        # brouillon 540x960
REEL_MODE=master higgsedit build edit.js        # master 1080x1920 H.264 10 Mb/s
ffmpeg -i reel/renders/master.mp4 -i voice_clean.wav -map 0:v -map 1:a -c:v copy -af apad \
  -c:a aac -b:a 192k -shortest -movflags +faststart master_final.mp4
```
