import subprocess, json, os, sys, numpy as np, soundfile as sf
sys.path.insert(0, os.path.dirname(__file__)); from edl import quantize, FPS
segs = quantize(); W="work"
os.makedirs("cut", exist_ok=True)
# --- audio : concat des plages (48 kHz mono), fondus 6 ms aux jonctions
a, sr = sf.read("src/rush48k.wav", dtype="float32")
parts=[]; ramp=int(0.006*sr)
for s in segs:
    x = a[int(round(s["src_in"]*sr)): int(round(s["src_in"]*sr)) + int(round((s["src_out"]-s["src_in"])*sr))].copy()
    x[:ramp] *= np.linspace(0,1,ramp); x[-ramp:] *= np.linspace(1,0,ramp); parts.append(x)
cut = np.concatenate(parts); sf.write("cut/cut_audio.wav", cut, sr)
print("audio", len(cut)/sr)
# --- vidéo : chaque plage en 30 fps, résolution source, puis concat
lst=[]
for k,s in enumerate(segs):
    f=f"cut/seg{k:02d}.mp4"; lst.append(f)
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{s['src_in']:.4f}","-i","src/rush.mp4","-an",
        "-vf",f"fps={FPS}","-frames:v",str(s["frames"]),"-c:v","libx264","-preset","fast","-crf","12","-pix_fmt","yuv420p",f],check=True)
open("cut/list.txt","w").write("".join(f"file '{os.path.abspath(f)}'\n" for f in lst))
subprocess.run(["ffmpeg","-v","error","-y","-f","concat","-safe","0","-i","cut/list.txt","-c","copy","cut/cut_1080p.mp4"],check=True)
print(subprocess.run(["ffprobe","-v","error","-select_streams","v","-count_frames","-show_entries","stream=nb_read_frames,r_frame_rate","-of","csv=p=0","cut/cut_1080p.mp4"],capture_output=True,text=True).stdout)
