# Exact face landmarks at given source times (frame-accurate) — used for cut raccords.
# usage: from tools.face_at import FaceAt; fa = FaceAt("source.mp4"); fa(t) -> {"nose","eye","open","yaw"} or None
import cv2, numpy as np, mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
EYES = [33, 133, 362, 263]; NOSE = 1; LID = [(159, 145, 33, 133), (386, 374, 362, 263)]
class FaceAt:
    def __init__(self, src, model="models/face_landmarker.task"):
        self.cap = cv2.VideoCapture(src); self.fps = self.cap.get(cv2.CAP_PROP_FPS)
        self.W, self.H = int(self.cap.get(3)), int(self.cap.get(4))
        self.det = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
            base_options=mpt.BaseOptions(model_asset_path=model), running_mode=vision.RunningMode.IMAGE, num_faces=1))
    def frame(self, t):
        self.cap.set(cv2.CAP_PROP_POS_FRAMES, int(round(t * self.fps))); ok, fr = self.cap.read(); return fr if ok else None
    def __call__(self, t):
        fr = self.frame(t)
        r = self.det.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)))
        if not r.face_landmarks: return None
        L = np.array([(p.x * self.W, p.y * self.H) for p in r.face_landmarks[0]]); e = L[EYES]
        return {"nose": L[NOSE], "eye": e.mean(0),
                "yaw": float((L[NOSE][0] - e.mean(0)[0]) / (np.linalg.norm(L[263] - L[33]) + 1e-6)),
                "open": float(np.mean([np.linalg.norm(L[a] - L[b]) / (np.linalg.norm(L[c] - L[d]) + 1e-6) for a, b, c, d in LID]))}
