# faces_raw.json (source timeline, 0.5 s) -> face_track.json on the CUT timeline:
# low-passed face centre + box per 0.5 s, and the free zone per second (band below the chin, out of the 250 px top / 350 px bottom margins).
import json, numpy as np, sys
sys.path.insert(0, "."); from prep import remap, keep
R = json.load(open("faces_raw.json")); S = [s for s in R["samples"] if s["box"]]
t = np.array([s["t"] for s in S]); box = np.array([s["box"] for s in S], float)
eye = np.array([s["eye"] for s in S], float); mouth = np.array([s["mouth"] for s in S], float)
def lp(x, sig=0.6):   # gaussian low-pass over time (seconds)
    w = np.exp(-0.5 * ((t[:, None] - t[None, :]) / sig) ** 2); w /= w.sum(1, keepdims=True); return w @ x
box_s, eye_s, mouth_s = lp(box), lp(eye), lp(mouth)
out = []
for i, ts in enumerate(t):
    if not any(a <= ts <= b for a, b in keep): continue
    out.append({"t": remap(ts), "src": ts, "cx": round((box_s[i, 0] + box_s[i, 2]) / 2), "box": [round(v) for v in box_s[i]],
                "eye": [round(v) for v in eye_s[i]], "mouth": [round(v) for v in mouth_s[i]]})
# free zone: from chin + 40 px down to 1920-350; x full width minus 60 px gutters
free = []
for sec in range(int(max(o["t"] for o in out)) + 1):
    near = [o for o in out if sec <= o["t"] < sec + 1] or [min(out, key=lambda o: abs(o["t"] - sec))]
    chin = max(o["box"][3] for o in near)
    free.append({"t": sec, "x": [60, 1020], "y": [int(chin + 40), 1570]})
json.dump({"samples": out, "free_zone": free}, open("face_track.json", "w"), indent=0)
ch = [f["y"][0] for f in free]
print("samples", len(out), "free zone top y: min", min(ch), "max", max(ch), "median", int(np.median(ch)))
