# -*- coding: utf-8 -*-
# Rendu ÉDITORIAL "New York Times" + b-roll vidéo cinématographique.
# Couches (bas -> haut) :
#   base talking-head gradée NYT (désaturé, grain, vignette) + ken-burns + punch-ins
#   + B-ROLL VIDÉO plein cadre (entrée zoom-settle baked + fondu) aux temps forts
#   + sous-titres serif kinétiques + kickers éditoriaux (subs.ass)
#   + petits stickers papier partiels (coins)
#   + carte CTA de fin
#   + transitions balayage-papier
import subprocess, re, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = 'source_cut.mp4'
W, H, FPS = 1080, 1920, 30

GRADE = (
    "eq=contrast=1.10:saturation=0.55:gamma=0.99:brightness=0.004,"
    "curves=all='0/0.045 0.22/0.19 0.5/0.5 0.78/0.81 1/0.965',"
    "colorbalance=rs=-0.015:gs=0.00:bs=0.02:rm=0.00:gm=0.00:bm=0.00:rh=0.015:gh=0.0:bh=-0.015,"
    "noise=alls=7:allf=t,"
    "vignette=PI/4.7"
)

PUNCH = [2.55, 6.20, 12.90, 20.30, 24.60, 29.40, 33.00, 42.20]

# B-roll vidéo plein cadre (déjà gradés + zoom-settle par make_broll.py) :
#   (path, start, end, fade_in, fade_out)
BROLL = [
    ('broll_ready/br_facture.mp4',   1.25,  3.55, 0.20, 0.28),  # hook : tampon sur facture
    ('broll_ready/br_etat.mp4',      5.70,  8.60, 0.24, 0.30),  # bâtiment de l'administration
    ('broll_ready/br_poche.mp4',     9.90, 11.50, 0.22, 0.26),  # billets/pièces qui tombent
    ('broll_ready/br_pays.mp4',     14.35, 17.25, 0.24, 0.30),  # carte + tampons sur 3 pays
    ('broll_ready/br_guichet.mp4',  19.50, 23.85, 0.26, 0.34),  # porte unique qui s'ouvre
    ('broll_ready/br_place.mp4',    26.20, 28.05, 0.22, 0.28),  # pose de la clé de voûte
    ('broll_ready/br_structure.mp4',31.80, 35.60, 0.26, 0.34),  # plan/maquette d'architecture
    ('broll_ready/br_inter.mp4',    38.10, 40.55, 0.24, 0.30),  # "si tu vends à l'international" (couvre le raccord)
]
# Petits stickers papier partiels : (png, start, end, side, y)
STK_W = 300
STICKERS = [
    ('assets/stk_facture.png', 4.30,  5.55, 'r', 120),
    ('assets/stk_3pays.png',  12.55, 14.05, 'r', 120),
    ('assets/stk_1decl.png',  23.95, 25.50, 'l', 140),
    ('assets/stk_ok.png',     30.35, 31.60, 'l', 130),
    ('assets/stk_struct.png', 28.45, 30.05, 'r', 110),
    ('assets/stk_euro.png',   37.05, 38.00, 'l', 1580),
]
# Carte CTA plein cadre (au-dessus des sous-titres)
CARDS = [
    # démarre avant le sous-titre "commente TVA" (41.24) pour éviter le doublon
    ('assets/card_cta.png', 41.18, 44.00, 0.30, 0.25),
]
# Transitions balayage-papier (surtout aux entrées de b-roll) : (start, durée)
TRANS = [(1.05, 0.30), (5.55, 0.30), (9.80, 0.28), (14.20, 0.28), (19.35, 0.30),
         (26.05, 0.28), (31.65, 0.30), (38.02, 0.28), (40.45, 0.28), (41.40, 0.30)]


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
    broll_idx, stk_idx, card_idx, trans_idx = [], [], [], []
    for (p, s, e, fi, fo) in BROLL:                       # vidéos (pas de -loop)
        inputs += ['-itsoffset', f'{s}', '-i', p]
        broll_idx.append((idx, s, e, fi, fo)); idx += 1
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

    # 1) B-ROLL vidéo plein cadre (sous les sous-titres), fondu d'entrée/sortie
    for (i, s, e, fi, fo) in broll_idx:
        fc.append(f"[{i}:v]fps={FPS},format=rgba,"
                  f"fade=t=in:st={s}:d={fi}:alpha=1,fade=t=out:st={round(e-fo,3)}:d={fo}:alpha=1[b{i}]")
        fc.append(f"[{cur}][b{i}]overlay=0:0:enable='between(t,{s},{e})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    # 2) sous-titres kinétiques + kickers éditoriaux
    fc.append(f"[{cur}]subtitles=subs.ass:fontsdir=fonts[cur{n}]"); cur = f'cur{n}'; n += 1

    # 3) stickers papier partiels : slide depuis un bord + fondu
    din, dout = 0.32, 0.30
    for (i, s, e, side, y) in stk_idx:
        pin = clip01(f"(t-{s})/{din}")
        pout = clip01(f"(t-({e}-{dout}))/{dout}")
        fc.append(f"[{i}:v]scale={STK_W}:-1,format=rgba,"
                  f"fade=t=in:st={s}:d={din}:alpha=1,fade=t=out:st={round(e-dout,3)}:d={dout}:alpha=1[o{i}]")
        if side == 'r':
            xexpr = f"(W-w-46)+(w+90)*(1-{pin})+(w+90)*{pout}"
        else:
            xexpr = f"(46)-(w+90)*(1-{pin})-(w+90)*{pout}"
        yexpr = f"{y}+7*sin(2*PI*(t-{s})/4)"
        fc.append(f"[{cur}][o{i}]overlay=x='{xexpr}':y='{yexpr}':enable='between(t,{s},{e})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    # 4) carte CTA
    for (i, s, e, fi, fo) in card_idx:
        chain = f"[{i}:v]format=rgba"
        if fi > 0:
            chain += f",fade=t=in:st={s}:d={fi}:alpha=1"
        if fo > 0:
            chain += f",fade=t=out:st={round(e-fo,3)}:d={fo}:alpha=1"
        fc.append(chain + f"[o{i}]")
        fc.append(f"[{cur}][o{i}]overlay=0:0:enable='between(t,{s},{e})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    # 5) transitions balayage-papier
    for (i, s, d) in trans_idx:
        p = clip01(f"(t-{s})/{d}")
        fc.append(f"[{i}:v]format=rgba,fade=t=in:st={s}:d=0.06:alpha=1,"
                  f"fade=t=out:st={round(s+d-0.06,3)}:d=0.06:alpha=1[o{i}]")
        fc.append(f"[{cur}][o{i}]overlay=x='-700+(1080+700)*{p}':y=0:enable='between(t,{s},{round(s+d,3)})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
           '-map', f'[{cur}]', '-map', '0:a',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '160k', 'REEL_lux.mp4']
    print(f'>> REEL_lux.mp4 : {len(BROLL)} b-roll vidéo + {len(STICKERS)} stickers + '
          f'{len(CARDS)} carte + {len(TRANS)} transitions + {len(PUNCH)} punch-ins')
    run(cmd)


if __name__ == '__main__':
    dur = probe_duration(SRC)
    print('duration:', dur)
    build(dur)
    print('DONE -> REEL_lux.mp4')
