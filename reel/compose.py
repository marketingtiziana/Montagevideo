# -*- coding: utf-8 -*-
"""Composition finale : image etalonnee + sous-titres + incrustations + son.

Sortie : final_tiktok.mp4 (1080x1920, H.264 High, AAC, prêt a publier).
"""
import subprocess, sys, os
from PIL import Image
import imageio_ffmpeg

sys.path.insert(0, "reel")
from config import GRAPHICS, GFX_Y, OUT_W, OUT_H, FPS
from timeline import map_time, TOTAL

FF = imageio_ffmpeg.get_ffmpeg_exe()
OUT = "final_tiktok.mp4"

inputs = ["-i", "v_cam.mp4", "-i", "v_audio.wav"]
# -loop 1 : une image fixe n'a qu'un seul point de temps ; sans boucle, le
# fondu d'apparition ne se declencherait jamais et le carton resterait invisible.
for i in range(len(GRAPHICS)):
    inputs += ["-loop", "1", "-framerate", str(FPS), "-t", f"{TOTAL:.3f}",
               "-i", f"assets/gfx{i}.png"]

# --- sous-titres (libass, polices locales) ---------------------------------
chain = [f"[0:v]ass=subs.ass:fontsdir=fonts[v0]"]

# --- incrustations : glissee verticale courte + fondu, jamais un "sticker" --
prev = "v0"
for i, (s, e, text) in enumerate(GRAPHICS):
    t0, t1 = map_time(s), map_time(e)
    w, h = Image.open(f"assets/gfx{i}.png").size
    x = (OUT_W - w) // 2
    y = int(OUT_H * GFX_Y)
    fade = f"[{i+2}:v]format=rgba,fade=t=in:st={t0:.2f}:d=0.26:alpha=1," \
           f"fade=t=out:st={max(t0,t1-0.30):.2f}:d=0.30:alpha=1[g{i}]"
    # montee de 22 px pendant l'apparition : le carton "arrive", il n'apparait pas d'un bloc
    ov = (f"[{prev}][g{i}]overlay=x={x}:"
          f"y='{y}+22*(1-min(1\\,max(0\\,(t-{t0:.2f})/0.26)))':"
          f"enable='between(t,{t0:.2f},{t1:.2f})'[v{i+1}]")
    chain += [fade, ov]
    prev = f"v{i+1}"

fc = ";".join(chain)

cmd = [FF, "-y", "-hide_banner", "-loglevel", "error", *inputs,
       "-filter_complex", fc,
       "-map", f"[{prev}]", "-map", "1:a",
       "-c:v", "libx264", "-profile:v", "high", "-level", "4.1",
       "-preset", "slow", "-crf", "18", "-maxrate", "12M", "-bufsize", "20M",
       "-pix_fmt", "yuv420p", "-r", str(FPS),
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
       "-movflags", "+faststart", "-shortest", OUT]

subprocess.run(cmd, check=True)
print(f"-> {OUT}  ({os.path.getsize(OUT)/1e6:.1f} Mo)")
