# reel-splitscreen — Reel vertical 9:16 en split-screen (motion design + facecam)

Pipeline utilisé pour le reel « société étrangère ≠ fiscalité déplacée » (rush `Reel 16M.mp4`, 118 s → 85,6 s).

Écran scindé : **zone haute 1080×1060** = scène motion design continue (HTML/CSS/JS + GSAP, rendue frame par frame
avec Playwright), **zone basse 1080×860** = facecam recadrée serrée avec sous-titres karaoké blancs (max 2 mots).

## Étapes

```bash
# 0. deps
pip install faster-whisper soundfile scipy pyloudnorm
# fonts : Inter (système) + IBM Plex Mono (ttf dans scene/), GSAP 3.12.5 (npm i gsap)

# 1. transcription word-level (Whisper large-v3, fr)
ffmpeg -i /input/rush.mp4 -vn -ac 1 -ar 16000 audio16k.wav
python3 transcribe.py audio16k.wav words_raw.json
python3 audit_gaps.py            # profil d'énergie + re-transcription des zones douteuses (faux départs)

# 2. dérushage : segments (src_in/src_out) calés sur l'attaque de la voix, fin de mot + 2 frames
python3 build_base.py            # écrit segments.json (la partie ffmpeg monolithique est remplacée par build_base2)
python3 build_base2.py           # encode chaque segment (crop 1080×860, punch 1.0/1.12 alterné, +5% contraste +3% sat) → base.mov
python3 fix_audio.py             # audio aligné frame-exact → base_audio.wav ; puis re-transcription de base_audio16k.wav → words_final.json

# 3. sous-titres karaoké (ASS, Inter ExtraBold 80, blanc, contour noir 7, max 2 mots, pop 0.94→1 en 70 ms, mots forts 1.12)
python3 gen_subs.py              # → subs.ass + chunks.json

# 4. scène du haut : timeline GSAP unique (scene/scene.html), seek déterministe frame par frame
node scene/render.js scene/scene.html frames 30 0 2569 1080 1060     # (3 workers en parallèle sur des plages de frames)
ffmpeg -framerate 30 -i frames/f_%05d.png -c:v libx264 -crf 12 -pix_fmt yuv420p top.mp4

# 5. audio : de-esser + -14 LUFS, boucle électro synthétique (gen_sfx.py) duckée en sidechain, SFX sur les beats (cues.json)
python3 gen_sfx.py && python3 mix_audio.py      # → mix.wav puis loudnorm final -14 LUFS / TP -1 dB

# 6. composite final
ffmpeg -i top.mp4 -i base.mov -i mix_final.wav \
  -filter_complex "[0:v]setpts=N/30/TB[t];[1:v]setpts=N/30/TB[b];[t][b]vstack,ass=subs.ass" \
  -c:v libx264 -crf 18 -c:a aac -b:a 192k /output/reel-final.mp4
```

## Fichiers
| Fichier | Rôle |
|---|---|
| `transcribe.py` / `audit_gaps.py` | Whisper large-v3 word-level ; audit énergie des blancs et re-transcription locale |
| `build_base.py` / `build_base2.py` / `fix_audio.py` | Segments, recadrage/punch-in, concat frame-exact |
| `gen_subs.py` | Sous-titres ASS karaoké (1–2 mots, blanc uniquement) |
| `scene/scene.html` | Scène motion design : 9 chapitres, transitions morph/parallaxe/zoom, fond toujours animé |
| `scene/render.js` | Rendu Playwright déterministe (`window.__seek(t)`) |
| `gen_sfx.py` / `mix_audio.py` / `cues.json` | SFX synthétiques, boucle musicale, mix -14 LUFS |
| `segments.json` | Dérushage effectif (source → finale) |
| `output/derush-report.md`, `output/chapitres.md`, `output/preview-frames/` | Livrables de validation |

Le MP4 final n'est pas versionné (`*.mp4` ignoré) : il est produit dans `/output/reel-final.mp4`.
