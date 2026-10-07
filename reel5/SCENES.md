# SCENES — Reel split-screen « La substance » (version finale exécutée)

## Source
| | |
|---|---|
| Fichier | Drive `1D1kaKlB8RVGBDE5TpYvmEGtT96W2LQMi` (`tintin.mp4`, 114,3 Mo) |
| Vidéo | 1080×1920, 59,94 fps, 65,08 s. **Comme pour le reel 2, l'image utile n'occupe que le haut : 1080×1090 (y 0 → 1090)**, le bas est noir. |
| Plan | Même plan fixe « podcast » que le reel 2 : bureau, micro, fenêtre. Visage ≈ 240 px de large, centre x ≈ 490–580, yeux y ≈ 155–230 (66/66 détections à 1 image/s). |
| Audio | AAC stéréo 44,1 kHz, −22,4 LUFS |
| Transcription | faster-whisper large-v3, mot à mot (`transcript.json`), 64,9 s de parole |
| Jump cuts | 21 pauses de plus de 0,28 s raccourcies, 100 ms de respiration gardées de chaque côté (`prep.py`, `cuts.json`) |
| Durée | 57,83 s de parole + end card 2 s = **59,83 s** (avec la coupe proposée au point 1) |

## Points tranchés (validés)
1. **Durée.** Sans coupe de texte, les pauses raccourcies donnent 59,75 s de parole. Avec l'end card de 2 s, on arrive à **61,8 s**, au-dessus des 60 s du brief.
   - **Validé :** couper la phrase « Et c'est toujours la même chose. » (source 6,78 → 9,32 s). Elle redit la phrase précédente. On tombe alors à **59,83 s**, et la suite reste fluide : « …ce qui manque à chaque fois. Une vidéo t'apprend… ».
   - Si tu préfères garder la phrase, le reel fera 61,8 s.
2. **Correction de transcription.** Whisper a entendu « le fils que le voit ». J'écris **« le fisc, lui, le voit »** à l'écran.
3. **Zoom de la zone A : 155 % au lieu de 105 %**, comme pour le reel 2.
   - Les yeux sont à y ≈ 192 dans la source. À 105 %, ils restent vers y ≈ 200.
   - À 155 %, ils arrivent à y ≈ 300, avec un cadre tête-buste serré.
4. **Variables non fournies.** Je reprends les choix validés au reel 2 :
   - palette : accent `#0B6E4F` (vert : substance, preuves, coches) et accent2 `#D1453B` (rouge : redressement, fisc, croix) ;
   - pas de lower third (ni prénom ni titre fournis) ;
   - pas de handle ;
   - end card sans marque.
5. **« YouTube ».** Pas de logo YouTube ni d'interface imitée. La scène 1 montre une carte « tuto vidéo » neutre (icône Lucide `play`).

## Variables
| Variable | Valeur |
|---|---|
| PALETTE | fond `#FFFFFF` · texte `#111111` · accent `#0B6E4F` · accent2 `#D1453B` |
| TYPO | Montserrat ExtraBold 800 (titres, captions 58 px) + SemiBold 600 (corps) |
| LANGUE | fr |
| MARQUE / HANDLE | aucun : zone morte y 1570–1920 laissée vide |
| Musique / SFX | aucune musique (non fournie), voix seule après le Module A |

## Layout (fixe)
- **Zone A (visage) :** y 0–760.
- **Séparateur :** y 760, ombre douce 24 px et barre de progression accent 6 px.
- **Captions :** y 800–900, karaoké de 3 à 5 mots, le mot actif en accent.
- **Stage :** y 940–1540, soit 936×600.
- **Zone morte :** y 1570–1920, vide.

## Storyboard (temps sur la timeline montée, en secondes)
Anticipation : chaque effet démarre 150 ms avant son mot déclencheur.

