# QA of a rendered reel (draft or master): python3 tests/qa.py renders/draft.mp4
# 1. zero-static: longest window without motion in the stage (y 940–1540), grain ignored (|diff| > 12)
# 2. captions <-> voice: re-transcribe the render, compare each spoken word to its caption highlight time
# 3. effects lead: effect start (trigger - 150 ms) vs the re-transcribed trigger word, on 5 scenes
# 4. eyes: Haar eye detection in Zone A every 0.5 s -> eye line y (target ≈ 300 ± 20)
import sys, json, subprocess, re, os
import numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1]
cap = cv2.VideoCapture(src)
W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)); FPS = cap.get(cv2.CAP_PROP_FPS)
k = H / 1920
tl = json.load(open(os.path.join(HERE, "..", "timeline.json")))
DUR = max(c["at"] + c["dur"] for c in tl["caps"])
report = {"file": os.path.basename(src), "size": f"{W}x{H}", "fps": FPS}

# ---------- 1 + 4 in one pass ----------
eye_cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
face_cc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
prev, still, runs, i, eyes = None, 0, [], 0, []
y0, y1 = int(940 * k), int(1540 * k)
while True:
    ok, fr = cap.read()
    if not ok: break
    t = i / FPS
    g = cv2.cvtColor(fr, cv2.COLOR_BGR2GRAY)
    st = g[y0:y1].astype(np.int16)
    if prev is not None and t < DUR:
        moving = int((np.abs(st - prev) > 12).sum()) > 20 * k * k
        if moving:
            if still: runs.append((round((i - still) / FPS, 2), round(still / FPS, 2)))
            still = 0
        else:
            still += 1
    prev = st
    if i % int(FPS / 2) == 0 and t < DUR:
        za = g[: int(760 * k)]
        faces = face_cc.detectMultiScale(za, 1.1, 5, minSize=(int(160 * k), int(160 * k)))
        if len(faces):
            fx, fy, fw, fh = max(faces, key=lambda f: f[2] * f[3])
            ey = eye_cc.detectMultiScale(za[fy: fy + fh // 2, fx: fx + fw], 1.1, 6, minSize=(int(24 * k), int(24 * k)))
            if len(ey) >= 1:
                eyes.append((round(t, 2), round((fy + np.mean([e[1] + e[3] / 2 for e in ey])) / k, 1)))
    i += 1
if still: runs.append((round((i - still) / FPS, 2), round(still / FPS, 2)))
runs.sort(key=lambda r: -r[1])
report["static"] = {"longest_s": runs[0][1] if runs else 0, "top5": runs[:5], "over_1_2s": [r for r in runs if r[1] > 1.2]}
ey = np.array([e[1] for e in eyes])
report["eyes"] = {"samples": len(eyes), "median_y": float(np.median(ey)), "p5": float(np.percentile(ey, 5)), "p95": float(np.percentile(ey, 95)),
                  "within_300pm20": round(float(np.mean(np.abs(ey - 300) <= 20)), 3)}

# ---------- 2 + 3: re-transcribe ----------
wav = "/tmp/qa_audio.wav"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", wav], check=True)
from faster_whisper import WhisperModel
m = WhisperModel("medium", device="cpu", compute_type="int8")
segs, _ = m.transcribe(wav, language="fr", word_timestamps=True, vad_filter=False)
heard = [(re.sub(r"[^\wÀ-ÿ%]", "", w.word.lower()), w.start) for s in segs for w in s.words]
norm = lambda s: re.sub(r"[^\wÀ-ÿ%]", "", s.lower())
shown = []
for c in tl["caps"]:
    for w in c["w"]:
        for part in w["t"].split():
            shown.append((norm(part), c["at"] + w["on"]))
# greedy monotonic alignment on identical tokens within ±0.6 s
d, j = [], 0
for tok, ts in shown:
    for jj in range(j, min(j + 8, len(heard))):
        if heard[jj][0] == tok and abs(heard[jj][1] - ts) < 0.6:
            d.append(ts - heard[jj][1]); j = jj + 1; break
d = np.array(d)
report["captions"] = {"matched": int(len(d)), "shown": len(shown), "median_ms": round(float(np.median(np.abs(d))) * 1000),
                      "p90_ms": round(float(np.percentile(np.abs(d), 90)) * 1000), "bias_ms": round(float(np.mean(d)) * 1000),
                      "under_80ms": round(float(np.mean(np.abs(d) < 0.08)), 3)}
# effect starts = trigger (cut timeline) - 0.15 ; find the trigger word in the re-transcription
EFFECTS = [("100", 1.66, "compteur 100 000 €"), ("30", 6.89, "impact 30 %"), ("définitivement", 12.71, "tampon DÉFINITIVEMENT"),
           ("activer", 25.03, "toggle + impact"), ("95", 39.36, "compteur 95 %"), ("réintégrés", 45.55, "étiquette réintégrés")]
eff = []
for tok, trig, name in EFFECTS:
    cands = [h[1] for h in heard if h[0].startswith(tok) and abs(h[1] - trig) < 0.8]
    if cands:
        spoken = min(cands, key=lambda x: abs(x - trig))
        eff.append({"effet": name, "effet_s": round(trig - 0.15, 2), "mot_s": round(spoken, 2), "avance_ms": round((spoken - (trig - 0.15)) * 1000)})
report["effects_lead"] = eff
print(json.dumps(report, ensure_ascii=False, indent=1))
json.dump(report, open(os.path.join(HERE, "qa_" + os.path.splitext(os.path.basename(src))[0] + ".json"), "w"), ensure_ascii=False, indent=1)
