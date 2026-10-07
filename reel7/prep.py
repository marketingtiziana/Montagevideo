# Reel 7 — cut planner (Phase 1b). Source timeline. Inputs: transcript.json, silences.txt, faces_raw.json, motion.json.
# Outputs: pauses.json (silences >= 250 ms strictly between two words), cuts.json (keep spans + per-cut metrics/level).
import json, re, numpy as np
FPS = 59.94
T = json.load(open("transcript.json")); W = [w for s in T["segments"] for w in s["words"]]
END = 99.32

# ---------- pauses: silencedetect -32 dB / 0.25 s, only between two complete words ----------
sil = []
for line in open("silences.txt"):
    m = re.search(r"silence_start: ([\d.]+)", line)
    if m: sil.append([float(m.group(1)), None])
    m = re.search(r"silence_end: ([\d.]+)", line)
    if m: sil[-1][1] = float(m.group(1))
pauses = []
for a, b in sil:
    if b is None or b - a < 0.25: continue
    before = [w for w in W if w["s"] < a]; after = [w for w in W if w["e"] > b]
    inside = [w for w in W if w["s"] > a + 0.05 and w["e"] < b - 0.05]
    if before and after and not inside:
        pauses.append({"s": round(a, 3), "e": round(b, 3), "d": round(b - a, 3), "prev": before[-1]["w"], "next": after[0]["w"]})
json.dump(pauses, open("pauses.json", "w"), ensure_ascii=False, indent=0)

# ---------- editorial plan (validated in CUTS.md): each drop goes from a sentence-end pause to a sentence-start pause ----------
def P(t):   # index of the pause that contains t
    return next(i for i, p in enumerate(pauses) if p["s"] - 0.02 <= t <= p["e"] + 0.02)
DROPS = [
    (P(7.4),  P(11.9), "edit",     "« Tu vends ta formation en ligne. Un client en Belgique, un en France, un en Suisse. »"),
    (P(32.3), P(40.6), "accident", "« Et chaque pays a son taux. 19 % l'Allemagne, 21 % la Belgique, 23 %, 20 %. Donc, quand tu veux… donc » : faux départ repris par « quand tu vends dans trois pays » ; la liste de taux part avec (raccord propre impossible plus près, voir CUTS.md)"),
    (P(45.3), P(55.6), "edit",     "« Trois taux différents, trois États… leur part. Et si tu vends à une entreprise… une autre règle. Tu vois le niveau un peu ? »"),
    (P(72.3), P(77.5), "edit",     "« Tu déclares toute cette TVA européenne au même endroit, en une seule déclaration. »"),
    (P(79.8), P(88.0), "edit",     "« Encore faut-il savoir que ça existe et le mettre en place correctement. Et c'est exactement ce qu'on gère dès le départ. »"),
]
END = round(pauses[P(98.0)]["s"] + 0.25, 3)    # the short ends on « commande TVA. » (+250 ms of air); « On regarde si tu es en règle. » is dropped
SIL_MIN, SIL_MAX, MARGIN = 0.15, 0.25, 0.06   # silence kept at the joint (out side x + in side y), >= 60 ms each side of the phonemes

# ---------- metrics (frame-accurate face at the raccord frames, motion energy, blink, head turn) ----------
from tools.face_at import FaceAt
fa = FaceAt("source.mp4")
E = np.array(json.load(open("motion.json"))["energy"])
def energy(t, w=0.2):   # summed flow over +-w s (the source holds ~25 unique frames/s), px per 0.1 s
    return float(E[max(0, int((t - w) * FPS)):int((t + w) * FPS)].sum() / (2 * w / 0.1))
E_LOW = float(np.percentile([energy(t) for t in np.arange(0.5, END - 0.5, 0.1)], 40))
_cache = {}
def face(t):
    k = round(t * FPS)
    if k not in _cache: _cache[k] = fa(k / FPS)
    return _cache[k]
