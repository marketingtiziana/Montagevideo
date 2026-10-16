# -*- coding: utf-8 -*-
"""Hook : cartouche blanc arrondi + mention en dessous.

Dessine en PNG transparent plutot qu'en drawtext : on maitrise ainsi les coins
arrondis, le centrage ligne a ligne et le contour de la mention, que les
filtres ffmpeg ne donnent pas proprement.

Produit aussi layout.json : la composition y lit la geometrie reelle au lieu
de la recalculer, car elle depend des metriques de la police chargee.
"""
import json, os, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, "reel_broll")
from config import (OUT_W, OUT_H, HOOK, HOOK_SUB, HOOK_FONT, HOOK_CAP,
                    HOOK_PITCH, HOOK_PAD_X, HOOK_PAD_TOP, HOOK_PAD_BOTTOM,
                    HOOK_RADIUS, HOOK_MAX_W, SUB_CAP, SUB_GAP, SUB_STROKE,
                    SCRIM_TOP, SCRIM_BOTTOM, SCRIM_ALPHA)

OUTDIR = "assets_broll"
os.makedirs(OUTDIR, exist_ok=True)

# Les cotes du hook sont relevees sur un modele en 1080 de large. On les met a
# l'echelle de la sortie pour que le dessin soit identique a toute resolution.
S = OUT_W / 1080.0


def px(v):
    return max(1, int(round(v * S)))


CAP = px(HOOK_CAP)
PITCH = px(HOOK_PITCH)
PAD_X = px(HOOK_PAD_X)
PAD_TOP, PAD_BOTTOM = px(HOOK_PAD_TOP), px(HOOK_PAD_BOTTOM)
RADIUS = px(HOOK_RADIUS)
SUBCAP = px(SUB_CAP)
STROKE = px(SUB_STROKE)
MARGIN = px(24)                # marge de securite autour des PNG


def font_for_cap(cap_px):
    """Taille de police donnant la hauteur de capitale voulue.

    On vise une hauteur de CAPITALE, pas une taille nominale : c'est ce qui se
    mesure sur un modele, et le rapport cap/em change d'une police a l'autre.
    """
    probe = ImageFont.truetype(HOOK_FONT, 100)
    b = probe.getbbox("H")
    ratio = (b[3] - b[1]) / 100.0
    return ImageFont.truetype(HOOK_FONT, max(8, int(round(cap_px / ratio))))


def draw_box(path):
    cap = CAP
    # Si le texte deborde, on retrecit plutot que de laisser sortir du cadre.
    while True:
        font = font_for_cap(cap)
        widths = [font.getlength(l) for l in HOOK]
        box_w = int(max(widths)) + PAD_X * 2
        if box_w <= HOOK_MAX_W * OUT_W or cap <= px(24):
            break
        cap -= 1
    if cap != CAP:
        print(f"   (texte long : hauteur de capitale ramenee a {cap} px)")

    pitch = int(round(PITCH * cap / CAP))
    hb = font.getbbox("H")
    cap_h = hb[3] - hb[1]
    box_h = PAD_TOP + cap_h + (len(HOOK) - 1) * pitch + PAD_BOTTOM

    img = Image.new("RGBA", (box_w + MARGIN * 2, box_h + MARGIN * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle(
        [MARGIN, MARGIN, MARGIN + box_w, MARGIN + box_h],
        radius=RADIUS, fill=(255, 255, 255, 255))

    # Chaque ligne centree sur l'axe du cartouche et calee sur une LIGNE DE BASE
    # commune. Un ancrage par le haut de l'encre ("mt") ferait descendre les
    # lignes contenant une capitale accentuee (le E d'INQUIETER), car l'accent
    # devient alors le point le plus haut : l'interligne deviendrait irregulier.
    cx = MARGIN + box_w / 2
    for i, line in enumerate(HOOK):
        baseline = MARGIN + PAD_TOP + cap_h + i * pitch
        d.text((cx, baseline), line, font=font, fill=(0, 0, 0, 255), anchor="ms")

    img.save(path)
    return img.size, box_w, box_h, cap / CAP


def draw_sub(path, scale=1.0):
    font = font_for_cap(max(10, int(round(SUBCAP * scale))))
    w = int(font.getlength(HOOK_SUB))
    cap_h = font.getbbox("H")[3] - font.getbbox("H")[1]
    pad = MARGIN + STROKE
    img = Image.new("RGBA", (w + pad * 2, cap_h + pad * 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # contour noir : la mention est posee sur l'image, sans cartouche
    hb = font.getbbox("H")
    d.text((img.size[0] / 2, pad + (hb[3] - hb[1])), HOOK_SUB, font=font, anchor="ms",
           fill=(255, 255, 255, 255),
           stroke_width=STROKE, stroke_fill=(0, 0, 0, 235))
    img.save(path)
    return img.size, w, cap_h


def draw_scrim(path):
    """Degrade sombre vers le bas, neutralise si SCRIM_ALPHA vaut 0."""
    y = np.linspace(0, 1, OUT_H, dtype=np.float32)
    u = np.clip((y - SCRIM_TOP) / (SCRIM_BOTTOM - SCRIM_TOP), 0, 1)
    u = u * u * (3 - 2 * u)
    rgba = np.zeros((OUT_H, OUT_W, 4), dtype=np.uint8)
    rgba[..., 3] = (u * SCRIM_ALPHA * 255).astype(np.uint8)[:, None]
    Image.fromarray(rgba, "RGBA").save(path)


lay = {"margin": MARGIN, "sub_gap": px(SUB_GAP)}

size, box_w, box_h, scale = draw_box(f"{OUTDIR}/hookbox.png")
lay["box_w"], lay["box_h"] = box_w, box_h
lay["sub_gap"] = max(6, int(round(px(SUB_GAP) * scale)))
print(f"-> {OUTDIR}/hookbox.png {size}  cartouche {box_w}x{box_h} px "
      f"({box_w/OUT_W:.3f} de la largeur)")

if HOOK_SUB:
    size, sub_w, sub_h = draw_sub(f"{OUTDIR}/hooksub.png", scale)
    lay["sub_w"], lay["sub_h"] = sub_w, sub_h
    print(f"-> {OUTDIR}/hooksub.png {size}  mention {sub_w}x{sub_h} px")

if SCRIM_ALPHA > 0:
    draw_scrim(f"{OUTDIR}/scrim.png")
    print(f"-> {OUTDIR}/scrim.png (opacite {SCRIM_ALPHA})")
else:
    print("-> voile desactive (SCRIM_ALPHA = 0)")

with open(f"{OUTDIR}/layout.json", "w") as f:
    json.dump(lay, f)
print(f"-> {OUTDIR}/layout.json {lay}")
