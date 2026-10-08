# -*- coding: utf-8 -*-
"""Couche image : une photo animee OU une fenetre de video recadree.

Sortie : v_broll.mp4 (1080x1920, muet).

PHOTO — une image fixe sans mouvement se lit comme un diaporama. On recadre
donc chaque image dans une fenetre qui se resserre lentement vers le visage :
le zoom devient un mouvement de cadreur, pas un effet.

VIDEO — le mouvement existe deja. On coupe la fenetre voulue, on jette le son
(le reel est sans voix) et on recadre en suivant la position LISSEE du visage,
pour qu'un resserrage ne decadre jamais le sujet qui bouge.
"""
import os, subprocess, sys
import cv2
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, "reel_broll")
from config import (SRC, SRC_START, OUT_W, OUT_H, FPS, DURATION, GRADE,
                    ZOOM_START, ZOOM_END, ANCHOR_X, ANCHOR_Y, ANCHOR_PULL,
                    TRACK_SMOOTH, FOLLOW)

FF = imageio_ffmpeg.get_ffmpeg_exe()
TMP = "v_broll.mp4"
N = int(round(DURATION * FPS))
AR = OUT_W / OUT_H
IS_VIDEO = os.path.splitext(SRC)[1].lower() in (".mp4", ".mov", ".m4v", ".avi", ".mkv")


def ease(u):
    """Demi-lissage : depart et arrivee adoucis, derive quasi constante au milieu."""
    s = u * u * (3 - 2 * u)
    return 0.5 * u + 0.5 * s


def window(zoom, SW, SH):
    base_w = min(SW, SH * AR)
    return base_w / zoom, base_w / AR / zoom


def clamp(cx, cy, w, h, SW, SH):
    """On reste strictement dans l'image : jamais de bord noir."""
    return (max(0.0, min(SW - w, cx - w / 2)),
            max(0.0, min(SH - h, cy - h / 2)))


def reframe(frame, cx, cy, zoom, SW, SH):
    w, h = window(zoom, SW, SH)
    x, y = clamp(cx, cy, w, h, SW, SH)
    xi, yi = int(round(x)), int(round(y))
    wi, hi = min(int(round(w)), SW - xi), min(int(round(h)), SH - yi)
    sub = frame[yi:yi + hi, xi:xi + wi]
    interp = cv2.INTER_LANCZOS4 if wi < OUT_W else cv2.INTER_AREA
    return cv2.resize(sub, (OUT_W, OUT_H), interpolation=interp)


def read_window():
    """Les N images de la fenetre voulue, lues sequentiellement."""
    cap = cv2.VideoCapture(SRC)
    src_fps = cap.get(cv2.CAP_PROP_FPS) or FPS
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    first = int(round(SRC_START * src_fps))
    if first + int(DURATION * src_fps) > total:
        cap.release()
        raise SystemExit(
            f"SRC_START={SRC_START}s + {DURATION}s depasse la duree de {SRC} "
            f"({total/src_fps:.1f}s)")
    frames, i = [], 0
    # on relit depuis le debut plutot que de chercher : un seek sur un GOP long
    # retombe sur l'image cle precedente et decale la fenetre.
    while len(frames) < N:
        ok, fr = cap.read()
        if not ok:
            break
        t = i / src_fps - SRC_START
        if t >= -1e-9 and len(frames) <= int(round(t * FPS)):
            frames.append(fr)
        i += 1
    cap.release()
    while len(frames) < N:                 # fin de fichier : on tient la derniere image
        frames.append(frames[-1])
    return frames[:N]


def track(frames, SW, SH):
    """Trajectoire du visage, trous interpoles puis lissee."""
    det = cv2.FaceDetectorYN.create("models/yunet.onnx", "", (SW, SH), 0.6)
    cx = np.full(len(frames), np.nan)
    cy = np.full(len(frames), np.nan)
    for i, fr in enumerate(frames):
        _, faces = det.detect(fr)
        if faces is None or len(faces) == 0:
            continue
        f = max(faces, key=lambda f: f[2] * f[3])
        cx[i] = f[0] + f[2] / 2
        cy[i] = f[1] + f[3] / 2
    found = int(np.isfinite(cx).sum())
    if found == 0:
        print("   (aucun visage detecte : recadrage centre)")
        return np.full(len(frames), SW / 2), np.full(len(frames), SH / 2), 0
    idx = np.arange(len(frames))
    ok = np.isfinite(cx)
    cx = np.interp(idx, idx[ok], cx[ok])
    cy = np.interp(idx, idx[ok], cy[ok])
    k = np.ones(2 * TRACK_SMOOTH + 1) / (2 * TRACK_SMOOTH + 1)
    pad = TRACK_SMOOTH
    cx = np.convolve(np.pad(cx, pad, mode="edge"), k, mode="same")[pad:-pad]
    cy = np.convolve(np.pad(cy, pad, mode="edge"), k, mode="same")[pad:-pad]
    return cx, cy, found


# --- lecture de la source ---------------------------------------------------
if IS_VIDEO:
    frames = read_window()
    SH, SW = frames[0].shape[:2]
    tx, ty, found = track(frames, SW, SH)
    print(f"{SRC} : fenetre {SRC_START:.2f}s -> {SRC_START+DURATION:.2f}s, "
          f"{len(frames)} images {SW}x{SH} ; visage sur {found}/{len(frames)}")
else:
    img = cv2.imread(SRC)
    if img is None:
        raise SystemExit(f"source introuvable : {SRC}")
    SH, SW = img.shape[:2]

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
    zoom = ZOOM_START + (ZOOM_END - ZOOM_START) * p
    if IS_VIDEO:
        # on ne colle pas au visage : la compo respire au lieu de le suivre au pixel
        cx = SW / 2 + FOLLOW * (tx[k] - SW / 2)
        cy = SH / 2 + FOLLOW * (ty[k] - SH / 2)
        ff.stdin.write(reframe(frames[k], cx, cy, zoom, SW, SH).tobytes())
    else:
        cx = (0.5 + ANCHOR_PULL * (ANCHOR_X - 0.5) * p) * SW
        cy = (0.5 + ANCHOR_PULL * (ANCHOR_Y - 0.5) * p) * SH
        ff.stdin.write(reframe(img, cx, cy, zoom, SW, SH).tobytes())

ff.stdin.close()
ff.wait()
kind = "video" if IS_VIDEO else "photo"
print(f"-> {TMP}  {N} images ({N/FPS:.2f}s)  source {kind}  "
      f"zoom {ZOOM_START:.3f} -> {ZOOM_END:.3f}")
