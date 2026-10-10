# -*- coding: utf-8 -*-
"""Sous-titres ASS : blanc compact, un seul accent chaud, animation sobre.

Parti pris : PAS de style "sous-titres automatiques" — une seule famille de
police, une seule couleur d'accent, une seule animation discrete (fondu + micro
echelle). Les mots importants sont mis en avant par la couleur, pas par un
empilement d'effets. Position basse : le visage n'est jamais masque et le texte
reste au-dessus de l'interface TikTok.
"""
import re, sys
sys.path.insert(0, "reel")
from config import (CAPTIONS, CAP_FONT, CAP_SIZE, CAP_MARGIN_V, CAP_MIN_DUR,
                    CAP_ACCENT, OUT_W, OUT_H)
from timeline import map_time, TOTAL

OUT = "subs.ass"
WHITE_INLINE = "&HFFFFFF&"
MAX_CHARS = 17          # au-dela on passe a la ligne : lisibilite mobile


def ts(t):
    t = max(0.0, t)
    h = int(t // 3600); t -= h * 3600
    m = int(t // 60); t -= m * 60
    s = int(t); cs = int(round((t - s) * 100))
    if cs == 100:
        s += 1; cs = 0
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"


def wrap(text):
    """Deux lignes maximum, coupure equilibree."""
    plain = text.replace("~", "")
    if len(plain) <= MAX_CHARS:
        return text
    words = text.split(" ")
    best, score = None, None
    for i in range(1, len(words)):
        a = " ".join(words[:i]).replace("~", "")
        b = " ".join(words[i:]).replace("~", "")
        sc = max(len(a), len(b)) + abs(len(a) - len(b)) * 0.5
        if score is None or sc < score:
            score, best = sc, (" ".join(words[:i]), " ".join(words[i:]))
    return best[0] + r"\N" + best[1]


def markup(text):
    """~mot~ -> mot en couleur d'accent, le reste en blanc."""
    return re.sub(r"~([^~]+)~",
                  lambda m: f"{{\\c{CAP_ACCENT}}}{m.group(1)}{{\\c{WHITE_INLINE}}}",
                  text)


# --- passage en timeline finale + garde-fous de lisibilite ------------------
cards = []
for (s, e, txt) in CAPTIONS:
    cards.append([map_time(s), map_time(e), txt])
cards.sort(key=lambda c: c[0])

for i, c in enumerate(cards):
    nxt = cards[i + 1][0] if i + 1 < len(cards) else TOTAL
    # on comble les micro-trous (< 0.25 s) pour eviter le clignotement
    if 0 <= nxt - c[1] < 0.25:
        c[1] = nxt
    # duree minimale a l'ecran, sans jamais chevaucher la carte suivante
    if c[1] - c[0] < CAP_MIN_DUR:
        c[1] = min(nxt, c[0] + CAP_MIN_DUR)
    if c[1] > nxt:
        c[1] = nxt

# Deux entrees seulement, alternees : la variation reste imperceptible mais
# empeche la sensation de metronome.
ANIM = [
    r"{\fad(60,50)\fscx94\fscy94\t(0,130,\fscx100\fscy100)}",
    r"{\fad(60,50)\fscx100\fscy92\t(0,140,\fscy100)}",
]

header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {OUT_W}
PlayResY: {OUT_H}
WrapStyle: 0
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: C,{CAP_FONT},{CAP_SIZE},&H00FFFFFF,&H000000FF,&H00141414,&HA0000000,0,0,0,0,100,100,1.5,0,1,5,3,2,90,90,{CAP_MARGIN_V},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

lines = []
for i, (s, e, txt) in enumerate(cards):
    if e - s < 0.05:
        continue
    lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},C,,0,0,0,,{ANIM[i % 2]}{markup(wrap(txt))}")

open(OUT, "w").write(header + "\n".join(lines) + "\n")
print(f"-> {OUT}  {len(lines)} cartes, jusqu'a {ts(cards[-1][1])}")
