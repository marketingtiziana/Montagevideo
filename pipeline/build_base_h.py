# -*- coding: utf-8 -*-
# Base "faux multicam" pour le reel HOLDING. Audio continu (voix propre) ;
# le dynamisme vient de CHANGEMENTS DE CADRAGE par beat (large / punch-in 115 /
# punch-in 130) = cuts secs, + micro-zoom 100->104 sur chaque beat (jamais
# statique), + shake leger (~3px) sur les beats des mots d'impact.
import subprocess, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

SRC = 'input/source.mp4'
AUD = 'voice_h.wav'
FPS = 30
W, H = 1080, 1920
END = 20.77

# (start, end, base_zoom, shake)  base_zoom: 1.0 large / 1.15 / 1.30
BEATS = [
    (0.00, 1.56, 1.15, True),   # LA HOLDING SEPARE   (impact: HOLDING)
    (1.56, 3.39, 1.00, False),  # TON PATRIMOINE
    (3.39, 4.74, 1.30, False),  # DE TON EXPLOITATION
    (4.74, 6.08, 1.00, False),  # L'ARGENT DE TES SOCIETES
    (6.08, 7.40, 1.15, False),  # PEUT REMONTER
    (7.40, 8.77, 1.30, True),   # DANS LA HOLDING     (impact: HOLDING)
    (8.77, 9.74, 1.15, False),  # Y ETRE STOCKE
    (9.74, 11.31, 1.00, False), # Y ETRE REINVESTI
    (11.31, 12.70, 1.30, False),# SANS PASSER PAR
    (12.70, 13.86, 1.15, False),# TA POCHE PERSO
    (13.86, 15.79, 1.00, False),# ET CE PASSAGE
    (15.79, 16.99, 1.30, False),# PAR TA POCHE PERSO
    (16.99, 18.61, 1.15, False),# FISCALEMENT
    (18.61, END,   1.30, True), # CA TE COUTE UNE FORTUNE (impact: FORTUNE)
]

OS = 2  # oversample factor pour un zoom/shake fluide
parts, vlabels = [], []
for i, (s, e, z0, shake) in enumerate(BEATS):
    D = e - s
    N = max(1, int(round(FPS * D)))
    z1 = z0 + 0.04  # micro-zoom
    z = f"({z0}+({z1 - z0})*on/{N})"
    if shake:
        ax = f"+{9}*sin(on*1.7)"    # ~4-5px de shake en sortie
        ay = f"+{7}*sin(on*2.3)"
    else:
        ax = ay = ""
    x = f"iw/2-(iw/zoom/2){ax}"
    y = f"ih/2-(ih/zoom/2){ay}"
    parts.append(
        f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS,fps={FPS},"
        f"scale={W*OS}:{H*OS}:flags=lanczos,"
        f"zoompan=z='{z}':d=1:x='{x}':y='{y}':s={W}x{H}:fps={FPS},"
        f"format=yuv420p[v{i}]"
    )
    vlabels.append(f"[v{i}]")

n = len(BEATS)
concat = "".join(vlabels) + f"concat=n={n}:v=1:a=0[vout]"
fc = ";".join(parts) + ";" + concat

cmd = [FF, '-y', '-i', SRC, '-i', AUD, '-filter_complex', fc,
       '-map', '[vout]', '-map', '1:a', '-t', f'{END}',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
       '-c:a', 'aac', '-b:a', '192k', '-shortest', 'base_h.mp4']
print('beats:', n, '| dur:', END)
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode:
    print(r.stderr[-2000:])
else:
    import re
    out = subprocess.run([FF, '-i', 'base_h.mp4'], capture_output=True, text=True).stderr
    m = re.search(r'Duration: [\d:.]+', out); print(m.group(0) if m else '')
