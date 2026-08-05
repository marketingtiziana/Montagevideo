# reel-pipeline

Facecam brute → **reel vertical 1080×1920 prêt à publier** (Reels / TikTok /
LinkedIn / Shorts). Son propre et chaud, rythme serré sans respiration coupée,
sous-titres élégants, inserts animés qui illustrent le propos, transitions
fluides, cadrage vivant qui suit le visage.

Outil CLI versionné, testable, relançable sur n'importe quelle vidéo — étapes
idempotentes et cache disque. **On ne rend jamais une vidéo qui n'a pas passé le
QA automatique** (`npm run qa`).

## Installation

```bash
cd reel-pipeline
bash scripts/setup.sh        # ffmpeg check + node deps + venv python (WhisperX, MediaPipe)
export ANTHROPIC_API_KEY=... # pour l'étape 3 (analyse éditoriale Claude)
```

## Utilisation

```bash
# EDL + stats seulement (aucun rendu) — le jalon à valider en premier
npm run pipeline -- --input ./raw/interview.mp4 --lang fr --max-duration 90 --dry-run-edl

# pipeline complet
npm run pipeline -- --input ./raw/interview.mp4 --lang fr \
  --preset reel-vertical --lufs -14 --max-duration 90 --room-tone

npm run qa            # QA bloquant -> out/qa_report.json + out/contact_sheet.jpg
npm run preview       # Remotion Studio pour ajuster à la main

# reprise à une étape (le cache réutilise les étapes précédentes)
npm run pipeline -- --input ./raw/interview.mp4 --from 06
```

## Les 8 étapes

| # | Étape | Entrée → Sortie |
|---|---|---|
| 01 | probe & normalise | source → `source.mp4` (CFR 30) + `source.wav` (48 kHz) + `probe.json` |
| 02 | transcription | `source.wav` → `transcript.json` (mot à mot, WhisperX large-v3) |
| 03 | analyse | transcript → `analysis.json` (acoustique + lexical + Claude, fusion) |
| 04 | EDL | analysis → `edl.json` (règles de coupe section 6, snapping frame) |
| 05 | découpe | edl → `cut.mp4` + `cut.wav` (re-encode frame-accurate, concat) |
| 06 | audio master | cut → `audio_master.wav` + `audio_report.json` (chaîne podcast, −14 LUFS) |
| 07 | tracking visage | cut → `face_track.json` + `face_debug.mp4` (MediaPipe + One Euro) |
| 08 | composition | tout → `out/reel.mp4` (Remotion : cadrage, sous-titres, transitions, inserts) |

Chaque étape écrit son JSON versionné dans `work/<hash>/` et est sautée si
l'entrée n'a pas changé. Toutes les commandes ffmpeg sont journalisées, copiables
telles quelles, dans `work/<hash>/run.log`.

## Architecture

```
src/cli.ts            parsing des args
src/pipeline.ts       orchestrateur des 8 étapes + resume (--from)
src/steps/01..08      une étape par fichier, entrée/sortie JSON
src/lib/              ffmpeg, cache (hash), timecode, claude, detectors, schema (Zod)
src/qa.ts             QA bloquant + contact sheet
python/               transcribe.py (WhisperX), face_track.py (MediaPipe + One Euro)
remotion/             Root, compositions/Reel, components/*, theme.ts (tokens de marque)
```

## Notes

- `theme.ts` est la **source unique** des couleurs / polices. Le QA lint ce
  fichier : toute couleur hors palette fait échouer le QA.
- WhisperX `large-v3` peut faire des fautes (chiffres, noms propres) — le texte
  des sous-titres reste relisible dans Remotion Studio (`npm run preview`).
- L'ordre de la chaîne audio n'est pas décoratif : l'inverser dégrade le rendu.
