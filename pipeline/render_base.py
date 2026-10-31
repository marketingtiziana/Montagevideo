# -*- coding: utf-8 -*-
"""Cut + punch-ins + colour grade -> base.mp4 (1920x1080, 30 fps) with the raw voice track.
Each kept segment is rendered separately (memory-safe, parallel), then concatenated and graded."""
import subprocess, os, sys
from concurrent.futures import ThreadPoolExecutor
from config import SRC, WORK, W, H, FPS
from edl import KEEP, ZOOM, body_duration

SEGDIR = os.path.join(WORK, 'segs'); os.makedirs(SEGDIR, exist_ok=True)

def render_seg(i):
    (s, e), (z0, z1) = KEEP[i], ZOOM[i]
    D = round(e - s, 3)
    z = f"({z0}+({z1}-{z0})*t/{D})"
    vf = (f"fps={FPS},scale=w='trunc(iw*{z}/2)*2':h='trunc(ih*{z}/2)*2':eval=frame:flags=lanczos,"
          f"crop={W}:{H}:x='(iw-{W})/2':y='(ih-{H})*0.38',setsar=1")
    af = f"afade=t=in:d=0.008,afade=t=out:st={max(0, D-0.008)}:d=0.008"
    out = os.path.join(SEGDIR, f'seg{i:02d}.mkv')
    cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', str(s), '-to', str(e), '-i', SRC,
           '-vf', vf, '-af', af, '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-pix_fmt', 'yuv420p',
           '-c:a', 'pcm_s16le', '-threads', '2', out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print('seg', i, 'FAILED', r.stderr[-800:]); sys.exit(1)
    return out

with ThreadPoolExecutor(max_workers=2) as ex:
    files = list(ex.map(render_seg, range(len(KEEP))))

# frame-exact durations of the rendered segments (used by edl.src_to_final for sync)
import json
durs = []
for f in files:
    o = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-count_frames',
                        '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f],
                       capture_output=True, text=True).stdout.strip()
    durs.append(int(o) / FPS)
json.dump(durs, open(os.path.join(WORK, 'segdur.json'), 'w'))

# Audio is rebuilt from the SOURCE with each piece exactly as long as its rendered video
# segment (whole frames). Concatenating the per-segment audio instead would let a few ms
# of mismatch per cut accumulate into a visible lip-sync drift.
aparts, alabels = [], []
for i, ((s, e), d) in enumerate(zip(KEEP, durs)):
    aparts.append(f"[0:a]atrim=start={s}:duration={d:.6f},asetpts=PTS-STARTPTS,"
                  f"aresample=48000,apad=whole_dur={d:.6f},atrim=duration={d:.6f},"
                  f"afade=t=in:d=0.006,afade=t=out:st={max(0, d-0.006):.6f}:d=0.006[a{i}]")
    alabels.append(f"[a{i}]")
afc = ";".join(aparts) + ";" + "".join(alabels) + f"concat=n={len(KEEP)}:v=0:a=1[ao]"
audio_out = os.path.join(WORK, 'base_audio.wav')
r = subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-vn', '-i', SRC, '-filter_complex', afc,
                    '-map', '[ao]', '-c:a', 'pcm_s16le', audio_out], capture_output=True, text=True)
if r.returncode: print('audio FAILED', r.stderr[-800:]); sys.exit(1)

lst = os.path.join(SEGDIR, 'list.txt')
open(lst, 'w').write("".join(f"file '{os.path.abspath(f)}'\n" for f in files))

# Colour grade: clean high contrast, slightly warm, natural skin, light sharpening.
GRADE = (
    "eq=contrast=1.07:brightness=0.005:saturation=1.05,"
    "colorbalance=rs=0.02:bs=-0.035:rm=0.015:bm=-0.02:rh=0.01:bh=-0.015,"
    "curves=master='0/0 0.22/0.19 0.5/0.51 0.8/0.83 1/1',"
    "unsharp=5:5:0.4:5:5:0.0,format=yuv420p"
)
out = os.path.join(WORK, 'base.mp4')
cmd = ['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-i', audio_out,
       '-map', '0:v', '-map', '1:a', '-vf', GRADE, '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p',
       '-c:a', 'pcm_s16le', '-video_track_timescale', '30000', '-shortest', out]
r = subprocess.run(cmd, capture_output=True, text=True)
print(f'{len(KEEP)} segments -> body {body_duration()} s | rc:', r.returncode, r.stderr[-1200:] if r.returncode else 'OK')
