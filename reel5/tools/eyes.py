# Eye line with YuNet (OpenCV FaceDetectorYN, landmarks 0-1 = eyes).
# usage: python3 tools/eyes.py VIDEO STEP_S [Y0 Y1] -> prints JSON list [t, eye_x_mid, eye_y_mid] (pixels of the analysed region, full-res coords)
import cv2, json, sys, os
src, step = sys.argv[1], float(sys.argv[2])
y0, y1 = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (0, None)
det = cv2.FaceDetectorYN.create(os.path.join(os.path.dirname(__file__), "..", "models", "yunet.onnx"), "", (320, 320), 0.7)
cap = cv2.VideoCapture(src); fps = cap.get(cv2.CAP_PROP_FPS); n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
out, i = [], 0
while i < n:
    cap.set(cv2.CAP_PROP_POS_FRAMES, i); ok, im = cap.read()
    if not ok: break
    reg = im[y0:y1]; h, w = reg.shape[:2]
    det.setInputSize((w, h)); _, f = det.detect(reg)
    if f is not None and len(f):
        f = max(f, key=lambda r: r[2] * r[3])
        out.append([round(i / fps, 3), round(float(f[4] + f[6]) / 2, 1), round(float(f[5] + f[7]) / 2 + y0, 1)])
    i += max(1, round(step * fps))
print(json.dumps(out))
