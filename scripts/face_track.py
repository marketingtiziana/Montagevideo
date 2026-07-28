#!/usr/bin/env python3
# Detection de visage YuNet sur public/base_cut.mp4, 1 frame sur 3, interpolation.
# Sortie data/face_track.json : par frame {cx, cy, w} normalise [0,1].
import cv2, json, bisect

SRC = "public/base_cut.mp4"
MODEL = "models/face_detection_yunet.onnx"
cap = cv2.VideoCapture(SRC)
W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
N = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
det = cv2.FaceDetectorYN_create(MODEL, "", (W, H), 0.6, 0.3, 5000)
det.setInputSize((W, H))
print(f"src {W}x{H} {N}f")

STEP = 3
raw = {}
last = None
i = 0
while True:
    ok, frame = cap.read()
    if not ok:
        break
    if i % STEP == 0:
        _, faces = det.detect(frame)
        if faces is not None and len(faces):
            x, y, w, h = faces[0][:4]  # meilleur score en premier
            cx, cy = x + w / 2, y + h / 2
            if last and abs(cx - last[0]) > 0.20 * W:
                cx, cy, w = last
            raw[i] = (float(cx), float(cy), float(w)); last = raw[i]
        elif last:
            raw[i] = last
    i += 1
cap.release()

if not raw:
    raise SystemExit("aucun visage detecte")
keys = sorted(raw)
track = []
for f in range(N):
    if f <= keys[0]:
        v = raw[keys[0]]
    elif f >= keys[-1]:
        v = raw[keys[-1]]
    else:
        j = bisect.bisect_right(keys, f)
        a, b = keys[j - 1], keys[j]
        t = (f - a) / (b - a)
        va, vb = raw[a], raw[b]
        v = tuple(va[k] + (vb[k] - va[k]) * t for k in range(3))
    track.append({"cx": v[0] / W, "cy": v[1] / H, "w": v[2] / W})

json.dump({"w": W, "h": H, "n": N, "track": track}, open("data/face_track.json", "w"))
import statistics as st
print(f"detections {len(raw)}/{N//STEP} | cx~{st.median(t['cx'] for t in track):.3f} "
      f"cy~{st.median(t['cy'] for t in track):.3f} w~{st.median(t['w'] for t in track):.3f}")
