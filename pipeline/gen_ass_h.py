# -*- coding: utf-8 -*-
# Sous-titres HOLDING : Inter Black 900, MAJUSCULES, blanc + contour navy epais,
# mots-cles en indigo #4F6BFF, pop-in scale 0.8->1 (100ms), centre-bas ~65%,
# safe zones Instagram. Pas d'em-dash. Emphase (HOLDING/FORTUNE...) = groupe agrandi.
import re

# (start, end, big, TEXT)  ~mot~ => indigo. big=1 -> police agrandie (emphase)
CAPS = [
    (0.00, 1.56, 1, "LA ~HOLDING~ SÉPARE"),
    (1.56, 2.84, 0, "TON PATRIMOINE"),
    (2.84, 4.74, 0, "DE TON EXPLOITATION"),
    (4.74, 6.08, 0, "L'ARGENT QUE TES SOCIÉTÉS"),
    (6.08, 7.40, 0, "GÉNÈRENT, PEUT ~REMONTER~"),
    (7.40, 8.77, 1, "DANS LA ~HOLDING~"),
    (8.77, 9.74, 1, "Y ÊTRE ~STOCKÉ~"),
    (9.74, 11.31, 1, "Y ÊTRE ~RÉINVESTI~"),
    (11.31, 12.70, 0, "SANS PASSER PAR"),
    (12.70, 13.86, 0, "TA POCHE PERSO"),
    (13.86, 15.79, 0, "ET CE PASSAGE"),
    (15.79, 16.99, 0, "PAR TA POCHE PERSO"),
    (16.99, 18.61, 1, "~FISCALEMENT~"),
    (18.61, 19.82, 0, "ÇA TE COÛTE"),
    # 19.85-20.75 : le mot FORTUNE est porte par l'overlay plein ecran (hfortune)
]

FONT = "Inter Black"
FS_BASE = 84
FS_BIG = 104
WHITE = "&H00FFFFFF"
NAVY_OUT = "&H0035150F"    # contour navy #0F1535 (AABBGGRR)
INDIGO = "&HFF6B4F&"       # #4F6BFF inline
WHT = "&HFFFFFF&"

def ts(t):
    h = int(t // 3600); t -= h*3600
    m = int(t // 60); t -= m*60
    s = int(t); cs = int(round((t - s)*100))
    if cs == 100: s += 1; cs = 0
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

def markup(text):
    text = text.upper()
    return re.sub(r"~([^~]+)~", lambda m: f"{{\\c{INDIGO}}}{m.group(1)}{{\\c{WHT}}}", text)

# Pop-in scale 0.8 -> 1 en 100ms (+ leger fondu)
def anim():
    return r"{\fad(40,40)\fscx80\fscy80\t(0,100,\fscx100\fscy100)}"

# Style: contour navy epais (Outline=9), ombre douce (3), sans boite (BorderStyle 1),
# alignement bas-centre, MarginV 560 -> texte centre ~65% hauteur, dans les safe zones.
def style(name, fs):
    return (f"Style: {name},{FONT},{fs},{WHITE},&H000000FF,{NAVY_OUT},&H64000000,"
            f"0,0,0,0,100,100,0.6,0,1,9,3,2,90,90,560,1")

header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{style('Base', FS_BASE)}
{style('Big', FS_BIG)}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

lines = []
for (s, e, big, t) in CAPS:
    st = 'Big' if big else 'Base'
    lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},{st},,0,0,0,,{anim()}{markup(t)}")

with open('subs_h.ass', 'w') as fh:
    fh.write(header + "\n".join(lines) + "\n")

import json as _json
_json.dump([{'t': round(s, 3)} for (s, e, b, t) in CAPS], open('subs_h_meta.json', 'w'))
print("captions:", len(CAPS), "-> subs_h.ass")
