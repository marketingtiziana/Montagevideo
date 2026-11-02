import json, subprocess, shlex, os
segs=json.load(open('work/segments.json')); FPS=30
t=0.0; parts=[]
for s in segs:
    f=f"work/segs/v{s['idx']:02d}.mov"
    nf=int(subprocess.run(shlex.split(f"ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=nb_read_frames -of csv=p=0 {f}"),capture_output=True,text=True).stdout.strip())
    d=nf/FPS; s['frames']=nf; s['dur']=round(d,4); s['out_in']=round(t,4); s['out_out']=round(t+d,4); t+=d
    wav=f"work/segs/a{s['idx']:02d}.wav"
    subprocess.run(shlex.split(f"ffmpeg -y -v error -i {f} -vn -af apad,atrim=0:{d:.6f} -ac 2 -ar 48000 -c:a pcm_s24le {wav}"),check=True); parts.append(wav)
json.dump(segs, open('work/segments.json','w'), indent=1, ensure_ascii=False)
open('work/segs/alist.txt','w').write("".join(f"file '{os.path.abspath(p)}'\n" for p in parts))
subprocess.run(shlex.split("ffmpeg -y -v error -f concat -safe 0 -i work/segs/alist.txt -c copy work/base_audio.wav"),check=True)
subprocess.run(shlex.split("ffmpeg -y -v error -i work/base_audio.wav -ac 1 -ar 16000 -c:a pcm_s16le work/base_audio16k.wav"),check=True)
print("total frames", sum(s['frames'] for s in segs), "dur", round(t,4))
for s in segs: print(f"{s['idx']:2d} out {s['out_in']:7.3f}-{s['out_out']:7.3f} frames {s['frames']} zoom {s['zoom']}")
print(subprocess.run(shlex.split("ffprobe -v error -show_entries format=duration -of csv=p=0 work/base_audio.wav"),capture_output=True,text=True).stdout)
