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

## Rendu automatique (source quelconque)
Le pipeline « manuel » ci-dessus est calibré carte-par-carte pour **un** réel. Pour lancer un **rendu réel
directement sur n'importe quelle source** (sous-titres calés sur le timing réel des mots, sans config codée
en dur), utiliser le chemin auto :

```bash
bash pipeline/setup.sh && python3 pipeline/gen_sfx.py   # deps + modèle + polices + bruitages
cp ma_video.mp4 source.mp4
ffmpeg -y -i source.mp4 -vn -ac 1 -ar 16000 audio16.wav  # audio pour Whisper
python3 pipeline/transcribe.py       # -> words.json (mot à mot)
python3 pipeline/gen_ass_auto.py     # -> subs.ass (cartes groupées + animées, corrections dans CORRECTIONS)
python3 pipeline/auto_render.py      # -> REEL_auto_final.mp4 (ken-burns + subs + flashs + bruitages)
```

`gen_ass_auto.py --dump` imprime le découpage en cartes (index + timing) : renseigner ensuite `CORRECTIONS`
pour corriger le texte Whisper et poser les accents `~mot~` / mises en avant `*mot*`.

## Rendu style ÉDITORIAL LUXE (« old money »)
Chemin calqué sur une réf. éditoriale : **sous-titres serif** (EB Garamond, minuscules, blanc, discret,
mot-clé en gras), **grade cinéma feutré** + vignette, **incrustations plein cadre** (fiche « registre »
lignée dont la liste s'écrit ligne par ligne + cartes typographiques serif sur fond texturé), coupes nettes
sans néon. Voix conservée.

```bash
bash pipeline/setup.sh                 # deps + polices (dont EB Garamond / Playfair / Cormorant)
cp ma_video.mp4 source.mp4
ffmpeg -y -i source.mp4 -vn -ac 1 -ar 16000 audio16.wav
python3 pipeline/transcribe.py         # -> words.json
python3 pipeline/gen_ass_lux.py        # -> subs.ass (serif, corrections dans CORRECTIONS)
python3 pipeline/make_lux_assets.py    # -> assets/led_*.png, card_*.png (fiches + cartes typo)
python3 pipeline/lux_render.py         # -> REEL_lux.mp4 (grade + subs + incrustations)
```

Incrustations : deux familles (voir `lux_render.py`) —
- **`COLLAGES`** : collages photo N&B surréalistes générés (Higgsfield, cf. `collage_prompts.md`),
  placés SOUS les sous-titres (la caption reste visible par-dessus, comme dans la réf.) ;
- **`CARDS`** : fiche « registre » lignée qui s'écrit + carte CTA (Pillow, `make_lux_assets.py`),
  placées AU-DESSUS des sous-titres (elles portent leur propre texte).

Les temps et le contenu des incrustations (`COLLAGES`/`CARDS` dans `lux_render.py`, listes/cartes
dans `make_lux_assets.py`, prompts dans `collage_prompts.md`) sont **spécifiques au réel** — à adapter
au discours de la source.

## Fichiers
| Fichier | Rôle |
|---|---|
| `segments.py` | Segments source à conserver + mapping timeline source→finale + ken-burns par segment |
| `gen_ass_lux.py` | Sous-titres **serif kinétiques** : surlignage marqueur qui se peint, cercle tracé à la main, mots sur papier, entrées animées |
| `make_lux_assets.py` | Incrustations plein cadre (fiche registre lignée + cartes typographiques) sur fonds texturés, sans IA |
| `make_stickers.py` | Petites incrustations **papier partielles** (photos N&B sur bouts de papier + libellés) + bande de transition |
| `lux_render.py` | Rendu **luxe animé** : base gradée + ken-burns + **punch-ins**, collages animés (glissée/flottement/fondu), sous-titres kinétiques, stickers papier, cartes, **transitions balayage-papier** |
| `gen_ass_auto.py` | (variante « punchy ») Sous-titres animés auto (capitales colorées, accents néon) |
| `auto_render.py` | (variante « punchy ») Rendu auto : base ken-burns + subs + flashs + bruitages |
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
