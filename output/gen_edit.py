# Builds edit.js (Higgsedit) from transcript.json + cuts.json.
# All times below are SOURCE seconds; they are remapped to the jump-cut timeline here.
import json, re
from prep import remap, keep

FPS = 30
DUR = round(sum(e - s for s, e in keep), 3)           # speech timeline length
CTA = 2.0
PAL = {"bg": "#0F0F12", "fg": "#FFFFFF", "accent": "#F2B544"}

words = json.load(open("transcript.json"))["words"]
for w in words:
    w["t0"], w["t1"] = remap(w["s"]), remap(w["e"])

# ---------- captions: 3-5 words, break on punctuation / pauses ----------
TITLE_END = 3.0
CAP_OFFSET = 0.06
cap_words = [w for w in words if w["t0"] >= 3.9]      # hook title owns everything before "par-ci"
groups, cur = [], []
for i, w in enumerate(cap_words):
    cur.append(w)
    nxt = cap_words[i + 1] if i + 1 < len(cap_words) else None
    chars = sum(len(x["w"]) + 1 for x in cur)
    brk = (nxt is None or len(cur) >= 5
           or re.search(r"[.?!]$", w["w"])
           or (w["w"].endswith(",") and len(cur) >= 2)
           or (nxt and chars + len(nxt["w"]) > 22)
           or (nxt and nxt["t0"] - w["t1"] > 0.35 and len(cur) >= 2)
           or (nxt and nxt["w"].lower() in ("parce", "mais", "et", "comment", "qu'on") and len(cur) >= 2))
    if brk:
        groups.append(cur); cur = []
caps = []
for gi, g in enumerate(groups):
    start = g[0]["t0"]
    nxt = groups[gi + 1][0]["t0"] if gi + 1 < len(groups) else DUR
    end = min(nxt, g[-1]["t1"] + 0.45)
    toks = []
    for k, w in enumerate(g):
        txt = re.sub(r"[,.]$", "", w["w"])
        on = w["t0"] - start
        off = (g[k + 1]["t0"] if k + 1 < len(g) else w["t1"]) - start
        toks.append({"t": txt, "on": round(on, 3), "off": round(max(off, on + 0.1), 3)})
    at = start + CAP_OFFSET                           # measured: voice lands ~70 ms after the word onset
    caps.append({"at": round(at, 3), "dur": round(min(end + CAP_OFFSET, DUR) - at, 3), "w": toks})

# ---------- camera: punch-ins + zoom-whips ----------
cuts = []
acc = 0.0
for s, e in keep[:-1]:
    acc += e - s; cuts.append(round(acc, 3))
WHIPS = [remap(t) for t in (8.94, 25.32, 33.72, 44.92)]
PUNCH = [remap(t) for t in (18.76, 42.30, 48.64)]           # 2.28 is under the kinetic hook, 31.46 under the rings B-roll
WH = 3 / FPS                                          # 6 frames total: 3 in, 3 out
keys = [(0.0, 1.0, "linear")]
events = sorted([(t, "p") for t in PUNCH] + [(t, "w") for t in WHIPS])
for t, kind in events:
    if kind == "p":
        keys += [(t, 1.0, "ease-out"), (t + 0.25, 1.08, "hold")]
        stop = min([c for c in cuts if c > t + 0.3] + [w - WH for w in WHIPS if w > t] + [DUR])
        keys += [(stop - 1 / FPS, 1.08, "hold"), (stop, 1.0, "linear")] if stop - WH > t + 0.3 else []
    else:
        prev = keys[-1][1] if keys[-1][0] < t - WH else 1.0
        keys += [(t - WH, prev, "ease-in"), (t, 1.18, "ease-out"), (t + WH, 1.0, "linear")]
keys.sort(key=lambda k: k[0])
clean = []
for k in keys:
    if clean and k[0] <= clean[-1][0] + 1e-3:
        clean[-1] = k
    else:
        clean.append(k)
keys = [(round(t, 3), v, e) for t, v, e in clean]
chunks, a = [], 0.0
for w in WHIPS:
    chunks.append((a, w - WH, False)); chunks.append((w - WH, w + WH, True)); a = w + WH
chunks.append((a, DUR, False))

