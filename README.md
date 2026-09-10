# Montagevideo — pipeline de montage de réels (vertical 9:16)

Pipeline semi-automatique pour transformer une vidéo brute (talking-head) en **réel prêt à publier** :
coupe des hésitations, **sous-titres animés** (blanc gras compact, mots-clés en jaune, changements de
police, sans boîte), **zooms/dézooms**, **incrustations animées**, **transitions + bruitages**.

Conçu pour tourner dans un environnement verrouillé où **seuls PyPI et le CDN GitHub** sont accessibles
(pas de Google Drive, pas de HuggingFace) :
- `ffmpeg` complet via le wheel PyPI `imageio-ffmpeg` (libass, freetype, x264) ;
- modèle **Whisper base multilingue** récupéré depuis un miroir GitHub (`aethersdr/AetherSDR`) ;
- polices depuis le miroir GitHub `google/fonts` ;
- bruitages générés synthétiquement avec ffmpeg.

## Récupérer la vidéo source
Google Drive étant bloqué par la politique réseau, la source transite par une **GitHub Release** du dépôt
(fichiers jusqu'à 2 Go). Téléchargement de l'asset via l'API authentifiée puis `source.mp4` à la racine.

## Étapes

```bash
bash pipeline/setup.sh                 # deps + modèle + polices + bruitages
# place la vidéo brute sous ./source.mp4

python3 pipeline/transcribe.py         # -> words.json (+ transcript.txt) : transcription mot à mot FR
# 1) définir les segments à garder dans pipeline/segments.py (coupe hésitations/blancs/prises ratées)
python3 pipeline/build_base.py         # -> base.mp4 (coupes + zooms + audio synchro)
# 2) re-transcrire base.mp4 pour caler les sous-titres sur la timeline finale
# 3) écrire les cartes de sous-titres dans pipeline/gen_ass.py (texte corrigé + accents ~jaune~ + police)
python3 pipeline/gen_ass.py            # -> subs.ass
python3 pipeline/make_assets.py        # -> assets/*.png (drapeaux, pastilles de taux, badges)
python3 pipeline/build_final_video.py  # -> finalv.mp4 (sous-titres + incrustations + flashs)
bash   pipeline/mix_audio.sh finalv.mp4 REEL_final.mp4   # bruitages + fichier final
```

## Fichiers
| Fichier | Rôle |
|---|---|
| `segments.py` | Segments source à conserver + mapping timeline source→finale + ken-burns par segment |
| `transcribe.py` | Transcription mot à mot (français) via `pywhispercpp` + modèle ggml base |
| `build_base.py` | Trim + zoom (zoompan) + concat + audio synchro → `base.mp4` |
| `gen_ass.py` | Génère les sous-titres ASS animés (pop, accents jaunes `~mot~`, polices A/H/B, sans boîte) |
| `make_assets.py` | Dessine les incrustations (drapeaux, pastilles de taux, badges ×3 / OSS) en PNG transparents |
| `build_final_video.py` | Compose `base.mp4` + sous-titres + incrustations animées (fondu/glissé) + flashs de transition |
| `mix_audio.sh` | Mixe les bruitages (whoosh/pop) et scelle le fichier final |

## Notes
- Le modèle `base` fait des fautes (chiffres, noms propres) : **toujours relire/corriger** le texte des
  sous-titres, surtout pour du contenu fiscal.
- Les temps des beats (transitions/bruitages) et les cartes de sous-titres sont **spécifiques à chaque
  réel** — à adapter dans `gen_ass.py` et `mix_audio.sh`.

## Réel « règle de 3 » (business) — variante v2

Deuxième réel monté à partir de `source.mp4` (talking-head business, ~46 s). Le discours est **continu** :
on garde l'audio **traité façon micro RØDE** intact et on dynamise le **visuel** (zooms, inserts, B-rolls
en cutaway pendant que la voix continue). Rendu sous-titres demandé : **blanc gras minimaliste, sans boîte
ni surlignage**, animé.

```bash
bash pipeline/setup.sh                  # deps + modèle + polices + (bruitages)
cp IMG_XXXX.MP4 source.mp4              # vidéo brute verticale

python3 pipeline/transcribe.py          # -> words.json (timings mot à mot FR)
python3 pipeline/process_audio.py       # -> voice_rode.wav  (PRIORITÉ: chaîne voix RØDE, -14 LUFS)
python3 pipeline/build_base2.py         # -> base.mp4  (upscale 1080x1920 + ken-burns + audio RØDE)
python3 pipeline/gen_ass2.py            # -> subs.ass  (sous-titres BLANC minimalistes animés, sans boîte)
python3 pipeline/broll.py               # -> broll/br{A,B,C,D}.mp4  (B-rolls motion-design premium)
python3 pipeline/make_assets2.py        # -> assets/ins_*.png  (inserts/incrustations navy+or)
python3 pipeline/build_final2.py        # -> finalv.mp4  (base + B-rolls + inserts + flashs + sous-titres)
python3 pipeline/gen_sfx.py             # -> sfx/*.wav
python3 pipeline/mix_audio2.py          # -> REEL_regle3_final.mp4  (SFX légers + loudnorm -14 LUFS)
```

| Fichier | Rôle |
|---|---|
| `process_audio.py` | **Chaîne voix « RØDE »** : dé-rumble, débruitage spectral, gate léger, de-esser, EQ chaleur/présence/air, double compression broadcast, loudnorm -14 LUFS, limiteur |
| `build_base2.py` | Upscale 720×1280 → 1080×1920 (lanczos) + ken-burns par chapitre (petits « punch » de zoom), audio RØDE continu |
| `gen_ass2.py` | Sous-titres **blanc gras minimalistes** (Archivo Black), **sans boîte ni surlignage**, contour/ombre fins, pop discret, emphase par la taille (pas de couleur), calés sur les timings mots |
| `broll.py` | 4 B-rolls **motion-design** (navy + or) : courbe business qui chute, « règle de 3 » (3 colonnes), « mettre de côté » (barres + flèche), « combien de temps » (jauge + horloge) |
| `make_assets2.py` | Inserts/incrustations premium (pastilles navy liseré or, texte blanc, emoji/numéro) synchronisés aux propos |
| `build_final2.py` | Compose base + B-rolls (cutaways plein cadre, audio continu) + inserts (au-dessus des sous-titres) + flashs + sous-titres par-dessus |
| `mix_audio2.py` | Mixe des SFX **légers** (whoosh sur cutaways, pop sur inserts) sur le lit voix, loudnorm final |
