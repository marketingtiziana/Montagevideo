# -*- coding: utf-8 -*-
"""Project: post-signature onboarding video ("trois choses de votre côté") — cuts, subtitles, storyboard, outro."""

NAME = "Tiziana"
TITLE = "Fondatrice"
MUSIC_GAIN_DB = -9.0
MUSIC_PEAK_SRC = 70.10          # "Réservez, s'il vous plaît…" -> music swell on the closing
SRC_END = 76.30                 # "À tout de suite." ends ~76.1

# Pauses > 0.42 s shortened to ~0.3 s. One retake (block-by-block transcription): "Votre groupe WhatsApp
# dédié. C'est…" (3.75-6.14) is restarted at 6.46 -> keep "Un," then the second take. A click at 25.0 s is removed.
CUTS = [
    (3.41, 6.38), (11.22, 11.61), (15.41, 15.66), (16.22, 16.53), (21.19, 21.88), (23.49, 23.83),
    (24.60, 25.83), (29.22, 29.60), (31.02, 31.53), (35.71, 36.44), (38.69, 39.24), (40.73, 41.52),
    (42.13, 42.45), (43.44, 43.96), (46.48, 47.00), (49.71, 52.23), (52.74, 53.25), (54.41, 54.86),
    (55.97, 56.41), (58.98, 59.58), (61.28, 62.17), (64.08, 65.49), (67.14, 68.31), (69.50, 69.82),
    (75.08, 75.38),
]

OUTRO = dict(h1="À tout de suite", h2="Réservez votre rendez-vous d'onboarding",
             h3="Votre groupe WhatsApp est votre ligne directe avec l'équipe", arrow=False, icon3='clock')

SUBS = [
    (0.00, 1.00, "Maintenant,"),
    (1.17, 3.19, "**trois choses** de votre côté. Un :"),
    (6.46, 11.00, "votre groupe WhatsApp dédié, c'est votre **ligne directe** avec toute l'équipe."),
    (11.72, 15.46, "Une question, un doute, un document : tout se passe par là."),
    (15.66, 21.10, "Deux : vous avez reçu un lien pour réserver votre **appel d'onboarding**."),
    (22.08, 24.48, "Prenez-le **maintenant**, pas demain."),
    (26.03, 30.79, "C'est sur cet appel qu'on lance la création de votre compte bancaire"),
    (31.61, 35.48, "et la synchronisation bancaire pour la comptabilité."),
    (36.52, 40.48, "Sans cet appel, votre structure existe mais **ne peut pas encaisser**."),
    (41.66, 46.26, "Trois : un appel avec moi pour faire le point ensemble"),
    (47.16, 49.80, "sur votre situation et la suite."),
    (52.31, 54.72, "Nous, on tient le rythme."),
    (54.94, 56.10, "**Tenez-le avec nous.**"),
    (56.58, 61.05, "Chaque jour de délai de votre côté, c'est un jour de plus"),
    (62.25, 64.02, "dans votre ancienne situation,"),
    (65.66, 66.92, "celle que vous venez de quitter."),
    (68.38, 69.25, "Encore **félicitations** !"),
    (70.10, 73.62, "Réservez, s'il vous plaît, votre rendez-vous d'onboarding,"),
    (73.99, 75.14, "et on se retrouve très vite."),
    (75.46, 76.08, "À tout de suite."),
]

def storyboard(g):
    T, INTRO_DUR, BODY = g.T, g.INTRO_DUR, g.BODY
    END = INTRO_DUR + BODY - 0.1
    E = [g.Intro(), g.Outro(), g.Subtitles(), g.BrandMark(T(6.4), END - 0.2)]
    E.append(g.LightLeak(T(0.0) - 0.2, 2.6, 'tr', 0.20))
    E.append(g.LowerThird(T(0.5), T(5.5)))
    E.append(g.NumberCard(T(1.3), T(3.3), 3, "choses de votre côté", eyebrow="Maintenant", count=False))
    # 1 — WhatsApp group
    E.append(g.Panel(T(6.5), T(11.0), "Votre **groupe WhatsApp** dédié", eyebrow="1 · Votre ligne directe avec l'équipe", ico='check_circle', size=38))
    E.append(g.CheckList([(T(11.75), "Une question"), (T(12.65), "Un doute"), (T(13.45), "Un document")], T(15.4), eyebrow="Tout passe par là", start=T(11.7)))
    # 2 — onboarding call
    E.append(g.Panel(T(16.6), T(21.0), "Réservez votre **appel d'onboarding**", eyebrow="2 · Vous avez reçu un lien", ico='clock', size=38))
    E.append(g.Panel(T(22.0), T(24.4), "**Maintenant**, pas demain", eyebrow="Prenez-le", ico='clock', size=42))
    E.append(g.CheckList([(T(27.5), "La création de votre compte bancaire"), (T(31.6), "La synchronisation bancaire pour la comptabilité")],
                         T(35.5), eyebrow="Sur cet appel, on lance", start=T(27.4)))
    E.append(g.Panel(T(36.6), T(40.5), "Sans cet appel, votre structure existe mais **ne peut pas encaisser**", eyebrow="Important", ico='cross', size=32))
    # 3 — call with Tiziana
    E.append(g.Panel(T(42.5), T(49.4), "Un appel avec moi : **le point** sur votre situation et la suite", eyebrow="3 · Avec Tiziana", ico='check_circle', size=34))
    # Rhythm
    E.append(g.Panel(T(52.3), T(56.1), "Nous tenons le rythme. **Tenez-le avec nous.**", eyebrow="Le rythme", ico='clock', size=36))
    E.append(g.Panel(T(56.5), T(63.6), "Chaque jour de délai, c'est un jour de plus dans votre ancienne situation", eyebrow="Le coût d'attendre", ico='trend_down', size=31, muted=True))
    E.append(g.LightLeak(T(65.6), 2.2, 'tl', 0.14))
    E.append(g.Panel(T(65.7), T(69.3), "Encore **félicitations**", eyebrow="Celle que vous venez de quitter", ico='star', size=42))
    # CTA
    E.append(g.LightLeak(T(69.9), 2.4, 'tr', 0.14))
    E.append(g.Panel(T(70.0), END, "Réservez dès maintenant votre **rendez-vous d'onboarding**", eyebrow="À faire tout de suite", ico='clock', size=34))
    return E
