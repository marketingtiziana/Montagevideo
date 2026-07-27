# Compose final VIDEO: base + subtitles + animated overlays + flash transitions.
import subprocess, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

# overlay events: (png, start, end, x, y)  -- x may be expr
OVL = [
    ('assets/cli_be.png',  9.20, 13.00, '40', 300),
    ('assets/cli_fr.png', 10.40, 13.00, '40', 448),
    ('assets/cli_ch.png', 11.05, 13.00, '40', 596),
    ('assets/rate_de.png', 33.90, 39.20, '40', 300),
    ('assets/rate_be.png', 35.30, 39.20, '40', 448),
    ('assets/rate_ch.png', 36.50, 39.20, '40', 596),
    ('assets/x3.png',      42.50, 46.20, '740', 320),
    ('assets/oss.png',     74.90, 80.80, '(W-w)/2', 320),
]
# flash transitions (center time)
FLASH = [19.64, 52.18, 67.30]

inputs = ['-i', 'base.mp4']
idx = 1
ovl_idx = []
for (png, s, e, x, y) in OVL:
    dur = round(e - s, 3)
    inputs += ['-loop', '1', '-t', f'{dur}', '-itsoffset', f'{s}', '-i', png]
    ovl_idx.append(idx); idx += 1
flash_idx = []
for b in FLASH:
    s = round(b - 0.10, 3); dur = 0.30
    inputs += ['-loop', '1', '-t', f'{dur}', '-itsoffset', f'{s}', '-i', 'assets/flash.png']
    flash_idx.append((idx, b)); idx += 1

fc = []
# subtitles first
fc.append("[0:v]subtitles=subs.ass:fontsdir=fonts[v0]")
cur = 'v0'; n = 1

# flashes (under overlays, over video)
for (i, b) in flash_idx:
    s = b - 0.10
    fc.append(f"[{i}:v]format=rgba,fade=t=in:st={s}:d=0.09:alpha=1,fade=t=out:st={b}:d=0.13:alpha=1[fl{i}]")
    fc.append(f"[{cur}][fl{i}]overlay=0:0:eof_action=pass[v{n}]"); cur=f'v{n}'; n+=1

# animated chips: fade + slide-up
for k, (png, s, e, x, y) in zip(ovl_idx, OVL):
    dur = e - s
    fin = f"[{k}:v]format=rgba,fade=t=in:st={s}:d=0.22:alpha=1,fade=t=out:st={round(e-0.22,3)}:d=0.22:alpha=1[o{k}]"
    fc.append(fin)
    yexpr = f"if(lt(t\\,{s}+0.30)\\,{y}+50*(1-(t-{s})/0.30)\\,{y})"
    fc.append(f"[{cur}][o{k}]overlay=x={x}:y='{yexpr}':eof_action=pass[v{n}]"); cur=f'v{n}'; n+=1

fc_str = ";".join(fc)
cmd = [FF, '-y'] + inputs + ['-filter_complex', fc_str,
       '-map', f'[{cur}]', '-map', '0:a',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
       '-c:a', 'copy', 'finalv.mp4']
print("inputs:", len(OVL), "overlays,", len(FLASH), "flashes")
r = subprocess.run(cmd, capture_output=True, text=True)
print("rc:", r.returncode)
if r.returncode != 0:
    print(r.stderr[-2500:])
