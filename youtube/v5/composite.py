"""Compose la vidéo finale image par image : base.mp4 + graphismes (PNG) + sous-titres (ASS) + mix audio.

usage : python3 composite.py [--preview] [--from S --to S] [--out fichier.mp4]
  --preview : export 1280x720 léger pour validation
"""
import json, os, subprocess, sys, numpy as np, cv2
from timeline import FPS, HERE
from gfx import VIDEO_BOX
MED = os.path.join(HERE, 'build', 'media'); GFX = os.path.join(HERE, 'build', 'gfx')
W, H = 1920, 1080
args = sys.argv[1:]
def opt(k, d=None):
    return args[args.index(k) + 1] if k in args else d
PREVIEW = '--preview' in args
T0, T1 = float(opt('--from', 0)), opt('--to')
OUTF = opt('--out', os.path.join(MED, 'preview_720p.mp4' if PREVIEW else 'final_1080p.mp4'))

man = json.load(open(os.path.join(HERE, 'build', 'gfx_manifest.json')))
from plan import build_clips, src2out
from timeline import PUNCH, G as TL
CLIPS, _ = build_clips()
SRC = [(c['o_f'] / FPS, (c['o_f'] + c['e_f'] - c['s_f']) / FPS, k) for k, c in enumerate(CLIPS) if c['kind'] == 'src']
LOCK = [(g['start'], g['end']) for g in man if g['kind'] in ('CARD', 'LT')]
PUNCH_OUT = [o for o in (src2out(t, CLIPS) for t in PUNCH) if o is not None and not any(a <= o < b for a, b in LOCK)]
# repère d'étape : entre la fin d'un carton de chapitre et le début du suivant
CH = sorted([g for g in man if g['tpl'] == 'chapter'], key=lambda g: g['start'])
REC = [g for g in man if g['id'] == 'recap'][0]
HUD = [(c['end'], (CH[i + 1]['start'] if i + 1 < len(CH) else REC['start']), i + 1) for i, c in enumerate(CH)]
HIDE = [(g['start'], g['end']) for g in man if g['kind'] in ('FULL', 'SPLIT')]

def camera(frame, t):
    """Poussée lente continue (sens alterné d'un plan à l'autre) + zoom d'emphase sur les phrases fortes."""
    seg = next(((a, b, k) for a, b, k in SRC if a <= t < b), None)
    if seg is None: return frame
    a, b, k = seg
    u = (t - a) / max(0.5, b - a)
    z = 1.0 + 0.045 * (u if k % 2 == 0 else 1 - u)
    for p in PUNCH_OUT:
        if a <= p <= t < b:
            z += 0.09 * ease((t - p) / 0.22)
    if any(a2 <= t < b2 for a2, b2 in LOCK): z = min(z, 1.03)
    if z <= 1.0005: return frame
    cx, cy = 930, 380
    M = np.float32([[z, 0, cx * (1 - z)], [0, z, cy * (1 - z)]])
    return cv2.warpAffine(frame, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

def hud_alpha(t):
    for a, b, n in HUD:
        if a <= t < b:
            al = min(1, (t - a) / 0.3, (b - t) / 0.3)
            for h0, h1 in HIDE:
                if h0 - 0.3 <= t < h1 + 0.3: al = min(al, max(0, (h0 - t) / 0.3, (t - h1) / 0.3))
            return n, max(0, al)
    return None, 0
total = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0',
                              os.path.join(MED, 'base.mp4')], capture_output=True, text=True).stdout)
T1 = float(T1) if T1 else total
N0, N1 = int(round(T0 * FPS)), int(round(T1 * FPS))

def ease(x): x = min(1, max(0, x)); return 1 - (1 - x) ** 3 if x < 1 else 1.0

_cache = {}
def png(gid, i):
    d = os.path.join(GFX, gid)
    n = len([f for f in os.listdir(d) if f.endswith('.png')]) if gid not in _cache else _cache[gid]
    _cache[gid] = n
    i = max(0, min(n - 1, i))
    return cv2.imread(os.path.join(d, f'f{i:04d}.png'), cv2.IMREAD_UNCHANGED)

