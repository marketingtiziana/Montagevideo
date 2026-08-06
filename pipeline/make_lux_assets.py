# -*- coding: utf-8 -*-
# Incrustations ÉDITORIALES style référence "old money" (SANS IA) :
#  - fonds texturés (papier ivoire / noir toilé, grain halftone)
#  - fiche "registre" lignée blanche, coins arrondis, colonne, ombre portée
#  - listes qui s'écrivent LIGNE PAR LIGNE (stages PNG -> révélation)
#  - cartes typographiques (grande serif italique) pour les temps forts
# Tout en 1080x1920, PNG plein cadre opaques (remplacent le talking-head).
import os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter

random.seed(7)
os.makedirs('assets', exist_ok=True)
W, H = 1080, 1920
IVORY = (238, 234, 226)
INK = (26, 24, 22)
PAPER_LINE = (140, 140, 140)

F = 'fonts/EBGaramond.ttf'
FI = 'fonts/EBGaramond-Italic.ttf'
FP = 'fonts/PlayfairDisplay.ttf'


def font(path, size):
    return ImageFont.truetype(path, size)


def texture(base_rgb, dark=False):
    """Fond uni + grain fin (halftone/toile) subtil."""
    img = Image.new('RGB', (W, H), base_rgb)
    noise = Image.new('L', (W, H), 0)
    nd = noise.load()
    amp = 16 if not dark else 10
    for y in range(0, H, 2):
        for x in range(0, W, 2):
            v = random.randint(-amp, amp)
            nd[x, y] = max(0, min(255, 128 + v))
    noise = noise.filter(ImageFilter.GaussianBlur(0.4))
    grain = Image.merge('RGB', (noise, noise, noise))
    img = Image.blend(img, grain, 0.05 if not dark else 0.08)
    # léger vignettage
    vig = Image.new('L', (W, H), 0)
    dv = ImageDraw.Draw(vig)
    dv.ellipse([-W*0.25, -H*0.15, W*1.25, H*1.15], fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(220))
    black = Image.new('RGB', (W, H), (0, 0, 0))
    img = Image.composite(img, black, vig.point(lambda p: int(60 + p*0.76)))
    return img


def rounded_shadow(card, xy, radius, shadow=(0, 0, 0, 90), blur=28, off=(0, 16)):
    """Colle une ombre portée douce sous une zone rectangulaire arrondie."""
    x0, y0, x1, y1 = xy
    sh = Image.new('RGBA', card.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(sh)
    d.rounded_rectangle([x0+off[0], y0+off[1], x1+off[0], y1+off[1]], radius=radius, fill=shadow)
    sh = sh.filter(ImageFilter.GaussianBlur(blur))
    card.alpha_composite(sh)


def ledger_base(title=None):
    """Fiche registre lignée (blanche) sur fond noir toilé. Renvoie (img, geometry)."""
    bg = texture((14, 13, 12), dark=True).convert('RGBA')
    mx0, my0, mx1, my1 = 120, 300, W-120, H-360
    rounded_shadow(bg, (mx0, my0, mx1, my1), 26)
    card = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dc = ImageDraw.Draw(card)
    dc.rounded_rectangle([mx0, my0, mx1, my1], radius=26, fill=(250, 249, 246, 255))
    # lignes horizontales réglées
    rows = 20
    row_h = (my1 - my0 - 60) / rows
    top = my0 + 40
    for i in range(rows+1):
        y = int(top + i*row_h)
        dc.line([mx0+30, y, mx1-30, y], fill=PAPER_LINE + (120,), width=2)
    # colonne verticale (comme un grand livre)
    colx = int(mx0 + (mx1-mx0)*0.60)
    dc.line([colx, top, colx, int(top + 11*row_h)], fill=(120, 120, 120, 150), width=2)
    bg.alpha_composite(card)
    geo = dict(mx0=mx0, my0=my0, mx1=mx1, my1=my1, top=top, row_h=row_h, colx=colx)
    return bg, geo


def draw_ledger_stage(name, title, lines, n_visible):
    """Un état de la fiche : titre + `n_visible` premières lignes écrites."""
    img, g = ledger_base()
    d = ImageDraw.Draw(img)
    ft_title = font(FI, 58)
    ft_line = font(FI, 52)
    x = g['mx0'] + 60
    # titre sur les 1-2 premières lignes
    ty = int(g['top'] + g['row_h']*0.15)
    d.text((x, ty), title, font=ft_title, fill=(30, 28, 26, 255))
    # lignes de liste (une par ligne réglée, à partir de la 3e)
    ly = int(g['top'] + g['row_h']*2.15)
    for i, ln in enumerate(lines):
        if i >= n_visible:
            break
        d.text((x+6, ly + i*int(g['row_h']*1.30)), ln, font=ft_line, fill=(34, 32, 30, 255))
    img.convert('RGB').save(f'assets/{name}.png')


def statement_card(name, lines, italic=True, dark=False, accent_idx=None, size=104):
    """Carte typographique : grande serif centrée sur fond texturé."""
    base_rgb = (14, 13, 12) if dark else IVORY
    img = texture(base_rgb, dark=dark).convert('RGBA')
    d = ImageDraw.Draw(img)
    fx = font(FI if italic else FP, size)
    fx_acc = font(FP, int(size*1.14))
    col = (238, 234, 226, 255) if dark else (28, 26, 24, 255)
    # hauteur totale pour centrer verticalement
    gap = int(size*1.32)
    total = len(lines)*gap
    y = (H - total)//2
    for i, ln in enumerate(lines):
        f_use = fx_acc if (accent_idx is not None and i == accent_idx) else fx
        w = d.textlength(ln, font=f_use)
        d.text(((W-w)//2, y + i*gap), ln, font=f_use, fill=col)
        if accent_idx is not None and i == accent_idx:
            # petit soulignement fin sous le mot accentué
            uy = y + i*gap + int(size*1.28)
            d.line([(W-w)//2, uy, (W-w)//2 + w, uy], fill=col, width=3)
    img.convert('RGB').save(f'assets/{name}.png')


if __name__ == '__main__':
    # backgrounds de base (réutilisables)
    texture(IVORY).save('assets/bg_paper.png')
    texture((14, 13, 12), dark=True).save('assets/bg_dark.png')

    # --- Cutaway A : fiche registre "sans guichet unique" (3 lignes qui s'écrivent)
    TITLE = "sans guichet unique :"
    LINES = ["s'enregistrer en Allemagne", "s'enregistrer en Belgique", "s'enregistrer en Espagne"]
    for k in range(0, 4):
        draw_ledger_stage(f'led_a{k}', TITLE, LINES, k)

    # --- Cutaway B : bascule "avec le guichet unique -> 1 seule déclaration"
    statement_card('card_oss', ["avec le guichet unique", "", "une ", "seule déclaration"],
                   italic=True, dark=True, accent_idx=3, size=92)

    # --- Cutaway C : temps fort "le guichet unique"
    statement_card('card_guichet', ["le", "guichet", "unique"], italic=True, dark=False,
                   accent_idx=1, size=132)

    # --- Cutaway D : CTA de fin
    statement_card('card_cta', ["commente", "« TVA »"], italic=True, dark=True,
                   accent_idx=1, size=118)

    print('assets lux:', sorted(f for f in os.listdir('assets') if f.startswith(('led_', 'card_', 'bg_'))))
