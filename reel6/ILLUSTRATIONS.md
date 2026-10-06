# Reel 6 — « Impôts & OnlyFans » : plan d'illustration (à valider)

**Source** : 1080×1920, 59,94 fps, 88,4 s. Elle parle face caméra, plein cadre, micro devant elle.
**Analyse** : faster-whisper large-v3 mot à mot (`transcript.json`), visage mediapipe FaceLandmarker 2×/s (`faces_raw.json`, puis lissage 0,6 s sur la timeline montée dans `face_track.json`), silences `-30 dB / 0,35 s` (`silences.txt`).

## 1. Montage proposé : 59,9 s

En retirant seulement les silences (avec 100 ms de respiration gardées), le montage ferait **≈ 80 s**. Pour passer sous 60 s, je propose de couper ces passages (`prep.py`, liste `DROP`) :

| Source | Passage coupé | Pourquoi |
|---|---|---|
| 7,3 s | « Tu démarres. » | Redondant avec « Au début ». |
| 13,0 s | « et tu te dis, c'est mon argent, je l'ai gagné. » | Le fil reste clair sans. |
| 20,6 s | « C'est de l'argent qui vient de l'étranger. » | Répète « depuis le Royaume-Uni ». |
| 26,2 s | « Et la plateforme garde une trace de tout ce qu'elle te verse. » | « c'est traçable » porte déjà l'idée, quelques secondes après. |
| 31,4 s | « que ça passe sous le radar, » | Doublon de « discret ». |
| 33,4 s | Pause de 1,2 s après « non, » | Rythme. |
| 44,9 s | « Et là, arrive le truc que personne ne te dit. » | Doublon du hook (« le truc que personne ne t'explique »). |
| 53,9 s | « Une activité indépendante en France » | La phrase démarre à « entre l'impôt et les charges… ». |
| 61,0 s | « Le problème, personne ne met de côté. Tu gagnes 20 000, tu vis avec 20 000. » | « l'argent que tu as déjà dépensé » dit la même chose. |
| 76,5 s | « Et c'est là qu'il faut réfléchir intelligemment. » | Transition. |

**Texte final**, en temps de timeline :
> Comment déclarer tes impôts quand tu exploses grâce à OnlyFans ? Je vais te dire le truc que personne ne t'explique et ça va te faire mal. Au début, c'est quelques centaines d'euros. Puis ça part à 5 000, 10 000, 20 000 par mois. Première chose à comprendre, OnlyFans te paye depuis le Royaume-Uni. Mais si tu vis en France, tu le déclares en France. Donc l'idée que c'est discret, non, oublie, c'est traçable. Deuxième chose, aux yeux du fisc, OnlyFans, c'est une activité professionnelle, tu dois être déclaré avec un vrai statut. Ce qui fait mal, ce n'est pas l'impôt sur le revenu, c'est les cotisations sociales. Entre l'impôt et les charges, tu peux voir disparaître quasiment la moitié de ce que tu gagnes. Et un an plus tard, l'État réclame sa part sur l'argent que tu as déjà dépensé. C'est ça qui coule les créatrices. Pas parce qu'elles ont fraudé, parce que personne ne leur a dit que la moitié n'était jamais à elles. Tu peux bosser de n'importe où. C'est exactement le profil qui gagne à structurer proprement en restant discrète. Et 100 % en règle. Si tu veux savoir comment, commande diagnostic.

## 2. Zones

- **Visage** : x 233–923, y 135–776. Le menton se situe entre y 620 et 765 selon les plans.
- **Zone libre** : bande y 800–1260, sur toute la largeur moins 60 px de marge. Le visage est centré, il n'y a donc pas de place sur les côtés. Les fenêtres et les logos vivent sur la poitrine et le micro, jamais sur la bouche ni les yeux.
- **Sous-titres** : y ≈ 1300 (jamais sous y 1570).
  - Si une fenêtre descend sous 1240, ils passent à y 1420, pour ne jamais être superposés.
  - Rien dans les 250 px du haut.

## 3. Illustrations, segment par segment

- **Temps** : timeline montée.
- **t_in** : 150 ms avant le mot déclencheur.
- **N°** : type d'élément dans la bibliothèque du brief.

| # | t_in → t_out | Phrase | Mot déclencheur (t) | N° | Élément | Asset |
|---|---|---|---|---|---|---|
| 1 | 0,87 → 3,0 | « déclarer tes **impôts** » | impôts (1,02) | 2 | Fenêtre navigateur : l'URL `impots.gouv.fr` se tape, puis la page d'accueil apparaît. | Capture réelle `assets/screens/impots.png` (Playwright, 1440×900) |
| 2 | 2,77 → 5,0 | « grâce à **OnlyFans** ? » | OnlyFans (2,92) | 4 | Tuile logo OnlyFans en pop, avec anneau accent. La fenêtre 1 recule (cascade). | Simple Icons `onlyfans` (CC0), monochrome |
| 3 | 3,6 → 6,6 | « …personne ne t'explique… faire **mal** » | mal (6,30) | — | Pas de concept à illustrer : punch-in 100 → 107 % et pop du mot « mal » en sous-titre. | — |
| 4 | 6,66 → 9,3 | « Au début, c'est quelques **centaines** d'euros » | centaines (7,74) | 9 | Carte stat en verre : petite barre, label « Au début », valeur « quelques centaines d'€ » (pas de chiffre inventé). | Mockup `mockups/stat_growth` |
| 5 | 9,33 → 12,0 | « ça part à **5 000, 10 000, 20 000** par mois » | 5 (9,48) | 9 | Même carte : 3 barres qui montent, compteur en roll 5 000 → 10 000 → 20 000 « € / mois », impact sur 20 000. | Mockup (chiffres prononcés) |
| 6 | 11,93 → 15,5 | « **Première** chose à comprendre » | Première (12,08) | 12 | Carte chapitre « 1/2 » en haut de la zone libre. | — |
| 7 | 13,33 → 18,8 | « **OnlyFans** te paye depuis le **Royaume-Uni**. Mais si tu vis en **France**… » | OnlyFans (13,48), Royaume-Uni (15,09), France (16,89) | 6 | Flux : tuile OnlyFans → tuile drapeau UK (15,09), puis flèche pointillée animée vers la tuile drapeau FR (16,89). | Drapeaux SVG Wikimedia (domaine public) |
| 8 | 17,45 → 18,9 | « tu le **déclares** en France » | déclares (17,60) | 10 | Coche verte tracée sous la tuile FR. | — |
| 9 | 20,27 → 22,2 | « l'idée que c'est **discret**, **non**, oublie » | discret (20,42) | 10 | Carte « Discret ? » barrée d'une croix accent2 qui se trace, puis secousse sur « non » (20,96). | — |
| 10 | 22,21 → 24,0 | « c'est **traçable** » | traçable (22,36) | 4 | Tuile icône Lucide `scan-search` avec anneau accent et label « Traçable ». | Lucide (ISC) |
| 11 | 23,36 → 27,8 | « **Deuxième** chose » | Deuxième (23,51) | 12 | La carte chapitre passe à « 2/2 ». | — |
| 12 | 24,9 → 27,8 | « aux yeux du **fisc**, OnlyFans, c'est une activité **professionnelle** » | fisc (25,05), professionnelle (26,71) | 2 + 8 | Fenêtre navigateur `impots.gouv.fr` (page d'accueil réelle). Sur « professionnelle », le surligneur accent se trace sur l'onglet « Professionnel » du menu et la fenêtre zoome à 130 %. | Capture réelle `impots.png` |
| 13 | 28,46 → 31,4 | « tu dois être **déclaré** avec un vrai **statut** » | déclaré (28,61), statut (30,21) | 10 | Checklist : « Activité déclarée » coche à 28,61, « Vrai statut » coche à 30,21. | — |
| 14 | 31,40 → 31,9 | « Ce qui fait **mal** » | mal (31,55) | — | Punch-in et pop de sous-titre. | — |
| 15 | 32,40 → 35,5 | « ce n'est pas l'**impôt sur le revenu**, c'est les **cotisations sociales** » | l'impôt (32,55), cotisations (34,23) | 5 | Deux cartes : « Impôt sur le revenu » à 32,55, puis « Cotisations sociales » à 34,23. La première grise et recule, secousse sur « c'est ». | — |
| 16 | 34,08 → 37,6 | « les **cotisations sociales** » | cotisations (34,23) | 1 | Fenêtre macOS avec la page d'accueil urssaf.fr réelle, en cascade derrière la carte 15. Elle remplace la carte grisée. | Capture réelle `assets/screens/urssaf.png` |
| 17 | 37,58 → 40,2 | « tu peux voir **disparaître** quasiment **la moitié** de ce que tu gagnes » | disparaître (37,73), moitié (38,81) | 9 | Carte jauge : la jauge « Ce que tu gagnes » se vide, puis compteur « ≈ 50 % » (elle dit « quasiment la moitié »), impact. | — |
| 18 | 40,48 → 41,6 | « Et **un an plus tard** » | un an (40,63) | 9 | Carte icône Lucide `calendar` avec « +1 an » en roll. | — |
| 19 | 41,52 → 44,3 | « l'État **réclame** sa part » | réclame (41,67) | 3 | iPhone : urssaf.fr réel en version mobile. Une notification générique tombe du haut : « Cotisations à régler », sans montant ni logo officiel, c'est une illustration. | Capture réelle `urssaf_iphone.png` + mockup de notification |
| 20 | 44,94 → 45,7 | « C'est ça qui **coule** les créatrices » | coule (45,09) | — | Punch-in, pop de sous-titre, l'iPhone sort. | — |
| 21 | 46,92 → 48,6 | « Pas parce qu'elles ont **fraudé** » | fraudé (47,07) | 10 | Carte « Fraude » barrée d'une croix, avec secousse. | — |
| 22 | 49,24 → 51,0 | « que **la moitié** n'était jamais à elles » | moitié (49,39) | 9 | Carte « 50 % » coupée en deux : la moitié accent2 se détache, label « jamais à elles ». | — |
| 23 | 51,76 → 53,6 | « Tu peux bosser de **n'importe où** » | n'importe (51,91) | 13 | Cutaway B-roll de 1,8 s : laptop en terrasse face à la mer, entrée et sortie en zoom-whip. | Pexels (licence Pexels), dans `SOURCES.md` |
| 24 | 54,16 → 58,0 | « **structurer** proprement en restant **discrète**. Et **100 %** en règle » | structurer (54,31), discrète (56,17), 100 % (56,97) | 10 + 9 | Checklist à 3 coches : « Structure propre », « Discrète », puis « En règle » avec compteur 0 → 100 % en roll. | — |
| 25 | 58,80 → 59,9 | « **commande** diagnostic » | commande (58,95) | 7 | Carte CTA : « Commande ton diagnostic », plus le handle ou la marque (voir la question 3), flèche Lucide `arrow-down`. | — |

