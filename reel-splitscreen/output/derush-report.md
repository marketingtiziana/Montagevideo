# Dérushage — Reel « société étrangère ≠ fiscalité déplacée » (v3)

**Rush** : `Reel 16M.mp4` (1920×1080, 59,94 fps, 118,4 s) — transcription Whisper large-v3 (fr, word-level) + audit énergétique (bursts de parole / silences à 10–50 ms).
**Timeline finale** : **85,5 s** (2566 frames @ 30 fps).
**Règles appliquées** : reprises calées sur l'attaque de la voix ; **fins de segment calées sur la fin réelle de la voix** (seuil −45 dBFS) + 2 frames ; fondu audio de 15 ms à chaque entrée de segment ; hésitations > 0,8 s et faux départs supprimés.

## Changements v3 (retours à l'écoute)
- **0:08 — attaque de « ce n'est pas »** : l'entrée tombait 30 ms après le début de la fricative de « ce » (ça sonnait comme un « que » coupé). Entrée déplacée dans le creux entre « que » et « ce » (source 20,51 s) + fondu 15 ms.
- **0:17 — « Ce qui… qui compte »** : reprise supprimée. On garde « Ce » (source 39,37 → 39,73) et on raccorde directement sur le second « qui compte » (source 40,14) ; le punch-in change au raccord.
- **0:29 — « intéressant » coupé** : la fin de mot Whisper était 0,35 s trop tôt. Toutes les fins de segment sont maintenant calées sur l'extinction réelle de la voix (« pays. » +0,2 s, « intéressant. » +0,35 s, « business. » +0,17 s, etc.).
- **Sous-titres** remontés entre le bas de l'écran du haut et le haut de la tête (centre à y = 1128) ; recadrage facecam aligné en haut (plus d'air au-dessus de la tête), punch-in ramené à 1,00 ↔ 1,08×.

## Segments conservés (source → finale)

| # | Source (s) | Finale (s) | Durée | Texte | Punch |
|---|-----------|-----------|-------|-------|-------|
| 1 | 0,31 → 5,00 | 0,00 → 4,70 | 4,70 | Hook prise 1 (a) : Tu savais qu'une société étrangère ne suffit pas à déplacer ta fiscalité ? | 1,00× |
| 2 | 5,29 → 8,37 | 4,70 → 7,80 | 3,10 | Hook prise 1 (b) : Et c'est précisément là que beaucoup se font avoir, | 1,08× |
| 3 | 20,51 → 22,70 | 7,80 → 10,00 | 2,20 | ce n'est pas simplement parce | 1,00× |
| 4 | 24,02 → 31,74 | 10,00 → 17,73 | 7,73 | que tu crées une société à Dubaï,,, payer tes impôts dans ce pays, | 1,08× |
| 5 | 39,37 → 39,73 | 17,73 → 18,10 | 0,37 | Ce | 1,00× |
| 6 | 40,14 → 51,60 | 18,10 → 29,57 | 11,47 | qui compte, c'est notamment où tu es résident fiscal,,, ça devient intéressant, | 1,08× |
| 7 | 52,48 → 64,16 | 29,57 → 41,27 | 11,70 | Parce que oui, dans certaines situations,,, plus adaptée à ton business, | 1,00× |
| 8 | 67,12 → 76,89 | 41,27 → 51,07 | 9,80 | Mais dans d'autres situations,,, obligations fiscales dans ton pays de résidence, | 1,08× |
| 9 | 79,65 → 84,86 | 51,07 → 56,30 | 5,23 | Donc, avant de choisir un pays juste parce qu'on t'a promis du 0%, | 1,00× |
| 10 | 86,64 → 91,56 | 56,30 → 61,23 | 4,93 | il faut d'abord regarder ta situation personnelle et ton business dans son ensemble, | 1,08× |
| 11 | 92,49 → 113,99 | 61,23 → 82,73 | 21,50 | Et c'est exactement ce que je fais,,, commente urgence sous cette vidéo, | 1,00× |
| 12 | 115,61 → 118,40 | 82,73 → 85,53 | 2,80 | Je t'enverrai les renseignements en DM, | 1,08× |

## Coupes (source) et raisons

| Source (s) | Contenu | Raison |
|-----------|---------|--------|
| 0,00 → 0,31 | Silence | Amorce. |
| 5,00 → 5,29 | Pause entre « fiscalité ? » et « Et c'est… » | Pause 0,55 s resserrée. |
| 8,37 → 20,51 | Silence + **prise 2 du hook** + « Parce que » | Doublon du hook (prise 1 plus fluide) ; connecteur redondant. |
| 22,70 → 24,02 | Silence au milieu de « parce… que tu crées » | **Hésitation 1,6 s** resserrée. |
| 31,74 → 39,37 | Silence + « Ce qui compte, c'est notamment où tu en es. » | **Faux départ / phrase abandonnée**. |
| 39,73 → 40,14 | Souffle + premier « qui » avorté | **Reprise** (« Ce qui… qui compte »). |
| 51,60 → 52,48 | Silence | Respiration resserrée. |
| 64,16 → 67,12 | Silence | Blanc 3 s resserré. |
| 76,89 → 79,65 | Silence | Blanc 2,8 s resserré. |
| 84,86 → 86,64 | « Il faut d'abord que… » | **Faux départ**. |
| 91,56 → 92,49 | Silence | Respiration resserrée. |
| 113,99 → 115,61 | Silence | Blanc resserré avant la dernière phrase. |

**Total coupé : 32.9 s** (118,4 → 85.5 s).

## Points d'attention
- Whisper lisse les bégaiements et hallucine des mots aux raccords (« que » entendu à 7,8 s alors que l'audio démarre sur « ce ») : les sous-titres sont corrigés à la main à ces endroits.
- « dans son ensemble » (sauté par Whisper sur la timeline finale) réinséré à partir du calage source.
- Orthographe fixée : « 0 % », « DM », « avoir ».
