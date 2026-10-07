# Reel 7 — builds edit.jsx (Higgsedit, 1080x1920 @ 60 fps) from transcript_cut.json (edited voice, output timeline),
# cuts.json (keep spans, cut levels) and faces_raw.json (head track, mapped to the output timeline), and events.json (SFX).
# Plan: ILLUSTRATIONS.md / CUTS.md.
import json, re, math
import numpy as np
from PIL import ImageFont

FPS = 60
A = 0.15                                    # elements start 150 ms before their trigger word (brief: 120–180 ms)
C = json.load(open("cuts.json")); keep = C["keep"]
DUR = 3449 / FPS                            # picture length of the 60 fps base (the voice is 57.507 s; the last 24 ms are air)
fr = lambda t: round(t * FPS) / FPS

# ---------- words on the output timeline (re-transcription of the edited voice) ----------
TC = json.load(open("transcript_cut.json"))
W = [dict(w) for s in TC for w in s["words"] if w["w"] not in ("«", "»")]
# whisper starts absorb leading silence: clamp each start to <= 0.45 s before its end-of-previous-word boundary is kept as is,
# but a start that sits on a cut (it includes the joint silence) is moved to the end of that silence
cut_t = [c["t_out"] for c in C["cuts"]]
words = []
for i, w in enumerate(W):
    t = w["w"].replace("commande", "commente")
    words.append({"w": t, "s": w["s"], "e": w["e"], "p": w["p"]})
# join elisions « n 'est » -> « n'est », « l 'État » -> « l'État »; whisper splits them
J = []
for w in words:
    if J and (w["w"].startswith("'") or re.fullmatch(r"[?!.,]+", w["w"])): J[-1]["w"] += w["w"]; J[-1]["e"] = w["e"]
    else: J.append(dict(w))
words = J
def at(token, t):           # trigger word start nearest to t (output timeline)
    c = [w for w in words if re.sub(r"[^\w%' -]", "", w["w"]).lower().startswith(token.lower())]
    return min(c, key=lambda w: abs(w["s"] - t))["s"]

T = {k: fr(at(tok, t)) for k, (tok, t) in {
    "tva0": ("TVA", 0.94), "trois0": ("trois", 2.76), "truc": ("truc", 4.60), "personne": ("personne", 5.04),
    "france": ("France", 7.66), "vingt": ("20", 9.52), "tout": ("tout", 10.30), "logique": ("Logique", 10.96), "non2": ("non", 12.36),
    "toutp": ("tout", 13.58), "monde": ("monde", 13.88), "plante": ("plante", 14.22),
    "formation": ("formation", 15.08), "particulier": ("particulier", 17.06), "regle": ("règle", 18.20), "personne2": ("personne", 19.74),
    "tonpays": ("ton", 22.54), "cest": ("c'est", 23.30), "client": ("client", 24.36), "pays_client": ("pays", 23.96),
    "trois1": ("trois", 26.26), "une": ("une", 27.44), "trois2": ("trois", 29.12),
    "piege": ("piège", 30.20), "mauvaise": ("mauvaise", 31.90), "pasde": ("pas", 32.96),
    "argent": ("l'argent", 34.12), "etat": ("l'État", 36.04), "reclame": ("réclame", 37.18),
    "plus": ("plus", 39.28), "poche": ("poche", 40.54),
    "bonne": ("bonne", 41.22), "systeme": ("système", 42.76), "enregistrer": ("t'enregistrer", 43.82), "trois3": ("trois", 44.54),
    "guichet": ("guichet", 46.38), "internationale": ("internationale", 48.02), "pasp": ("pas", 49.84), "en": ("en", 50.08), "panique": ("panique", 50.34),
    "concoit": ("conçoit", 51.50), "structure": ("structure", 53.06), "international": ("l'international", 54.48),
    "doute": ("doute", 55.94), "commente": ("commente", 56.32), "tvaend": ("TVA", 56.78),
}.items()}

# ---------- face track on the output timeline (punch-in anchor, parallax) ----------
F = [s for s in json.load(open("faces_raw.json"))["samples"] if s["box"]]
def src2out(t):
    acc = 0.0
    for a, b in keep:
        if a <= t <= b: return acc + t - a
        acc += b - a
    return None
