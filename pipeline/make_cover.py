"""Vignette (cover) de réel Instagram 1080x1920 à partir d'une photo + titre choc.

Usage : python3 pipeline/make_cover.py PHOTO PRESET [jaune|rouge] [SORTIE]
  - PRESET : clé de PRESETS ci-dessous (tuto_faux, onlyfans, ...)
  - police Anton dans ./fonts (récupérée par pipeline/setup.sh)
  - sortie par défaut : covers/<preset>_<variante>.jpg
Design : photo recadrée 9:16 + dégradé sombre + grain, pastille d'accroche, 3 lignes de titre en
Anton blanc (une ligne peut porter un badge de marque), dernière ligne énorme en couleur accent,
légèrement inclinée. Le bloc est calé dans la zone sûre (grille profil 3:4 + UI Instagram en bas).
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ANTON = os.path.join(ROOT, "fonts", "Anton-Regular.ttf")
INTER_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
INTER_BLK = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
if not (os.path.exists(INTER_B) and os.path.exists(INTER_BLK)):
    INTER_B = INTER_BLK = ANTON   # repli si Inter absent

W, H = 1080, 1920
BRANDS = {   # couleur du badge + icône dessinée
    "youtube": {"color": (255, 0, 0), "icon": "play", "label": "YOUTUBE"},
    "onlyfans": {"color": (0, 175, 240), "icon": "of", "label": "ONLYFANS"},
}
PRESETS = {
    "tuto_faux": {
        "pill": "ATTENTION AUX CONSEILS GRATUITS",
        "lines": ["LES TUTO FISCAUX", ("SUR", "youtube"), "SONT TOUS"],
        "big": "FAUX !",
        "sub": "Ce que personne ne vous dit sur votre fiscalité",
        "crop": {"cx": 745, "top": 0},      # centre horizontal du sujet, haut du recadrage (px source)
        "shift": 0,                          # décalage vertical du bloc titre
    },
    "onlyfans": {
        "pill": "FISCALITÉ DES CRÉATEURS DE CONTENU",
        "lines": ["COMMENT DÉCLARER", "TES IMPÔTS QUAND", "TU EXPLOSES SUR"],
        "big": ("onlyfans", "?"),            # badge de marque + ponctuation accent
        "sub": "Le statut, la TVA, les charges : on fait le point",
        "crop": {"cx": 960, "top": 330},
        "shift": 50,
    },
}

SRC = sys.argv[1]
preset = PRESETS[sys.argv[2]]
variant = sys.argv[3] if len(sys.argv) > 3 else "jaune"
OUT = sys.argv[4] if len(sys.argv) > 4 else os.path.join(ROOT, "covers", f"{sys.argv[2]}_{variant}.jpg")
ACCENT = {"jaune": (255, 221, 0), "rouge": (255, 40, 40)}[variant]

# ---------- photo : recadrage 9:16 + étalonnage ----------
im = Image.open(SRC).convert("RGB")
sw, sh = im.size
top = preset["crop"]["top"]
ch_src = sh - top
cw = int(ch_src * 9 / 16)
x0 = max(0, min(sw - cw, preset["crop"]["cx"] - cw // 2))
im = im.crop((x0, top, x0 + cw, sh)).resize((W, H), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.12)
im = ImageEnhance.Color(im).enhance(1.08)

# ---------- assombrissement : dégradé bas + haut + vignette ----------
yy = np.linspace(0, 1, H)[:, None]
xx = np.linspace(-1, 1, W)[None, :]
bottom = np.clip((yy - 0.42) / 0.58, 0, 1) ** 1.25 * 0.88
topd = np.clip((0.16 - yy) / 0.16, 0, 1) * 0.45
vign = np.clip((np.abs(xx) ** 2.2) * 0.35, 0, 1)
dark = np.clip(bottom + topd + vign, 0, 0.92)
arr = np.asarray(im).astype(np.float32) * (1 - dark[..., None])
im = Image.fromarray(arr.astype(np.uint8))

# glow coloré discret derrière le bloc titre
glow = Image.new("RGB", (W, H), (0, 0, 0))
ImageDraw.Draw(glow).ellipse((-200, 1150, 900, 1900), fill=tuple(int(c * 0.35) for c in ACCENT))
glow = glow.filter(ImageFilter.GaussianBlur(220))
im = Image.fromarray(np.clip(np.asarray(im).astype(np.int16) + (np.asarray(glow).astype(np.int16) * 0.35).astype(np.int16), 0, 255).astype(np.uint8))

# grain subtil
rng = np.random.default_rng(7)
noise = rng.normal(0, 6, (H, W, 1)).astype(np.int16)
im = Image.fromarray(np.clip(np.asarray(im).astype(np.int16) + noise, 0, 255).astype(np.uint8))

# ---------- texte ----------
canvas = im.convert("RGBA")
layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))

def font(path, size): return ImageFont.truetype(path, size)
def text_w(f, t):
    b = f.getbbox(t); return b[2] - b[0]
def cap_h(f):
    b = f.getbbox("H"); return b[3] - b[1]

def shadow_text(t, f, xy, anchor="ls", offset=(0, 12), blur=16, alpha=210, stroke=0):
    sl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(sl).text((xy[0] + offset[0], xy[1] + offset[1]), t, font=f, fill=(0, 0, 0, alpha),
                            anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, alpha))
    return sl.filter(ImageFilter.GaussianBlur(blur))

def put(t, f, xy, fill=(255, 255, 255, 255), anchor="ls", stroke=0):
    layer.alpha_composite(shadow_text(t, f, xy, anchor, stroke=stroke))
    ImageDraw.Draw(layer).text(xy, t, font=f, fill=fill, anchor=anchor, stroke_width=stroke, stroke_fill=(0, 0, 0, 255))

def brand_icon(bd, name, ix, iy, iw, ih, color):
    """Icône dessinée : play YouTube ou logo OnlyFans simplifié (anneau + secteur)."""
    if name == "play":
        bd.rounded_rectangle((ix, iy, ix + iw, iy + ih), radius=int(ih * 0.28), fill=(255, 255, 255, 255))
        bd.polygon([(ix + iw * 0.40, iy + ih * 0.26), (ix + iw * 0.40, iy + ih * 0.74), (ix + iw * 0.72, iy + ih * 0.5)], fill=(*color, 255))
    else:
        d = min(iw, ih); cx0 = ix + iw / 2 - d * 0.08; cy0 = iy + ih / 2
        r = d / 2; t = d * 0.2
        bd.ellipse((cx0 - r, cy0 - r, cx0 + r, cy0 + r), fill=(255, 255, 255, 255))
        bd.ellipse((cx0 - r + t, cy0 - r + t, cx0 + r - t, cy0 + r - t), fill=(*color, 255))
        fx, fy, fr = cx0 + r * 0.55, cy0 - r * 0.05, r * 0.78
        bd.pieslice((fx - fr, fy - fr, fx + fr, fy + fr), start=-90, end=0, fill=(255, 255, 255, 255))
        fr2 = fr * 0.5
        bd.pieslice((fx - fr2, fy - fr2, fx + fr2, fy + fr2), start=-90, end=0, fill=(*color, 255))

def brand_badge(x, baseline, name, size, ch):
    """Badge de marque arrondi à la position (x, ligne de base). Retourne la largeur."""
    b = BRANDS[name]
    fb = font(ANTON, size - 26)
    pad_x, pad_y = 28, 14
    icon_w = int(size * 0.60)
    bw = pad_x + icon_w + 22 + text_w(fb, b["label"]) + pad_x
    bh = ch + 2 * pad_y
    by = baseline - ch - pad_y
    bsh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(bsh).rounded_rectangle((x, by + 14, x + bw, by + bh + 14), radius=22, fill=(0, 0, 0, 190))
    layer.alpha_composite(bsh.filter(ImageFilter.GaussianBlur(16)))
    bd = ImageDraw.Draw(layer)
    bd.rounded_rectangle((x, by, x + bw, by + bh), radius=22, fill=(*b["color"], 255))
    ih = int(bh * 0.56); iy = by + (bh - ih) // 2
    brand_icon(bd, b["icon"], x + pad_x, iy, icon_w, ih, b["color"])
    bd.text((x + pad_x + icon_w + 22, by + bh / 2), b["label"], font=fb, fill=(255, 255, 255, 255), anchor="lm")
    return bw

MARGIN = 72; LEFT = MARGIN
sh_ = preset["shift"]
BADGE_Y = 905 + sh_
BASES = [1095 + sh_, 1250 + sh_, 1405 + sh_]

# pastille d'accroche
f_badge = font(INTER_BLK, 33)
pw = text_w(f_badge, preset["pill"]) + 56
pd = ImageDraw.Draw(layer)
pd.rounded_rectangle((LEFT, BADGE_Y, LEFT + pw, BADGE_Y + 58), radius=14, fill=(*ACCENT, 255))
pd.text((LEFT + 28, BADGE_Y + 29), preset["pill"], font=f_badge, fill=(10, 10, 10, 255), anchor="lm")

# taille commune du titre : la ligne la plus large doit tenir
plain = [l if isinstance(l, str) else l[0] for l in preset["lines"]]
sz = 150
while max(text_w(font(ANTON, sz), t) for t in plain) > W - 2 * MARGIN: sz -= 2
f1 = font(ANTON, sz); ch = cap_h(f1)

for line, base in zip(preset["lines"], BASES):
    if isinstance(line, str):
        put(line, f1, (LEFT, base))
    else:
        txt, brand = line
        put(txt, f1, (LEFT, base))
        brand_badge(LEFT + text_w(f1, txt + " ") + 10, base, brand, sz, ch)

# dernière ligne : énorme, accent, inclinée, contour noir (texte seul ou badge + ponctuation)
big = preset["big"]
TOP_BIG = BASES[2] + 42
if isinstance(big, str):
    f4 = font(ANTON, 262)
    pad = 60
    tw4 = text_w(f4, big) + 2 * pad; th4 = cap_h(f4) + 2 * pad
    word = Image.new("RGBA", (tw4, th4), (0, 0, 0, 0))
    ImageDraw.Draw(word).text((pad, th4 - pad), big, font=f4, fill=(*ACCENT, 255), anchor="ls", stroke_width=9, stroke_fill=(0, 0, 0, 255))
else:
    brand, punct = big
    b = BRANDS[brand]
    f4 = font(ANTON, 150); fp = font(ANTON, 240)
    pad = 60; pad_x, pad_y = 34, 18
    ch4 = cap_h(f4); icon_w = int(ch4 * 0.95)
    bw = pad_x + icon_w + 26 + text_w(f4, b["label"]) + pad_x
    bh = ch4 + 2 * pad_y
    tw4 = bw + 24 + text_w(fp, punct) + 2 * pad; th4 = cap_h(fp) + 2 * pad
    word = Image.new("RGBA", (tw4, th4), (0, 0, 0, 0))
    wd = ImageDraw.Draw(word)
    by = th4 - pad - ch4 - pad_y
    wd.rounded_rectangle((pad, by, pad + bw, by + bh), radius=26, fill=(*b["color"], 255), outline=(0, 0, 0, 255), width=7)
    ih = int(bh * 0.6); brand_icon(wd, b["icon"], pad + pad_x, by + (bh - ih) // 2, icon_w, ih, b["color"])
    wd.text((pad + pad_x + icon_w + 26, by + bh / 2), b["label"], font=f4, fill=(255, 255, 255, 255), anchor="lm")
    wd.text((pad + bw + 24, th4 - pad), punct, font=fp, fill=(*ACCENT, 255), anchor="ls", stroke_width=9, stroke_fill=(0, 0, 0, 255))
word = word.rotate(-3, resample=Image.BICUBIC, expand=True)
wsh = Image.new("RGBA", word.size, (0, 0, 0, 0))
wsh.paste((0, 0, 0, 215), (0, 0), word.split()[3])
wsh = wsh.filter(ImageFilter.GaussianBlur(18))
ab = word.getbbox()
wx = LEFT - ab[0] - 6; wy = TOP_BIG - ab[1]
layer.alpha_composite(wsh, (wx + 6, wy + 20))
layer.alpha_composite(word, (wx, wy))
B4 = wy + ab[3]

# accroche fine sous le titre
f_sub = font(INTER_B, 36)
sy = B4 + 58
ImageDraw.Draw(layer).text((LEFT + 2, sy), preset["sub"], font=f_sub, fill=(230, 230, 230, 235), anchor="ls")

# barre d'accent éditoriale
ImageDraw.Draw(layer).rounded_rectangle((MARGIN - 34, BADGE_Y, MARGIN - 20, sy + 6), radius=7, fill=(*ACCENT, 255))

canvas.alpha_composite(layer)
out = canvas.convert("RGB")
os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
out.save(OUT, quality=94, subsampling=0)
print("ok ->", OUT)
