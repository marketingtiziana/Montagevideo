# Identification de l'orateur — Tiziana

**Tiziana = la femme aux cheveux longs assise à GAUCHE de l'image d'origine.**

## Piste visuelle

- Détecteur de visages YuNet (OpenCV), toutes les 0,5 s sur la vidéo entière : visage gauche détecté sur 2141 des 2 143 instants analysés (99.9%), score médian 0.91.
- Position médiane du visage de Tiziana : x = 0.186, y = 0.376 (fraction de l'image), hauteur 281 px dans le 4K. Il n'y a qu'une caméra fixe : le suivi est continu.
- Mouvement des lèvres mesuré à 10 i/s dans la zone de la bouche (repères YuNet) pour chaque personne.

## Correspondance voix ↔ visage

- Empreintes vocales WeSpeaker ResNet34 (ONNX), regroupées en 2 voix (k-means).
- Le cluster dont l'activité coïncide avec les lèvres de GAUCHE est attribué à Tiziana (corrélation voix / lèvres 0,645 ; un cluster = l'autre participante à droite).
- Affinage phrase par phrase : empreinte calculée exactement sur chaque phrase (pauses ≥ 0,15 s ou ponctuation), point de rupture détecté quand deux voix s'enchaînent sans pause, croisement avec les lèvres ; phrase **à vérifier** si audio et lèvres se contredisent ou si l'audio hésite.

## Résultats

- Contrôle sur 2478 mots annotés à la main : diarisation globale 97.9%, affinage phrase par phrase 98.1% (l'affinage corrige surtout les relances courtes « D'accord », « Très bien », « Oui, c'est très clair » que l'annotation large range du mauvais côté).
- Phrases : 441 au total, 313 attribuées à Tiziana (634 s), 128 à l'autre participante (234 s), 20 signalées à vérifier.

## Prises de parole de Tiziana (≥ 4 s)

| Début | Fin | Durée | Confiance | Texte |
|---|---|---|---|---|
| 00:46.240 | 00:51.960 | 5.7 s | 1.00 | Comme tu viens de le préciser, je m'appelle Tiziana et donc j'ai un cabinet fiscal et d'ex… |
| 01:07.800 | 01:31.550 | 23.8 s | 1.00 | le cabinet ici c'est vrai qu'il a un point de départ qui est fiscal parce qu'on a des clie… |
| 01:59.960 | 02:05.960 | 6.0 s | 0.64 | Elle m'a dit le meilleur coup, je ne sais pas si c'est mieux. Merde. Ok, tu sais ce que tu… |
| 02:12.460 | 02:17.140 | 4.7 s | 0.30 | Alors si tu veux rester concentrée, regarde le col, pas son visage. Non, non, oui.… |
| 02:27.800 | 02:40.880 | 13.1 s | 1.00 | En fait, c'est plus un cabinet fiscal et d'expatriation, parce qu'en fait, l'objectif, c'e… |
| 03:14.720 | 04:12.800 | 58.1 s | 1.00 | Donc, je disais justement, le cabinet fiscal d'expatriation est sur une clientèle qui est … |
| 04:14.820 | 04:18.880 | 4.1 s | 1.00 | de juridiction de territoire, mais après chacun est unique si tu veux… |
| 04:24.540 | 04:59.730 | 35.2 s | 0.94 | Alors, Dubaï, c'est vrai que c'est un peu la grande destination. Ça commence à bouger dern… |
| 05:04.590 | 05:14.670 | 10.1 s | 0.85 | c'est un peu la loi générale, ça c'est la loi internationale c'est les 182 jours et demi o… |
| 05:22.630 | 05:51.430 | 28.8 s | 0.96 | C'est une excellente question, parce qu'il y a une grande confusion là-dessus. Alors, il y… |
| 05:51.810 | 06:01.730 | 9.9 s | 1.00 | Mais par contre, si tu as juste le service qui est vendu comme à des particuliers, à des F… |
| 06:02.430 | 06:06.590 | 4.2 s | 0.75 | Je te fais général, après il faut voir en détail. Très bien. Mais les gens confondent tout… |
| 06:31.270 | 07:12.430 | 41.2 s | 0.99 | Après, pour moi, j'essaie toujours d'avoir un avis qui est très honnête parce que ce n'est… |
| 07:14.390 | 07:21.250 | 6.9 s | 1.00 | tu ne te rends pas compte, parce que c'est dans ton habitude. Mais quand tu le découvres, … |
| 07:27.070 | 08:06.310 | 39.2 s | 0.99 | Oui et non, parce que tu sais, quand tu vas en vacances, ce n'est pas le même état d'espri… |
| 08:13.150 | 08:18.790 | 5.6 s | 1.00 | ce n'est pas un choix fiscal l'Espagne. C'est un cadre de vie. Maintenant, ça, c'est un au… |
| 08:20.290 | 08:29.870 | 9.6 s | 1.00 | Quand quelqu'un s'expatrie quand il est entrepreneur, parce qu'il y en a qui s'expatrie et… |
| 08:33.400 | 09:07.980 | 34.6 s | 1.00 | ce qu'il faut savoir c'est que tu choisis toujours enfin il choisit toujours le pays par l… |
| 09:14.980 | 09:39.880 | 24.9 s | 1.00 | Parce que zéro impôt, c'est pas que ça. Zéro, oui, mais attends. À Dubaï, je veux dire, la… |
| 09:49.720 | 09:58.400 | 8.7 s | 0.99 | en fait ça fait 8 c'est pour ça que j'ai dit quelques années j'ai pas été précis parce qu'… |
| 10:20.340 | 11:14.000 | 53.7 s | 0.97 | Non, comme ça non. Maintenant, tu as beaucoup de gens qui sont incertains parce qu'eux-mêm… |
| 11:19.880 | 12:02.980 | 43.1 s | 0.93 | Alors, dans l'entreprise ici, tout le monde est indépendant chez moi, dans le monde entier… |
| 12:24.450 | 12:29.590 | 5.1 s | 1.00 | au niveau professionnel déjà il faut être réaliste au niveau de l'activité est-ce qu'elle … |
| 12:34.680 | 13:05.900 | 31.2 s | 0.93 | peux mais je veux dire au niveau pratique business est-ce que tu peux le gérer à distance … |
| 13:09.220 | 13:40.500 | 31.3 s | 0.93 | Alors, pour l'instant, c'est Bali. Ah ouais ? Ah ouais, c'est vraiment la numéro un. C'est… |
| 13:42.810 | 13:47.630 | 4.8 s | 0.93 | Mais c'est vrai que c'est Bali. Bali, vraiment. Bali, Bali, Bali, Bali. Attention, je parl… |
| 14:03.690 | 14:43.630 | 39.9 s | 0.93 | Ça, c'est un autre sujet. C'est vrai qu'on commence toujours un peu tout seul, ou toute se… |
| 15:10.430 | 15:50.170 | 39.7 s | 1.00 | pense que chacun, que ce soit l'homme ou la femme, doit rester à sa place. Et ce n'est pas… |
| 16:05.530 | 16:19.630 | 14.1 s | 0.97 | C'est ce que ma mère me disait. Tiziana, attends, burn-out, tu quittes parce que j'étais d… |
| 16:21.290 | 16:27.510 | 6.2 s | 1.00 | quand t'es au bout du gouffre t'as pas le choix de faire avancer et j'en regrette pas, fra… |
| 16:48.960 | 17:07.180 | 18.2 s | 0.79 | en plus avec les yeux on peut pas avoir de privacité, je rigole non sérieusement dans un a… |
| 17:13.260 | 17:21.700 | 8.4 s | 1.00 | transmettre, c'est ça le mot correct je voudrais transmettre beaucoup plus là je le fais a… |
| 17:45.640 | 17:49.920 | 4.3 s | 0.55 | il a fait une de ses têtes non mais vraiment c'est ma tête normale… |

