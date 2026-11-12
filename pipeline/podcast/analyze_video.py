"""Analyse visuelle (une passe) : visages (OpenCV Haar, 2 fps) + mouvement de la bouche (10 fps)
pour chaque moitié de l'image (gauche = invité, droite = hôte, cf. config.json 'cote_hote').
Sortie : work/visual.json  {fps, faces:{gauche:[[t,cx,cy,h]...], droite:[...]}, mouth:{gauche:[...], droite:[...]}}
Coordonnées en fraction de l'image source."""
import json, subprocess, numpy as np, cv2, sys
src = sys.argv[1] if len(sys.argv) > 1 else 'source.mp4'
W, H, FPS = 960, 540, 10
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'fps={FPS},scale={W}:{H}:flags=area,format=gray',
                      '-f', 'rawvideo', '-'], stdout=subprocess.PIPE, bufsize=W * H * 8)
casc = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
prof = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_profileface.xml')
halves = {'gauche': (0, W // 2), 'droite': (W // 2, W)}
faces = {k: [] for k in halves}; mouth = {k: [] for k in halves}
box = {'gauche': (240 - 480 // 4, 130, 70), 'droite': (720 - 480 // 4 + 120, 130, 70)}  # cx, cy, h (px) initial
box = {'gauche': (165, 150, 70), 'droite': (690, 140, 70)}
prev = None; i = 0
while True:
    buf = p.stdout.read(W * H)
    if len(buf) < W * H: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W); t = i / FPS
    if i % 5 == 0:
        for k, (x0, x1) in halves.items():
            sub = cv2.equalizeHist(f[:H * 2 // 3, x0:x1])
            d = list(casc.detectMultiScale(sub, 1.1, 5, minSize=(40, 40)))
            if not d:
                d = list(prof.detectMultiScale(sub, 1.1, 5, minSize=(40, 40)))
                d += [(sub.shape[1] - x - w, y, w, h) for (x, y, w, h) in prof.detectMultiScale(cv2.flip(sub, 1), 1.1, 5, minSize=(40, 40))]
            if d:
                cx0, cy0, _ = box[k]
                x, y, w, h = min(d, key=lambda r: (r[0] + x0 + r[2] / 2 - cx0) ** 2 + (r[1] + r[3] / 2 - cy0) ** 2)
                box[k] = (x + x0 + w / 2, y + h / 2, h)
                faces[k].append([round(t, 2), round(box[k][0] / W, 4), round(box[k][1] / H, 4), round(h / H, 4)])
    if prev is not None:
        for k in halves:
            cx, cy, h = box[k]
            y0, y1 = int(cy + 0.15 * h), int(cy + 0.75 * h); xa, xb = int(cx - 0.35 * h), int(cx + 0.35 * h)
            a = f[max(y0, 0):y1, max(xa, 0):xb].astype(np.int16); b = prev[max(y0, 0):y1, max(xa, 0):xb].astype(np.int16)
            mouth[k].append(round(float(np.abs(a - b).mean()) if a.size else 0.0, 3))
    else:
        for k in halves: mouth[k].append(0.0)
    prev = f; i += 1
    if i % 3000 == 0: print('t =', t, flush=True)
json.dump({'fps': FPS, 'faces': faces, 'mouth': mouth}, open('work/visual.json', 'w'))
print('frames', i, {k: len(v) for k, v in faces.items()})
