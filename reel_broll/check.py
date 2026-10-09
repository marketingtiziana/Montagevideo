# -*- coding: utf-8 -*-
"""Controles automatiques du reel rendu. Sort en erreur si un critere echoue."""
import json, subprocess, sys
import cv2
import numpy as np
import imageio_ffmpeg

sys.path.insert(0, "reel_broll")
from srcinfo import TOTAL
from config import OUT, OUT_W, OUT_H, FPS, AUDIO, HOOK_Y, HOOK_SUB

FF = imageio_ffmpeg.get_ffmpeg_exe()
fail = []

lay = json.load(open("assets_broll/layout.json"))
hook_top = int(HOOK_Y * OUT_H)
hook_bottom = hook_top + lay["box_h"]
if HOOK_SUB:
    hook_bottom += lay["sub_gap"] + lay["sub_h"]

# --- duree, visage entier, hook qui ne couvre pas le visage ------------------
cap = cv2.VideoCapture(OUT)
det = cv2.FaceDetectorYN.create("models/yunet.onnx", "", (OUT_W, OUT_H), 0.6)
n, miss, raw_top, raw_bot = 0, 0, [], []
while True:
    ok, fr = cap.read()
    if not ok:
        break
    n += 1
    _, faces = det.detect(fr)
    if faces is None or len(faces) == 0:
        miss += 1
        raw_top.append(np.nan)
        raw_bot.append(np.nan)
        continue
    f = max(faces, key=lambda f: f[2] * f[3])
    raw_top.append(f[1] / OUT_H)
    raw_bot.append((f[1] + f[3]) / OUT_H)
cap.release()
raw_top = np.array(raw_top, dtype=float)
raw_bot = np.array(raw_bot, dtype=float)


def despike(v, win=9, tol=0.06):
    """Ecarte les detections isolees aberrantes.

    Le detecteur accroche parfois un pli de vetement ou une main : la boite
    saute d'un coup sur une ou deux images. Prendre le maximum brut ferait
    mesurer ce faux positif au lieu du visage. Un ecart au median glissant
    identifie ces sauts sans rien relacher sur le vrai visage.
    """
    if not np.isfinite(v).any():      # plan sans visage : rien a filtrer
        return v, 0
    with np.errstate(all="ignore"):
        med = np.array([np.nanmedian(v[max(0, i - win // 2):i + win // 2 + 1])
                        if np.isfinite(v[max(0, i - win // 2):i + win // 2 + 1]).any()
                        else np.nan
                        for i in range(len(v))])
    spike = np.abs(v - med) > tol
    clean = v.copy()
    clean[spike] = np.nan
    return clean, int(np.nansum(spike))


top, _ = despike(raw_top)
bot, spikes = despike(raw_bot)

want = int(round(TOTAL * FPS))
print(f"duree               : {n} images = {n/FPS:.2f}s (attendu {want} / {TOTAL:.2f}s)")
# un rush a cadence variable ne tombe pas sur un compte rond
if abs(n - want) > 2:
    fail.append(f"duree {n} images au lieu de {want}")

HAS_FACE = (n - miss) > 0.5 * n
if not HAS_FACE:
    # Un B-roll peut ne montrer aucun visage : les controles de cadrage du
    # visage n'ont alors rien a mesurer, mais le reste doit rester verifie.
    print(f"visage              : absent du plan ({n-miss}/{n} images) "
          f"-> controles de visage sans objet")
else:
    print(f"visage detecte      : {n-miss}/{n} images"
          + (f" ; {spikes} detection(s) aberrante(s) ecartee(s)" if spikes else ""))
    print(f"haut du visage      : min {np.nanmin(top):.3f} (>0 = tete jamais coupee)")
    if np.nanmin(top) <= 0.004:
        fail.append("tete coupee en haut du cadre")

    face_bottom = np.nanmax(bot)
    marge = hook_top - face_bottom * OUT_H
    print(f"bas du visage       : max {face_bottom:.3f} (brut {np.nanmax(raw_bot):.3f}) ; "
          f"haut du cartouche {hook_top/OUT_H:.3f} -> marge {marge:+.0f} px")
    if marge < 0:
        fail.append(f"le cartouche empiete de {-marge:.0f} px sur la boite visage")
    if spikes > 0.05 * n:
        fail.append(f"{spikes} detections aberrantes : suivi du visage peu fiable")

# --- zone sure des plateformes ----------------------------------------------
print(f"bas du hook         : {hook_bottom/OUT_H:.3f} (zone sure : < 0.840)")
if hook_bottom / OUT_H > 0.840:
    fail.append(f"le hook descend a {hook_bottom/OUT_H:.3f}, dans la zone d'interface")
left = (OUT_W - lay["box_w"]) / 2 / OUT_W
print(f"marges laterales    : {left:.3f} de chaque cote (zone sure : > 0.040)")
if left < 0.040:
    fail.append(f"cartouche trop large : marge laterale {left:.3f}")

# --- audio : present et propre, ou volontairement absent -------------------
probe = subprocess.run(
    [FF, "-hide_banner", "-i", OUT], capture_output=True, text=True).stderr
has_audio = "Audio:" in probe
if not AUDIO:
    print(f"audio               : aucune piste demandee -> "
          f"{'absente, conforme' if not has_audio else 'PRESENTE alors qu elle ne devrait pas'}")
    if has_audio:
        fail.append("une piste audio subsiste alors que AUDIO = False")
else:
    if not has_audio:
        fail.append("piste audio absente")
    else:
        raw = subprocess.run(
            [FF, "-hide_banner", "-loglevel", "error", "-i", OUT, "-vn",
             "-ac", "1", "-ar", "48000", "-f", "s16le", "-"],
            capture_output=True, check=True).stdout
        a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
        win = 24000
        rms = np.array([np.sqrt((a[i:i + win] ** 2).mean())
                        for i in range(0, len(a) - win, win)])
        quiet = int((rms[:-2] < 0.01).sum())     # on exclut le fondu de sortie
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
