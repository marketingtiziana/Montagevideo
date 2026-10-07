# Face track on the jump-cut timeline from faces_yunet.json (YuNet eye landmarks, 10 samples/s, source time).
# Gaussian low-pass (sigma 0.25 s) inside each kept segment only: the frame follows the head smoothly within a shot,
# and re-frames exactly on the jump cuts, where the picture already jumps (no smoothing across cuts).
import json, numpy as np, sys
sys.path.insert(0, ".")
from prep import keep, DUR
SIG = 0.25
yn = np.array(json.load(open("faces_yunet.json")))
t, cx, ey = yn[:, 0], yn[:, 1], yn[:, 2]
def smooth_at(x, lo, hi, v):
    m = (t >= lo - 0.05) & (t <= hi + 0.05)
    if m.sum() < 2: m = np.abs(t - x) < 0.6
    w = np.exp(-0.5 * ((t[m] - x) / SIG) ** 2); return float(np.sum(w * v[m]) / np.sum(w))
out, acc = [], 0.0
for s, e in keep:
    n = max(2, int(round((e - s) / 0.1)) + 1)
    for j, ts in enumerate(np.linspace(s, e, n)):
        tc = acc + (ts - s)
        if j == n - 1: tc -= 0.001                     # last key of a segment sits 1 ms before the cut
        out.append({"t": round(tc, 3), "cx": round(smooth_at(ts, s, e, cx), 1), "eye": round(smooth_at(ts, s, e, ey), 1)})
    acc += e - s
json.dump(out, open("face_track.json", "w"))
c = [o["cx"] for o in out]; ee = [o["eye"] for o in out]
print(len(out), "keys  cx", min(c), max(c), " eye", min(ee), max(ee))
