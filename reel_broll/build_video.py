# -*- coding: utf-8 -*-
"""Couche image : une photo animee OU une fenetre de video recadree.

Sortie : v_broll.mp4 (1080x1920, muet).

PHOTO — une image fixe sans mouvement se lit comme un diaporama. On recadre
donc chaque image dans une fenetre qui se resserre lentement vers le visage :
le zoom devient un mouvement de cadreur, pas un effet.

VIDEO — le mouvement existe deja. On coupe la fenetre voulue, on jette le son
(le reel est sans voix) et on recadre en suivant la position LISSEE du visage,
pour qu'un resserrage ne decadre jamais le sujet qui bouge. Si la fenetre
source est plus courte que la duree visee, elle est etiree (ralenti).

La video est traitee en DEUX PASSES sur le fichier plutot qu'en gardant les
images en memoire : 300 images en 1080x1920 pesent ~1,9 Go.
"""
import os, subprocess, sys
import cv2
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, "reel_broll")
from config import (SRC, SRC_START, SRC_LEN, OUT_W, OUT_H, FPS, DURATION, GRADE,
                    ZOOM_START, ZOOM_END, ANCHOR_X, ANCHOR_Y, ANCHOR_PULL,
                    TRACK_SMOOTH, FOLLOW, FACE_Y_TARGET)

FF = imageio_ffmpeg.get_ffmpeg_exe()
TMP = "v_broll.mp4"
N = int(round(DURATION * FPS))
AR = OUT_W / OUT_H
IS_VIDEO = os.path.splitext(SRC)[1].lower() in (".mp4", ".mov", ".m4v", ".avi", ".mkv")


def ease(u):
    """Demi-lissage : depart et arrivee adoucis, derive quasi constante au milieu."""
    s = u * u * (3 - 2 * u)
    return 0.5 * u + 0.5 * s


def reframe(frame, cx, cy, zoom, SW, SH):
    base_w = min(SW, SH * AR)
    w, h = base_w / zoom, base_w / AR / zoom
    # on reste strictement dans l'image : jamais de bord noir
    x = max(0.0, min(SW - w, cx - w / 2))
    y = max(0.0, min(SH - h, cy - h / 2))
    xi, yi = int(round(x)), int(round(y))
    wi, hi = min(int(round(w)), SW - xi), min(int(round(h)), SH - yi)
    sub = frame[yi:yi + hi, xi:xi + wi]
    interp = cv2.INTER_LANCZOS4 if wi < OUT_W else cv2.INTER_AREA
    return cv2.resize(sub, (OUT_W, OUT_H), interpolation=interp)


def source_indices():
    """Pour chaque image de sortie, l'index de l'image source a lire."""
    cap = cv2.VideoCapture(SRC)
    src_fps = cap.get(cv2.CAP_PROP_FPS) or FPS
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    SW = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    SH = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()

    avail = total / src_fps - SRC_START
    want = SRC_LEN if SRC_LEN > 0 else DURATION
    if want > avail + 1e-6:
        raise SystemExit(
            f"{SRC} : fenetre de {want:.2f}s demandee a partir de {SRC_START:.2f}s, "
            f"mais il ne reste que {avail:.2f}s")
    speed = want / DURATION
    idx = [min(total - 1,
               int(round((SRC_START + (k / FPS) * speed) * src_fps)))
           for k in range(N)]
    return idx, SW, SH, total, src_fps, want, speed


def scan_faces(idx, SW, SH):
    """Passe 1 : position du visage sur les images retenues (rien d'autre en memoire)."""
    det = cv2.FaceDetectorYN.create("models/yunet.onnx", "", (SW, SH), 0.6)
    cx = np.full(N, np.nan)
    cy = np.full(N, np.nan)
    cap = cv2.VideoCapture(SRC)
    i, k = 0, 0
    while k < N:
        ok, fr = cap.read()
        if not ok:
            break
        while k < N and idx[k] == i:          # une image source peut servir plusieurs fois
            _, faces = det.detect(fr)
            if faces is not None and len(faces):
                f = max(faces, key=lambda f: f[2] * f[3])
                cx[k] = f[0] + f[2] / 2
                cy[k] = f[1] + f[3] / 2
            k += 1
        i += 1
    cap.release()

    found = int(np.isfinite(cx).sum())
    if found == 0:
        print("   (aucun visage detecte : recadrage centre)")
        return np.full(N, SW / 2), np.full(N, SH / 2), 0

    # trous interpoles, puis trajectoire lissee : le cadre ne doit pas sursauter
    t = np.arange(N)
    ok_ = np.isfinite(cx)
    cx = np.interp(t, t[ok_], cx[ok_])
    cy = np.interp(t, t[ok_], cy[ok_])
    pad = TRACK_SMOOTH
    k_ = np.ones(2 * pad + 1) / (2 * pad + 1)
    cx = np.convolve(np.pad(cx, pad, mode="edge"), k_, mode="same")[pad:-pad]
    cy = np.convolve(np.pad(cy, pad, mode="edge"), k_, mode="same")[pad:-pad]
    return cx, cy, found


