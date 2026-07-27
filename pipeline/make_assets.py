# -*- coding: utf-8 -*-
# Draw animated-overlay chips (flags, rate pills, badges) as transparent PNGs.
from PIL import Image, ImageDraw, ImageFont
import os
os.makedirs('assets', exist_ok=True)

ANTON = 'fonts/Anton-Regular.ttf'
ARCHIVO = 'fonts/Archivo-Black.ttf'

NAVY = (18, 20, 34, 255)
WHITE = (255, 255, 255, 255)
YELLOW = (255, 214, 10, 255)

def rounded(draw, xy, r, fill):
    draw.rounded_rectangle(xy, radius=r, fill=fill)

def flag(kind, w=104, h=68):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if kind == 'BE':
        cols = [(0, 0, 0), (253, 218, 36), (239, 51, 64)]
        for i, c in enumerate(cols):
            d.rectangle([i*w//3, 0, (i+1)*w//3, h], fill=c+(255,))
    elif kind == 'FR':
        cols = [(0, 35, 149), (255, 255, 255), (237, 41, 57)]
        for i, c in enumerate(cols):
            d.rectangle([i*w//3, 0, (i+1)*w//3, h], fill=c+(255,))
    elif kind == 'CH':
        d.rectangle([0, 0, w, h], fill=(213, 43, 30, 255))
        cx, cy, t, l = w//2, h//2, 11, 20
        d.rectangle([cx-t//2, cy-l, cx+t//2, cy+l], fill=WHITE)
        d.rectangle([cx-l, cy-t//2, cx+l, cy+t//2], fill=WHITE)
    elif kind == 'DE':
        cols = [(0, 0, 0), (221, 0, 0), (255, 206, 0)]
        for i, c in enumerate(cols):
            d.rectangle([0, i*h//3, w, (i+1)*h//3], fill=c+(255,))
    # thin white border
    d.rounded_rectangle([0, 0, w-1, h-1], radius=6, outline=(255, 255, 255, 230), width=3)
    return im

def chip(main, flagkind=None, accent=None, font_path=ARCHIVO, fs=72, pad=26, main_fill=WHITE):
    f = ImageFont.truetype(font_path, fs)
    tmp = ImageDraw.Draw(Image.new('RGBA', (10, 10)))
    txt = main + (("  " + accent) if accent else "")
    tb = tmp.textbbox((0, 0), txt, font=f)
    tw, th = tb[2]-tb[0], tb[3]-tb[1]
    fw, fh = (104, 68) if flagkind else (0, 0)
    gap = 20 if flagkind else 0
    W = pad*2 + fw + gap + tw
    H = pad*2 + max(th, fh)
    im = Image.new('RGBA', (W, H+8), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    # soft shadow
    d.rounded_rectangle([6, 12, W-1, H+6], radius=26, fill=(0, 0, 0, 90))
    rounded(d, [0, 0, W-7, H], 26, NAVY)
    d.rounded_rectangle([0, 0, W-7, H], radius=26, outline=(255, 255, 255, 40), width=2)
    x = pad
    cy = H//2
    if flagkind:
        fl = flag(flagkind)
        im.alpha_composite(fl, (x, cy - fl.height//2))
        x += fw + gap
    # draw main (white) + accent (yellow)
    ref = main if main else (accent or "X")
    rb = d.textbbox((0, 0), ref, font=f)
    ty = cy - (rb[3]-rb[1])//2 - rb[1]
    if main:
        d.text((x, ty), main, font=f, fill=main_fill)
        mw = d.textbbox((0, 0), main, font=f)[2] - d.textbbox((0, 0), main, font=f)[0]
        if accent:
            d.text((x + mw + 22, ty), accent, font=f, fill=YELLOW)
    elif accent:
        d.text((x, ty), accent, font=f, fill=YELLOW)
    return im

def badge_x3():
    f = ImageFont.truetype(ARCHIVO, 150)
    txt = "×3"
    tmp = ImageDraw.Draw(Image.new('RGBA', (10, 10)))
    tb = tmp.textbbox((0, 0), txt, font=f)
    tw, th = tb[2]-tb[0], tb[3]-tb[1]
    pad = 40
    W, H = tw+pad*2, th+pad*2
    im = Image.new('RGBA', (W+8, H+10), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([8, 12, W+6, H+8], radius=34, fill=(0, 0, 0, 90))
    d.rounded_rectangle([0, 0, W, H], radius=34, fill=(239, 51, 64, 255))
    d.rounded_rectangle([0, 0, W, H], radius=34, outline=WHITE, width=5)
    d.text((pad-tb[0], pad-tb[1]), txt, font=f, fill=WHITE)
    return im

# Generate assets
flag('BE');
chip("BELGE", 'BE', fs=64).save('assets/cli_be.png')
chip("FRANCE", 'FR', fs=64).save('assets/cli_fr.png')
chip("SUISSE", 'CH', fs=64).save('assets/cli_ch.png')
chip("19%", 'DE', fs=76, main_fill=YELLOW).save('assets/rate_de.png')
chip("20%", 'BE', fs=76, main_fill=YELLOW).save('assets/rate_be.png')
chip("TAUX", None, accent="23%", fs=68).save('assets/rate_ch.png')  # no flag: country not clearly named
badge_x3().save('assets/x3.png')
chip("GUICHET UNIQUE", accent="OSS", fs=60).save('assets/oss.png')

for n in ['cli_be', 'cli_fr', 'cli_ch', 'rate_de', 'rate_be', 'rate_ch', 'x3', 'oss']:
    im = Image.open(f'assets/{n}.png')
    print(f"{n}.png  {im.size}")