| # | t_in → t_out | Phrase dite | Déclencheur (t) | Effet HÉROS | Éléments secondaires | Transition de sortie |
|---|---|---|---|---|---|---|
| 1 | 0,00 → 3,47 | « Pourquoi les montages que tu trouves sur YouTube finissent en redressement ? » | « montages » 0,46 · « YouTube » 1,60 · « redressement » 2,80 | **1 Mot-clé cinétique** : tampon « REDRESSEMENT » en accent2 qui claque (scale 1,4 → 1, motion blur) et se souligne | Carte « Montage vu en tuto » (icône `play`, 3 blocs empilés) qui entre à 0,31, puis grise et tremble au tampon · **12 Impact n°1** sur « redressement » | Swipe latéral + motion blur |
| 2 | 3,47 → 6,58 | « Je vais te dire ce qui manque à chaque fois. » | « manque » 4,99 | **2 Schéma dessiné** : puzzle de 3 pièces tracé au marqueur, la 3ᵉ pièce reste en pointillés, « ? » qui pop dedans | Icône `puzzle` | Morph : la pièce manquante devient l'écran de la scène 3 |
| 3 | 6,58 → 9,85 | « Une vidéo t'apprend à créer ta société. Tu suis le tuto, » | « vidéo » 6,89 · « créer » 8,17 · « tuto » 9,59 | **11 Mockup** (Module C, HTML → .mov alpha) : cadre téléphone (60 % du stage) avec un lecteur vidéo neutre « Créer ta société en 30 min », barre de lecture qui avance | Pastille « TUTO » (accent) à 9,44 | Wipe par barre accent |
| 4 | 9,85 → 14,70 | « tu remplis les formulaires et en 30 minutes, ta société existe. Tu te dis, c'est bon, je suis optimisé. » | « formulaires » 10,57 · « 30 » 11,49 · « existe » 12,49 · « optimisé » 14,25 | **9 Timeline** : 3 points qui s'allument (« Formulaires » `file-text` · « 30 min » · « Société créée » `building-2`), curseur qui avance | Compteur « 30 min » (roll, chiffre dit) · bulle « C'est bon, je suis optimisé » à 13,42 | Iris |
| 5 | 14,70 → 18,35 | « Sauf que créer la société, c'est la partie facile. C'est celle que tout le monde te montre. » | « Sauf » 14,83 · « facile » 16,31 · « montre » 17,96 | **2 Schéma dessiné : iceberg**. Ligne d'eau tracée, puis pointe émergée « Créer la société » tracée au marqueur | Étiquette « facile » à 16,16 · icône `eye` « tout le monde te montre » à 17,25 | Morph : la caméra 2.5D plonge sous la ligne d'eau |
| 6 | 18,35 → 21,37 | « Ce que personne ne te montre, c'est ce qui doit exister derrière. » | « personne » 18,68 · « derrière » 20,82 | **2 Schéma dessiné (suite)** : la partie immergée, 4 fois plus grande, se trace vers le bas | Icône `eye-off` « personne ne te montre » · « ? » dans la masse immergée | Morph : le « ? » devient le mot de la scène 7 |
| 7 | 21,37 → 24,80 | « Ça s'appelle la substance. La substance, c'est simple. » | « substance » 22,71 · « simple » 24,66 | **1 Mot-clé cinétique** « LA SUBSTANCE » (accent, scale 1,4 → 1, soulignement tracé 0,3 s) | Reprise de la partie immergée en fond (couche arrière, 30 %) | Swipe latéral |
| 8 | 24,80 → 29,88 | « C'est la preuve que ton activité se passe vraiment là où ta société est » | « preuve » 25,28 · « activité » 26,56 · « là où » 28,08 | **2 Schéma dessiné** : épingle « Ta société » (`map-pin`, à droite), l'icône « Ton activité » (`briefcase`) suit un trajet tracé et se pose sur l'épingle | Encadré marqueur tracé autour des deux à « là où » · titre « LA PREUVE » | Morph : l'encadré devient la 1ʳᵉ ligne de la checklist |
| 9 | 29,88 → 33,50 | « et que les décisions se prennent là-bas, que ta vie est là-bas. » | « décisions » 30,55 · « vie » 32,56 · « là-bas » 33,20 | **7 Checklist** « LÀ-BAS » : ✓ Activité (cochée à 29,88) · ✓ Décisions (30,40) · ✓ Ta vie (32,41) | Icônes `briefcase`, `pen-line`, `house` | Wipe par barre accent2 (on bascule sur le problème) |
| 10 | 33,50 → 38,28 | « Le problème, la plupart des gens créent une société à l'étranger et continuent à vivre en France. » | « problème » 33,82 · « étranger » 36,32 · « France » 37,88 | **3 Flux A → B rompu** : carte « Société à l'étranger » (`globe`) ← pointillé qui circule puis se casse → carte « Toi : en France » (`house`) | Mot « LE PROBLÈME » (accent2) à 33,51, puis il sort | Swipe latéral |
| 11 | 38,28 → 41,40 | « Même appartement, même client, même quotidien. » | « appartement » 38,69 · « client » 39,87 · « quotidien » 40,87 | **10 Pile** : 3 lignes qui s'empilent de bas en haut (« Même appartement » `house` · « Même clients » `users` · « Même quotidien » `coffee`), chacune avec une pastille « FRANCE » en accent2 | — | Morph : la pile se compacte en carte « Dans la réalité » |
| 12 | 41,40 → 45,72 | « Sur le papier, la société est anglaise. Dans la réalité, tout se passe en France. » | « papier » 42,03 · « anglaise » 43,29 · « réalité » 44,23 · « France » 45,31 | **8 Comparatif VS** : « SUR LE PAPIER : société anglaise » (`file-text`) contre « DANS LA RÉALITÉ : tout en France » (`map-pin`). Le papier se désature et recule (92 %), la réalité avance avec un halo | « VS » qui pop au centre à 43,90 | Iris |
| 13 | 45,72 → 49,50 | « Et ça, le fisc, lui, le voit. Il ne regarde pas ton adresse de domiciliation. » | « fisc » 46,70 · « voit » 47,18 · « adresse » 48,61 | **7 Anti-checklist** : carte « Adresse de domiciliation » (`mail`) barrée d'une croix rouge tracée (0,25 s), qui grise et tremble de 2 px | Icône `eye` « LE FISC » en accent2 à 46,55 · **12 Impact n°2** sur « voit » | Morph : l'œil devient le centre de la mind-map |
| 14 | 49,50 → 53,92 | « Il regarde où tu vis vraiment, où tu travailles vraiment. Où sont tes intérêts. » | « vis » 50,47 · « travailles » 51,81 · « intérêts » 53,49 | **4 Mind-map radiale** : nœud central `search` « Le fisc regarde », 3 branches tracées au fil de la parole vers « Où tu vis » (`house`), « Où tu travailles » (`briefcase`), « Tes intérêts » (`wallet`) | — | Morph : les 3 feuilles convergent vers l'épingle France |
| 15 | 53,92 → 57,83 | « Et si la réponse, c'est la France, il requalifie ta société. » | « France » 55,99 · « requalifie » 56,62 | **1 Mot-clé cinétique** : tampon « REQUALIFIÉE » (accent2) sur la carte « Ta société anglaise », qui bascule en « Société française » | Épingle « France » à 55,84 · **12 Impact n°3** sur « requalifie » | Fondu vers l'end card |
| End | 57,83 → 59,83 | — | — | End card plein canvas : « La substance, c'est là où tu vis, travailles et décides » + « Abonne-toi » (icône `bell`) | — | — |

