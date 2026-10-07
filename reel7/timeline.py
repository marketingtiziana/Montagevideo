# Source -> output timeline: words_cut.json (every kept word with output time) + text by sentence
import json
C = json.load(open("cuts.json")); keep = C["keep"]
W = [w for s in json.load(open("transcript.json"))["segments"] for w in s["words"]]
def to_out(t):
    acc = 0.0
    for a, b in keep:
        if a - 1e-3 <= t <= b + 1e-3: return round(acc + min(max(t, a), b) - a, 3)
        acc += b - a
    return None
out = []
for w in W:
    # whisper starts often absorb the preceding silence: a word is kept when its END lies in a kept span
    span = next(((a, b) for a, b in keep if a + 0.03 < w["e"] <= b + 0.05), None)
    if span:
        s, e = to_out(max(w["s"], span[0])), to_out(min(w["e"], span[1]))
        out.append({"w": w["w"], "s": s, "e": e, "src": w["s"], "p": w["p"]})
json.dump(out, open("words_cut.json", "w"), ensure_ascii=False, indent=0)
line, t0 = [], None
for w in out:
    if t0 is None: t0 = w["s"]
    line.append(w["w"])
    if w["w"][-1:] in ".?!":
        print(f"{t0:6.2f}  " + " ".join(line).replace(" '", "'")); line, t0 = [], None
if line: print(f"{t0:6.2f}  " + " ".join(line))
