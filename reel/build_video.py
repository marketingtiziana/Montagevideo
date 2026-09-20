# -*- coding: utf-8 -*-
"""Coupes + camera virtuelle (punch-ins qui suivent le visage) + etalonnage.

Sortie : v_cam.mp4 (1080x1920, muet).

Principe : plutot qu'un zoompan aveugle qui decadrerait le sujet (le selfie est
filme en marchant, le visage traverse le cadre), on calcule pour chaque image
une fenetre de recadrage centree sur la position LISSEE du visage. Le zoom
devient alors un vrai mouvement de cadreur, pas un effet.
"""
import json, subprocess, sys
import cv2
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, "reel")
from config import (SRC, OUT_W, OUT_H, FPS, SEGMENTS, GRADE,
                    FACE_Y_TARGET, FOLLOW_X, FOLLOW_Y, FREEZE_AT, FREEZE_DUR)

FF = imageio_ffmpeg.get_ffmpeg_exe()
OUT = "v_cam.mp4"

tr = json.load(open("face_track.json"))
TRACK, SFPS = tr["track"], tr["fps"]
SW, SH = tr["w"], tr["h"]
AR = OUT_W / OUT_H                      # 0.5625
BASE_W = min(SW, SH * AR)               # fenetre 9:16 maximale dans la source
BASE_H = BASE_W / AR


def crop_rect(t, zoom):
    """Fenetre de recadrage (x, y, w, h) dans l'image source, pour un zoom donne."""
    w, h = BASE_W / zoom, BASE_H / zoom
    i = min(len(TRACK) - 1, max(0, int(round(t * SFPS))))
    f = TRACK[i]

    # ou l'on voudrait centrer pour poser le visage a FACE_Y_TARGET du cadre
    want_x = f["cx"] * SW
    want_y = f["cy"] * SH + (0.5 - FACE_Y_TARGET) * h

    # on n'y va qu'en partie : la composition respire au lieu de coller au visage
    cx = SW / 2 + FOLLOW_X * (want_x - SW / 2)
    cy = SH / 2 + FOLLOW_Y * (want_y - SH / 2)

    # on reste strictement dans l'image : jamais de bord noir
    x = max(0.0, min(SW - w, cx - w / 2))
    y = max(0.0, min(SH - h, cy - h / 2))
    return x, y, w, h


def reframe(frame, t, zoom):
    x, y, w, h = crop_rect(t, zoom)
    xi, yi = int(round(x)), int(round(y))
    wi = min(int(round(w)), SW - xi)
    hi = min(int(round(h)), SH - yi)
    sub = frame[yi:yi + hi, xi:xi + wi]
    interp = cv2.INTER_LANCZOS4 if wi < OUT_W else cv2.INTER_AREA
    return cv2.resize(sub, (OUT_W, OUT_H), interpolation=interp)


def ease(u):
    """Lissage cosinus : le punch-in demarre et finit en douceur."""
    return (1 - np.cos(np.pi * u)) / 2


# --- plan de rendu : pour chaque image de sortie, (index_source, zoom) --------
# Les durees viennent de timeline.SEG_FRAMES : video et audio partagent ainsi
# exactement le meme decoupage, a l'image pres.
from timeline import SEG_FRAMES, FREEZE_FRAMES, TOTAL_FRAMES

# image exacte (segment, rang) ou l'on insere l'arret sur image
freeze_seg, freeze_k = None, None
if FREEZE_AT:
    for (si, (s, e, *_r)) in enumerate(SEGMENTS):
        if s <= FREEZE_AT <= e:
            freeze_seg = si
            freeze_k = min(SEG_FRAMES[si] - 1, int(round((FREEZE_AT - s) * FPS)))
            break

plan = []                    # [(src_index, zoom, is_freeze_hold)]
for (si, (s, e, z0, z1, note)) in enumerate(SEGMENTS):
    n = SEG_FRAMES[si]
    for k in range(n):
        t = s + k / FPS
        z = z0 + (z1 - z0) * ease(k / max(1, n - 1))
        plan.append([int(round(t * SFPS)), z, False])
        if si == freeze_seg and k == freeze_k:
            for _ in range(FREEZE_FRAMES):
                plan.append([int(round(t * SFPS)), z, True])

need = sorted({p[0] for p in plan})
assert len(plan) == TOTAL_FRAMES, (len(plan), TOTAL_FRAMES)
print(f"{len(plan)} images de sortie ({len(plan)/FPS:.2f}s) depuis {len(need)} images source")

# --- lecture sequentielle de la source (bien plus rapide qu'un seek par image)
cap = cv2.VideoCapture(SRC)
frames = {}
wanted = set(need)
i = 0
while wanted:
    ok, fr = cap.read()
    if not ok:
        break
    if i in wanted:
        frames[i] = fr
        wanted.discard(i)
    i += 1
cap.release()
print(f"{len(frames)} images source chargees")

ff = subprocess.Popen(
    [FF, "-y", "-hide_banner", "-loglevel", "error",
     "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{OUT_W}x{OUT_H}", "-r", str(FPS),
     "-i", "pipe:0",
     "-vf", GRADE,
     "-c:v", "libx264", "-preset", "slow", "-crf", "16",
     "-pix_fmt", "yuv420p", "-color_primaries", "bt709",
     "-color_trc", "bt709", "-colorspace", "bt709", OUT],
    stdin=subprocess.PIPE)

written = 0
for si, (src_i, z, _hold) in enumerate(plan):
    fr = frames.get(src_i)
    if fr is None:
        continue
    ff.stdin.write(reframe(fr, src_i / SFPS, z).tobytes())
    written += 1
    if written % 300 == 0:
        print(f"  {written}/{len(plan)}", flush=True)

ff.stdin.close()
ff.wait()
print(f"-> {OUT}  {written} images  ({written/FPS:.2f}s)")
