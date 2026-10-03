# Reel 5 — builds edit.jsx (Higgsedit) from words_cut.json + cuts.json + face_track.json.
# Every time written into edit.jsx is on the jump-cut timeline (media/cut.mp4).
import json, re, math
from prep import DUR

FPS = 30
END_CARD = 2.0
CAP_OFFSET = 0.02            # draft QA: +0.06 gave a +37 ms bias vs the re-transcribed voice on this reel
ANTICIP = 0.15               # stage effects start 150 ms before their trigger word

# ---------- words: already remapped to the cut timeline by prep.py (validated corrections included) ----------
words = [{"w": w["w"], "t0": w["s"], "t1": w["e"]} for w in json.load(open("words_cut.json"))]
for w in words:
    w["w"] = w["w"].replace("?", " ?") if w["w"].endswith("?") and not w["w"].endswith(" ?") else w["w"]

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

# ---------- Zone A: 170 % crop, smoothed face track, punch-ins 100 -> 106 %, 2 px micro-pulses ----------
S0 = 1.70                    # eyes sit at y 169–208 in the source: 170 % is the smallest zoom that keeps them within 300 ± 20 without uncovering the top edge
track = json.load(open("face_track.json"))
def interp(t, key):
    if t <= track[0]["t"]: return track[0][key]
    for a, b in zip(track, track[1:]):
        if a["t"] <= t <= b["t"]:
            f = (t - a["t"]) / (b["t"] - a["t"]); return a[key] + (b[key] - a[key]) * f
    return track[-1][key]
PUNCH = [2.80, 4.99, 11.49, 16.31, 22.71, 27.62, 33.20, 37.88, 43.29, 47.18, 53.49, 56.62]
IMPACTS = [2.80, 47.18, 56.62]
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
ks = sorted(set([p["t"] for p in track] +
                [round(p - 0.08 + d, 3) for p in PUNCH for d in (0, 0.05, 0.1, 0.15, 0.25, 1.6, 1.8, 2.0, 2.2)] +
                [round(p - ANTICIP + d, 3) for p in IMPACTS for d in (0, 0.05, 0.1, 0.15, 0.2)]))
ks = [t for t in ks if 0 <= t <= TOTAL - 0.002]
zone = {"S0": S0, "scale": [], "x": [], "y": []}
eyes = []
MW, MH = 1080 * S0, 1088 * S0                # media laid out at S0, centred on (540, 300)
X0, Y0 = (1080 - MW) / 2, 300 - MH / 2
for t in ks:
    p_ = punch(t); cx, ey = interp(t, "cx"), interp(t, "eye")
    E = max(S0, 282 / ey) * p_               # dynamic zoom: when the head is high, zoom in slowly so the eyes never sit above y 282
    k = E / S0                                # scale track is relative to the media laid out at S0
    # Higgsedit scales media from its TOP-LEFT corner (measured on the first master: centre-anchored model off by up to 60 px,
    # top-left model within 10 px on 97 % of the samples), so the offsets place the scaled media directly:
    ox = MW / 2 - cx * E                      # eye midpoint -> x 540
    oy = MH / 2 - ey * E                      # eye line -> y 300
    ox = min(max(ox, 1080 - X0 - 1080 * E), MW / 2 - 540)   # never uncover the left / right edges
    oy = min(oy, MH / 2 - 300 - 2)            # never uncover the top edge
    oy += pulse(t)
    zone["scale"].append([t, round(k, 4)]); zone["x"].append([t, round(ox, 1)]); zone["y"].append([t, round(oy, 1)])
    eyes.append(Y0 + oy + ey * E)
    assert Y0 + oy + 1088 * E >= 762, t        # bottom edge stays below the zone
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
        "sheet": [0.6, 3.1, 5.6, 8.6, 12.9, 17.6, 20.9, 23.6, 28.9, 33.0, 37.9, 41.0, 45.4, 49.0, 53.7, 57.4, DUR + 1.2]}
tpl = open("edit.template.jsx").read()
open("edit.jsx", "w").write(tpl.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":"))))
json.dump({"words": [{k: w[k] for k in ("w", "t0", "t1")} for w in words], "caps": caps}, open("timeline.json", "w"), ensure_ascii=False, indent=1)
print("DUR", DUR, "caps", len(caps), "zone keys", len(ks), "eye y range", zone["eyeY"])
for c in caps: print(f'{c["at"]:6.2f} {c["dur"]:4.2f}', " | ".join(t["t"] for t in c["w"]))