def blend(dst, rgba, bbox=None):
    if rgba is None: return dst
    if rgba.ndim == 2: rgba = cv2.cvtColor(rgba, cv2.COLOR_GRAY2BGR)
    if rgba.shape[2] == 3:                      # image opaque (sans canal alpha)
        if bbox is None: return rgba.copy()
        y0, y1, x0, x1 = bbox; dst[y0:y1, x0:x1] = rgba[y0:y1, x0:x1]; return dst
    if bbox is None:
        a = rgba[:, :, 3]
        ys, xs = np.nonzero(a > 0)
        if len(ys) == 0: return dst
        bbox = (ys.min(), ys.max() + 1, xs.min(), xs.max() + 1)
    y0, y1, x0, x1 = bbox
    fg = rgba[y0:y1, x0:x1, :3].astype(np.uint16); al = rgba[y0:y1, x0:x1, 3:4].astype(np.uint16)
    bg = dst[y0:y1, x0:x1].astype(np.uint16)
    dst[y0:y1, x0:x1] = ((fg * al + bg * (255 - al) + 127) // 255).astype(np.uint8)
    return dst

def rounded_mask(w, h, r):
    m = np.zeros((h, w), np.uint8)
    cv2.rectangle(m, (r, 0), (w - r - 1, h - 1), 255, -1); cv2.rectangle(m, (0, r), (w - 1, h - r - 1), 255, -1)
    for cx, cy in ((r, r), (w - r - 1, r), (r, h - r - 1), (w - r - 1, h - r - 1)): cv2.circle(m, (cx, cy), r, 255, -1, cv2.LINE_AA)
    return m

def split_frame(base, g, t):
    i = int(round((t - g['start']) * FPS))
    bg = png(g['id'], i)
    bg = (cv2.cvtColor(bg, cv2.COLOR_GRAY2BGR) if bg.ndim == 2 else bg[:, :, :3]).copy()
    p_in = 1.0 if g['prev_split'] else ease((t - g['start']) / 0.55)
    p_out = 1.0 if g['next_split'] else ease((g['end'] - t) / 0.55)
    p = min(p_in, p_out)
    bx, by, bw, bh = VIDEO_BOX
    x = int(round(bx * p)); y = int(round(by * p)); w = int(round(W + (bw - W) * p)); h = int(round(w * 9 / 16))
    if p <= 0.001: return base
    small = cv2.resize(base, (w, h), interpolation=cv2.INTER_AREA)
    r = int(round(14 * p))
    if r >= 1:
        m = rounded_mask(w, h, r)[:, :, None].astype(np.uint16)
        roi = bg[y:y + h, x:x + w].astype(np.uint16)
        bg[y:y + h, x:x + w] = ((small.astype(np.uint16) * m + roi * (255 - m)) // 255).astype(np.uint8)
    else:
        bg[y:y + h, x:x + w] = small
    return bg

def main():
    dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-ss', f'{T0:.3f}', '-i', os.path.join(MED, 'base.mp4'), '-frames:v', str(N1 - N0),
                            '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], stdout=subprocess.PIPE, bufsize=W * H * 3 * 4)
    subs = os.path.join(HERE, 'build', 'subs.ass')
    vf = f"ass='{subs}'" + (",scale=1280:720:flags=lanczos" if PREVIEW else "")
    enc_v = (['-c:v', 'libx264', '-preset', 'faster', '-crf', '24', '-maxrate', '2.2M', '-bufsize', '4M'] if PREVIEW
             else ['-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-profile:v', 'high', '-tune', 'film'])
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-ss', f'{T0:.3f}', '-t', f'{T1 - T0:.3f}', '-i', os.path.join(MED, 'mix.wav'),
                            '-vf', f"setpts=PTS+{T0}/TB,{vf},setpts=PTS-STARTPTS", '-map', '0:v', '-map', '1:a'] + enc_v +
                           ['-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k' if PREVIEW else '320k', '-movflags', '+faststart', OUTF],
                           stdin=subprocess.PIPE)
    bboxes = {}
    for f in range(N0, N1):
        buf = dec.stdout.read(W * H * 3)
        if len(buf) < W * H * 3: break
        frame = np.frombuffer(buf, np.uint8).reshape(H, W, 3).copy()
        t = f / FPS
        frame = camera(frame, t)
        act = [g for g in man if g['start'] <= t < g['end']]
        for g in sorted(act, key=lambda g: {'SPLIT': 0, 'FULL': 1, 'CARD': 2, 'LT': 2}[g['kind']]):
            i = int(round((t - g['start']) * FPS))
            if g['kind'] == 'SPLIT':
                frame = split_frame(frame, g, t)
            else:
                im = png(g['id'], i)
                if g['kind'] in ('CARD', 'LT'):
                    if g['id'] not in bboxes:
                        mid = png(g['id'], int((g['end'] - g['start']) * FPS * 0.5))
                        a = mid[:, :, 3] if mid.ndim == 3 and mid.shape[2] == 4 else np.full(mid.shape[:2], 255, np.uint8)
                        ys, xs = np.nonzero(a > 0)
                        bboxes[g['id']] = (max(0, ys.min() - 60), min(H, ys.max() + 60), max(0, xs.min() - 80), min(W, xs.max() + 80))
                    frame = blend(frame, im, bboxes[g['id']])
                else:
                    frame = blend(frame, im, (0, H, 0, W))
        n, al = hud_alpha(t)
        if n and al > 0.01:
            hud = png(f'hud_{n}', 0)
            if al < 0.999: hud = hud.copy(); hud[:, :, 3] = (hud[:, :, 3].astype(np.float32) * al).astype(np.uint8)
            frame = blend(frame, hud, (0, 220, 0, 900))
        enc.stdin.write(frame.tobytes())
        if f % 500 == 0: print(f'{t:7.1f}s / {T1:.1f}s', flush=True)
    enc.stdin.close(); enc.wait(); dec.wait()
    print('OK', OUTF)

if __name__ == '__main__': main()
