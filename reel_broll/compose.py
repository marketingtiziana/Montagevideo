# -*- coding: utf-8 -*-
"""Composition finale : image animee + voile + hook + musique.

Sortie : final_broll.mp4 (1080x1920, H.264 High / AAC, pret a publier).
"""
import json, subprocess, sys, os
from PIL import Image
import imageio_ffmpeg

sys.path.insert(0, "reel_broll")
from config import (OUT, OUT_W, OUT_H, FPS, DURATION, HOOK,
                    HOOK_LINE_GAP, HOOK_X, HOOK_Y, HOOK_IN, HOOK_STAGGER,
                    HOOK_RISE, HOOK_FADE, BAR_H, BAR_GAP, BAR_IN)

FF = imageio_ffmpeg.get_ffmpeg_exe()
A = "assets_broll"
# Geometrie reelle produite par gen_hook.py (elle depend des metriques de la
# police) : la recalculer ici la ferait deriver des PNG a la premiere retouche.
with open(f"{A}/layout.json") as f:
    _lay = json.load(f)
PAD, TEXT_H = _lay["pad"], _lay["text_h"]

base_x = int(HOOK_X * OUT_W)
base_y = int(HOOK_Y * OUT_H)

# Une image fixe n'a qu'un seul point de temps : sans -loop elle ne dure pas,
# et les fondus bases sur t ne se declenchent jamais.
def still(path):
    return ["-loop", "1", "-framerate", str(FPS), "-t", f"{DURATION:.3f}", "-i", path]

inputs = ["-i", "v_broll.mp4", "-i", "a_broll.wav"]
inputs += still(f"{A}/scrim.png")
inputs += still(f"{A}/bar.png")
for i in range(len(HOOK)):
    inputs += still(f"{A}/hook{i}.png")

chain = []

# --- voile : arrive en douceur, la premiere image reste la photo nette --------
chain.append("[2:v]format=rgba,fade=t=in:st=0.10:d=0.60:alpha=1[scrim]")
chain.append("[0:v][scrim]overlay=0:0[v0]")

prev = "v0"
idx = 1


def rise(tag, src, x, y, t0):
    """Fondu + montee de HOOK_RISE px : l'element arrive, il n'apparait pas d'un bloc."""
    global prev, idx
    chain.append(f"[{src}:v]format=rgba,"
                 f"fade=t=in:st={t0:.2f}:d={HOOK_FADE:.2f}:alpha=1[{tag}]")
    chain.append(
        f"[{prev}][{tag}]overlay=x={x}:"
        f"y='{y}+{HOOK_RISE}*(1-min(1\\,max(0\\,(t-{t0:.2f})/{HOOK_FADE:.2f})))':"
        f"enable='gte(t,{t0:.2f})'[v{idx}]")
    prev = f"v{idx}"
    idx += 1


# trait d'accent, puis les lignes du hook en cascade
rise("bar", 3, base_x - PAD, base_y - BAR_GAP - BAR_H - PAD, BAR_IN)
for i in range(len(HOOK)):
    y = base_y + i * (TEXT_H + HOOK_LINE_GAP) - PAD
    rise(f"h{i}", 4 + i, base_x - PAD, y, HOOK_IN + i * HOOK_STAGGER)

cmd = [FF, "-y", "-hide_banner", "-loglevel", "error", *inputs,
       "-filter_complex", ";".join(chain),
       "-map", f"[{prev}]", "-map", "1:a",
       "-c:v", "libx264", "-profile:v", "high", "-level", "4.1",
       "-preset", "slow", "-crf", "20", "-maxrate", "4200k", "-bufsize", "8400k",
       "-pix_fmt", "yuv420p", "-r", str(FPS),
       "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
       "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-ac", "2",
       "-movflags", "+faststart", "-t", f"{DURATION:.3f}", OUT]

subprocess.run(cmd, check=True)
print(f"-> {OUT}  ({os.path.getsize(OUT)/1e6:.1f} Mo)")
