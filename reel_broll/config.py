# -*- coding: utf-8 -*-
"""FICHIER DE PROJET — reel B-roll 10 s a partir d'une photo fixe.

Modifier ce fichier puis relancer `bash reel_broll/build.sh` regenere le reel.
Aucune voix : musique seule + un hook qui s'affiche.
"""

SRC = "still.jpg"            # photo source (9:16)
OUT = "final_broll.mp4"
OUT_W, OUT_H = 1080, 1920
FPS = 30
DURATION = 10.0             # duree exacte du reel (s)

# ---------------------------------------------------------------------------
# 1. MOUVEMENT DE CAMERA  (Ken Burns : une photo fixe doit respirer)
# ---------------------------------------------------------------------------
# Un zoom lent et regulier, ancre sur le visage : le cadre se resserre sans
# jamais decadrer. Trop de zoom = effet diaporama ; 10 % suffisent sur 10 s.
ZOOM_START = 1.000
ZOOM_END   = 1.080
# Point vers lequel le cadre derive (fractions de l'image source).
# Le visage detecte est centre en (0.567, 0.399).
ANCHOR_X, ANCHOR_Y = 0.567, 0.440
ANCHOR_PULL = 0.35          # 0 = zoom centre image ; 1 = zoom plein sur l'ancre

# ---------------------------------------------------------------------------
# 2. ETALONNAGE — premium et naturel, peau preservee
# ---------------------------------------------------------------------------
GRADE = (
    "curves=r='0/0.015 0.25/0.248 0.75/0.780 1/0.988'"
          ":g='0/0.015 0.25/0.245 0.75/0.775 1/0.988'"
          ":b='0/0.026 0.25/0.252 0.75/0.765 1/0.978',"
    "eq=contrast=1.055:saturation=1.06:gamma=0.985,"
    "unsharp=5:5:0.50:5:5:0.0"
)

# Voile sombre en bas : rend le texte lisible sans poser de "boite" dessus.
SCRIM_TOP    = 0.50         # ou le voile commence (fraction de hauteur)
SCRIM_BOTTOM = 0.96         # ou il atteint son maximum
SCRIM_ALPHA  = 0.46         # opacite max

# ---------------------------------------------------------------------------
# 3. HOOK — le seul texte du reel
# ---------------------------------------------------------------------------
# Une ligne par element de la liste. ~mot~ = mot mis en avant (ambre).
HOOK = [
    "S'EXPATRIER",
    "NE VOUS REND PAS",
    "~NON-RÉSIDENT FISCAL~",
]
HOOK_FONT = "fonts/Anton-Regular.ttf"
HOOK_SIZE = 86
HOOK_TRACKING = 2           # interlettrage
HOOK_LINE_GAP = 12          # espace entre les lignes (px)
HOOK_X = 0.085              # bord gauche du bloc (fraction de largeur)
HOOK_Y = 0.598              # haut du bloc (fraction de hauteur) — sous le visage
HOOK_IN = 0.55              # apparition de la 1re ligne (s)
HOOK_STAGGER = 0.13         # decalage entre les lignes (s)
HOOK_RISE = 30              # montee a l'apparition (px)
HOOK_FADE = 0.34            # duree du fondu d'apparition (s)
HOOK_ACCENT = (255, 196, 77)   # ambre chaud
HOOK_WHITE = (255, 255, 255)

# Petit trait d'accent au-dessus du hook
BAR_W, BAR_H = 124, 6
BAR_GAP = 30                # espace entre le trait et la 1re ligne
BAR_IN = 0.34               # le trait arrive avant le texte

# ---------------------------------------------------------------------------
# 4. SON — musique seule, aucune voix
# ---------------------------------------------------------------------------
MUSIC = True
MUSIC_BPM = 96              # 4 mesures de 2,5 s = 10 s pile
MUSIC_GAIN = 0.60
WHOOSH_AT = 0.34            # bruitage sur l'arrivee du hook
WHOOSH_GAIN = 0.16
TARGET_LUFS = -14.0         # norme plateformes
