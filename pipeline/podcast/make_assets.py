"""ÉTAPES 5, 8, 11 — Éléments graphiques (Pillow), style rétro 90s / Y2K : bulle de BD, étoiles, rayures.
Tout est dessiné en 1920x1080 ; les animations sont des séquences RGBA encodées en .mov (png) avec alpha,
posées ensuite par overlay. Si assets/logo.png (fourni par toi) existe, il remplace le logo généré.
Sorties (assets/podcast/) : logo.png, jingle.mov, cta.mov, lower_third.mov, reseaux.mov, endslate.mov"""
import json, math, os, subprocess, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

cfg = json.load(open('pipeline/podcast/config.json'))
FPS = 30000 / 1001
OUT = 'assets/podcast'; os.makedirs(OUT, exist_ok=True)
hexc = lambda h, a=255: tuple(int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)) + (a,)
PRI, ACC, TXT = hexc(cfg['couleur_primaire']), hexc(cfg['couleur_accent']), hexc(cfg['couleur_texte'])
INK = (12, 14, 30, 255)
F_RETRO = 'fonts/Bungee-Regular.ttf'; F_UI = 'fonts/Archivo-Black.ttf'; F_TXT = 'fonts/Montserrat-ExtraBoldItalic.ttf'
font = lambda p, s: ImageFont.truetype(p, s)
NAME = (cfg.get('nom_podcast') or '').strip()        # vide : aucun nom ni logo -> pictogramme micro
SIGLE = NAME[:1]

