# Reel 2 — jump cuts (source seconds, frame-snapped to 30 fps) + remap source -> cut timeline.
import json
FPS = 30
GAPS = [(4.22, 4.70), (6.88, 7.56), (13.14, 14.08), (37.64, 38.22), (45.06, 45.52)]   # Whisper pauses >= 0.45 s
PAD, START, END = 0.12, 0.0, 51.80
fr = lambda t: round(t * FPS) / FPS
keep, t = [], START
for a, b in GAPS:
    keep.append((fr(t), fr(a + PAD))); t = b - PAD
keep.append((fr(t), fr(END)))
def remap(x):
    acc = 0.0
    for s, e in keep:
        if x < s: return round(acc, 3)
        if x <= e: return round(acc + x - s, 3)
        acc += e - s
    return round(acc, 3)
DUR = round(sum(e - s for s, e in keep), 3)
if __name__ == "__main__":
    json.dump({"fps": FPS, "keep": keep, "duration": DUR}, open("cuts.json", "w"), indent=1)
    print("segments", len(keep), "speech", DUR, "s")
