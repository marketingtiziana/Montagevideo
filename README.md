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

# Board vertical « Comment fonctionne une LLC »

Long board façon visual essay (mindmap en désordre sur papier quadrillé), 1080 px de large,
pour enregistrer un reel en scrollant ou exporter un PNG très long. Next.js 14 (App Router),
TypeScript, Tailwind, roughjs, html-to-image. Tout statique, aucun backend.

```bash
pnpm install
pnpm dev            # http://localhost:3000/board-llc
pnpm build          # build de production (déployable sur Vercel)
```

## Capture
- **Scroll auto** : bouton en bas à droite, durée réglable de 20 à 60 s, easing linéaire. Le panneau
  disparaît pendant le défilement, `Échap` arrête.
- **Export PNG** : image complète du board en 2x (le board est rastérisé par tranches, sans limite de hauteur).
- `?ui=0` masque le panneau, `?autoscroll=30` lance le défilement au chargement (durée en secondes).
- `?section=3` affiche uniquement la section 3 cadrée en 1080x1350 (réduite si elle dépasse) ;
  `?section=3&fit=0` la garde en taille réelle pour la découper en plusieurs slides.
- Capture de contrôle Playwright (serveur lancé) : `pnpm screenshot [url] [sortie.png]`.
  Avec `?section=N` dans l'URL, seul le cadre 1080x1350 est capturé.

## Contenu et ressources
- Tout le contenu est typé dans `data/board.ts` (sections, éléments, branches, annotations).
  Les composants ne contiennent aucun texte en dur.
- Photos : `PEXELS_API_KEY=... pnpm fetch-images` télécharge une image par élément `photo`
  dans `public/board/photos/<id>.jpg` et écrit `credits.json`. Sans clé, bloc couleur + icône.
- Mèmes : déposer des GIF ou images dans `public/board/memes/`, attribués dans l'ordre aux
  éléments `meme`. Dossier vide : les emplacements restent vides.
- Placement aléatoire mais déterministe (seed fixe dans `lib/rng.ts`) : même rendu à chaque chargement.
