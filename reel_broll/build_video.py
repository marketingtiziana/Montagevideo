# -*- coding: utf-8 -*-
"""Image animee : Ken Burns ancre sur le visage + etalonnage.

Sortie : v_broll.mp4 (1080x1920, muet).

Une photo fixe sans mouvement se lit comme un diaporama. On recadre donc
chaque image dans une fenetre qui se resserre lentement vers le visage :
le zoom devient un mouvement de cadreur, pas un effet.
"""
import subprocess, sys
import cv2
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, "reel_broll")
from config import (SRC, OUT_W, OUT_H, FPS, DURATION, GRADE,
                    ZOOM_START, ZOOM_END, ANCHOR_X, ANCHOR_Y, ANCHOR_PULL)

FF = imageio_ffmpeg.get_ffmpeg_exe()
TMP = "v_broll.mp4"

img = cv2.imread(SRC)
if img is None:
    raise SystemExit(f"image introuvable : {SRC}")
SH, SW = img.shape[:2]

AR = OUT_W / OUT_H
BASE_W = min(SW, SH * AR)          # fenetre 9:16 maximale dans la source
BASE_H = BASE_W / AR

N = int(round(DURATION * FPS))


def ease(u):
    """Demi-lissage : depart et arrivee adoucis, derive quasi constante au milieu."""
    s = u * u * (3 - 2 * u)
    return 0.5 * u + 0.5 * s


def crop_rect(p):
    z = ZOOM_START + (ZOOM_END - ZOOM_START) * p
    w, h = BASE_W / z, BASE_H / z
    cx = (0.5 + ANCHOR_PULL * (ANCHOR_X - 0.5) * p) * SW
    cy = (0.5 + ANCHOR_PULL * (ANCHOR_Y - 0.5) * p) * SH
    # on reste strictement dans l'image : jamais de bord noir
    x = max(0.0, min(SW - w, cx - w / 2))
    y = max(0.0, min(SH - h, cy - h / 2))
    return x, y, w, h


ff = subprocess.Popen(
    [FF, "-y", "-hide_banner", "-loglevel", "error",
     "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{OUT_W}x{OUT_H}", "-r", str(FPS),
     "-i", "pipe:0",
     "-vf", GRADE,
     "-c:v", "libx264", "-preset", "slow", "-crf", "15",
     "-pix_fmt", "yuv420p", "-color_primaries", "bt709",
     "-color_trc", "bt709", "-colorspace", "bt709", TMP],
    stdin=subprocess.PIPE)

for k in range(N):
    p = ease(k / (N - 1))
    x, y, w, h = crop_rect(p)
    xi, yi = int(round(x)), int(round(y))
    wi = min(int(round(w)), SW - xi)
    hi = min(int(round(h)), SH - yi)
    sub = img[yi:yi + hi, xi:xi + wi]
    frame = cv2.resize(sub, (OUT_W, OUT_H), interpolation=cv2.INTER_LANCZOS4)
    ff.stdin.write(frame.tobytes())

ff.stdin.close()
ff.wait()
print(f"-> {TMP}  {N} images ({N/FPS:.2f}s)  zoom {ZOOM_START:.3f} -> {ZOOM_END:.3f}")
