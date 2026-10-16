# -*- coding: utf-8 -*-
"""FICHIER DE PROJET — tous les choix de montage sont ici.

Modifier ce fichier puis relancer `bash reel/build.sh` suffit a regenerer le
reel complet. Les temps sont exprimes en secondes sur la TIMELINE SOURCE
(source.mp4) ; le mapping vers la timeline finale est calcule automatiquement
par `map_time()`.
"""

SRC = "source.mp4"
OUT_W, OUT_H = 1080, 1920
FPS = 30

# ---------------------------------------------------------------------------
# 1. SEGMENTS CONSERVES
# ---------------------------------------------------------------------------
# (debut, fin, zoom_debut, zoom_fin, note)
#
# Les coupes retirent : silences, hesitations ("ou souvent peut-etre"),
# qualificatifs qui cassent le rythme ("sans etre dans une parano evidemment"),
# et la chute faible "par exemple" qui affaiblissait la punchline Ferrari/Twingo.
#
# zoom : 1.00 = cadrage source ; 1.20 = punch-in serre. Le recadrage SUIT LE
# VISAGE (voir face_track.json), donc un zoom ne decadre jamais le sujet.
SEGMENTS = [
    # --- HOOK : la these contrariante, sans aucune intro ---
    (0.62,  4.12, 1.05, 1.11, "HOOK — gagner de l'argent ne rend pas heureux"),
    # --- Punchline qui detend : on relache le cadre ---
    (4.14,  8.06, 1.00, 1.02, "Ferrari / Twingo (chute 'par exemple' coupee)"),
    # --- LE PROBLEME : on resserre ---
    (9.82, 12.72, 1.13, 1.16, "ca aboutit a une solitude"),
    (16.22, 18.48, 1.20, 1.22, "socialement on n'est pas compris — plan le plus serre"),
    (18.54, 21.28, 1.01, 1.03, "l'autre cote de la barriere — respiration"),
    # --- La reponse : rester humain ---
    (24.05, 24.95, 1.16, 1.17, "RESTER HUMAIN (filler 'donc je pense que' coupe)"),
    (25.40, 30.08, 1.03, 1.07, "avec n'importe quel type de classe sociale"),
    (31.47, 32.60, 1.12, 1.14, "garder les pieds sur terre"),
    (33.02, 34.56, 1.18, 1.20, "l'argent ca fait pas tout — punch"),
    # --- Developpement : ce que la reussite attire ---
    (34.92, 36.80, 1.00, 1.02, "reset : nouveau chapitre"),
    (37.38, 41.60, 1.07, 1.13, "emprunter / integrer votre activite"),
    (42.38, 47.60, 1.02, 1.05, "c'est flatteur mais c'est fatigant"),
    # --- LA QUESTION : plan le plus serre + suspension ---
    (49.50, 50.20, 1.19, 1.21, "POUR QUI VOUS ETES ? — suspension par arret sur image"),
    (51.70, 55.10, 1.05, 1.08, "et pas seulement pour ce que vous faites"),
    (56.48, 60.28, 1.13, 1.16, "c'est decevant / il y a une solitude"),
    # --- Resolution ---
    (61.08, 63.30, 1.03, 1.05, "ca peut se construire"),
    (66.14, 68.72, 1.09, 1.12, "un equilibre / gagner de l'argent c'est bien"),
    (69.14, 70.62, 1.15, 1.18, "d'autres problemes arrivent apres — chute"),
]

# ---------------------------------------------------------------------------
# 2. CADRAGE / CAMERA VIRTUELLE
# ---------------------------------------------------------------------------
FACE_Y_TARGET = 0.375   # hauteur ou l'on pose le centre du visage dans le cadre
FOLLOW_X = 0.85         # 1.0 = suit le visage a 100 % ; <1 laisse respirer la compo
FOLLOW_Y = 0.70
CROSSFADE_FRAMES = 0    # 0 = cut franc (prioritaire selon le brief)

