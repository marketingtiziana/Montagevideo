# -*- coding: utf-8 -*-
# Inserts / incrustations premium (navy + or) pour illustrer les propos.
# Petites pastilles a coin haut-droit (n'occulte ni le visage ni les sous-titres).
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
os.makedirs('assets', exist_ok=True)

ARCHIVO = 'fonts/Archivo-Black.ttf'
BEBAS = 'fonts/BebasNeue-Regular.ttf'
EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"
EMO_NATIVE = 109

GOLD = (231, 196, 106, 255)
WHITE = (255, 255, 255, 255)
INK = (232, 238, 250, 255)

def emoji_img(ch, size=72):
    f = ImageFont.truetype(EMOJI, EMO_NATIVE)
    im = Image.new("RGBA", (EMO_NATIVE, EMO_NATIVE), (0, 0, 0, 0))
    ImageDraw.Draw(im).text((0, 0), ch, font=f, embedded_color=True)
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    r = size / max(im.size)
    return im.resize((max(1, int(im.width*r)), max(1, int(im.height*r))), Image.LANCZOS)

def vgrad(w, h, top, bot):
    g = Image.new("RGB", (1, h))
    for y in range(h):
        t = y/max(1, h-1)
        g.putpixel((0, y), tuple(int(top[i]+(bot[i]-top[i])*t) for i in range(3)))
    return g.resize((w, h))

def chip(name, text, emoji=None, num=None, accent=GOLD, danger=False, fs=52):
    """Pastille arrondie navy, liseré or, texte blanc gras. Optionnel: emoji ou numero or."""
    f = ImageFont.truetype(ARCHIVO, fs)
    fnum = ImageFont.truetype(BEBAS, int(fs*1.5))
    tmp = ImageDraw.Draw(Image.new('RGBA', (4, 4)))
    padx, pady = 40, 26
    tb = tmp.textbbox((0, 0), text, font=f); tw, th = tb[2]-tb[0], tb[3]-tb[1]
    lead = 0
    if emoji: lead = 72
    elif num is not None: lead = int(fs*1.1)
    gap = 20 if lead else 0
    innerH = max(th, 72)
    W = padx*2 + lead + gap + tw
    H = pady*2 + innerH
    PAD = 44
    canvas = Image.new('RGBA', (W+PAD*2, H+PAD*2), (0, 0, 0, 0))
    # glow exterieur doux (or ou rouge)
    glow = (206, 84, 74) if danger else accent[:3]
    for grow, blur, a in [(12, 26, 90), (5, 13, 110)]:
        gl = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(gl).rounded_rectangle([PAD-grow, PAD-grow+3, PAD+W+grow, PAD+H+grow+6],
                                             radius=30+grow, fill=glow+(a,))
        canvas.alpha_composite(gl.filter(ImageFilter.GaussianBlur(blur)))
    # ombre portee
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([PAD+5, PAD+12, PAD+W+5, PAD+H+12], radius=28, fill=(0, 0, 0, 150))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(9)))
    # corps degrade navy
    top, bot = ((60, 22, 24), (36, 12, 14)) if danger else ((22, 30, 52), (12, 18, 34))
    grad = vgrad(W, H, top, bot).convert('RGBA')
    mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, W-1, H-1], radius=28, fill=255)
    canvas.paste(grad, (PAD, PAD), mask)
    d = ImageDraw.Draw(canvas)
    rim = (230, 96, 86) if danger else accent
    d.rounded_rectangle([PAD, PAD, PAD+W-1, PAD+H-1], radius=28, outline=rim, width=3)
    d.rounded_rectangle([PAD+3, PAD+3, PAD+W-4, PAD+H-4], radius=25, outline=(255, 255, 255, 55), width=1)
    x = PAD + padx; cy = PAD + H//2
    if emoji:
        em = emoji_img(emoji, 72); canvas.alpha_composite(em, (x, cy-em.height//2)); x += lead+gap
    elif num is not None:
        nb = d.textbbox((0, 0), str(num), font=fnum)
        d.text((x-nb[0], cy-(nb[3]-nb[1])//2-nb[1]), str(num), font=fnum, fill=rim); x += lead+gap
    tb2 = d.textbbox((0, 0), text, font=f)
    d.text((x-tb2[0], cy-(tb2[3]-tb2[1])//2-tb2[1]+2), text, font=f, fill=WHITE)
    canvas.save(f'assets/{name}.png')
    return canvas.size

# --- inserts synchronises aux propos ---
chip('ins_pasprevu', 'PAS PRÉVU', emoji='❌', danger=True, fs=54)
chip('ins_p1', 'POUR VIVRE', num=1, fs=52)
chip('ins_p2', 'FOND DE ROULEMENT', num=2, fs=46)
chip('ins_frais', 'FRAIS MENSUELS', emoji='📅', fs=48)
chip('ins_stress', 'MOINS DE STRESS', emoji='😌', fs=48)
chip('ins_cta', 'ET VOUS ?', emoji='💬', fs=58)

# flashs de transition sobres (or/blanc) pour ponctuer les cuts B-roll
Image.new('RGBA', (1080, 1920), (255, 255, 255, 60)).save('assets/flash_w.png')
Image.new('RGBA', (1080, 1920), (231, 196, 106, 46)).save('assets/flash_g.png')

for n in sorted(os.listdir('assets')):
    if n.endswith('.png'):
        print(n, Image.open('assets/'+n).size)
