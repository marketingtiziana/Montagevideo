# Brand gradient-map grade for generated plates: luminance -> FYNOVATES navy ramp (near-black -> navy -> white).
import numpy as np, glob, os
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
stops = [(0.00, (6, 4, 18)), (0.18, (13, 8, 46)), (0.45, (36, 28, 104)), (0.75, (150, 144, 214)), (1.00, (255, 255, 255))]
def ramp(L):
    xs = [s[0] for s in stops]; out = np.zeros(L.shape + (3,))
    for c in range(3): out[..., c] = np.interp(L, xs, [s[1][c] for s in stops])
    return out
for f in glob.glob(os.path.join(HERE, 'assets/plates/plate_*.jpg')):
    if f.endswith('_graded.jpg'): continue
    a = np.asarray(Image.open(f).convert('RGB')).astype(float)
    L = (a @ [0.2126, 0.7152, 0.0722]) / 255.0
    L = np.clip((L - 0.02) / 0.9, 0, 1) ** 1.08          # deepen blacks, keep highlights
    g = 0.88 * ramp(L) + 0.12 * a
    Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).save(f.replace('.jpg', '_graded.jpg'), quality=93)
    print('graded', os.path.basename(f))
