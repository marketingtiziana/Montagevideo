# Prompt : transformer le carrousel « Octobre » en séquence de stories

## Avant d'ouvrir la conversation

- Ouvrez une nouvelle conversation Claude (claude.ai, pas Claude Code).
- Joignez si possible les 10 screens Threads (fichiers `carousel/screens/1.jpg` à `10.jpg`) : ils servent de référence visuelle et de ton. Les textes sont de toute façon déjà dans le prompt.
- Collez le prompt ci-dessous tel quel. Les crochets [ ] signalent ce que vous pouvez ajuster.

## Prompt à coller

```
Tu es mon directeur de création pour Instagram. Je te donne les 10 textes d'un carrousel
Threads qui a bien marché. Je veux EXACTEMENT ce contenu, même ton, même vocabulaire, mêmes
chiffres, mais réécrit en SÉQUENCE DE STORIES Instagram.

CONTRAINTES STORIES
- Format 9:16 (1080 x 1920). Une seule idée par story, 25 mots maximum par story.
- Entre 8 et 12 stories. La story 1 est un hook qui donne envie de taper pour voir la suite.
- Les 3 premières secondes comptent : la phrase la plus forte de chaque story va en haut.
- Zone sûre : rien d'important dans les 250 px du haut et les 300 px du bas (interface Instagram).
- Garde le tutoiement, les phrases courtes, les emoji déjà présents (🟢 ❌ 🔥 ⚠️ 🔴 🎁 ✈️ 🥂 🎯 ➡️). N'en ajoute pas d'autres.
- Ne modifie ni les chiffres ni les affirmations. Tu peux couper, scinder, réordonner légèrement, pas inventer.
- La dernière story contient l'appel à l'action : « Réponds JANVIER à cette story » (au lieu de « commente »).

POUR CHAQUE STORY, DONNE-MOI
1. Le texte principal (ce qui est écrit à l'écran).
2. Une ligne de sous-texte facultative (plus petite).
3. Un sticker interactif si pertinent : sondage, curseur, question, compte à rebours, lien. Donne le texte du sticker.
4. Une indication visuelle en une ligne : fond blanc minimaliste, texte noir, un seul élément coloré maximum. Même esprit épuré que le carrousel.
5. Pour la story 1, propose 3 variantes de hook.

LIVRABLE
- Un tableau : n° de story, texte principal, sous-texte, sticker, indication visuelle.
- Puis la séquence complète écrite à la suite, prête à copier dans l'app, une story par bloc.
- Puis une version « texte à dire face caméra » de 20 secondes maximum pour la story 1, si je préfère la tourner en vidéo.

TEXTES SOURCE (carrousel Threads, 10 slides)

1/10
Décembre est le pire mois possible pour penser à ta fiscalité.
Mais bizarrement Octobre est le meilleur mois de l'année pour ça.
Je t'explique ➡️

2/10
La résidence fiscale se joue par année civile.
Partir au 1er janvier = une année pleine sous ton nouveau régime.
Une déclaration de départ propre et simple.
0 année coupée en deux, 0 double déclaration bancale.
Partir en mars ou en juillet ? C'est possible.
Mais c'est plus sale et plus cher.

3/10
❌🎄 LE PROBLÈME DE DÉCEMBRE
Chaque année, c'est pareil.
En décembre, mon agenda se remplit de gens "décidés à partir au 1er janvier".
Sauf qu'une expatriation propre demande 10 à 12 semaines.
Visa, structure, logement, banque, rupture fiscale.
Décider en décembre = partir en avril = une année fiscale de perdue.
Soit 20, 30, 40 000€. Évaporés dans l'hésitation.

4/10
🟢 LE RÉTROPLANNING : OCTOBRE (maintenant)
Semaines 1-2 : l'audit et la décision.
Ta situation analysée : CA, activité, famille, objectifs.
Le choix de la destination selon TON profil, pas selon Instagram.
Le montage cible défini : structure, résidence, calendrier.
C'est LA phase qui conditionne tout le reste.

5/10
🟢 LE RÉTROPLANNING : NOVEMBRE
Semaines 3-6 : la construction.
Lancement du visa ou permis de résidence.
Création de la structure (société, statuts, comptes).
Recherche du logement, préparation bancaire.
Pendant que les autres préparent Noël, toi tu prépares ta liberté.

6/10
🟢 LE RÉTROPLANNING : DÉCEMBRE
Semaines 7-10 : la rupture propre.
Résiliations et transferts en France (bail, abonnements, URSSAF si concerné).
🔥 Notification au fisc, mise à jour impots.gouv.
🔥 Derniers documents, derniers virements, cartons.
🔥 Tout est prêt AVANT les fêtes. Tu passes Noël serein.

7/10
🟢 LE RÉTROPLANNING : 1ER JANVIER ✈️
Tu démarres l'année dans ton nouveau pays.
Résidence établie dès le jour 1.
Année fiscale pleine, propre, documentée.
Pendant que les autres prennent des "bonnes résolutions"...
toi tu as déjà exécuté la tienne.

8/10
🔴 CE QUE COÛTE CHAQUE MOIS DE RETARD
⚠️ Décision en octobre : départ au 1er janvier. Année optimisée.
⚠️ Décision en décembre : départ au printemps. Des mois de fiscalité pleine en plus.
⚠️ À 10k/mois de bénéfice, chaque trimestre de retard = 8 000 à 12 000€.
L'hésitation a un tarif. Et il est mensuel.

9/10
Octobre n'est pas "un bon moment" pour y réfléchir.
🥂 C'est LE moment où ton 1er janvier se décide.
⚠️ Dans 4 semaines, le rétroplanning devient serré.
🔴 Dans 8 semaines, il devient impossible.

10/10
🟢 Ton audit, c'est l'étape 1 du rétroplanning.
Et elle se fait cette semaine ou la suivante. Pas en décembre.
🎁 Je t'offre cet échange pour analyser ta situation. 🎯
🎁 Commente JANVIER ou envoie-moi un DM.
🎁 Ton 1er janvier 2027 se construit maintenant.
```

## Après la réponse

- Si vous voulez les visuels, revenez dans cette session Claude Code avec les textes des stories : le générateur `carousel/` peut sortir des images 1080 × 1920 dans le même style blanc.
- Pour un ton plus proche d'une suite de messages, demandez dans la même conversation : « Refais la séquence en 6 stories maximum, une phrase par story. »