# ---------------------------------------------------------------------------
# 3. ETALONNAGE — rendu premium et naturel, peau preservee
# ---------------------------------------------------------------------------
GRADE = (
    "curves=r='0/0.012 0.25/0.245 0.75/0.775 1/0.985'"
          ":g='0/0.012 0.25/0.243 0.75/0.772 1/0.985'"
          ":b='0/0.020 0.25/0.248 0.75/0.762 1/0.975',"
    "eq=contrast=1.045:saturation=1.07:gamma=0.99,"
    "unsharp=5:5:0.42:5:5:0.0"
)

# ---------------------------------------------------------------------------
# 4. SOUS-TITRES  (temps SOURCE ; ~mot~ = mot mis en avant)
# ---------------------------------------------------------------------------
# Texte relu et corrige a la main : Whisper entendait "Galer", "ferrerie",
# "pinguin", "garder pied sur terre".
CAPTIONS = [
    (0.62,  1.38, "GAGNER DE L'ARGENT"),
    (1.38,  2.04, "C'EST BIEN"),
    (2.04,  2.74, "MAIS C'EST PAS POUR ÇA"),
    (2.74,  3.26, "QUE ÇA VA VOUS"),
    (3.26,  4.12, "RENDRE PLUS ~HEUREUX~"),

    (4.14,  5.06, "OUI, COMME ON DIT"),
    (5.06,  5.60, "C'EST TOUJOURS MIEUX"),
    (5.60,  6.08, "DE PLEURER DANS UNE"),
    (6.08,  6.72, "~FERRARI~"),
    (6.72,  7.62, "QUE DANS UNE"),
    (7.62,  8.06, "~TWINGO~"),

    (9.82, 10.92, "MAIS GAGNER DE L'ARGENT"),
    (10.92, 11.62, "ÇA ABOUTIT"),
    (11.62, 12.24, "À UNE ~SOLITUDE~"),
    (12.24, 12.72, "PARFOIS"),

    (16.22, 16.80, "~SOCIALEMENT~"),
    (16.80, 18.48, "ON N'EST PAS COMPRIS"),

    (18.54, 19.10, "VOUS VOYEZ"),
    (19.10, 20.22, "C'EST UN PEU"),
    (20.22, 21.28, "~L'AUTRE CÔTÉ~ DE LA BARRIÈRE"),

    (24.05, 24.95, "~RESTER HUMAIN~"),

    (25.40, 27.60, "AVEC N'IMPORTE"),
    (27.60, 28.32, "QUEL TYPE DE CLASSE"),
    (28.32, 28.82, "~SOCIALE~"),
    (28.82, 30.08, "ÇA PERMET QUAND MÊME"),

    (31.47, 32.60, "DE GARDER ~LES PIEDS SUR TERRE~"),

    (33.02, 33.86, "PARCE QUE L'ARGENT"),
    (33.86, 34.56, "ÇA FAIT ~PAS TOUT~"),

    (34.92, 36.00, "QUAND VOUS GAGNEZ DE L'ARGENT"),
    (36.00, 36.80, "TOUT LE MONDE"),

    (37.38, 38.34, "VEUT PEUT-ÊTRE"),
    (38.34, 39.76, "VOUS ~EMPRUNTER~ DE L'ARGENT"),
    (39.76, 40.90, "VEUT ~INTÉGRER~ VOTRE ACTIVITÉ"),
    (40.90, 41.60, "PARCE QUE VOUS AVEZ ~RÉUSSI~"),

    (42.38, 43.50, "ET OUI, OK"),
    (43.50, 44.20, "C'EST ~FLATTEUR~"),
    (44.20, 44.74, "MAIS À UN MOMENT DONNÉ"),
    (44.74, 45.90, "C'EST ~FATIGANT~"),
    (45.90, 46.42, "PARCE QUE EST-CE QUE"),
    (46.42, 47.60, "LES PERSONNES SONT ~RÉELLEMENT LÀ~"),

    (49.50, 50.20, "POUR ~QUI VOUS ÊTES~ ?"),

    (51.70, 52.32, "ET PAS SEULEMENT"),
    (52.32, 52.92, "POUR CE QUE"),
    (52.92, 53.82, "VOUS ~FAITES~"),
    (53.82, 54.46, "OU LE ~RÉSULTAT~"),
    (54.46, 55.10, "QUE VOUS AVEZ APPORTÉ"),

    (56.48, 57.06, "ET SOUVENT"),
    (57.06, 57.90, "C'EST ~DÉCEVANT~"),
    (57.90, 58.60, "DONC OUI"),
    (58.60, 59.98, "IL Y A UNE ~SOLITUDE~"),
    (59.98, 60.28, "SOUVENT"),

    (61.08, 61.86, "MAIS C'EST QUELQUE CHOSE"),
    (61.86, 62.46, "QUI PEUT QUAND MÊME"),
    (62.46, 63.30, "SE ~CONSTRUIRE~"),

    (66.14, 66.68, "POUR AVOIR VRAIMENT"),
    (66.68, 67.68, "UN ~ÉQUILIBRE~"),
    (67.68, 68.28, "DONC GAGNER DE L'ARGENT"),
    (68.28, 68.72, "C'EST BIEN"),

    (69.14, 69.68, "MAIS IL Y A D'AUTRES"),
    (69.68, 70.62, "~PROBLÈMES~ QUI ARRIVENT APRÈS"),
]

