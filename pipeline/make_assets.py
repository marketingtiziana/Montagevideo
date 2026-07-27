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
    """A rounded gradient card with big outer glow, deep shadow, glossy top, colored rim."""
    pad = 46
    canvas = Image.new('RGBA', (W+pad*2, H+pad*2), (0, 0, 0, 0))
    gc = hexc(glow)
    # wide soft outer glow (two passes for a richer halo)
    for grow, blur, a in [(14, 30, 130), (6, 16, 150)]:
        gl = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
        ImageDraw.Draw(gl).rounded_rectangle(
            [pad-grow, pad-grow+4, pad+W+grow, pad+H+grow+8], radius=radius+grow, fill=gc+(a,))
        canvas.alpha_composite(gl.filter(ImageFilter.GaussianBlur(blur)))
    # deep drop shadow
    sh = Image.new('RGBA', canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([pad+6, pad+15, pad+W+6, pad+H+15], radius=radius, fill=(0, 0, 0, 150))
    canvas.alpha_composite(sh.filter(ImageFilter.GaussianBlur(10)))
    # gradient body via mask
    grad = vgrad(W, H, hexc(top), hexc(bot)).convert('RGBA')
    mask = Image.new('L', (W, H), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, W-1, H-1], radius=radius, fill=255)
    canvas.paste(grad, (pad, pad), mask)
    # glossy top highlight (upper half brighter, blurred)
    gloss = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(gloss).rounded_rectangle([6, 5, W-7, int(H*0.5)], radius=radius-6, fill=(255, 255, 255, 42))
    gloss = gloss.filter(ImageFilter.GaussianBlur(6))
    canvas.paste(gloss, (pad, pad), Image.composite(gloss.split()[3], Image.new('L', (W, H), 0), mask))
    d = ImageDraw.Draw(canvas)
    # bright inner rim + colored outer rim
    rim = hexc(accent) if accent else (255, 255, 255)
    d.rounded_rectangle([pad, pad, pad+W-1, pad+H-1], radius=radius, outline=rim+(235,), width=3)
    d.rounded_rectangle([pad+3, pad+3, pad+W-4, pad+H-4], radius=radius-3, outline=(255, 255, 255, 70), width=2)
    if accent:
        ab = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(ab).rounded_rectangle([0, 0, 18, H-1], radius=9, fill=hexc(accent)+(255,))
        m2 = Image.new('L', (W, H), 0); ImageDraw.Draw(m2).rounded_rectangle([0, 0, W-1, H-1], radius=radius, fill=255)
        canvas.paste(ab, (pad, pad), Image.composite(ab.split()[3], Image.new('L', (W, H), 0), m2))
    return canvas, pad

# Colorful gradient themes (top, bot, glow, default-bar) for variety
THEMES = [
    ('#12294f', '#1e56b3', '#2f7ff5', '#66b0ff'),   # blue
    ('#2a1250', '#5b23b0', '#8b3cf0', '#c08bff'),   # purple
    ('#08303a', '#0f7d86', '#17c0c0', '#5ff0e6'),   # teal
    ('#4a2a05', '#b3610a', '#ff8a1f', '#ffc07a'),   # orange
    ('#4a0a2e', '#b0246e', '#f03c9a', '#ff8bd0'),   # pink
    ('#1a1450', '#3a3ab0', '#5b5bf0', '#9b9bff'),   # indigo
    ('#0d3d1e', '#12904a', '#22c55e', '#6ff0a0'),   # green
    ('#4a1010', '#b32424', '# f0453c'.replace(' ', ''), '#ff8b8b'),  # crimson
]
_theme_i = [0]

def sticker(name, text=None, accent_txt=None, emoji=None, flagkind=None,
            top=None, bot=None, bar=None, glow=None,
            fs=66, txt_fill=WHITE, acc_fill=YELLOW, emo=96):
    if top is None:                      # auto-assign a colorful theme
        th = THEMES[_theme_i[0] % len(THEMES)]; _theme_i[0] += 1
        top, bot, glow = th[0], th[1], th[2]
        if bar is None:
            bar = th[3]
    if glow is None:
        glow = '#0a0e1c'
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
# --- extra stickers (v5: more incrustations) ---
sticker('s_hook', text='TVA', accent_txt='INTERNATIONALE', emoji='🌍', fs=52, bar='#4da3ff')
sticker('s_logique', text='LOGIQUE', accent_txt='?', emoji='🤔', fs=60)
sticker('s_eu', text='TVA', accent_txt='UE', emoji='🇪🇺', fs=64, bar='#4da3ff')
sticker('s_money', text='CHACUN SA PART', emoji='💰', fs=52, top='#4a3a05', bot='#a8850a', bar='#ffd60a', glow='#f5c518')
sticker('s_arrow', text='EN COMMENTAIRE', emoji='👇', fs=54, top='#0d3d1e', bot='#128a3e', bar='#3ee06e', glow='#22c55e')
sticker('s_piege', text='LE PIÈGE', emoji='⚠️', fs=60, top='#5b0f12', bot='#c0212b', bar='#ff5964', glow='#ff2d3d', acc_fill=WHITE)
# --- start-of-video stickers (v5b) ---
sticker('s_secret', text='PERSONNE', accent_txt='NE DIT ÇA', emoji='🤫', fs=52, bar='#ffd60a')
sticker('s_online', text='FORMATION', accent_txt='EN LIGNE', emoji='🎓', fs=52, bar='#4da3ff')
sticker('s_facture', text='TVA', accent_txt='FRANÇAISE', emoji='🧾', fs=54, bar='#ffffff')

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

# colored transition flashes
Image.new('RGBA', (1080, 1920), (255, 255, 255, 95)).save('assets/flash.png')
for nm, rgb, a in [('flash_b', (90, 150, 255), 80), ('flash_p', (170, 90, 255), 78),
                   ('flash_c', (60, 230, 220), 74), ('flash_o', (255, 150, 40), 74)]:
    Image.new('RGBA', (1080, 1920), rgb + (a,)).save(f'assets/{nm}.png')
Image.new('RGBA', (1080, 1920), (255, 255, 255, 42)).save('assets/miniflash.png')
for nm, rgb in [('mini_b', (120, 170, 255)), ('mini_p', (185, 120, 255)),
                ('mini_c', (90, 235, 225)), ('mini_o', (255, 170, 70)), ('mini_w', (255, 255, 255))]:
    Image.new('RGBA', (1080, 1920), rgb + (44,)).save(f'assets/{nm}.png')

for n in os.listdir('assets'):
    if n.endswith('.png') and not n.startswith('_'):
        print(n, Image.open('assets/'+n).size)
