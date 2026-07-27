# Edit report — Reel 5 « Poker Pro & Fiscalité »

**Livrable :** short vertical 9:16, 1080×1920, 30 fps, **durée finale 44,63 s** (9 plans).
**Source :** `reel 5 teste.mp4` — 1080×1920, 60 fps, 3 min 26 s, talking-head FR.
**Angle retenu :** *à gains égaux, c'est le pays de résidence qui décide de la fortune finale d'un joueur de poker pro.*

## Ce que j'ai coupé (et pourquoi)
- **Intro morte 0–8 s** (« Reel 3, où habiter quand on est joueur de poker pro » + 4,25 s de blanc) — zéro accroche, on rentre direct dans le hook.
- **Prise ratée « Les 4 entreprises… » (102–135 s)** — bafouillée, entrecoupée d'un silence de 26 s ; écartée entièrement.
- **Doublons / faux départs** : « un amateur qui gagne… / de temps en temps » (×2), « d'autres te taxent… » (×2), « et c'est exactement ça… » (×2). Gardé la meilleure version à chaque fois.
- **Digression amateur/pro longue (35–62 s)** — condensée à la question-clé.
- **CTA d'origine inaudible** (« comment de Poker ? » ×2) — remplacé par un bandeau **COMMENTE POKER**.
- **85 s de silences** (>0,3 s) supprimés avec 0,08 s de marge avant/après chaque coupe (jamais collé sur l'attaque d'un mot).

## Structure (timeline finale)
| # | rôle | texte | caméra | transition | overlay | SFX |
|---|---|---|---|---|---|---|
| s01 | hook | « le seul métier où deux joueurs, mêmes gains, fortunes différentes… » | punch-in + drift | cut | — | impact |
| s02 | hook | « …à cause de l'endroit où ils dorment. » | snap-zoom | cut | — | impact |
| s03 | body | « amateur ou pro ? » | drift | whip← | — | whoosh |
| s04 | body | « la taxation change énormément d'un pays à l'autre » | punch-in | cut | — | click |
| s05 | body | « certains pays ne taxent pas les gains du jeu » | drift | whip→ | — | whoosh |
| s06 | body | « ça peut représenter la moitié de ce que tu gagnes » | punch-in | cut | **stat 50 %** | click |
| s07 | body | « les gens se font avoir : "j'habite là-bas" » | drift | cut | — | — |
| s09 | body | « joue depuis la France → le fisc requalifie tout » | shake | flash | **bandeau alerte** | riser + impact |
| s10 | CTA | « où poser tes valises pour de bon » | drift + 3D | whip← | **bandeau CTA** | whoosh |

## Motion design
- **Caméra virtuelle** : punch-in (1.0→1.10, easing expo-out, se termine avant la fin du plan) ; snap-zoom (1.0→1.18 sur 3 f, réservé à la punchline du hook) ; drift lent (translation, jamais un zoom pleine-durée) sur tous les plans longs pour tuer l'image figée ; shake ±4 px sur l'impact « tout retombe ».
- **Transitions** : coupe franche par défaut ; 4 non-franches au total (whip← ×2, whip→, flash sur la révélation).
- **Sous-titres** : Inter Black 900, 92 px, contour noir 8 px + ombre, karaoké mot-à-mot (max 3 mots), mot en cours scale 1.06 + accent **cyan #3BE8FF** (jaune évité — interdits : pas de chaud/or), zone sûre (jamais sous y=1640).
- **Graphiques** : compteur 50 % animé (0→50 en 0,8 s + barre) ; bandeaux slide-in avec blur résorbant ; barre de progression en haut ; forme 3D low-poly (icosaèdre wireframe, opacité 0,18) en fond du CTA.
- **Ambiance** : grain animé (~0,04), vignette radiale, aberration chromatique 1 px sur les impacts uniquement.

## Son
- **Voix** : high-pass 80 Hz, dé-esseur, compression douce.
- **Musique** : lit synthétique (drone Am + air + pulse, généré ffmpeg, libre de droits), −20 dB, **ducking sidechain −9 dB** pendant la voix, fade-out sur les 8 dernières frames.
- **SFX générés ffmpeg** (libres de droits) : whoosh sur transitions, impact grave sur hook/punchline/révélation, riser 1 s avant la révélation, click sur les incrustations ; niveau ~−14 dB, jamais au-dessus de la voix.
- **Master : −14 LUFS intégré, true-peak −1 dBFS** (vérifié à l'EBU R128).

## Choix tranchés (à corriger si besoin — tu valideras)
- **Transcription Whisper `base`** (seul modèle accessible : HuggingFace/Azure bloqués par la politique réseau). Corrections appliquées : « le fisc » (pas « le fils »), « le fisc **requalifie** », « tu **vis** », « pour de **bon** ». **Le « 50 % » vient de « la moitié »**, pas d'un chiffre chiffré à l'antenne — à confirmer si un taux/pays précis doit être nommé.
- **Ingestion via Release GitHub** (Google Drive bloqué par la politique d'egress de la session).
- **Rendu via Chromium pré-installé** (`remotion.media` bloqué) ; WebGL logiciel (swangle) pour la 3D.
- Durée resserrée à ~44 s (retrait du plan « il faut que ce soit vrai » redondant avec la requalification, et de la queue de la phrase des 50 %).

## Fichiers de sortie
- `out/short_final.mp4` — H.264 CRF 18, yuv420p, +faststart, AAC 320 k, 1080×1920.
- `out/short_captions.srt` — sous-titres séparés (49 lignes).
- `out/short_9x16_noSFX.mp4` — version voix seule (sans musique ni SFX).
- `out/edit_report.md` — ce document.
