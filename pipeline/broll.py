# -*- coding: utf-8 -*-
# B-rolls en MOTION-DESIGN, generes localement (aucun media externe requis).
# 4 scenes premium (fond navy profond + or), animees, illustrant les propos :
#   A) hook    : courbe qui monte puis s'effondre  -> "si demain ton business s'arrete"
#   B) regle3  : 3 colonnes qui montent (VIVRE / FONCTIONNEMENT / INVESTIR)
#   C) epargne : barres qui montent + fleche  -> "investir / mettre de cote"
#   D) runway  : jauge qui se vide + horloge  -> "combien de temps vous tenez ?"
# Le graphique principal reste dans le tiers haut/centre : le tiers bas est
# reserve aux sous-titres. Sortie: broll/brA.mp4 ... brD.mp4 (1080x1920, 30fps).
import os, math, subprocess, imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont, ImageFilter

FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1080, 1920, 30
os.makedirs('broll/_frames', exist_ok=True)

ARCHIVO = 'fonts/Archivo-Black.ttf'
BEBAS = 'fonts/BebasNeue-Regular.ttf'
GOLD = (231, 196, 106)
GOLD_D = (176, 140, 60)
WHITE = (255, 255, 255)
INK = (232, 238, 250)

def font(path, s): return ImageFont.truetype(path, s)
def ease(t): return 1 - (1 - t) ** 3           # ease-out cubic
def easein(t): return t * t
def clamp(x, a=0.0, b=1.0): return max(a, min(b, x))

