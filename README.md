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

# Carousels Instagram (15 slides, 1080 x 1350)

Fond uni + texte centré, Inter (Google Fonts), palette navy / indigo / gris bleuté.
Un dossier par carousel dans `slides/` : `solitude`, `lancement`.

```bash
npm install                    # playwright + sharp
node build.js                  # tous les carousels
node build.js lancement        # un seul : slides/lancement/ -> output/carousel-lancement/
```

Puis ouvrir `preview.html?c=lancement` (ou `?c=solitude`) pour voir les 15 PNG en grille.

| Fichier | Rôle |
|---|---|
| `slides/<carousel>/slide-01.html` … `slide-15.html` | Une slide autonome par fichier (HTML + une balise `<style>`). Texte, couleurs et tailles s'éditent directement ici. |
| `build.js` | Rend chaque slide avec Playwright (`deviceScaleFactor: 2`), downscale Lanczos en 1080 x 1350 via sharp. |
| `preview.html` | Grille des 15 PNG d'un carousel (`?c=<carousel>`). |
| `output/carousel-<carousel>/` | Les 15 PNG finaux. |

Garde-fous de `build.js` :
- **Débordement** : si le bloc de texte dépasse 1110 px (1350 moins 2 x 120 de marge), le corps
  (`--body-size`) est réduit par paliers de 2 px, jusqu'à 26 px, et la valeur retenue est réécrite
  dans le HTML. Sous 26 px, le build s'arrête et liste les slides concernées, sans tronquer.
- **Police** : échec si une graisse utilisée n'est pas réellement chargée en Inter (pas de police de repli).
- **Tiret cadratin** : échec si un fichier en contient un.
- Les requêtes Google Fonts passent par Playwright (Node), ce qui fonctionne aussi derrière un proxy TLS.

Mots en gras dans le corps : `<strong>` (Inter 900, même couleur). Espaces insécables ajoutées avant
`: ? !` et dans les nombres (`12 000€`, `6 000€`) pour éviter qu'un signe se retrouve seul en début de ligne.