FT = sorted([(src2out(s["t"]), s["nose"][0], s["eye"][1]) for s in F if src2out(s["t"]) is not None])
ft = np.array([x[0] for x in FT]); fx = np.array([x[1] for x in FT]); fy = np.array([x[2] for x in FT])
def face(t): return float(np.interp(t, ft, fx)), float(np.interp(t, ft, fy))

# ---------- base picture scale: punch-ins 107 % (impact words), zoom-cut 104 % on the outgoing side of level-a cuts,
#            zoom-whip 5 frames on level-b cuts at sentence ends ----------
PUNCH = [T[k] for k in ("personne", "vingt", "non2", "trois2", "poche")]
ZCUT = [c["t_out"] for c in C["cuts"] if c["level"] == "a"]
WHIP = [c["t_out"] for c in C["cuts"] if c["level"] == "b" and c["t_out"] < 40]      # cuts 9/10 sit under the full-frame window
MORPH = [c["t_out"] for c in C["cuts"] if c["level"] == "c"]
def scale(t):
    k = 1.0
    for p in PUNCH:
        a = p - 0.06
        if a <= t < a + 0.25: k = max(k, 1 + 0.07 * (1 - (1 - (t - a) / 0.25) ** 3))
        elif a + 0.25 <= t < a + 1.4: k = max(k, 1.07)
        elif a + 1.4 <= t < a + 2.0: k = max(k, 1.07 - 0.07 * ((t - a - 1.4) / 0.6) ** 2)
    for c in ZCUT:                       # 104 % held on the outgoing side, snaps to 100 % on the cut frame
        if c - 0.9 <= t < c - 0.65: k = max(k, 1 + 0.04 * (1 - (1 - (t - c + 0.9) / 0.25) ** 3))
        elif c - 0.65 <= t < c: k = max(k, 1.04)
    for c in WHIP:                       # 5 frames: 2 before (in), 3 after (out)
        d = t - c
        if -2 / FPS <= d < 0: k = max(k, 1 + 0.14 * (d + 2 / FPS) / (2 / FPS))
        elif 0 <= d < 3 / FPS: k = max(k, 1.14 - 0.14 * d / (3 / FPS))
    return k
ks = set([0.0, round(DUR - 0.002, 4)])
for p in PUNCH: ks |= {round(p - 0.06 + d, 4) for d in (0, 0.04, 0.08, 0.12, 0.17, 0.25, 1.4, 1.55, 1.7, 1.85, 2.0)}
for c in ZCUT: ks |= {round(c - 0.9, 4), round(c - 0.82, 4), round(c - 0.74, 4), round(c - 0.65, 4), round(c - 1 / FPS, 4), round(c, 4)}
for c in WHIP: ks |= {round(c + i / FPS, 4) for i in range(-3, 5)}
ks = sorted(t for t in ks if 0 <= t <= DUR - 0.002)
pz = {"scale": [], "x": [], "y": [], "blur": []}
for t in ks:
    k = scale(t); cx, ey = face(t); ay = ey + 60
    snap = any(abs(t - c) < 1e-3 for c in ZCUT)
    pz["scale"].append([t, round(k, 4), "hold" if any(abs(t - (c - 1 / FPS)) < 1e-3 for c in ZCUT) else "linear"])
    pz["x"].append([t, round(cx * (1 - k), 1)]); pz["y"].append([t, round(ay * (1 - k), 1)])
pz["blur"] = [[0.0, 0.0]] + [x for c in WHIP for x in ([round(c - 3 / FPS, 4), 0.0], [round(c, 4), 16.0], [round(c + 3 / FPS, 4), 0.0])] + [[round(DUR - 0.002, 4), 0.0]]
# background parallax (2.5D, element 15): background moves opposite to the head, clamped to 10 px
mx = float(np.median(fx))
par = [[round(t, 3), round(float(np.clip(-(face(t)[0] - mx) * 0.05, -10, 10)), 1)] for t in np.arange(0, DUR - 0.01, 0.5)] + [[round(DUR - 0.002, 4), 0.0]]

