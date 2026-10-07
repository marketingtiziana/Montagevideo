# Livraison — Reel 3 « Andorre, le petit pays mystérieux »

## Fichiers hébergés (Higgsfield, confirmés)
| Élément | URL |
|---|---|
| **Master** 1080×1920, 30 fps, 54,0 s, H.264 12 Mb/s, AAC 192k 48 kHz, faststart, −14,1 LUFS | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/55afbc71-d892-43b6-b9dd-a50d07b2850e.mp4 |
| Planche contact (22 écrans, n° · temps · source · fait) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/2db38746-7bef-48c5-b398-22b784c1f022.jpg |
| Brouillon 540×960 (vidéo seule, QA) | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/46d4ce85-a7cd-4bf2-9ac5-3b38b9d96345.mp4 |

Aperçu 720p léger (avec musique) envoyé dans la conversation : `renders/apercu_reel3.mp4` (non versionné, *.mp4 ignoré).

## Valeurs par défaut prises (variables non fournies)
| Variable | Choix | Pour changer |
|---|---|---|
| `<CTA>` | « Commente **LISTE** » (écrans 21–22) | `gen_edit.py`, écrans 21–22 |
| `<HANDLE>` | aucun (non fourni) : l'écran 22 garde le CTA, assombri, fondu au noir | remplacer les lignes de l'écran 22 |
| `<ACCENT>` | **#FFC23D** (ambre chaud, lisible sur l'étalonnage sombre et sur le lumineux) | `ACCENT` dans `gen_edit.py` |
| Musique | **composition originale** synthétisée (`audio/music.py`), aucune licence tierce | remplacer `audio/score.wav` au mixage |
| Typo | Montserrat ExtraBold 800 (tout le texte cinétique), SemiBold 600 (FRANCE / ESPAGNE sur la carte) | — |

