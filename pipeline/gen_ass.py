# -*- coding: utf-8 -*-
# Generates animated ASS subtitles: white bold/compact, yellow accents (~word~),
# per-card font variation, pop-in animation, NO box.
import re

# (start, end, font_key, TEXT)   ~word~ => yellow accent
# fonts: A=Anton (default compact), H=Archivo Black (heavy punch), B=Bebas Neue (tall condensed)
CAPS = [
    (0.12, 1.06, 'A', "Comment gérer"),
    (1.06, 1.46, 'H', "la *TVA*"),
    (1.46, 1.91, 'B', "quand tu vends"),
    (1.91, 2.46, 'A', "une formation"),
    (2.46, 3.42, 'B', "dans ~3 pays~ ?"),
    (3.42, 4.22, 'H', "Je vais te dire"),
    (4.22, 4.82, 'B', "le *truc*"),
    (4.82, 5.56, 'A', "que personne"),
    (5.56, 6.16, 'H', "ne t'explique"),
    (6.16, 7.34, 'B', "à propos de ce cas"),
    (7.34, 8.60, 'A', "Tu vends ta formation"),
    (8.60, 9.14, 'H', "en ligne"),
    (9.14, 10.50, 'B', "un client ~belge~"),
    (10.50, 11.14, 'A', "un ~français~"),
    (11.14, 11.85, 'B', "un ~suisse~"),
    (11.85, 12.70, 'H', "toi, t'es en France"),
    (12.70, 13.68, 'B', "Tu factures ta ~TVA~"),
    (13.68, 14.33, 'A', "française"),
    (14.33, 15.44, 'H', "~20%~ à tout le monde"),
    (15.44, 16.38, 'B', "logique, non ?"),
    (16.38, 17.53, 'A', "Eh bien *NON*"),
    (17.53, 18.26, 'H', "C'est là que"),
    (18.26, 18.91, 'B', "tout le monde"),
    (18.91, 19.64, 'A', "*se plante*"),
    (19.64, 21.79, 'B', "Pour une formation"),
    (21.79, 23.56, 'H', "en ligne vendue"),
    (23.56, 24.93, 'B', "à un *particulier*"),
    (24.93, 26.14, 'A', "la règle est simple"),
    (26.23, 27.27, 'H', "mais quasi personne"),
    (27.27, 28.29, 'B', "ne la connaît"),
    (28.29, 28.71, 'A', "La ~TVA~,"),
    (28.71, 29.51, 'H', "c'est pas celle"),
    (29.51, 30.38, 'B', "de ~ton pays~"),
    (30.38, 31.21, 'A', "c'est celle"),
    (31.21, 32.40, 'B', "du ~pays du client~"),
    (32.40, 33.24, 'H', "Et chaque pays"),
    (33.24, 34.01, 'B', "a son taux"),
    (34.01, 35.42, 'A', "~19%~ l'Allemagne"),
    (35.42, 36.62, 'H', "~21%~ la Belgique"),
    (36.62, 38.48, 'B', "~23%~..."),
    (38.48, 39.55, 'A', "Quand tu vends"),
    (39.55, 40.63, 'H', "dans ~3 pays~"),
    (40.63, 41.69, 'B', "t'as pas une TVA"),
    (41.69, 42.54, 'A', "à gérer"),
    (42.54, 43.50, 'B', "t'en as *TROIS*"),
    (43.50, 45.17, 'H', "~3~ taux différents"),
    (45.17, 45.87, 'B', "~3~ États"),
    (45.87, 46.64, 'A', "qui attendent"),
    (46.64, 47.70, 'H', "chacun ~leur part~"),
    (47.70, 48.41, 'B', "Et si tu vends"),
    (48.41, 49.33, 'A', "à une ~entreprise~"),
    (49.33, 50.72, 'H', "pas un particulier"),
    (50.72, 51.43, 'B', "c'est encore"),
    (51.43, 52.46, 'A', "une ~autre règle~"),
    # ---- S3 (piège complet + solution) ----
    (56.24, 57.30, 'B', "Si t'as facturé"),
    (57.30, 58.21, 'H', "la ~mauvaise TVA~"),
    (58.21, 59.64, 'B', "ou ~pas de TVA~ du tout"),
    (59.64, 60.62, 'A', "l'argent que tu"),
    (60.62, 61.83, 'H', "aurais dû ~récolter~"),
    (61.83, 63.37, 'B', "l'État te le réclame"),
    (63.37, 64.30, 'A', "~quand même~"),
    (64.30, 65.71, 'H', "sauf que tu l'as ~PLUS~"),
    (65.71, 67.30, 'B', "il sort de *ta poche*"),
    (67.30, 68.08, 'A', "La ~bonne nouvelle~ :"),
    (68.08, 69.45, 'B', "il existe un *système*"),
    (69.45, 70.08, 'H', "pour éviter"),
    (70.08, 71.06, 'B', "de t'enregistrer"),
    (71.06, 71.94, 'A', "dans ~3 pays~"),
    (71.94, 72.77, 'H', "Tu déclares toute"),
    (72.77, 73.85, 'B', "cette TVA ~européenne~"),
    (73.85, 74.98, 'A', "au ~même endroit~"),
    (74.98, 76.90, 'H', "une *SEULE* déclaration"),
    (76.90, 77.85, 'B', "Ça s'appelle"),
    (77.85, 79.32, 'A', "le *guichet unique*"),
    (79.32, 80.90, 'B', "Encore faut-il savoir"),
    (80.90, 82.20, 'H', "que ça existe"),
    (82.20, 83.30, 'B', "et le mettre en place"),
    (83.30, 84.12, 'A', "~correctement~"),
    (84.12, 85.52, 'H', "Et c'est exactement"),
    (85.52, 86.29, 'B', "ce qu'on gère"),
    (86.29, 87.38, 'A', "~dès le départ~"),
    (87.38, 89.02, 'H', "La TVA *internationale*"),
    (89.02, 90.06, 'B', "ça se rattrape pas"),
    (90.06, 91.14, 'A', "en *panique*"),
    (91.14, 91.97, 'B', "ça se conçoit"),
    (91.97, 92.77, 'H', "en même temps"),
    (92.77, 93.90, 'B', "que ta ~structure~"),
    (95.55, 96.12, 'A', "Si tu vends"),
    (96.12, 96.77, 'H', "à ~l'international~"),
    (96.77, 97.62, 'B', "et que t'as un *doute*"),
    (97.62, 98.84, 'A', "commente « ~TVA~ »"),
    (98.84, 100.34, 'H', "on regarde si t'es ~en règle~"),
]

