# -*- coding: utf-8 -*-
# Rich animated-overlay stickers: gradient cards, glow, drop shadow, color emoji, flags.
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
os.makedirs('assets', exist_ok=True)

ARCHIVO = 'fonts/Archivo-Black.ttf'
EMOJI = "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf"
EMO_NATIVE = 109  # NotoColorEmoji only renders at 109px, then we downscale

WHITE = (255, 255, 255, 255)
YELLOW = (255, 214, 10, 255)

def emoji_img(ch, size=96):
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

def hexc(s):
    s = s.lstrip('#'); return tuple(int(s[i:i+2], 16) for i in (0, 2, 4))

def flag(kind, w=104, h=68):
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if kind == 'BE':
        for i, c in enumerate([(0,0,0),(253,218,36),(239,51,64)]): d.rectangle([i*w//3,0,(i+1)*w//3,h], fill=c+(255,))
    elif kind == 'FR':
        for i, c in enumerate([(0,35,149),(255,255,255),(237,41,57)]): d.rectangle([i*w//3,0,(i+1)*w//3,h], fill=c+(255,))
    elif kind == 'CH':
        d.rectangle([0,0,w,h], fill=(213,43,30,255)); cx,cy,t,l=w//2,h//2,11,20
        d.rectangle([cx-t//2,cy-l,cx+t//2,cy+l], fill=WHITE); d.rectangle([cx-l,cy-t//2,cx+l,cy+t//2], fill=WHITE)
    elif kind == 'DE':
        for i, c in enumerate([(0,0,0),(221,0,0),(255,206,0)]): d.rectangle([0,i*h//3,w,(i+1)*h//3], fill=c+(255,))
    d.rounded_rectangle([0,0,w-1,h-1], radius=6, outline=(255,255,255,230), width=3)
    return im

def card(W, H, top='#151a30', bot='#2b3557', accent=None, glow='#000000', radius=30):
    """A rounded gradient card with drop shadow + optional glow + left accent bar."""
    pad = 34
    canvas = Image.new('RGBA', (W+pad*2, H+pad*2), (0, 0, 0, 0))
    # glow
    gl = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    gd = ImageDraw.Draw(gl)
    gc = hexc(glow)
    gd.rounded_rectangle([pad-6, pad-2, pad+W+6, pad+H+8], radius=radius+8, fill=gc+(150,))
    gl = gl.filter(ImageFilter.GaussianBlur(18))
    canvas.alpha_composite(gl)
    # shadow
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad+5, pad+11, pad+W+5, pad+H+11], radius=radius, fill=(0, 0, 0, 130))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(7)))
    # gradient body via mask
    grad = vgrad(W, H, hexc(top), hexc(bot)).convert('RGBA')
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W-1, H-1], radius=radius, fill=255)
    canvas.paste(grad, (pad, pad), mask)
    d = ImageDraw.Draw(canvas)
    # top gloss highlight
    d.rounded_rectangle([pad, pad, pad+W-1, pad+H-1], radius=radius, outline=(255, 255, 255, 55), width=2)
    if accent:
        ab = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(ab).rounded_rectangle([0, 0, 16, H-1], radius=8, fill=hexc(accent)+(255,))
        m2 = Image.new('L', (W, H), 0); ImageDraw.Draw(m2).rounded_rectangle([0, 0, W-1, H-1], radius=radius, fill=255)
        canvas.paste(ab, (pad, pad), Image.composite(ab.split()[3], Image.new('L',(W,H),0), m2))
    return canvas, pad

def sticker(name, text=None, accent_txt=None, emoji=None, flagkind=None,
            top='#151a30', bot='#2b3557', bar=None, glow='#0a0e1c',
            fs=66, txt_fill=WHITE, acc_fill=YELLOW, emo=96):
    f = ImageFont.truetype(ARCHIVO, fs)
    tmp = ImageDraw.Draw(Image.new('RGBA', (4, 4)))
    padx, pady = 34, 26
    fw = 104 if flagkind else 0
    ew = emo if emoji else 0
    lead = fw or ew
    gap = 22 if lead else 0
    full = (text or "") + (("  "+accent_txt) if accent_txt else "")
    tb = tmp.textbbox((0, 0), full or "X", font=f)
    tw = (tb[2]-tb[0]) if full else 0
    th = tb[3]-tb[1]
    innerH = max(th, fw and 68 or 0, ew and emo or 0)
    W = padx*2 + lead + gap + tw
    H = pady*2 + innerH
    canvas, pad = card(W, H, top, bot, accent=bar, glow=glow)
    d = ImageDraw.Draw(canvas)
    x = pad + padx
    cy = pad + H//2
    if flagkind:
        fl = flag(flagkind); canvas.alpha_composite(fl, (x, cy-fl.height//2)); x += fw+gap
    elif emoji:
        em = emoji_img(emoji, emo); canvas.alpha_composite(em, (x, cy-em.height//2)); x += ew+gap
    if full:
        ref = tmp.textbbox((0, 0), full, font=f); ty = cy-(ref[3]-ref[1])//2-ref[1]
        if text:
            d.text((x, ty), text, font=f, fill=txt_fill)
            mw = tmp.textbbox((0, 0), text, font=f); mw = mw[2]-mw[0]
            if accent_txt: d.text((x+mw+22, ty), accent_txt, font=f, fill=acc_fill)
        elif accent_txt:
            d.text((x, ty), accent_txt, font=f, fill=acc_fill)
    canvas.save(f'assets/{name}.png')
    return canvas.size

# ---- client flags ----
sticker('cli_be', 'BELGE', flagkind='BE', fs=60, bar='#fdda24')
sticker('cli_fr', 'FRANCE', flagkind='FR', fs=60, bar='#ffffff')
sticker('cli_ch', 'SUISSE', flagkind='CH', fs=60, bar='#d52b1e')
# ---- rate pills ----
sticker('rate_de', accent_txt='19%', flagkind='DE', fs=72, acc_fill=YELLOW)
sticker('rate_be', accent_txt='20%', flagkind='BE', fs=72, acc_fill=YELLOW)
sticker('rate_ch', text='TAUX', accent_txt='23%', fs=64)
# ---- concept stickers ----
sticker('s_faux', text='FAUX', emoji='❌', fs=76, top='#5b0f12', bot='#c0212b', bar='#ff5964', glow='#ff2d3d', txt_fill=WHITE)
sticker('s_20', accent_txt='20%', emoji='🤔', fs=74)
sticker('s_particulier', text='PARTICULIER', emoji='👤', fs=56, bar='#4da3ff')
sticker('s_entreprise', text='ENTREPRISE', emoji='🏢', fs=56, bar='#ffd60a')
sticker('s_poche', text='DE TA POCHE', emoji='💸', fs=54, top='#5b0f12', bot='#b91d28', bar='#ff5964', glow='#ff2d3d')
sticker('s_ok', text='LA SOLUTION', emoji='✅', fs=56, top='#0d3d1e', bot='#128a3e', bar='#3ee06e', glow='#22c55e')
sticker('s_1decl', text='1 SEULE DÉCLA', emoji='📄', fs=54, bar='#4da3ff')
sticker('s_oss', text='GUICHET UNIQUE', accent_txt='OSS', emoji='🇪🇺', fs=56)
sticker('s_warn', text='ATTENTION', emoji='⚠️', fs=58, top='#4a3a05', bot='#a8850a', bar='#ffd60a', glow='#f5c518', acc_fill=WHITE)
sticker('s_cta', text='COMMENTE', accent_txt='« TVA »', emoji='💬', fs=60, bar='#3ee06e', glow='#22c55e')
sticker('s_part3', accent_txt='3 ÉTATS', emoji='🏛️', fs=64)

# ---- ×3 red badge ----
def badge_x3():
    f = ImageFont.truetype(ARCHIVO, 150); txt = "×3"
    tmp = ImageDraw.Draw(Image.new('RGBA', (4, 4))); tb = tmp.textbbox((0, 0), txt, font=f)
    tw, th = tb[2]-tb[0], tb[3]-tb[1]; pad = 40; W, H = tw+pad*2, th+pad*2
    canvas, p = card(W, H, top='#7a0f16', bot='#e0212b', glow='#ff2d3d', radius=34)
    d = ImageDraw.Draw(canvas)
    d.rounded_rectangle([p, p, p+W-1, p+H-1], radius=34, outline=WHITE, width=5)
    d.text((p+pad-tb[0], p+pad-tb[1]), txt, font=f, fill=WHITE)
    canvas.save('assets/x3.png')
badge_x3()

for n in os.listdir('assets'):
    if n.endswith('.png') and not n.startswith('_'):
        print(n, Image.open('assets/'+n).size)
