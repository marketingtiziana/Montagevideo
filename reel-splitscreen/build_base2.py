import json, subprocess, shlex, os
from concurrent.futures import ThreadPoolExecutor
segs=json.load(open('work/segments.json')); FPS=30
os.makedirs('work/segs',exist_ok=True)
def crop_for(z):
    w=1000/z; h=796/z; x=980-w/2; y=300-0.33*h
    return f"crop={w:.0f}:{h:.0f}:{x:.0f}:{y:.0f}"
def enc(s):
    out=f"work/segs/v{s['idx']:02d}.mov"
    vf=f"{crop_for(s['zoom'])},scale=1080:860:flags=lanczos,setsar=1,fps={FPS},eq=contrast=1.05:saturation=1.03,format=yuv420p"
    cmd=f"ffmpeg -y -v error -ss {s['src_in']} -to {s['src_out']} -i /input/Reel_16M.mp4 -ss {s['src_in']} -to {s['src_out']} -i work/audio_full.wav -map 0:v -map 1:a -vf {vf} -c:v libx264 -preset fast -crf 14 -c:a pcm_s24le -threads 2 {out}"
    subprocess.run(shlex.split(cmd),check=True); return out
with ThreadPoolExecutor(2) as ex: outs=list(ex.map(enc,segs))
open('work/segs/list.txt','w').write("".join(f"file '{os.path.abspath(o)}'\n" for o in outs))
subprocess.run(shlex.split("ffmpeg -y -v error -f concat -safe 0 -i work/segs/list.txt -c copy work/base.mov"),check=True)
subprocess.run(shlex.split("ffmpeg -y -v error -i work/base.mov -vn -ac 2 -ar 48000 -c:a pcm_s24le work/base_audio.wav"), check=True)
subprocess.run(shlex.split("ffmpeg -y -v error -i work/base.mov -vn -ac 1 -ar 16000 -c:a pcm_s16le work/base_audio16k.wav"), check=True)
for o in outs: print(o, subprocess.run(shlex.split(f"ffprobe -v error -show_entries format=duration -of csv=p=0 {o}"),capture_output=True,text=True).stdout.strip())
print("base", subprocess.run(shlex.split("ffprobe -v error -show_entries format=duration:stream=nb_frames,r_frame_rate -of csv=p=0 work/base.mov"),capture_output=True,text=True).stdout)
