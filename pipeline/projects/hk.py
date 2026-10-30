# -*- coding: utf-8 -*-
"""Project: Hong Kong follow-up video (devis) — cuts, subtitles, storyboard, outro."""

NAME = "Tiziana"
TITLE = "Fondatrice"
MUSIC_GAIN_DB = -9.0
MUSIC_PEAK_SRC = 126.28         # "Le bouton est juste sous cette vidéo" -> music swell lands here
SRC_END = 133.10                # last word ends at 132.78 s

# Silences > 0.42 s shortened to ~0.3 s, plus two retakes removed:
#  - "Et parmi tous ces clients," (6.4-7.4) restarted as "et parmi tous nos clients" -> keep the second
#  - "Une saucisse dans une..." flub (42.2-44.4) + 14.7 s dead air; the whole passage from 35.3 is redone at 57.2
CUTS = [
    (6.00, 8.05), (9.35, 9.52), (12.64, 13.00), (15.36, 15.53), (16.37, 16.60), (22.33, 22.67),
    (35.08, 57.14), (61.04, 61.22), (61.77, 61.98), (63.06, 63.32), (64.71, 65.05), (68.31, 68.82),
    (70.15, 73.10), (75.41, 76.94), (80.28, 80.48), (82.70, 85.71), (93.36, 93.56), (95.31, 95.51),
    (101.13, 101.37), (102.82, 104.09), (107.94, 108.65), (110.59, 110.96), (114.12, 115.23),
    (121.59, 121.74), (122.68, 122.96), (123.68, 124.53), (129.76, 130.08),
]

OUTRO = dict(h1="Validez votre devis", h2="Le bouton est sous la vidéo",
             h3="Votre équipe vous répond au plus vite", arrow=True, icon3='clock')

SUBS = [
    (0.00, 3.02, "8 ans, 800 entrepreneurs structurés,"),
    (3.36, 5.94, "50 avis, 5 étoiles sur Trustpilot."),
    (8.12, 9.20, "Et parmi tous nos clients,"),
    (9.64, 12.60, "ceux qui choisissent **Hong Kong** sont ceux qui voient plus loin."),
    (13.10, 15.44, "Vous en faites partie, votre devis est devant vous."),
    (15.74, 16.56, "Parlons chiffres."),
    (16.76, 22.44, "**8,25 %** d'imposition jusqu'à environ 240 000 € de bénéfices."),
    (22.72, 24.78, "**16,5 %** au-delà."),
    (24.92, 27.22, "Faites le calcul avec votre imposition actuelle."),
    (27.94, 31.74, "Sur une seule année, la différence paye ce devis **plusieurs fois**."),
    (32.06, 35.08, "Chaque trimestre d'hésitation est un **prix réel**."),
    (57.22, 59.42, "Vous vous dites peut-être"),
    (59.42, 61.72, "que c'est le haut de gamme de notre catalogue, c'est vrai."),
    (62.16, 64.76, "Mais regardez ce que ça **achète**."),
    (65.18, 69.90, "Une société dans une **place financière internationale**."),
    (73.18, 75.36, "Comptabilité possible en euros."),
    (77.18, 82.56, "Et surtout, un **audit annuel obligatoire** par un cabinet local."),
    (85.16, 89.16, "Ce que certains voient comme une contrainte est votre **meilleur atout**."),
    (89.42, 92.04, "Face à une banque, un partenaire, un gros client,"),
    (92.40, 95.38, "vous n'avez pas une coquille exotique."),
    (95.58, 99.14, "Vous avez une société **auditée et vérifiable**."),
    (99.50, 102.80, "Hong Kong Companies Registry, registre officiel."),
    (104.18, 107.86, "Vous signez aujourd'hui, on pose la première pierre cette semaine."),
    (107.86, 109.78, "Dans quelques semaines,"),
    (111.90, 119.62, "vous opérez depuis l'une des juridictions les plus solides au monde,"),
    (120.10, 124.06, "avec une structure pensée pour **10 ans**, pas pour 6 mois."),
    (124.72, 126.12, "Votre devis est valable **14 jours**."),
    (126.28, 127.78, "Le bouton est juste **sous cette vidéo**."),
    (128.22, 129.88, "Deux clics, signature électronique."),
    (130.22, 132.78, "Mon équipe vous confirme le lancement dans l'heure."),
]

