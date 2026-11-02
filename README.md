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

# Tableau 16:9 « Comment fonctionne une LLC »

Route `/board-llc` : un seul cadre 1920x1080, style mindmap « en désordre » sur papier quadrillé,
projeté plein écran pendant une présentation en direct (le présentateur annote par-dessus).
Next.js 14 (App Router), TypeScript, Tailwind, roughjs pour les liens, html-to-image et Playwright
pour les exports. Tout statique, aucun scroll.

```bash
pnpm install
pnpm dev            # http://localhost:3000/board-llc
pnpm build          # build de production
```

## Présentation
- Le cadre se met à l'échelle pour remplir la fenêtre en gardant le 16:9 (letterbox navy si besoin).
- Touche `F` : plein écran. Touche `H` : masque toute l'interface (boutons compris). `?ui=0` démarre sans interface.
- Texte minimum 20 px dans le cadre, lisible à 50 % de zoom.

## Exports
- **Export PNG** : 3840x2160 via html-to-image.
- **Export PDF** : une page 16:9 via Playwright (route `/api/export-pdf`, fonctionne en local ou sur un serveur
  avec Chromium). Sans Playwright côté serveur, le bouton ouvre l'impression du navigateur, cadrée en 16:9 par la
  feuille de style print. En ligne de commande (serveur lancé) : `pnpm export-pdf [url] [sortie.pdf]`.
- Capture de contrôle : `pnpm screenshot [url] [sortie.png]` (cadre 16:9 en 2x).

## Contenu et images
- Tout le contenu est typé dans `data/board.ts` (groupes, éléments, liens, positions dans le cadre).
  Les composants ne contiennent aucun texte en dur. Jitter et rotations sont déterministes (seed dans `lib/rng.ts`).
- `PEXELS_API_KEY=... pnpm fetch-images` télécharge une image par élément `photo` ou `cutout` dans
  `public/board/raw/<id>.jpg` et écrit `credits.json`.
- `pnpm cutout` détoure les images des éléments `cutout` vers `public/board/cutouts/<id>.png`
  (moteur `@imgly/background-removal-node`, modèle téléchargé au premier lancement ; repli sur la commande `rembg`)
  et écrit `manifest.json`. Les requêtes Pexels des cutouts demandent des objets sur fond uni.
- Sans clé ni détourage : bloc couleur + icône, le build ne casse pas. Aucun appel réseau au runtime.

## Variante verticale
Le board vertical précédent (visual essay à scroller, export PNG très long) reste disponible sur
`/board-llc-vertical`, avec `pnpm fetch-images --vertical` pour ses photos.
