# Livraison — Reel 5 « La substance » (split-screen visage / scène blanche)

## Fichiers hébergés (Higgsfield, confirmés)

| Élément | Caractéristiques | URL |
|---|---|---|
| **Master** | 1080×1920, 30 fps, H.264 High 9,9 Mb/s (cible 10M), AAC 192k 48 kHz, faststart, 59,83 s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/e7c5d723-0541-4d1f-87a8-70246cfbeb57.mp4 |
| Planche contact (`higgsedit sheet`) | 17 vignettes : hook, une par scène, end card | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/f1512172-e513-4c63-ab02-930a4825a9e9.jpg |
| Brouillon v1 540×960 | 1ʳᵉ passe, avant la correction du cadrage zone A | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/717f6f9c-126a-46d5-9e5e-255881f3149c.mp4 |

- La planche contact est aussi dans le dépôt : `contact_sheet.jpg`.
- Le master local est `renders/master.mp4`. Il n'est pas versionné (les `*.mp4` sont ignorés par git).

## QA (mesurée sur le master livré)

Script : `tests/qa.py`. Résultats : `tests/qa_master.json`.

| Contrôle | Cible | Mesuré | |
|---|---|---|---|
| Format | 1080×1920, 30 fps, H.264 10M, AAC 192k, faststart | 9,9 Mb/s · AAC 48 kHz · `moov` avant `mdat` | ✅ |
| Durée | 30–60 s | 59,83 s (57,83 s de parole + end card 2 s) | ✅ |
| Loudness | −14 ±1 LUFS | **−14,1 LUFS** · crête −3,7 dBFS · LRA 2,6 LU | ✅ |
| Zéro statique (stage y 940–1540) | aucune fenêtre fixe > 1,2 s | plus longue fenêtre : **0,30 s** | ✅ |
| Synchro captions / voix | < 80 ms | médiane **20 ms**, p90 47 ms, biais +14 ms, **96 %** des mots sous 80 ms (179/193 appariés) | ✅ |
| Avance des effets | 100–200 ms avant le mot | 9 effets contrôlés : 140 à 160 ms pour 8 d'entre eux, 220 ms pour la 1ʳᵉ ligne de la pile | ✅ (8/9) |
| Yeux (zone A) | y ≈ 300 ±20 px, sans jitter | médiane **303 px**, p5–p95 279–314 px, **92 %** des échantillons dans ±20 px | ⚠️ voir (1) |
| Planche contact | lisibilité, zone morte vide, contraste sur blanc | 17 vignettes vérifiées, rien sous y 1540 hors end card | ✅ |
| Chiffres | uniquement ceux prononcés | « 30 min » seulement | ✅ |

(1) Yeux. Les 8 % restants correspondent à des hochements de tête rapides. Les suivre exigerait un cadre qui suit chaque mouvement de tête, donc un cadre tremblant, ce que le brief interdit.
- Le cadrage suit la tête avec un filtre passe-bas de 0,25 s à l'intérieur de chaque plan.
- Il se recale exactement sur chaque jump cut, où l'image saute déjà.

### Méthode de mesure (corrigée en cours de route)
- **Transcription de contrôle : faster-whisper large-v3** (le même modèle que la transcription source).
  - La 1ʳᵉ passe de QA utilisait « medium ». Il plaçait les mots environ 250 ms trop tard sur cette voix.
  - Vérification à l'enveloppe d'énergie du signal : « redressement » démarre à 2,78 s (large-v3 : 2,80 s ; medium : 3,04 s) et « le voit » à 47,06 s.
  - Le résultat de la 1ʳᵉ passe est gardé dans `tests/qa_draft_v1.json`.
- **Yeux : YuNet** (OpenCV `FaceDetectorYN`, repères des yeux) au lieu du détecteur Haar, trop bruité.
  - Le modèle se télécharge depuis https://huggingface.co/opencv/face_detection_yunet (fichier `face_detection_yunet_2023mar.onnx`, à placer dans `models/yunet.onnx`, non versionné).
