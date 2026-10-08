# -*- coding: utf-8 -*-
"""FICHIER DE PROJET — reel B-roll 10 s a partir d'une photo fixe.

Modifier ce fichier puis relancer `bash reel_broll/build.sh` regenere le reel.
Aucune voix : musique seule + un hook qui s'affiche.
"""

SRC = "still.jpg"            # source : photo (.jpg/.png) OU video (.mp4/.mov)
SRC_START = 0.0             # video seulement : debut de la fenetre a garder (s)
OUT = "final_broll.mp4"
OUT_W, OUT_H = 1080, 1920
FPS = 30
DURATION = 10.0             # duree exacte du reel (s)

# ---------------------------------------------------------------------------
# 1. MOUVEMENT DE CAMERA
# ---------------------------------------------------------------------------
# PHOTO : Ken Burns. Une image fixe doit respirer, sinon c'est un diaporama ;
#         un zoom lent ancre sur le visage suffit, 10 % sur 10 s.
# VIDEO : le mouvement existe deja. Le zoom sert alors seulement a resserrer
#         le cadrage, et le recadrage SUIT LE VISAGE image par image (position
#         lissee), donc un zoom ne decadre jamais le sujet.
#         Mettre ZOOM_START = ZOOM_END = 1.0 pour une coupe franche sans zoom.
ZOOM_START = 1.000
ZOOM_END   = 1.080
# Point vers lequel le cadre derive (fractions de l'image source).
# Le visage detecte est centre en (0.567, 0.399).
ANCHOR_X, ANCHOR_Y = 0.567, 0.440
ANCHOR_PULL = 0.35          # 0 = zoom centre image ; 1 = zoom plein sur l'ancre
                            # (photo seulement ; en video on suit le visage reel)
TRACK_SMOOTH = 20           # video : lissage de la trajectoire du visage (+/- images)
FOLLOW = 0.80               # video : 1.0 = colle au visage ; <1 laisse respirer

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
SCRIM_ALPHA  = 0.0          # 0 = pas de voile (le cartouche porte le texte)

# ---------------------------------------------------------------------------
# 3. HOOK — cartouche blanc + mention, dans le style demande
# ---------------------------------------------------------------------------
# Deux lignes centrees, noir sur cartouche blanc arronde ; la largeur du
# cartouche suit le texte (il ne reste jamais de blanc vide sur les cotes).
HOOK = [
    "POURQUOI S’EXPATRIER",
    "NE SUFFIT PAS ?",
]
HOOK_SUB = "LIS LA DESCRIPTION"       # mention sous le cartouche ; "" pour l'enlever

# Liberation Sans Bold = clone metrique d'Arial, la graisse du modele.
HOOK_FONT = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
HOOK_CAP = 45                 # hauteur de capitale visee (px) — releve sur le modele
HOOK_PITCH = 72               # pas entre les deux lignes (px)
HOOK_PAD_X = 37               # marge laterale dans le cartouche
HOOK_PAD_TOP, HOOK_PAD_BOTTOM = 34, 32
HOOK_RADIUS = 20              # rayon des coins
HOOK_MAX_W = 0.86             # largeur max du cartouche ; au-dela la police retrecit
HOOK_Y = 0.615                # haut du cartouche (fraction de hauteur)

SUB_CAP = 32                  # hauteur de capitale de la mention
SUB_GAP = 29                  # ecart entre le cartouche et la mention
SUB_STROKE = 5                # contour noir : lisible sur n'importe quel fond

HOOK_IN = 0.45                # apparition du cartouche (s)
SUB_IN = 0.60                 # apparition de la mention (s)
HOOK_RISE = 26                # montee a l'apparition (px)
HOOK_FADE = 0.26              # duree du fondu d'apparition (s)

# ---------------------------------------------------------------------------
# 4. SON — musique seule, aucune voix
# ---------------------------------------------------------------------------
MUSIC = True
MUSIC_BPM = 96              # 4 mesures de 2,5 s = 10 s pile
MUSIC_GAIN = 0.60
WHOOSH_AT = 0.45            # bruitage sur l'arrivee du hook
WHOOSH_GAIN = 0.16
TARGET_LUFS = -14.0         # norme plateformes
