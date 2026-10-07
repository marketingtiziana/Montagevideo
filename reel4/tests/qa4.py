# Reel 4 QA on a rendered file: format, duration, loudness, cut timing vs the script (and the 120 BPM grid), motion (no static window > 1.0 s),
# audio impacts vs their events. usage: python3 tests/qa4.py video.mp4 [out.json]
import json, re, subprocess, sys
import cv2, numpy as np

src = sys.argv[1]
T = json.load(open("edit_times.json"))
res = {}

info = subprocess.run(["ffmpeg", "-hide_banner", "-i", src], capture_output=True, text=True).stderr
v = re.search(r"Video: (\w+).*?, (\d+)x(\d+).*?, (?:(\d+) kb/s, )?([\d.]+) fps", info)
a = re.search(r"Audio: (\w+).*?, (\d+) Hz.*?(?:, (\d+) kb/s)?", info)
d = re.search(r"Duration: (\d+):(\d+):([\d.]+)", info)
res["format"] = {"video": v.groups() if v else None, "audio": a.groups() if a else None,
                 "duration": round(int(d[1]) * 3600 + int(d[2]) * 60 + float(d[3]), 3) if d else None,
                 "faststart": None}
with open(src, "rb") as f:
    head = f.read(1 << 20)
res["format"]["faststart"] = head.find(b"moov") != -1 and (head.find(b"mdat") == -1 or head.find(b"moov") < head.find(b"mdat"))

if a:
    e = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-i", src, "-filter_complex", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    summ = e[e.rfind("Summary:"):]
    g = lambda k: float(re.search(k + r":\s+(-?[\d.]+)", summ)[1])
    res["loudness"] = {"I_LUFS": g("I"), "LRA": g("LRA"), "true_peak_dBFS": g("Peak")}

# motion + cuts (downscaled luma)
cap = cv2.VideoCapture(src)
fps = cap.get(cv2.CAP_PROP_FPS)
prev = None; diffs = []
while True:
    ok, fr = cap.read()
    if not ok: break
    g = cv2.cvtColor(cv2.resize(fr, (135, 240)), cv2.COLOR_BGR2GRAY).astype(np.float32)
    diffs.append(0.0 if prev is None else float(np.mean(np.abs(g - prev))))
    prev = g
diffs = np.array(diffs); t = np.arange(len(diffs)) / fps
# longest window where mean abs frame difference stays under 0.35 (visually frozen)
still = diffs < 0.35; best = cur = 0   # brief: zero static frames, max still window 1.0 s
for s in still[1:]:
    cur = cur + 1 if s else 0; best = max(best, cur)
res["motion"] = {"longest_still_s": round(best / fps, 2), "median_diff": round(float(np.median(diffs[1:])), 3)}
# detected cuts: diff peaks well above the local median
cuts = []
for i in range(2, len(diffs) - 2):
    loc = np.median(diffs[max(1, i - 15): i + 15])
    if diffs[i] > max(6.0, 4 * loc) and diffs[i] == diffs[i - 2: i + 3].max(): cuts.append(round(t[i], 3))
planned = sorted([s["t0"] for s in T["screens"][1:] if s["tr"] != "none"] + [3.0])   # + the Dubaï -> New York split
res["beat_grid"] = {"all_cuts_on_beat": all(abs(p / 0.5 - round(p / 0.5)) < 1e-6 for p in planned)}
match = []
for p in planned:
    near = [c for c in cuts if abs(c - p) < 0.25]
    match.append({"planned": p, "detected": near[0] if near else None, "err_ms": round((near[0] - p) * 1000) if near else None})
res["cuts"] = {"detected": cuts, "vs_script": match}

# audio onsets vs cuts (drop + fact hits): envelope rise within ±80 ms of the cut
if a:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
    x = np.frombuffer(pcm, np.int16).astype(np.float32) / 32768
    hop = 80; env = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, "same"))[::hop]; et = np.arange(len(env)) * hop / 8000
    flux = np.maximum(0, np.diff(env, prepend=env[0]))
    hits = []
    for at, kind in T["events"]:
        if kind not in ("impact", "drop", "ding", "impact_soft"): continue
        w = (et > at - 0.12) & (et < at + 0.12)
        if w.any():
            k = np.argmax(flux * w); hits.append({"event": kind, "t": at, "onset": round(float(et[k]), 3), "err_ms": round((et[k] - at) * 1000)})
    res["audio_hits"] = hits
out = sys.argv[2] if len(sys.argv) > 2 else None
if out: json.dump(res, open(out, "w"), indent=1, ensure_ascii=False)
print(json.dumps({k: v for k, v in res.items() if k != "cuts"}, ensure_ascii=False, indent=1))
print("cuts matched:", sum(m["detected"] is not None for m in res["cuts"]["vs_script"]), "/", len(planned),
      "max |err| ms:", max([abs(m["err_ms"]) for m in res["cuts"]["vs_script"] if m["err_ms"] is not None] or [None]))
