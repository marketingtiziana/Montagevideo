# Livraison — Reel 4 « Les 5 meilleurs pays pour créer ta société en 2026 » (n°1 : Hong Kong)

## Fichiers hébergés (Higgsfield, confirmés)

| Élément | Caractéristiques | URL |
|---|---|---|
| **Master 60 fps** | 1080×1920, 60 fps, H.264 High 12,4 Mb/s, AAC 192k 48 kHz, faststart, 57,0 s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/afaeb5ed-09d7-46d3-8339-25faabfb260a.mp4 |
| **Master 30 fps** (repli) | 1080×1920, 30 fps, H.264 9,9 Mb/s, AAC 192k, faststart, 57,0 s | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/ac5eaa9b-1e83-4cf3-9f17-b25268532e90.mp4 |
| Brouillon 540×960 | 30 fps, avec son | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/f423f33b-cf97-4ad2-b3e9-791c4144a144.mp4 |
| Aperçu 720p | 30 fps, avec son, envoyé dans la conversation | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/81f4804d-dc1e-4c67-9cd8-743fa529c61f.mp4 |
| Planche contact | `higgsedit sheet`, 24 vignettes, une par écran | https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/d7e8c4eb-c956-49f9-89f6-aa0e1757a485.jpg |

La planche contact est aussi dans le dépôt : `contact_sheet.jpg`.

## Valeurs retenues (FACTS.md et SCRIPT.md validés)

| Variable | Valeur |
|---|---|
| CTA | « Commente **CODEX** » (pas de handle, non fourni) |
| Palette | noir #0A0A0A, blanc #FFFFFF, accent **#E8B04A** (or), accent2 **#FF4D4D** (rouge), forces en vert #3DDC84 |
| Typo | Montserrat ExtraBold 800 et SemiBold 600 ; chiffres et titres en Black 900 |
| Musique | composition **originale** synthétisée, 120 BPM, drop à 27,0 s (aucune licence tierce) |
| Notes /10 | affichées « NOTRE NOTE » (avis éditorial). Barres et notes dans SCRIPT.md |

## QA (mesurée sur les fichiers livrés)

Script `tests/qa4.py`, résultats dans `tests/qa_master60.json` et `tests/qa_master30.json`.