**Règles respectées par le storyboard :**
- 3 impacts au total, la limite du brief.
- Pas de confetti : la fin n'est pas une résolution positive.
- Une transition n'est jamais répétée deux fois de suite : swipe, morph, wipe, iris, morph, morph, swipe, morph, wipe, swipe, morph, iris, morph, morph, fondu.
- Les morphs consécutifs (5 → 6 → 7) sont des mouvements différents : plongée caméra, puis « ? » qui devient un mot.

**Conflits de déclencheurs tranchés :**
- Scène 1 : « YouTube » appelle l'effet 11 et « redressement » l'effet 12. Je garde le tampon (1) avec l'impact, car c'est l'accroche.
- Scène 9 : « décisions » et « là-bas » appellent l'effet 4 (lien). Je garde la checklist (7), plus lisible pour 3 preuves.
- Scène 14 : « regarde » appelle l'effet 11. Je garde la mind-map (4), qui montre les 3 critères.
  - Elle compte 4 nœuds (le centre et 3 feuilles). Pour rester à 3 éléments visibles maximum, le titre de la scène 13 sort avant l'arrivée de la 1ʳᵉ feuille.

**Chiffres affichés :** uniquement ceux qu'elle prononce, c'est-à-dire « 30 minutes ». Aucun montant ni taux n'est ajouté.

