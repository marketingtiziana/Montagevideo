# Reel 7 — « TVA & formation en ligne » : plan de coupes (à valider avec ILLUSTRATIONS.md)

**Source** : 1080×1920, 59,94 fps (en réalité ~25 images uniques/s, dupliquées), 99,3 s.
**Montage proposé** : **57,5 s**, 10 coupes (1 toutes les 5,8 s, écart mini 1,9 s). Si la coupe 2 échoue à l'audit : **59,8 s** (voir la règle de repli).

## Mesures utilisées (`prep.py`)

| Mesure | Fichier | Méthode |
|---|---|---|
| Mots + confiance | `transcript.json` | faster-whisper large-v3, mot à mot, puis re-transcription du montage (`transcript_cut.json`) |
| Pauses | `pauses.json` | `silencedetect -32 dB:d=0.25`, uniquement les silences qui tombent **entre deux mots** : 41 pauses |
| Tête | `faces_raw.json`, `face_track.json` | mediapipe FaceLandmarker 4×/s (nez, yeux, bouche, rotation, ouverture des yeux), puis détection **à l'image près** sur les deux images de chaque raccord |
| Mouvement | `motion.json` | flux optique Farneback par image ; énergie cumulée sur ±0,2 s. Seuil « immobile » = 1,5 × le 40ᵉ percentile du clip (9,2) |

À chaque coupe, je garde **150 à 250 ms de silence** au raccord, dont au moins 60 ms de chaque côté des phonèmes. Le point de coupe est cherché image par image dans la pause : je retiens le couple sortie / entrée qui minimise le déplacement du nez, en refusant tout clignement (ouverture < 0,15) et tout geste en cours. La voix est raccordée par un **fondu enchaîné de 25 ms**, la durée reste identique à l'image.

## Accidents de parole détectés

| t source | Type | Décision |
|---|---|---|
| 38,06 → 40,92 | **Faux départ** : « Donc, quand tu veux… donc » puis reprise « quand tu vends dans trois pays » | **Retiré** (coupe 4). Aucune pause n'existe juste avant la reprise, donc la coupe part de la fin de phrase précédente (« …du pays du client. »). « Et chaque pays a son taux. 19 % l'Allemagne, 21 % la Belgique, 23 %, 20 %. » part avec. Les deux derniers taux étaient dits sans pays, ce qui aurait été trompeur à l'écran. |
| 0,00 « Comment » (confiance 0,42 à 0,64) | Attaque du premier mot | **Gardé** : c'est le début du fichier, rien à retirer, le mot est complet. |
| 2,40 « d'entreprise » (confiance 0,29 à 0,43) | Mot incertain | **Gardé** : pas de reprise, ce n'est pas une bafouille. Le large-v3 en lecture directe et le medium entendent « **dans trois pays** », ce qui colle au sujet. **Sous-titre : « dans trois pays », à confirmer (question 1).** |
| 57,16 « à » (confiance 0,37) | Mot incertain | **Gardé**. La re-transcription du montage entend « c'est **de** facturer » : c'est ce texte qui sert aux sous-titres. |
| 65,72 / 89,88 « ne » (confiance 0,45 / 0,56) | Négation avalée | **Gardé** (pas de reprise). |
| 45,34 « Trois… trois » | Répétition voulue (anaphore), pas un accident | Sans objet : la phrase fait partie de la coupe 5. |
| « euh / hum / bah / genre » | — | **Aucun** dans le rush. |

## Coupes

Niveaux : **a** coupe propre (< 25 px, corps immobile, pas de clignement) avec punch-in 104 % sur le côté sortant · **b** coupe sous couverture (25–60 px) · **c** morph (60–90 px) · **d** on garde.

