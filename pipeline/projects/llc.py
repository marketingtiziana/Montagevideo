# -*- coding: utf-8 -*-
"""Project: LLC follow-up video (devis) — cuts, subtitles, storyboard, outro."""

TITLE = "Conseil en structuration & expatriation"
NAME = ""
MUSIC_PEAK_SRC = 87.48          # "Le bouton est sous la vidéo" -> music swell lands here
SRC_END = 92.10                 # last word ends at 91.74 s; keep a short tail

# (start, end) in SOURCE seconds. Derived from silencedetect (-30 dB, >0.42 s): each
# pause is shortened to ~0.3 s. Two manual cuts: the first (weaker) take of
# "Projetez-vous" (60.9-62.0) and the 3.3 s dead air + noise after "Pendant ce temps".
CUTS = [
    (5.95, 6.28), (12.46, 12.69), (13.82, 15.13), (20.04, 20.26), (25.81, 26.32),
    (26.80, 27.08), (30.79, 30.94), (34.75, 36.05), (37.15, 37.45), (40.65, 41.33),
    (42.64, 42.98), (51.36, 52.72), (59.41, 62.08), (63.02, 63.27), (70.45, 73.62),
    (77.09, 77.28), (80.09, 80.43), (82.20, 82.51),
]

OUTRO = dict(h1="Validez votre devis", h2="Le bouton est sous la vidéo",
             h3="Votre équipe vous répond au plus vite", arrow=True, icon3='clock')

# Full subtitles (SOURCE seconds, corrected French). **word** = gold accent.
SUBS = [
    (0.00, 1.98, "800 entrepreneurs accompagnés,"),
    (2.24, 3.48, "8 ans de métier,"),
    (3.72, 6.20, "50 avis 5 étoiles sur Trustpilot."),
    (6.44, 8.42, "La LLC que vous avez dans votre devis,"),
    (8.62, 10.94, "c'est la structure qu'on monte le plus souvent,"),
    (10.94, 12.34, "et je vais vous dire pourquoi."),
    (12.86, 14.00, "Vous avez **bien choisi**."),
    (15.12, 17.34, "La LLC est **transparente**."),
    (17.40, 20.08, "La société ne paye pas d'impôts aux États-Unis."),
    (20.36, 22.02, "Dans la majorité des cas,"),
    (22.20, 25.70, "vous déclarez vos bénéfices **là où vous résidez**."),
    (26.40, 29.50, "Et on vous la monte au Nouveau-Mexique."),
    (29.66, 30.74, "Pas de rapport annuel,"),
    (31.06, 32.02, "pas de taxes annuelles,"),
    (32.20, 35.04, "quasiment zéro contrainte administrative."),
    (36.10, 37.30, "Vous vous dites peut-être :"),
    (37.54, 40.42, "une société américaine, ça doit être une usine à gaz."),
    (41.42, 42.66, "C'est exactement **l'inverse**."),
    (43.00, 46.42, "C'est la structure la plus simple de tout notre catalogue,"),
    (46.74, 48.30, "et la plus accessible,"),
    (48.40, 51.30, "avec adresse et agent inclus un an."),
    (52.76, 53.74, "Et tout est **vérifiable**."),
    (53.74, 56.94, "Votre société apparaîtra sur le registre officiel de l'État,"),
    (57.18, 60.16, "comme celle de nos 800 clients avant vous."),
    (62.16, 63.14, "**Projetez-vous.**"),
    (63.34, 64.30, "Vous signez aujourd'hui,"),
    (64.38, 65.54, "on lance la création demain,"),
    (65.54, 66.72, "et dans quelques jours,"),
    (66.86, 69.12, "vous facturez vos clients avec votre LLC."),
    (69.62, 70.42, "Pendant ce temps,"),
    (73.76, 75.34, "ne rien faire **est un coût**."),
    (75.56, 77.08, "Chaque mois sans structure propre,"),
    (77.44, 80.00, "c'est de la marge que vous **laissez partir**."),
    (80.54, 82.14, "Votre devis est valable **14 jours**,"),
    (82.60, 85.12, "et on ouvre un nombre limité de dossiers par semaine"),
    (85.12, 87.24, "pour garder ce niveau de suivi."),
    (87.48, 88.90, "Le bouton est **sous la vidéo**,"),
    (89.42, 91.74, "deux clics, et mon équipe vous répond dans l'heure."),
]

