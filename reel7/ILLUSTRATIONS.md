# Reel 7 — « TVA & formation en ligne » : plan d'illustration (à valider avec CUTS.md)

**Format** : 1080×1920, timeline 60 fps, **57,5 s**. Texte final dans la section 1, coupes dans `CUTS.md`.
**Zones** : visage (nez) entre x 470 et 820, menton au plus bas à y 770.
- Elle bouge latéralement, donc la zone libre fiable est la poitrine et le micro : bande **y 800–1260**, toute la largeur moins 60 px.
- Les éléments n'y couvrent jamais la bouche ni les yeux.
- Sous-titres à y 1300 (1420 quand une fenêtre descend sous 1240).
- Rien dans les 250 px du haut ni dans les 350 px du bas.

## 1. Texte final (timeline montée)

> Comment gérer la TVA quand tu vends une formation **dans trois pays** ? Je vais te dire le truc que personne ne t'explique à propos de ce cas. Toi, tu es en France, donc tu factures ta TVA française, 20 %, à tout le monde. Logique, non ? Eh bien non, c'est là que tout le monde se plante. Pour une formation en ligne vendue à un particulier, la règle est simple, mais quasi personne ne la connaît. La TVA, ce n'est pas celle de ton pays, c'est celle du pays du client. Quand tu vends dans trois pays, tu n'as pas une TVA à gérer, tu en as trois. Le piège, c'est de facturer la mauvaise TVA ou pas de TVA du tout. L'argent que tu aurais dû récolter, l'État te le réclame quand même. Sauf que là, tu ne l'as plus, il sort de ta poche. La bonne nouvelle, c'est qu'il existe un système pour éviter de t'enregistrer dans trois pays. Ça s'appelle le guichet unique. La TVA internationale, ça ne se rattrape pas en panique. Ça se conçoit en même temps que ta structure. Si tu vends à l'international et que tu as un doute, **commente TVA** *(voir question 2)*.

## 2. Illustrations

- **Temps** : timeline montée, en secondes.
- **t_in** : 150 ms avant le mot déclencheur, calé sur une frontière de mot.
- **N°** : numéro de l'élément dans la bibliothèque du brief.

