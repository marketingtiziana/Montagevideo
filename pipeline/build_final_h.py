# -*- coding: utf-8 -*-
# Compose la VIDEO du reel HOLDING : base multicam + cutaways graphiques (cuts
# secs, AUCUN fondu) + insert portefeuille + sous-titres Inter par-dessus, puis
# concatene la carte CTA. L'audio final (voix + musique duckee + SFX) est fait
# dans mix_h.py ; ici on met la voix + silence sur le CTA.
import subprocess, json, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()

MAIN = 20.77
CTA = 3.0
TOTAL = round(MAIN + CTA, 3)

# cutaways plein cadre (fichier, start, dur) - cut sec, remplace l'image
CUTAWAYS = [
    ('broll/hsep.mp4',     1.70, 1.70),   # patrimoine | exploitation
    ('broll/hflow.mp4',    6.20, 2.30),   # schema holding <- societes
    ('broll/hfortune.mp4', 19.85, 0.90),  # climax UNE FORTUNE
]
POCHE = ('assets/ins_poche.png', 12.80, 1.15)  # insert portefeuille barre

inputs = ['-i', 'base_h.mp4']; idx = 1
cut_idx = []
for (p, s, d) in CUTAWAYS:
    inputs += ['-itsoffset', f'{s}', '-i', p]; cut_idx.append((idx, s, d)); idx += 1
inputs += ['-loop', '1', '-t', f'{POCHE[2]}', '-itsoffset', f'{POCHE[1]}', '-i', POCHE[0]]
poche_i = idx; idx += 1
inputs += ['-i', 'broll/cta.mp4']; cta_i = idx; idx += 1

fc = []
cur, n = '0:v', 0
# cutaways : cut sec (pas de fondu), enable between
for (i, s, d) in cut_idx:
    fc.append(f"[{i}:v]scale=1080:1920,setsar=1,format=yuv420p[ca{i}]")
    n += 1
    fc.append(f"[{cur}][ca{i}]overlay=0:0:eof_action=pass:enable='between(t,{round(s,3)},{round(s+d,3)})'[v{n}]")
    cur = f'v{n}'
# insert portefeuille (haut-gauche, sur le fond fenetre), apparition seche
fc.append(f"[{poche_i}:v]scale=300:-1,format=rgba[poche]")
n += 1
fc.append(f"[{cur}][poche]overlay=x=46:y=250:eof_action=pass:enable='between(t,{POCHE[1]},{round(POCHE[1]+POCHE[2],3)})'[v{n}]")
cur = f'v{n}'
# sous-titres par-dessus (portion principale)
fc.append(f"[{cur}]subtitles=subs_h.ass:fontsdir=fonts[mainsub]")
# CTA
fc.append(f"[{cta_i}:v]scale=1080:1920,setsar=1,fps=30,format=yuv420p[ctav]")
fc.append(f"[mainsub][ctav]concat=n=2:v=1:a=0[vout]")

# audio provisoire : voix + silence CTA
inputs += ['-i', 'voice_h.wav']; voice_i = idx; idx += 1
fc.append(f"[{voice_i}:a]apad=pad_dur={CTA}[aout]")

cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
       '-map', '[vout]', '-map', '[aout]', '-t', f'{TOTAL}',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
       '-c:a', 'aac', '-b:a', '192k', 'finalv_h.mp4']

json.dump({'cut_in': [s for (_, s, d) in CUTAWAYS],
           'cut_out': [round(s+d,3) for (_, s, d) in CUTAWAYS],
           'poche': POCHE[1], 'cta_start': MAIN, 'total': TOTAL,
           'big_caps': [0.00, 7.40, 8.77, 9.74, 16.99]},
          open('audio_events_h.json', 'w'))

print(f"{len(CUTAWAYS)} cutaways + insert + CTA | total {TOTAL}s")
r = subprocess.run(cmd, capture_output=True, text=True)
print('rc:', r.returncode)
if r.returncode: print(r.stderr[-2500:])
else:
    import re
    out = subprocess.run([FF, '-i', 'finalv_h.mp4'], capture_output=True, text=True).stderr
    m = re.search(r'Duration: [\d:.]+', out); print(m.group(0) if m else '')
