# Montagevideo — pipeline de montage automatisé (reel vertical 1080×1920)

Pipeline **réplique de système** : transforme une vidéo talking-head en reel vertical
`1080×1920` en reproduisant à l'identique le système de montage d'une vidéo de référence —
mêmes sous-titres, mêmes types d'inserts, même ambiance, même rythme, même traitement audio.

> **Règle transversale : la retenue.** À chaque hésitation entre un effet et son absence,
> on choisit l'absence. Toute la palette graphique est **achromatique** (R=G=B). Aucune couleur,
> aucun zoom/punch-in, aucune transition autre que la coupe franche. Voir la spec complète.

## Stack

- **Node 20 + TypeScript** pour l'orchestration (`src/`), exécuté via `tsx`.
- **ffmpeg** pour tout le média.
- **WhisperX** (large-v3, alignement mot à mot) pour la transcription — venv Python 3.11.
- **API Claude** pour les décisions éditoriales (coupes + plan d'inserts), sortie validée par **Zod**.
- **Remotion 4** pour la composition (`remotion/`).

Chaque étape est **idempotente** et **mise en cache par hash** ; reprise possible avec `--from <étape>`.

## Installation

```bash
bash scripts/setup.sh       # deps Node + ffmpeg + venv WhisperX, puis vérifie ffmpeg
export ANTHROPIC_API_KEY=…  # requis pour l'étape 3 (décisions éditoriales)
```

## Utilisation (CLI)

```bash
npm run pipeline -- --input ./raw/source.mp4 --lang fr --dry-run-edl   # s'arrête après l'EDL
npm run pipeline -- --input ./raw/source.mp4                           # pipeline complet
npm run pipeline -- --input ./raw/source.mp4 --from 07                 # reprise à une étape
npm run qa                                                             # QA bloquant + rapport
npm run preview                                                        # Remotion studio
```

## Étapes du pipeline

| ID | Étape | Sortie principale |
|----|-------|-------------------|
| 01 | Normalisation (CFR 30 fps, WAV 48k/24b) | `work/normalized.mp4`, `work/source.wav` |
| 02 | Transcription WhisperX (mot à mot) | `work/transcript.json` |
| 03 | Nettoyage parole (acoustique + lexical + Claude) + plan d'inserts | `work/editorial.json` |
| 04 | EDL (respiration, zero-crossing, crossfade 18 ms, stats) | `work/edl.json` |
| 05 | Découpe frame-accurate + concat | `work/cut.mp4`, `work/cut.wav` |
| 06 | Mastering audio (chaîne complète + room tone + loudnorm 2 passes) | `work/audio_master.wav` |
| 07 | Sous-titres — blocs cumulatifs (données Remotion) | `work/captions.json` |
| 08 | Plans & rythme (recadrages + placement inserts) | `work/shots.json` |
| 09 | Étalonnage facecam + rendu Remotion | `out/reel.mp4` |

## Arborescence

```
src/
  cli.ts              # point d'entrée CLI (parse args, orchestration)
  pipeline.ts         # contrat d'étape + runner (--from, cache par hash)
  config.ts           # SOURCE UNIQUE des valeurs numériques (pixel/frame)
  steps/01..09        # une étape par fichier
  claude/             # client API + schémas Zod (éditorial + inserts)
  qa/                 # qa.ts (bloquant), neutralityLint.ts, contactSheet.ts
  util/               # log, fs/hash, exec, ffmpeg, cache, stub
remotion/
  theme.ts            # tokens graphiques achromatiques (source unique)
  Root.tsx            # compositions
  compositions/Reel.tsx
  components/Captions.tsx, Texture.tsx
  components/inserts/  # CollageSubject, CollageScene, EditorialType, NotebookList, ObjectReveal
scripts/setup.sh      # installe la stack, vérifie ffmpeg
assets/manifest.json  # tags des PNG détourés (Claude sélectionne à l'étape 3)
```

## État — livraison par jalons

Le pipeline se construit **jalon par jalon**, avec un livrable concret validé à chaque étape
(voir §15 de la spec).

- [x] **Jalon 1** — Setup, structure, CLI, étapes vides chaînées (cache + `--from` fonctionnels).
- [ ] Jalon 2 — Étapes 1 et 2 (livrable : `transcript.json`).
- [ ] Jalon 3 — Étapes 3 et 4 avec `--dry-run-edl` (livrable : EDL + stats).
- [ ] Jalon 4 — Étapes 5 et 6 (livrable critique : audio seul au niveau de la référence).
- [ ] Jalon 5 — Sous-titres seuls sur facecam brut (livrable : 15 s rendues).
- [ ] Jalon 6 — Univers papier (CollageSubject, EditorialType).
- [ ] Jalon 7 — Univers noir (NotebookList).
- [ ] Jalon 8 — Assemblage, étalonnage, QA, planche-contact.

> Les fichiers d'étape actuels écrivent des **placeholders** marqués `__stub__` : ils permettent
> de vérifier le chaînage, le cache et `--from` avant que la logique réelle de chaque étape
> ne soit branchée. L'ancien pipeline Python (approche colorée, à stickers) est remplacé par ce
> système sobre ; son historique reste dans git.