- **Ancrage de l'échelle dans Higgsedit.** Le 1ᵉʳ master a montré qu'Higgsedit agrandit les médias depuis leur **coin haut-gauche**, pas depuis leur centre.
  - Avec le modèle « centre », l'écart entre les yeux prédits et mesurés allait jusqu'à 60 px.
  - Avec le modèle « haut-gauche », il reste sous 10 px dans 97 % des cas.
  - `gen_edit.py` place donc le média directement avec ce modèle. Résultat de ce 1ᵉʳ master : `tests/qa_master_v1.json`, 48 % des yeux dans ±20 px.

## Son

Voir `audio/AVANT_APRES.md`. Résumé :

| | AVANT | APRÈS |
|---|---|---|
| Loudness intégrée | −22,4 LUFS | −14,1 LUFS |
| Plancher de bruit, voix ramenée à −14 LUFS | −41,8 dBFS | −55,5 dBFS |
| LRA | 5,1 LU | 2,4 LU |

Pas de musique (non fournie).

## Écarts au brief, avec leur raison

1. **Phrase coupée.** « Et c'est toujours la même chose. » a été retirée pour tenir sous 60 s (choix validé dans SCENES.md).
2. **Zoom zone A : 170 % de base** au lieu de 105 %, avec une montée lente jusqu'à 192 % quand elle relève la tête.
   - Ses yeux sont entre y 140 et 233 dans la source. À 105 %, ils ne pourraient jamais descendre à y 300.
   - L'agrandissement adoucit un peu l'image, sans artefact visible.
3. **Pas de lower third ni de handle** : aucun prénom, titre ou handle fourni. La zone morte y 1570–1920 est laissée vide.
4. **End card** : cloche, « Abonne-toi » et le résumé « La substance, c'est là où tu vis, où tu travailles et où tu décides ». Pas de logo (aucune marque fournie).
5. **Ajustements de storyboard** : détail dans SCENES.md, section « Écarts ». Trois déclencheurs sont avancés pour laisser aux éléments le temps d'entrer, et la transition 14 → 15 devient un swipe.
6. **Séparateur** : ombre douce 24 px, plus une barre de progression accent de 6 px sur toute la durée (pas de trait 3 px, le brief demande l'un ou l'autre).

## Fichiers du dossier `reel5/`

| Fichier | Contenu |
|---|---|
| `SCENES.md` | storyboard validé + écarts du montage final |
| `SOURCES.md` | sources et licences |
| `transcribe.py` → `transcript.json` | faster-whisper large-v3, mot à mot |
| `prep.py` → `cuts.json`, `words_cut.json` | jump cuts (silences ≥ 0,28 s, 100 ms gardées), phrase retirée, correction « le fisc, lui, le voit » |
| `tools/eyes.py` → `faces_yunet.json` | yeux (YuNet) toutes les 0,1 s dans la source |
| `tools/track.py` → `face_track.json` | suivi lissé par plan, sur la timeline montée |
| `gen_edit.py` + `edit.template.jsx` → `edit.jsx`, `timeline.json` | montage Higgsedit (zone A, séparateur, captions, 15 scènes, end card) |
| `mockups/phone_tuto/` + `tools/render_mockup.py` | maquette téléphone HTML → .mov alpha (Module C) |
| `audio/voice_chain.py`, `audio/report.json`, `audio/AVANT_APRES.md` | Module A |
| `tools/mkbundle.py` | scripts pour le bac à sable Higgsfield (frames, sheet, draft, master) |
| `tests/lint.mjs`, `tests/qa.py`, `tests/qa_*.json` | lint structurel et QA |
| `contact_sheet.jpg` | planche contact finale |

## Reproduire

```bash
python3 transcribe.py large-v3 && python3 prep.py
python3 tools/eyes.py source.mp4 0.1 0 1088 > faces_yunet.json && python3 tools/track.py
(cd audio && python3 voice_chain.py ../source.mp4)
ffmpeg -i source.mp4 -filter_complex_script fv.txt -map "[vo]" -r 30 -c:v libx264 -crf 12 cut_video.mp4
ffmpeg -i cut_video.mp4 -i audio/voice_studio.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af apad -t 57.833 cut.mp4
python3 tools/render_mockup.py mockups/phone_tuto OUT 30 3.4 780 400      # OUT/phone_tuto.mov
python3 gen_edit.py && node tests/lint.mjs
python3 tools/mkbundle.py master <PUT_URL> > b.sh                           # dans le bac à sable Higgsfield : bash b.sh
python3 tests/qa.py renders/master.mp4
```