def storyboard(g):
    T, INTRO_DUR, BODY = g.T, g.INTRO_DUR, g.BODY
    END = INTRO_DUR + BODY - 0.1
    E = [g.Intro(), g.Outro(), g.Subtitles(), g.BrandMark(T(8.2), END - 0.2)]
    E.append(g.LightLeak(T(0.0) - 0.2, 2.6, 'tr', 0.20))
    # Hook
    E.append(g.StatList([(T(0.1), 8, ' ans', "d'expérience", None),
                         (T(1.85), 800, '', 'entrepreneurs structurés', None),
                         (T(3.4), 50, ' avis', '5 étoiles sur Trustpilot', 'star')], T(5.9)))
    E.append(g.LowerThird(T(0.8), T(5.8)))
    E.append(g.Panel(T(8.3), T(12.6), "Ceux qui choisissent **Hong Kong** voient plus loin", eyebrow="Parmi tous nos clients", ico='pin', size=38))
    E.append(g.Panel(T(13.2), T(15.4), "Votre devis est devant vous", eyebrow="Vous en faites partie", ico='doc', size=40))
    # Numbers
    E.append(g.NumberCard(T(16.8), T(22.4), "8,25 %", "d'imposition jusqu'à ≈ 240 000 € de bénéfices", eyebrow="Parlons chiffres", ico='euro', count=False))
    E.append(g.NumberCard(T(22.8), T(24.8), "16,5 %", "au-delà", eyebrow="Taux supérieur", ico='euro', count=False))
    E.append(g.Panel(T(25.0), T(27.2), "Faites le calcul avec votre imposition actuelle", eyebrow="Comparez", ico='check_circle', size=36))
    E.append(g.Panel(T(28.0), T(31.7), "Sur une seule année, la différence paye ce devis **plusieurs fois**", eyebrow="Retour sur investissement", ico='euro', size=34))
    E.append(g.Panel(T(32.1), T(35.0), "Chaque trimestre d'hésitation a un **prix réel**", eyebrow="Le coût d'attendre", ico='clock', size=36))
    # Objection -> what it buys
    E.append(g.LightLeak(T(57.2), 2.2, 'tl', 0.12))
    E.append(g.Panel(T(57.3), T(61.7), "Le haut de gamme de notre catalogue ? C'est vrai.", eyebrow="Vous vous dites peut-être", ico='question', size=34, muted=True))
    E.append(g.CheckList([(T(65.4), "Une société dans une place financière internationale"), (T(73.2), "Comptabilité possible en euros"),
                          (T(77.4), "Audit annuel obligatoire par un cabinet local")], T(82.6), eyebrow="Ce que ça achète", start=T(65.2)))
    E.append(g.Panel(T(85.3), T(89.1), "La contrainte des uns est votre **meilleur atout**", eyebrow="L'audit", ico='shield', size=36))
    E.append(g.CheckList([(T(89.9), "Une banque"), (T(90.5), "Un partenaire"), (T(91.5), "Un gros client")], T(92.3), eyebrow="Face à", start=T(89.5)))
    E.append(g.Panel(T(92.6), T(95.4), "Pas une **coquille exotique**", eyebrow="Ce que vous n'avez pas", ico='cross', size=40))
    E.append(g.Panel(T(95.7), T(99.1), "Une société **auditée et vérifiable**", eyebrow="Ce que vous avez", ico='shield', size=40))
    E.append(g.Panel(T(99.6), T(102.8), "Hong Kong Companies Registry", eyebrow="Registre officiel", ico='doc', size=38))
    # Projection
    E.append(g.LightLeak(T(104.1), 2.2, 'tr', 0.14))
    E.append(g.Timeline([(T(104.4), "Aujourd'hui", "Vous signez"), (T(105.5), "Cette semaine", "Première pierre posée"),
                         (T(108.9), "Quelques semaines", "Vous opérez depuis Hong Kong"), (T(120.1), "Horizon", "Une structure pensée pour 10 ans")],
                        T(124.0), start=T(104.4)))
    # Urgency + CTA
    E.append(g.NumberCard(T(124.8), T(126.1), 14, "jours de validité du devis", eyebrow="Votre devis", ico='clock', count=False))
    E.append(g.LightLeak(T(126.2), 2.4, 'tl', 0.14))
    E.append(g.CTAArrow(T(126.4), T(128.1)))
    E.append(g.NumberCard(T(128.3), END, 2, "clics, signature électronique", eyebrow="C'est simple", ico='cursor', count=False))
    E.append(g.Lower(g.Panel(T(130.3), END, "Votre équipe vous confirme le lancement **au plus vite**", ico='clock', size=34), 330))
    return E
