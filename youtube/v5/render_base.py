"""Monte l'image : coupes + cadrages (plan large / moyen / serré) + étalonnage -> build/media/base.mp4 (vidéo seule)."""
import json, os, subprocess, sys
from timeline import FPS, HERE
from plan import build_clips
MEZZ = os.environ.get('V5_MEZZ')              # vidéo source extraite : t=0 <=> 1:00:10 du rush (1080p25)
MED = os.path.join(HERE, 'build', 'media'); os.makedirs(MED, exist_ok=True)
GRADE = ("curves=master='0/0.015 0.2/0.19 0.5/0.505 0.8/0.81 0.93/0.905 1/0.94',"
         "colorbalance=rs=-0.01:bs=0.01:rh=-0.012:bh=0.008,eq=saturation=1.03:contrast=1.02")
# cadrages : (largeur de recadrage, x, y) sur l'image 1920x1080, remis à l'échelle en 1920x1080
FRAMES = {'W': None, 'W2': (1811, 110, 30), 'M': (1714, 60, 28), 'C': (1500, 170, 12)}
ENC = ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', str(FPS)]

def vf(fr):
    f = FRAMES[fr]
    crop = '' if f is None else f"crop={f[0]}:{round(f[0]*9/16)}:{f[1]}:{f[2]},scale=1920:1080:flags=lanczos,"
    return crop + GRADE + ",format=yuv420p"

def main():
    clips, total = build_clips()
    parts = []
    for i, c in enumerate(clips):
        out = os.path.join(MED, f'seg_{i:03d}.mp4'); parts.append(out)
        if os.path.exists(out) and '--force' not in sys.argv: continue
        if c['kind'] == 'src':
            n = c['e_f'] - c['s_f']
            cmd = ['ffmpeg', '-v', 'error', '-y', '-ss', f"{c['s_f']/FPS:.4f}", '-i', MEZZ, '-frames:v', str(n),
                   '-an', '-vf', vf(c['framing'])] + ENC + [out]
        else:
            cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f"color=c=0x0E1A2B:s=1920x1080:r={FPS}",
                   '-frames:v', str(c['n_f'])] + ENC + [out]
        subprocess.run(cmd, check=True)
        print(i, c.get('framing', c['kind']), flush=True)
    lst = os.path.join(MED, 'base_list.txt')
    open(lst, 'w').write(''.join(f"file '{p}'\n" for p in parts))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c', 'copy',
                    os.path.join(MED, 'base.mp4')], check=True)
    r = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v', '-show_entries', 'stream=nb_read_frames',
                        '-of', 'csv=p=0', os.path.join(MED, 'base.mp4')], capture_output=True, text=True).stdout.strip()
    print('base.mp4 frames', r, 'attendu', total)

if __name__ == '__main__': main()
