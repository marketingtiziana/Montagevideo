# -*- coding: utf-8 -*-
# Sous-titres animés AUTO à partir de la transcription mot-à-mot (words.json).
# Réutilise le style du pipeline (blanc gras/compact, accents colorés, variation
# de police A/H/B, animations d'entrée, sans boîte) mais cale chaque carte sur
# le timing RÉEL des mots -> parfaitement synchro avec n'importe quelle source.
#
# Corrections de texte (le modèle Whisper base fait des fautes) + accents (~mot~)
# sont pilotés par CORRECTIONS : {index_de_carte: "texte corrigé avec ~accents~"}.
import json, re

words = json.load(open('words.json'))

# --- Groupement des mots en cartes (courtes, punchy, bien synchro) ---
def group(words, max_words=3, max_dur=1.35, gap_break=0.30, max_chars=17):
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
        hard_stop = cur[-1]['w'].strip().endswith(('.', '!', '?'))
        if hard_stop or len(cur) >= max_words or dur >= max_dur or gap > gap_break or chars >= max_chars:
            cards.append(cur); cur = [x]
        else:
            cur.append(x)
    if cur:
        cards.append(cur)
    return cards

cards = group(words)

# raw (start, end, text) with end clamped to next card start (no overlap, no long gaps kept short)
raw = []
for i, c in enumerate(cards):
    s = c[0]['t0']
    e = c[-1]['t1']
    txt = ' '.join(w['w'].strip() for w in c)
    txt = re.sub(r'\s+([,.;:!?])', r'\1', txt).strip()
    raw.append([round(s, 3), round(e, 3), txt])
for i in range(len(raw) - 1):
    ns = raw[i + 1][0]
    if raw[i][1] > ns:
        raw[i][1] = ns
    # comble les micro-trous (<0.28s) pour éviter le flicker, garde les vraies pauses
    if 0 <= (ns - raw[i][1]) < 0.28:
        raw[i][1] = ns

# --- Corrections + accents (~mot~ = couleur) + *mot* = police+couleur ---
# Clé = index de carte tel qu'imprimé par --dump. Absent -> texte brut en majuscules.
CORRECTIONS = {
    0:  "Si t'as facturé",
    1:  "la ~mauvaise TVA~",
    2:  "ou ~pas de~",
    3:  "~TVA~ du tout",
    4:  "l'argent que",
    5:  "t'aurais dû ~récolter~",
    6:  "l'État te le",
    7:  "~réclame~ quand même",
    8:  "sauf que là",
    9:  "tu l'as ~plus~",
    10: "il sort de",
    11: "*ta poche*",
    12: "la ~bonne nouvelle~",
    13: "il existe un",
    14: "*système* pour ~éviter~",
    15: "de t'enregistrer",
    16: "dans ~3 pays~",
    17: "tu déclares toute",
    18: "cette ~TVA~",
    19: "~européenne~ au même",
    20: "endroit, en une",
    21: "*seule* déclaration",
    22: "ça s'appelle le",
    23: "*guichet unique*",
    24: "encore faut-il savoir",
    25: "que ça ~existe~",
    26: "et le mettre",
    27: "en place ~correctement~",
    28: "et c'est exactement",
    29: "ce qu'on ~gère~",
    30: "dès le ~départ~",
    31: "la TVA *internationale*",
    32: "ça se ~rattrape pas~",
    33: "en *panique*",
    34: "ça se conçoit",
    35: "en même temps",
    36: "que ta ~structure~",
    37: "si tu vends",
    38: "à ~l'international~",
    39: "et que t'as",
    40: "un *doute*",
    41: "commente « ~TVA~ »",
    42: "on regarde si t'es",
    43: "~en règle~",
}

FONTS = {'A': 'Anton', 'H': 'Archivo Black', 'B': 'Bebas Neue'}
SIZES = {'A': 108, 'H': 94, 'B': 130}
ORDER = ['A', 'H', 'B']

WHITE = "&H00FFFFFF"
WHT_INLINE = "&HFFFFFF&"
ACCENTS = ["&H00FFFF&", "&HFFFF00&", "&H6EE03E&", "&HF05CFF&", "&H1C9FFF&"]  # jaune,cyan,vert,rose,orange
_acc = [0]

def ts(t):
    h = int(t // 3600); t -= h * 3600
    m = int(t // 60); t -= m * 60
    s = int(t); cs = int(round((t - s) * 100))
    if cs == 100: s += 1; cs = 0
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

def markup(text, cardkey):
    fam = FONTS[cardkey]
    alt = 'Bebas Neue' if cardkey != 'B' else 'Archivo Black'
    text = text.upper()
    def styl(m):
        col = ACCENTS[_acc[0] % len(ACCENTS)]; _acc[0] += 1
        return f"{{\\fn{alt}\\c{col}}}{m.group(1)}{{\\fn{fam}\\c{WHT_INLINE}}}"
    def acc(m):
        col = ACCENTS[_acc[0] % len(ACCENTS)]; _acc[0] += 1
        return f"{{\\c{col}}}{m.group(1)}{{\\c{WHT_INLINE}}}"
    text = re.sub(r"\*([^*]+)\*", styl, text)
    text = re.sub(r"~([^~]+)~", acc, text)
    return text

PRESETS = [
    r"{\fad(45,40)\fscx55\fscy55\t(0,110,\fscx108\fscy108)\t(110,190,\fscx100\fscy100)}",
    r"{\fad(40,40)\blur9\fscx90\fscy90\t(0,170,\blur0)\t(0,170,\fscx100\fscy100)}",
    r"{\fad(40,40)\fscx145\fscy145\t(0,150,\fscx100\fscy100)}",
    r"{\fad(40,30)\fscx58\fscy58\t(0,85,\fscx113\fscy113)\t(85,140,\fscx93\fscy93)\t(140,205,\fscx100\fscy100)}",
    r"{\fad(40,40)\frz7\fscx82\fscy82\t(0,160,\frz0)\t(0,160,\fscx100\fscy100)}",
    r"{\fad(35,40)\fscy45\t(0,140,\fscy110)\t(140,200,\fscy100)}",
    r"{\fad(30,40)\fscx180\fscy180\t(0,90,\fscx94\fscy94)\t(90,150,\fscx100\fscy100)}",
    r"{\fad(50,50)\fscx88\fscy88\t(0,130,\fscx104\fscy104)\t(130,260,\fscx100\fscy100)}",
]

styles = []
for k, fam in FONTS.items():
    styles.append(
        f"Style: {k},{fam},{SIZES[k]},{WHITE},&H000000FF,&H00101010,&H90000000,"
        f"0,0,0,0,100,100,1,0,1,6,4,2,110,110,560,1"
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
{chr(10).join(styles)}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

if __name__ == '__main__':
    import sys
    if '--dump' in sys.argv:
        for i, (s, e, t) in enumerate(raw):
            print(f"{i:2d}  {s:6.2f} {e:6.2f}  {t}")
        raise SystemExit

    lines = []
    meta = []
    for i, (s, e, t) in enumerate(raw):
        key = ORDER[i % 3]
        text = CORRECTIONS.get(i, t)
        anim = PRESETS[i % len(PRESETS)]
        lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},{key},,0,0,0,,{anim}{markup(text, key)}")
        meta.append({'t': round(s, 3), 'accent': ('~' in text or '*' in text)})
    with open('subs.ass', 'w') as fh:
        fh.write(header + "\n".join(lines) + "\n")
    json.dump(meta, open('subs_meta.json', 'w'))
    print("captions:", len(raw), "-> subs.ass (+subs_meta.json)")
