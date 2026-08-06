# -*- coding: utf-8 -*-
# Sous-titres style ÉDITORIAL LUXE ("old money") calqués sur la référence :
#   serif élégant (EB Garamond), minuscules, blanc, petit, centré ~2/3 hauteur,
#   mot-clé en gras, fondu doux, SANS boîte / SANS couleur néon.
# Groupés sur le timing mot-à-mot réel (words.json) -> synchro sur toute source.
import json, re

words = json.load(open('words.json'))

def group(words, max_words=3, max_dur=1.5, gap_break=0.34, max_chars=22):
    cards, cur = [], []
    for x in words:
        w = x['w'].strip()
        if not w:
            continue
        if not cur:
            cur = [x]; continue
        gap = x['t0'] - cur[-1]['t1']
        dur = cur[-1]['t1'] - cur[0]['t0']
        chars = sum(len(c['w']) for c in cur) + len(cur)
        hard = cur[-1]['w'].strip().endswith(('.', '!', '?'))
        if hard or len(cur) >= max_words or dur >= max_dur or gap > gap_break or chars >= max_chars:
            cards.append(cur); cur = [x]
        else:
            cur.append(x)
    if cur:
        cards.append(cur)
    return cards

cards = group(words)
raw = []
for c in cards:
    s = c[0]['t0']; e = c[-1]['t1']
    txt = ' '.join(w['w'].strip() for w in c)
    txt = re.sub(r'\s+([,.;:!?])', r'\1', txt).strip()
    raw.append([round(s, 3), round(e, 3), txt])
for i in range(len(raw) - 1):
    ns = raw[i + 1][0]
    if raw[i][1] > ns:
        raw[i][1] = ns
    if 0 <= (ns - raw[i][1]) < 0.30:
        raw[i][1] = ns

# Texte corrigé + *mot* = mise en avant (gras). Minuscules, pas de couleur.
CORRECTIONS = {
    0:  "si t'as facturé",
    1:  "la *mauvaise TVA*",
    2:  "ou *pas de TVA*",
    3:  "du tout",
    4:  "l'argent que",
    5:  "t'aurais dû *récolter*",
    6:  "l'État te le",
    7:  "*réclame* quand même",
    8:  "sauf que là",
    9:  "tu l'as *plus*",
    10: "il sort de",
    11: "*ta poche*",
    12: "la *bonne nouvelle*",
    13: "il existe un",
    14: "*système* pour éviter",
    15: "de t'enregistrer",
    16: "dans *3 pays*",
    17: "tu déclares toute",
    18: "cette *TVA*",
    19: "*européenne* au même",
    20: "endroit, en une",
    21: "*seule déclaration*",
    22: "ça s'appelle le",
    23: "*guichet unique*",
    24: "encore faut-il savoir",
    25: "que ça *existe*",
    26: "et le mettre",
    27: "en place *correctement*",
    28: "et c'est exactement",
    29: "ce qu'on *gère*",
    30: "dès le *départ*",
    31: "la TVA *internationale*",
    32: "ça se *rattrape pas*",
    33: "en *panique*",
    34: "ça se conçoit",
    35: "en même temps",
    36: "que ta *structure*",
    37: "si tu vends",
    38: "à *l'international*",
    39: "et que t'as",
    40: "un *doute*",
    41: "commente « *TVA* »",
    42: "on regarde si t'es",
    43: "*en règle*",
}

MAIN = "EB Garamond"

def ts(t):
    h = int(t // 3600); t -= h * 3600
    m = int(t // 60); t -= m * 60
    s = int(t); cs = int(round((t - s) * 100))
    if cs == 100: s += 1; cs = 0
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

def markup(text):
    text = text.lower()
    # *mot* -> gras (mise en avant discrète, comme la référence)
    text = re.sub(r"[*~]([^*~]+)[*~]", lambda m: f"{{\\b1}}{m.group(1)}{{\\b0}}", text)
    return text

# Style : blanc, contour quasi nul, ombre douce (lisibilité), sans boîte.
# Alignment 2 (bas-centre), MarginV eleve -> texte ~2/3 de la hauteur.
WHITE = "&H00FFFFFF"
style = (
    f"Style: Lux,{MAIN},74,{WHITE},&H00FFFFFF,&H64000000,&H78000000,"
    f"0,0,0,0,100,100,0,0,1,0,2,2,150,150,600,1"
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

# Fondu doux + micro montée d'échelle (elegant, pas de pop)
ANIM = r"{\fad(230,190)\fscx97\fscy97\t(0,220,\fscx100\fscy100)}"

if __name__ == '__main__':
    import sys
    if '--dump' in sys.argv:
        for i, (s, e, t) in enumerate(raw):
            print(f"{i:2d}  {s:6.2f} {e:6.2f}  {t}")
        raise SystemExit
    lines = []
    for i, (s, e, t) in enumerate(raw):
        text = CORRECTIONS.get(i, t)
        lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},Lux,,0,0,0,,{ANIM}{markup(text)}")
    open('subs.ass', 'w').write(header + "\n".join(lines) + "\n")
    print("captions:", len(raw), "-> subs.ass (style luxe serif)")
