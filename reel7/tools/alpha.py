# Shared by depth.py and fix_freeze.py: raw frame reader and the alpha rebuilt from the remove_background matte.
import subprocess, numpy as np, cv2
W, H, FPS = 1080, 1920, 60
def reader(path):
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-i", path, "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    while True:
        b = p.stdout.read(W * H * 3)
        if len(b) < W * H * 3: return
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)
K9 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)); K5 = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
yy = np.arange(H)[:, None]; xx = np.arange(W)[None, :]
BAND = (xx > 330) & (xx < 800) & (yy > 820) & (yy < 1700)
def alpha_of(s, m):
    ls = s.max(2).astype(np.float32); lm = m.max(2).astype(np.float32)
    fg = cv2.morphologyEx((lm > 2).astype(np.uint8), cv2.MORPH_CLOSE, K9)
    mic = cv2.morphologyEx(cv2.morphologyEx(((lm <= 2) & (ls < 95) & BAND).astype(np.uint8), cv2.MORPH_OPEN, K5), cv2.MORPH_CLOSE, K9)
    fg = np.maximum(fg, mic)
    # fill only SMALL holes (gold buttons, specks in the dark blazer); real background gaps (arm / torso, under the table) stay
    n, lab, st, _ = cv2.connectedComponentsWithStats((1 - fg).astype(np.uint8), connectivity=4)
    small = np.zeros(n, bool); small[1:] = st[1:, cv2.CC_STAT_AREA] < 4000
    small[lab[0, 0]] = small[lab[0, -1]] = small[lab[-1, 0]] = small[lab[-1, -1]] = False
    fg = np.where(small[lab] & (fg == 0), 1, fg).astype(np.uint8)
    edge = (cv2.dilate(fg, K5) - cv2.erode(fg, K5)) > 0                       # 2–4 px band around the silhouette
    ratio = np.clip(lm / np.maximum(ls, 1.0), 0, 1)
    a = fg.astype(np.float32); a[edge & (mic == 0)] = ratio[edge & (mic == 0)]
    return cv2.GaussianBlur(a, (0, 0), 1.0)
