# Compose final VIDEO on the tightened base2.mp4:
# base + subtitles + MANY animated overlays + flash transitions.  Times are given on the
# OLD base timeline and remapped to base2 via remap.map_time.
import subprocess, json, imageio_ffmpeg
from remap import map_time
FF = imageio_ffmpeg.get_ffmpeg_exe()
W_, H_ = 1080, 1920

# (png, start_old, end_old, x, y)   x may be an ffmpeg expr string
OVL_OLD = [
    ('assets/cli_be.png',  9.20, 12.40, '40', 300),
    ('assets/cli_fr.png', 10.40, 12.40, '40', 470),
    ('assets/cli_ch.png', 11.10, 12.40, '40', 640),
    ('assets/s_20.png',   14.30, 15.90, '660', 300),
    ('assets/s_faux.png', 16.40, 19.20, '300', 270),
    ('assets/s_particulier.png', 23.60, 25.60, '40', 300),
    ('assets/rate_de.png', 33.90, 39.10, '40', 300),
    ('assets/rate_be.png', 35.30, 39.10, '40', 470),
    ('assets/rate_ch.png', 36.50, 39.10, '40', 640),
    ('assets/x3.png',      42.30, 45.00, '720', 300),
    ('assets/s_part3.png', 45.10, 47.60, '40', 320),
    ('assets/s_entreprise.png', 48.30, 50.60, '520', 300),
    ('assets/s_warn.png',  56.20, 58.20, '40', 300),
    ('assets/s_poche.png', 65.30, 67.20, '250', 280),
    ('assets/s_ok.png',    67.30, 69.60, '40', 300),
    ('assets/s_1decl.png', 74.90, 77.00, '470', 300),
    ('assets/s_oss.png',   77.10, 80.60, '(W-w)/2', 290),
    ('assets/s_cta.png',   97.30, 100.34, '(W-w)/2', 290),
]
FLASH_OLD = [3.2, 16.35, 19.27, 42.3, 52.1, 67.3, 87.4, 97.35]
POP_OLD = [16.4, 42.3, 65.3, 67.3, 77.1, 97.3]   # badge appearances

# remap
OVL = [(p, map_time(s), map_time(e), x, y) for (p, s, e, x, y) in OVL_OLD]
FLASH = sorted(set(round(map_time(b), 3) for b in FLASH_OLD))
POPS = sorted(set(round(map_time(b), 3) for b in POP_OLD))
json.dump({'whoosh': FLASH, 'pop': POPS}, open('audio_events.json', 'w'))

inputs = ['-i', 'base2.mp4']; idx = 1
ovl_idx = []
for (p, s, e, x, y) in OVL:
    dur = max(0.3, round(e - s, 3))
    inputs += ['-loop', '1', '-t', f'{dur}', '-itsoffset', f'{s}', '-i', p]; ovl_idx.append(idx); idx += 1
flash_idx = []
for b in FLASH:
    inputs += ['-loop', '1', '-t', '0.30', '-itsoffset', f'{round(b-0.10,3)}', '-i', 'assets/flash.png']
    flash_idx.append((idx, b)); idx += 1

fc = ["[0:v]subtitles=subs.ass:fontsdir=fonts[v0]"]
cur, n = 'v0', 1
for (i, b) in flash_idx:
    s = round(b-0.10, 3)
    fc.append(f"[{i}:v]format=rgba,fade=t=in:st={s}:d=0.08:alpha=1,fade=t=out:st={b}:d=0.14:alpha=1[fl{i}]")
    fc.append(f"[{cur}][fl{i}]overlay=0:0:eof_action=pass[v{n}]"); cur=f'v{n}'; n+=1
for k, (p, s, e, x, y) in zip(ovl_idx, OVL):
    fc.append(f"[{k}:v]format=rgba,fade=t=in:st={s}:d=0.20:alpha=1,fade=t=out:st={round(e-0.20,3)}:d=0.20:alpha=1[o{k}]")
    yexpr = f"if(lt(t\\,{s}+0.28)\\,{y}+55*(1-(t-{s})/0.28)\\,{y})"
    fc.append(f"[{cur}][o{k}]overlay=x={x}:y='{yexpr}':eof_action=pass[v{n}]"); cur=f'v{n}'; n+=1

cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
       '-map', f'[{cur}]', '-map', '0:a',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
       '-c:a', 'copy', 'finalv.mp4']
print(f"{len(OVL)} overlays, {len(FLASH)} flashes")
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode: print(r.stderr[-2500:])
