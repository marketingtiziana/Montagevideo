# Montagevideo : pipeline de montage de réels (vertical 9:16) et board LLC

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

# Canvas Excalidraw « Comment fonctionne une LLC »

Route `/board-llc` : un canvas infini et interactif façon Excalidraw (pan, zoom, outils de dessin actifs
pour annoter en direct) qui explique le fonctionnement d'une LLC américaine. Nœud central « LLC »,
six groupes éparpillés autour (acteurs, documents, argent, fiscalité, chaque année, pièges), cinq
schémas dessinés, flèches courbes, images de banque d'images et éléments détourés.

```bash
pnpm install
pnpm dev            # http://localhost:3000/board-llc
pnpm build
```

## Scène
- Tout le contenu est dans `data/board.ts` (groupes, images, éléments, liens). Les positions sont tirées
  d'un aléatoire à seed fixe (`lib/rng.ts`, `lib/scene.ts`) : rendu identique à chaque génération.
- `pnpm build-scene` (serveur lancé, ou `BOARD_URL`) régénère `public/board/scene.excalidraw` :
  le skeleton est converti avec `convertToExcalidrawElements` dans Chromium (polices réelles),
  puis chaque image est embarquée en dataURL dans `files`. Sans image, un rectangle hachuré porte son nom.
- Style : roughness 2, strokeWidth 2, flèches courbes, fonds hachurés clairs, navy et indigo.

## Images
- `PEXELS_API_KEY=... pnpm fetch-images` : une image Pexels par entrée de `board.images` dans
  `public/board/raw/<id>.jpg`, plus `credits.json`.
- `pnpm cutout` : détoure celles marquées `cutout: true` vers `public/board/cutouts/<id>.png`
  (`@imgly/background-removal-node`, repli `rembg`), puis `pnpm build-scene` pour les embarquer.

## Interaction
- Barre flottante : Recentrer, zoom sur les groupes 1 à 6, exports `.excalidraw`, PNG 2x et SVG.
- Touche `H` : masque la barre. `?ui=0` démarre sans barre.
- Capture de contrôle : `pnpm screenshot [url] [sortie.png]`.

## Variantes précédentes
- `/board-llc-16x9` : tableau unique 16:9 projeté plein écran (touches F et H, exports PNG et PDF,
  `pnpm fetch-images --16x9`, `pnpm cutout --16x9`, `pnpm export-pdf`).
- `/board-llc-vertical` : visual essay vertical à scroller (scroll auto, export PNG très long,
  `pnpm fetch-images --vertical`).