def bg():
    """Fond premium: degrade navy vertical + halo or doux + vignette."""
    g = Image.new('RGB', (1, H))
    top, bot = (12, 17, 34), (7, 11, 24)
    for y in range(H):
        t = y / (H - 1)
        g.putpixel((0, y), tuple(int(top[i] + (bot[i] - top[i]) * t) for i in range(3)))
    im = g.resize((W, H)).convert('RGBA')
    # halo or diffus au centre-haut
    halo = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(halo).ellipse([W//2-460, 380, W//2+460, 1180], fill=GOLD + (34,))
    im.alpha_composite(halo.filter(ImageFilter.GaussianBlur(180)))
    # vignette
    vg = Image.new('L', (W, H), 0)
    ImageDraw.Draw(vg).ellipse([-260, -260, W+260, H+260], fill=255)
    vg = vg.filter(ImageFilter.GaussianBlur(240))
    dark = Image.new('RGBA', (W, H), (0, 0, 0, 150))
    dark.putalpha(Image.eval(vg, lambda p: 150 - int(p * 150 / 255)))
    im.alpha_composite(dark)
    return im

def ctext(d, cx, y, txt, f, fill, anchor='mm', shadow=True, sw=4):
    if shadow:
        d.text((cx+sw, y+sw), txt, font=f, fill=(0, 0, 0, 150), anchor=anchor)
    d.text((cx, y), txt, font=f, fill=fill, anchor=anchor)

def soft(canvas, draw_fn, blur, alpha):
    """Dessine une couche floue (glow) sous l'element."""
    lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    draw_fn(ImageDraw.Draw(lay))
    canvas.alpha_composite(lay.filter(ImageFilter.GaussianBlur(blur)))

def rrect(d, box, r, **kw): d.rounded_rectangle(box, radius=r, **kw)

def encode(scene, nframes):
    src = f'broll/_frames/{scene}_%04d.png'
    out = f'broll/br{scene}.mp4'
    cmd = [FF, '-y', '-framerate', str(FPS), '-i', src,
           '-vf', 'format=yuv420p', '-c:v', 'libx264', '-preset', 'medium',
           '-crf', '18', '-pix_fmt', 'yuv420p', out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(f'{out}: rc={r.returncode} ({nframes}f)')
    if r.returncode: print(r.stderr[-800:])

# ------------------------------------------------------------------ Scene A
def scene_A(dur=2.3):
    N = int(dur * FPS)
    # polyligne: monte en dents puis s'effondre
    pts = [(140, 1120), (300, 980), (430, 1030), (560, 820),
           (690, 880), (820, 660), (900, 720)]
    crash = [(900, 720), (940, 1180)]
    ftitle = font(ARCHIVO, 46)
    for i in range(N):
        t = i / (N - 1)
        p = ease(clamp(t / 0.72))          # trace la montee sur 72% du temps
        cr = clamp((t - 0.72) / 0.28)      # crash sur les 28% restants
        im = bg(); d = ImageDraw.Draw(im)
        ctext(d, W//2, 470, "VOTRE BUSINESS", font(ARCHIVO, 40), INK)
        # grille legere
        for gy in range(700, 1240, 90):
            d.line([120, gy, 960, gy], fill=(255, 255, 255, 18), width=2)
        d.line([140, 1200, 960, 1200], fill=(255, 255, 255, 55), width=3)
        # trace progressif de la courbe montante
        def polyline_upto(frac):
            total = 0
            segs = []
            for a, b in zip(pts[:-1], pts[1:]):
                l = math.dist(a, b); segs.append((a, b, l)); total += l
            target = total * frac; acc = 0; path = [pts[0]]
            for a, b, l in segs:
                if acc + l <= target:
                    path.append(b); acc += l
                else:
                    r = (target - acc) / l
                    path.append((a[0] + (b[0]-a[0])*r, a[1] + (b[1]-a[1])*r)); break
            return path
        path = polyline_upto(p)
        if len(path) > 1:
            soft(im, lambda dd: dd.line(path, fill=GOLD + (255,), width=10, joint='curve'), 10, 120)
            d.line(path, fill=GOLD + (255,), width=8, joint='curve')
            hx, hy = path[-1]
            d.ellipse([hx-11, hy-11, hx+11, hy+11], fill=WHITE)
        # crash
        if cr > 0:
            a, b = crash
            cy = a[1] + (b[1]-a[1]) * easein(cr)
            cx = a[0] + (b[0]-a[0]) * cr
            d.line([a, (cx, cy)], fill=(228, 90, 90, 255), width=8)
            if cr > 0.85:
                d.line([150, 1178, 940, 1178], fill=(228, 90, 90, 220), width=6)
        im.convert('RGB').save(f'broll/_frames/A_{i:04d}.png')
    encode('A', N)

# ------------------------------------------------------------------ Scene B
def scene_B(dur=2.7):
    N = int(dur * FPS)
    labels = ["VIVRE", "FONCTIONNEMENT", "INVESTIR"]
    cols = [GOLD, (240, 226, 190), GOLD_D]
    baseY, topY = 1240, 640
    bw, gap = 210, 60
    total = bw*3 + gap*2
    x0 = (W - total)//2
    fnum = font(BEBAS, 96); flab = font(ARCHIVO, 30); ftit = font(ARCHIVO, 52)
    for i in range(N):
        t = i / (N - 1)
        im = bg(); d = ImageDraw.Draw(im)
        ctext(d, W//2, 470, "LA RÈGLE DE 3", ftit, WHITE)
        d.line([x0-20, baseY+4, x0+total+20, baseY+4], fill=(255,255,255,60), width=3)
        for k in range(3):
            g = clamp((t - k*0.14) / 0.5)      # montee decalee par colonne
            g = ease(g)
            x = x0 + k*(bw+gap)
            h = (baseY - topY) * g
            y = baseY - h
            col = cols[k]
            if h > 6:
                soft(im, lambda dd, X=x, Y=y, Col=col: rrect(dd, [X, Y, X+bw, baseY], 22, fill=Col+(255,)), 14, 90)
                rrect(d, [x, y, x+bw, baseY], 22, fill=col+(255,))
                rrect(d, [x, y, x+bw, baseY], 22, outline=(255,255,255,70), width=2)
                # numero dans la colonne
                if g > 0.35:
                    ctext(d, x+bw//2, y+70, str(k+1), fnum, (12,17,34), sw=0, shadow=False)
                # label au-dessus
                if g > 0.6:
                    ctext(d, x+bw//2, y-38, labels[k], flab, INK)
        im.convert('RGB').save(f'broll/_frames/B_{i:04d}.png')
    encode('B', N)

# ------------------------------------------------------------------ Scene C
def scene_C(dur=2.1):
    N = int(dur * FPS)
    bars = [560, 820, 1040, 1240]      # hauteurs cibles (px depuis baseline)
    baseY = 1250
    bw, gap = 150, 46
    total = bw*4 + gap*3
    x0 = (W-total)//2
    ftit = font(ARCHIVO, 50)
    for i in range(N):
        t = i / (N - 1)
        im = bg(); d = ImageDraw.Draw(im)
        ctext(d, W//2, 470, "METTRE DE CÔTÉ", ftit, WHITE)
        d.line([x0-20, baseY+4, x0+total+20, baseY+4], fill=(255,255,255,60), width=3)
        maxh = 600
        for k in range(4):
            g = ease(clamp((t - k*0.11)/0.5))
            h = maxh * (bars[k]/1240) * g
            x = x0 + k*(bw+gap); y = baseY - h
            col = GOLD if k < 3 else (240, 226, 190)
            if h > 5:
                soft(im, lambda dd, X=x, Y=y, Col=col: rrect(dd, [X, Y, X+bw, baseY], 16, fill=Col+(255,)), 12, 80)
                rrect(d, [x, y, x+bw, baseY], 16, fill=col+(255,))
        # fleche montante
        ag = ease(clamp((t-0.35)/0.5))
        if ag > 0.02:
            ax = x0 + total + 20
            ay0, ay1 = baseY, baseY - 560*ag
            d.line([x0-10, baseY, ax, ay1], fill=(255,255,255,200), width=8)
            if ag > 0.6:
                d.polygon([(ax, ay1-2),(ax-34, ay1+16),(ax-6, ay1+40)], fill=WHITE)
        im.convert('RGB').save(f'broll/_frames/C_{i:04d}.png')
    encode('C', N)

# ------------------------------------------------------------------ Scene D
def scene_D(dur=2.2):
    N = int(dur * FPS)
    barX0, barX1, barY = 150, 930, 980
    ftit = font(ARCHIVO, 50); fclock = font(BEBAS, 130)
    for i in range(N):
        t = i / (N - 1)
        im = bg(); d = ImageDraw.Draw(im)
        ctext(d, W//2, 470, "COMBIEN DE TEMPS ?", ftit, WHITE)
        # jauge de "runway" qui se vide
        rrect(d, [barX0, barY-34, barX1, barY+34], 34, outline=(255,255,255,90), width=3)
        rem = 1 - ease(clamp((t-0.1)/0.75))     # se vide
        fillx = barX0 + (barX1-barX0) * rem
        col = GOLD if rem > 0.35 else (228, 120, 90)
        if fillx > barX0+6:
            rrect(d, [barX0+5, barY-29, fillx, barY+29], 29, fill=col+(255,))
        # horloge stylisee
        cxx, cyy, rr = W//2, 1200, 92
        d.ellipse([cxx-rr, cyy-rr, cxx+rr, cyy+rr], outline=(255,255,255,210), width=8)
        ang = -math.pi/2 + 2*math.pi*ease(clamp(t))     # aiguille qui tourne
        d.line([cxx, cyy, cxx+math.cos(ang)*(rr-26), cyy+math.sin(ang)*(rr-26)], fill=GOLD+(255,), width=8)
        d.line([cxx, cyy, cxx, cyy-rr+44], fill=(255,255,255,220), width=6)
        d.ellipse([cxx-8, cyy-8, cxx+8, cyy+8], fill=WHITE)
        im.convert('RGB').save(f'broll/_frames/D_{i:04d}.png')
    encode('D', N)

if __name__ == '__main__':
    scene_A(); scene_B(); scene_C(); scene_D()
    # nettoyage des frames
    import shutil; shutil.rmtree('broll/_frames', ignore_errors=True)
    for s in 'ABCD':
        p = f'broll/br{s}.mp4'
        print(p, os.path.getsize(p) if os.path.exists(p) else 'MISSING')