## Segments signalés pour vérification manuelle

| Temps | Attribué à | Audio | Lèvres | Texte |
|---|---|---|---|---|
| 01:50.820 | autre participante | -0.04 | -0.6 | un plan à trois. |
| 01:53.320 | Tiziana | +0.14 | -1.3 | Non, t'inquiète pas. |
| 02:02.460 | Tiziana | -0.12 | +2.6 | Merde. |
| 02:07.560 | Tiziana | -0.10 | +2.3 | Et donc du coup, oui, |
| 02:08.320 | Tiziana | -0.11 | +1.9 | effectivement... |
| 02:12.460 | Tiziana | +0.01 | +0.9 | Alors si tu veux rester concentrée, regarde le col, |
| 02:15.740 | Tiziana | +0.01 | +3.7 | pas son visage. |
| 02:18.960 | Tiziana | +0.04 | +1.0 | Ouais, |
| 02:19.300 | Tiziana | +0.01 | +2.6 | c'est clair. |
| 02:19.720 | autre participante | +0.02 | +2.1 | En plus, le bouton, il est... |
| 02:47.920 | autre participante | -0.08 | +1.8 | tu vas poser les questions. |
| 02:54.150 | Tiziana | -0.02 | +2.0 | Regarde-là. |
| 02:55.610 | autre participante | -0.03 | +3.4 | Pourquoi tu as envie de rigoler ? |
| 02:58.030 | Tiziana | +0.07 | -1.6 | C'est pas moi, je la regarde, |
| 03:12.600 | autre participante | +0.04 | -0.4 | Alors moi, je vais voir. |
| 06:04.750 | Tiziana | -0.03 | +0.3 | Très bien. |
| 12:48.060 | Tiziana | -0.01 | +1.6 | Évidemment, |
| 13:12.140 | Tiziana | -0.02 | -1.1 | Ah ouais ? |
| 15:50.410 | autre participante | -0.03 | +1.0 | C'est normal. |
| 16:52.540 | Tiziana | +0.04 | +0.7 | pas avoir de privacité, je rigole |
