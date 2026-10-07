# SCENES — Reel split-screen « Holding : régime mère-fille » (version finale exécutée)

## Source
| | |
|---|---|
| Fichier | Drive `1yi49XYQaRQy9ChGcAY-Y_ZY9cyGse-YZ` (QuickTime, 93,9 Mo) |
| Vidéo | 1080×1920, 59,94 fps, 51,87 s. **L'image utile n'occupe que le haut : 1080×1036 (y 2 → 1038)**, le bas est noir. |
| Plan | Plan fixe « podcast » : bureau, micro, fenêtre. Visage ≈ 250 px de large, centre x ≈ 470–650, yeux y ≈ 160–230. |
| Audio | AAC stéréo 44,1 kHz, −20,3 LUFS, true peak −0,5 dB, LRA 8,8 |
| Transcription | faster-whisper medium, mot à mot, 51,5 s de parole |
| Jump cuts | 5 pauses de plus de 0,45 s coupées (120 ms de respiration gardée) : 51,8 s → **49,87 s de parole + end card 2 s = 51,9 s** |

## Variables (validées)
| Variable | Proposition |
|---|---|
| PALETTE | fond `#FFFFFF` · texte `#111111` · **accent `#0B6E4F`** (vert émeraude : holding, gain, coches) · **accent2 `#D1453B`** (rouge : impôt, perte, croix). Ces deux couleurs sont lisibles sur blanc (contraste ≥ 4,5:1), l'or du reel précédent ne l'était pas. |
| TYPO | Montserrat ExtraBold (titres, captions) + SemiBold (corps). Il faudra charger les fichiers 800 et 600, Higgsedit n'embarque que le 700. |
| Lower third 0–3 s | **Aucun** : ni prénom ni titre fournis |
| MARQUE / HANDLE | **Aucun** : end card sans handle, zone morte y 1570–1920 laissée vide |
| Musique | aucune |

## Points à trancher
1. **« régime maire »** : Whisper a entendu « le régime maire ». C'est le **régime mère-fille**. J'écris « régime mère-fille » à l'écran, sauf si tu préfères « régime mère ».
2. Autres corrections : « ses dividendes » → « **ces** dividendes », « celle d'Au-dessus » → « celle **du** dessus ».
3. **Zoom de la zone A : 154 % au lieu de 105 %.** Le brief demande à la fois « yeux à y ≈ 300 » et un « cadrage serré ». Les yeux sont à y ≈ 190 dans la source. À 105 %, ils tomberaient vers y ≈ 200, et on verrait tout le bureau et le micro. À 154 %, les yeux sont à y ≈ 300 et le cadre va de la tête au buste : c'est le cadrage serré demandé. L'agrandissement adoucit un peu l'image, sans problème visible sur un visage. Je peux ajouter un upscale Topaz si tu veux plus de piqué (crédits Higgsfield).
4. **Chiffres** : n'apparaissent à l'écran que ceux qu'elle prononce (100 000 €, 30 %, 70 000 €, 30 000 €, 2 ans, 5 %, 95 %, 5 000 €). Je ne compare **pas** « 30 000 € d'impôt » à « 5 000 € réintégrés » : ce ne sont pas les mêmes grandeurs (5 000 € est une base imposable, pas un impôt), le comparatif serait trompeur.

## Layout (fixe)
Zone A visage y 0–760 · séparateur y 760 (trait accent 3 px + barre de progression) · captions y 800–900 · stage y 940–1540 (936×600) · zone morte y 1570–1920 (handle à y 1610, opacité 40 %).

## Storyboard (temps sur la timeline montée, en secondes)
Anticipation : chaque effet démarre 150 ms avant son mot déclencheur (colonne « déclencheur »).

