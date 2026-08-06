# -*- coding: utf-8 -*-
# Rendu style ÉDITORIAL LUXE ("old money"), calqué sur la référence :
#   base talking-head gradée + léger ken-burns
#   + sous-titres serif (subs.ass)
#   + incrustations éditoriales PLEIN CADRE aux temps forts (fiches-listes qui
#     s'écrivent, cartes typographiques) qui remplacent l'image et masquent les
#     sous-titres pendant leur affichage
#   coupes nettes, audio voix conservé. -> REEL_lux.mp4
import subprocess, re, os, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = 'source.mp4'
W, H, FPS = 1080, 1920, 30

GRADE = (
    "eq=contrast=1.05:saturation=0.80:gamma=1.03:brightness=0.008,"
    "curves=all='0/0.03 0.25/0.24 0.5/0.5 0.75/0.78 1/0.98',"
    "colorbalance=rs=-0.02:gs=0.00:bs=0.03:rm=0.02:gm=0.01:bm=-0.02:rh=0.02:bh=-0.02,"
    "vignette=PI/5.2"
)

# Incrustations plein cadre : (png, start, end, fade_in, fade_out)
# Callées sur le timing réel de la parole (words.json).
#
# COLLAGES : collages photo N&B (IA) placés SOUS les sous-titres -> le sous-titre
# reste visible par-dessus, comme dans la référence ("as a trophy wife" sur le manoir).
COLLAGES = [
    ('assets/col_etat.png',      5.70,  8.60, 0.30, 0.30),   # l'État réclame (main + tampon)
    ('assets/col_poche.png',     9.90, 11.50, 0.28, 0.28),   # ça sort de ta poche
    ('assets/col_guichet.png',  19.50, 23.85, 0.30, 0.35),   # guichet unique (porte unique)
    ('assets/col_structure.png',31.80, 35.60, 0.30, 0.35),   # TVA internationale / structure
]
# CARDS : fiche "registre" + carte CTA placées AU-DESSUS des sous-titres -> elles
# portent leur propre texte et masquent le sous-titre pendant l'affichage.
CARDS = [
    ('assets/led_a0.png', 14.35, 14.95, 0.25, 0.00),
    ('assets/led_a1.png', 14.95, 15.55, 0.00, 0.00),
    ('assets/led_a2.png', 15.55, 16.15, 0.00, 0.00),
    ('assets/led_a3.png', 16.15, 17.25, 0.00, 0.30),
    ('assets/card_cta.png', 41.90, 44.10, 0.32, 0.25),
]


def run(cmd, tail=3000):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print('  ERR rc=', r.returncode); print(r.stderr[-tail:])
    return r


def probe_duration(path):
    out = subprocess.run([FF, '-i', path], capture_output=True, text=True).stderr
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', out)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]) if m else None


def build(dur):
    N = max(1, int(round(FPS * dur)))
    z = f"(1.00+0.05*on/{N})"
    inputs = ['-i', SRC]
    idx = 1
    col_idx, card_idx = [], []
    for (p, s, e, fi, fo) in COLLAGES:
        d = round(e - s, 3)
        inputs += ['-loop', '1', '-t', f'{d}', '-itsoffset', f'{s}', '-i', p]
        col_idx.append((idx, s, e, fi, fo)); idx += 1
    for (p, s, e, fi, fo) in CARDS:
        d = round(e - s, 3)
        inputs += ['-loop', '1', '-t', f'{d}', '-itsoffset', f'{s}', '-i', p]
        card_idx.append((idx, s, e, fi, fo)); idx += 1

    fc = []
    fc.append(
        f"[0:v]fps={FPS},scale={W*2}:{H*2}:flags=bicubic,"
        f"zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
        f"{GRADE},format=yuv420p[cur0]"
    )
    cur, n = 'cur0', 1

    def overlay(i, s, e, fi, fo, cover=False):
        nonlocal cur, n
        chain = f"[{i}:v]"
        if cover:  # collage -> remplit le cadre (scale cover + crop centré)
            chain += (f"scale={W}:{H}:force_original_aspect_ratio=increase,"
                      f"crop={W}:{H},")
        chain += "format=rgba"
        if fi > 0:
            chain += f",fade=t=in:st={s}:d={fi}:alpha=1"
        if fo > 0:
            chain += f",fade=t=out:st={round(e-fo,3)}:d={fo}:alpha=1"
        chain += f"[o{i}]"
        fc.append(chain)
        fc.append(f"[{cur}][o{i}]overlay=0:0:enable='between(t,{s},{e})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    # 1) collages SOUS les sous-titres (caption visible par-dessus)
    for (i, s, e, fi, fo) in col_idx:
        overlay(i, s, e, fi, fo, cover=True)
    # 2) sous-titres serif
    fc.append(f"[{cur}]subtitles=subs.ass:fontsdir=fonts[cur{n}]"); cur = f'cur{n}'; n += 1
    # 3) fiche registre + CTA AU-DESSUS des sous-titres (masquent la caption)
    for (i, s, e, fi, fo) in card_idx:
        overlay(i, s, e, fi, fo, cover=False)

    cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
           '-map', f'[{cur}]', '-map', '0:a',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '160k', 'REEL_lux.mp4']
    print(f'>> REEL_lux.mp4 (grade + subs serif + {len(COLLAGES)} collages + {len(CARDS)} cartes)')
    run(cmd)


if __name__ == '__main__':
    dur = probe_duration(SRC)
    print('duration:', dur)
    build(dur)
    print('DONE -> REEL_lux.mp4')
