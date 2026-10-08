"""Vignette (cover) de réel Instagram 1080x1920 à partir d'une photo + titre choc.

Usage : python3 pipeline/make_cover.py PHOTO [jaune|rouge] [SORTIE]
  - police Anton dans ./fonts (récupérée par pipeline/setup.sh)
  - sortie par défaut : covers/vignette_reel_<variante>.jpg
Le bloc titre est calé dans la zone sûre (recadrage 3:4 de la grille du profil + UI Instagram en bas).
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1]
variant = sys.argv[2] if len(sys.argv) > 2 else "jaune"
OUT = sys.argv[3] if len(sys.argv) > 3 else os.path.join(ROOT, "covers", f"vignette_reel_{variant}.jpg")
ANTON = os.path.join(ROOT, "fonts", "Anton-Regular.ttf")
INTER_B = "/usr/share/fonts/opentype/inter/Inter-Bold.otf"
INTER_BLK = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
for _p in (INTER_B, INTER_BLK):
    if not os.path.exists(_p):
        INTER_B = INTER_BLK = ANTON   # repli si Inter absent

W, H = 1080, 1920
ACCENT = {"jaune": (255, 221, 0), "rouge": (255, 40, 40)}[variant]
YT_RED = (255, 0, 0)

# ---------- photo : recadrage 9:16 + étalonnage ----------
im = Image.open(SRC).convert("RGB")
sw, sh = im.size                       # 1500 x 2000
cw = int(sh * 9 / 16)                  # 1125
cx = 745                               # centre horizontal sur le sujet
x0 = max(0, min(sw - cw, cx - cw // 2))
im = im.crop((x0, 0, x0 + cw, sh)).resize((W, H), Image.LANCZOS)
im = ImageEnhance.Contrast(im).enhance(1.12)
im = ImageEnhance.Color(im).enhance(1.08)

# ---------- assombrissement : dégradé bas + haut + vignette ----------
import numpy as np
yy = np.linspace(0, 1, H)[:, None]
xx = np.linspace(-1, 1, W)[None, :]
bottom = np.clip((yy - 0.42) / 0.58, 0, 1) ** 1.25 * 0.88      # bas très sombre pour le texte
top = np.clip((0.16 - yy) / 0.16, 0, 1) * 0.45                   # haut légèrement sombre
vign = np.clip((np.abs(xx) ** 2.2) * 0.35, 0, 1)
dark = np.clip(bottom + top + vign, 0, 0.92)
arr = np.asarray(im).astype(np.float32)
arr = arr * (1 - dark[..., None])
im = Image.fromarray(arr.astype(np.uint8))

# léger glow coloré derrière le texte (ambiance)
glow = Image.new("RGB", (W, H), (0, 0, 0))
gd = ImageDraw.Draw(glow)
gd.ellipse((-200, 1150, 900, 1900), fill=(*[int(c * 0.35) for c in ACCENT],))
glow = glow.filter(ImageFilter.GaussianBlur(220))
im = Image.fromarray(np.clip(np.asarray(im).astype(np.int16) + (np.asarray(glow).astype(np.int16) * 0.35).astype(np.int16), 0, 255).astype(np.uint8))

# ---------- grain subtil ----------
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

MARGIN = 72; LEFT = MARGIN
# zone sûre : grille profil 3:4 -> y 240..1680 ; UI Instagram en bas
BADGE_Y = 905
B1, B2, B3, B4 = 1095, 1250, 1405, 1640   # lignes de base

# badge "ATTENTION ..."
f_badge = font(INTER_BLK, 33)
badge_t = "ATTENTION AUX CONSEILS GRATUITS"
bw = text_w(f_badge, badge_t) + 56
pd = ImageDraw.Draw(layer)
pd.rounded_rectangle((LEFT, BADGE_Y, LEFT + bw, BADGE_Y + 58), radius=14, fill=(*ACCENT, 255))
pd.text((LEFT + 28, BADGE_Y + 29), badge_t, font=f_badge, fill=(10, 10, 10, 255), anchor="lm")

# taille du titre : la ligne la plus large doit tenir
t1, t3 = "LES TUTO FISCAUX", "SONT TOUS"
sz = 150
while text_w(font(ANTON, sz), t1) > W - 2 * MARGIN: sz -= 2
f1 = font(ANTON, sz); ch = cap_h(f1)

put(t1, f1, (LEFT, B1))

# L2 : SUR [▶ YOUTUBE]
put("SUR", f1, (LEFT, B2))
bx = LEFT + text_w(f1, "SUR ") + 10
f2b = font(ANTON, sz - 26)
pad_x, pad_y = 28, 14
icon_w = int(sz * 0.60)
bw2 = pad_x + icon_w + 22 + text_w(f2b, "YOUTUBE") + pad_x
bh2 = ch + 2 * pad_y
byy = B2 - ch - pad_y
bsh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
ImageDraw.Draw(bsh).rounded_rectangle((bx, byy + 14, bx + bw2, byy + bh2 + 14), radius=22, fill=(0, 0, 0, 190))
layer.alpha_composite(bsh.filter(ImageFilter.GaussianBlur(16)))
bd = ImageDraw.Draw(layer)
bd.rounded_rectangle((bx, byy, bx + bw2, byy + bh2), radius=22, fill=(*YT_RED, 255))
ih = int(bh2 * 0.56); iw = icon_w
ix = bx + pad_x; iy = byy + (bh2 - ih) // 2
bd.rounded_rectangle((ix, iy, ix + iw, iy + ih), radius=int(ih * 0.28), fill=(255, 255, 255, 255))
bd.polygon([(ix + iw * 0.40, iy + ih * 0.26), (ix + iw * 0.40, iy + ih * 0.74), (ix + iw * 0.72, iy + ih * 0.5)], fill=(*YT_RED, 255))
bd.text((ix + iw + 22, byy + bh2 / 2), "YOUTUBE", font=f2b, fill=(255, 255, 255, 255), anchor="lm")

# L3
put(t3, f1, (LEFT, B3))

# L4 : FAUX ! — énorme, accent, légèrement incliné, contour noir
t4 = "FAUX !"
f4 = font(ANTON, 262)
pad = 60
tw4 = text_w(f4, t4) + 2 * pad; th4 = cap_h(f4) + 2 * pad
word = Image.new("RGBA", (tw4, th4), (0, 0, 0, 0))
ImageDraw.Draw(word).text((pad, th4 - pad), t4, font=f4, fill=(*ACCENT, 255), anchor="ls", stroke_width=9, stroke_fill=(0, 0, 0, 255))
word = word.rotate(-3, resample=Image.BICUBIC, expand=True)
wsh = Image.new("RGBA", word.size, (0, 0, 0, 0))
wsh.paste((0, 0, 0, 215), (0, 0), word.split()[3])
wsh = wsh.filter(ImageFilter.GaussianBlur(18))
ab = word.getbbox()  # zone opaque réelle après rotation
wx = LEFT - ab[0] - 6; wy = B3 + 42 - ab[1]
B4 = wy + ab[3]
layer.alpha_composite(wsh, (wx + 6, wy + 20))
layer.alpha_composite(word, (wx, wy))

# accroche fine sous le titre
f_sub = font(INTER_B, 36)
sy = B4 + 58
ImageDraw.Draw(layer).text((LEFT + 2, sy), "Ce que personne ne vous dit sur votre fiscalité", font=f_sub, fill=(230, 230, 230, 235), anchor="ls")

# barre d'accent éditoriale
ImageDraw.Draw(layer).rounded_rectangle((MARGIN - 34, BADGE_Y, MARGIN - 20, sy + 6), radius=7, fill=(*ACCENT, 255))

canvas.alpha_composite(layer)
out = canvas.convert("RGB")
os.makedirs(os.path.dirname(OUT) or ".", exist_ok=True)
out.save(OUT, quality=94, subsampling=0)
print("ok ->", OUT)