def mic(size, color=INK, bg=None):
    """Pictogramme micro de podcast (générique, sans nom ni marque)."""
    s = size; im = Image.new('RGBA', (s, s), (0, 0, 0, 0)); d = ImageDraw.Draw(im); w = max(4, s // 14)
    d.rounded_rectangle([s * .36, s * .08, s * .64, s * .58], s // 6, fill=color)
    d.arc([s * .24, s * .26, s * .76, s * .70], 0, 180, fill=color, width=w)
    d.line([(s * .5, s * .70), (s * .5, s * .86)], fill=color, width=w)
    d.line([(s * .34, s * .88), (s * .66, s * .88)], fill=color, width=w)
    for k in (1, 2):                                    # ondes sonores
        r = s * (0.30 + 0.12 * k)
        d.arc([s * .5 - r, s * .33 - r, s * .5 + r, s * .33 + r], -40, 40, fill=color, width=w)
        d.arc([s * .5 - r, s * .33 - r, s * .5 + r, s * .33 + r], 140, 220, fill=color, width=w)
    return im
W, H = 1920, 1080
ease_out = lambda x: 1 - (1 - min(max(x, 0), 1)) ** 3

def write_mov(frames_dir, n, out, alpha=True):
    args = ['ffmpeg', '-v', 'error', '-y', '-framerate', '30000/1001', '-i', f'{frames_dir}/%04d.png']
    args += ['-c:v', 'png', '-pix_fmt', 'rgba'] if alpha else ['-c:v', 'libx264', '-crf', '12', '-preset', 'veryfast', '-pix_fmt', 'yuv420p']
    subprocess.run(args + [out], check=True); shutil.rmtree(frames_dir)

def seq(name, n, draw_fn, alpha=True, size=(W, H)):
    d = f'{OUT}/_{name}'; os.makedirs(d, exist_ok=True)
    for i in range(n):
        im = Image.new('RGBA', size, (0, 0, 0, 0)); draw_fn(im, i); im.save(f'{d}/{i:04d}.png')
    write_mov(d, n, f'{OUT}/{name}.mov', alpha); print(name, n, 'images')

def star(dr, cx, cy, r, fill, outline=INK, w=4):
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5; rr = r if k % 2 == 0 else r * 0.42
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    dr.polygon(pts, fill=fill, outline=outline, width=w)

def sparkle(dr, cx, cy, r, fill):
    """Étoile scintillante à 4 branches (Y2K)."""
    pts = []
    for k in range(8):
        a = k * math.pi / 4; rr = r if k % 2 == 0 else r * 0.22
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    dr.polygon(pts, fill=fill)

def stripes(im, box, color, gap=18, width=7):
    x0, y0, x1, y1 = box; m = Image.new('L', im.size, 0); d = ImageDraw.Draw(m)
    for x in range(x0 - (y1 - y0), x1, gap): d.line([(x, y1), (x + (y1 - y0), y0)], fill=255, width=width)
    clip = Image.new('L', im.size, 0); ImageDraw.Draw(clip).rectangle(box, fill=255)
    m = Image.composite(m, Image.new('L', im.size, 0), clip)
    layer = Image.new('RGBA', im.size, color[:3] + (0,))
    layer.putalpha(m.point(lambda v: v * color[3] // 255))
    im.alpha_composite(layer)

def bubble(size, text, fnt, fill=(255, 255, 255, 255), txt=INK, shadow=ACC):
    """Bulle de BD (ellipse + pointe) avec ombre décalée façon sticker."""
    w, h = size; im = Image.new('RGBA', (w + 40, h + 80), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for off, col in ((16, shadow), (0, fill)):
        d.ellipse([10 + off, 10 + off, w + off, h + off], fill=col, outline=INK, width=8)
        d.polygon([(w * 0.26 + off, h * 0.86 + off), (w * 0.16 + off, h + 62 + off), (w * 0.42 + off, h * 0.93 + off)],
                  fill=col, outline=INK, width=8)
    d.ellipse([18, 18, w - 8, h - 8], fill=fill)
    return im

# ---------------------------------------------------------------- logo
def make_logo():
    if os.path.exists('assets/logo.png'):
        shutil.copy('assets/logo.png', f'{OUT}/logo.png'); print('logo : fourni'); return
    if not cfg.get('logo', True) or not NAME:
        if os.path.exists(f'{OUT}/logo.png'): os.remove(f'{OUT}/logo.png')
        print('logo : aucun (demandé)'); return
    f = font(F_RETRO, 150); tw = int(f.getlength(NAME))
    im = Image.new('RGBA', (tw + 140, 300), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for off, col in ((12, INK), (6, ACC), (0, TXT)):
        d.text((50 + off, 30 + off), NAME, font=f, fill=col, stroke_width=8, stroke_fill=INK)
    d.rounded_rectangle([50, 205, 50 + 330, 270], 30, fill=PRI, outline=INK, width=6)
    d.text((80, 212), 'PODCAST', font=font(F_UI, 40), fill=TXT)
    sparkle(d, tw + 95, 50, 34, ACC); sparkle(d, tw + 60, 130, 18, TXT)
    im.crop(im.getbbox()).save(f'{OUT}/logo.png'); print('logo : généré (aucun logo.png fourni)')

# ---------------------------------------------------------------- jingle (1,5 s)
def make_jingle():
    n = int(round(1.5 * FPS)); f = font(F_RETRO, 170)
    tw = f.getlength(NAME) if NAME else 520; bub = bubble((int(tw + 260), 420), NAME, f)
    stars = [(300, 230, 46, 0), (1640, 210, 60, 5), (1580, 820, 40, 9), (380, 840, 54, 3), (960, 120, 30, 7), (1760, 520, 28, 12)]
    def pop(i, start):     # 0 -> 110 -> 100 % sur 8 images
        k = i - start
        if k < 0: return 0
        if k < 5: return 1.10 * ease_out(k / 5)
        if k < 8: return 1.10 - 0.10 * ((k - 5) / 3)
        return 1.0
    def draw(im, i):
        d = ImageDraw.Draw(im); d.rectangle([0, 0, W, H], fill=PRI)
        stripes(im, (0, 0, W, H), (255, 255, 255, 22), gap=70, width=22)
        for k, (x, y, r, ph) in enumerate(stars):
            t = (i + ph * 3) / 9.0; s = 0.55 + 0.45 * abs(math.sin(t * math.pi))
            a = int(140 + 115 * abs(math.cos(t * math.pi * 0.8)))
            col = ACC[:3] + (a,) if k % 2 == 0 else TXT[:3] + (a,)
            sparkle(d, x, y, r * s * 1.6, col) if k % 3 else star(d, x, y, r * s, col)
        s = pop(i, 0)
        if s > 0:
            b = bub.resize((max(1, int(bub.width * s)), max(1, int(bub.height * s))), Image.LANCZOS)
            im.alpha_composite(b, (int(W / 2 - b.width / 2 + 20 * s), int(H / 2 - b.height / 2 + 20 * s)))
        st = pop(i, 2)
        if st > 0:
            if NAME:
                t = Image.new('RGBA', (int(tw + 60), 260), (0, 0, 0, 0)); dt = ImageDraw.Draw(t)
                dt.text((30, 20), NAME, font=f, fill=PRI, stroke_width=6, stroke_fill=INK)
            else:
                t = mic(260, PRI)
            t = t.resize((max(1, int(t.width * st)), max(1, int(t.height * st))), Image.LANCZOS)
            im.alpha_composite(t, (int(W / 2 - t.width / 2 + 10), int(H / 2 - t.height / 2 - 20)))
    seq('jingle', n, draw, alpha=False)

# ---------------------------------------------------------------- icônes plateformes (génériques)
def icon(kind, s=72):
    im = Image.new('RGBA', (s, s), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    if kind == 'apple':      # podcast : cercle violet + ondes + micro
        d.rounded_rectangle([0, 0, s - 1, s - 1], s // 4, fill=(146, 60, 230, 255))
        c = s / 2
        for r in (0.36, 0.24):
            d.arc([c - r * s, c - r * s - 4, c + r * s, c + r * s - 4], 200, 340, fill='white', width=max(3, s // 16))
        d.ellipse([c - s * .08, c - s * .1, c + s * .08, c + s * .06], fill='white')
        d.rounded_rectangle([c - s * .05, c + s * .06, c + s * .05, c + s * .34], s // 20, fill='white')
    elif kind == 'spotify':  # cercle vert + 3 arcs
        d.ellipse([0, 0, s - 1, s - 1], fill=(30, 215, 96, 255))
        for k, (y, w) in enumerate(((0.33, 0.62), (0.5, 0.52), (0.66, 0.42))):
            d.arc([s * (0.5 - w / 2), s * y - 2, s * (0.5 + w / 2), s * y + s * 0.35], 205, 335, fill=(10, 10, 10), width=max(3, s // 12 - k))
    elif kind == 'linkedin':
        d.rounded_rectangle([0, 0, s - 1, s - 1], s // 6, fill=(10, 102, 194, 255))
        d.text((s * 0.16, s * 0.02), 'in', font=font(F_UI, int(s * 0.72)), fill='white')
    elif kind == 'instagram':
        g = Image.new('RGBA', (s, s)); gd = ImageDraw.Draw(g)
        for y in range(s):
            t = y / s; gd.line([(0, y), (s, y)], fill=(int(131 + 122 * t), int(58 + 30 * t), int(180 - 140 * t), 255))
        m = Image.new('L', (s, s), 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, s - 1, s - 1], s // 4, fill=255)
        im.paste(g, (0, 0), m); d = ImageDraw.Draw(im)
        d.rounded_rectangle([s * .2, s * .2, s * .8, s * .8], s // 6, outline='white', width=max(3, s // 14))
        d.ellipse([s * .36, s * .36, s * .64, s * .64], outline='white', width=max(3, s // 14))
        d.ellipse([s * .66, s * .26, s * .74, s * .34], fill='white')
    elif kind == 'youtube':
        d.rounded_rectangle([0, s * .14, s - 1, s * .86], s // 5, fill=(255, 0, 0, 255))
        d.polygon([(s * .40, s * .32), (s * .40, s * .68), (s * .70, s * .50)], fill='white')
    elif kind == 'bell':
        d.pieslice([s * .18, s * .12, s * .82, s * .8], 180, 360, fill='white')
        d.rectangle([s * .18, s * .46, s * .82, s * .7], fill='white')
        d.polygon([(s * .1, s * .74), (s * .9, s * .74), (s * .82, s * .64), (s * .18, s * .64)], fill='white')
        d.ellipse([s * .42, s * .74, s * .58, s * .9], fill='white')
    return im

def pill(text, fnt, fill, txtc=TXT, pad=(34, 16), icons=(), icon_s=56, outline=INK):
    tw = int(fnt.getlength(text)); th = fnt.size
    w = tw + 2 * pad[0] + sum(icon_s + 14 for _ in icons); h = th + 2 * pad[1] + 10
    im = Image.new('RGBA', (w + 12, h + 12), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([8, 8, w + 8, h + 8], h // 2, fill=INK)                    # ombre sticker
    d.rounded_rectangle([0, 0, w, h], h // 2, fill=fill, outline=outline, width=4)
    d.text((pad[0], pad[1] + 2), text, font=fnt, fill=txtc)
    x = pad[0] + tw + 14
    for ic in icons:
        im.alpha_composite(icon(ic, icon_s), (x, (h - icon_s) // 2)); x += icon_s + 14
    return im

def cursor_img(s=54):
    im = Image.new('RGBA', (s, s), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    p = [(4, 2), (4, 44), (15, 33), (24, 52), (32, 48), (23, 30), (40, 30)]
    d.polygon(p, fill='white', outline=INK, width=4); return im

# ---------------------------------------------------------------- badges CTA (10 s, en haut à droite)
def make_cta():
    DISPO = cfg.get('cta_disponible_sur', True)        # pilule « Podcast disponible sur » (désactivable)
    A0 = 4.7 if DISPO else 0.0
    n = int(round((A0 + 5.3) * FPS)); f = font(F_UI, 36)
    p1 = pill('Podcast disponible sur', f, PRI, icons=('apple', 'spotify'))
    p_sub = pill("S'abonner", f, (230, 33, 23, 255), icons=('bell',), icon_s=44)
    p_ok = pill('Abonné', f, (110, 110, 118, 255), icons=('bell',), icon_s=44)
    p_com = pill('Laisse un commentaire', f, ACC, txtc=INK, icons=())
    cur = cursor_img(); M = 40; Y = 40
    S = lambda s: int(round(s * FPS)); SL = 8                       # glissé de 250 ms
    def slide_x(i, a, b, w):           # entrée [a, a+SL], sortie [b-SL, b]
        xin = W - M - w
        if i < a or i >= b: return None
        if i < a + SL: return int(W + (xin - W) * ease_out((i - a) / SL))
        if i >= b - SL: return int(xin + (W - xin) * ((i - (b - SL)) / SL) ** 2)
        return xin
    def draw(im, i):
        x = slide_x(i, 0, S(4.5), p1.width) if DISPO else None
        if x is not None: im.alpha_composite(p1, (x, Y))
        a = S(A0); click = a + S(1.2); ok_end = click + S(1.8); end = n
        if a <= i < end:
            if i < click: pimg = p_sub
            elif i < ok_end: pimg = p_ok
            else: pimg = p_com
            x = slide_x(i, a, end, pimg.width)
            if x is None: return
            sc = 0.95 if click <= i < click + 4 else 1.0
            pi = pimg if sc == 1 else pimg.resize((int(pimg.width * sc), int(pimg.height * sc)), Image.LANCZOS)
            if click <= i < ok_end:    # cloche qui oscille
                ang = 22 * math.sin((i - click) * 0.9) * math.exp(-(i - click) / 30)
                pi = pi.copy(); bell = icon('bell', 44).rotate(ang, resample=Image.BICUBIC)
                ImageDraw.Draw(pi).rectangle([pi.width - 34 - 44 - 6, 14, pi.width - 30, 14 + 50], fill=(110, 110, 118, 255))
                pi.alpha_composite(bell, (pi.width - 34 - 44 - 4, 18))
            im.alpha_composite(pi, (x + (pimg.width - pi.width) // 2, Y + (pimg.height - pi.height) // 2))
            if a + SL <= i < click + 10:      # curseur qui arrive et clique
                k = min(1, (i - a - SL) / (click - a - SL))
                cx = int(W - 60 + (x + pimg.width * 0.45 - (W - 60)) * ease_out(k)); cy = int(Y + 220 - 150 * ease_out(k))
                c = cur if not (click <= i < click + 4) else cur.resize((46, 46))
                im.alpha_composite(c, (cx, cy))
    seq('cta', n, draw)
    return {'clic': (S(A0) + S(1.2)) / FPS, 'pop_entree_1': 0.0 if DISPO else None, 'pop_entree_2': S(A0) / FPS,
            'pop_commentaire': (S(A0) + S(3.0)) / FPS}

# ---------------------------------------------------------------- lower third invité (5 s)
def make_lower_third():
    n = int(round(5.0 * FPS))
    nom = cfg['invite'] if cfg['invite'] != 'À DÉFINIR' else 'Tiziana'
    fonc = cfg['invite_fonction'] if cfg['invite_fonction'] != 'À DÉFINIR' else 'Fondatrice · FYNOVATES, cabinet fiscal & expatriation'
    fN = font(F_UI, 58); fF = font(F_TXT, 32)
    TX = 180 if SIGLE else 44
    w = int(max(fN.getlength(nom.upper()), fF.getlength(fonc))) + TX + 50; h = 170
    card = Image.new('RGBA', (w + 14, h + 14), (0, 0, 0, 0)); d = ImageDraw.Draw(card)
    d.rounded_rectangle([10, 10, w + 10, h + 10], 26, fill=INK)
    d.rounded_rectangle([0, 0, w, h], 26, fill=(255, 255, 255, 245), outline=INK, width=4)
    d.rounded_rectangle([0, h - 16, w, h], 8, fill=PRI)
    # badge rond rétro rayé avec le sigle
    b = Image.new('RGBA', (130, 130), (0, 0, 0, 0)); bd = ImageDraw.Draw(b)
    bd.ellipse([2, 2, 127, 127], fill=PRI, outline=INK, width=5)
    m = Image.new('L', (130, 130), 0); ImageDraw.Draw(m).ellipse([8, 8, 121, 121], fill=255)
    st = Image.new('RGBA', (130, 130), (0, 0, 0, 0)); stripes(st, (0, 0, 130, 130), ACC[:3] + (150,), gap=22, width=8)
    st.putalpha(Image.composite(st.split()[3], Image.new('L', (130, 130), 0), m)); b.alpha_composite(st)
    bd = ImageDraw.Draw(b); bd.ellipse([2, 2, 127, 127], outline=INK, width=5)
    if SIGLE:
        fs = font(F_RETRO, 70); bd.text((65 - fs.getlength(SIGLE) / 2, 18), SIGLE, font=fs, fill=TXT, stroke_width=4, stroke_fill=INK)
        card.alpha_composite(b, (22, 18))
    d.text((TX, 20), nom.upper(), font=fN, fill=INK); d.text((TX + 2, 96), fonc, font=fF, fill=(60, 64, 90, 255))
    X, Y = 90, H - 120 - h; IN, OUTF = 9, 8
    def draw(im, i):
        if i < IN: k = ease_out(i / IN); dx, a = -60 * (1 - k), k
        elif i >= n - OUTF: k = (i - (n - OUTF)) / OUTF; dx, a = -40 * k, 1 - k
        else: dx, a = 0, 1
        c = card.copy(); c.putalpha(c.split()[3].point(lambda v: int(v * a)))
        im.alpha_composite(c, (int(X + dx), Y))
    seq('lower_third', n, draw)

# ---------------------------------------------------------------- réseaux de l'invité (4 s)
def make_socials():
    n = int(round(4.0 * FPS)); f = font(F_UI, 38)
    nets = [(k, cfg.get(f'invite_{k}')) for k in ('instagram', 'youtube', 'linkedin') if cfg.get(f'invite_{k}')]
    parts = [pill(v, f, (255, 255, 255, 250), txtc=INK, icons=()) for _, v in nets]
    ics = [icon(k, 70) for k, _ in nets]
    tot = sum(p.width + 86 for p in parts) + 40
    def draw(im, i):
        a = min(1, i / 9, (n - i) / 8); y = H - 120 - 80 + int(30 * (1 - ease_out(min(1, i / 9))))
        x = (W - tot) // 2
        for ic, p in zip(ics, parts):
            for obj, ox, oy in ((ic, x, y + 4), (p, x + 86, y)):
                o = obj.copy(); o.putalpha(o.split()[3].point(lambda v: int(v * a))); im.alpha_composite(o, (ox, oy))
            x += p.width + 86 + 40
    seq('reseaux', n, draw)

# ---------------------------------------------------------------- end slate (7 s) — zone droite libre (écran de fin YouTube)
def make_endslate():
    n = int(round(7.0 * FPS))
    if os.path.exists(f'{OUT}/logo.png'):
        logo = Image.open(f'{OUT}/logo.png').convert('RGBA'); lw = 760
        logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
    else:
        lw = 300; logo = mic(lw, TXT)
    tag = cfg.get('end_slate_texte', "Merci d'avoir regardé !"); ft = font(F_TXT, 64)
    pf = font(F_UI, 27); p = pill('PODCAST DISPONIBLE SUR :  Apple Podcasts · Spotify', pf, PRI, icons=('apple', 'spotify'), icon_s=44, pad=(26, 14))
    CX = 560                                   # centre de la zone gauche ; à droite (x > 1100) : 2 vignettes YouTube
    def draw(im, i):
        d = ImageDraw.Draw(im); d.rectangle([0, 0, W, H], fill=(0, 0, 0, 255))
        im.alpha_composite(logo, (CX - lw // 2, 300 if lw > 400 else 250))
        k = max(0, min(len(tag), int((i - 12) / 2.2))); txt = tag[:k]
        x0 = CX - ft.getlength(tag) / 2; y0 = (300 if lw > 400 else 250) + logo.height + 60
        d.text((x0, y0), txt, font=ft, fill=TXT)
        if (i // 15) % 2 == 0:                  # curseur qui clignote
            cx = x0 + ft.getlength(txt) + 8; d.rectangle([cx, y0 + 6, cx + 26, y0 + 62], fill=ACC)
        im.alpha_composite(p, (CX - p.width // 2, H - 150))
        fade = min(1, i / 15)                     # fondu depuis le noir 0,5 s
        if fade < 1: im.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, int(255 * (1 - fade)))))
    seq('endslate', n, draw, alpha=False)

if __name__ == '__main__':
    make_logo(); make_jingle(); t = make_cta(); make_lower_third(); make_socials(); make_endslate()
    json.dump({'cta': t}, open(f'{OUT}/timings.json', 'w'), indent=1)
    print('OK', t)
