# -*- coding: utf-8 -*-
# Compose le VISUEL final: base + B-rolls (cutaways plein cadre, audio continu)
# + inserts (pastilles au-dessus des sous-titres) + flashs de transition sobres,
# puis sous-titres blancs par-dessus. L'audio RØDE de base reste intact ici.
import subprocess, json, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

CX = '(W-w)/2'
INS_Y = 1010  # bande inserts: sous le menton, au-dessus des sous-titres

# B-rolls plein cadre (fichier, start, dur) — cutaways "de temps en temps"
BROLL = [
    ('broll/brA.mp4', 0.90, 2.30),   # hook: business monte puis chute
    ('broll/brB.mp4', 9.85, 2.70),   # la regle de 3
    ('broll/brC.mp4', 21.00, 2.10),  # mettre de cote / investir
    ('broll/brD.mp4', 36.30, 2.20),  # combien de temps tu tiens
]

# Inserts (png, start, end) centres, y=INS_Y
INSERTS = [
    ('assets/ins_pasprevu.png', 6.60, 8.33),
    ('assets/ins_p1.png',      12.70, 14.10),
    ('assets/ins_p2.png',      15.90, 17.76),
    ('assets/ins_frais.png',   18.95, 20.90),
    ('assets/ins_stress.png',  28.30, 30.85),
    ('assets/ins_cta.png',     43.90, 46.40),
]

# Flashs sobres aux frontieres de B-roll (lissage de coupe)
FLASH = []
for (_, s, d) in BROLL:
    FLASH += [round(s, 2), round(s + d, 2)]

# --- montage des entrees ---
inputs = ['-i', 'base.mp4']; idx = 1
broll_idx = []
for (p, s, d) in BROLL:
    inputs += ['-itsoffset', f'{s}', '-i', p]; broll_idx.append((idx, s, d)); idx += 1
ins_idx = []
for (p, s, e) in INSERTS:
    dur = round(e - s, 3)
    inputs += ['-loop', '1', '-t', f'{dur}', '-itsoffset', f'{s}', '-i', p]
    ins_idx.append((idx, s, e)); idx += 1
FLASH_PNGS = ['assets/flash_w.png', 'assets/flash_g.png']
flash_idx = []
for j, b in enumerate(FLASH):
    inputs += ['-loop', '1', '-t', '0.24', '-itsoffset', f'{round(b-0.10,3)}', '-i', FLASH_PNGS[j % 2]]
    flash_idx.append((idx, b)); idx += 1

fc = []
cur, n = '0:v', 0

# 1) B-rolls plein cadre avec fondu enchaine
for (i, s, d) in broll_idx:
    fi, fo = 0.20, 0.22
    fc.append(
        f"[{i}:v]scale=1080:1920,setsar=1,format=rgba,"
        f"fade=t=in:st={round(s,3)}:d={fi}:alpha=1,"
        f"fade=t=out:st={round(s+d-fo,3)}:d={fo}:alpha=1[br{i}]")
    n += 1
    fc.append(f"[{cur}][br{i}]overlay=0:0:eof_action=pass:enable='between(t,{round(s,3)},{round(s+d,3)})'[v{n}]")
    cur = f'v{n}'

# 2) flashs de transition
for (i, b) in flash_idx:
    s = round(b-0.10, 3)
    fc.append(f"[{i}:v]format=rgba,fade=t=in:st={s}:d=0.07:alpha=1,fade=t=out:st={round(b,3)}:d=0.13:alpha=1[fl{i}]")
    n += 1
    fc.append(f"[{cur}][fl{i}]overlay=0:0:eof_action=pass[v{n}]"); cur = f'v{n}'

# 3) inserts (fondu + entree glissee du bas + flottement doux), centres
for (i, s, e) in ins_idx:
    fc.append(f"[{i}:v]format=rgba,fade=t=in:st={round(s,3)}:d=0.22:alpha=1,"
              f"fade=t=out:st={round(e-0.22,3)}:d=0.22:alpha=1[o{i}]")
    yexpr = (f"if(lt(t\\,{round(s,3)}+0.30)\\,{INS_Y}+46*(1-(t-{round(s,3)})/0.30)"
             f"\\,{INS_Y}+6*sin(2*PI*(t-{round(s,3)})*0.9))")
    n += 1
    fc.append(f"[{cur}][o{i}]overlay=x={CX}:y='{yexpr}':eof_action=pass[v{n}]"); cur = f'v{n}'

# 4) sous-titres blancs par-dessus tout
fc.append(f"[{cur}]subtitles=subs.ass:fontsdir=fonts[vout]")

cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
       '-map', '[vout]', '-map', '0:a',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
       '-c:a', 'copy', 'finalv.mp4']

# expose des evenements audio pour le mixage SFX
json.dump({'broll': [s for (_, s, d) in BROLL],
           'broll_end': [round(s+d,3) for (_, s, d) in BROLL],
           'appear': [s for (_, s, e) in INSERTS]},
          open('audio_events.json', 'w'))

print(f"{len(BROLL)} B-rolls, {len(INSERTS)} inserts, {len(FLASH)} flashs")
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode:
    print(r.stderr[-2500:])
else:
    out = subprocess.run([FF, '-i', 'finalv.mp4'], capture_output=True, text=True).stderr
    import re
    m = re.search(r'Duration: [\d:.]+', out); print(m.group(0) if m else '')
