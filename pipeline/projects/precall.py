# -*- coding: utf-8 -*-
"""Project: pre-call briefing video ("3 choses à savoir avant l'appel") — cuts, subtitles, storyboard, outro."""

NAME = "Tiziana"
TITLE = "Fondatrice"
MUSIC_PEAK_SRC = 91.72          # "Et honnêtement..." -> music swell lands on the closing
SRC_END = 95.55                 # last word ends at 95.26 s

# Silences > 0.42 s shortened to ~0.3 s (silencedetect -30 dB). No retakes in this take.
CUTS = [
    (9.26, 9.63), (10.13, 10.36), (13.67, 14.06), (18.85, 19.04), (21.97, 22.31),
    (28.06, 28.32), (28.89, 29.35), (37.09, 37.40), (42.43, 42.96), (46.92, 47.14),
    (48.38, 48.64), (49.94, 50.06), (53.04, 53.78), (58.38, 58.98), (59.53, 59.76),
    (63.06, 63.65), (68.89, 69.42), (76.95, 77.08), (79.10, 79.50), (81.27, 81.42),
    (86.27, 86.48), (89.02, 89.20),
]

OUTRO = dict(h1="À très vite", h2="Venez avec vos vrais chiffres",
             h3="Un empêchement ? Prévenez la personne avec qui vous avez rendez-vous",
             arrow=False, icon3='clock')

SUBS = [
    (0.00, 2.74, "Bonjour, c'est Tiziana, fondatrice de Fynovates."),
    (3.16, 5.54, "Vous venez de réserver votre appel avec mon équipe."),
    (5.90, 6.94, "Et avant qu'on se parle,"),
    (7.10, 9.22, "il y a **trois choses** que vous devez savoir."),
    (9.72, 12.14, "Un : ce n'est pas un appel traditionnel,"),
    (12.22, 13.58, "c'est un **diagnostic**."),
    (14.22, 17.86, "La personne qui va vous recevoir va regarder votre situation réelle,"),
    (18.12, 22.14, "votre activité, où vous êtes basé et comment vous êtes structuré."),
    (22.40, 25.44, "Et vous dire ce qui cloche, ce qui vous coûte de l'argent"),
    (25.44, 28.12, "et dans quel ordre le régler."),
    (28.12, 32.52, "Deux : nous ne prenons pas que quelques appels par semaine,"),
    (32.52, 35.00, "et c'est **nous** qui décidons à la fin"),
    (35.00, 37.36, "si nous pouvons vous accompagner ou pas."),
    (37.70, 40.00, "Notre rôle, c'est de **construire votre structure**"),
    (40.00, 42.38, "et de coordonner les bonnes actions."),
    (43.30, 45.02, "Donc, venez avec vos **vrais chiffres** :"),
    (45.16, 48.50, "chiffre d'affaires, imposition, etc. Pas de version arrangée."),
    (48.72, 49.70, "Plus vous êtes transparent,"),
    (50.16, 53.18, "plus le plan avec lequel vous repartez est **précis**."),
    (53.74, 58.48, "Cet appel peut vous faire économiser **des dizaines de milliers d'euros**."),
    (59.02, 63.40, "Trois : ce créneau est réservé pour vous, et **uniquement pour vous**."),
    (63.84, 68.74, "Quelqu'un de l'équipe a bloqué ce temps pour préparer et étudier votre dossier."),
    (69.44, 72.32, "Si vous avez un empêchement, ce n'est pas un problème, ça arrive."),
    (72.58, 73.56, "Mais **prévenez** :"),
    (73.84, 76.96, "contactez directement la personne avec qui vous avez rendez-vous"),
    (76.96, 79.48, "pour repositionner l'appel."),
    (79.64, 82.30, "Ne disparaissez pas **sans rien dire**."),
    (82.30, 83.70, "Un créneau annulé à l'avance,"),
    (83.96, 86.26, "c'est un créneau qu'on peut donner à quelqu'un d'autre."),
    (86.60, 88.90, "Un rendez-vous manqué sans prévenir,"),
    (89.30, 91.48, "c'est du **temps perdu** pour tout le monde."),
    (91.72, 92.36, "Et honnêtement,"),
    (92.58, 95.26, "ce n'est pas le genre de relation qu'on veut construire avec vous."),
]