### Événements et contrôles

- **Rythme** : 25 événements en 60 s, soit un toutes les 2,4 s en moyenne. Jamais plus de 2 éléments à l'écran, sous-titres non comptés.
- **Punch-in 107 %** : sur « mal » (6,3), « mal » (31,55), « coule » (45,09) et « 20 000 » (10,38), soit un toutes les 4 à 6 s en moyenne.
- **Sous-titres** : karaoké par groupes de 3–4 mots.
  - Pop + tick sur les noms d'outils, chiffres et verbes forts : impôts, OnlyFans, 5 000, 10 000, 20 000, Royaume-Uni, traçable, fisc, statut, cotisations, moitié, fraudé, 100 %.
  - Secousse sur « Mais » (15,91) et « non » (20,96).

## 4. Son

- **Voix** : DeepFilterNet3 → Pedalboard (chaîne du brief) → deesser → loudnorm I = −14, TP = −1, LRA = 7.
- **Sound design** : pop, click, whoosh, tick et impact synthétisés par moi en Python (sinus, bruit filtré, enveloppes). Ce sont des sons originaux, sans question de licence. Ils sont placés à −12 dB sous la voix, un son par événement.
- **Musique** : aucune, rien n'a été fourni. Tu peux m'en envoyer une si tu veux.

