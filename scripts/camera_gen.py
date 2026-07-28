#!/usr/bin/env python3
# Genere data/camera.json : par frame {scale, cx, cy, mblur} (crop normalise centre sur le visage).
# One-Euro lissage, paliers 1.00/1.08/1.15/1.24, zoom-through aux transitions, snap zoom punchlines,
# derive sur plans longs, clamp du crop dans l'image. Pilote Remotion (aucune valeur en dur cote TSX).
import json, math

FPS = 30
ft = json.load(open("data/face_track.json"))
tl = json.load(open("data/timeline.json"))
segs = tl["segments"]
N = tl["meta"]["total_frames"]
track = ft["track"][:N] + [ft["track"][-1]] * max(0, N - len(ft["track"]))

# ---------- One-Euro ----------
def alpha(cutoff):
    tau = 1 / (2 * math.pi * cutoff); te = 1 / FPS
    return 1 / (1 + tau / te)

def one_euro(xs, mincut=0.6, beta=0.02, dcut=1.0):
    out = [xs[0]]; xp = xs[0]; dxp = 0.0
    for i in range(1, len(xs)):
        dx = (xs[i] - xp) * FPS
        ad = alpha(dcut); dxh = ad * dx + (1 - ad) * dxp
        a = alpha(mincut + beta * abs(dxh)); xh = a * xs[i] + (1 - a) * xp
        out.append(xh); xp = xh; dxp = dxh
    return out

cx = one_euro([t["cx"] for t in track])
cy = one_euro([t["cy"] for t in track])
# zone morte 3% : ignore micro-mouvements
for arr in (cx, cy):
    for i in range(1, len(arr)):
        if abs(arr[i] - arr[i - 1]) < 0.03:
            arr[i] = arr[i - 1]
# vitesse max 6px/frame (0.0056 normalise en 1080)
MAXV = 6 / 1080
for arr in (cx, cy):
    for i in range(1, len(arr)):
        d = arr[i] - arr[i - 1]
        if abs(d) > MAXV:
            arr[i] = arr[i - 1] + math.copysign(MAXV, d)

# ---------- plan de zoom par segment (paliers alternes, jamais 2 identiques de suite) ----------
PAL = [1.08, 1.15]  # jamais 1.00 (source cadree haut) : toujours un peu de recompo
base = {}
prev = None
cyc = 0
for s in segs:
    cand = PAL[cyc % len(PAL)]
    if cand == prev:
        cyc += 1; cand = PAL[cyc % len(PAL)]
    base[s["id"]] = cand; prev = cand; cyc += 1

# punchlines -> snap 1.24 (sur le mot, synchro impact)
def word_frame(sid, key):
    s = next(x for x in segs if x["id"] == sid)
    for ch in s["captions"]:
        for w in ch["words"]:
            if key in w["w"].lower():
                return w["at_f"]
    return s["out_start"] + 10
SNAPS = [("s09", "décision"), ("s13", "dorment")]
snap_frames = [word_frame(sid, k) for sid, k in SNAPS]

def cubic(t):  # cubic-bezier(0.16,1,0.3,1) approx : ease-out fort
    return 1 - pow(1 - t, 3)

# scale par frame
scale = [1.0] * N
for si, s in enumerate(segs):
    a, b = s["out_start"], s["out_end"]
    tgt = base[s["id"]]
    prev_scale = base[segs[si - 1]["id"]] if si > 0 else 1.0
    dur = b - a
    zt_in = s["transition_in"] == "zoom_through"
    # segment suivant en zoom_through ? -> sortie zoom vers 1.18
    zt_out = (si + 1 < len(segs) and segs[si + 1]["transition_in"] == "zoom_through")
    for f in range(a, b):
        lf = f - a
        if zt_in and lf < 14:                       # entree zoom-through : 1.18 -> tgt sur 14f
            sc = 1.18 + (tgt - 1.18) * cubic(lf / 14)
        elif lf < 20:                               # entree standard : prev -> tgt sur 20f, overshoot +1.5%
            p = cubic(lf / 20)
            over = 1 + 0.015 * math.sin(math.pi * min(1, lf / 20))
            sc = (prev_scale + (tgt - prev_scale) * p) * (over if lf < 20 else 1)
        else:
            sc = tgt
        if zt_out and (b - f) <= 10:                # sortie zoom-through : tgt -> 1.18 sur 10f
            sc = tgt + (1.18 - tgt) * cubic((10 - (b - f)) / 10)
        # derive gerée via centre (pas via scale)
        scale[f] = sc

# snap zoom : 3f vers 1.24, tenue ~30f, relache 12f
for sf in snap_frames:
    for f in range(max(0, sf - 1), min(N, sf + 45)):
        d = f - sf
        if d < 0:
            continue
        if d <= 3:
            snap = scale[f] + (1.24 - scale[f]) * (d / 3)
        elif d <= 33:
            snap = 1.24
        else:
            snap = 1.24 + (scale[f] - 1.24) * ((d - 33) / 12)
        scale[f] = max(scale[f], snap)

# ---------- centre du crop (visage + derive + headroom) + clamp ----------
out = []
for f in range(N):
    sc = scale[f]
    cw = 1.0 / sc; chh = 1.0 / sc  # taille crop normalisee (source 9:16 -> crop 9:16)
    # derive lente 14px sur les plans longs sans zoom fort
    seg = next((s for s in segs if s["out_start"] <= f < s["out_end"]), segs[-1])
    dur = seg["out_end"] - seg["out_start"]
    drift = 0.0
    if dur > 90:
        drift = (14 / 1080) * math.sin((f - seg["out_start"]) / dur * math.pi)
    ccx = cx[f] + drift
    ccy = cy[f] + 0.06 * chh          # léger biais bas -> un peu d'air au-dessus de la tête
    # clamp : le crop reste dans l'image
    ccx = min(1 - cw / 2, max(cw / 2, ccx))
    ccy = min(1 - chh / 2, max(chh / 2, ccy))
    # flou de mouvement si |dscale| > 12%/s  ou pan rapide
    mblur = 0
    if f > 0:
        dv = abs(scale[f] - scale[f - 1]) * FPS
        dp = (abs(cx[f] - cx[f - 1]) + abs(cy[f] - cy[f - 1])) * 1080 * FPS
        if dv > 0.12 * sc or dp > 200:
            mblur = min(8, dv * 40 + dp / 200)
    out.append({"scale": round(sc, 4), "cx": round(ccx, 4), "cy": round(ccy, 4), "mblur": round(mblur, 1)})

json.dump({"n": N, "cam": out}, open("data/camera.json", "w"))
import statistics as st
print(f"camera.json: {N} frames | scale {min(scale):.2f}-{max(scale):.2f} "
      f"median {st.median(scale):.3f} | snaps @ {snap_frames} | paliers {base}")
