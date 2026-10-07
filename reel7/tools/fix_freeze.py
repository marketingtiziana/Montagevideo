# Patches the freeze-frame (element 20) in an existing base_depth.mp4 without re-running the plates:
# the white outline pixels below RING_Y (desk line) are inpainted away, every other frame is passed through.
# usage: python3 tools/fix_freeze.py   (reads base_depth.mp4, base60.mp4, matte60.mp4, depth.json -> base_depth_fixed.mp4)
import json, subprocess, sys, numpy as np, cv2
sys.path.insert(0, "tools")
from alpha import reader, alpha_of, W, H, FPS
RING_Y = 1600
f0, f1 = json.load(open("depth.json"))["freeze"]
i0 = next(i for i in range(10 ** 6) if i / FPS >= f0)
for i, (s, m) in enumerate(zip(reader("base60.mp4"), reader("matte60.mp4"))):
    if i == i0: al = (alpha_of(s, m) > 0.5).astype(np.uint8); break
ring = (cv2.dilate(al, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))) - al) > 0
bad = ring.copy(); bad[:RING_Y] = False
bad = cv2.dilate(bad.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3)))
enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                        "-c:v", "libx264", "-preset", "slow", "-crf", "12", "-pix_fmt", "yuv420p", "base_depth_fixed.mp4"], stdin=subprocess.PIPE)
held = None; n = 0
for i, f in enumerate(reader("base_depth.mp4")):
    if f0 <= i / FPS < f1:
        if held is None: held = cv2.inpaint(np.ascontiguousarray(f), bad, 5, cv2.INPAINT_TELEA); cv2.imwrite("scratch/freeze_fixed.jpg", cv2.cvtColor(held, cv2.COLOR_RGB2BGR)); n += 1
        f = held
    enc.stdin.write(f.tobytes())
enc.stdin.close(); enc.wait()
print("fixed", n, "freeze frame,", i + 1, "frames written")
