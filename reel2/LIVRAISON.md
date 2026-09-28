# Livraison — Reel 2 split-screen « Holding : régime mère-fille »

## Fichiers hébergés (Higgsfield, confirmés)
| Élément | URL |
|---|---|
| **Master** 1080×1920, 30 fps, 51,87 s, H.264 10 Mb/s, AAC 192k, faststart, −14,2 LUFS | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/c648b317-ca62-41fb-b466-048034d98028.mp4 |
| Contact sheet (hook, 12 scènes, end card) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/caa83e11-3797-4e02-b23c-c2a9f7f1d929.png |
| Brouillon 540×960 (QA) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/d0b2c743-ea42-44c9-8ca1-1a3a61d10059.mp4 |
| Rush monté (jump cuts + voix studio, sans graphisme) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/2dd683d6-9245-4cb8-9839-84c4f3941cd9.mp4 |

## QA master (mesurée sur le fichier livré, `tests/qa.py` → `tests/qa_master.json`)
| Contrôle | Cible | Mesuré | |
|---|---|---|---|
| Format | 1080×1920, 30 fps, H.264 10M, AAC 192k, faststart | 1080×1920, 30/1, H.264 High 9,97 Mb/s, AAC LC 48 kHz 184 kb/s, `moov` avant `mdat` | ✅ |
| Durée | 30–60 s | 51,87 s (49,87 s de parole + end card 2 s) | ✅ |
| Loudness | −14 ±1 LUFS | **−14,2 LUFS**, true peak −2,6 dBFS, LRA 4,4 LU | ✅ |
| Zéro statique (stage y 940–1540) | aucune fenêtre > 1,2 s sans mouvement | plus longue fenêtre immobile : **0,10 s** | ✅ |
| Captions ↔ voix | < 80 ms | Whisper medium re-transcrit sur le master, 96/116 mots appariés : **médiane 27 ms, biais −1 ms, 85 % sous 80 ms**, p90 103 ms | ✅ (médiane) |
| Avance des effets | 100–200 ms | compteur 100 000 € **170 ms** · tampon DÉFINITIVEMENT **140** · toggle + impact **140** · compteur 95 % **130** · « réintégrés » **140** | ✅ |
| Stabilité des yeux | y ≈ 300 ±20 px | voir ci-dessous | ⚠️ |
| Impacts | ≤ 3 | 3 (30 %, activer, 95 %) | ✅ |
| Transitions | ≤ 0,4 s, jamais deux fois la même à la suite | swipe → morph → wipe → morph → fondu → iris → swipe → morph → wipe → swipe → fondu | ✅ |

**Yeux** : le cadrage est calculé pour poser les yeux entre y 273 et 300 (le recadrage à 154 % ne peut pas descendre plus bas sans découvrir le haut de l'image). La mesure automatique (détecteur Haar, paires d'yeux, 3 échantillons/s) donne une médiane de **290 px**, mais 43 % seulement des échantillons tombent dans ±20 px. Cette mesure est trop bruitée pour conclure : deux échantillons à 0,33 s d'écart diffèrent en médiane de 22 px, ce qu'un cadrage lissé sur 4 s ne peut pas produire. Une part vient quand même de ses mouvements réels (elle se penche vers la caméra). Un suivi plus serré les compenserait, mais ferait trembler le cadre, ce que le brief interdit. La cible ±20 px n'est donc **pas démontrée**.

## Limites connues
- **Compteurs** : Higgsedit anime le texte état par état, à 30 i/s, avec une courbe expo-out sur 1,2 s. Ce n'est pas un vrai « digit roll » où les chiffres défilent verticalement.
- **Pas de lower third ni de handle** : aucun prénom, titre ou handle n'a été fourni.
- **Tampon « DÉFINITIVEMENT »** : il recouvre volontairement l'en-tête du reçu, qui est déjà lu à ce moment-là.

## Fichiers dans ce dossier
- `SCENES.md` : storyboard validé + tableau des écarts du montage final
- `edit.jsx` : script Higgsedit final, données incluses (généré). Sources : `edit.template.jsx` + `gen_edit.py`
- `prep.py` / `cuts.json` : jump cuts à l'image près ; `timeline.json` : mots corrigés et captions sur la timeline montée ; `face_track.json` : suivi lissé du visage
- `contact_sheet.png`, `SOURCES.md`, `audio/` (chaîne voix, `AVANT_APRES.md`, `ab_compare.wav`, `report.json`)
- `tests/lint.mjs` : validation structurelle locale du script (champs, pistes en double, échelles imbriquées, durées) ; `tests/qa.py` : QA vidéo ; `tests/qa_draft.json`, `tests/qa_master.json`, `tests/eyes_master.json`

## Reproduire
```bash
python3 prep.py && (cd audio && python3 voice_chain.py ../source.mov)
ffmpeg -i source.mov -filter_complex_script fv.txt -map "[v]" -c:v libx264 -crf 16 cut_video.mp4   # fv.txt : crop 1080x1036 + jump cuts de cuts.json
ffmpeg -i cut_video.mp4 -i audio/voice_studio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af apad -t 49.867 cut.mp4
python3 gen_edit.py && node tests/lint.mjs
# sandbox Higgsfield, avec /home/user/w2/cut.mp4 :
higgsedit new reel --size 1080x1920 --fps 30 && higgsedit fonts add reel "Montserrat:800" "Montserrat:600"
REEL_MODE=draft higgsedit build edit.jsx     # 540x960
REEL_MODE=master higgsedit build edit.jsx    # 1080x1920 H.264 10 Mb/s
ffmpeg -i reel/renders/master.mp4 -i audio/voice_studio.wav -map 0:v -map 1:a -c:v copy -af apad -t 51.867 \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart master.mp4
python3 tests/qa.py master.mp4
```