| # | t_in → t_out | Phrase | Déclencheur (t) | N° | Élément | Asset / position |
|---|---|---|---|---|---|---|
| 1 | 0,79 → 2,7 | « Comment gérer la **TVA** » | TVA (0,94) | 9 | Pill verre « TVA » avec icône `receipt` et trait tracé vers le haut de la zone libre | natif · x 380, y 860 |
| 2 | 2,61 → 5,9 | « …une formation **dans trois pays** ? » | trois (2,76) | 8 | 3 tuiles drapeaux en stagger 90 ms (France, Belgique, Suisse : les pays de son exemple dans le rush). Le pill 1 se replie. | drapeaux SVG Wikimedia (domaine public) · y 900 |
| 3 | 4,45 → 7,2 | « le **truc** que **personne** ne t'explique » | truc (4,60) | 16 | Le mot « LE TRUC » en Montserrat Black 220 px glisse **derrière** son épaule ; le visage passe devant (matte). Punch-in 107 % sur « personne » (5,04). | matte · derrière l'épaule droite |
| 4 | 7,51 → 10,0 | « Toi, tu es en **France** » | France (7,66) | 6 | Tuile drapeau FR, anneau accent | y 880 · gauche |
| 5 | 9,37 → 12,2 | « ta TVA française, **20 %**, à **tout le monde** » | 20 % (9,52), tout (10,30) | 11 + 8 | Carte stat verre : roll 0 → 20 % « TVA française ». Sur « tout le monde », 3 tuiles clients (`user`) reçoivent « 20 % » par des pointillés animés depuis la tuile FR. | natif · y 860–1180 |
| 6 | 10,81 → 12,8 | « **Logique**, **non** ? Eh bien non » | Logique (10,96), non (12,36) | 12 | Une coche se trace sur la carte 5 (« Logique ? »). Elle est barrée d'une croix accent2 sur le 2ᵉ « non » (12,36), avec secousse 3 px. **Freeze-frame commenté** (20) dans le silence 11,5 → 11,9 : gel 0,4 s, contour blanc 3 px autour de la silhouette, label « Logique ? ». | matte |
| 7 | 13,43 → 15,4 | « c'est là que **tout le monde se plante** » | tout (13,58), monde (13,88), plante (14,22) | 13 + 19 | Typographie cinétique plein cadre : TOUT · LE MONDE · SE PLANTE, un mot par temps, 180 px, visage assombri à 40 %. **Onde de choc + 20 particules** sur « plante ». Couvre la coupe 2 (14,85). | plein cadre |
| 8 | 14,93 → 18,0 | « Pour une **formation en ligne** vendue à un **particulier** » | formation (15,08), particulier (17,06) | 8 | Flux : tuile `monitor-play` « Formation en ligne » → pointillés → tuile `user` « Particulier » | y 900 |
| 9 | 18,05 → 21,0 | « la **règle** est simple, mais quasi **personne** ne la connaît » | règle (18,20) | 7 | Tuile `scale` « LA RÈGLE » qui se **retourne** (flip 3D 180°) sur « personne » (19,74). Le dos affiche un « ? » en accent : aucun chiffre inventé. | natif · centre |
| 10 | 22,39 → 24,9 | « ce n'est pas celle de **ton pays**, c'est celle du **pays du client** » | ton pays (22,54), client (24,36) | 12 + 8 | Tuile FR barrée (croix accent2) sur « ton pays ». Sur « pays du client » (23,96), une tuile client avec drapeau BE et coche verte. Secousse 3 px sur « c'est » (opposition). | y 900 |
| 11 | 26,11 → 29,6 | « Quand tu vends dans **trois pays**, tu n'as pas **une TVA**…, tu en as **trois** » | trois (26,26), une (27,44), trois (29,12) | 8 + 11 | 3 drapeaux en stagger. Compteur verre « TVA à gérer » qui roule 1 → 3 sur « trois » (impact sub). | y 860–1180 |
| 12 | 30,05 → 33,9 | « Le **piège**, c'est de facturer la **mauvaise TVA** ou **pas de TVA du tout** » | piège (30,20), mauvaise (31,90), pas de TVA (33,34) | 12 + 1 + 10 | Chapitre rouge « LE PIÈGE » (`triangle-alert`). Fenêtre macOS « Facture » (mockup générique, sans nom ni n° réel) : la ligne « TVA 20 % (FR) » est **surlignée** puis barrée sur « mauvaise TVA », et la ligne « TVA 0 % » est barrée sur « pas de TVA ». | mockup `mockups/facture` (HTML) · y 800–1300 |
| 13 | 34,27 → 38,0 | « **L'argent** que tu aurais dû récolter, **l'État** te le **réclame** » | argent (34,42), réclame (37,18) | 3 | iPhone (390×844 ×1,4, Dynamic Island) qui glisse du bas avec rotation 3° → 0° : **capture réelle** d'impots.gouv.fr mobile. Une notification générique tombe du haut sur « réclame » : « Rappel : TVA due », sans montant ni logo officiel. | capture réelle + mockup `mockups/notification` · droite |
| 14 | 39,13 → 41,0 | « tu ne l'as **plus**, il sort de ta **poche** » | plus (39,28), poche (40,54) | 11 + 17 | Carte `wallet` dont la jauge se vide. **Pulse de fond** accent 12 % (matte) et punch-in 107 % sur « poche ». | natif · y 900 |
| 15 | 41,07 → 44,9 | « La **bonne nouvelle**, c'est qu'il existe un **système** pour éviter de **t'enregistrer** dans trois pays » | bonne (41,22), système (42,76), enregistrer (43,92) | 2 + 18 + 10 | Fenêtre navigateur : l'URL `impots.gouv.fr` se tape (40 ms/lettre), puis la **page réelle** « J'utilise le guichet unique TVA (IOSS-OSS) » apparaît avec **light sweep**. Sur « t'enregistrer », le surligneur se trace sur la phrase réelle « ne sont plus tenues de s'immatriculer auprès des administrations fiscales de chaque État membre ». | capture réelle `assets/screens/oss_desktop.png` |
| 16 | 45,10 → 47,8 | « Ça s'appelle le **guichet unique** » | guichet (46,38) | 4 | **Zoom-through** : la caméra plonge dans la fenêtre jusqu'au plein cadre (0,4 s, motion blur), la capture scrolle jusqu'au titre « guichet unique TVA » surligné, puis ressort vers le visage. Couvre les coupes 9 (45,24) et 10 (47,34). | capture réelle (pleine page) |
| 17 | 47,87 → 50,8 | « La TVA **internationale**, ça ne se rattrape pas **en panique** » | internationale (48,02), panique (50,34) | 6 + 13 | Tuile `globe` sur « internationale ». Typographie cinétique « PAS · EN · PANIQUE » en fin de phrase (2ᵉ et dernière). | plein cadre sur la fin |
| 18 | 51,35 → 53,7 | « Ça se **conçoit** en même temps que ta **structure** » | conçoit (51,50), structure (53,06) | 8 | Deux tuiles qui s'emboîtent : `building-2` « Ta structure » + `receipt` « TVA », reliées en pointillés, avec coche | y 900 |
| 19 | 54,35 → 57,5 | « Si tu vends à l'**international** et que tu as un **doute**, **commente TVA** » | doute (55,94), commente (56,32) | 9 + 18 | Carte CTA : `message-circle` + « Commente « TVA » » (accent), avec light sweep. Pas de handle (aucun fourni). | natif · y 1000 |