def val(t):
    prev = keys[0]
    for k in keys:
        if k[0] > t:
            if prev[2] == "hold":
                return prev[1]
            f = (t - prev[0]) / (k[0] - prev[0]); return prev[1] + (k[1] - prev[1]) * f
        prev = k
    return prev[1]

# B-roll cutaways replace the footage track over their span (one clip per track instant in Higgsedit)
BROLL_SPANS = [(round(remap(13.32) - 0.15, 3), round(remap(15.90) - 0.15, 3)), (round(remap(29.46) - 0.15, 3), round(remap(33.72) - 0.1 - 3 / FPS, 3))]
split = []
for a, b, blur in chunks:
    pieces = [(a, b)]
    for s0, s1 in BROLL_SPANS:
        nxt = []
        for x, y in pieces:
            if s1 <= x or s0 >= y: nxt.append((x, y)); continue
            if x < s0: nxt.append((x, s0))
            if s1 < y: nxt.append((s1, y))
        pieces = nxt
    split += [(x, y, blur) for x, y in pieces if y - x > 1e-3]
chunks = split

chunk_data = []
for a, b, blur in chunks:
    ks = [{"at": 0, "value": round(val(a), 4), "easing": "linear"}]
    for t, v, e in keys:
        if a + 1e-3 < t < b - 1e-3:
            ks.append({"at": round(t - a, 3), "value": v, "easing": e})
    ks.append({"at": round(b - a - 0.001, 3), "value": round(val(b), 4)})
    chunk_data.append({"a": round(a, 3), "b": round(b, 3), "blur": blur, "k": ks})

# ---------- overlays (one graphic at a time) ----------
R = remap
cards = [
    {"at": R(9.86), "dur": 2.2, "icon": None, "parts": [["COLLABORER", "fg"], [" ≠ ", "accent"], ["S'ASSOCIER", "fg"]]},
    {"at": R(15.90), "dur": 2.4, "icon": "user", "parts": [["PEUR D'ÊTRE ", "fg"], ["SEUL", "accent"]]},
    {"at": R(26.70), "dur": 2.5, "icon": "gem", "parts": [["S'ASSOCIER = ", "fg"], ["UN MARIAGE", "accent"]]},
    {"at": R(46.54), "dur": 2.2, "icon": "eye", "parts": [["PAS AU ", "fg"], ["1ER COUP D'ŒIL", "accent"]]},
]
curve = {"at": R(22.76), "end": R(24.98) + 0.3}
# Module C — checklist mockup (idée 4): starts 150 ms before « tester », one tick per spoken step
checklist = {"at": round(R(34.38) - 0.15, 3), "ticks": [R(34.38), R(35.46), R(37.96), R(38.92), R(43.10)], "end": round(R(44.74) + 0.3, 3)}
# Module B — Pexels B-roll cutaways (in 150 ms before the trigger word, hard cut back to the face)
broll = [{"file": f, "at": a, "end": b} for f, (a, b) in zip(["idee1_partners.mp4", "idee3_rings.mp4"], BROLL_SPANS)]
# Module C — kinetic hook: one word group per beat, 150 ms ahead of the voice
hook = {"end": 3.6, "words": [["S'IL VOUS PLAÎT", 0.0, "fg"], ["ARRÊTEZ", round(R(2.28) - 0.15, 3), "accent"],
                             ["DE VOUS", round(R(3.40) - 0.15, 3), "fg"], ["ASSOCIER", round(R(4.34) - 0.15, 3), "fg"]]}
title = {"arr": R(2.28), "dva": R(3.40), "end": TITLE_END}

data = {"DUR": DUR, "CTA": CTA, "PAL": PAL, "caps": caps, "chunks": chunk_data, "cards": cards,
        "curve": curve, "checklist": checklist, "broll": broll, "hook": hook, "title": title,
        "sheet": [1.6, R(9.86) + 0.8, R(23.6), R(27.2), R(35.9), R(43.4), DUR + 1.0],
        "busy": [R(35.9), R(43.4), R(46.9)]}
tpl = open("edit.template.js").read()
open("edit.js", "w").write(tpl.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":"))))
json.dump(data, open("timeline.json", "w"), ensure_ascii=False, indent=1)
print("DUR", DUR, "caps", len(caps), "chunks", len(chunks), "keys", len(keys))
for c in caps: print(f'{c["at"]:6.2f} {c["dur"]:4.2f}', " ".join(t["t"] for t in c["w"]))