def storyboard(g):
    T, INTRO_DUR, BODY = g.T, g.INTRO_DUR, g.BODY
    END = INTRO_DUR + BODY - 0.1
    E = [g.Intro(), g.Outro(), g.Subtitles(), g.BrandMark(T(6.0), END - 0.2)]
    E.append(g.LightLeak(T(0.0) - 0.2, 2.6, 'tr', 0.20))
    E.append(g.LowerThird(T(0.6), T(5.6)))
    # Hook: three things to know
    E.append(g.NumberCard(T(7.1), T(9.2), 3, "choses à savoir avant l'appel", eyebrow="Avant qu'on se parle", count=False))
    # 1 — a diagnostic, not a classic call
    E.append(g.Panel(T(9.8), T(13.6), "C'est un **diagnostic**", eyebrow="1 · Pas un appel classique", ico='doc', size=46))
    E.append(g.CheckList([(T(16.8), "Votre situation réelle"), (T(18.1), "Votre activité"),
                          (T(19.1), "Où vous êtes basé"), (T(20.4), "Comment vous êtes structuré")],
                         T(22.2), eyebrow="Ce que nous regardons", start=T(14.3)))
    E.append(g.CheckList([(T(23.0), "Ce qui cloche"), (T(24.3), "Ce qui vous coûte de l'argent"),
                          (T(25.9), "Dans quel ordre le régler")],
                         T(28.1), eyebrow="Ce que vous saurez", start=T(22.5)))
    # 2 — selection
    E.append(g.Panel(T(29.4), T(32.5), "Quelques appels par semaine", eyebrow="2 · Sélection", ico='clock', size=40))
    E.append(g.Panel(T(33.0), T(37.3), "C'est **nous** qui décidons si nous pouvons vous accompagner", eyebrow="À la fin de l'appel", ico='shield', size=36))
    E.append(g.CheckList([(T(38.8), "Construire votre structure"), (T(40.6), "Coordonner les bonnes actions")],
                         T(42.4), eyebrow="Notre rôle", start=T(37.8)))
    E.append(g.CheckList([(T(44.6), "Chiffre d'affaires"), (T(45.9), "Imposition"), (T(47.2), "Pas de version arrangée")],
                         T(48.5), eyebrow="Venez avec vos vrais chiffres", start=T(43.4)))
    E.append(g.Panel(T(48.8), T(53.1), "Plus vous êtes transparent, plus le plan est **précis**", eyebrow="Transparence", ico='check_circle', size=36))
    E.append(g.Panel(T(53.9), T(58.4), "Des **dizaines de milliers d'euros** d'économies possibles", eyebrow="Ce que cet appel peut vous faire gagner", ico='euro', size=36))
    E.append(g.LightLeak(T(53.8), 2.2, 'tl', 0.12))
    # 3 — your slot
    E.append(g.Panel(T(59.9), T(63.4), "Réservé pour vous, **uniquement** pour vous", eyebrow="3 · Votre créneau", ico='clock', size=40))
    E.append(g.Panel(T(64.0), T(68.7), "Un membre de l'équipe bloque ce temps pour étudier votre dossier", eyebrow="Préparation", ico='doc', size=34))
    E.append(g.Panel(T(69.5), T(72.3), "Un empêchement ? Ce n'est pas un problème.", eyebrow="Ça arrive", ico='question', size=36, muted=True))
    E.append(g.CheckList([(T(73.9), "Contactez directement la personne avec qui vous avez rendez-vous"), (T(77.7), "Repositionnez l'appel")],
                         T(79.5), eyebrow="Mais prévenez", start=T(72.7)))
    E.append(g.Panel(T(79.7), T(82.2), "Ne disparaissez pas **sans rien dire**", eyebrow="Important", size=38))
    E.append(g.Panel(T(82.4), T(86.2), "Un créneau qu'on peut donner à quelqu'un d'autre", eyebrow="Annulé à l'avance", ico='check_circle', size=36))
    E.append(g.Panel(T(86.7), T(91.4), "Du temps perdu pour tout le monde", eyebrow="Manqué sans prévenir", ico='cross', size=38, muted=True))
    E.append(g.LightLeak(T(91.6), 2.6, 'tr', 0.16))
    return E