## 5. Assets et règles

- **Capture impossible** :
  - onlyfans.com renvoie une page anti-bot Cloudflare (403), donc pas de capture : logo seul.
  - autoentrepreneur.urssaf.fr ne répond pas, donc j'utilise urssaf.fr.
- **Réel ou mockup** :
  - Captures réelles : impots.gouv.fr et urssaf.fr.
  - Mockups (cartes, jauges, checklist, notification générique) : purement illustratifs. Aucun faux relevé, aucun faux montant, aucun faux avis, aucune UI d'OnlyFans inventée.
- **Chiffres affichés** : uniquement ceux qu'elle prononce (5 000, 10 000, 20 000 par mois, la moitié ≈ 50 %, 1 an, 100 %).

## 6. À valider (une seule fois)

1. **Coupes** : la liste de la section 1 pour tenir en 59,9 s.
2. **Palette** (non fournie) :
   - accent `#FFC83D` (or, lisible sur le blanc des sous-titres) ;
   - accent2 `#E5484D` (rouge, pour les croix) ;
   - fenêtres en mode **light**.

   J'écarte volontairement le bleu OnlyFans, pour qu'on ne lise pas un partenariat.
3. **Marque / handle pour la carte CTA** : non fournis. Sans réponse, la carte affiche seulement « Commande ton diagnostic » et le lien en bio.
4. **CTA** : elle dit « commande diagnostic ». Je sous-titre exactement ce qu'elle dit, et la carte affiche « Commande ton diagnostic ».
