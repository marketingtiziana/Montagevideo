# Phase 5 visual audits on the rendered master (60 fps):
#   lip-sync  — 5 windows of 4 s: lag between mouth opening (MediaPipe, inner lips / eye distance) and the voice envelope,
#               measured on the master AND on the reference (base60.mp4 + voice_studio.wav, aligned by construction);
#               the edit-induced error is master lag − reference lag (target < 1 frame = 16.7 ms)
#   cuts 2/3  — head displacement across each raccord (nose shift / eye distance, last frame before vs first frame after),
#               on base60 (the raccord itself) and on the master (with punch-ins / zoom-cuts); 8-frame strip at 0.25×
#               (4 before, 4 after) per cut -> tests/cuts_strip.jpg
# usage: python3 tests/av_audit.py renders/master60.mp4
import sys, json, os, subprocess
import numpy as np, cv2, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.join(HERE, "..")
src = sys.argv[1]; FPS = 60
det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
    base_options=mpt.BaseOptions(model_asset_path=os.path.join(ROOT, "models/face_landmarker.task")), running_mode=vision.RunningMode.IMAGE, num_faces=1))

def lm(fr):
    r = det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)))
    if not r.face_landmarks: return None
    h, w = fr.shape[:2]; return np.array([(p.x * w, p.y * h) for p in r.face_landmarks[0]])

def frames(path, i0, n):
    c = cv2.VideoCapture(path); c.set(cv2.CAP_PROP_POS_FRAMES, i0); out = []
    for _ in range(n):
        ok, f = c.read()
        if not ok: break
        out.append(f)
    return out

def env(path, t0, n):                       # voice RMS per video frame
    x = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t0:.4f}", "-t", f"{n / FPS:.4f}", "-i", path, "-ac", "1", "-ar", "48000", "-f", "f32le", "-"],
                       capture_output=True).stdout
    a = np.frombuffer(x, np.float32); k = 800
    return np.sqrt((a[: len(a) // k * k].reshape(-1, k) ** 2).mean(1))[:n]

def lag(vpath, apath, t0, n=240):
    m = []
    for f in frames(vpath, round(t0 * FPS), n):
        L = lm(f); m.append(np.nan if L is None else np.linalg.norm(L[13] - L[14]) / np.linalg.norm(L[33] - L[263]))
    m = np.array(m); e = env(apath, t0, n); k = min(len(m), len(e)); m, e = m[:k], e[:k]
    ok = ~np.isnan(m); m = np.where(ok, m, np.nanmean(m))
    m = (m - m.mean()) / (m.std() + 1e-9); e = (e - e.mean()) / (e.std() + 1e-9)
    best = max(range(-8, 9), key=lambda L: np.mean(m[max(0, -L): k - max(0, L)] * e[max(0, L): k - max(0, -L)]))
    return best, float(np.mean(m[max(0, -best): k - max(0, best)] * e[max(0, best): k - max(0, -best)]))

report = {"file": os.path.basename(src)}
# lip-sync: 5 windows spread over the speaking parts, away from full-frame overlays (kinetic, zoom-through)
pts = [1.0, 17.0, 23.0, 37.5, 52.2]
ls = []
for t in pts:
    lm_, cm = lag(src, src, t); lr, cr = lag(os.path.join(ROOT, "base60.mp4"), os.path.join(ROOT, "audio/voice_studio.wav"), t)
    ls.append({"t": t, "master_lag_frames": lm_, "ref_lag_frames": lr, "edit_error_ms": round((lm_ - lr) * 1000 / FPS, 1), "corr": round(cm, 2)})
report["lipsync"] = {"points": ls, "max_edit_error_ms": max(abs(p["edit_error_ms"]) for p in ls), "under_1_frame": all(abs(p["edit_error_ms"]) < 16.7 for p in ls)}

cuts = json.load(open(os.path.join(ROOT, "cuts.json")))["cuts"]
rows, cr = [], []
for c in cuts:
    i = round(c["t_out"] * FPS); r = {"t": c["t_out"], "level": c["level"]}
    for name, path in (("base", os.path.join(ROOT, "base60.mp4")), ("master", src)):
        a, b = frames(path, i - 1, 2); La, Lb = lm(a), lm(b)
        if La is None or Lb is None: r[name + "_head"] = None; continue
        r[name + "_head"] = round(float(np.linalg.norm(La[1] - Lb[1]) / np.linalg.norm(La[33] - La[263])), 3)
    strip = [cv2.resize(f, (270, 480)) for f in frames(src, i - 4, 8)]
    for j, f in enumerate(strip): cv2.putText(f, f"{(i - 4 + j) / FPS:.3f}", (6, 22), 0, 0.6, (0, 0, 255), 2)
    cv2.line(strip[3], (268, 0), (268, 479), (0, 0, 255), 3)
    rows.append(np.hstack(strip)); cr.append(r)
report["cuts"] = {"points": cr, "max_base_head": max(r["base_head"] or 0 for r in cr)}
cv2.imwrite(os.path.join(HERE, "cuts_strip.jpg"), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 70])
print(json.dumps(report, ensure_ascii=False, indent=1))
json.dump(report, open(os.path.join(HERE, "av_audit.json"), "w"), ensure_ascii=False, indent=1)
