# -*- coding: utf-8 -*-
"""Elements graphiques du hook : voile, trait d'accent, lignes de texte.

Dessines en PNG transparent plutot qu'en drawtext : on maitrise ainsi
l'interlettrage et l'ombre portee douce, que les filtres ffmpeg ne donnent pas.
"""
import json, os, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

sys.path.insert(0, "reel_broll")
from config import (OUT_W, OUT_H, HOOK, HOOK_FONT, HOOK_SIZE, HOOK_TRACKING,
                    HOOK_ACCENT, HOOK_WHITE, BAR_W, BAR_H,
                    SCRIM_TOP, SCRIM_BOTTOM, SCRIM_ALPHA)

OUTDIR = "assets_broll"
os.makedirs(OUTDIR, exist_ok=True)
PAD = 26                      # marge pour l'ombre portee


def runs(line):
    """'A ~B~ C' -> [('A ', False), ('B', True), (' C', False)]"""
    out, accent = [], False
    for part in re.split(r"(~)", line):
        if part == "~":
            accent = not accent
        elif part:
            out.append((part, accent))
    return out


def draw_line(text, path):
    """Une ligne de hook, tracee sur une LIGNE DE BASE commune.

    Caler chaque glyphe sur son propre haut de boite ferait flotter les
    capitales accentuees (le E de RÉUSSITE descendrait sous les autres) :
    on fixe donc la baseline et on avance avec la chasse reelle du glyphe.
    """
    font = ImageFont.truetype(HOOK_FONT, HOOK_SIZE)
    ascent, descent = font.getmetrics()
    pieces = runs(text)
    glyphs = [(ch, acc) for seg, acc in pieces for ch in seg]

    adv = [font.getlength(ch) for ch, _ in glyphs]
    width = int(sum(adv) + HOOK_TRACKING * max(0, len(glyphs) - 1))
    H = ascent + descent
    baseline = PAD + ascent

    def render(target, dy, shadow_fill=None):
        d = ImageDraw.Draw(target)
        x = float(PAD)
        for (ch, acc), a in zip(glyphs, adv):
            if ch != " ":
                col = shadow_fill or ((*HOOK_ACCENT, 255) if acc else (*HOOK_WHITE, 255))
                d.text((x, baseline + dy), ch, font=font, fill=col, anchor="ls")
            x += a + HOOK_TRACKING

    size = (width + PAD * 2, H + PAD * 2)
    # ombre portee douce : lisible sur la peau comme sur l'ordinateur
    shadow = Image.new("RGBA", size, (0, 0, 0, 0))
    render(shadow, 5, shadow_fill=(0, 0, 0, 170))
    shadow = shadow.filter(ImageFilter.GaussianBlur(7))

    img = Image.new("RGBA", size, (0, 0, 0, 0))
    render(img, 0)
    img = Image.alpha_composite(shadow, img)

    img.save(path)
    return img.size, H


def draw_bar(path):
    img = Image.new("RGBA", (BAR_W + PAD * 2, BAR_H + PAD * 2), (0, 0, 0, 0))
    ImageDraw.Draw(img).rectangle(
        [PAD, PAD, PAD + BAR_W, PAD + BAR_H], fill=(*HOOK_ACCENT, 255))
    img.save(path)
    return img.size


def draw_scrim(path):
    """Degrade sombre vers le bas : assied le texte sans poser de bandeau."""
    y = np.linspace(0, 1, OUT_H, dtype=np.float32)
    u = np.clip((y - SCRIM_TOP) / (SCRIM_BOTTOM - SCRIM_TOP), 0, 1)
    u = u * u * (3 - 2 * u)                       # lissage : pas de ligne visible
    a = (u * SCRIM_ALPHA * 255).astype(np.uint8)
    rgba = np.zeros((OUT_H, OUT_W, 4), dtype=np.uint8)
    rgba[..., 3] = a[:, None]
    Image.fromarray(rgba, "RGBA").save(path)
    return (OUT_W, OUT_H)


print("->", OUTDIR + "/scrim.png", draw_scrim(f"{OUTDIR}/scrim.png"))
print("->", OUTDIR + "/bar.png", draw_bar(f"{OUTDIR}/bar.png"))
text_h = 0
for i, line in enumerate(HOOK):
    p = f"{OUTDIR}/hook{i}.png"
    size, text_h = draw_line(line, p)
    print("->", p, size, f"hauteur texte {text_h}", f"«{line}»")

# La composition lit cette geometrie : une seule source de verite pour
# la marge et la hauteur de ligne, qui dependent de la police chargee.
with open(f"{OUTDIR}/layout.json", "w") as f:
    json.dump({"pad": PAD, "text_h": text_h}, f)
print("->", f"{OUTDIR}/layout.json", {"pad": PAD, "text_h": text_h})