# ---------- captions: 3–4 words, Montserrat ExtraBold 68, sentence boundaries, never across a video cut ----------
FONT = ImageFont.truetype("../output/mockups/typo/Montserrat-wght.ttf", 68); FONT.set_variation_by_axes([800])
tw = lambda s: FONT.getlength(s) * 1.04 + 8
KEY = {"tva", "trois", "pays", "france", "20%", "logique", "non", "plante", "particulier", "règle", "client", "piège", "mauvaise", "l'état",
       "réclame", "poche", "système", "guichet", "unique", "internationale", "panique", "structure", "commente", "doute", "formation"}
SHAKE = {"non", "mais", "c'est"}          # oppositions
IMPACT = {"plante", "poche", "panique", "piège"}
NUM = {}   # numbers in captions stay static: she says « vingt », the count-up lives on the card only
clean = lambda s: re.sub(r"[,.?!]$", "", s).strip()
phrases, cur = [], []
for k, w in enumerate(words):
    cur.append(w); nxt = words[k + 1] if k + 1 < len(words) else None
    crosses_cut = nxt is not None and any(w["e"] - 0.05 <= c <= nxt["s"] + 0.3 for c in cut_t)
    if nxt is None or re.search(r"[.?!]$", w["w"]) or (w["w"].endswith(",") and len(cur) >= 3) or nxt["s"] - w["e"] > 0.35 or crosses_cut: phrases.append(cur); cur = []
