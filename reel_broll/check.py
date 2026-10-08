# -*- coding: utf-8 -*-
"""Controles automatiques du reel rendu. Sort en erreur si un critere echoue."""
import json, os, subprocess, sys
import cv2
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, "reel_broll")
from config import OUT, OUT_W, OUT_H, FPS, DURATION, HOOK_Y, BAR_GAP, BAR_H

FF = imageio_ffmpeg.get_ffmpeg_exe()
fail = []

# --- geometrie du hook (lue sur les PNG, pas redevinee) ---------------------
lay = json.load(open("assets_broll/layout.json"))
base_y = int(HOOK_Y * OUT_H)
alpha = np.array(cv2.imread("assets_broll/hook0.png", cv2.IMREAD_UNCHANGED))[..., 3]
ink_top = base_y - lay["pad"] + np.where(alpha.max(axis=1) > 24)[0].min()
top_element = min(ink_top, base_y - BAR_GAP - BAR_H)

# --- 1. duree exacte --------------------------------------------------------
cap = cv2.VideoCapture(OUT)
det = cv2.FaceDetectorYN.create("models/yunet.onnx", "", (OUT_W, OUT_H), 0.6)
n, miss, tops, bottoms = 0, 0, [], []
while True:
    ok, fr = cap.read()
    if not ok:
        break
    n += 1
    _, faces = det.detect(fr)
    if faces is None or len(faces) == 0:
        miss += 1
        continue
    f = max(faces, key=lambda f: f[2] * f[3])
    tops.append(f[1] / OUT_H)
    bottoms.append((f[1] + f[3]) / OUT_H)
cap.release()

want = int(round(DURATION * FPS))
print(f"duree               : {n} images = {n/FPS:.2f}s (attendu {want} / {DURATION:.2f}s)")
if n != want:
    fail.append(f"duree {n} images au lieu de {want}")

# --- 2. le visage reste entier et jamais couvert par le hook ----------------
print(f"visage detecte      : {n-miss}/{n} images")
if miss:
    fail.append(f"{miss} images sans visage detecte")
print(f"haut du visage      : min {min(tops):.3f} (>0 = tete jamais coupee)")
if min(tops) <= 0.004:
    fail.append("tete coupee en haut du cadre")
marge = top_element - max(bottoms) * OUT_H
print(f"bas du visage       : max {max(bottoms):.3f} ; 1er element du hook "
      f"{top_element/OUT_H:.3f} -> marge {marge:+.0f} px")
if marge < 0:
    fail.append(f"le hook empiete de {-marge:.0f} px sur la boite visage")

# --- 3. le hook est bas, hors de la zone d'interface des plateformes --------
lines = 0
while os.path.exists(f"assets_broll/hook{lines}.png"):
    lines += 1
bottom = (base_y + (lines - 1) * (lay["text_h"] + 12) + lay["text_h"]) / OUT_H
print(f"bas du bloc hook    : {bottom:.3f} (zone sure : < 0.840)")
if bottom > 0.840:
    fail.append(f"le hook descend a {bottom:.3f}, dans la zone d'interface")

# --- 4. audio present, sans silence ni saturation ---------------------------
raw = subprocess.run(
    [FF, "-hide_banner", "-loglevel", "error", "-i", OUT, "-vn",
     "-ac", "1", "-ar", "48000", "-f", "s16le", "-"],
    capture_output=True, check=True).stdout
a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
win = 24000
rms = np.array([np.sqrt((a[i:i + win] ** 2).mean()) for i in range(0, len(a) - win, win)])
quiet = int((rms[:-2] < 0.01).sum())        # on exclut le fondu de sortie
print(f"audio               : {len(a)/48000:.2f}s, crete {np.abs(a).max():.3f}, "
      f"{quiet} fenetre(s) muette(s) hors fondu")
if np.abs(a).max() >= 0.999:
    fail.append("audio sature")
if quiet:
    fail.append(f"{quiet} fenetre(s) audio muettes")

print()
if fail:
    for f in fail:
        print("ECHEC :", f)
    sys.exit(1)
print("Tous les controles passent.")