**En permanence** :
- **15**, profondeur 2.5D : fond dupliqué, flou 6 px, scale 1.04, parallaxe inverse 10 px, visage net devant via le matte.
- **22**, barre de progression accent 4 px en haut, à y 260 (hors UI Instagram).

**Rythme** :
- 19 blocs, plus les punch-ins (sur « personne », « 20 % », « non », « plante », « trois », « poche », « guichet unique ») : **un événement toutes les 2,2 s**.
- Jamais plus de 2 éléments à la fois.
- Plus long passage sans nouvel élément : 1,9 s.

**Comptes de la bibliothèque** :
- typographie cinétique 2 / 2 ;
- zoom-through 1 / 2 ;
- light sweep 2 / 2 ;
- onde de choc 1 / 2 ;
- freeze-frame 1 / 1 ;
- textes ou fenêtres derrière la personne : 1 (« LE TRUC ») ;
- B-roll : 0 (aucun déclencheur « imagine / tu es à »).

## 3. Assets, son, rendu

- **Captures réelles** (Playwright, bandeau cookies refusé) :
  - impots.gouv.fr « J'utilise le guichet unique TVA (IOSS-OSS) » (https://www.impots.gouv.fr/node/14108), en desktop 1440×900 et pleine page, **déjà capturée** ;
  - impots.gouv.fr en iPhone 15 Pro.
- **Mockups HTML → .mov alpha 60 fps** (`page.clock`, `prores_ks yuva444p10le`) :
  - une facture générique (aucune donnée réelle) ;
  - une notification générique.
- **Matte** : `remove_background` vidéo sur la source conformée. Je contrôle cheveux et mains sur 10 images. Si le matte bave, les effets 15, 16, 17 et 20 sautent et le reste est conservé.
- **60 fps** : `upscale_video` bytedance, preset `ugc`, 1080p, fps 60 sur le montage. Je vérifie que la bouche ne se déforme pas.
- **Voix** : DeepFilterNet3 → Pedalboard (chaîne du brief) → deesser → loudnorm −14 / TP −1 / LRA 7.
- **SFX** : synthétisés par moi, donc originaux et sans question de licence.
  - Ils sont placés à −12 dB sous la voix, dans les silences quand c'est possible, sinon à ≤ −14 dB sous la voix.
  - Jamais deux à la fois, jamais sur une syllabe.
  - Musique : aucune (non fournie).

## 4. Validé (« je valide »)

Coupes (57,5 s, 10 coupes, repli de la coupe 2), hook « dans trois pays », CTA « Commente « TVA » », palette du reel 6 (#FFC83D / #E5484D, fenêtres light), sans handle.

## 5. Écarts au plan, décidés au contrôle des images

- **3 · « LE TRUC » derrière l'épaule** : sur une seule ligne de 230 px, le mot passait presque entièrement derrière la tête (« LE … UC »).
  - Il est maintenant sur 2 lignes à gauche de la tête : « LE » 96 px, « TRUC » 128 px.
  - Seule la fin du « C » glisse derrière les cheveux, et la main passe devant le mot.
  - Le détourage reçoit le même étalonnage que l'image de base (vignettage recalé en coordonnées plein cadre), donc plus de couture visible sur le visage.
- **9 · LA RÈGLE (flip) et 14 · trésorerie** : le moteur refuse un `scale` d'entrée sur un cadre dont un enfant anime `scaleX` (flip, barre qui se vide). Ces deux cartes entrent donc en glissé vertical (ressort) au lieu d'un zoom.
- **20 · freeze-frame** : le contour blanc suivait aussi le bord du bureau (le détourage inclut le plateau). Il est coupé sous y = 1600 et ne dessine plus que la silhouette.
- **Sous-titres** :
  - les chiffres restent fixes (« 20 % ») ; le compteur 0 → 20 ne vit que sur la carte ;
  - en mode fenêtre, les sous-titres descendent de 45 px pour ne plus toucher le bas des fenêtres ;
  - ils sont masqués pendant la typographie cinétique, qui reprend les mêmes mots.
- **Planche contact** : elle est tirée du master livré (`tests/contact_elements.jpg`, une vignette par déclencheur à +0,45 s) et non de `higgsedit sheet`.
  - Le bac à sable Higgsfield est remis à zéro entre deux appels et le rendu complet y a calé (`ConsumerStalled` à 466 ms/image).
  - Le master a donc été rendu en 6 segments de 10 s (`higgsedit render --range`) puis assemblé sans réencodage.
