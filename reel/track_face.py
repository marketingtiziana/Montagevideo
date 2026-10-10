# -*- coding: utf-8 -*-
"""Detecte et lisse la position du visage sur toute la source -> face_track.json.

La video est un selfie filme en marchant : le visage traverse le cadre. Les
punch-ins doivent donc suivre le visage, sinon un zoom le decadre. On stocke,
pour chaque image, le centre du visage et sa taille, en coordonnees normalisees.
"""
import json, sys
import cv2

SRC = "source.mp4"
OUT = "face_track.json"
DET_W, DET_H = 360, 640          # detection sur image reduite (rapide, suffisant)

cap = cv2.VideoCapture(SRC)
W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
FPS = cap.get(cv2.CAP_PROP_FPS)
N = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
print(f"source {W}x{H} @ {FPS:.3f} fps, {N} images")

det = cv2.FaceDetectorYN.create("models/yunet.onnx", "", (DET_W, DET_H),
                                score_threshold=0.6, nms_threshold=0.3, top_k=50)

raw = []            # (cx, cy, w, h) normalises, ou None
i = 0
while True:
    ok, frame = cap.read()
    if not ok:
        break
    small = cv2.resize(frame, (DET_W, DET_H))
    _, faces = det.detect(small)
    best = None
    if faces is not None and len(faces):
        # le sujet est le plus grand visage detecte
        f = max(faces, key=lambda f: f[2] * f[3])
        x, y, w, h, score = f[0], f[1], f[2], f[3], f[14]
        if score > 0.6 and w > 20:
            best = (float(x + w / 2) / DET_W, float(y + h / 2) / DET_H,
                    float(w) / DET_W, float(h) / DET_H)
    raw.append(best)
    i += 1
    if i % 300 == 0:
        print(f"  {i}/{N}", flush=True)
cap.release()

found = sum(1 for r in raw if r)
print(f"visage detecte sur {found}/{len(raw)} images ({100*found/len(raw):.1f}%)")

# --- comblement des trous : on interpole entre les detections valides ---
idx = [i for i, r in enumerate(raw) if r]
if not idx:
    sys.exit("aucun visage detecte")
filled = []
for i in range(len(raw)):
    if raw[i]:
        filled.append(list(raw[i]))
        continue
    prev = max([j for j in idx if j < i], default=None)
    nxt = min([j for j in idx if j > i], default=None)
    if prev is None:
        filled.append(list(raw[nxt]))
    elif nxt is None:
        filled.append(list(raw[prev]))
    else:
        t = (i - prev) / (nxt - prev)
        filled.append([raw[prev][k] + t * (raw[nxt][k] - raw[prev][k]) for k in range(4)])

# --- lissage fort : la camera virtuelle doit glisser, pas trembler ---
def smooth(vals, win):
    n = len(vals)
    out = []
    for i in range(n):
        a, b = max(0, i - win), min(n, i + win + 1)
        seg = vals[a:b]
        out.append(sum(seg) / len(seg))
    return out

WIN = 22                                   # ~1.5 s de part et d'autre
cols = [[f[k] for f in filled] for k in range(4)]
sm = [smooth(c, WIN) for c in cols]
track = [{"cx": round(sm[0][i], 5), "cy": round(sm[1][i], 5),
          "fw": round(sm[2][i], 5), "fh": round(sm[3][i], 5)} for i in range(len(filled))]

json.dump({"w": W, "h": H, "fps": float(FPS), "n": len(track), "track": track},
          open(OUT, "w"))
print("->", OUT)
