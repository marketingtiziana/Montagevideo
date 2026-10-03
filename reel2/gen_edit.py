# Reel 2 — builds edit.jsx (Higgsedit) from whisper_raw.json + cuts.json + face_track.json.
# Every time written into edit.jsx is on the jump-cut timeline (media/cut.mp4).
import json, re, math
from prep import remap, DUR

FPS = 30
END_CARD = 2.0
CAP_OFFSET = 0.02            # draft QA: +0.06 gave a +37 ms bias vs the re-transcribed voice on this reel
ANTICIP = 0.15               # stage effects start 150 ms before their trigger word

# ---------- words: merge apostrophe tokens, remap, apply the validated corrections ----------
raw = [w for s in json.load(open("whisper_raw.json")) for w in s["words"]]
words = []
for w in raw:
    t = w["w"].strip()
    if words and (t.startswith("'") or t.startswith("-") or words[-1]["w"].endswith("'")):
        words[-1]["w"] += t; words[-1]["e"] = w["e"]; continue
    words.append({"w": t, "s": w["s"], "e": w["e"]})
FIX = {"maire.": "mère-fille.", "d'Au-dessus,": "du dessus,", "ses": "ces"}
for w in words:
    w["w"] = FIX.get(w["w"], w["w"])
    w["t0"], w["t1"] = remap(w["s"]), remap(w["e"])

# Display tokens: numbers + unit read as one token (« 100 000 € », « 30 % »)
disp = []
i = 0
while i < len(words):
    w = words[i]; txt = w["w"]; t0, t1 = w["t0"], w["t1"]; j = i + 1
    if re.fullmatch(r"\d+", txt):
        while j < len(words) and re.fullmatch(r"(000|%|euros)[,.]?", words[j]["w"]):
            txt += " " + words[j]["w"]; t1 = words[j]["t1"]; j += 1
    txt = re.sub(r"euros", "€", txt)
    txt = re.sub(r"(\d)%", r"\1 %", txt)
    disp.append({"w": txt, "t0": t0, "t1": t1}); i = j

# ---------- captions: 3–5 words on ONE line (<= 900 px at 58 px ExtraBold) ----------
from PIL import ImageFont
FONT = ImageFont.truetype("../output/mockups/typo/Montserrat-wght.ttf", 58)
try:
    FONT.set_variation_by_axes([800])
except Exception:
    pass
def width(s):
    return FONT.getlength(s) * 1.06 + 10
# split into phrases (punctuation / pauses > 0.35 s), then balanced chunks of <= 5 words that fit one line
phrases, cur = [], []
for k, w in enumerate(disp):
    cur.append(w)
    nxt = disp[k + 1] if k + 1 < len(disp) else None
    if nxt is None or re.search(r"[.,?!]$", w["w"]) or nxt["t0"] - w["t1"] > 0.35:
        phrases.append(cur); cur = []
merged = []
for ph in phrases:                                   # glue very short phrases to the next one when it fits
    if merged and len(merged[-1]) <= 2 and not re.search(r"[.?!]$", merged[-1][-1]["w"]) and len(merged[-1]) + len(ph) <= 5 and width(" ".join(x["w"] for x in merged[-1] + ph)) <= 880 \
            and ph[0]["t0"] - merged[-1][-1]["t1"] < 0.35:
        merged[-1] = merged[-1] + ph
    else:
        merged.append(ph)