def encoder():
    return subprocess.Popen(
        [FF, "-y", "-hide_banner", "-loglevel", "error",
         "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{OUT_W}x{OUT_H}", "-r", str(FPS),
         "-i", "pipe:0",
         *(["-vf", GRADE] if GRADE.strip() else []),
         "-c:v", "libx264", "-preset", "slow", "-crf", "15",
         "-pix_fmt", "yuv420p", "-color_primaries", "bt709",
         "-color_trc", "bt709", "-colorspace", "bt709", TMP],
        stdin=subprocess.PIPE)


def passthrough_ok():
    """Vrai si la video sort telle quelle : aucun zoom, aucun etalonnage,
    aucun etirement, et deja aux bonnes dimensions."""
    if not IS_VIDEO or GRADE.strip():
        return False
    if ZOOM_START != 1.0 or ZOOM_END != 1.0:
        return False
    if SRC_LEN not in (0.0, DURATION):
        return False
    cap = cv2.VideoCapture(SRC)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    cap.release()
    return (w, h) == (OUT_W, OUT_H)


if passthrough_ok():
    # On recopie le flux video sans le re-encoder : pas de perte de generation,
    # l'image livree est exactement celle du rush.
    subprocess.run(
        [FF, "-y", "-hide_banner", "-loglevel", "error", "-i", SRC,
         "-t", f"{DURATION:.3f}", "-an", "-c:v", "copy", TMP], check=True)
    print(f"-> {TMP}  video recopiee telle quelle ({DURATION:.2f}s, son jete, "
          f"aucun re-encodage)")
    sys.exit(0)

if IS_VIDEO:
    idx, SW, SH, total, src_fps, want, speed = source_indices()
    tx, ty, found = scan_faces(idx, SW, SH)
    dup = N - len(set(idx))
    print(f"{SRC} : {total} images a {src_fps:.2f} i/s ; fenetre {SRC_START:.2f}s "
          f"-> {SRC_START+want:.2f}s ({want:.2f}s) etiree sur {DURATION:.2f}s "
          f"= {speed*100:.0f}% de vitesse")
    print(f"   visage detecte sur {found}/{N} images ; {dup} image(s) source repetee(s)")

    ff = encoder()
    cap = cv2.VideoCapture(SRC)
    i, k = 0, 0
    while k < N:
        ok, fr = cap.read()
        if not ok:
            break
        while k < N and idx[k] == i:
            p = ease(k / (N - 1))
            zoom = ZOOM_START + (ZOOM_END - ZOOM_START) * p
            # on pose le visage a FACE_Y_TARGET du cadre, pas au centre : le
            # sujet monte dans le tiers haut et laisse la place au hook en bas
            h = min(SW, SH * AR) / AR / zoom
            want_y = ty[k] + (0.5 - FACE_Y_TARGET) * h
            # on ne colle pas au visage : la compo respire au lieu de le suivre au pixel
            cx = SW / 2 + FOLLOW * (tx[k] - SW / 2)
            cy = SH / 2 + FOLLOW * (want_y - SH / 2)
            ff.stdin.write(reframe(fr, cx, cy, zoom, SW, SH).tobytes())
            k += 1
        i += 1
    cap.release()
else:
    img = cv2.imread(SRC)
    if img is None:
        raise SystemExit(f"source introuvable : {SRC}")
    SH, SW = img.shape[:2]
    ff = encoder()
    for k in range(N):
        p = ease(k / (N - 1))
        zoom = ZOOM_START + (ZOOM_END - ZOOM_START) * p
        cx = (0.5 + ANCHOR_PULL * (ANCHOR_X - 0.5) * p) * SW
        cy = (0.5 + ANCHOR_PULL * (ANCHOR_Y - 0.5) * p) * SH
        ff.stdin.write(reframe(img, cx, cy, zoom, SW, SH).tobytes())

ff.stdin.close()
ff.wait()
print(f"-> {TMP}  {N} images ({N/FPS:.2f}s)  source {'video' if IS_VIDEO else 'photo'}  "
      f"zoom {ZOOM_START:.3f} -> {ZOOM_END:.3f}")