| # | t sortie (montage) | Source sortie → entrée | Retiré | Ce qui part | Tête (nez / yeux) | Rotation | Mvt sortie / entrée | Yeux ouverts | Niveau | Raccord |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 7,32 | 7,32 → 11,99 | 4,67 s | « Tu vends ta formation en ligne. Un client en Belgique, un en France, un en Suisse. » | 13 / 20 px | 0,002 | 7,2 / 9,0 | 0,30 / 0,31 | **a** | punch-in 104 % sur « …ce cas. » |
| 2 | 14,85 | 19,53 → 21,77 | 2,25 s | silence de 2,45 s après « …tout le monde se plante. », ramené à 0,20 s | 69 / 43 px | 0,114 | 1,3 / 6,6 | 0,29 / 0,20 | **c** | morph optique sur les 2 images de raccord, sous la typographie cinétique « SE PLANTE » (élément 13). Repli : voir la règle plus bas. |
| 3 | 19,26 | 26,18 → 26,33 | 0,15 s | respiration « simple, \| mais » (0,39 → 0,24 s) | 8 / 7 px | 0,006 | 1,9 / 3,1 | 0,32 / 0,32 | **a** | punch-in 104 % |
| 4 | 25,19 | 32,26 → 40,78 | 8,51 s | « Et chaque pays a son taux. 19 % l'Allemagne, 21 % la Belgique, 23 %, 20 %. Donc, quand tu veux… donc » (faux départ) | 46 / 46 px | 0,029 | 6,2 / 3,5 | 0,33 / 0,31 | **b** | zoom-whip 5 images + motion blur sur la fin de phrase « …du pays du client. », justifié par les 3 drapeaux qui arrivent sur « trois pays » |
| 5 | 29,71 | 45,30 → 55,58 | 10,29 s | « Trois taux différents, trois États qui attendent chacun leur part. Et si tu vends à une entreprise… une autre règle. Tu vois le niveau un peu ? » | 49 / 27 px | 0,163 | 5,2 / 3,2 | 0,21 / 0,38 | **b** | zoom-whip 5 images sur la fin de phrase « …tu en as trois. », justifié par l'arrivée du « piège » (croix) |
| 6 | 34,23 | 60,10 → 60,31 | 0,21 s | respiration « tout. \| L'argent » (0,45 → 0,24 s) | 9 / 3 px | 0,002 | 2,3 / 2,7 | 0,29 / 0,30 | **a** | punch-in 104 % |
| 7 | 36,10 | 62,18 → 62,72 | 0,54 s | pause « récolter, \| l'État » (0,74 → 0,20 s) | 22 / 18 px | 0,010 | 1,7 / 3,4 | 0,25 / 0,29 | **a** | punch-in 104 % |
| 8 | 41,03 | 67,66 → 68,03 | 0,37 s | respiration « poche. \| La bonne nouvelle » (0,57 → 0,20 s) | 13 / 8 px | 0,003 | 1,7 / 6,8 | 0,28 / 0,30 | **a** | punch-in 104 % |
| 9 | 45,24 | 72,23 → 77,61 | 5,38 s | « Tu déclares toute cette TVA européenne au même endroit, en une seule déclaration. » | 41 / 34 px | 0,008 | 2,6 / 2,2 | 0,16 / 0,27 | **b** | sous la fenêtre impots.gouv.fr plein cadre : zoom-through (élément 4) sur « système… », qui sort sur « guichet unique » |
| 10 | 47,34 | 79,71 → 88,01 | 8,31 s | « Encore faut-il savoir que ça existe et le mettre en place correctement. Et c'est exactement ce qu'on gère dès le départ. » | 41 / 88 px (la tête s'incline) | 0,215 | 2,4 / 7,9 | 0,29 / 0,33 | **b** | la fenêtre « guichet unique » reste plein cadre au raccord ; la caméra ressort de la fenêtre vers le visage juste après |

Les coupes 1, 5, 9 et 10 sont des **coupes de contenu** (pour tenir sous 60 s), pas des accidents. Elles suivent quand même la même échelle a → b → c → d, et je n'ai retenu que des raccords de niveau a ou b. Les autres découpages possibles mesuraient 64 à 131 px, par exemple retirer « Je vais te dire le truc… » (73 px) ou « Pour une formation en ligne vendue à un particulier… » (112 px).

**Contrôles globaux**
- 10 coupes pour 57,5 s, soit 1 toutes les 5,8 s (maximum : 1 toutes les 3 s).
- Écart minimal entre deux coupes : 1,87 s (minimum : 1,2 s).
- Aucune coupe dans un mot, aucune pendant un clignement.

**Règle de repli de la coupe 2 (décidée maintenant, pour ne pas revenir vers toi)** : si le morph déforme le visage ou les mains à l'audit, la coupe 2 passe en **d**.
- Les 2,45 s de silence restent.
- La typographie cinétique « TOUT LE MONDE SE PLANTE » occupe ce silence, un mot par temps, de façon à ce que le cadre ne soit jamais statique.
- Le montage fait alors 59,8 s, toujours sous 60 s.

## Audit (Phase 5, bloquant)

Pour chaque coupe :
1. RMS de la voix < −32 dB sur les 60 ms avant et après le raccord.
2. Déplacement du nez re-mesuré sur les deux images de raccord du rendu 60 fps interpolé.
3. Rendu de 1 s à 0,25× et planche de 8 images.
4. Re-transcription des 2 s autour de la coupe : les mots avant et après doivent être intacts.

Une coupe qui échoue descend d'un niveau et repasse l'audit. Les résultats seront ajoutés dans ce fichier à la livraison.
