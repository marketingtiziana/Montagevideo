# Reel 6 — builds edit.jsx (Higgsedit, 1080x1920 @ 60 fps) from words_cut.json + cuts.json + face_track.json,
# and events.json (sound design). Every time is on the jump-cut timeline (cut.mp4). Plan: ILLUSTRATIONS.md.
import json, re, math
from prep import DUR
from PIL import ImageFont

A = 0.15                      # every element starts 150 ms before its trigger word (brief: 120–180 ms)
CAP_OFFSET = 0.0              # captions on the word (QA target < 60 ms)

W = json.load(open("words_cut.json"))
def at(word, src):            # trigger word looked up by its SOURCE time (stable whatever the cuts) -> its cut-timeline start
    c = [w for w in W if re.sub(r"[^\w%' -]", "", w["w"]).lower().startswith(word.lower())]
    return min(c, key=lambda w: abs(w["src"] - src))["s"]

# ---------- trigger words (ILLUSTRATIONS.md, section 3), by source time ----------
T = {
    "impots": at("impôts", 1.02), "onlyfans1": at("OnlyFans", 2.92), "mal1": at("mal", 6.58), "debut": at("Au", 8.26), "centaines": at("centaines", 9.46),
    "n5": at("5", 11.20), "n10": at("10", 11.66), "n20": at("20", 12.10), "premiere": at("Première", 16.58), "onlyfans2": at("OnlyFans", 18.06),
    "ru": at("Royaume", 19.86), "mais": at("Mais", 23.04), "france": at("France", 24.02), "declares": at("déclares", 24.90),
    "discret": at("discret", 30.92), "non": at("non", 33.04), "tracable": at("traçable", 35.64), "deuxieme": at("Deuxième", 37.08),
    "fisc": at("fisc", 38.80), "pro": at("professionnelle", 40.84), "declare": at("déclaré", 42.36), "statut": at("statut", 43.96),
    "mal2": at("mal", 49.52), "impot": at("l'impôt", 50.64), "cest": at("c'est", 51.74), "cotis": at("cotisations", 52.56),
    "dispa": at("disparaître", 58.48), "moitie1": at("moitié", 59.56), "unan": at("un", 65.86), "reclame": at("réclame", 66.90),
    "coule": at("coule", 70.54), "fraude": at("fraudé", 72.52), "moitie2": at("moitié", 74.84), "importe": at("n'importe", 79.88),
    "structurer": at("structurer", 82.16), "discrete": at("discrète", 84.02), "cent": at("100", 84.82), "comment": at("comment", 86.32),
    "commande": at("commande", 86.80),
}
fr = lambda t: round(t * 60) / 60   # every compose boundary on the 60 fps frame grid (track planner checks exact overlaps)
T = {k: fr(v) for k, v in T.items()}

# ---------- element lifetimes [t_in, t_out] (for caption placement and QA) ----------
WIN = [(T["impots"] - A, 4.20), (T["fisc"] - A, T["pro"] + 0.70), (T["cotis"] - A, T["dispa"] - A - 0.02)]   # macOS / browser windows (bottom y 1310)
PHONE = [(T["reclame"] - A, T["coule"] - A)]                                                             # iPhone on the right (x 676–1046)
BROLL = (T["importe"] - A, T["importe"] - A + 1.8)

# ---------- captions: 3–4 words, Montserrat ExtraBold 68, wrap to max 2 lines ----------
FONT = ImageFont.truetype("../output/mockups/typo/Montserrat-wght.ttf", 68)
FONT.set_variation_by_axes([800])
tw = lambda s: FONT.getlength(s) * 1.04 + 8
words = []
i = 0
while i < len(W):           # « 5 » + « 000, » -> one token « 5 000 »
    w = W[i]; txt, t0, t1, j = w["w"], w["s"], w["e"], i + 1
    if re.fullmatch(r"\d+", txt) and j < len(W) and re.fullmatch(r"000[,.]?", W[j]["w"]):
        txt += " " + W[j]["w"]; t1 = W[j]["e"]; j += 1
    words.append({"w": txt, "t0": t0, "t1": t1}); i = j
KEY = {"impôts", "onlyfans", "5 000", "10 000", "20 000", "royaume-uni", "traçable", "fisc", "statut", "cotisations", "moitié", "fraudé",
       "100 %", "mal", "disparaître", "réclame", "coule", "diagnostic", "commande", "professionnelle", "discret", "discrète", "france"}
SHAKE = {"mais", "non", "pas"}
NUM = {"5 000": (5, " 000"), "10 000": (10, " 000"), "20 000": (20, " 000"), "100 %": (100, " %")}
clean_w = lambda s: re.sub(r"[,.]$", "", s).strip()
phrases, cur = [], []
for k, w in enumerate(words):
    cur.append(w); nxt = words[k + 1] if k + 1 < len(words) else None
    if nxt is None or re.search(r"[.,?!]$", w["w"]) or nxt["t0"] - w["t1"] > 0.35: phrases.append(cur); cur = []
