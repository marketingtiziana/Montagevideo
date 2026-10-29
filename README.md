# Montagevideo — pipeline de montage « talking-head » corporate (16:9, 1080p, 30 fps)

Pipeline reproductible qui transforme une vidéo brute face caméra (français) en **spot publicitaire
premium** : coupe des silences / hésitations / doublons, punch-ins pour masquer les jump cuts,
motion design sobre (lower-third, mots-clés, chiffres, listes animées, timeline, captions),
étalonnage, nettoyage audio, musique duckée, intro/outro de marque. La voix n'est jamais modifiée.

Tout est généré par code (ffmpeg + Python/Pillow/NumPy) : aucun logiciel de montage requis.

## Prérequis
- `ffmpeg` ≥ 6 (libx264, libass, loudnorm, sidechaincompress)
- Python 3.11+ : `pip install faster-whisper pillow numpy`
- Polices variables **Montserrat** et **Inter** (fichiers `MontserratVar.ttf`, `InterVar.ttf`) dans `fonts/`
  (miroir GitHub `google/fonts` : `ofl/montserrat/Montserrat[wght].ttf`, `ofl/inter/Inter[opsz,wght].ttf`)
- Une musique instrumentale `music.wav` (générée ici avec vidIQ *generate_music*, ~95 s)

## Étapes
```bash
export MV_WORK=/chemin/vers/dossier_de_travail   # contient source.mp4, fonts/, music.wav
cd pipeline
python3 transcribe.py $MV_WORK/source.mp4         # -> words.json (mots horodatés, FR) + liste des silences
python3 edl.py                                     # affiche les segments conservés / durée finale
python3 render_base.py                             # -> base.mp4 (coupes + punch-ins + étalonnage, voix brute)
python3 process_voice.py                           # -> voice.wav (débruitage, de-esser, compression, -16 LUFS)
python3 gfx.py --preview 3,20,45                   # PNG de contrôle (timeline finale) dans preview/
python3 gfx.py --parts 3                           # -> video_gfx.mp4 (intro + overlays + outro), 3 processus
python3 mix_master.py FINAL_LLC_16x9.mp4           # musique duckée + master -14 LUFS + mux
```

## Fichiers
| Fichier | Rôle |
|---|---|
| `config.py` | Chemins, format, marque (nom, titre), palette navy/or, typographies, durées intro/outro |
| `transcribe.py` | Transcription mot à mot (faster-whisper *medium*, FR) + détection des silences |
| `edl.py` | **Décisions de montage** : intervalles supprimés, segments conservés, plan de punch-ins, mapping source→final |
| `render_base.py` | Rendu segment par segment (scale lanczos animé + crop = punch-in), concat, étalonnage |
| `process_voice.py` | Chaîne voix : highpass, afftdn, deesser, EQ, compresseur, loudnorm 2 passes |
| `gfx.py` | Compositeur motion design image par image (Pillow/NumPy → ffmpeg) : storyboard en secondes **source** |
| `mix_master.py` | Lit de musique (enveloppe + montée vers le CTA), ducking sidechain, master -14 LUFS / TP -1.5, mux |

## Adapter à une autre vidéo
1. Transcrire, puis éditer `CUTS` dans `edl.py` (silences > 0.4 s raccourcis à ~0.3 s, faux départs, doublons).
2. Écrire le storyboard dans `gfx.py` → `storyboard()` : chaque élément est placé en secondes **source**
   (la fonction `T()` convertit vers la timeline finale, cadrée à l'image près grâce à `segdur.json`).
3. Renseigner `NAME` / `TITLE` dans `config.py` pour le lower-third.

## Notes
- La colonne de droite (x ≥ 1316) est la zone libre à côté de la présentatrice ; les captions sont en bas,
  jamais sur le visage. Une plaque navy translucide assure la lisibilité sur les stores blancs.
- Source 1080p : la sortie est en 1080p (un upscale 4K n'apporterait aucune information).
