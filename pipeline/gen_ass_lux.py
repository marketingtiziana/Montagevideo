# -*- coding: utf-8 -*-
# Sous-titres ÉDITORIAL LUXE + KINÉTIQUE : serif (EB Garamond), minuscules, blanc,
# discret, MAIS avec un jeu d'animations sur les mots-clés :
#   - surlignage "marqueur" qui se peint (wipe gauche->droite)
#   - cercle tracé à la main autour des mots (stroke révélé)
#   - mots posés sur un bout de papier (carton crème)
# Entrées/sorties animées (slide + scale + fade). Synchro sur words.json.
import json, re, math

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

# Texte corrigé + *mot* = mise en avant. Minuscules.
CORRECTIONS = {
    0: "si t'as facturé", 1: "la *mauvaise TVA*", 2: "ou *pas de TVA*", 3: "du tout",
    4: "l'argent que", 5: "t'aurais dû *récolter*", 6: "l'État te le", 7: "*réclame* quand même",
    8: "sauf que là", 9: "tu l'as *plus*", 10: "il sort de", 11: "*ta poche*",
    12: "la *bonne nouvelle*", 13: "il existe un", 14: "*système* pour éviter", 15: "de t'enregistrer",
    16: "dans *3 pays*", 17: "tu déclares toute", 18: "cette *TVA*", 19: "*européenne* au même",
    20: "endroit, en une", 21: "*seule déclaration*", 22: "ça s'appelle le", 23: "*guichet unique*",
    24: "encore faut-il savoir", 25: "que ça *existe*", 26: "et le mettre", 27: "en place *correctement*",
    28: "et c'est exactement", 29: "ce qu'on *gère*", 30: "dès le *départ*", 31: "la TVA *internationale*",
    32: "ça se *rattrape pas*", 33: "en *panique*", 34: "ça se conçoit", 35: "en même temps",
    36: "que ta *structure*", 37: "si tu vends", 38: "à *l'international*",
    39: "t'as un *doute*", 40: "", 41: "on regarde si", 42: "t'es *en règle*",
}

MAIN = "EB Garamond"
# Kickers éditoriaux "New York Times" : eyebrow en petites capitales espacées,
# en haut, avec un filet fin qui se trace. (start, end, texte)
KICKERS = [
    (0.30,  3.60, "LE PIÈGE À ÉVITER"),
    (11.90, 13.90, "CE QUE DIT LA RÈGLE"),
    (17.55, 19.35, "LA SOLUTION"),
    (35.70, 37.10, "L'ESSENTIEL"),
]
CX, CY = 540, 1300          # centre des sous-titres
FS = 74                     # taille de police
GLYPH = 0.455 * FS          # largeur moyenne d'un glyphe (estim.)

# Palette éditoriale feutrée
INK      = "&H00201A16"      # encre (texte sur papier)
HL_COL   = "&H0067C7EA"      # surlignage ocre/kraft (BGR)
RING_COL = "&H002A2622"      # cercle encre
PAPER_COL= "&H00E9EFF3"      # papier crème