| Contrôle | Cible | Mesuré | |
|---|---|---|---|
| Format | 1080×1920, 60 fps + 30 fps, H.264 12M / 10M, AAC 192k, faststart | 60 fps : 12,4 Mb/s · 30 fps : 9,9 Mb/s · AAC 48 kHz · `moov` avant `mdat` | ✅ |
| Durée | 50–60 s | 57,0 s | ✅ |
| Loudness | −14 LUFS, true peak ≤ −1 dBTP | **−14,1 LUFS** · true peak **−2,6 dBTP** (ebur128 sur le master 60 fps) · LRA 4,9 LU | ✅ |
| Coupes sur les temps | 100 % sur la grille à 120 BPM | 22/22 coupes prévues sur un temps. Détection automatique : 21/21 sur le master 30 fps (écart max 100 ms, fondus inclus) ; 16/21 sur le master 60 fps, où les 5 transitions fondues (push, iris) ne créent pas de saut détectable | ✅ |
| Impacts audio | sur les temps forts | 19 impacts (chiffres, N°1, chaque « 0 % », drop) à 0–67 ms de leur événement | ✅ |
| Drop | exactement 27,0 s | 27,000 s (riser de 25,0 à 27,0 s) | ✅ |
| Zéro image figée | aucune fenêtre fixe > 1,0 s | plus longue fenêtre quasi immobile : **0,05 s** (60 fps), 0,03 s (30 fps) | ✅ |
| SCRIPT ↔ FACTS | 0 chiffre non sourcé | `tests/facts_diff.py` : 24 chiffres affichés, **0 non sourcé** (`tests/facts_diff.json`) | ✅ |
| Transitions à 0,25x | 3 transitions contrôlées | zoom-through (2,0 s), whip (3,0 s), luma wipe (4,0 s), push (9,5 s), iris (12,0 s) : aucun noir, aucune saccade (planches dans la PR) | ✅ |
| Zones sûres | rien d'important en y < 250 ni en y > 1570 | contenu entre y 262 et y 1505 | ✅ |
| Un mot accent par écran | 23/23 | 23/23 (or #E8B04A, rouge pour le piège) | ✅ |

## Virality predictor (Higgsfield, `virality.json`)

L'outil limite les vidéos à 16 s : il a été lancé sur deux extraits du master 60 fps. Les scores sont des indicateurs prédictifs normalisés de 0 à 100, pas une garantie de performance.

| Extrait | Global | Engagement | Hook (3 premières s) | Potentiel viral | Maintien | Pic |
|---|---|---|---|---|---|---|
| 0–15,9 s (hook + début du countdown) | 48 | 40 | **32** | 47 | **100** | 15 s |
| 24–40 s (drop, N°1, bloc Hong Kong) | 50 | 44 | 37 | 47 | 94 | 0 s (24 s du reel) |

**Lecture des scores :**
- Le maintien est excellent (94–100) : le rythme ne lâche jamais.
- Le point faible est la **toute première seconde**. Le reel ouvre sur un plan nocturne sombre avec un texte de taille moyenne (hook 32).
- **Piste d'amélioration**, non appliquée car hors du script validé : ouvrir directement sur la Burj Khalifa avec « DUBAÏ » derrière la tour, et faire apparaître le chiffre « 5 » en 420 px dès la première image.

## Écarts au brief, avec leur raison

1. **6 plans remplacés après vérification du lieu.** Le titre Pexels de chaque plan a été contrôlé :
   - s15 (« Star Ferry ») avait été tourné à **Istanbul** ;
   - s17 (« port de Hong Kong ») avait été tourné en **Suède** ;
   - 4 autres titres ne confirmaient pas le lieu (s06, s14, s16, s19).

   Tous ont été remplacés par des plans dont le titre nomme le bon lieu. Le détail est dans `SOURCES.md`.
2. **16:9 → 9:16 sans `reframe`.** Le recadrage centré dans ffmpeg (sources 4K ou 1440p) n'ajoute rien. Le `reframe` de Higgsfield étend l'image par IA, ce qui aurait inventé une partie d'un lieu réel.
3. **Aucun i2v ni t2v nécessaire.** Pexels avait de vraies vidéos pour chaque lieu. Aucune image de lieu n'est générée par IA ; seule la couverture du CODEX l'est (texture, sans texte).
4. **Texte derrière l'objet sur 1 plan.** « DUBAÏ » passe derrière la Burj Khalifa (détourage net). Le détourage du skyline de Hong Kong a été testé puis **écarté** : bords flous, fenêtres trouées par la clé.
5. **Tableau du n°1.** Barres pleines pour Impôts, Rapidité et Crédibilité, mais Banque à 8/10 pour rester cohérent avec l'écran « piège » (validé dans SCRIPT.md).
6. **Virality predictor.** L'outil refuse les vidéos de plus de 16 s. Il a donc été lancé sur deux extraits du master 60 fps : 0–15,9 s (hook et début du countdown) et 24–40 s (drop, révélation, début du bloc Hong Kong). Résultats ci-dessous.
7. **SFX.** Synthétisés et originaux (pas de banque sous licence), sur un bus 10 LU sous la musique, avec ducking de −4 dB sur les impacts.

## Limites connues

- **Enseignes lointaines.** De petites enseignes restent visibles sur des tours au loin : skyline de Hong Kong la nuit (s12, s13), tours voisines de la Burj (s02a), un immeuble à Singapour (s11). Aucune n'est mise en avant ; aucun logo n'est au premier plan.
- **Analyse Higgsfield du plan s12.** Le job est resté « in_progress » plus de 45 min sans résultat. Le plan a été contrôlé à l'œil sur la planche contact.
- **Fond flouté des cartes « verre ».** C'est une copie floutée du plan sous la carte. Pendant les 0,6 s de montée d'une carte, le flou suit la carte au lieu de rester fixe ; c'est invisible à ce niveau de flou.
- **Montage en tranches.** Le master a été rendu en 8 tranches (limite mémoire du bac à sable), puis concaténé sans réencodage. Chaque tranche commence sur une image-clé à un point de coupe ou de transition.

## Fichiers du dossier `reel4/`

| Fichier | Contenu |
|---|---|
| `FACTS.md` | faits validés |
| `SCRIPT.md` | script validé |
| `SCENES.md` | plan des transitions et des couches |
| `SOURCES.md` | licences, auteurs, jobs Higgsfield, texte d'attribution |
| `CAPTIONS.md` | 3 légendes Instagram avec la phrase CTA |
| `gen_edit.py` → `edit.jsx` + `edit_times.json` | génération du montage |
| `edit.template.jsx` | gabarit Higgsedit |
| `shots.json` | plans utilisés |
| `mockups/codex_book/` | livre 3D en HTML/CSS et couverture |
| `tools/render_mockup.py` | rendu du livre en .mov alpha |
| `audio/music.py` | musique et SFX → `score.wav` (non versionné) |
| `tools/` | Pexels, drapeaux, contour de Hong Kong, bundles de rendu, assemblage, SOURCES |
| `data/` | métadonnées Pexels, choix des plans, jobs Higgsfield (upscale, analyses, détourages), `analysis.json`, `hk_outline.json` |
| `tests/` | `lint.mjs`, `qa4.py`, `facts_diff.py` et leurs résultats JSON |
| `virality.json` | rapport du virality predictor |

## Reproduire

```bash
python3 gen_edit.py && node tests/lint.mjs && python3 tests/facts_diff.py
(cd audio && python3 music.py)                                          # score.wav, -14 LUFS
python3 tools/render_mockup.py mockups/codex_book OUT                   # livre 3D -> OUT/codex_book.mov (alpha)
python3 tools/mkrender.py frames <PUT_URL> > b.sh                       # dans le bac à sable Higgsfield : bash b.sh
python3 tools/mkrender.py parts <PUT_URLS> 0:7,7:14.5,...,48.5:57 > p.sh # master 60 fps en tranches
python3 tools/assemble.py parts.json <SCORE_URL> outs.json > a.sh       # concat, mixage, 30 fps, brouillon, planche contact
python3 tests/qa4.py master60.mp4 tests/qa_master60.json
```
