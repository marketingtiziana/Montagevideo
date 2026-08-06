# -*- coding: utf-8 -*-
# Rendu ÉDITORIAL LUXE + RYTHME. Couches :
#   base gradée + ken-burns + PUNCH-INS de zoom (rythme)
#   + collages N&B plein cadre ANIMÉS (slide-in + flottement + fondu)
#   + sous-titres serif kinétiques (subs.ass : surlignage / cercle / papier)
#   + petits STICKERS papier partiels (glissent depuis un bord, photo N&B)
#   + fiche registre + CTA (cartes)
#   + TRANSITIONS balayage-papier aux changements de section
import subprocess, re, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = 'source_cut.mp4'      # source avec la reprise de fin coupée
W, H, FPS = 1080, 1920, 30

GRADE = (
    "eq=contrast=1.05:saturation=0.80:gamma=1.03:brightness=0.008,"
    "curves=all='0/0.03 0.25/0.24 0.5/0.5 0.75/0.78 1/0.98',"
    "colorbalance=rs=-0.02:gs=0.00:bs=0.03:rm=0.02:gm=0.01:bm=-0.02:rh=0.02:bh=-0.02,"
    "vignette=PI/5.2"
)

# Punch-ins de zoom (rythme) — sur des temps talking-head
PUNCH = [2.55, 6.20, 12.90, 20.30, 24.60, 29.40, 33.00, 42.20]

# Collages plein cadre animés : (png, start, end, fin, fout)
COLLAGES = [
    ('assets/col_facture.png',   1.25,  3.55, 0.32, 0.30),   # hook : la mauvaise TVA facturée
    ('assets/col_etat.png',      5.70,  8.60, 0.35, 0.32),   # l'État réclame
    ('assets/col_poche.png',     9.90, 11.50, 0.30, 0.30),   # ça sort de ta poche
    ('assets/col_guichet.png',  19.50, 23.85, 0.35, 0.38),   # guichet unique
    ('assets/col_place.png',    26.20, 28.05, 0.32, 0.30),   # le mettre en place correctement
    ('assets/col_structure.png',31.80, 35.60, 0.35, 0.38),   # TVA internationale / structure
]
# Petits stickers papier partiels : (png, start, end, side, y)
#   side: 'r' entre par la droite, 'l' par la gauche
# y choisi dans les COINS pour ne pas masquer le visage (centré). Largeur ~300px.
STK_W = 300
STICKERS = [
    ('assets/stk_facture.png', 4.30,  5.55, 'r', 120),   # haut-droit
    ('assets/stk_3pays.png',  12.55, 14.05, 'r', 120),
    ('assets/stk_1decl.png',  23.95, 25.50, 'l', 140),
    ('assets/stk_ok.png',     30.35, 31.60, 'l', 130),   # bien fait / correctement
    ('assets/stk_struct.png', 28.45, 30.05, 'r', 110),
    ('assets/stk_euro.png',   37.20, 38.90, 'l', 1580),
]
# Cartes plein cadre (au-dessus des sous-titres)
CARDS = [
    ('assets/led_a0.png', 14.35, 14.95, 0.25, 0.00),
    ('assets/led_a1.png', 14.95, 15.55, 0.00, 0.00),
    ('assets/led_a2.png', 15.55, 16.15, 0.00, 0.00),
    ('assets/led_a3.png', 16.15, 17.25, 0.00, 0.30),
    ('assets/card_cta.png', 41.55, 44.00, 0.32, 0.25),
]
# Transitions balayage-papier : (start, durée)
TRANS = [(1.10, 0.30), (5.55, 0.32), (9.80, 0.30), (17.15, 0.32), (19.35, 0.32),
         (26.05, 0.30), (31.65, 0.30), (38.98, 0.30), (41.40, 0.30)]


def run(cmd, tail=3500):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print('  ERR rc=', r.returncode); print(r.stderr[-tail:])
    return r


def probe_duration(path):
    out = subprocess.run([FF, '-i', path], capture_output=True, text=True).stderr
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', out)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]) if m else None


def clip01(expr):
    return f"min(1\\,max(0\\,{expr}))"


