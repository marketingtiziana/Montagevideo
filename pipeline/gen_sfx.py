# Generate PLEASANT sound effects (soft whooshes, bloops, blips) with ffmpeg.
import subprocess, imageio_ffmpeg, os
FF = imageio_ffmpeg.get_ffmpeg_exe()
os.makedirs('sfx', exist_ok=True)

def gen(name, src, af, dur):
    cmd = [FF, '-y', '-f', 'lavfi', '-i', f'{src}:d={dur}', '-af', af, '-ar', '44100', f'sfx/{name}.wav']
    r = subprocess.run(cmd, capture_output=True, text=True)
    print(name, 'ok' if r.returncode == 0 else r.stderr[-400:])

# soft airy whoosh (brown noise, low-passed, reverb tail) — for transitions
gen('whoosh_soft', 'anoisesrc=c=brown:a=0.65',
    'highpass=f=140,lowpass=f=1700,afade=t=in:d=0.12:curve=qsin,afade=t=out:st=0.28:d=0.32:curve=qsin,aecho=0.8:0.85:70:0.35,volume=1.4', 0.62)

# gentle rising "riser" whoosh — pleasant, musical
gen('riser', "aevalsrc='0.5*sin(2*PI*(190+230*t/0.5)*t)'",
    'lowpass=f=2400,afade=t=in:d=0.05:curve=qsin,afade=t=out:st=0.38:d=0.12,aecho=0.8:0.8:55:0.28,volume=0.9', 0.5)

# soft "bloop" — for element/incrustation appearance
gen('pop', "aevalsrc='0.6*sin(2*PI*(560-170*t/0.15)*t)*exp(-t*15)'",
    'lowpass=f=3500,volume=1.0', 0.18)

# soft high blip — for subtitle text appearance
gen('blip', "aevalsrc='0.5*sin(2*PI*920*t)*exp(-t*26)'",
    'lowpass=f=5000,volume=0.9', 0.10)

# very short soft tick — for jump-cuts (subtle, not zappy)
gen('cut', "aevalsrc='0.5*sin(2*PI*430*t)*exp(-t*38)'",
    'lowpass=f=2500,volume=0.9', 0.07)

for n in ['whoosh_soft', 'riser', 'pop', 'blip', 'cut']:
    print(n, os.path.getsize(f'sfx/{n}.wav'), 'bytes')
