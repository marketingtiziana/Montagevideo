# -*- coding: utf-8 -*-
"""Incrustations texte : 3 cartons seulement, sobres, poses sur le ciel.

Chaque carton apporte une information que les sous-titres ne donnent pas
(cadrer le probleme, annoncer la question, nommer la resolution). Dessines en
PNG transparent pour maitriser l'interlettrage, que libass ne gere pas.
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, "reel")
from config import GRAPHICS, OUT_W, OUT_H

os.makedirs("assets", exist_ok=True)
FONT = "fonts/Anton-Regular.ttf"
SIZE = 54
TRACKING = 9            # interlettrage : donne le caractere "premium"
ACCENT = (255, 196, 77, 255)


def draw_card(text, path):
    font = ImageFont.truetype(FONT, SIZE)
    glyphs = [(ch, font.getbbox(ch)) for ch in text]
    width = sum((b[2] - b[0]) if ch != " " else SIZE // 3 for ch, b in glyphs)
    width += TRACKING * (len(text) - 1)
    pad_x, pad_y = 34, 20
    bar_h = 4

    W = int(width + pad_x * 2)
    H = int(SIZE * 1.45 + pad_y * 2 + bar_h + 24)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # petit trait d'accent au-dessus du mot : signale sans surcharger
    d.rectangle([pad_x, pad_y, pad_x + 78, pad_y + bar_h], fill=ACCENT)

    x = pad_x
    y = pad_y + bar_h + 22
    for ch, b in glyphs:
        if ch == " ":
            x += SIZE // 3 + TRACKING
            continue
        # contour sombre : reste lisible sur un ciel clair
        for dx, dy in ((-2, 0), (2, 0), (0, -2), (0, 2), (-2, -2), (2, 2), (-2, 2), (2, -2)):
            d.text((x - b[0] + dx, y - b[1] + dy), ch, font=font, fill=(10, 10, 10, 190))
        d.text((x - b[0], y - b[1]), ch, font=font, fill=(255, 255, 255, 255))
        x += (b[2] - b[0]) + TRACKING

    img.save(path)
    return img.size


for i, (_s, _e, text) in enumerate(GRAPHICS):
    p = f"assets/gfx{i}.png"
    print(f"-> {p}  {draw_card(text, p)}  «{text}»")
