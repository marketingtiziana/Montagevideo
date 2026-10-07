# Face track (mediapipe FaceLandmarker) every STEP s on the SOURCE timeline -> faces_raw.json
# Per sample: face box, eye centre, mouth box (pixels, 1080x1920 source frame), nose tip,
# yaw proxy (nose offset from the eye midline / eye distance) and eye openness (blink detection).
import json, sys, cv2, numpy as np
import mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision

SRC, STEP = sys.argv[1], float(sys.argv[2]) if len(sys.argv) > 2 else 0.5
opts = vision.FaceLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path="models/face_landmarker.task"),
                                    running_mode=vision.RunningMode.IMAGE, num_faces=1)
det = vision.FaceLandmarker.create_from_options(opts)
cap = cv2.VideoCapture(SRC)
fps = cap.get(cv2.CAP_PROP_FPS); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
W, H = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
EYES = [33, 133, 362, 263]; MOUTH = [61, 291, 13, 14, 0, 17]; NOSE = 1
LID = [(159, 145, 33, 133), (386, 374, 362, 263)]   # upper lid, lower lid, eye corners (left, right eye)
out, t = [], 0.0
while t < n / fps:
    cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(t * fps)))
    ok, fr = cap.read()
    if not ok: break
    r = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)))
    if r.face_landmarks:
        L = np.array([(p.x * W, p.y * H) for p in r.face_landmarks[0]])
        e, m = L[EYES], L[MOUTH]
        out.append({"t": round(t, 2), "box": [round(v) for v in (*L.min(0), *L.max(0))],
                    "eye": [round(v) for v in e.mean(0)], "mouth": [round(v) for v in (*m.min(0), *m.max(0))],
                    "nose": [round(v) for v in L[NOSE]],
                    "yaw": round(float((L[NOSE][0] - e.mean(0)[0]) / (np.linalg.norm(L[263] - L[33]) + 1e-6)), 3),
                    "open": round(float(np.mean([np.linalg.norm(L[a] - L[b]) / (np.linalg.norm(L[c] - L[d]) + 1e-6) for a, b, c, d in LID])), 3)})
    else:
        out.append({"t": round(t, 2), "box": None})
    t += STEP
json.dump({"w": W, "h": H, "fps": fps, "step": STEP, "samples": out}, open("faces_raw.json", "w"), indent=0)
print(len(out), "samples,", sum(1 for s in out if s["box"]), "with face")