## QA master (mesurée sur le fichier livré, `tests/qa3.py` → `tests/qa_master.json`)
| Contrôle | Cible | Mesuré | |
|---|---|---|---|
| Format | 1080×1920, 30 fps, H.264, AAC, faststart | 1080×1920, 30 fps, H.264 High 12,4 Mb/s, AAC 48 kHz, `moov` avant `mdat` | ✅ |
| Durée | 40–55 s | 54,0 s | ✅ |
| Loudness | −14 ±1 LUFS, true peak ≤ −1 dBTP | **−14,1 LUFS**, **−1,2 dBTP**, LRA 3,8 LU | ✅ |
| Coupes vs SCRIPT.md | à l'image près | 19/19 coupes visibles détectées, écart max 33 ms (1 image, dip au noir) ; 49,6 s et 52,4 s restent sur le même plan (voulu) | ✅ |
| Sons calés sur les coupes | < 80 ms | drop 16,0 s : **0 ms** ; impacts écrans 10–15 et CTA : 0 à 60 ms | ✅ |
| Zéro statique | aucune fenêtre figée > 1,2 s | plus longue fenêtre quasi immobile : 1,0 s (fondu final) | ✅ |
| Zones sûres Reels | texte dans x 90–990, y 300–1450 | bloc de texte centré sur y ≈ 900 ; carte y 300–1100, texte carte jusqu'à y ≈ 1450 | ✅ |
| Un mot accent par écran | 22/22 | 22/22 (couleur #FFC23D, pop ressort sur les lignes accent seules) | ✅ |
| Faits sourcés | 100 % | chaque chiffre renvoie à `FACTS.md` (colonne « Fait » de la planche contact) | ✅ |

## Montage (Higgsedit v0.14)
- **0–16 s mystère** : étalonnage sombre désaturé (shader : exposition 0,76, saturation 0,5, vignette forte, grain), respiration au noir sur chaque coupe, drone + souffle + tic-tac + battements.
- **Écran 3** : carte tracée depuis Natural Earth (frontières FR/ES dessinées, contour de l'Andorre tracé puis rempli).
- **16,0 s drop** : silence de 0,25 s, flash blanc, bascule vers l'étalonnage lumineux, « ANDORRE » plein cadre.
- **18–46 s énumération** : coupe toutes les 2,8 s (7 temps à 150 BPM), punch-in 1,12 → 1,0 avec flou de bouger, impact sonore par coupe.
- **46–54 s CTA** : étalonnage chaud, « LA LISTE », puis « Commente LISTE » souligné, assombrissement, fondu au noir.

## Écarts par rapport au SCRIPT.md validé
1. CTA calé sur la grille 150 BPM : 49,5 → **49,6 s** et 52,5 → **52,4 s** (±0,1 s).
2. Plans : écran 10 = vallée ensoleillée (vidéo réelle Pexels, route andorrane) ; écran 12 = vue d'Andorre-la-Vieille ; écran 14 = maison accrochée à la roche (Canillo) ; écran 15 = vieille maison de pierre (Canillo) au lieu du Pont de Paris. Le Pont de Paris apparaît déjà aux écrans 8 et 16 ; trois fois aurait été redondant.
3. Écran 4 « village de nuit » : photo de jour (Escaldes-Engordany) passée à l'étalonnage sombre. Aucune photo de nuit exploitable sous licence libre, et générer une nuit sur un lieu réel aurait inventé l'image.

## Limites connues
- **Enseignes** : quelques enseignes de rue restent visibles, petites, dans des photos réelles (avenue Meritxell, écrans 11 et 13). Aucun logo n'est mis en avant. Le plan qui montrait « OMEGA » en grand a été écarté.
- **Plan 20–22** : un petit reflet vert en bas de l'image générée a été supprimé par recadrage (crop 86 %, léger zoom).
- **Musique synthétisée** : originale et sans droits, mais plus simple qu'une production de banque musicale. Un fichier sous licence peut remplacer `audio/score.wav` (même durée, drop à 16,0 s).
- **Master en deux moitiés** : il a été rendu en deux passes (0–27 s et 27–54 s, limite de durée du bac à sable), puis assemblé sans réencodage. La jonction à 27 s tombe au milieu de l'écran 13, sur une image-clé. Aucun saut n'est visible : les écarts entre images autour de 27 s (2,5 à 6,6) restent dans la plage du mouvement normal du plan.

## Fichiers dans ce dossier
- `FACTS.md` (validé), `SCRIPT.md` (validé), `SOURCES.md` (licences et texte d'attribution prêt à coller)
- `gen_edit.py` → `edit.jsx` + `edit_times.json` ; `edit.template.jsx` ; `shots.json` (plan → fichier, point d'entrée)
- `audio/music.py` → `audio/score.wav` (non versionné, se régénère)
- `data/` : métadonnées Commons, Pexels, jobs et résultats Higgsfield, `map.json`
- `tools/` : `pexels_search.py`, `commons_sheet.py`, `map_paths.py`, `mkrender.py` (bundle de rendu pour le bac à sable), `sources.py`
- `tests/lint.mjs` (validation structurelle), `tests/qa3.py`, `tests/qa_draft.json`, `tests/qa_master.json`, `contact_sheet.jpg`

## Reproduire
```bash
python3 gen_edit.py && node tests/lint.mjs            # edit.jsx + edit_times.json
(cd audio && python3 music.py)                         # score.wav, -14 LUFS
python3 tools/mkrender.py masterA - <PUT_URL> > a.sh   # idem masterB ; dans le bac à sable Higgsfield : bash a.sh
ffmpeg -f concat -safe 0 -i concat.txt -i audio/score.wav -map 0:v -map 1:a -c:v copy \
  -c:a aac -b:a 192k -ar 48000 -t 54 -movflags +faststart master.mp4
python3 tests/qa3.py master.mp4 tests/qa_master.json
python3 tools/sources.py
```