def ts(t):
    h = int(t // 3600); t -= h*3600
    m = int(t // 60); t -= m*60
    s = int(t); cs = int(round((t-s)*100))
    if cs == 100: s += 1; cs = 0
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

def strip_marks(t):
    return re.sub(r"[*]", "", t).replace("«", "").replace("»", "").strip()

def markup(text, on_paper=False):
    text = text.lower()
    base_c = INK if on_paper else "&H00FFFFFF"
    # *mot* -> gras (+ reste couleur de base)
    text = re.sub(r"\*([^*]+)\*", lambda m: f"{{\\b1}}{m.group(1)}{{\\b0}}", text)
    return text, base_c

def text_width(t):
    return max(120, int(len(strip_marks(t)) * GLYPH))

def ellipse_path(w, h):
    rx, ry = w/2.0, h/2.0
    kx, ky = rx*0.5523, ry*0.5523
    cx, cy = w/2.0, h/2.0
    def f(v): return f"{v:.0f}"
    return (f"m {f(cx)} 0 "
            f"b {f(cx+kx)} 0 {f(w)} {f(cy-ky)} {f(w)} {f(cy)} "
            f"b {f(w)} {f(cy+ky)} {f(cx+kx)} {f(h)} {f(cx)} {f(h)} "
            f"b {f(cx-kx)} {f(h)} 0 {f(cy+ky)} 0 {f(cy)} "
            f"b 0 {f(cy-ky)} {f(cx-kx)} 0 {f(cx)} 0")

def rect_path(w, h):
    return f"m 0 0 l {w:.0f} 0 l {w:.0f} {h:.0f} l 0 {h:.0f}"

# Effet par carte-clé (cycle) pour du rythme : surlignage / cercle / papier
EMPH = [i for i in sorted(CORRECTIONS) if '*' in CORRECTIONS[i]]
EFFECTS = ['hl', 'circle', 'paper', 'underline']
TREAT = {}
for k, i in enumerate(EMPH):
    TREAT[i] = EFFECTS[k % 3]

# Entrées de texte variées (élégantes, pas clinquantes)
ENTER = [
    r"\fad(180,160)\fscx94\fscy94\t(0,220,\fscx100\fscy100)",           # scale doux
    r"\fad(160,150)\move({X},{Yd},{X},{Y},0,200)",                       # slide up
    r"\fad(200,170)\blur6\t(0,200,\blur0)",                              # net-from-flou
    r"\fad(150,150)\frz2\fscy92\t(0,200,\frz0\fscy100)",                 # léger redressement
]

styles = [
    f"Style: Lux,{MAIN},{FS},&H00FFFFFF,&H00FFFFFF,&H64000000,&H78000000,0,0,0,0,100,100,0,0,1,0,2,5,150,150,600,1",
    f"Style: Shape,{MAIN},{FS},&H00FFFFFF,&H00FFFFFF,&H00202020,&H00000000,0,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1",
    f"Style: Kick,{MAIN},40,&H00E6E6E6,&H00E6E6E6,&H50000000,&H60000000,0,0,0,0,100,100,8,0,1,0,2,8,80,80,150,1",
]

header = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
{chr(10).join(styles)}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

def build():
    lines = []
    for i, (s, e, t) in enumerate(raw):
        txt = CORRECTIONS.get(i, t)
        if not txt.strip():          # carte volontairement vide (ex: portée par une incrustation)
            continue
        eff = TREAT.get(i)
        on_paper = (eff == 'paper')
        body, base_c = markup(txt, on_paper=on_paper)
        w = text_width(txt)
        S, E = ts(s), ts(e)

        # --- couche forme (surlignage / cercle / papier) sous/au-dessus du texte
        if eff == 'hl':
            bw, bh = int(w*1.06)+40, 84
            X, Y = CX - bw//2, CY - bh//2
            X2, Y2 = X+bw, Y+bh
            draw = (f"{{\\an7\\pos({X},{Y})\\bord0\\shad0\\1c{HL_COL}\\1a&H4B&\\frz-2"
                    f"\\clip({X},{Y},{X},{Y2})\\t(60,300,\\clip({X},{Y},{X2},{Y2}))\\p1}}"
                    f"{rect_path(bw,bh)}{{\\p0}}")
            lines.append(f"Dialogue: 0,{S},{E},Shape,,0,0,0,,{draw}")
        elif eff == 'circle':
            bw, bh = int(w*1.18)+56, 118
            X, Y = CX - bw//2, CY - bh//2
            X2, Y2 = X+bw, Y+bh
            draw = (f"{{\\an7\\pos({X},{Y})\\1a&HFF&\\3c{RING_COL}\\bord4.5\\shad0\\frz-3"
                    f"\\clip({X},{Y},{X},{Y2})\\t(90,430,\\clip({X},{Y},{X2},{Y2}))\\p1}}"
                    f"{ellipse_path(bw,bh)}{{\\p0}}")
            lines.append(f"Dialogue: 2,{S},{E},Shape,,0,0,0,,{draw}")  # au-dessus du texte
        elif eff == 'underline':
            bw, bh = int(w*1.02)+8, 9
            X = CX - bw//2
            Y = CY + int(FS*0.46)
            X2, Y2 = X+bw, Y+bh
            draw = (f"{{\\an7\\pos({X},{Y})\\bord0\\shad0\\1c{RING_COL}\\frz-1"
                    f"\\clip({X},{Y},{X},{Y2})\\t(80,340,\\clip({X},{Y},{X2},{Y2}))\\p1}}"
                    f"{rect_path(bw,bh)}{{\\p0}}")
            lines.append(f"Dialogue: 2,{S},{E},Shape,,0,0,0,,{draw}")
        elif eff == 'paper':
            bw, bh = int(w*1.05)+56, 108
            X, Y = CX - bw//2, CY - bh//2
            draw = (f"{{\\an7\\pos({X},{Y})\\bord0\\shad6\\4c&H60000000\\1c{PAPER_COL}\\1a&H08&\\frz-1"
                    f"\\fad(150,150)\\fscx90\\fscy90\\t(0,200,\\fscx100\\fscy100)\\p1}}"
                    f"{rect_path(bw,bh)}{{\\p0}}")
            lines.append(f"Dialogue: 0,{S},{E},Shape,,0,0,0,,{draw}")

        # --- couche texte
        anim = ENTER[i % len(ENTER)].replace('{X}', str(CX)).replace('{Y}', str(CY)).replace('{Yd}', str(CY+46))
        pos = f"\\an5\\pos({CX},{CY})" if '\\move' not in anim else "\\an5"
        head = f"{{{pos}\\c{base_c}{'' if base_c=='&H00FFFFFF' else ''}{anim}}}"
        # couleur de base via \c déjà dans head ? on l'ajoute proprement :
        head = f"{{{pos}\\1c{base_c}{anim}}}"
        lines.append(f"Dialogue: 1,{S},{E},Lux,,0,0,0,,{head}{body}")
    # Kickers éditoriaux (petites capitales + filet qui se trace)
    for (ks, ke, ktext) in KICKERS:
        kt = ktext.upper()
        rw = max(180, int(len(kt) * 26))
        X = CX - rw // 2
        Y = 214
        lines.append(
            f"Dialogue: 1,{ts(ks)},{ts(ke)},Shape,,0,0,0,,"
            f"{{\\an7\\pos({X},{Y})\\bord0\\shad0\\1c&H00DADADA&"
            f"\\clip({X},{Y},{X},{Y+3})\\t(60,340,\\clip({X},{Y},{X+rw},{Y+3}))\\p1}}"
            f"{rect_path(rw,3)}{{\\p0}}")
        lines.append(f"Dialogue: 1,{ts(ks)},{ts(ke)},Kick,,0,0,0,,{{\\fad(240,200)}}{kt}")

    open('subs.ass', 'w').write(header + "\n".join(lines) + "\n")
    print("captions:", len(raw), "| effets:", sum(1 for v in TREAT.values()),
          "| kickers:", len(KICKERS), "-> subs.ass (kinétique + NYT)")

if __name__ == '__main__':
    import sys
    if '--dump' in sys.argv:
        for i, (s, e, t) in enumerate(raw):
            print(f"{i:2d} {s:6.2f} {e:6.2f} [{TREAT.get(i,'-'):6s}] {CORRECTIONS.get(i,t)}")
        raise SystemExit
    build()