def build(dur):
    N = max(1, int(round(FPS * dur)))
    zbase = f"1.00+0.05*on/{N}"
    punch = "".join(f"+0.045*exp(-pow((on-{int(t*FPS)})/2.6\\,2))" for t in PUNCH)
    z = f"({zbase}{punch})"

    inputs = ['-i', SRC]
    idx = 1
    col_idx, stk_idx, card_idx, trans_idx = [], [], [], []
    for (p, s, e, fi, fo) in COLLAGES:
        inputs += ['-loop', '1', '-t', f'{round(e-s,3)}', '-itsoffset', f'{s}', '-i', p]
        col_idx.append((idx, s, e, fi, fo)); idx += 1
    for (p, s, e, side, y) in STICKERS:
        inputs += ['-loop', '1', '-t', f'{round(e-s,3)}', '-itsoffset', f'{s}', '-i', p]
        stk_idx.append((idx, s, e, side, y)); idx += 1
    for (p, s, e, fi, fo) in CARDS:
        inputs += ['-loop', '1', '-t', f'{round(e-s,3)}', '-itsoffset', f'{s}', '-i', p]
        card_idx.append((idx, s, e, fi, fo)); idx += 1
    for (s, d) in TRANS:
        inputs += ['-loop', '1', '-t', f'{d}', '-itsoffset', f'{s}', '-i', 'assets/trans_paper.png']
        trans_idx.append((idx, s, d)); idx += 1

    fc = []
    fc.append(
        f"[0:v]fps={FPS},scale={W*2}:{H*2}:flags=bicubic,"
        f"zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
        f"{GRADE},format=yuv420p[cur0]"
    )
    cur, n = 'cur0', 1

    # 1) collages plein cadre : sur-échelle 1.12x -> slide-in + flottement + fondu
    EX, EY, X0, Y0 = int(W*1.12), int(H*1.12), -int(W*0.06), -int(H*0.06)
    for (i, s, e, fi, fo) in col_idx:
        pin = clip01(f"(t-{s})/{fi}")
        pout = clip01(f"(t-({e}-{fo}))/{fo}")
        chain = (f"[{i}:v]scale={EX}:{EY},setsar=1,format=rgba"
                 f",fade=t=in:st={s}:d={fi}:alpha=1,fade=t=out:st={round(e-fo,3)}:d={fo}:alpha=1[o{i}]")
        fc.append(chain)
        xexpr = f"{X0}+14*sin(2*PI*(t-{s})/6)"
        yexpr = f"{Y0}+46*(1-{pin})-38*{pout}+9*sin(2*PI*(t-{s})/5)"
        fc.append(f"[{cur}][o{i}]overlay=x='{xexpr}':y='{yexpr}':enable='between(t,{s},{e})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    # 2) sous-titres kinétiques
    fc.append(f"[{cur}]subtitles=subs.ass:fontsdir=fonts[cur{n}]"); cur = f'cur{n}'; n += 1

    # 3) stickers papier partiels : slide depuis un bord + fondu
    din, dout = 0.32, 0.30
    for (i, s, e, side, y) in stk_idx:
        pin = clip01(f"(t-{s})/{din}")
        pout = clip01(f"(t-({e}-{dout}))/{dout}")
        chain = (f"[{i}:v]scale={STK_W}:-1,format=rgba,fade=t=in:st={s}:d={din}:alpha=1,"
                 f"fade=t=out:st={round(e-dout,3)}:d={dout}:alpha=1[o{i}]")
        fc.append(chain)
        if side == 'r':
            target = "W-w-46"
            xexpr = f"({target})+(w+90)*(1-{pin})+(w+90)*{pout}"
        else:
            target = "46"
            xexpr = f"({target})-(w+90)*(1-{pin})-(w+90)*{pout}"
        yexpr = f"{y}+7*sin(2*PI*(t-{s})/4)"
        fc.append(f"[{cur}][o{i}]overlay=x='{xexpr}':y='{yexpr}':enable='between(t,{s},{e})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    # 4) cartes (fiche registre + CTA) au-dessus
    for (i, s, e, fi, fo) in card_idx:
        chain = f"[{i}:v]format=rgba"
        if fi > 0:
            chain += f",fade=t=in:st={s}:d={fi}:alpha=1"
        if fo > 0:
            chain += f",fade=t=out:st={round(e-fo,3)}:d={fo}:alpha=1"
        chain += f"[o{i}]"
        fc.append(chain)
        fc.append(f"[{cur}][o{i}]overlay=0:0:enable='between(t,{s},{e})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    # 5) transitions : bande papier qui balaie l'écran
    for (i, s, d) in trans_idx:
        p = clip01(f"(t-{s})/{d}")
        chain = f"[{i}:v]format=rgba,fade=t=in:st={s}:d=0.06:alpha=1,fade=t=out:st={round(s+d-0.06,3)}:d=0.06:alpha=1[o{i}]"
        fc.append(chain)
        xexpr = f"-700+(1080+700)*{p}"
        fc.append(f"[{cur}][o{i}]overlay=x='{xexpr}':y=0:enable='between(t,{s},{round(s+d,3)})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
           '-map', f'[{cur}]', '-map', '0:a',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '160k', 'REEL_lux.mp4']
    print(f'>> REEL_lux.mp4 : {len(COLLAGES)} collages + {len(STICKERS)} stickers + '
          f'{len(CARDS)} cartes + {len(TRANS)} transitions + {len(PUNCH)} punch-ins')
    run(cmd)


if __name__ == '__main__':
    dur = probe_duration(SRC)
    print('duration:', dur)
    build(dur)
    print('DONE -> REEL_lux.mp4')