## Zone A (visage)
- **Recadrage :** 155 % centré sur le visage. Le centre horizontal est lissé (passe-bas sur 4 s, sans jitter) et les yeux sont visés à y ≈ 300.
  - Entre 49 et 52 s dans la source, elle se penche. Le détecteur y décroche (pas d'yeux trouvés), et ces points sont écartés du lissage.
- **Punch-in 100 → 106 %**, toutes les 4 à 6 s :

  | Mot | Temps (s) |
  |---|---|
  | « redressement » | 2,80 |
  | « manque » | 4,99 |
  | « 30 » | 11,49 |
  | « facile » | 16,31 |
  | « substance » | 22,71 |
  | « vraiment » | 27,62 |
  | « là-bas » | 33,20 |
  | « France » | 37,88 |
  | « anglaise » | 43,29 |
  | « voit » | 47,18 |
  | « intérêts » | 53,49 |
  | « requalifie » | 56,62 |

- **Micro-pulse de 2 px** synchronisé aux 3 impacts du stage.
- **Étalonnage :** contraste +5 %, saturation −5 %.

## Son
Module A complet, comme au reel 2 : DeepFilterNet3 → Pedalboard → de-esser → jump cuts à l'échantillon près → loudnorm à −14 LUFS. Livré avec un tableau AVANT/APRÈS et `ab_compare.wav`.

## QA prévue
- `higgsedit sheet` : une image par scène, plus le hook et l'end card.
- Script « zéro statique » sur la région du stage : aucune fenêtre de plus de 1,2 s sans mouvement.
- Synchro captions/voix sous 80 ms, et avance des effets de 100 à 200 ms, vérifiée sur 5 scènes tirées au hasard.
- Stabilité des yeux : ±20 px de y = 300.
- Master à −14 ±1 LUFS.

## Écarts entre le storyboard validé et le montage final

| Point | Storyboard | Final | Raison |
|---|---|---|---|
| Zoom zone A | 155 % fixe | **170 % de base**, montant lentement jusqu'à 192 % quand elle relève la tête | (1) |
| Suivi du visage | détecteur Haar, 1 image/s, lissage 4 s | **YuNet** (repères des yeux), 5 images/s, lissage gaussien 0,5 s puis 0,3 s sur la timeline montée | Haar était trop bruité pour suivre ses mouvements de tête |
| Scène 3 | pastille « TUTO » sur « tuto » (9,59 s) | sur « suis » (9,31 s) | à 9,44 s, elle n'aurait vécu que 0,41 s, moins que son entrée en ressort (0,5 s) |
| Scène 7 | « c'est simple » sur « simple » (24,66 s) | sur « c'est » (24,41 s) | même raison : la scène se termine à 24,80 s |
| Scène 14 | feuille 3 sur « intérêts » (53,49 s) | sur « Où sont tes… » (52,49 s) | « intérêts » tombe 0,4 s avant la fin de la scène, trop tard pour tracer la branche et faire entrer la feuille |
| Transition 14 → 15 | morph (les feuilles convergent vers l'épingle) | **swipe latéral** | la 3ᵉ feuille venait d'apparaître : la faire converger aussitôt la rendait illisible. La règle « jamais deux fois la même transition de suite » reste respectée (morph 13→14, swipe 14→15, fondu vers l'end card) |
| Transition 8 → 9 | morph avec réduction d'échelle | morph par **déplacement + fondu** vers la 1ʳᵉ ligne de la checklist | Higgsedit refuse une échelle animée sur un parent quand les enfants ont leur propre pop en ressort |
| Pops sur des cadres déjà animés | ressort | pop émulé par images clés (0,6 → 1,06 → 1) sur un cadre intérieur | règle « un seul propriétaire par propriété » de Higgsedit |
| Contours ondulés (ligne d'eau) | courbes `T` | courbes `Q` explicites | Higgsedit n'accepte que M/L/H/V/C/Q/Z |

(1) Zoom zone A. Dans la source, ses yeux varient de y 140 à 233 :
- à 170 %, les yeux restent sous y 282 tant qu'elle ne relève pas la tête ;
- quand elle la relève (8,6 % du temps), un zoom fixe ne pourrait pas garder les yeux à 300 ± 20 sans découvrir le bord haut de l'image ;
- le zoom monte donc doucement, lissé, sans à-coup.

Les chiffres affichés restent ceux qu'elle prononce : seulement « 30 min ».
