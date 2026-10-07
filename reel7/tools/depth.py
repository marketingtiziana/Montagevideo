# Bakes the matte-based effects into the base picture (Phase 4, elements 15 / 17 / 20 + cut-2 morph) -> base_depth.mp4
#   15  2.5D depth: clean background plate (temporal median of background pixels per camera set-up, holes inpainted),
#       shifted by an inverse parallax (<= 10 px), scaled 1.04, blurred 6 px; person + microphone sharp in front (alpha).
#   17  background pulse: accent #FFC83D at 12 % on the background only, 6 frames, on impact words.
#   20  freeze-frame: frame held 0.4 s inside a >= 400 ms silence, 3 px white outline around the silhouette.
#   cut 2 (level c): 6-frame optical-flow morph between the two raccord frames (DIS flow, both directions, blended).
# Alpha = rebuilt from the remove_background output (person over pure black) / source, holes filled, soft edge band only.
# usage: python3 tools/depth.py   (reads base60.mp4, matte60.mp4, depth.json written by gen_edit.py)
import json, subprocess, numpy as np, cv2
W, H, FPS = 1080, 1920, 60
P = json.load(open("depth.json"))
from alpha import reader, alpha_of, K5, K9, BAND, xx, yy
# ---------- pass 1: clean plates per camera set-up (temporal median of background pixels, every 6th frame) ----------
SEG = [s[:2] for s in P["setups"]]        # [[t0, t1], ...] output-timeline spans sharing one camera framing
STATIC = [s[2] for s in P["setups"]]      # False = the source camera moves: no depth effect there (passthrough)
# at most 40 evenly spaced samples per set-up, kept as uint8; median computed in row bands (memory-bounded)
idx_of = lambda t: next(j for j, (a, b) in enumerate(SEG) if a <= t < b + 1e-6)
NF = 3449; per = [[i for i in range(NF) if SEG[k][0] <= i / FPS < SEG[k][1] + 1e-6] for k in range(len(SEG))]
pick = set(); [pick.update(lst[:: max(1, len(lst) // 40)][:40]) for lst in per]
acc = [[] for _ in SEG]; masks = [[] for _ in SEG]
for i, (s, m) in enumerate(zip(reader("base60.mp4"), reader("matte60.mp4"))):
    if i not in pick: continue
    k = idx_of(i / FPS)
    if not STATIC[k]: continue
    a = alpha_of(s, m); acc[k].append(s.copy()); masks[k].append(cv2.erode((a < 0.02).astype(np.uint8), K9).astype(bool))
plates = []
for k in range(len(SEG)):
    if not STATIC[k] or not acc[k]: plates.append(None); continue
    st = np.stack(acc[k]); mk = np.stack(masks[k]); plate = np.zeros((H, W, 3), np.uint8); hole = np.zeros((H, W), bool)
    for y0 in range(0, H, 120):
        blk = st[:, y0:y0 + 120].astype(np.float32); mb = mk[:, y0:y0 + 120]
        blk[~mb] = np.nan
        with np.errstate(all="ignore"): med = np.nanmedian(blk, axis=0)
        hole[y0:y0 + 120] = np.isnan(med).any(2); plate[y0:y0 + 120] = np.nan_to_num(med).astype(np.uint8)
    del st, mk
    plate = cv2.inpaint(plate, hole.astype(np.uint8) * 255, 9, cv2.INPAINT_TELEA)
    plates.append(plate); cv2.imwrite(f"scratch/plate{k}.jpg", cv2.cvtColor(plate, cv2.COLOR_RGB2BGR))
    print("plate", k, SEG[k], "samples", len(acc[k]), "hole %", round(100 * hole.mean(), 1), flush=True)
acc = masks = None
# ---------- pass 2: composite ----------
ACC = np.array([255, 200, 61], np.float32)
par = np.array(P["parallax"]); pulses = P["pulses"]; frz = P["freeze"]; morph = P["morph"]
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "13", "-pix_fmt", "yuv420p", "base_depth.mp4"], stdin=subprocess.PIPE)
held = None; buf = {}
RING_Y = 1600
def bgplate(t):
    k = next(j for j, (a, b) in enumerate(SEG) if a <= t < b + 1e-6)
    if plates[k] is None: return None
    dx = float(np.interp(t, par[:, 0], par[:, 1]))
    M = np.float32([[1.04, 0, -0.02 * W + dx], [0, 1.04, -0.02 * H]])
    bg = cv2.warpAffine(plates[k], M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    return cv2.GaussianBlur(bg, (0, 0), 6)
def comp(i, s, m):
    t = i / FPS
    a = alpha_of(s, m)[..., None]
    bg = bgplate(t)
    if bg is None: return s.astype(np.float32), a
    bg = bg.astype(np.float32)
    if any(p <= t < p + 6 / FPS for p in pulses): bg = bg * 0.88 + ACC * 0.12
    return s.astype(np.float32) * a + bg * (1 - a), a
# morph (cut 2): frames c-3 .. c+2 are rebuilt from the composites of frame c-4 (A) and c+3 (B)
TR = P.get("truc")
if TR:
    x, y, w, h = TR["box"]
    trc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgba", "-s", f"{w}x{h}", "-r", str(FPS), "-i", "-",
                            "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-qscale:v", "9", "assets/person_truc.mov"], stdin=subprocess.PIPE)
MF = {}
if morph:
    c = round(morph[0] * FPS); need = {c - 4: None, c + 3: None}
    for i, (s, m) in enumerate(zip(reader("base60.mp4"), reader("matte60.mp4"))):
        if i in need: need[i] = np.clip(comp(i, s, m)[0], 0, 255).astype(np.uint8)
        if i > c + 3: break
    A, B = need[c - 4], need[c + 3]
    ga, gb = cv2.cvtColor(A, cv2.COLOR_RGB2GRAY), cv2.cvtColor(B, cv2.COLOR_RGB2GRAY)
    dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
    fab = dis.calc(ga, gb, None); fba = dis.calc(gb, ga, None)
    gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    for j, f in enumerate(range(c - 3, c + 3)):
        u = (j + 1) / 7.0
        wa = cv2.remap(A, gx + fba[..., 0] * u, gy + fba[..., 1] * u, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        wb = cv2.remap(B, gx + fab[..., 0] * (1 - u), gy + fab[..., 1] * (1 - u), cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        MF[f] = (wa.astype(np.float32) * (1 - u) + wb.astype(np.float32) * u).astype(np.uint8)
        cv2.imwrite(f"scratch/morph_{j}.jpg", cv2.cvtColor(MF[f], cv2.COLOR_RGB2BGR))
    cv2.imwrite("scratch/morph_A.jpg", cv2.cvtColor(A, cv2.COLOR_RGB2BGR)); cv2.imwrite("scratch/morph_B.jpg", cv2.cvtColor(B, cv2.COLOR_RGB2BGR))
for i, (s, m) in enumerate(zip(reader("base60.mp4"), reader("matte60.mp4"))):
    t = i / FPS
    if i in MF: enc.stdin.write(MF[i].tobytes()); continue
    out, a = comp(i, s, m)
    if frz and frz[0] <= t < frz[1]:
        if held is None:
            al = (a[..., 0] > 0.5).astype(np.uint8)
            ring = (cv2.dilate(al, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))) - al) > 0
            ring[RING_Y:] = False                                     # silhouette only: no outline along the desk
            held = out.copy(); held[ring] = 255.0
        out = held
    enc.stdin.write(np.clip(out, 0, 255).astype(np.uint8).tobytes())
    if TR and TR["t"][0] <= t < TR["t"][1]:                           # person crop with alpha, over « LE TRUC » (element 16)
        x, y, w, h = TR["box"]
        trc.stdin.write(np.dstack([s[y:y + h, x:x + w], (a[y:y + h, x:x + w, 0] * 255).astype(np.uint8)]).tobytes())
enc.stdin.close(); enc.wait()
if TR: trc.stdin.close(); trc.wait()
print("base_depth.mp4 done")
