# video-short-llc — pipeline de shorts faceless (1080×1920)

Génère une vidéo verticale prête à publier : **voix off IA** (ElevenLabs) + **clips vidéo IA**
(fal.ai) + **sous-titres karaoké mot à mot** (.ass brûlés via libass), assemblés par ffmpeg.

Sujet livré par défaut : *« C'est quoi une LLC »*, pour entrepreneurs francophones expatriés.
**Changer de sujet = éditer `script.json`, rien d'autre.**

```bash
bash run.sh
```

---

## Lancement

```bash
cd video-short-llc
cp .env.example .env        # puis renseigner les deux clés
bash run.sh                 # → output/final.mp4
```

| Commande | Effet |
|---|---|
| `bash run.sh` | Pipeline complet (consomme des crédits API) |
| `bash run.sh --mock` | **Run à blanc, zéro crédit** — entrées factices, valide toute la chaîne |
| `bash run.sh --skip-clips` | Réutilise les clips déjà dans `clips/` |
| `bash run.sh --skip-voice` | Réutilise `voice.mp3` + `timestamps.json` |

La voix et les clips sont lancés **en parallèle** (étapes indépendantes ; les clips sont
de loin les plus lents). Journal des clips : `work/clips.log`.

---

## Variables d'environnement

| Variable | Requis | Rôle |
|---|---|---|
| `ELEVENLABS_API_KEY` | oui | Synthèse vocale + timestamps ([clés](https://elevenlabs.io/app/settings/api-keys)) |
| `FAL_KEY` | oui | Génération des clips ([clés](https://fal.ai/dashboard/keys)) |
| `ELEVENLABS_VOICE_ID` | non | Surcharge `config.json > voice.voiceId` |

Chargées depuis l'environnement ou depuis un fichier `.env` local (ignoré par git).

Lister les voix disponibles sur le compte :

```bash
node 01_voice.js --list-voices
```

---

## Coûts estimés (par vidéo)

Le script livré fait **829 caractères** facturés et **7 clips de 5 s**.

| Poste | Volume | Ordre de grandeur |
|---|---|---|
| ElevenLabs `eleven_multilingual_v2` | 829 caractères | **≈ 0,20 $** (forfait à 100 k car./22 $) |
| fal.ai Kling v1.6 standard | 7 × 5 s | **≈ 1,50 – 2,50 $** |
| ffmpeg (local) | — | 0 $ |
| **Total** | | **≈ 2 – 3 $ par vidéo** |

> Ces montants sont des **ordres de grandeur** : les grilles tarifaires d'ElevenLabs et de
> fal.ai évoluent et dépendent de ton forfait. Vérifie sur
> [elevenlabs.io/pricing](https://elevenlabs.io/pricing) et [fal.ai/pricing](https://fal.ai/pricing).
> Le poste dominant est la vidéo : `--skip-clips` et le cache de `clips/` évitent de repayer
> lors d'une reprise, et `bash run.sh --mock` permet de tout tester à 0 $.

Pour réduire la note : baisser `clips.durationSeconds`, réduire le nombre de segments, ou
passer sur un modèle moins cher (`config.json > clips.model`).

---

## Étapes

| Script | Entrée | Sortie |
|---|---|---|
| `01_voice.js` | `script.json` | `voice.mp3`, `timestamps.json`, `work/voice_seg_NN.mp3` |
| `02_clips.js` | `script.json` | `clips/scene_NN.mp4`, `clips/manifest.json` |
| `03_subs.js` | `timestamps.json` | `subs.ass` |
| `04_assemble.js` | tout ce qui précède | `output/final.mp4`, `output/render.json` |

Chaque script est autonome et relançable :

```bash
node 01_voice.js
node 02_clips.js --only 3,5 --force   # régénère seulement certaines scènes
node 03_subs.js
node 04_assemble.js --no-music --no-subs
```

### 01 — Voix off

Un appel `/with-timestamps` **par segment**, pour que chaque segment ait sa propre durée :
c'est elle qui pilotera l'étirement du clip correspondant. Les segments sont ensuite
concaténés (silence de `voice.segmentGapSeconds` entre chacun) et les timestamps réexprimés
sur la timeline globale.

⚠️ L'API renvoie un alignement **au caractère**, pas au mot. `lib/words.js` reconstruit les
mots : découpe sur les espaces (les apostrophes restent collées — `c'est` = 1 mot), et
rattachement de la ponctuation isolée au mot précédent, car le français place une espace
avant `: ; ! ?` — sans quoi le karaoké surlignerait un `:` tout seul.

Aucun Whisper n'est nécessaire : les timestamps viennent directement d'ElevenLabs.

### 02 — Clips

Les 7 générations partent en parallèle sur la file d'attente fal.ai (`concurrency`),
avec retry exponentiel (`maxAttempts`). Les clips déjà présents sont **ignorés** : une
reprise après échec partiel ne repaie que ce qui manque. `--force` pour tout régénérer.

### 03 — Sous-titres

Les mots sont groupés en cartes de `wordsPerCard`, coupées aussi sur la ponctuation forte
et les silences (`maxWordGapSeconds`). Pour chaque mot, une ligne `Dialogue` couvre sa durée
et affiche toute la carte, le mot actif étant **jaune et légèrement agrandi**.

### 04 — Montage

1. Chaque clip est recadré en 1080×1920 (`scale`+`crop`) et ajusté à la durée de son segment :
   **coupe** si trop long, **ralenti** (`setpts`) si trop court, **boucle** au-delà de
   `fit.maxStretchFactor` (un ralenti ×3 est inregardable).
2. Concaténation, puis incrustation `.ass` et mixage audio en un seul passage.
3. Musique de fond : si `music.mp3` existe, elle est bouclée, mise à `audio.musicVolumeDb`
   (**-18 dB**) et fondue en fin. `amix ... normalize=0` garantit que la voix garde son niveau.

> Les durées cibles sont calculées à partir des **débuts** de segments, pas de leurs durées :
> sinon la vidéo serait plus courte que l'audio de la somme des silences inter-segments.

---

## Configuration

`script.json` — contenu éditorial (**le seul fichier à changer pour un autre sujet**) :

```json
{ "segments": [ { "id": 1, "role": "hook",
                  "text": "texte prononcé…",
                  "prompt": "prompt visuel en anglais" } ] }
```

`config.json` — réglages techniques : résolution/fps/CRF, voix et `segmentGapSeconds`,
modèle fal.ai et durée des clips, style des sous-titres (police, taille, couleurs, marges,
`wordsPerCard`), volume musique, stratégie d'ajustement (`fit`).

Les prompts visuels sont en anglais (meilleurs résultats sur les modèles vidéo) ;
`clips.promptSuffix` et `clips.negativePrompt` s'appliquent à toutes les scènes.

---

## Dépendances

- **Node.js ≥ 18** (fetch natif ; testé sur v22)
- **ffmpeg / ffprobe** : installés via npm (`ffmpeg-static`, `ffprobe-static`) — rien à
  installer sur la machine. Le binaire embarque **libass**, **libx264** et **libfreetype**,
  nécessaires pour brûler les `.ass`.
- **Police Anton** téléchargée par `run.sh` dans `assets/fonts/`. Absente → repli sur une
  police système (`subs.fontFallback`).

> Ce build `ffmpeg-static` n'embarque **pas** le filtre `drawtext`. Le pipeline ne s'en sert
> pas (tout le texte passe par libass), mais en tenir compte pour toute extension.

---

## Tester sans dépenser

```bash
bash run.sh --mock
```

`tools/mock_inputs.js` fabrique, avec ffmpeg seul, une voix factice (bourdonnement, cadence
de parole simulée sur le vrai texte) et des mires animées 9:16 numérotées. Cela valide
`03_subs.js` et `04_assemble.js` de bout en bout — timings, recadrage, incrustation, mixage —
sans toucher aux API.

Vérifier une image précise du rendu :

```bash
node_modules/ffmpeg-static/ffmpeg -ss 10 -i output/final.mp4 -frames:v 1 frame.png
```

---

## Structure

```
video-short-llc/
├── script.json          ← contenu éditorial (à éditer pour changer de sujet)
├── config.json          ← réglages techniques
├── 01_voice.js … 04_assemble.js
├── run.sh
├── lib/{util,words}.js
├── tools/mock_inputs.js ← entrées factices pour les tests
├── clips/               ← scene_NN.mp4 (cache : non régénérés s'ils existent)
├── work/                ← intermédiaires (segments audio, clips ajustés, logs)
└── output/final.mp4     ← livrable
```