| # | t_in → t_out | Phrase dite | Déclencheur (t) | Effet HÉROS | Éléments secondaires | Transition de sortie |
|---|---|---|---|---|---|---|
| 1 | 0,00 → 4,40 | « Tu n'as pas de holding. C'est 100 000 € qui arrivent sur ton compte personnel. » | « 100 » 1,66 | **5 Compteur** 0 → 100 000 € (digit roll, expo-out 1,2 s) | Étiquette « SANS HOLDING » en accent2 dès 0,00 · icône `wallet` + « Compte perso » à 3,27 · lower third zone A 0–3 s | Swipe latéral + motion blur |
| 2 | 4,40 → 6,80 | « En France, ils passent par la flat tax. » | « flat » 6,11 | **3 Flux A → B** : carte « 100 000 € » → trait pointillé qui circule → carte « Flat tax » (accent2, icône `landmark`) | — | Morph : la carte « Flat tax » devient l'en-tête du reçu |
| 3 | 6,80 → 9,90 | « 30 %. Il te reste 70 000 €. » | « 30 % » 6,89 · « 70 » 8,57 | **10 Pile / reçu** : « Dividendes 100 000 € » · « Flat tax 30 % −30 000 € » · total « Il te reste 70 000 € » qui claque | **12 Impact n°1** sur « 30 % » (onde + particules accent2) | — (même scène visuelle) |
| 4 | 9,90 → 13,30 | « 30 000 € sont partis. Définitivement. » | « partis » 12,01 · « Définitivement » 12,71 | **7 Anti-checklist** : la ligne « −30 000 € » reçoit une croix rouge tracée (0,25 s), grise et tremble de 2 px | Tampon « DÉFINITIVEMENT » (mot cinétique) | Wipe par barre accent (vert) : on bascule au scénario 2 |
| 5 | 13,30 → 15,50 | « Scénario 2. Tu as une holding. » | « Scénario » 13,55 · « holding » 14,93 | **1 Mot-clé cinétique** « SCÉNARIO 2 » (scale 1,4 → 1, soulignement accent tracé) | Carte « Ta holding » (icône `building-2`) qui pop en spring | Morph : la carte holding monte en haut du stage |
| 6 | 15,50 → 20,00 | « Et cette holding détient ta société depuis au moins 2 ans. » | « détient » 16,65 · « 2 ans » 19,37 | **2 Schéma dessiné** : flèche marqueur tracée de « Holding » (haut) vers « Ta société » (bas, icône `briefcase`), nœuds qui popent | Badge « ≥ 2 ans » (icône `calendar`) | — |
| 7 | 20,00 → 23,80 | « Avec minimum 5 % du capital. » | « 5 % » 21,29 | **7 Checklist** des conditions : ✓ « Détention ≥ 2 ans » (cochée à 20,00), ✓ « ≥ 5 % du capital » (cochée à 21,14) | Mini-compteur « 5 % » dans la ligne | Iris |
| 8 | 23,80 → 28,20 | « Là, tu peux activer ce qu'on appelle le régime mère-fille. » | « activer » 25,03 · « régime » 26,85 | **1 Mot-clé cinétique** « RÉGIME MÈRE-FILLE » + soulignement tracé | **12 Impact n°2** sur « activer » (icône `toggle-right` qui bascule) | Swipe latéral |
| 9 | 28,20 → 35,60 | « Et ce régime dit une chose très simple. Quand une filiale verse des dividendes à sa société mère, » | « filiale » 32,49 · « verse » 33,03 · « mère » 35,19 | **3 Flux vertical** : carte « Filiale » (bas) → pointillé où circulent des « € » vers le haut → carte « Société mère » (haut) | Titre « 1 règle simple » à 28,2 (≤ 3 éléments visibles) | Morph : la carte « Société mère » grossit |
| 10 | 35,60 → 41,00 | « celle du dessus, ces dividendes sont exonérés à 95 %. » | « dessus » 36,15 · « 95 % » 39,36 | **5 Compteur** 0 → 95 % (roll) + jauge qui se remplit en vert | Flèche vers le haut « celle du dessus » · **12 Impact n°3** sur « 95 % » | Wipe barre accent |
| 11 | 41,00 → 46,40 | « Concrètement sur 100 000 €, seuls 5 000 € sont réintégrés » | « 100 » 42,42 · « 5 000 » 43,99 · « réintégrés » 45,55 | **6 Barres** : barre « 100 000 € » qui pousse (élastique), puis seule une tranche « 5 000 € » reste en accent, avec l'étiquette « réintégrés » | Le reste de la barre passe en gris clair « exonéré » | Swipe latéral |
| 12 | 46,40 → 49,87 | « dans le résultat imposable de la holding. » | « résultat » 46,93 · « holding » 49,37 | **10 Reçu final** : « Résultat imposable de la holding : + 5 000 € » qui claque | **13 Confetti** court (vert + blanc cassé, 0,8 s) à 49,2 : résolution positive | Fondu vers l'end card |
| End | 49,87 → 51,87 | — | — | End card plein canvas : logo/marque, CTA, handle | — | Fondu au blanc |