groups = []
for ph in phrases:
    n = -(-len(ph) // 4)
    size = -(-len(ph) // n)
    chunks = [ph[i:i + size] for i in range(0, len(ph), size)]
    if len(chunks) > 1 and len(chunks[-1]) == 1 and len(chunks[-2]) < 4: chunks[-2] += chunks.pop()   # no lonely last word
    groups += chunks
inside = lambda t0, t1, iv: any(a < t1 and t0 < b for a, b in iv)
caps = []
for gi, g in enumerate(groups):
    start = g[0]["t0"]; nxt = groups[gi + 1][0]["t0"] if gi + 1 < len(groups) else DUR
    end = min(nxt, g[-1]["t1"] + 0.40, DUR)
    mode = "phone" if inside(start, end, PHONE) else "win" if inside(start, end, WIN) else "base"
    toks = []
    for k, w in enumerate(g):
        txt = clean_w(w["w"]); low = txt.lower()
        on = w["t0"] - start; off = (g[k + 1]["t0"] if k + 1 < len(g) else end) - start
        toks.append({"t": txt, "w": math.ceil(tw(txt) * (1.2 if low in KEY else 1.06)),   # room for the 1.25 pop / 1.06 karaoke scale
                     "on": round(on, 3), "off": round(max(off, on + 0.1), 3),
                     "key": low in KEY, "shake": low in SHAKE, **({"num": NUM[low]} if low in NUM else {})})
    a0, a1 = fr(start + CAP_OFFSET), fr(end + CAP_OFFSET)
    caps.append({"at": a0, "dur": round(a1 - a0, 4), "mode": mode, "w": toks})

# ---------- base picture: punch-ins 100 -> 107 % anchored on the face (Higgsedit scales media from the top-left corner) ----------
PUNCH = [T[k] for k in ("onlyfans1", "mal1", "n20", "ru", "non", "fisc", "statut", "mal2", "cotis", "moitie1", "reclame", "coule", "fraude", "cent", "commande")]
track = json.load(open("face_track.json"))["samples"]
def face(t):
    pts = sorted(track, key=lambda s: s["t"])
    if t <= pts[0]["t"]: s = pts[0]
    elif t >= pts[-1]["t"]: s = pts[-1]
    else:
        for a, b in zip(pts, pts[1:]):
            if a["t"] <= t <= b["t"]:
                f = (t - a["t"]) / max(1e-6, b["t"] - a["t"])
                return a["cx"] + (b["cx"] - a["cx"]) * f, a["eye"][1] + (b["eye"][1] - a["eye"][1]) * f
    return s["cx"], s["eye"][1]
def punch(t):
    k = 1.0
    for p in PUNCH:
        a = p - 0.06
        if a <= t < a + 0.25: k = max(k, 1 + 0.07 * (1 - (1 - (t - a) / 0.25) ** 3))
        elif a + 0.25 <= t < a + 1.4: k = max(k, 1.07)
        elif a + 1.4 <= t < a + 2.0: k = max(k, 1.07 - 0.07 * ((t - a - 1.4) / 0.6) ** 2)
    return k
ks = sorted(set([round(p - 0.06 + d, 3) for p in PUNCH for d in (0, 0.04, 0.08, 0.12, 0.17, 0.25, 1.4, 1.55, 1.7, 1.85, 2.0)] + [0.0, round(DUR - 0.002, 3)]))
ks = [t for t in ks if 0 <= t <= DUR - 0.002]
pz = {"scale": [], "x": [], "y": []}
for t in ks:
    k = punch(t); cx, ey = face(t); ay = ey + 60          # zoom towards a point between the eyes and the mouth
    pz["scale"].append([t, round(k, 4)]); pz["x"].append([t, round(cx * (1 - k), 1)]); pz["y"].append([t, round(ay * (1 - k), 1)])

# ---------- sound design events: one sound per event, never two at once (>= 120 ms apart, priority wins) ----------
PRIO = {"impact": 4, "whoosh": 3, "pop": 2, "click": 1, "tick": 0}
ev = []
def sfx(kind, t): ev.append({"k": kind, "t": round(t, 3)})
for name in ("impots", "onlyfans1", "debut", "premiere", "onlyfans2", "ru", "france", "discret", "tracable", "deuxieme", "fisc", "declare", "statut",
             "impot", "cotis", "dispa", "unan", "fraude", "moitie2", "structurer", "discrete", "comment"):
    sfx("pop", T[name] - A)
for name in ("n20", "moitie1", "cent"): sfx("impact", T[name])
for name in ("reclame",): sfx("whoosh", T[name] - A)
sfx("whoosh", BROLL[0]); sfx("whoosh", BROLL[1] - 0.12)
for a, b in WIN: sfx("click", b - 0.2)
sfx("click", PHONE[0][1] - 0.2)
for c in caps:
    for w in c["w"]:
        if w["key"] and "num" not in w: sfx("tick", c["at"] + w["on"])
ev.sort(key=lambda e: (e["t"], -PRIO[e["k"]]))
kept = []
for e in ev:
    if kept and e["t"] - kept[-1]["t"] < 0.12:
        if PRIO[e["k"]] > PRIO[kept[-1]["k"]]: kept[-1] = e
        continue
    kept.append(e)
json.dump(kept, open("events.json", "w"), indent=0)

data = {"DUR": DUR, "A": A, "T": T, "caps": caps, "pz": pz, "WIN": WIN, "PHONE": PHONE, "BROLL": BROLL,
        "sheet": []}
tpl = open("edit.template.jsx").read()
open("edit.jsx", "w").write(tpl.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":"))))
json.dump({"T": T, "caps": caps}, open("timeline.json", "w"), ensure_ascii=False, indent=1)
print("DUR", DUR, "caps", len(caps), "punch keys", len(ks), "sfx", len(kept))
for c in caps: print(f'{c["at"]:6.2f} {c["dur"]:4.2f} {c["mode"]:5s}', " | ".join(("*" if t["key"] else "") + t["t"] for t in c["w"]))
