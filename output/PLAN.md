# PLAN — Reel « Collaborer avant de s'associer » (version finale, validée et exécutée)

## Source (ffprobe + ebur128)
| | |
|---|---|
| Fichier | IMG_1260.MP4 — Higgsfield media `dbe8bdd0-095f-48a7-b1e8-edec4146de63` |
| Vidéo | H.264, **720×1280** (déjà en 9:16), 30 fps, 49,78 s |
| Audio | AAC mono 48 kHz — **−28,8 LUFS** intégré, true peak −6,3 dBTP, LRA 6,5 LU |
| Cadre | Plan fixe en extérieur, contre-jour doux. **Le visage occupe le tiers supérieur** (y ≈ 270–750 px en 1080×1920), buste en blazer blanc au centre |
| Transcription | faster-whisper medium, mot à mot → `transcript.json` (161 mots, corrigés : « clothing » → « cabinet », outro « Amara.org » halluciné supprimé) |
| Silences | 12 silences ≥ 0,4 s à −30 dB → jump cuts (on garde 120 ms de respiration) |

Durée estimée après jump cuts : **≈ 45 s de parole + CTA 2 s ≈ 47 s**.

## Variables proposées (à valider ou corriger)
| Variable | Proposition |
|---|---|
| MARQUE | *(non fournie)* → CTA générique sans nom de marque |
| PALETTE | fond `#0F0F12` · principal `#FFFFFF` · accent `#F2B544` (or chaud, raccord avec la lumière de fin de journée) |
| TYPO | Montserrat (ExtraBold 800 pour captions/cartes) |
| MUSIQUE | aucune |
| Upscale | oui : source 720p < 1080p → `upscale_video` topaz 1080p avant montage |

## Écarts par rapport au brief (contraintes du cadre et de l'outil)
1. **Placement des schémas** : le tiers supérieur, c'est le visage. Les graphismes vont donc dans une **bande « buste » y ≈ 960–1330 px** (sur le blazer, sous le menton, jamais sur la bouche). Captions sous la bande, y ≈ 1400–1560 (au-dessus des 350 px bas).
2. **Tracé des traits** : Higgsedit v0.14 n'a pas de progression de tracé native pour `<path>` (`drawProgress` n'existe que pour le texte mis en forme). Le tracé se fait avec un **masque animé dans le sens du trait** (gauche → droite / bas → haut), l'équivalent natif. Tous les schémas sont donc monotones dans leur direction de tracé (flèches, courbe montante, blocs reliés). Pas de cercle qui se referme.
3. **Transitions** : c'est un plan unique continu, donc un fondu enchaîné entre deux jump cuts du même cadre donnerait un effet de « morphing ». J'utilise un **zoom-whip de 6 images + motion blur** aux changements d'idée, et des cuts francs ailleurs.
4. **Codec** : `higgsedit --help` expose `--codec hevc|av1` seulement ; **depth 8 = H.264 par défaut**. Le master sera donc `--depth 8 --bitrate 10M` sans `--codec` (même résultat H.264, aucune substitution).
5. **Captions karaoké** : dessinées en nœuds texte natifs Higgsedit, calées sur les timestamps Whisper. Le burner du workflow `subtitles` interdit le karaoké, donc je ne l'utilise pas.

## Timeline (timecodes source → remappés après jump cuts)

### HOOK — 0,45 → 8,6 s
- Voix : « S'il vous plaît, **arrêtez** de vous associer par-ci, par-là, chaque fois que vous avez un projet. »
- **Titre animé 0–3 s** (tokens mot par mot, scale 0,9 → 1, ease-out) dans la bande buste : **« ARRÊTEZ DE VOUS ASSOCIER »**, « ARRÊTEZ » en accent. Captions masquées pendant le titre (pas de doublon), puis cut franc.
- Punch-in 100 → 108 % sur « **arrêtez** » (2,28 s).
- Schéma : aucun (le titre suffit).

### IDÉE 1 — Collaborer ≠ s'associer — 8,94 → 12,2 s
- Mot-clé : **COLLABORER ≠ S'ASSOCIER**
- Transition d'entrée : zoom-whip 6 images sur « Honnêtement ».
- Carte pop à 9,86 (« collaborer ») : rect arrondi sombre 80 % + texte tokenisé, « ≠ » en accent ; spring 0,35 s, 2,2 s à l'écran, sortie 0,25 s.

