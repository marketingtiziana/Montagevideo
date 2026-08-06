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
CUT = [
    # fiche "registre" : s'enregistrer dans 3 pays -> écriture ligne par ligne
    ('assets/led_a0.png', 14.35, 14.95, 0.25, 0.00),
    ('assets/led_a1.png', 14.95, 15.55, 0.00, 0.00),
    ('assets/led_a2.png', 15.55, 16.15, 0.00, 0.00),
    ('assets/led_a3.png', 16.15, 17.25, 0.00, 0.30),
    # bascule "avec le guichet unique -> une seule déclaration"
    ('assets/card_oss.png',     19.50, 21.55, 0.28, 0.25),
    # temps fort typographique "le guichet unique"
    ('assets/card_guichet.png', 21.70, 23.85, 0.25, 0.30),
    # CTA de fin
    ('assets/card_cta.png',     41.90, 44.10, 0.32, 0.25),
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
    cut_idx = []
    for (p, s, e, fi, fo) in CUT:
        d = round(e - s, 3)
        inputs += ['-loop', '1', '-t', f'{d}', '-itsoffset', f'{s}', '-i', p]
        cut_idx.append((idx, s, e, fi, fo)); idx += 1

    fc = []
    fc.append(
        f"[0:v]fps={FPS},scale={W*2}:{H*2}:flags=bicubic,"
        f"zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
        f"{GRADE},format=yuv420p[base]"
    )
    # sous-titres SOUS les incrustations
    fc.append("[base]subtitles=subs.ass:fontsdir=fonts[cur0]")
    cur, n = 'cur0', 1
    for (i, s, e, fi, fo) in cut_idx:
        chain = f"[{i}:v]format=rgba"
        if fi > 0:
            chain += f",fade=t=in:st={s}:d={fi}:alpha=1"
        if fo > 0:
            chain += f",fade=t=out:st={round(e-fo,3)}:d={fo}:alpha=1"
        chain += f"[c{i}]"
        fc.append(chain)
        fc.append(f"[{cur}][c{i}]overlay=0:0:enable='between(t,{s},{e})':eof_action=pass[cur{n}]")
        cur = f'cur{n}'; n += 1

    cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
           '-map', f'[{cur}]', '-map', '0:a',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '160k', 'REEL_lux.mp4']
    print(f'>> REEL_lux.mp4 (grade + sous-titres serif + {len(CUT)} incrustations éditoriales)')
    run(cmd)


if __name__ == '__main__':
    dur = probe_duration(SRC)
    print('duration:', dur)
    build(dur)
    print('DONE -> REEL_lux.mp4')
