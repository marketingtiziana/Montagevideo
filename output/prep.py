# Étape 2 — son + jump cuts. Source timeline -> cut timeline (frame-exact, 30 fps).
import json, subprocess, re
FPS = 30
SIL = [(0.0,0.912),(2.701,3.416),(5.923,6.327),(11.294,11.730),(14.578,14.999),(19.138,19.592),
       (29.945,30.757),(31.863,32.325),(33.133,33.670),(41.609,42.121),(47.418,47.876)]
START, END, PAD = 0.80, 49.46, 0.06           # 120 ms of breath kept around each cut
fr = lambda t: round(t * FPS) / FPS
keep, t = [], START
for s, e in SIL[1:]:
    keep.append((fr(t), fr(s + PAD))); t = e - PAD
keep.append((fr(t), fr(END)))
def remap(x):
    acc = 0.0
    for s, e in keep:
        if x < s: return round(acc, 3)
        if x <= e: return round(acc + x - s, 3)
        acc += e - s
    return round(acc, 3)
if __name__ == "__main__":
    total = sum(e - s for s, e in keep)
    json.dump({"fps": FPS, "keep": keep, "duration": round(total, 3)}, open("cuts.json", "w"), indent=1)
    print("segments", len(keep), "duration", round(total, 3))
