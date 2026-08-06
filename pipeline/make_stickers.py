# -*- coding: utf-8 -*-
# Petites incrustations "papier" PARTIELLES (ne remplissent pas l'écran) :
# bouts de papier crème avec une petite photo N&B (crop d'un collage) et/ou un
# libellé serif. Fond transparent -> superposition partielle animée.
# + une bande "papier" pour les transitions (balayage).
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

os.makedirs('assets', exist_ok=True)
FI = 'fonts/EBGaramond-Italic.ttf'
F = 'fonts/EBGaramond.ttf'
FP = 'fonts/PlayfairDisplay.ttf'
CREAM = (236, 232, 223)
INK = (28, 25, 22)


def font(p, s): return ImageFont.truetype(p, s)


def scrap(w, h, rot=0):
    """Bout de papier crème, coins légèrement irréguliers, ombre portée, sur canvas transparent."""
    pad = 60
    cw, ch = w + pad * 2, h + pad * 2
    canvas = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    # ombre
    sh = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
    ds = ImageDraw.Draw(sh)
    ds.rectangle([pad + 6, pad + 12, pad + w + 6, pad + h + 12], fill=(0, 0, 0, 110))
    sh = sh.filter(ImageFilter.GaussianBlur(16))
    canvas.alpha_composite(sh)
    # papier + léger grain
    paper = Image.new('RGBA', (w, h), CREAM + (255,))
    dp = ImageDraw.Draw(paper)
    for i in range(0, w, 3):
        dp.line([(i, 0), (i, h)], fill=(255, 255, 255, 6))
    canvas.alpha_composite(paper, (pad, pad))
    if rot:
        canvas = canvas.rotate(rot, expand=True, resample=Image.BICUBIC)
    return canvas, pad


def photo_scrap(name, src, box, label, w=460, ph=330, rot=-3):
    """Papier avec une petite photo N&B (crop de `src`) + libellé serif dessous."""
    h = ph + 96
    canvas, pad = scrap(w, h, rot=0)
    # photo
    im = Image.open(src).convert('L').convert('RGB').crop(box)
    im = im.resize((w - 56, ph - 28), Image.LANCZOS)
    canvas.alpha_composite(im.convert('RGBA'), (pad + 28, pad + 20))
    d = ImageDraw.Draw(canvas)
    d.rectangle([pad + 28, pad + 20, pad + 28 + (w - 56), pad + 20 + (ph - 28)], outline=(0, 0, 0, 120), width=2)
    ft = font(FI, 46)
    tw = d.textlength(label, font=ft)
    d.text((pad + (w - tw) / 2, pad + ph + 8), label, font=ft, fill=INK + (255,))
    canvas = canvas.rotate(rot, expand=True, resample=Image.BICUBIC)
    canvas.save(f'assets/{name}.png')


def label_scrap(name, big, small=None, w=360, rot=4, big_font=(FP, 120)):
    h = 150 if not small else 210
    canvas, pad = scrap(w, h, rot=0)
    d = ImageDraw.Draw(canvas)
    fb = font(*big_font)
    bw = d.textlength(big, font=fb)
    d.text((pad + (w - bw) / 2, pad + 6), big, font=fb, fill=INK + (255,))
    if small:
        fs = font(FI, 40)
        sw = d.textlength(small, font=fs)
        d.text((pad + (w - sw) / 2, pad + 128), small, font=fs, fill=INK + (255,))
    canvas = canvas.rotate(rot, expand=True, resample=Image.BICUBIC)
    canvas.save(f'assets/{name}.png')


def transition_strip():
    """Bande papier verticale pleine hauteur pour un balayage de transition."""
    w, h = 700, 1920
    img = Image.new('RGBA', (w, h), CREAM + (255,))
    d = ImageDraw.Draw(img)
    for i in range(0, w, 3):
        d.line([(i, 0), (i, h)], fill=(255, 255, 255, 8))
    # bords déchirés simples (ombre douce des deux côtés)
    edge = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    de = ImageDraw.Draw(edge)
    de.rectangle([0, 0, 24, h], fill=(0, 0, 0, 60))
    de.rectangle([w - 24, 0, w, h], fill=(0, 0, 0, 60))
    edge = edge.filter(ImageFilter.GaussianBlur(10))
    img.alpha_composite(edge)
    img.save('assets/trans_paper.png')


if __name__ == '__main__':
    # petites photos N&B (crops des collages) sur papier
    photo_scrap('stk_etat', 'assets/col_etat.png', (300, 820, 720, 1120), "l'État réclame", rot=-3)
    photo_scrap('stk_guichet', 'assets/col_guichet.png', (150, 380, 620, 900), "un seul guichet", rot=3)
    photo_scrap('stk_struct', 'assets/col_structure.png', (120, 300, 660, 860), "dès le départ", rot=-2)
    photo_scrap('stk_facture', 'assets/col_facture.png', (230, 520, 560, 800), "mauvaise TVA", rot=4)
    # petits libellés / chiffres sur papier
    label_scrap('stk_3pays', "3", "pays", rot=5)
    label_scrap('stk_euro', "€", "ta poche", rot=-5)
    label_scrap('stk_1decl', "1", "déclaration", rot=4)
    label_scrap('stk_ok', "bien fait", None, w=420, rot=-4, big_font=(FI, 72))
    transition_strip()
    print('stickers:', sorted(f for f in os.listdir('assets') if f.startswith(('stk_', 'trans_'))))
