# -*- coding: utf-8 -*-
"""Project: LTD anglaise follow-up video (devis) — cuts, subtitles, storyboard, outro."""

NAME = "Tiziana"
TITLE = "Fondatrice"
MUSIC_GAIN_DB = -9.0
MUSIC_PEAK_SRC = 46.48          # "Ce sont des entrepreneurs comme vous..." -> music swell on the closing
SRC_END = 54.70                 # last word ends at 54.60 s (clip ends 54.70)

# Silences > 0.42 s shortened to ~0.3 s; the 4.9 s dead air after "des centaines de fois" is removed.
CUTS = [
    (8.44, 9.00), (15.36, 20.01), (25.01, 25.75), (27.12, 27.61), (31.48, 31.84),
    (34.12, 34.88), (37.01, 37.33), (39.58, 41.36), (43.31, 43.45), (45.49, 46.44),
    (48.75, 49.32), (50.06, 50.53), (52.97, 53.75),
]

OUTRO = dict(h1="Validez votre devis", h2="Lisez nos avis sur Trustpilot",
             h3="Votre équipe vous répond au plus vite", arrow=False, icon3='clock')

SUBS = [
    (0.00, 4.22, "En huit ans, on a structuré plus de **800 entrepreneurs**"),
    (4.22, 8.64, "et notre Trustpilot affiche 50 avis, tous **cinq étoiles**."),
    (9.10, 12.46, "Je vous dis ça parce que le devis que vous avez sous les yeux,"),
    (12.56, 15.56, "on l'a déjà tenu des **centaines de fois**."),
    (20.06, 21.62, "Vous avez choisi la LTD anglaise"),
    (21.62, 24.84, "et c'est **le bon choix** pour votre profil."),
    (25.83, 27.14, "Une vraie société,"),
    (28.16, 31.62, "dans un vrai pays, reconnu par vos clients"),
    (31.62, 33.96, "comme par vos prestataires."),
    (35.24, 36.94, "**Zéro** image offshore,"),
    (37.58, 39.52, "une **crédibilité immédiate**."),
    (41.76, 43.12, "Et ne croyez pas sur parole,"),
    (43.54, 45.42, "allez lire nos avis sur **Trustpilot**."),
    (46.48, 50.14, "Ce sont des entrepreneurs comme vous"),
    (50.14, 54.60, "qui racontent exactement **ce qui vous attend**."),
]

def storyboard(g):
    T, INTRO_DUR, BODY = g.T, g.INTRO_DUR, g.BODY
    END = INTRO_DUR + BODY - 0.1
    E = [g.Intro(), g.Outro(), g.Subtitles(), g.BrandMark(T(9.5), END - 0.2)]
    E.append(g.LightLeak(T(0.0) - 0.2, 2.6, 'tr', 0.20))
    # Hook: credentials
    E.append(g.StatList([(T(0.4), 8, ' ans', "d'expérience", None),
                         (T(2.8), 800, '', 'entrepreneurs structurés', None),
                         (T(6.3), 50, ' avis', '5 étoiles sur Trustpilot', 'star')], T(8.6)))
    E.append(g.LowerThird(T(1.0), T(8.4)))
    # The quote
    E.append(g.Panel(T(10.9), T(15.5), "Déjà tenu **des centaines de fois**", eyebrow="Votre devis", ico='doc', size=42))
    # The choice: UK Ltd
    E.append(g.LightLeak(T(20.0), 2.2, 'tl', 0.12))
    E.append(g.Panel(T(20.5), T(24.8), "LTD anglaise : **le bon choix** pour votre profil", eyebrow="Votre choix", ico='check_circle', size=40))
    E.append(g.CheckList([(T(26.0), "Une vraie société"), (T(28.2), "Dans un vrai pays"), (T(30.6), "Reconnue par vos clients"),
                          (T(32.5), "Reconnue par vos prestataires")], T(34.0), eyebrow="Votre LTD", start=T(25.9)))
    E.append(g.NumberCard(T(35.3), T(37.0), 0, "image offshore", eyebrow="Perception", ico='shield', count=False))
    E.append(g.Panel(T(37.6), T(39.5), "Une **crédibilité immédiate**", eyebrow="Résultat", ico='check_circle', size=42))
    # Social proof
    E.append(g.Panel(T(42.0), T(45.4), "Lisez nos avis sur **Trustpilot**", eyebrow="Ne nous croyez pas sur parole", ico='star', size=42))
    E.append(g.LightLeak(T(46.4), 2.6, 'tr', 0.16))
    E.append(g.Panel(T(46.7), END, "Des entrepreneurs comme vous racontent ce qui vous attend", eyebrow="Témoignages", size=36))
    return E
