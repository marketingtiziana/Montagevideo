# -*- coding: utf-8 -*-
"""Composition finale : image animee + hook + musique.

Sortie : final_broll.mp4 (1080x1920, H.264 High / AAC, pret a publier).
"""
import json, subprocess, sys, os
import imageio_ffmpeg

sys.path.insert(0, "reel_broll")
from config import (OUT, OUT_W, OUT_H, FPS, DURATION, HOOK_SUB, HOOK_Y,
                    SUB_GAP, SCRIM_ALPHA, HOOK_IN, SUB_IN, HOOK_RISE, HOOK_FADE)

FF = imageio_ffmpeg.get_ffmpeg_exe()
A = "assets_broll"

# Geometrie reelle produite par gen_hook.py (elle depend des metriques de la
# police) : la recalculer ici la ferait deriver des PNG a la premiere retouche.
with open(f"{A}/layout.json") as f:
    lay = json.load(f)
M = lay["margin"]

box_y = int(HOOK_Y * OUT_H)
box_x = (OUT_W - lay["box_w"]) // 2
sub_y = box_y + lay["box_h"] + SUB_GAP


# Une image fixe n'a qu'un seul point de temps : sans -loop elle ne dure pas,
# et les fondus bases sur t ne se declenchent jamais.
def still(path):
    return ["-loop", "1", "-framerate", str(FPS), "-t", f"{DURATION:.3f}", "-i", path]


inputs = ["-i", "v_broll.mp4", "-i", "a_broll.wav"]
layers = []                      # (chemin, x, y, instant d'apparition)

if SCRIM_ALPHA > 0:
    layers.append((f"{A}/scrim.png", 0, 0, 0.10))
layers.append((f"{A}/hookbox.png", box_x - M, box_y - M, HOOK_IN))
if HOOK_SUB:
    sub_x = (OUT_W - lay["sub_w"]) // 2
    layers.append((f"{A}/hooksub.png",
                   sub_x - (M + lay.get("sub_stroke", 0)), sub_y - M, SUB_IN))

for path, _, _, _ in layers:
    inputs += still(path)

chain, prev = [], "0:v"
for i, (path, x, y, t0) in enumerate(layers):
    src = 2 + i
    if HOOK_FADE <= 0:
        # Pose fixe : le hook est present des la premiere image. Pas de fondu,
        # donc pas de division par une duree nulle dans l'expression overlay.
        chain.append(f"[{src}:v]format=rgba[g{i}]")
        chain.append(f"[{prev}][g{i}]overlay=x={x}:y={y}[v{i}]")
    else:
        rise = 0 if "scrim" in path else HOOK_RISE
        chain.append(f"[{src}:v]format=rgba,"
                     f"fade=t=in:st={t0:.2f}:d={HOOK_FADE:.2f}:alpha=1[g{i}]")
        # fondu + montee : l'element arrive, il n'apparait pas d'un bloc
        chain.append(
            f"[{prev}][g{i}]overlay=x={x}:"
            f"y='{y}+{rise}*(1-min(1\\,max(0\\,(t-{t0:.2f})/{HOOK_FADE:.2f})))':"
            f"enable='gte(t,{t0:.2f})'[v{i}]")
    prev = f"v{i}"

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
print(f"-> {OUT}  cartouche a y={box_y} ({box_y/OUT_H:.3f}), "
      f"mention a y={sub_y} ({sub_y/OUT_H:.3f})  "
      f"({os.path.getsize(OUT)/1e6:.1f} Mo)")
