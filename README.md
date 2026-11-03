# Montagevideo

Deux outils dans ce dépôt :

1. **Mindmap interactive « Comment fonctionne une LLC »** (Next.js 14, route `/mindmap-llc`) : voir ci-dessous.
2. **Pipeline de montage de réels** (Python, dossier `pipeline/`) : voir la seconde partie.

---

## Mindmap « Comment fonctionne une LLC »

Board visuel façon moodboard « en désordre » qui explique le fonctionnement d'une LLC américaine et le
rôle de chaque acteur, pour un entrepreneur francophone non-résident US. Tout le texte est en français,
aucun chiffre ni montant.

### Stack
- Next.js 14 (App Router), TypeScript, Tailwind. Police Inter uniquement.
- `@xyflow/react` (React Flow) : pan, zoom, minimap, fitView.
- `roughjs` : liens et cadres « dessinés à la main ».
- `html-to-image` : export PNG (2x, fond et grille inclus).
- Aucun backend, aucune base de données : tout est statique et déployable tel quel sur Vercel.

### Lancer
```bash
pnpm install
pnpm dev          # http://localhost:3000/mindmap-llc
pnpm build        # build de production (sans warning)
pnpm validate     # cohérence du contenu (ids, liens, orphelins, typographie)
pnpm lint
pnpm typecheck
```

### Photos (Pexels)
Les nœuds `photo` sont illustrés par des images de banque d'images, servies **en local** (aucun appel API au runtime).
```bash
PEXELS_API_KEY=... pnpm fetch-images mindmap  # --force pour retélécharger
```
Le script `scripts/fetch-images.ts` recherche `imageQuery` pour chaque nœud `photo`, prend la première image
paysage (taille medium), l'enregistre dans `public/mindmap/<id>.jpg` et écrit `public/mindmap/credits.json`
(photographe + URL). Sans clé, le board affiche un bloc couleur + icône et le build ne casse pas.
Les photos téléchargées et `credits.json` sont à versionner pour qu'elles soient déployées.

### Structure
| Chemin | Rôle |
|---|---|
| `data/types.ts` | Modèle typé : `Cluster`, `MindmapNode` (sticky, photo, schema, card, callout), `MindmapEdge` |
| `data/mindmap.ts` | **Source de vérité du contenu** : clusters, nœuds, liens, explications markdown. Zéro contenu dans les composants |
| `lib/layout.ts` | Layouts déterministes (seed fixe) : « désordre » éparpillé avec rotations, « rangé » radial en pétales |
| `lib/random.ts`, `lib/rough.ts` | PRNG déterministe, helpers roughjs |
| `components/mindmap/MindmapBoard.tsx` | Board React Flow, bascule Ranger / Désordre, export PNG, cadrage |
| `components/mindmap/nodes/` | Les 5 composants de nœuds |
| `components/mindmap/schemas/` | Les 5 schémas SVG (organigramme, flux d'argent, timeline, calendrier, transparence) |
| `components/mindmap/SidePanel.tsx` | Panneau latéral (explication complète en markdown) |
| `scripts/fetch-images.ts`, `scripts/validate-data.ts` | Photos Pexels, validation du contenu |
| `docs/screenshots/` | Captures d'écran de chaque étape |

### Interactions
- Clic sur un nœud : panneau latéral avec l'explication complète.
- « Ranger / Désordre » : bascule animée entre le layout éparpillé et le layout radial.
- « Exporter PNG » : image 2x du board complet, fond et grille compris.
- Mobile : cadrage lisible sur le cœur de la carte, zoom tactile, panneau en feuille basse.

---

## Boards « C’est quoi une LLC » (`/board-llc`) et « Peur qu’on me tombe dessus » (`/board-peur`)

Canvas libre façon papier quadrillé : deux lignes verticales (rouge à gauche, verte à droite), une quinzaine
d’éléments posés le long des lignes, trois flèches bleues dessinées à la main. Gauche = en nom propre, sans structure.
Droite = avec une LLC. Pan, zoom, éléments déplaçables ; boutons « Tout voir », « Masquer l’interface » (touche H),
« Export PNG ».

- Données : `data/board.ts` (LLC) et `data/board-peur.ts` (peur), registre dans `lib/boards.ts`. Éléments, positions, images, flèches : zéro texte en dur dans les composants.
- Composants dans `components/board/` (canvas, couche des lignes, un composant par type d’élément).
- Images servies en local depuis `public/board/` ; sans fichier, rectangle gris avec le nom.

```bash
PEXELS_API_KEY=... pnpm fetch-images board   # photos et détourés bruts → public/board/raw/, credits.json
pnpm cutout                                  # détourage local → public/board/cutouts/*.png
```

`pnpm cutout` utilise la commande `rembg` si elle est installée (`pip install "rembg[cli]"`), sinon le paquet
`@imgly/background-removal-node` (`pnpm add -D @imgly/background-removal-node`). Les mèmes se déposent à la main dans
`public/board/memes/` et se référencent par `src` dans `data/board.ts` : rien n’est cherché en ligne.

---

## Pipeline de montage de réels (vertical 9:16)

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
