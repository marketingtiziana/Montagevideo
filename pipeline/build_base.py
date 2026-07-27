import subprocess, imageio_ffmpeg
from segments import SRC, FPS, W, H, SEGMENTS, seg_durations, total_final

FF = imageio_ffmpeg.get_ffmpeg_exe()

# Build one filter_complex: trim + smooth zoom (crop w/h animated by segment-local t) + scale + concat
parts = []
vlabels, alabels = [], []
for i, (s, e, z0, z1) in enumerate(SEGMENTS):
    D = e - s
    N = max(1, int(round(FPS * D)))
    # smooth ken-burns zoom via zoompan; oversample x2 first for sub-pixel smoothness
    z = f"({z0}+({z1 - z0})*on/{N})"
    v = (
        f"[0:v]trim={s}:{e},setpts=PTS-STARTPTS,fps={FPS},"
        f"scale={W*2}:{H*2}:flags=bicubic,"
        f"zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
        f"format=yuv420p[v{i}]"
    )
    a = f"[0:a]atrim={s}:{e},asetpts=PTS-STARTPTS[a{i}]"
    parts.append(v); parts.append(a)
    vlabels.append(f"[v{i}]"); alabels.append(f"[a{i}]")

n = len(SEGMENTS)
concat = "".join(f"{vlabels[i]}{alabels[i]}" for i in range(n)) + f"concat=n={n}:v=1:a=1[vout][aout]"
fc = ";".join(parts) + ";" + concat

cmd = [FF, '-y', '-i', SRC, '-filter_complex', fc,
       '-map', '[vout]', '-map', '[aout]',
       '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
       '-c:a', 'aac', '-b:a', '160k', 'base.mp4']

print('final duration target:', total_final(), 's | durations:', seg_durations())
r = subprocess.run(cmd, capture_output=True, text=True)
print('returncode:', r.returncode)
if r.returncode != 0:
    print(r.stderr[-2000:])