FONTS = {'A': 'Anton', 'H': 'Archivo Black', 'B': 'Bebas Neue'}
SIZES = {'A': 108, 'H': 94, 'B': 130}

WHITE = "&H00FFFFFF"
YELLOW = "&H0000FFFF"  # ASS &HAABBGGRR ; yellow = R255 G255 B0
YEL_INLINE = "&H00FFFF&"
WHT_INLINE = "&HFFFFFF&"

def ts(t):
    h = int(t // 3600); t -= h*3600
    m = int(t // 60); t -= m*60
    s = int(t); cs = int(round((t - s)*100))
    if cs == 100: s += 1; cs = 0
    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"

# Vivid accent colours (ASS inline &HBBGGRR) cycled for variety + neon glow
ACCENTS = ["&H00FFFF&", "&HFFFF00&", "&H6EE03E&", "&HF05CFF&", "&H1C9FFF&"]  # yellow,cyan,green,pink,orange
_acc = [0]

def markup(text, cardkey):
    # Coloured words stay CRISP: coloured fill + the style's black outline (readable).
    fam = FONTS[cardkey]
    alt = 'Bebas Neue' if cardkey != 'B' else 'Archivo Black'
    text = text.upper()
    def styl(m):
        col = ACCENTS[_acc[0] % len(ACCENTS)]; _acc[0] += 1
        return f"{{\\fn{alt}\\c{col}}}{m.group(1)}{{\\fn{fam}\\c{WHT_INLINE}}}"
    def acc(m):
        col = ACCENTS[_acc[0] % len(ACCENTS)]; _acc[0] += 1
        return f"{{\\c{col}}}{m.group(1)}{{\\c{WHT_INLINE}}}"
    text = re.sub(r"\*([^*]+)\*", styl, text)   # stylized: font swap + colour
    text = re.sub(r"~([^~]+)~", acc, text)      # accent: colour only
    return text

# Remap caption times from old base timeline -> tightened base2 timeline
from remap import map_time
remapped = []
for (s, e, f, t) in CAPS:
    ns, ne = map_time(s), map_time(e)
    if ne - ns < 0.08:          # caption collapsed by a cut; give it a minimum on-screen time
        ne = ns + 0.32
    remapped.append((ns, ne, f, t))

# close micro-gaps to avoid flicker, but keep real pauses blank
caps = sorted(remapped, key=lambda c: c[0])
fixed = []
for i, (s, e, f, t) in enumerate(caps):
    if i+1 < len(caps):
        ns = caps[i+1][0]
        if 0 <= (ns - e) < 0.30:
            e = ns
        if e > ns:              # avoid overlap after remap
            e = ns
    fixed.append((s, e, f, t))

# Varied entrance animations for "effets spéciaux" on the subtitles
PRESETS = [
    r"{\fad(45,40)\fscx55\fscy55\t(0,110,\fscx108\fscy108)\t(110,190,\fscx100\fscy100)}",              # pop
    r"{\fad(40,40)\blur9\fscx90\fscy90\t(0,170,\blur0)\t(0,170,\fscx100\fscy100)}",                     # blur-in
    r"{\fad(40,40)\fscx145\fscy145\t(0,150,\fscx100\fscy100)}",                                         # zoom-out
    r"{\fad(40,30)\fscx58\fscy58\t(0,85,\fscx113\fscy113)\t(85,140,\fscx93\fscy93)\t(140,205,\fscx100\fscy100)}",  # bounce
    r"{\fad(40,40)\frz7\fscx82\fscy82\t(0,160,\frz0)\t(0,160,\fscx100\fscy100)}",                       # rotate-in
    r"{\fad(35,40)\fscy45\t(0,140,\fscy110)\t(140,200,\fscy100)}",                                      # squash-stretch
    r"{\fad(30,40)\fscx180\fscy180\t(0,90,\fscx94\fscy94)\t(90,150,\fscx100\fscy100)}",                 # slam
    r"{\fad(50,50)\fscx88\fscy88\t(0,130,\fscx104\fscy104)\t(130,260,\fscx100\fscy100)}",               # soft pulse
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

lines = []
for i, (s, e, f, t) in enumerate(fixed):
    anim = PRESETS[i % len(PRESETS)]
    lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},{f},,0,0,0,,{anim}{markup(t, f)}")

with open('subs.ass', 'w') as fh:
    fh.write(header + "\n".join(lines) + "\n")

# Export caption start times (+ accent flag) so mix_audio can blip on text appearance
import json as _json
meta = [{'t': round(s, 3), 'accent': ('~' in t)} for (s, e, f, t) in fixed]
_json.dump(meta, open('subs_meta.json', 'w'))
print("captions:", len(fixed), "-> subs.ass (+subs_meta.json)")
