# Reel 5 — jump cuts (source seconds, frame-snapped to 30 fps) + remap source -> cut timeline + words on the cut timeline.
# Silences: ffmpeg silencedetect -32 dB, >= 0.28 s (silences.txt); 100 ms of breath kept each side.
# DROP: optional sentence removed to stay under 60 s (« Et c'est toujours la même chose. », source 6.78 -> 9.32).
import json, os
FPS, PAD, END = 30, 0.10, 64.93
DROP = [(6.78, 9.32)] if os.environ.get("KEEP_ALL") is None else []
fr = lambda t: round(t * FPS) / FPS
S = [tuple(map(float, l.split())) for l in open("silences.txt")]
rm = sorted([(a + PAD, b - PAD) for a, b in S if b - a > 2 * PAD] + DROP)
merged = []
for a, b in rm:
    if merged and a <= merged[-1][1]: merged[-1] = (merged[-1][0], max(b, merged[-1][1]))
    else: merged.append((a, b))
keep, t = [], 0.0
for a, b in merged:
    if a > t: keep.append((fr(t), fr(a)))
    t = max(t, b)
keep.append((fr(t), fr(END)))
def remap(x):
    acc = 0.0
    for s, e in keep:
        if x < s: return None if acc == 0 and s > 0 else round(acc, 3)   # inside a removed gap -> start of next segment
        if x <= e: return round(acc + x - s, 3)
        acc += e - s
    return round(acc, 3)
DUR = round(sum(e - s for s, e in keep), 3)
FIX = {"fils": "fisc,", "que": "lui,"}   # « le fils que le voit » -> « le fisc, lui, le voit » (53.0 s)
if __name__ == "__main__":
    T = json.load(open("transcript.json"))
    words = []
    for sg in T["segments"]:
        for w in sg["words"]:
            if DROP and 6.68 <= w["s"] < 8.6: continue   # words of the dropped sentence
            txt = FIX.get(w["w"], w["w"]) if 51.8 < w["s"] < 53.7 else w["w"]
            if words and (txt[:1] in "'-" or txt in "?!"): words[-1]["w"] += txt; words[-1]["e"] = remap(w["e"]); continue   # whisper splits « t'apprend », « là-bas »
            words.append({"w": txt, "s": remap(max(w["s"], 9.36) if 8.6 <= w["s"] < 9.36 else w["s"]), "e": remap(w["e"]), "src": w["s"]})
    json.dump({"fps": FPS, "keep": keep, "duration": DUR}, open("cuts.json", "w"), indent=1)
    json.dump(words, open("words_cut.json", "w"), ensure_ascii=False, indent=0)
    print("segments", len(keep), "speech", DUR, "s")