### IDÉE 2 — On s'associe par peur, et ça déborde — 12,2 → 25,0 s
- Mots-clés : **PEUR D'ÊTRE SEUL** · **ampleur**
- Carte pop à 15,9 (« peur d'être seul ») + icône Lucide `user` (personne seule), 2,4 s.
- Punch-in sur « **tellement** » (18,76).
- **Schéma 1 — courbe qui monte et sort du cadre** : démarre à 22,76 (« prendre des ampleurs »), tracé terminé en 1,3 s, trait accent 4 px, petite flèche au bout ; fondu 0,3 s à 24,98 (« gérer »).

### IDÉE 3 — S'associer = un mariage — 25,3 → 33,3 s
- Transition : zoom-whip sur « parce que s'associer ».
- Mot-clé : **S'ASSOCIER = UN MARIAGE**, carte pop à 26,7 (« mariage ») + icône Lucide `gem` (bague), 2,5 s.
- Punch-in sur « **combien de fois ?** » (31,46).
- Carte question courte à 31,46 : **« COMBIEN DE FOIS ? »**, 1,8 s.

### IDÉE 4 — La méthode : tester → collaborer → s'associer — 33,7 → 44,7 s
- Transition : zoom-whip sur « Essayez d'abord ».
- **Schéma 2 — 3 blocs reliés** (contours accent 3 px, sans fill, libellés blancs) :
  - bloc 1 **TESTER** qui se dessine à 34,38 (« tester »)
  - flèche + bloc 2 **COLLABORER** à 35,46 (« collaborer »)
  - flèche + bloc 3 **S'ASSOCIER** à 43,10 (« s'associer »), fondu 0,3 s à 44,74
  - Chaque tracé finit ≤ 1,2 s après son mot.
- Entre 37,6 et 41,9 (« périodes basses / hautes ») le schéma reste affiché en retrait : pas de 2e graphique (max 1 élément à la fois).
- Punch-in sur « **ensuite** » (42,3).

### CLÔTURE — Pas au premier coup d'œil — 44,9 → 49,4 s
- Mot-clé : **PAS AU 1ᵉʳ COUP D'ŒIL**, carte pop à 46,54 (« premier ») + icône Lucide `eye`, 2,2 s.
- Punch-in léger sur « **déçu** » (48,64).

