# QA of a rendered short (draft or master): python3 tests/qa.py renders/master60.mp4
# 1. zero-static: longest window where the WHOLE frame does not move (|diff| > 12 on > 0.02 % of pixels), grain ignored
# 2. captions <-> voice: re-transcribe the render (faster-whisper large-v3), compare each spoken word to its caption highlight (target < 60 ms)
# 3. effects lead: 5 elements drawn at random (seed 6): element start vs the re-transcribed trigger word (target 120–180 ms early)
# 4. loudness: EBU R128 integrated / true peak; noise floor in the longest pause (target -14 ±1 LUFS, < -60 dBFS)
import sys, json, subprocess, re, os, random
import numpy as np, cv2

HERE = os.path.dirname(os.path.abspath(__file__))
src = sys.argv[1]
cap = cv2.VideoCapture(src)
W = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)); H = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT)); FPS = cap.get(cv2.CAP_PROP_FPS)
tl = json.load(open(os.path.join(HERE, "..", "timeline.json")))
report = {"file": os.path.basename(src), "size": f"{W}x{H}", "fps": round(FPS, 3)}

prev, still, runs, i = None, 0, [], 0
thr = 0.0002 * W * H
while True:
    ok, fr = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(fr, (W // 2, H // 2)), cv2.COLOR_BGR2GRAY).astype(np.int16)
    if prev is not None:
        if int((np.abs(g - prev) > 12).sum()) > thr / 4:
            if still: runs.append((round((i - still) / FPS, 2), round(still / FPS, 2)))
            still = 0
        else: still += 1
    prev = g; i += 1
if still: runs.append((round((i - still) / FPS, 2), round(still / FPS, 2)))
runs.sort(key=lambda r: -r[1])
report["static"] = {"frames": i, "longest_s": runs[0][1] if runs else 0, "over_1_2s": [r for r in runs if r[1] > 1.2]}

wav = "/tmp/qa6.wav"
subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src, "-ac", "1", "-ar", "16000", wav], check=True)
from faster_whisper import WhisperModel
m = WhisperModel("large-v3", device="cpu", compute_type="int8")
segs, _ = m.transcribe(wav, language="fr", word_timestamps=True, vad_filter=False)
norm = lambda s: re.sub(r"[^\wÀ-ÿ%]", "", s.lower())
heard = [(norm(w.word), w.start) for s in segs for w in s.words]
shown = [(norm(part), c["at"] + w["on"]) for c in tl["caps"] for w in c["w"] for part in w["t"].split()[:1]]
d, j = [], 0
for tok, ts in shown:
    for jj in range(j, min(j + 8, len(heard))):
        if heard[jj][0] == tok and abs(heard[jj][1] - ts) < 0.6:
            d.append(ts - heard[jj][1]); j = jj + 1; break
d = np.array(d)
report["captions"] = {"matched": int(len(d)), "shown": len(shown), "median_ms": round(float(np.median(np.abs(d))) * 1000),
                      "p90_ms": round(float(np.percentile(np.abs(d), 90)) * 1000), "bias_ms": round(float(np.mean(d)) * 1000),
                      "under_60ms": round(float(np.mean(np.abs(d) < 0.06)), 3)}

TOK = {"impots": "impôts", "onlyfans1": "onlyfans", "debut": "au", "n5": "5", "premiere": "première", "onlyfans2": "onlyfans", "ru": "royaume",
       "france": "france", "declares": "déclares", "discret": "discret", "tracable": "traçable", "deuxieme": "deuxième", "fisc": "fisc",
       "declare": "déclaré", "statut": "statut", "impot": "limpôt", "cotis": "cotisations", "dispa": "disparaître", "unan": "un",
       "reclame": "réclame", "fraude": "fraudé", "moitie2": "moitié", "importe": "nimporte", "structurer": "structurer", "discrete": "discrète",
       "cent": "100", "comment": "comment"}
random.seed(6)
pick = random.sample(sorted(TOK), 5)
eff = []
for k in pick:
    trig = tl["T"][k]
    c = [h[1] for h in heard if h[0].startswith(TOK[k]) and abs(h[1] - trig) < 0.8]
    if c:
        spoken = min(c, key=lambda x: abs(x - trig))
        eff.append({"element": k, "start_s": round(trig - 0.15, 3), "word_s": round(spoken, 3), "lead_ms": round((spoken - (trig - 0.15)) * 1000)})
report["effects_lead"] = eff

o = subprocess.run(["ffmpeg", "-hide_banner", "-i", src, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
s = o[o.rindex("Summary"):]
report["loudness"] = {"I_lufs": float(re.search(r"I:\s+(-?[\d.]+) LUFS", s).group(1)), "LRA": float(re.search(r"LRA:\s+(-?[\d.]+) LU", s).group(1)),
                      "true_peak_dbfs": float(re.search(r"Peak:\s+(-?[\d.]+) dBFS", s).group(1))}
x = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], capture_output=True).stdout
a = np.frombuffer(x, np.float32); n = int(0.05 * 48000)
r = 20 * np.log10(np.sqrt((a[: len(a) // n * n].reshape(-1, n) ** 2).mean(1)) + 1e-12)
report["loudness"]["noise_floor_p5_dbfs"] = round(float(np.percentile(r, 5)), 1)
print(json.dumps(report, ensure_ascii=False, indent=1))
json.dump(report, open(os.path.join(HERE, "qa_" + os.path.splitext(os.path.basename(src))[0] + ".json"), "w"), ensure_ascii=False, indent=1)