CAP_FONT = "Anton"
CAP_SIZE = 118
CAP_MARGIN_V = 430          # distance au bas du cadre (zone sure TikTok)
CAP_MIN_DUR = 0.55          # duree minimale a l'ecran (lisibilite)
CAP_ACCENT = "&H004DC4FF&"  # ambre chaud (ASS = &HBBGGRR) — accorde a l'image

# ---------------------------------------------------------------------------
# 5. TEXTES A L'ECRAN — 3 seulement : probleme -> question -> resolution
# ---------------------------------------------------------------------------
# (debut, fin, texte)   places en HAUT, sur le ciel : ne masquent jamais le visage
GRAPHICS = [
    (10.30, 12.72, "LE PRIX À PAYER"),
    (45.90, 47.60, "LA VRAIE QUESTION"),
    (66.30, 68.10, "L'ÉQUILIBRE"),
]
GFX_Y = 0.088               # position verticale (fraction de la hauteur)

# ---------------------------------------------------------------------------
# 6. ARRET SUR IMAGE — une seule fois, sur la question qui doit resonner
# ---------------------------------------------------------------------------
FREEZE_AT = 50.15           # temps SOURCE ou l'on gele
FREEZE_DUR = 0.55           # duree du gel (s)

# ---------------------------------------------------------------------------
# 7. SON
# ---------------------------------------------------------------------------
# Bruitages : (temps SOURCE, type)  types : whoosh | tick | impact
SFX = [
    (9.82,  "whoosh"),    # entree du probleme
    (10.30, "tick"),      # apparition "LE PRIX A PAYER"
    (16.22, "whoosh"),    # plan le plus serre
    (34.92, "whoosh"),    # reset / nouveau chapitre
    (45.90, "tick"),      # apparition "LA VRAIE QUESTION"
    (49.50, "whoosh"),    # la question
    (50.15, "impact"),    # arret sur image
    (66.30, "tick"),      # apparition "L'EQUILIBRE"
]
SFX_GAIN = {"whoosh": 0.085, "tick": 0.10, "impact": 0.13}

MUSIC = True                # nappe d'ambiance synthetisee, tres discrete
MUSIC_GAIN = 0.040          # sous la voix, volontairement a la limite du perceptible
VOICE_LUFS = -14.0          # norme plateformes
