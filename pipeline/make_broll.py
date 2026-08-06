# -*- coding: utf-8 -*-
# Pré-traite les b-roll vidéo (broll/*.mp4 générés via Higgsfield) en clips prêts
# à composer : cadrage 9:16 plein, ENTRÉE stylée "zoom-settle" (léger zoom qui se
# pose), grade NYT (désaturé, contraste, grain, vignette), 30 fps. -> broll_ready/
import os, subprocess, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1080, 1920, 30
os.makedirs('broll_ready', exist_ok=True)

# grade NYT appliqué aux b-roll (cohérent avec la base)
GRADE = ("eq=contrast=1.08:saturation=0.52:gamma=0.99,"
         "curves=all='0/0.04 0.5/0.5 1/0.965',"
         "noise=alls=6:allf=t,vignette=PI/4.8")

# zoom-settle : part à 1.14 et se pose à 1.03 en ~0.5s, puis dérive très lente
ZSET = "if(lt(on,14),1.14-0.11*on/14,1.03+0.02*sin((on-14)/34))"


def process(name):
    src = f'broll/{name}.mp4'
    out = f'broll_ready/{name}.mp4'
    vf = (f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
          f"zoompan=z='{ZSET}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
          f"{GRADE},format=yuv420p")
    cmd = [FF, '-y', '-i', src, '-vf', vf, '-an',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(name, 'ok' if r.returncode == 0 else r.stderr[-500:])


if __name__ == '__main__':
    for n in ['br_facture', 'br_etat', 'br_poche', 'br_pays', 'br_guichet', 'br_place', 'br_structure']:
        if os.path.exists(f'broll/{n}.mp4'):
            process(n)
    print('done ->', sorted(os.listdir('broll_ready')))
