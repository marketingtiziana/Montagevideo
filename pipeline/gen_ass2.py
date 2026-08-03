# -*- coding: utf-8 -*-
# Sous-titres BLANC minimalistes animes pour CE reel.
# Regle utilisateur: pas de surlignage, pas d'arriere-plan/boite -> juste un
# contour + ombre fins pour la lisibilite. Police grasse minimaliste (Archivo Black),
# 100% blanc, majuscules, animation "pop" discrete. Emphase = taille (pas de couleur).
# Textes corriges (le modele base fait des fautes) et cales sur les timings mots.

# (start, end, size, TEXT)   size: 0=normal(100), 1=punch(118)
CAPS = [
    (0.00, 0.61, 0, "VOUS AVEZ DÉJÀ"),
    (0.61, 0.97, 0, "RÉFLÉCHI…"),
    (0.97, 2.00, 0, "SI DEMAIN"),
    (2.00, 3.17, 0, "VOTRE BUSINESS S'ARRÊTAIT"),
    (3.17, 4.68, 1, "VOUS FERIEZ QUOI ?"),
    (4.68, 5.48, 0, "ET LÀ, JE VOIS"),
    (5.48, 6.66, 0, "L'ERREUR DE BEAUCOUP"),
    (6.66, 8.33, 1, "ILS N'ONT PAS PRÉVU"),
    (8.33, 9.96, 0, "PRÉVOIR, C'EST QUOI ?"),
    (9.96, 11.53, 0, "COMMENCER À APPLIQUER"),
    (11.53, 12.56, 1, "LA RÈGLE DE 3"),
    (12.56, 14.10, 0, "UNE PARTIE POUR VIVRE"),
    (14.10, 15.76, 1, "POUR VIVRE"),
    (15.76, 16.69, 0, "UNE PARTIE POUR LE"),
    (16.69, 17.76, 1, "FOND DE ROULEMENT"),
    (17.76, 18.70, 0, "LE FONCTIONNEMENT"),
    (18.70, 19.35, 0, "DE L'ENTREPRISE"),
    (19.35, 20.09, 0, "SES FRAIS"),
    (20.09, 20.93, 1, "MENSUELS"),
    (21.00, 22.16, 0, "UNE PARTIE POUR INVESTIR"),
    (22.16, 23.32, 1, "OU METTRE DE CÔTÉ"),
    (23.32, 26.28, 0, "QUAND ON PRÉVOIT"),
    (26.28, 28.17, 0, "DES CHOSES COMME ÇA"),
    (28.17, 29.79, 0, "ÇA PERMET DE MOINS"),
    (29.79, 30.88, 1, "STRESSER"),
    (30.88, 31.73, 0, "SI VOTRE ACTIVITÉ"),
    (31.73, 32.60, 0, "NE FONCTIONNE PAS"),
    (32.60, 33.47, 0, "MAIS POSEZ-VOUS"),
    (33.47, 34.41, 1, "CETTE QUESTION"),
    (34.41, 36.36, 0, "SI DEMAIN VOTRE ACTIVITÉ"),
    (36.36, 37.30, 0, "S'ARRÊTE…"),
    (37.30, 38.05, 0, "COMBIEN DE TEMPS"),
    (38.05, 38.54, 1, "VOUS TENEZ ?"),
    (38.54, 40.43, 1, "QU'AVEZ-VOUS MIS EN PLACE ?"),
    (40.43, 41.40, 0, "D'AUTRES INVESTISSEMENTS"),
    (41.40, 42.68, 0, "DANS D'AUTRES CHOSES"),
    (42.68, 43.64, 0, "QUI PERMETTENT"),
    (43.64, 45.16, 1, "QUE VOTRE TRAIN DE VIE"),
    (45.16, 46.50, 1, "NE SOIT PAS IMPACTÉ ?"),
]

FONT = "Archivo Black"
BASE_FS = 96
PUNCH_FS = 116
WHITE = "&H00FFFFFF"

def ts(t):
    h = int(t // 3600); t -= h*3600
    m = int(t // 60); t -= m*60
    s = int(t); cs = int(round((t - s)*100))
    if cs == 100: s += 1; cs = 0
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

# close micro-gaps to avoid flicker, keep real pauses
caps = sorted(CAPS, key=lambda c: c[0])
fixed = []
for i, (s, e, sz, t) in enumerate(caps):
    if i+1 < len(caps):
        ns = caps[i+1][0]
        if 0 <= (ns - e) < 0.18:
            e = ns
        if e > ns:
            e = ns
    fixed.append((s, e, sz, t))

# Animations minimalistes: surtout un pop propre; ouverture de section = fondu-flou.
POP  = r"{\fad(55,45)\fscx84\fscy84\t(0,130,\fscx100\fscy100)}"
SOFT = r"{\fad(75,55)\blur6\fscx94\fscy94\t(0,150,\blur0)\t(0,150,\fscx100\fscy100)}"

# Style: BorderStyle 1 (contour+ombre, PAS de boite), contour fin, ombre douce.
# Outline=4 (contour sombre fin) Shadow=3 -> lisible sans "surlignage/arriere-plan".
style = (
    f"Style: Main,{FONT},{BASE_FS},{WHITE},&H000000FF,&H0A000000,&H64000000,"
    f"0,0,0,0,100,100,0.5,0,1,4,3,2,120,120,520,1"
)

header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{style}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

lines = []
for i, (s, e, sz, t) in enumerate(fixed):
    anim = SOFT if (i % 6 == 0) else POP
    fs = PUNCH_FS if sz else BASE_FS
    lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},Main,,0,0,0,,{anim}{{\\fs{fs}}}{t}")

with open('subs.ass', 'w') as fh:
    fh.write(header + "\n".join(lines) + "\n")

import json as _json
_json.dump([{'t': round(s, 3)} for (s, e, sz, t) in fixed], open('subs_meta.json', 'w'))
print("captions:", len(fixed), "-> subs.ass")
