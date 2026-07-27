import subprocess, re, json, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

BASE = 'base.mp4'
# probe duration
out = subprocess.run([FF, '-i', BASE], capture_output=True, text=True).stderr
DUR = None
m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', out)
if m: DUR = int(m[1])*3600 + int(m[2])*60 + float(m[3])
print('base duration:', DUR)

# silence detection
sd = subprocess.run([FF, '-i', 'base16.wav', '-af', 'silencedetect=noise=-32dB:d=0.32', '-f', 'null', '-'],
                    capture_output=True, text=True).stderr
starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', sd)]
ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', sd)]
sil = list(zip(starts, ends))

# Build CUT intervals: keep only KEEP_PAD at the start of each silence, remove the rest.
KEEP_PAD = 0.12   # natural micro-pause left after a word
HEAD_PAD = 0.06   # keep a hair before next word onset
cuts = []
for s, e in sil:
    cs = s + KEEP_PAD
    ce = e - HEAD_PAD
    if ce - cs > 0.06:
        cuts.append((round(cs, 3), round(ce, 3)))

# Manual cuts (base timeline):
#  - the cough at the start of S3 (~source 88-90)
#  - the first, buggy attempt of "Si tu vends à l'international" (she restarts it)
MANUAL_CUTS = [(52.10, 54.55), (93.70, 95.46)]
cuts += MANUAL_CUTS
# merge/clip
cuts.sort()
# merge overlaps
merged = []
for cs, ce in cuts:
    if merged and cs <= merged[-1][1]:
        merged[-1] = (merged[-1][0], max(merged[-1][1], ce))
    else:
        merged.append((cs, ce))
cuts = merged
print('cuts:', len(cuts), 'total removed:', round(sum(e-s for s, e in cuts), 2), 's')

# KEEP segments = complement of cuts within [0, DUR]
keep = []
t = 0.0
for cs, ce in cuts:
    if cs > t:
        keep.append((round(t, 3), round(cs, 3)))
    t = max(t, ce)
if t < DUR:
    keep.append((round(t, 3), round(DUR, 3)))
keep = [(s, e) for s, e in keep if e - s > 0.03]
newdur = sum(e - s for s, e in keep)
print('keep segs:', len(keep), 'new duration:', round(newdur, 2), 's')
json.dump({'keep': keep, 'base_dur': DUR, 'new_dur': newdur}, open('remap.json', 'w'))

# Render base2.mp4 (tightened) from base.mp4
parts, vl, al = [], [], []
for i, (s, e) in enumerate(keep):
    parts.append(f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS[v{i}]")
    parts.append(f"[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS[a{i}]")
    vl.append(f"[v{i}]"); al.append(f"[a{i}]")
concat = "".join(f"{vl[i]}{al[i]}" for i in range(len(keep))) + f"concat=n={len(keep)}:v=1:a=1[vo][ao]"
fc = ";".join(parts) + ";" + concat
cmd = [FF, '-y', '-i', BASE, '-filter_complex', fc, '-map', '[vo]', '-map', '[ao]',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
       '-c:a', 'aac', '-b:a', '192k', 'base2.mp4']
r = subprocess.run(cmd, capture_output=True, text=True)
print('base2 rc:', r.returncode)
if r.returncode: print(r.stderr[-1500:])
