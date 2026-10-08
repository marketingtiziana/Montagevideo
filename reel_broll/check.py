# -*- coding: utf-8 -*-
"""Controles automatiques du reel rendu. Sort en erreur si un critere echoue."""
import json, subprocess, sys
import cv2
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, "reel_broll")
from config import OUT, OUT_W, OUT_H, FPS, DURATION, HOOK_Y, HOOK_SUB, SUB_GAP

FF = imageio_ffmpeg.get_ffmpeg_exe()
fail = []

lay = json.load(open("assets_broll/layout.json"))
hook_top = int(HOOK_Y * OUT_H)
hook_bottom = hook_top + lay["box_h"]
if HOOK_SUB:
    hook_bottom += SUB_GAP + lay["sub_h"]

# --- duree, visage entier, hook qui ne couvre pas le visage ------------------
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

print(f"visage detecte      : {n-miss}/{n} images")
if miss:
    fail.append(f"{miss} images sans visage detecte")
print(f"haut du visage      : min {min(tops):.3f} (>0 = tete jamais coupee)")
if min(tops) <= 0.004:
    fail.append("tete coupee en haut du cadre")

marge = hook_top - max(bottoms) * OUT_H
print(f"bas du visage       : max {max(bottoms):.3f} ; haut du cartouche "
      f"{hook_top/OUT_H:.3f} -> marge {marge:+.0f} px")
if marge < 0:
    fail.append(f"le cartouche empiete de {-marge:.0f} px sur la boite visage")

# --- zone sure des plateformes ----------------------------------------------
print(f"bas du hook         : {hook_bottom/OUT_H:.3f} (zone sure : < 0.840)")
if hook_bottom / OUT_H > 0.840:
    fail.append(f"le hook descend a {hook_bottom/OUT_H:.3f}, dans la zone d'interface")
left = (OUT_W - lay["box_w"]) / 2 / OUT_W
print(f"marges laterales    : {left:.3f} de chaque cote (zone sure : > 0.040)")
if left < 0.040:
    fail.append(f"cartouche trop large : marge laterale {left:.3f}")

# --- audio present, sans silence ni saturation ------------------------------
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