groups = []
for ph in merged:
    n = -(-len(ph) // 5)
    while True:
        size = -(-len(ph) // n)
        chunks = [ph[i:i + size] for i in range(0, len(ph), size)]
        if all(width(" ".join(x["w"] for x in c)) <= 880 for c in chunks): break
        n += 1
    groups += chunks
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
    at = start + CAP_OFFSET
    caps.append({"at": round(at, 3), "dur": round(min(end + CAP_OFFSET, DUR) - at, 3), "w": toks})

# ---------- Zone A: 154 % crop, smoothed face track, punch-ins 100 -> 106 %, 2 px micro-pulses ----------
S0 = 1.54
track = json.load(open("face_track.json"))
def interp(t, key):
    if t <= track[0]["t"]: return track[0][key]
    for a, b in zip(track, track[1:]):
        if a["t"] <= t <= b["t"]:
            f = (t - a["t"]) / (b["t"] - a["t"]); return a[key] + (b[key] - a[key]) * f
    return track[-1][key]
PUNCH = [0.98, 6.89, 12.71, 19.37, 25.03, 39.36, 43.99, 49.37]
IMPACTS = [6.89, 25.03, 39.36]
def punch(t):
    k = 1.0
    for p in PUNCH:
        a = p - 0.08                           # lands with the word
        if a <= t < a + 0.25: k = max(k, 1 + 0.06 * (1 - (1 - (t - a) / 0.25) ** 3))
        elif a + 0.25 <= t < a + 1.6: k = max(k, 1.06)
        elif a + 1.6 <= t < a + 2.2: k = max(k, 1.06 - 0.06 * ((t - a - 1.6) / 0.6) ** 2)
    return k
def pulse(t):
    for p in IMPACTS:
        d = t - (p - ANTICIP)
        if 0 <= d < 0.2: return -2 * math.sin(math.pi * d / 0.2)
    return 0.0
TOTAL = DUR
ks = sorted(set([round(i / 10, 2) for i in range(int(TOTAL * 10) + 1)] +
                [round(p - 0.08 + d, 3) for p in PUNCH for d in (0, 0.05, 0.1, 0.15, 0.25, 1.6, 1.8, 2.0, 2.2)] +
                [round(p - ANTICIP + d, 3) for p in IMPACTS for d in (0, 0.05, 0.1, 0.15, 0.2)]))
ks = [t for t in ks if 0 <= t <= TOTAL - 0.002]
zone = {"S0": S0, "scale": [], "x": [], "y": []}
eyes = []
for t in ks:
    k = punch(t); cx, ey = interp(t, "cx"), interp(t, "eye")
    ox = -(cx - 540) * S0 * k
    oy = -(ey - 518) * S0 * k
    oy = min(oy, 797.7 * k - 300 - 2)          # never uncover the top edge (eyes then sit a little higher)
    oy += pulse(t)
    zone["scale"].append([t, round(k, 4)]); zone["x"].append([t, round(ox, 1)]); zone["y"].append([t, round(oy, 1)])
    eyes.append(300 + (ey - 518) * S0 * k + oy)
zone["eyeY"] = [round(min(eyes), 1), round(max(eyes), 1)]
def simplify(pts, tol):                       # drop keys that linear interpolation reproduces within tol
    out = [pts[0]]
    i = 0
    while i < len(pts) - 1:
        j = i + 2
        while j < len(pts):
            (t0, v0), (t1, v1) = pts[i], pts[j]
            if any(abs(v0 + (v1 - v0) * (pts[m][0] - t0) / (t1 - t0) - pts[m][1]) > tol for m in range(i + 1, j)): break
            j += 1
        i = j - 1; out.append(pts[i])
    return out
zone["scale"] = simplify(zone["scale"], 0.0015); zone["x"] = simplify(zone["x"], 0.6); zone["y"] = simplify(zone["y"], 0.6)
print("zone keys after simplify", len(zone["scale"]), len(zone["x"]), len(zone["y"]))

data = {"DUR": DUR, "END": END_CARD, "caps": caps, "zone": zone,
        "sheet": [0.5, 2.6, 5.9, 8.9, 12.9, 14.9, 18.0, 21.9, 25.2, 27.6, 33.9, 36.6, 39.8, 44.3, 48.3, 49.6, DUR + 1.0]}
tpl = open("edit.template.jsx").read()
open("edit.jsx", "w").write(tpl.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":"))))
json.dump({"words": [{k: w[k] for k in ("w", "t0", "t1")} for w in words], "caps": caps}, open("timeline.json", "w"), ensure_ascii=False, indent=1)
print("DUR", DUR, "caps", len(caps), "zone keys", len(ks), "eye y range", zone["eyeY"])
for c in caps: print(f'{c["at"]:6.2f} {c["dur"]:4.2f}', " | ".join(t["t"] for t in c["w"]))
