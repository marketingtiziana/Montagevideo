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

---

# `reel/` — chaîne de montage pilotée par un fichier de projet

Version plus récente du pipeline, utilisée pour `final_tiktok.mp4`. Différence principale :
les punch-ins **suivent le visage** (détection YuNet + trajectoire lissée), donc un zoom ne
décadre jamais le sujet, même sur un selfie filmé en marchant.

```bash
bash reel/build.sh          # source.mp4 -> final_tiktok.mp4
```

Tout le montage se règle dans **`reel/config.py`** : segments conservés, niveaux de zoom,
étalonnage, texte des sous-titres, cartons, arrêt sur image, bruitages, musique.
Modifier ce fichier et relancer `build.sh` suffit.

| Fichier | Rôle |
|---|---|
| `config.py` | **Fichier de projet** — tous les choix de montage |
| `timeline.py` | Correspondance source→final, quantifiée à l'image (image et son partagent le même découpage) |
| `track_face.py` | Détection + lissage de la position du visage → `face_track.json` |
| `build_video.py` | Coupes + caméra virtuelle (recadrage suivant le visage) + étalonnage → `v_cam.mp4` |
| `gen_captions.py` | Sous-titres ASS (blanc compact, un seul accent ambre, animation sobre) → `subs.ass` |
| `gen_graphics.py` | Cartons texte en PNG transparent (interlettrage maîtrisé) → `assets/` |
| `build_audio.py` | Voix nettoyée + bruitages + nappe, normalisé −14 LUFS → `v_audio.wav` |
| `compose.py` | Assemblage final → `final_tiktok.mp4` |

### Contrôles automatiques intégrés
- chaque coupe est vérifiée contre l'énergie audio réelle (aucune coupe au milieu d'un mot) ;
- `build_video.py` vérifie que le nombre d'images produit correspond à la timeline ;
- après rendu, une passe de détection de visage confirme que la tête n'est jamais coupée
  et que le visage ne descend jamais dans la zone des sous-titres.
