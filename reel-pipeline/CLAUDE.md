# CLAUDE.md — reel-pipeline (brief permanent)

Référence permanente pour toutes les sessions. On ne rend **jamais** une vidéo
qui n'a pas passé le QA automatique (`npm run qa`).

## Stack

| Couche | Outil |
|---|---|
| Orchestration | Node 20 + TypeScript (tsx) — `src/` |
| Média bas niveau | ffmpeg / ffprobe (`src/lib/ffmpeg.ts`) |
| Transcription | WhisperX large-v3, venv Python 3.11 (`python/transcribe.py`) |
| Analyse éditoriale | API Claude (Sonnet) (`src/lib/claude.ts`, `src/steps/03-analyze.ts`) |
| Tracking visage | MediaPipe + One Euro (`python/face_track.py`) |
| Composition | Remotion 4 (`remotion/`) |
| Motion 3D léger | Three.js via @react-three/fiber (`remotion/components/inserts/Shape3D.tsx`) |

Le pipeline a 8 étapes idempotentes et cachées (`src/steps/01..08`),
orchestrées par `src/pipeline.ts`. Chaque étape lit/écrit un JSON versionné
dans `work/<hash>/` ; si l'entrée n'a pas changé, l'étape est sautée
(`[NN-step] cache hit, skipping`).

## Tokens de marque (`remotion/theme.ts` — source unique de vérité)

- navy `#0F1535` (fond, blocs), indigo `#4F6BFF` (accent principal),
  white `#FFFFFF`, accent `#FFD84D` (mot-clé sous-titre UNIQUEMENT), ink `#0A0E24`.
- Police : **Inter** uniquement, poids 400 / 700 / 900. radius 20.
- Safe zones : top 180, bottom 340, side 90.

## Interdits visuels (stricts)

Aucune police serif. Aucun doré. Aucune couleur chaude hors `accent`. Aucun
tiret cadratin dans les textes affichés. Aucun dégradé criard. Aucune ombre
portée floue diffuse (uniquement contour net + ombre nette offset). Sous-titres
jamais tout en majuscules, jamais de boîte de fond opaque. Transitions
interdites : glitch, RGB split, flash blanc, étoile, zoom rotation.

## Règles de coupe (section 6, non négociables)

1. Respiration : 130 ms avant le premier mot d'un bloc, 180 ms après le dernier.
   On ne colle jamais deux mots bord à bord.
2. Durée minimale de coupe : 90 ms.
3. Silence maximal toléré : 350 ms (au-delà, ramené ; `silence_mort` = supprimé).
4. Snapping frame (1/30 s) + zero-crossing audio (+/- 8 ms).
5. Crossfade audio 18 ms à chaque jointure (obligatoire, anti-clic).
6. J-cut : > 1,2 s de matière coupée -> audio du bloc suivant 4 frames avant l'image.
7. Pas plus de 3 coupes par tranche de 2 s (on garde les plus confiantes, warning).

## Cibles audio (mastering, ordre exact — `src/steps/06-audio-master.ts`)

highpass 75 → afftdn adaptatif → de-esser 5.5–9 kHz (3–4 dB) → EQ
(−2.5 dB@300, +2 dB@3k, +1.5 dB shelf@11k) → acompressor 3:1 (~4–6 dB GR) →
alimiter (TP −1 dBTP) → loudnorm 2 passes **−14 LUFS**, LRA 7, TP −1.
Jamais débruité jusqu'au métallique/sous l'eau. `--room-tone` = fond de salle −58 dBFS.

## Sous-titres / inserts / cadrage

- Sous-titres : groupes 2–4 mots, ≤ 22 caractères, une ligne, mot actif
  révélé blanc→accent + scale 1.00→1.06 (3f). Baseline 640 px du bas.
- Cadrage : base 1.12, plage 1.00–1.42, punch +0.14 sur `punchline`, Ken Burns
  lent, visage dans le tiers supérieur.
- Inserts : jamais sur le visage, **un seul à l'écran**, densité 1 / 5–8 s,
  durée 2–5 s, entrée 10f / sortie 8f avec mouvement, `justification` obligatoire.

## Commande QA (bloquante)

```bash
npm run qa   # écrit out/qa_report.json + out/contact_sheet.jpg, PASS/FAIL en console
```

Échoue si : LUFS ∉ [−15, −13], TP > −1 dBTP, silence > 400 ms, deux coupes < 90 ms,
sous-titre > 4 mots / 22 car., sous-titre dans la safe zone, insert sur le visage
> 10 %, deux inserts simultanés, dérive a/v > 1 frame, couleur hors palette.

## CLI

```bash
npm run pipeline -- --input ./raw/x.mp4 --lang fr --preset reel-vertical \
  --lufs -14 --max-duration 90 --room-tone --dry-run-edl
npm run pipeline -- --input ./raw/x.mp4 --from 06   # reprise à l'étape 6
npm run qa
npm run preview                                     # Remotion Studio
```