Impacts : 3 (limite du brief). Transitions : jamais deux fois la même à la suite.

## Zone A (visage)
- Recadrage 154 % centré visage : centre horizontal lissé (passe-bas sur 4 s, zéro jitter), yeux à y ≈ 300.
- Punch-in 100 → 106 % sur les mots forts, un toutes les 4 à 6 s : « holding » 0,98 · « 30 % » 6,89 · « Définitivement » 12,71 · « 2 ans » 19,37 · « activer » 25,03 · « 95 % » 39,36 · « 5 000 » 43,99 · « holding » 49,37.
- Micro-pulse de 2 px synchronisé aux 3 impacts du stage.
- Étalonnage : contraste +5 %, saturation −5 %.

## Son
Module A complet : DeepFilterNet3 → Pedalboard → de-esser → loudnorm à −14 LUFS, avec un tableau AVANT/APRÈS et un fichier `ab_compare.wav`.

## QA prévue
- Contact sheet : une image par scène, plus le hook et l'end card.
- Script « zéro statique » sur la région du stage (aucune fenêtre de plus de 1,2 s sans mouvement).
- Synchro captions/voix sous 80 ms, et avance des effets de 100 à 200 ms, vérifiée sur 5 scènes.
- Stabilité des yeux : ±20 px.
- Master à −14 ±1 LUFS.

## Écarts entre le storyboard validé et le montage final
| Point | Storyboard | Final | Raison |
|---|---|---|---|
| Frontière scènes 2 → 3 | 6,80 s | **6,70 s** | « 30 % » tombe à 6,89 s : la ligne de l'impôt doit arriver à 6,74 s (150 ms d'avance), donc le reçu doit déjà être à l'écran |
| Dérive 2.5D | échelle + position 1–2 % | **position seule** (±4 px en x, 10 px en y par scène) | Higgsedit refuse qu'un parent anime l'échelle quand ses enfants ont un pop en ressort sur l'échelle (« one owner per property ») |
| Séparateur | trait 3 px OU ombre 24 px + barre de progression | **ombre douce 24 px + barre de progression accent 6 px** sur toute la durée | |
| Scène 9 | titre « 1 règle simple » réduit en haut | le titre **sort** à « filiale » (32,24 s) | sinon le flux vertical passait sur le mot « simple » ; le stage reste à 3 éléments maximum |
| Scène 11 | entrée en swipe | **pas d'entrée propre** : le wipe de 41,00 s fait la transition | deux transitions empilées sur la même coupe |
| Scène 8 | « activé » à droite du toggle | « activé » **sous** le toggle | chevauchait l'icône |
| Tampon « DÉFINITIVEMENT » | sur la ligne −30 000 € | posé en travers du haut du reçu | laisse lisibles la croix rouge et « Il te reste 70 000 € » |
| Captions | — | décalage +20 ms | le brouillon avec +60 ms (valeur du reel 1) donnait un biais de +37 ms |
| End card | logo/marque, CTA, handle | cloche + « Abonne-toi » + « Régime mère-fille : 95 % exonérés » | pas de marque ni de handle fournis |

Les chiffres à l'écran restent ceux prononcés : 100 000 €, 30 %, 70 000 €, 30 000 €, 2 ans, 5 %, 95 %, 5 000 €. La partie grise de la barre (scène 11) porte seulement « exonéré », sans montant, parce que « 95 000 € » n'est pas dit.
