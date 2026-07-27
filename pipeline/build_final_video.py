# Compose final VIDEO on tightened base2.mp4:
# base + subtitles + centered overlays (just above subtitles) + section flashes + mini-cut flashes.
import subprocess, json, imageio_ffmpeg
from remap import map_time, KEEP
FF = imageio_ffmpeg.get_ffmpeg_exe()

CX = '(W-w)/2'            # horizontal center -> never off-screen
Y_SINGLE = 820           # overlay band: above subtitles (MarginV 560), below her head
ROWS = [590, 748, 906]   # stacked groups (flags / rates)

# (png, start_old, end_old, x, y)
OVL_OLD = [
    ('assets/s_hook.png',  1.00,  3.40, CX, Y_SINGLE),
    ('assets/s_secret.png', 4.80,  6.60, CX, Y_SINGLE),
    ('assets/s_online.png', 7.34,  9.05, CX, Y_SINGLE),
    ('assets/cli_be.png',  9.20, 12.40, CX, ROWS[0]),
    ('assets/cli_fr.png', 10.40, 12.40, CX, ROWS[1]),
    ('assets/cli_ch.png', 11.10, 12.40, CX, ROWS[2]),
    ('assets/s_facture.png', 12.70, 14.20, CX, Y_SINGLE),
    ('assets/s_20.png',   14.30, 15.30, CX, Y_SINGLE),
    ('assets/s_logique.png', 15.30, 16.30, CX, Y_SINGLE),
    ('assets/s_faux.png', 16.40, 19.20, CX, Y_SINGLE),
    ('assets/s_particulier.png', 23.60, 25.60, CX, Y_SINGLE),
    ('assets/rate_de.png', 33.90, 39.10, CX, ROWS[0]),
    ('assets/rate_be.png', 35.30, 39.10, CX, ROWS[1]),
    ('assets/rate_ch.png', 36.50, 39.10, CX, ROWS[2]),
    ('assets/x3.png',      42.30, 45.00, CX, Y_SINGLE),
    ('assets/s_part3.png', 45.10, 46.20, CX, Y_SINGLE),
    ('assets/s_money.png', 46.30, 47.90, CX, Y_SINGLE),
    ('assets/s_entreprise.png', 48.30, 50.60, CX, Y_SINGLE),
    ('assets/s_warn.png',  56.20, 58.20, CX, Y_SINGLE),
    ('assets/s_poche.png', 65.30, 67.20, CX, Y_SINGLE),
    ('assets/s_ok.png',    67.30, 69.60, CX, Y_SINGLE),
    ('assets/s_eu.png',    72.70, 73.90, CX, Y_SINGLE),
    ('assets/s_1decl.png', 74.90, 77.00, CX, Y_SINGLE),
    ('assets/s_oss.png',   77.10, 80.60, CX, Y_SINGLE),
    ('assets/s_cta.png',   97.30, 100.34, CX, Y_SINGLE),
    ('assets/s_arrow.png', 97.30, 100.34, CX, 628),
]
FLASH_OLD = [3.2, 16.35, 19.27, 23.6, 42.3, 52.1, 67.3, 74.9, 87.4, 97.35]   # section transitions
POP_OLD = [16.4, 42.3, 65.3, 67.3, 77.1, 97.3]

# --- cut points on the tightened timeline (jump-cuts from silence removal) ---
cuts_new, acc = [], 0.0
for i in range(len(KEEP)-1):
    acc += KEEP[i][1]-KEEP[i][0]
    removed = KEEP[i+1][0]-KEEP[i][1]
    cuts_new.append((round(acc, 3), round(removed, 3)))
TICKS = [t for (t, r) in cuts_new if 0.30 < r <= 0.55]  # small tick on minor cuts
WHOOSH_CUT = [t for (t, r) in cuts_new if r > 0.55]     # soft whoosh on bigger cuts
MINIFLASH = [t for (t, r) in cuts_new if r > 0.28]      # coloured blink between plans

OVL = [(p, map_time(s), map_time(e), x, y) for (p, s, e, x, y) in OVL_OLD]
FLASH = sorted(set(round(map_time(b), 3) for b in FLASH_OLD))
POPS = sorted(set(round(map_time(b), 3) for b in POP_OLD))
APPEAR = sorted(round(s, 3) for (p, s, e, x, y) in OVL)   # overlay/incrustation appearance times
json.dump({'whoosh': FLASH, 'appear': APPEAR, 'tick': TICKS, 'whoosh_cut': WHOOSH_CUT},
          open('audio_events.json', 'w'))

inputs = ['-i', 'base2.mp4']; idx = 1
ovl_idx = []
for (p, s, e, x, y) in OVL:
    dur = max(0.3, round(e - s, 3))
    inputs += ['-loop', '1', '-t', f'{dur}', '-itsoffset', f'{s}', '-i', p]; ovl_idx.append(idx); idx += 1
FLASH_PNGS = ['assets/flash.png', 'assets/flash_b.png', 'assets/flash_p.png',
              'assets/flash_c.png', 'assets/flash_o.png']
flash_idx = []
for j, b in enumerate(FLASH):
    png = FLASH_PNGS[j % len(FLASH_PNGS)]
    inputs += ['-loop', '1', '-t', '0.30', '-itsoffset', f'{round(b-0.10,3)}', '-i', png]
    flash_idx.append((idx, b, 0.08, 0.14)); idx += 1
MINI_PNGS = ['assets/mini_b.png', 'assets/mini_p.png', 'assets/mini_c.png',
             'assets/mini_o.png', 'assets/mini_w.png']
mini_idx = []
for j, b in enumerate(MINIFLASH):
    inputs += ['-loop', '1', '-t', '0.18', '-itsoffset', f'{round(b-0.05,3)}', '-i', MINI_PNGS[j % len(MINI_PNGS)]]
    mini_idx.append((idx, b, 0.04, 0.09)); idx += 1

fc = ["[0:v]subtitles=subs.ass:fontsdir=fonts[v0]"]
cur, n = 'v0', 1
for (i, b, din, dout) in flash_idx + mini_idx:
    s = round(b-0.05, 3)
    fc.append(f"[{i}:v]format=rgba,fade=t=in:st={s}:d={din}:alpha=1,fade=t=out:st={b}:d={dout}:alpha=1[fl{i}]")
    fc.append(f"[{cur}][fl{i}]overlay=0:0:eof_action=pass[v{n}]"); cur=f'v{n}'; n+=1
for k, (p, s, e, x, y) in zip(ovl_idx, OVL):
    fc.append(f"[{k}:v]format=rgba,fade=t=in:st={s}:d=0.20:alpha=1,fade=t=out:st={round(e-0.20,3)}:d=0.20:alpha=1[o{k}]")
    # slide-up entrance, then gentle continuous float (bob)
    yexpr = f"if(lt(t\\,{s}+0.28)\\,{y}+55*(1-(t-{s})/0.28)\\,{y}+7*sin(2*PI*(t-{s})*1.1))"
    fc.append(f"[{cur}][o{k}]overlay=x={x}:y='{yexpr}':eof_action=pass[v{n}]"); cur=f'v{n}'; n+=1

cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
       '-map', f'[{cur}]', '-map', '0:a',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
       '-c:a', 'copy', 'finalv.mp4']
print(f"{len(OVL)} overlays, {len(FLASH)} flashes, {len(MINIFLASH)} mini-flashes, {len(TICKS)} ticks")
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode: print(r.stderr[-2500:])
