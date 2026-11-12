# Prompt Claude Code — montage d'un podcast vidéo (style « émission premium »)

> Copie tout le bloc ci-dessous dans Claude Code, après avoir rempli la section **PARAMÈTRES**.
> Ce prompt reproduit la **grammaire de montage** de la vidéo de référence (structure, rythme, effets, son).
> Il utilise **ta propre identité visuelle** (logo, jingle, couleurs) : ne copie pas le logo, le nom ni le
> jingle d'un autre podcast.

---

````text
Tu es monteur vidéo senior et ingénieur ffmpeg. Tu dois monter un podcast vidéo horizontal 16:9 à partir de
mes rushs, avec exactement la grammaire de montage décrite ci-dessous. Tu travailles dans ce dépôt
(Montagevideo). Réutilise les outils déjà présents dans pipeline/ (imageio-ffmpeg, transcription Whisper
en français, génération d'ASS, gen_sfx.py) en les adaptant au format 16:9. Crée les nouveaux scripts dans
pipeline/podcast/. Contrainte réseau : seuls PyPI et le CDN GitHub sont accessibles (polices via google/fonts,
modèle Whisper via le miroir déjà utilisé dans setup.sh).

## PARAMÈTRES (à remplir)
- RUSHS :
  - cam_large   = <chemin>   # plan large frontal (les 2 personnes)
  - cam_hote    = <chemin>   # plan rapproché de l'hôte
  - cam_invite  = <chemin>   # plan rapproché de l'invité
  - audio_hote / audio_invite = <chemins ou "intégré">   # pistes micro séparées si disponibles
  - (si je ne fournis qu'UN seul fichier caméra : simule le multicam avec des recadrages numériques,
    large = 100 %, rapproché hôte = crop 16:9 sur la moitié gauche, rapproché invité = crop sur la moitié
    droite, upscale propre en lanczos)
- sponsor_rush = <chemin ou "aucun">   # hôte seul face caméra qui lit le sponsor
- NOM_PODCAST = <...>
- HÔTE = <prénom nom> ; INVITÉ = <prénom nom>, <fonction - société>
- RÉSEAUX INVITÉ : LinkedIn <...>, Instagram <@...>
- PLATEFORMES : Apple Podcasts, Spotify (+ YouTube pour le bouton S'abonner)
- ASSETS À MOI : logo.png (transparent), jingle.wav (~1,5 s), musique_teaser.wav, musique_sponsor.wav
  (si un asset manque : génère un équivalent neutre avec ffmpeg/Pillow, et signale-le)
- COULEURS : primaire <#1E5BFF bleu vif par défaut>, accent <#FFCC00 jaune doré>, texte #FFFFFF
- STYLE GRAPHIQUE : rétro 90s / Y2K (bulle de BD, étoiles qui scintillent, rayures) par défaut

## ÉTAPE 0 — Analyse avant de toucher aux images
1. ffprobe tous les rushs (durée, fps, résolution, pistes audio). Sortie : 1920x1080, 25 ou 30 fps selon
   la source, H.264 CRF 18, AAC 320 kb/s, 48 kHz.
2. **Synchronise les caméras** par corrélation croisée des formes d'onde audio (numpy sur du 16 kHz mono).
   Écris le décalage de chaque caméra dans sync.json. Vérifie-le à l'oreille sur 3 points (début, milieu, fin).
3. Transcris l'audio mixé en français, **mot à mot avec horodatage** → words.json + transcript.txt.
4. **Diarisation simple** : si j'ai fourni des pistes micro séparées, détermine qui parle en comparant le
   niveau RMS des deux pistes par fenêtres de 100 ms (avec hystérésis de 400 ms). Sinon, sépare les
   orateurs à partir de la transcription et d'un clustering de l'énergie/du timbre, puis montre-moi un
   échantillon pour validation.
5. Montre-moi la liste des **8 à 12 meilleures punchlines** (horodatées, 5 à 12 s chacune) : phrases fortes,
   chiffres, controverses, émotion, conseil concret. Je valide avant la suite.

## ÉTAPE 1 — Nettoyage du rythme (toute la conversation)
- Détecte les silences (silencedetect ~ -35 dB, d ≥ 0,35 s). **Raccourcis chaque silence en laissant
  0,12 s après le dernier mot et 0,06 s avant le suivant** (on enlève 100 à 300 ms par respiration, sans
  jump cut audible). Ne coupe jamais en plein mot.
- Supprime les faux départs, les « euh » isolés trop longs, les passages hors sujet et les réglages
  techniques que je signale. Liste toutes les coupes dans cuts.json pour que je puisse relire.
- Fondu audio de 10 ms à chaque coupe (anti-clic).

## ÉTAPE 2 — Logique de multicam (corps de l'épisode)
Construis une EDL automatique (edl.json) avec ces règles :
- Par défaut : **rapproché de la personne qui parle**.
- **Changement d'orateur → coupe**, placée sur une fin de phrase / pause, en **J-cut** : l'image passe à la
  nouvelle personne **3 images (±2) avant** sa première syllabe. Quand une phrase déborde, autorise un L-cut
  (l'image reste 2 à 5 images sur la personne précédente).
- **Durée d'un plan : minimum 2,5 s, cible 6 à 14 s, maximum 18 s.** Si un monologue dépasse 18 s, alterne
  rapproché → **plan large** (4 à 8 s) → retour au rapproché, en coupant sur une pause.
- **Rires, réactions, échanges rapides (plusieurs prises de parole de moins de 2 s) → plan large.**
- Plan de réaction occasionnel (1 fois toutes les 2 à 3 min) : rapproché de la personne qui écoute
  pendant 1,5 à 3 s, quand elle hoche la tête ou sourit.
- **Uniquement des coupes franches.** Aucun fondu, aucune transition dans le corps de l'épisode.

## ÉTAPE 3 — Punch-ins (zooms numériques)
- Sur les rapprochés uniquement : **punch-in instantané de 100 % à 112 %** (entre 110 et 115 %), centré
  sur le visage (détecte le visage avec OpenCV pour placer le centre du crop, et lisse sa position).
- Déclenchement : sur un mot fort, un chiffre ou une punchline, ou pour casser un plan de plus de 10 s.
  **1 à 2 par minute maximum** dans l'épisode.
- Le zoom tient jusqu'à la coupe suivante ou pendant 3 à 6 s, puis revient d'un coup à 100 % (sur une
  pause). **Jamais de Ken Burns lent, jamais d'easing.**
- Upscale en lanczos pour que la netteté reste propre à 112 %.

## ÉTAPE 4 — Cold open / teaser (0:00 → ~0:30)
- Assemble **3 à 5 punchlines** validées en 25 à 35 s, dans un ordre qui raconte un mini-arc :
  **tension (invité) → contre-point (hôte) → réponse/conseil (invité)**.
- **Plans de 1,5 à 2,5 s** : à l'intérieur d'une punchline, coupe entre rapproché, plan large et punch-in
  à 112 % pour donner du rythme.
- Entre deux extraits : **whip-zoom** de 6 à 8 images (zoom 100→130 % + flou directionnel par gblur/tmix,
  puis arrivée nette sur le plan suivant) + **whoosh** calé sur la coupe.
- **Punch-ins secs** sur 2 ou 3 mots forts.
- **Musique teaser** : synth-pop / électro énergique à -14 LUFS, avec ducking léger sous la voix
  (sidechaincompress, ratio 4, voix toujours compréhensible). Coupe sèche ou mini-riser juste avant le jingle.
- **Sous-titres animés** (voir ÉTAPE 7).

## ÉTAPE 5 — Jingle / bumper (~1,5 s) ×2
- Carte plein écran fond **couleur primaire**, NOM_PODCAST en typo **grasse rétro** dans une **bulle de BD**,
  **3 à 6 étoiles qui scintillent** (scale/alpha pulsés). Animation : la bulle arrive en pop (scale 0→110→100 %
  sur 8 images), le texte suit 2 images après.
- Son : jingle.wav (ou un accord synthé rétro + un « pop » généré).
- Placé **après le teaser** et **après le sponsor** (juste avant l'épisode). Coupe franche dedans et dehors.

## ÉTAPE 6 — Sponsor (si sponsor_rush)
- Hôte seul face caméra. Même nettoyage des silences. Punch-ins fréquents (~3 à 4 par minute).
- Overlay du nom du sponsor + **lower thirds numérotés « 1 », « 2 », « 3 »** (pastille ronde couleur
  primaire avec le chiffre + texte blanc) qui apparaissent quand l'hôte énumère les étapes.
- **Cartes motion design plein écran sur fond primaire** (1 à 2 s) pour les noms de produits.
- Musique douce lo-fi / corporate **à -28 LUFS sous la voix** (ducking), avec un fondu de 0,5 s en entrée
  et en sortie.
- Sous-titres animés sur les phrases clés du sponsor.

## ÉTAPE 7 — Sous-titres (TEASER + SPONSOR UNIQUEMENT)
- Format ASS (libass). Police : **Montserrat ExtraBold Italic** (google/fonts). À défaut, Archivo Black
  avec un italique synthétique (\fax-0.12).
- Taille ~78 px en 1080p, **blanc**, contour noir de 3 px, **ombre noire de 4 px** à 60 % d'opacité, sans boîte.
- Position : centrée horizontalement, marge basse de 120 px.
- **1 à 3 mots par carte**, **apparition en pop** (\fscx\fscy 80→108→100 sur 120 ms).
- **Mots-clés (chiffres, noms, mots forts) en jaune #FFCC00.**
- Relis et corrige la transcription (noms propres, chiffres) avant de générer.
- **AUCUN sous-titre dans le corps de l'épisode.**

## ÉTAPE 8 — Habillage
- **Watermark** : logo en haut à gauche, hauteur 70 px, marge 40 px, opacité 85 %, pendant **toute** la
  vidéo, y compris le teaser (pas sur le jingle ni sur l'end slate).
- **Badges CTA**, en haut à droite, au début de l'épisode (+0:02 → +0:12) :
  1. pilule « Podcast disponible sur » + icônes Apple Podcasts et Spotify (glisse depuis la droite en
     250 ms, reste 4 s, ressort) ;
  2. pilule rouge « S'abonner » → animation de clic (curseur + scale 95 %) → devient grise « Abonné » +
     cloche qui oscille → « Laisse un commentaire ». Petit « clic » et « pop » en SFX.
  Rejoue cette séquence en conclusion (~20 s avant la fin de la conversation).
- **Lower third invité** à environ +1:30 après le début de l'épisode (dès que l'invité parle pour la
  première fois de façon prolongée), pendant 5 s : carte minimaliste en bas à gauche, **NOM en capitales
  grasses** + fonction en dessous, petit badge rond avec le sigle du podcast (style rétro, rayures). Entrée
  en glissé + fondu (300 ms), sortie en 250 ms.
- **Réseaux de l'invité** juste après (~4 s) : icônes LinkedIn et Instagram + identifiants, centré en bas.
- Tous les éléments graphiques sont des PNG/séquences générés avec Pillow (dans le style de
  make_assets.py) et animés avec overlay + des expressions de temps ffmpeg.

## ÉTAPE 9 — Étalonnage (appliqué à toutes les caméras, puis harmonisé)
- Harmonise d'abord les 3 caméras entre elles (balance des blancs, exposition) : mesure la moyenne et
  l'écart-type par canal sur une zone de peau et un mur neutre, puis corrige avec colorbalance / curves.
- Look : **chaud (~4800 K)**, contraste moyen, ombres douces (relève légèrement le noir), hautes lumières
  adoucies, saturation naturelle (légère baisse des verts).
  Point de départ : eq=contrast=1.06:saturation=0.98:gamma=1.02, colorbalance=rs=0.03:bs=-0.03:rm=0.02:bm=-0.02,
  curves avec un léger S doux. Ajuste à l'œil sur des images extraites, et montre-moi un avant/après.
- **Pas de grain, pas de vignettage, pas de bandes noires.**

## ÉTAPE 10 — Son
- Voix (chaque piste micro avant le mix) : highpass 80 Hz → de-esser léger → compression (ratio 3:1,
  attaque 10 ms, release 120 ms) → EQ de présence +2 dB vers 3 kHz si la voix est terne → réduction de bruit
  légère (afftdn) si nécessaire.
- Si les pistes sont séparées : gate doux sur la piste de la personne qui ne parle pas (-10 dB, pas de mute
  total) pour limiter la diaphonie.
- Normalisation finale **-16 LUFS intégré, true peak -1 dBTP** (loudnorm en 2 passes).
- **Pas de musique dans l'épisode.** Musique uniquement dans le teaser, le jingle, le sponsor et l'end slate.
- SFX (générés avec gen_sfx.py) : whoosh sur les coupes du teaser, clic/pop sur les badges, pop sur
  l'apparition du lower third. **Aucun SFX sur les coupes normales de l'épisode.**

## ÉTAPE 11 — Outro
- Fin de la conversation (remerciements) → les badges CTA reviennent.
- **End slate de 7 s** : fond noir, logo centré avec une animation de **curseur qui clignote** à côté
  (ou du texte tapé lettre par lettre), et en bas une pastille « PODCAST DISPONIBLE SUR : Apple Podcasts ·
  Spotify ». Fondu au noir de 0,5 s pour entrer, musique/jingle en fond qui s'éteint en fondu.
- Prévois un espace compatible avec l'écran de fin YouTube (zone libre à droite pour 2 vignettes).

## ÉTAPE 12 — Rendu et contrôle qualité
- Ordre final : teaser → jingle → sponsor → jingle → épisode (avec badges, lower third, réseaux) →
  conclusion avec CTA → end slate.
- Rends d'abord une **preview basse définition (720p, preset ultrafast)** des 3 premières minutes et de
  2 minutes au milieu. Extrais 12 images clés et montre-les-moi avec l'EDL avant le rendu complet.
- Rendu final 1080p, H.264 High, CRF 18, preset slow, yuv420p, AAC 320 kb/s, +faststart.
- Vérifications automatiques : synchro labiale (décalage < 1 image sur 3 points), aucune coupe en plein mot,
  aucun plan de moins de 2,5 s dans l'épisode, loudness à -16 LUFS ±1, watermark toujours présent.
- Exporte aussi : chapitres YouTube (horodatages + titres déduits de la transcription), et la liste des
  punchlines restantes pour des shorts 9:16 (que le pipeline existant pourra monter).

Travaille étape par étape, montre-moi ce que tu as fait à la fin de chaque étape, et demande-moi de valider
à l'ÉTAPE 0 point 5 (punchlines), à l'ÉTAPE 2 (EDL) et 12 (preview) avant de continuer.
````

---

## Conseils d'utilisation
- **Si tu n'as qu'une caméra** : le prompt bascule sur un multicam simulé par recadrages. Ça marche bien si
  la source est en 4K. En 1080p, le rapproché sera un peu doux.
- **Pistes micro séparées** = coupes multicam beaucoup plus précises (on sait qui parle sans deviner).
  Exporte-les depuis ton enregistreur si possible.
- Les valeurs (112 %, 6 à 14 s, -16 LUFS…) viennent de l'analyse de la vidéo de référence : ce sont des
  estimations. Ajuste après la première preview.
