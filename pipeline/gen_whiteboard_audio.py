#!/usr/bin/env python3
"""
Genere la bande son du reel "whiteboard" (aucun asset externe requis) :
  - lofi_bed.mp3   : nappe lo-fi calme (Am7 / Dm7 / G7 / Cmaj7), ~46 s
  - pencil_loop.mp3: boucle de crayon qui gratte (2 s, volume bas)
  - tak.mp3        : petit "tak" de craie (fin de mot important)
  - erase.mp3      : balayage de gomme (transitions)

Si ./assets/music.mp3 existe, il est copie tel quel dans whiteboard/public/audio/
et remplace la nappe generee. Idem ./assets/vo.mp3 -> voix off.
"""
import os
import shutil
import subprocess
import sys

import imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'whiteboard', 'public', 'audio')
TMP = os.path.join(ROOT, '.audio_tmp')
os.makedirs(OUT, exist_ok=True)
os.makedirs(TMP, exist_ok=True)


def run(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr[-1200:], file=sys.stderr)
        raise SystemExit(f'ffmpeg a echoue : {" ".join(args[:6])} ...')


# ----------------------------------------------------------------- musique
BAR = 2.9  # duree d'un accord, en secondes

CHORDS = [
    ('Am7', 110.00, [220.00, 261.63, 329.63, 392.00]),
    ('Dm7', 146.83, [146.83, 174.61, 220.00, 261.63]),
    ('G7', 98.00, [196.00, 246.94, 293.66, 349.23]),
    ('Cmaj7', 130.81, [196.00, 246.94, 261.63, 329.63]),
]


def chord_expr(bass, notes):
    # nappe : 4 voix legerement desaccordees + basse ronde
    voices = []
    for i, f in enumerate(notes):
        amp = 0.26 - i * 0.03
        voices.append(f'{amp:.3f}*sin(2*PI*{f:.2f}*t)')
        voices.append(f'{amp * 0.55:.3f}*sin(2*PI*{f * 1.0032:.2f}*t)')
    pad = '+'.join(voices)
    low = f'0.34*sin(2*PI*{bass:.2f}*t)+0.12*sin(2*PI*{bass * 2:.2f}*t)'
    # attaque douce, longue chute : ca respire comme un Rhodes
    env = '(1-exp(-t*7))*exp(-t*0.40)'
    return f'0.5*(({pad})*{env}+({low})*(1-exp(-t*10))*exp(-t*0.75))'


chord_files = []
for name, bass, notes in CHORDS:
    path = os.path.join(TMP, f'chord_{name}.wav')
    run([
        FF, '-y', '-f', 'lavfi',
        '-i', f"aevalsrc='{chord_expr(bass, notes)}':s=44100:d={BAR}",
        '-af', 'lowpass=f=1500,aecho=0.85:0.7:170:0.32,volume=0.9',
        '-ac', '1', '-ar', '44100', path,
    ])
    chord_files.append(path)

listfile = os.path.join(TMP, 'chords.txt')
with open(listfile, 'w') as fh:
    # 4 tours de la grille -> ~46 s
    for _ in range(4):
        for p in chord_files:
            fh.write(f"file '{p}'\n")

progression = os.path.join(TMP, 'progression.wav')
run([FF, '-y', '-f', 'concat', '-safe', '0', '-i', listfile, '-c', 'copy', progression])

# craquement de vinyle tres discret + largeur stereo
run([
    FF, '-y',
    '-i', progression,
    '-f', 'lavfi', '-i', 'anoisesrc=c=pink:a=0.035:d=47',
    '-filter_complex',
    '[1:a]highpass=f=1800,lowpass=f=8000,volume=0.30[crackle];'
    '[0:a][crackle]amix=inputs=2:duration=first:weights=1 0.22,'
    'lowpass=f=2600,aformat=channel_layouts=stereo,'
    'afade=t=in:d=1.2,volume=0.9[out]',
    '-map', '[out]', '-b:a', '192k', os.path.join(OUT, 'lofi_bed.mp3'),
])

# ------------------------------------------------------------------ crayon
# bruit filtre + modulation d'amplitude irreguliere = crayon qui gratte
run([
    FF, '-y', '-f', 'lavfi',
    '-i', 'anoisesrc=c=white:a=0.5:d=2',
    '-af',
    'highpass=f=1800,lowpass=f=7000,'
    'tremolo=f=17:d=0.75,tremolo=f=4.3:d=0.45,'
    'afade=t=in:d=0.04,afade=t=out:st=1.96:d=0.04,'
    'volume=0.8',
    '-ac', '1', '-ar', '44100', '-b:a', '128k', os.path.join(OUT, 'pencil_loop.mp3'),
])

# -------------------------------------------------------------------- "tak"
run([
    FF, '-y', '-f', 'lavfi',
    '-i', "aevalsrc='(0.55*sin(2*PI*1650*t)+0.35*sin(2*PI*2600*t)+0.4*random(0))*exp(-t*90)':s=44100:d=0.12",
    '-af', 'highpass=f=900,lowpass=f=7000,volume=0.9',
    '-ac', '1', '-ar', '44100', '-b:a', '128k', os.path.join(OUT, 'tak.mp3'),
])

# ------------------------------------------------------------------- gomme
run([
    FF, '-y', '-f', 'lavfi',
    '-i', 'anoisesrc=c=brown:a=0.75:d=0.45',
    '-af',
    'highpass=f=320,lowpass=f=3400,'
    'afade=t=in:d=0.05:curve=qsin,afade=t=out:st=0.22:d=0.23:curve=qsin,'
    'volume=1.1',
    '-ac', '1', '-ar', '44100', '-b:a', '128k', os.path.join(OUT, 'erase.mp3'),
])

# ------------------------------------------- assets fournis par l'utilisateur
assets = os.path.join(ROOT, 'assets')
for src, dst, label in (
    ('music.mp3', 'music.mp3', 'musique fournie'),
    ('vo.mp3', 'vo.mp3', 'voix off'),
):
    p = os.path.join(assets, src)
    if os.path.isfile(p):
        shutil.copy(p, os.path.join(OUT, dst))
        print(f'{label} reprise depuis assets/{src}')
    else:
        print(f'assets/{src} absent -> {label} non utilisee')

# Manifeste lu par Remotion : indique quels assets optionnels sont presents.
manifest = os.path.join(ROOT, 'whiteboard', 'src', 'audioManifest.ts')
with open(manifest, 'w') as fh:
    fh.write('// Genere par pipeline/gen_whiteboard_audio.py - ne pas editer a la main.\n')
    fh.write(f'export const HAS_CUSTOM_MUSIC = '
             f'{"true" if os.path.isfile(os.path.join(OUT, "music.mp3")) else "false"};\n')
    fh.write(f'export const HAS_VOICEOVER = '
             f'{"true" if os.path.isfile(os.path.join(OUT, "vo.mp3")) else "false"};\n')

shutil.rmtree(TMP, ignore_errors=True)
for f in sorted(os.listdir(OUT)):
    print(f, os.path.getsize(os.path.join(OUT, f)), 'octets')
