# -*- coding: utf-8 -*-
# Base pour CE réel (business / règle de 3). Discours continu ~46s : on garde
# l'audio RØDE continu et on dynamise le VISUEL (upscale 1080x1920 + ken-burns
# par chapitre avec petits "punch" de zoom aux transitions).
import subprocess, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

SRC = 'source.mp4'
AUD = 'voice_rode.wav'
FPS = 30
W, H = 1080, 1920
END = 46.5  # coupe la petite queue apres "impacte ?"

# Chapitres (timeline source = finale, pas de coupe audio). (start, end, z0, z1)
# Les sauts de zoom entre chapitres donnent de l'energie facon "punch-in".
CHAPTERS = [
    (0.00,  4.68, 1.03, 1.06),  # Hook: "si demain ton business s'arretait..."
    (4.68,  9.96, 1.00, 1.05),  # Probleme: "les gens n'ont pas prevu"
    (9.96, 12.56, 1.07, 1.03),  # "la regle de 3"
    (12.56,15.76, 1.00, 1.045), # Part 1: pour vivre
    (15.76,21.00, 1.06, 1.01),  # Part 2: fond de roulement / frais
    (21.00,23.32, 1.02, 1.06),  # Part 3: investir / mettre de cote
    (23.32,32.60, 1.00, 1.05),  # Benefice: moins stresser
    (32.60,38.54, 1.07, 1.03),  # Question: combien de temps tu tiens ?
    (38.54,END,   1.00, 1.05),  # CTA: qu'as-tu mis en place / train de vie
]

parts, vlabels = [], []
for i, (s, e, z0, z1) in enumerate(CHAPTERS):
    D = e - s
    N = max(1, int(round(FPS * D)))
    z = f"({z0}+({z1 - z0})*on/{N})"
    parts.append(
        f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS,fps={FPS},"
        f"scale={W*2}:{H*2}:flags=lanczos,"
        f"zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
        f"format=yuv420p[v{i}]"
    )
    vlabels.append(f"[v{i}]")

n = len(CHAPTERS)
concat = "".join(vlabels) + f"concat=n={n}:v=1:a=0[vout]"
fc = ";".join(parts) + ";" + concat

cmd = [FF, '-y', '-i', SRC, '-i', AUD, '-filter_complex', fc,
       '-map', '[vout]', '-map', '1:a',
       '-t', f'{END}',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
       '-c:a', 'aac', '-b:a', '192k', '-shortest', 'base.mp4']
print('chapters:', n, '| target dur:', END)
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode:
    print(r.stderr[-2000:])
else:
    out = subprocess.run([FF, '-i', 'base.mp4'], capture_output=True, text=True).stderr
    import re
    m = re.search(r'Duration: [\d:.]+', out); print(m.group(0) if m else '')
