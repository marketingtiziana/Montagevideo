# Smooth face track on the SOURCE timeline (4 samples/s) -> face_track.json
# eye/nose/box per sample + 250 ms "free zone" (side opposite the face, outside eyes/mouth).
import json, numpy as np
R = json.load(open("faces_raw.json")); S = [s for s in R["samples"] if s["box"]]
t = np.array([s["t"] for s in S])
def sm(a, k=3):   # centred moving average over k samples (0.75 s), no lag
    a = np.asarray(a, float); p = k // 2; ap = np.pad(a, ((p, p),) + ((0, 0),) * (a.ndim - 1), mode="edge")
    return np.stack([ap[i:i + len(a)] for i in range(k)]).mean(0)
eye, box = sm([s["eye"] for s in S]), sm([s["box"] for s in S])
out = []
for i, s in enumerate(S):
    cx = (box[i][0] + box[i][2]) / 2
    side = "right" if cx < 540 else "left"           # free side = opposite the face
    out.append({"t": s["t"], "eye": [round(v) for v in eye[i]], "box": [round(v) for v in box[i]], "cx": round(cx),
                "mouth": s["mouth"], "nose": s["nose"], "yaw": s["yaw"], "open": s["open"],
                "free": {"side": side, "y": [max(800, round(box[i][3]) + 40), 1570]}})
json.dump({"w": R["w"], "h": R["h"], "samples": out}, open("face_track.json", "w"), indent=0)
print(len(out), "samples; cx range", min(o["cx"] for o in out), max(o["cx"] for o in out), "; chin max", max(o["box"][3] for o in out))