groups = []
for ph in phrases:
    n = -(-len(ph) // 4); size = -(-len(ph) // n)
    ch = [ph[i:i + size] for i in range(0, len(ph), size)]
    if len(ch) > 1 and len(ch[-1]) == 1 and len(ch[-2]) < 4: ch[-2] += ch.pop()
    groups += ch
ZT = [44.80, 47.80]                                                         # zoom-through window (covers cuts 9 and 10)
WIN = [(T["mauvaise"] - A - 0.35, C["cuts"][5]["t_out"] - 0.05), (T["bonne"] - A, ZT[0] + 0.1), tuple(ZT)]
PHONE = [(T["argent"] - A, T["plus"] - A - 0.05)]
HIDE = [(T["toutp"] - A + 0.1, C["cuts"][1]["t_out"] + 0.25), (T["pasp"] - A + 0.1, T["concoit"] - A - 0.1)]   # kinetic typography carries the words
inside = lambda t0, t1, iv: any(a < t1 and t0 < b for a, b in iv)
caps = []
for gi, g in enumerate(groups):
    start = g[0]["s"]; nxt = groups[gi + 1][0]["s"] if gi + 1 < len(groups) else DUR
    end = min(nxt, g[-1]["e"] + 0.40, DUR)
    toks = []
    for k, w in enumerate(g):
        txt = clean(w["w"]).replace("20%", "20 %"); low = clean(w["w"]).lower()
        on = w["s"] - start; off = (g[k + 1]["s"] if k + 1 < len(g) else end) - start
        key = low in KEY
        toks.append({"t": txt, "w": math.ceil(tw(txt) * (1.2 if key else 1.06)), "on": round(on, 3), "off": round(max(off, on + 0.1), 3),
                     "key": key, "shake": low in SHAKE, "impact": low in IMPACT, **({"num": NUM[low]} if low in NUM else {})})
    a0, a1 = fr(start), fr(end)
    mid = (start + end) / 2
    mode = "hide" if any(a <= mid <= b for a, b in HIDE) else "phone" if inside(start, end, PHONE) else "win" if inside(start, end, WIN) else "base"
    caps.append({"at": a0, "dur": round(a1 - a0, 4), "w": toks, "mode": mode})

# ---------- matte-based effects baked by tools/depth.py ----------
FRZ = [round(T["logique"] + 0.56, 3), round(T["logique"] + 0.96, 3)]          # « Logique, non ? » ends 11.50, « Eh » starts 11.94
TRUC = {"t": [fr(T["truc"] - A), 7.317], "box": [0, 450, 700, 550]}          # person crop (x, y, w, h) over « LE TRUC »
json.dump({"setups": [[0, 30.883, True], [30.883, 47.333, True], [47.333, 52.78, True], [52.78, 53.833, False], [53.833, DUR, True]],
           "parallax": par, "pulses": [round(T["non2"], 3), round(T["poche"], 3)], "freeze": FRZ, "morph": MORPH, "truc": TRUC},
          open("depth.json", "w"), indent=0)
data = {"ZT": ZT, "DUR": DUR, "FRZ": FRZ, "TRUC": TRUC, "A": A, "T": T, "caps": caps, "pz": pz, "par": par, "CUTS": [{"t": c["t_out"], "level": c["level"]} for c in C["cuts"]],
        "WHIP": WHIP, "MORPH": MORPH, "ZCUT": ZCUT}
tpl = open("edit.template.jsx").read()
open("edit.jsx", "w").write(tpl.replace("/*__DATA__*/null", json.dumps(data, ensure_ascii=False, separators=(",", ":"))))
json.dump({"T": T, "caps": caps, "words": words}, open("timeline.json", "w"), ensure_ascii=False, indent=1)
print("DUR", DUR, "caps", len(caps), "scale keys", len(ks))
for c in caps: print(f'{c["at"]:6.2f} {c["dur"]:4.2f} {c["mode"]:5s}', " | ".join(("*" if t["key"] else "") + t["t"] for t in c["w"]))

# ---------- sound design: one SFX per event, placed in a gap between words (never on a syllable), >= 120 ms apart ----------
import soundfile as sf
vx, vsr = sf.read("audio/voice_studio.wav"); vx = vx.mean(1) if vx.ndim > 1 else vx
def vdb(t, w=0.03):
    s = vx[max(0, int((t - w) * vsr)):int((t + w) * vsr)]
    return 20 * np.log10(np.sqrt(np.mean(s ** 2)) + 1e-9) if len(s) else -120
gaps = [(words[i]["e"], words[i + 1]["s"]) for i in range(len(words) - 1)]
def place(t, back=0.30):
    # latest inter-word boundary in [t - back, t + 0.02]; whisper bounds are refined on the voice envelope (quietest 10 ms in the gap)
    cand = [(a, b) for a, b in gaps if t - back <= b <= t + 0.02]
    if not cand: return t, vdb(t) < -38
    a, b = cand[-1]; ts = np.arange(min(a, b - 0.06), b + 0.001, 0.01)
    best = min(ts, key=lambda x: vdb(x, 0.015)); return float(best), vdb(best, 0.02) < -38
EV = []
def sfx(kind, t, back=0.30):
    tt, quiet = place(t, back); EV.append({"k": kind, "t": round(tt, 3), "quiet": bool(quiet)})
for k in ("tva0", "trois0", "france", "formation", "regle", "tonpays", "trois1", "piege", "mauvaise", "systeme", "internationale", "concoit", "international", "commente"):
    sfx("pop", T[k])
sfx("whoosh", T["truc"]); sfx("tick", T["logique"]); sfx("click", T["non2"]); sfx("impact", T["plante"]); sfx("whoosh", T["personne2"])
sfx("sub", T["vingt"]); sfx("sub", T["trois2"]); sfx("click", T["pasde"]); sfx("whoosh", T["argent"]); sfx("pop", T["reclame"]); sfx("sub", T["poche"])
sfx("shimmer", T["bonne"] + 0.75, 0.4); sfx("whoosh", ZT[0] + 0.15, 0.4); sfx("whoosh", ZT[1] - 0.35, 0.4); sfx("impact", T["panique"]); sfx("shimmer", T["commente"] + 0.25, 0.4)
for c in C["cuts"]:
    if c["level"] == "b" and c["t_out"] < 40: EV.append({"k": "whoosh", "t": round(c["t_out"] - 0.05, 3), "quiet": True})   # whips sit in the joint silence
PRIO = {"impact": 5, "sub": 4, "whoosh": 3, "shimmer": 2, "pop": 2, "click": 1, "tick": 0}
EV.sort(key=lambda e: (e["t"], -PRIO[e["k"]])); kept = []
for e in EV:
    if kept and e["t"] - kept[-1]["t"] < 0.12:
        if PRIO[e["k"]] > PRIO[kept[-1]["k"]]: kept[-1] = e
        continue
    kept.append(e)
json.dump(kept, open("events.json", "w"), indent=0)
print("sfx", len(kept), "in silence", sum(e["quiet"] for e in kept))