### CTA — 2 s après la dernière phrase
- Fond flou/assombri de la dernière image, texte **« Abonne-toi pour la suite »** + icône Lucide `bell`, entrée spring, fondu au noir 0,4 s.
- *(Si tu me donnes la MARQUE, j'ajoute « @marque » sous le CTA.)*

## Rythme global
- Jump cuts sur les 12 silences (≈ −4,4 s).
- Punch-ins : 5 (2,3 / 18,8 / 31,5 / 42,3 / 48,6 s), jamais à moins de 4 s d'écart, ease-out 0,25 s, on revient à 100 % au cut suivant.
- Micro-mouvement caméra 2.5D : dérive continue 100 → 102 % + ±6 px sur la durée de chaque idée.
- Captions : 3 à 5 mots par groupe, Montserrat 800 / 68 px, blanc, mot actif en `#F2B544`, ombre douce 0/4/18, bande y 1400–1560.
- Effets : grain GLSL 0,03, vignette 12 %, ombre portée sur les cartes. Pas de glitch, pas de SFX.

## Son
`afftdn=nf=-25` → `highpass=f=80` → `deesser` → `acompressor ratio=3:attack=5:release=80` → `loudnorm I=-14:TP=-1:LRA=7` (2 passes), puis jump cuts appliqués à l'audio et à la vidéo au même échantillon près. Pas de musique.

## QA prévue
Contact sheet (hook, 4 idées, CTA) · 3 frames les plus chargées (≈ 35,5 / 43,2 / 46,6 s) · drift caption/voix < 80 ms · draft puis master 1080×1920 30 fps H.264 10 Mb/s AAC 192k faststart · −14 ±1 LUFS · virality_predictor.

---

## Exécution — timeline finale (après jump cuts, en secondes du master)

Variables appliquées : pas de marque (CTA générique) · palette `#0F0F12` / `#FFFFFF` / `#F2B544` · Montserrat 700 (seule graisse Bold livrée avec Higgsedit) · pas de musique · upscale Topaz 1080p.

| t (s) | Élément | Détail |
|---|---|---|
| 0,00 → 3,00 | Hook | Plaque sombre + « S'il vous plaît, » → **ARRÊTEZ** (1,48 s) → « de vous associer » (2,00 s), cut franc à 3,00 |
| 1,48 | Punch-in | 100 → 108 % sur « arrêtez » |
| 4,06 → 44,67 | Captions | 50 groupes karaoké (3–5 mots), mot actif `#F2B544`, +60 ms de décalage mesuré |
| 7,24 | Zoom-whip | 6 images, motion blur natif 8 samples, entrée idée 1 |
| 8,16 → 10,36 | Carte | COLLABORER **≠** S'ASSOCIER |
| 13,60 → 16,00 | Carte + icône `user` | PEUR D'ÊTRE **SEUL** |
| 16,46 | Punch-in | « tellement » |
| 20,13 → 22,65 | Schéma 1 | Ligne pointillée « ce que vous gérez » + courbe accent qui la dépasse (tracé 0,35 → 1,45 s), flèche, fondu 0,3 s |
| 22,69 | Zoom-whip | entrée idée 3 |
| 24,07 → 26,57 | Carte + icône `gem` | S'ASSOCIER = **UN MARIAGE** |
| 28,13 | Punch-in + carte | COMBIEN DE **FOIS ?** (1,6 s) |
| 29,65 | Zoom-whip | entrée idée 4 |
| 30,31 → 40,57 | Schéma 2 | TESTER (30,31) → COLLABORER (31,39) → **S'ASSOCIER** (38,63), chaque bloc tracé en 0,6 s, fondu 0,3 s |
| 37,84 | Punch-in | « ensuite » |
| 40,45 | Zoom-whip | entrée clôture |
| 42,07 → 44,27 | Carte + icône `eye` | PAS AU **1ER COUP D'ŒIL** |
| 43,84 | Punch-in | « déçu » |
| 44,67 → 46,67 | CTA | Cloche + « Abonne-toi pour la suite » + « Collaborer d'abord. S'associer ensuite. », fondu au noir 0,4 s |

Chaîne image : grain GLSL 0,03 + vignette 14 % sur la vidéo, micro-dérive verticale ±5 px, scrim dégradé bas (0 → 55 %) pour la lisibilité des captions sur le blazer blanc, ombre portée sur toutes les cartes et plaques.

---

## Module B — son studio + incrustations réelles

### Étape A (faite)
Voix refaite avec DeepFilterNet3 + Pedalboard + de-esser + loudnorm : voir `audio/AVANT_APRES.md`. Master v2 = même image, nouvelle voix (−14,2 LUFS, −3,9 dBTP).

### Étape B — incrustations réelles (faites, clé Pexels fournie)
| Idée | Déclencheur | Incrustation | Asset | In → out (master v4) |
|---|---|---|---|---|
| Hook | — | aucune B-roll (règle) | — | — |
| 1. Collaborer ≠ s'associer | « mon **cabinet**, des gens qui s'associent » | B-roll Pexels plein cadre, fondu 8 images, push-in 100→104 %, cut franc retour | Yan Krukau #7691589 | 11,17 → 13,45 |
| 3. S'associer = mariage | « vous vous mariez combien de fois ? » | B-roll Pexels plein cadre (même traitement) | Ebahir #38359909 | 26,68 → 29,45 |
| Écrans iOS / desktop | aucun site ni outil cité | sans objet | — | — |

La carte « COMBIEN DE FOIS ? » est retirée : elle tombait sur la B-roll alliances, et on ne garde qu'une incrustation à la fois. La question reste dans les sous-titres. La personne est à l'écran en plein cadre environ 77 % du temps, 85 % en comptant le PIP du hook.

## Module C — mockups animés

### C3 — déclencheurs trouvés dans `transcript.json`
| Idée | Mots | Déclencheur C3 | Choix |
|---|---|---|---|
| Hook | « S'il vous plaît, arrêtez de vous associer » | aucun (hook) | **Typo cinétique (C2-11)**, natif Higgsedit : 4 groupes de mots, un par temps, scale 1,18→1 + blur 14→0 en 0,2 s, « ARRÊTEZ » en accent, fond `#0F0F12`, visage en PIP 260 px avec anneau accent. 0 → 3,6 s (au lieu de 3 s pour que « ASSOCIER » ait le temps d'être lu). Objectif : relever le score d'accroche (34/100). |
| 1 | « collaborer, mais sans vous associer » | « au lieu de » faible | pas de mockup : la carte native COLLABORER ≠ S'ASSOCIER suffit, et la B-roll arrive juste après |
| 2 | « prendre des ampleurs qu'on n'arrive pas à gérer » | pas de chiffre | schéma natif « courbe » conservé |
| 3 | « combien de fois ? » | « fois » → compteur | **refusé** : aucun chiffre réel dans le script, un compteur inventerait une donnée |
| 4 | « d'**abord** tester… collaborer… périodes basses… hautes… **ensuite** s'associer » | « d'abord / ensuite » → checklist | **Checklist (C2-4)** : 5 items tirés mot pour mot du script, chaque coche se trace (0,3 s) sur son mot, l'item se barre, le dernier en accent. Remplace le schéma à 3 blocs. 30,16 → 40,57 s, démarre 150 ms avant « tester ». |
| Clôture | « au premier coup d'œil » | aucun | carte native conservée |
| Google / message / notification / carte | — | absents du script | sans objet |

Total : 1 mockup HTML + 1 typo cinétique (≤ 4 par reel).

### C4 — règles appliquées
- Un seul easing pour toutes les animations Higgsedit : `cubic-bezier(0.2, 0.8, 0.2, 1)`. Même courbe dans le mockup HTML.
- Spring `stiffness 300 / damping 24` seulement pour l'entrée du mockup (et la cloche du CTA).
- Entrées 0,2–0,4 s, sorties 0,25 s.
- Checklist : ombre 40 px / 30 %, micro-parallax ±2 px.

Exceptions techniques :
- Le `motion.by` des textes Higgsedit n'accepte que `ease-out`/`house`/`linear` : le CTA garde `ease-out`.
- Les coupes et le « hold » restent en paliers.
- Le mockup est rendu image par image par une fonction `renderAt(t)` déterministe (`page.clock.install()` fige l'horloge). Chaque frame est calculée exactement, au lieu de dépendre de `runFor`.
