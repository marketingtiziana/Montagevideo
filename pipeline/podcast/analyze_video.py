"""Analyse visuelle en une passe (vidéo décodée à 10 fps en 960x540) :
  * visages : détecteur YuNet (OpenCV, ONNX opencv_zoo) toutes les 0,5 s, attribués à gauche / droite
  * bouche  : coins de la bouche (repères YuNet) -> mouvement moyen |frame - frame précédente| à 10 fps
  * tête    : mouvement de la boîte visage (hochements / sourires) pour les plans de réaction
Sortie : work/visual.json {fps, faces:{gauche,droite:[[t,cx,cy,w,h,score]]}, mouth:{...}, head:{...}}
(coordonnées en fraction de l'image source)"""
import json, subprocess, sys, numpy as np, cv2
src = sys.argv[1] if len(sys.argv) > 1 else 'source.mp4'
W, H, FPS = 960, 540, 10
det = cv2.FaceDetectorYN.create('models/yunet/yunet.onnx', '', (W, H), 0.6, 0.3, 50)
p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'fps={FPS},scale={W}:{H}:flags=area', '-pix_fmt', 'bgr24',
                      '-f', 'rawvideo', '-'], stdout=subprocess.PIPE, bufsize=W * H * 3 * 4)
sides = ('gauche', 'droite')
faces = {k: [] for k in sides}; mouth = {k: [] for k in sides}; head = {k: [] for k in sides}
last = {'gauche': None, 'droite': None}
prev = None; i = 0
while True:
    buf = p.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    f = np.frombuffer(buf, np.uint8).reshape(H, W, 3); g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY); t = i / FPS
    if i % 5 == 0:
        _, D = det.detect(f)
        for k in sides:
            cand = [] if D is None else [d for d in D if (d[0] + d[2] / 2 < W / 2) == (k == 'gauche')]
            if cand:
                d = max(cand, key=lambda d: d[14] * d[2] * d[3])
                old = last[k]; last[k] = d
                faces[k].append([round(t, 2), round(float(d[0] + d[2] / 2) / W, 4), round(float(d[1] + d[3] / 2) / H, 4),
                                 round(float(d[2]) / W, 4), round(float(d[3]) / H, 4), round(float(d[14]), 3)])
                head[k].append(round(0.0 if old is None else float(np.hypot(*(d[:2] - old[:2]))) / W * 100, 3))
    for k in sides:
        d = last[k]
        if prev is None or d is None: mouth[k].append(0.0); continue
        (mx1, my1), (mx2, my2) = d[10:12], d[12:14]; fw = d[2]
        x0, x1 = int(min(mx1, mx2) - 0.15 * fw), int(max(mx1, mx2) + 0.15 * fw)
        y0, y1 = int(min(my1, my2) - 0.15 * fw), int(max(my1, my2) + 0.25 * fw)
        a = g[max(y0, 0):y1, max(x0, 0):x1].astype(np.int16); b = prev[max(y0, 0):y1, max(x0, 0):x1].astype(np.int16)
        mouth[k].append(round(float(np.abs(a - b).mean()), 3) if a.size else 0.0)
    prev = g; i += 1
    if i % 3000 == 0: print('t =', t, flush=True)
json.dump({'fps': FPS, 'faces': faces, 'mouth': mouth, 'head': head}, open('work/visual.json', 'w'))
print('frames', i, {k: len(v) for k, v in faces.items()})
