# -*- coding: utf-8 -*-
"""FICHIER DE PROJET — reel B-roll 10 s a partir d'une photo fixe.

Modifier ce fichier puis relancer `bash reel_broll/build.sh` regenere le reel.
Aucune voix : musique seule + un hook qui s'affiche.
"""

SRC = "clip.mov"             # source : photo (.jpg/.png) OU video (.mp4/.mov)
SRC_START = 0.0             # video seulement : debut de la fenetre a garder (s)
SRC_LEN = 0.0               # video seulement : longueur de la fenetre dans la SOURCE.
                            # 0 = meme longueur que DURATION (vitesse normale).
                            # Sinon la fenetre est etiree sur DURATION : un rush de
                            # 9,10 s avec SRC_LEN = 9.10 et DURATION = 10 passe a 91 %
                            # de vitesse, soit un ralenti de 9 % imperceptible.
OUT = "final_broll.mp4"
OUT_W, OUT_H = 1080, 1920
FPS = 30
DURATION = 9.10             # duree du reel (s) — ici celle du rush, non modifie

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
ZOOM_END   = 1.000
# Point vers lequel le cadre derive (fractions de l'image source).
# Le visage detecte est centre en (0.567, 0.399).
ANCHOR_X, ANCHOR_Y = 0.567, 0.440
ANCHOR_PULL = 0.35          # 0 = zoom centre image ; 1 = zoom plein sur l'ancre
                            # (photo seulement ; en video on suit le visage reel)
TRACK_SMOOTH = 20           # video : lissage de la trajectoire du visage (+/- images)
FOLLOW = 0.00               # video : 1.0 = colle au visage ; <1 laisse respirer
FACE_Y_TARGET = 0.42        # video : hauteur ou l'on pose le visage dans le cadre
                            # (<0.5 = sujet dans le tiers haut, place pour le hook)

# ---------------------------------------------------------------------------
# 2. ETALONNAGE — premium et naturel, peau preservee
# ---------------------------------------------------------------------------
# "" = aucun etalonnage : l'image sort telle quelle.
GRADE = ""

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
HOOK_Y = 0.650                # haut du cartouche (fraction de hauteur)

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
MUSIC_HAT = False           # charley : False = arrangement plus calme
MUSIC_BPM = 0               # 0 = cale 4 mesures sur DURATION (la boucle tombe juste)
MUSIC_GAIN = 0.60
WHOOSH_AT = 0.0             # 0 = aucun bruitage (musique seule)
WHOOSH_GAIN = 0.16
TARGET_LUFS = -14.0         # norme plateformes
