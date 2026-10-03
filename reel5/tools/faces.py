# 1 fps face/eye detection (OpenCV Haar) on the source picture (1080x1090 at the top of the 1080x1920 file)
# -> faces_raw.json ; then a low-pass (median + moving average) centre -> face_track.json
import cv2, glob, json, numpy as np
fc = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
ec = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_eye.xml")
cap = cv2.VideoCapture("source.mp4"); fps = cap.get(cv2.CAP_PROP_FPS); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
raw = []
for i in range(0, n, round(fps)):
    cap.set(cv2.CAP_PROP_POS_FRAMES, i); ok, im = cap.read()
    if not ok: break
    g = cv2.cvtColor(im[:1090], cv2.COLOR_BGR2GRAY)
    f = fc.detectMultiScale(g, 1.1, 6, minSize=(160, 160))
    if len(f) == 0: raw.append({"t": round(i / fps, 2)}); continue
    x, y, w, h = max(f, key=lambda r: r[2] * r[3])
    roi = g[y:y + h // 2 + h // 8, x:x + w]
    e = ec.detectMultiScale(roi, 1.1, 8, minSize=(w // 10, w // 10))
    ey = y + float(np.mean([b + d / 2 for a, b, c, d in e])) if len(e) else y + 0.40 * h
    raw.append({"t": round(i / fps, 2), "cx": float(x + w / 2), "eye_y": round(ey, 1), "w": int(w), "eyes": int(len(e))})
json.dump(raw, open("faces_raw.json", "w"), indent=0)
ok = [r for r in raw if "cx" in r]
cx = np.array([r["cx"] for r in ok]); ey = np.array([r["eye_y"] for r in ok]); w = np.array([r["w"] for r in ok])
print(f"detected {len(ok)}/{len(raw)}  cx {cx.min():.0f}-{np.median(cx):.0f}-{cx.max():.0f}  eye_y {ey.min():.0f}-{np.median(ey):.0f}-{ey.max():.0f}  w {w.min()}-{np.median(w):.0f}-{w.max()}")