def best_join(po, pi):
    a, b = pauses[po], pauses[pi]; best = None
    for x in np.arange(MARGIN, SIL_MAX - MARGIN + 1e-6, 0.04):
        for y in np.arange(MARGIN, SIL_MAX - MARGIN + 1e-6, 0.04):
            if not SIL_MIN <= x + y <= SIL_MAX: continue
            o, i = a["s"] + x, b["e"] - y
            if o > a["e"] - MARGIN or i < b["s"] + MARGIN: continue
            fo, fi = face(o), face(i)
            if fo is None or fi is None: continue
            d = float(np.linalg.norm(fo["nose"] - fi["nose"]))
            blink = min(fo["open"], fi["open"]) < 0.15
            gest = max(energy(o), energy(i)) > 1.5 * E_LOW
            key = (blink, gest, round(d / 4), abs(x + y - 0.21))
            if best is None or key < best[0]: best = (key, o, i, fo, fi, d)
    _, o, i, fo, fi, d = best
    c = {"out": round(o, 3), "in": round(i, 3), "removed": round(i - o, 3), "silence_kept": round((o - a["s"]) + (b["e"] - i), 3),
         "pause_out": [a["s"], a["e"]], "pause_in": [b["s"], b["e"]],
         "head_px": round(d, 1), "eye_px": round(float(np.linalg.norm(fo["eye"] - fi["eye"])), 1),
         "yaw_delta": round(abs(fo["yaw"] - fi["yaw"]), 3), "motion_out": round(energy(o), 2), "motion_in": round(energy(i), 2),
         "open_out": round(fo["open"], 2), "open_in": round(fi["open"], 2), "blink": bool(min(fo["open"], fi["open"]) < 0.15)}
    clean = c["motion_out"] <= 1.5 * E_LOW and c["motion_in"] <= 1.5 * E_LOW and not c["blink"] and c["yaw_delta"] < 0.06
    c["clean"] = clean
    c["level"] = "a" if d < 25 and clean else "b" if d < 60 else "c" if d < 90 else "d"
    return c

cuts = []
for po, pi, kind, txt in DROPS:
    c = best_join(po, pi); c.update(kind=kind, text=txt); cuts.append(c)
# the 2.45 s silence after « tout le monde se plante. » is shortened even though the head moves (level c, fallback rule in CUTS.md)
FORCED = [P(19.5)]
for i in FORCED:
    c = best_join(i, i); c.update(kind="breath", text=f"silence de {pauses[i]['d']:.2f} s après « se plante. » ramené à {c['silence_kept']:.2f} s"); cuts.append(c)

# ---------- optional breath trims: sentence-end / long pauses shortened to 0.15-0.25 s, ONLY as clean level-a cuts ----------
dropped = [(pauses[po]["s"], pauses[pi]["e"]) for po, pi, _, _ in DROPS]
for i, p in sorted(enumerate(pauses), key=lambda ip: -ip[1]["d"]):
    if i in FORCED or p["d"] < 0.35 or any(a - 0.01 <= p["s"] and p["e"] <= b + 0.01 for a, b in dropped): continue
    c = best_join(i, i)
    if c["level"] != "a" or c["removed"] < 0.12: continue
    if any(min(abs(c["out"] - k["in"]), abs(k["out"] - c["in"])) < 1.2 for k in cuts): continue
    c.update(kind="breath", text=f"respiration de {p['d']:.2f} s ramenée à {c['silence_kept']:.2f} s ({p['prev']} | {p['next']})"); cuts.append(c)
cuts.sort(key=lambda c: c["out"])
keep, cur = [], 0.0
for c in cuts: keep.append([round(cur, 3), c["out"]]); cur = c["in"]
keep.append([round(cur, 3), END])
dur = sum(b - a for a, b in keep)
# spacing rules on the OUTPUT timeline
tl, acc = [], 0.0
for (a, b), c in zip(keep, cuts): acc += b - a; tl.append(round(acc, 3)); c["t_out"] = round(acc, 3)
gaps = np.diff(tl)
json.dump({"fps": FPS, "E_LOW": round(E_LOW, 2), "duration": round(dur, 3), "keep": keep, "cuts": cuts,
           "min_gap_s": round(float(gaps.min()), 2) if len(gaps) else None, "cuts_per_3s": round(len(cuts) / (dur / 3), 2)},
          open("cuts.json", "w"), ensure_ascii=False, indent=1)
print("duration", round(dur, 2), "| cuts", len(cuts), "| min gap", round(float(gaps.min()), 2), "| per 3 s", round(len(cuts) / (dur / 3), 2), "| E_LOW", round(E_LOW, 2))
for c in cuts: print(f'{c["kind"]:8s} {c["out"]:6.2f}->{c["in"]:6.2f} tl {c["t_out"]:5.2f} rm {c["removed"]:5.2f} sil {c["silence_kept"]:.2f} head {c["head_px"]:5.1f} yaw {c["yaw_delta"]:.3f} mot {c["motion_out"]:5.2f}/{c["motion_in"]:5.2f} open {c["open_out"]}/{c["open_in"]} => {c["level"]}')
