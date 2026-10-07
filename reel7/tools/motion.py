# Motion energy per frame (opencv Farneback optical flow on a 270x480 proxy) -> motion.json
# energy = mean flow magnitude over the frame, in source pixels per frame (x4 the proxy scale).
# Used to place cuts only where the body is still.
import json, sys, cv2, numpy as np
cap = cv2.VideoCapture(sys.argv[1]); fps = cap.get(cv2.CAP_PROP_FPS)
prev, e = None, []
while True:
    ok, fr = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(fr, (270, 480), interpolation=cv2.INTER_AREA), cv2.COLOR_BGR2GRAY)
    if prev is None: e.append(0.0)
    else:
        f = cv2.calcOpticalFlowFarneback(prev, g, None, 0.5, 3, 15, 3, 5, 1.2, 0)
        e.append(round(float(np.linalg.norm(f, axis=2).mean() * 4), 3))
    prev = g
a = np.array(e)
json.dump({"fps": fps, "unit": "source px / frame", "p50": round(float(np.median(a)), 3), "p90": round(float(np.percentile(a, 90)), 3),
           "energy": e}, open("motion.json", "w"))
print(len(e), "frames, median", np.median(a), "p90", np.percentile(a, 90))