def storyboard(g):
    T, INTRO_DUR, BODY = g.T, g.INTRO_DUR, g.BODY
    E = []
    E.append(g.Intro())
    E.append(g.Outro())
    E.append(g.Subtitles())
    E.append(g.BrandMark(T(6.4), INTRO_DUR + BODY - 0.3))
    E.append(g.LightLeak(T(0.0) - 0.2, 2.6, 'tr', 0.20))
    # 1. Hook: credentials
    E.append(g.StatList([(T(0.0), 800, '', 'entrepreneurs accompagnés', None),
                       (T(2.24), 8, ' ans', 'de métier', None),
                       (T(3.72), 50, ' avis', '5 étoiles sur Trustpilot', 'star')], T(6.1)))
    E.append(g.LowerThird(T(0.9), T(6.0)))
    # 2. The LLC in your quote
    E.append(g.Panel(T(6.5), T(12.3), "La structure qu'on monte **le plus souvent**", eyebrow="Votre devis · LLC", ico='doc'))
    E.append(g.Panel(T(12.86), T(13.9), "Vous avez **bien choisi**", ico='check_circle'))
    # 3. How it works
    E.append(g.NumberCard(T(17.5), T(20.0), 0, "impôt aux États-Unis", eyebrow="Fiscalité", ico='building', count=False))
    E.append(g.Panel(T(20.5), T(25.7), "Vos bénéfices sont déclarés **là où vous résidez**", eyebrow="Dans la majorité des cas", ico='home'))
    E.append(g.Panel(T(27.2), T(29.5), "Nouveau-Mexique", eyebrow="Création · États-Unis", ico='pin', size=48))
    E.append(g.CheckList([(T(29.7), "Pas de rapport annuel"), (T(31.1), "Pas de taxes annuelles"),
                        (T(32.3), "Quasiment zéro contrainte administrative")], T(34.7), eyebrow="Au quotidien", start=T(29.7)))
    # 4. Objection -> reversal
    E.append(g.Panel(T(37.6), T(40.4), "Une usine à gaz ?", eyebrow="Vous vous dites peut-être", ico='question', muted=True))
    E.append(g.LightLeak(T(41.4), 2.0, 'tl', 0.12))
    E.append(g.CheckList([(T(43.0), "La structure la plus simple de notre catalogue"), (T(47.2), "La plus accessible"),
                        (T(49.1), "Adresse incluse"), (T(50.0), "Agent inclus"), (T(50.9), "Pendant 1 an")],
                       T(51.3), eyebrow="Ce qui est inclus", start=T(43.0)))
    # 5. Proof
    E.append(g.Panel(T(52.9), T(57.0), "Tout est **vérifiable** : registre officiel de l'État", eyebrow="Transparence", ico='shield', size=38))
    E.append(g.NumberCard(T(57.3), T(60.1), 800, "clients avant vous", eyebrow="Comme", ico='check'))
    # 6. Projection timeline
    E.append(g.LightLeak(T(62.1), 2.2, 'tr', 0.14))
    E.append(g.Timeline([(T(63.4), "Aujourd'hui", "Vous signez"), (T(64.4), "Demain", "Création lancée"),
                       (T(65.8), "Quelques jours", "Vous facturez avec votre LLC")], T(69.1), start=T(63.4)))
    # 7. Cost of inaction
    E.append(g.Panel(T(75.6), T(80.0), "Chaque mois sans structure, c'est de la **marge qui part**", eyebrow="Le vrai risque", ico='trend_down', size=38))
    # 8. Urgency
    E.append(g.NumberCard(T(80.6), T(82.1), 14, "jours de validité du devis", eyebrow="Votre devis", ico='clock', count=False))
    E.append(g.Panel(T(82.8), T(87.2), "Nombre **limité** de dossiers par semaine", eyebrow="Pour garder ce niveau de suivi", ico='doc', size=38))
    # 9. CTA
    E.append(g.CTAArrow(T(88.0), T(89.3)))
    E.append(g.NumberCard(T(89.4), INTRO_DUR + BODY - 0.1, 2, "clics", eyebrow="C'est simple", ico='cursor', count=False))
    E.append(g.Panel(T(90.0), INTRO_DUR + BODY - 0.1, "Votre équipe vous répond **au plus vite**", ico='clock', size=36))
    E.append(g.LightLeak(T(87.4), 2.4, 'tl', 0.14))
    E[-2] = g.Lower(E[-2], 330)        # "répond au plus vite" panel below the "2 clics" card
    return E

