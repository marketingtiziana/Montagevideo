# -*- coding: utf-8 -*-
"""Dimensions et duree reelles de la source, lues une seule fois.

Chaque etape en a besoin ; les recalculer separement les ferait diverger
(une video iPhone est souvent a cadence variable, 29,64 i/s ici et non 30).
"""
import os, sys
import cv2

sys.path.insert(0, "reel_broll")
from config import SRC, DURATION, FPS

VIDEO_EXT = (".mp4", ".mov", ".m4v", ".avi", ".mkv")
IS_VIDEO = os.path.splitext(SRC)[1].lower() in VIDEO_EXT


def probe():
    """(largeur, hauteur, i/s, nb_images, duree) de la source."""
    if not IS_VIDEO:
        img = cv2.imread(SRC)
        if img is None:
            raise SystemExit(f"source introuvable : {SRC}")
        h, w = img.shape[:2]
        return w, h, FPS, 0, 0.0
    cap = cv2.VideoCapture(SRC)
    w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS) or FPS
    n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    cap.release()
    return w, h, fps, n, n / fps


SRC_W, SRC_H, SRC_FPS, SRC_FRAMES, SRC_DUR = probe()

# DURATION = 0 : on prend toute la source. Fixer une valeur a la main couperait
# quelques images sur un rush dont la cadence n'est pas ronde.
TOTAL = DURATION if DURATION > 0 else (SRC_DUR if IS_VIDEO else 10.0)
