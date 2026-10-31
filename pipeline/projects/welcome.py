# -*- coding: utf-8 -*-
"""Project: welcome / onboarding video ("Félicitations… Bienvenue chez Fynovates") — cuts, subtitles, storyboard, outro."""

NAME = "Tiziana"
TITLE = "Fondatrice"
MUSIC_GAIN_DB = -9.0
MUSIC_PEAK_SRC = 84.18          # "Le créneau est bloqué pour vous" -> music swell on the closing
SRC_END = 89.15                 # "À très vite." ends ~88.96

# Pauses > 0.42 s shortened to ~0.3 s (a 0.6 s beat is kept after "Bienvenue chez Fynovates").
# Block-by-block transcription found no retake; two noises inside long pauses (52.7 s, 74.7-75.4 s) are removed.
CUTS = [
    (1.04, 1.31), (2.63, 3.07), (8.33, 8.88), (13.10, 13.25), (14.38, 15.20), (16.95, 19.87),
    (24.56, 25.36), (29.93, 30.06), (30.75, 31.05), (32.08, 32.77), (34.30, 34.90), (40.24, 40.45),
    (41.88, 42.43), (44.00, 45.57), (46.61, 47.16), (48.09, 48.58), (50.24, 53.88), (55.17, 55.45),
    (57.51, 58.35), (59.72, 60.04), (60.88, 62.84), (65.12, 65.78), (66.91, 68.79), (69.81, 70.07),
    (73.85, 79.05), (80.68, 80.81), (82.93, 84.02), (85.99, 86.74), (87.83, 88.28),
]

OUTRO = dict(h1="Bienvenue chez Fynovates", h2="Votre dossier est ouvert, la machine tourne",
             h3="Soyez au rendez-vous, à très vite", arrow=False, icon3='clock')

SUBS = [
    (0.00, 0.86, "Félicitations !"),
    (1.38, 3.14, "Vous venez de faire quelque chose"),
    (3.14, 8.36, "que **95 %** des entrepreneurs ne font jamais :"),
    (9.20, 11.64, "arrêtez de subir leur fiscalité"),
    (11.64, 14.74, "et **décidez de la structurer**."),
    (15.48, 16.60, "Bienvenue chez **Fynovates**."),
    (20.06, 24.56, "Jusqu'ici, vous étiez un entrepreneur qui gagne de l'argent"),
    (24.56, 27.86, "et qui en reverse une partie"),
    (27.86, 32.02, "sans vraiment savoir pourquoi, ni combien."),
    (32.86, 34.82, "À partir d'aujourd'hui,"),
    (35.02, 40.18, "vous faites partie de ceux qui **décident** où va leur argent,"),
    (40.66, 42.04, "dans quelle structure,"),
    (42.64, 45.14, "sous quelle juridiction,"),
    (45.92, 50.20, "légalement, proprement, et **avec un plan**."),
    (53.96, 57.84, "Et la preuve que vous avez **changé de catégorie** :"),
    (57.84, 60.82, "pendant que vous regardez cette vidéo,"),
    (62.96, 66.84, "la constitution de votre structure est **déjà lancée**."),
    (68.88, 70.00, "On n'attend pas."),
    (70.32, 73.60, "Votre dossier est ouvert, la machine tourne."),
    (78.88, 80.92, "Soyez dans un endroit calme,"),
    (81.08, 82.88, "votre ordinateur, vos chiffres."),
    (84.18, 86.16, "Le créneau est **bloqué pour vous**."),
    (86.86, 88.08, "Soyez au rendez-vous."),
    (88.28, 89.00, "À très vite."),
]

def storyboard(g):
    T, INTRO_DUR, BODY = g.T, g.INTRO_DUR, g.BODY
    END = INTRO_DUR + BODY - 0.1
    E = [g.Intro(), g.Outro(), g.Subtitles(), g.BrandMark(T(9.0), END - 0.2)]
    E.append(g.LightLeak(T(0.0) - 0.2, 2.6, 'tr', 0.20))
    E.append(g.LowerThird(T(1.4), T(6.6)))
    E.append(g.NumberCard(T(4.6), T(8.4), "95 %", "des entrepreneurs ne le font jamais", eyebrow="Vous venez de faire ce que", count=False))
    E.append(g.Panel(T(9.3), T(14.7), "Arrêtez de subir, **décidez de structurer**", eyebrow="Votre fiscalité", ico='check_circle', size=38))
    E.append(g.LightLeak(T(15.3), 2.4, 'tl', 0.16))
    E.append(g.Panel(T(15.5), T(19.95), "Bienvenue chez **FYNOVATES**", ico='star', size=44))
    # Before / after
    E.append(g.Panel(T(20.2), T(27.8), "Un entrepreneur qui gagne de l'argent et qui en reverse une partie", eyebrow="Jusqu'ici", ico='question', size=32, muted=True))
    E.append(g.Panel(T(27.9), T(32.0), "Sans vraiment savoir pourquoi, ni combien", eyebrow="Jusqu'ici", ico='question', size=34, muted=True))
    E.append(g.Panel(T(32.9), T(38.2), "Vous faites partie de ceux qui **décident**", eyebrow="À partir d'aujourd'hui", ico='check_circle', size=36))
    E.append(g.CheckList([(T(38.5), "Où va votre argent"), (T(40.7), "Dans quelle structure"), (T(42.7), "Sous quelle juridiction"),
                          (T(45.9), "Légalement, proprement"), (T(48.9), "Avec un plan")], T(50.2), eyebrow="Vous décidez", start=T(38.4)))
    # Proof: already in motion
    E.append(g.Panel(T(54.0), T(60.8), "Vous avez **changé de catégorie**", eyebrow="La preuve", ico='shield', size=40))
    E.append(g.LightLeak(T(62.9), 2.2, 'tr', 0.14))
    E.append(g.Panel(T(63.0), T(66.8), "La constitution de votre structure est **déjà lancée**", eyebrow="Pendant que vous regardez cette vidéo", ico='doc', size=34))
    E.append(g.CheckList([(T(70.3), "Votre dossier est ouvert"), (T(72.3), "La machine tourne")], T(73.6), eyebrow="On n'attend pas", start=T(68.9)))
    # The call
    E.append(g.CheckList([(T(79.0), "Un endroit calme"), (T(81.1), "Votre ordinateur"), (T(82.4), "Vos chiffres")], T(82.9), eyebrow="Pour votre rendez-vous", start=T(78.9)))
    E.append(g.Panel(T(84.2), T(86.2), "Le créneau est **bloqué pour vous**", eyebrow="Votre rendez-vous", ico='clock', size=40))
    E.append(g.LightLeak(T(86.8), 2.4, 'tl', 0.14))
    E.append(g.Panel(T(86.9), END, "**Soyez au rendez-vous.** À très vite.", ico='check_circle', size=38))
    return E
