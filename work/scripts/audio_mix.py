# Voix : de-esser + loudnorm -14 LUFS ; musique : lit sous la voix avec ducking sidechain ; SFX sur les cards/effets.
import json, subprocess, os, numpy as np, soundfile as sf
fx=json.load(open("cut/fx.json")); sr=48000
# 1) voix
subprocess.run(["ffmpeg","-v","error","-y","-i","cut/cut_audio.wav","-af",
  "highpass=f=70,deesser=i=0.4:m=0.5:f=0.5,acompressor=threshold=-18dB:ratio=2.2:attack=8:release=120:makeup=2,loudnorm=I=-14:TP=-1.5:LRA=9,alimiter=limit=-1.5dB:level=0",
  "-ar",str(sr),"-ac","1","cut/voice.wav"],check=True)
v,_=sf.read("cut/voice.wav",dtype="float32"); n=len(v); dur=n/sr
# 2) piste SFX
def load(p):
    x,r=sf.read(p,dtype="float32"); assert r==sr; return x if x.ndim==1 else x.mean(1)
whoosh,pop,impact=load("sfx/whoosh.wav"),load("sfx/pop.wav"),load("sfx/impact.wav")
sfx=np.zeros(n,np.float32)
def put(x,t,g):
    i=int(t*sr); j=min(n,i+len(x)); 
    if i<n: sfx[i:j]+=x[:j-i]*g
for c in fx["cards"]:
    put(whoosh,c["start"]-0.05,0.22); put(pop,c["start"]+0.12,0.25)
    if c["type"]=="list":
        for r in c["rows"][1:]: put(pop,r["t"],0.16)
for b in fx["behind"]: put(impact,b["start"],0.35); put(whoosh,b["start"]-0.1,0.18)
sf.write("cut/sfx_track.wav",sfx,sr)
# 3) musique : boucle coupée à la durée, fade out final 1.2 s
m=load("sfx/music_bed.wav"); reps=int(np.ceil(n/len(m))); m=np.tile(m,reps)[:n].copy(); m[-int(1.2*sr):]*=np.linspace(1,0,int(1.2*sr)); m[:int(0.5*sr)]*=np.linspace(0,1,int(0.5*sr))
sf.write("cut/music_cut.wav",m,sr)
# 4) mix : mesure LUFS puis gains linéaires : voix -14, musique -38 (24 dB sous la voix) avant ducking, SFX -30
import re
def lufs(f):
    r=subprocess.run(["ffmpeg","-i",f,"-af","loudnorm=print_format=json","-f","null","-"],capture_output=True,text=True).stderr
    return float(re.search(r'"input_i"\s*:\s*"([-\d.]+)"',r).group(1))
gv=-14-lufs("cut/voice.wav"); gm=-38-lufs("cut/music_cut.wav"); gs=-30-lufs("cut/sfx_track.wav")
print("gains dB voix/musique/sfx",round(gv,2),round(gm,2),round(gs,2))
subprocess.run(["ffmpeg","-v","error","-y","-i","cut/voice.wav","-i","cut/music_cut.wav","-i","cut/sfx_track.wav","-filter_complex",
  f"[0]volume={gv}dB,asplit[v1][v2];[1]volume={gm}dB[m];[m][v2]sidechaincompress=threshold=0.03:ratio=5:attack=25:release=600:makeup=1[md];"
  f"[2]volume={gs}dB[s];[v1][md][s]amix=inputs=3:normalize=0:dropout_transition=0,alimiter=limit=-1dB:attack=5:release=50:level=0[out]",
  "-map","[out]","-ar",str(sr),"-ac","2","cut/mix.wav"],check=True)
for f in ["cut/voice.wav","cut/music_cut.wav","cut/sfx_track.wav","cut/mix.wav"]:
    r=subprocess.run(["ffmpeg","-i",f,"-af","loudnorm=print_format=json","-f","null","-"],capture_output=True,text=True).stderr
    import re; mm=re.search(r'"input_i"\s*:\s*"([-\d.]+)"',r); print(f, "LUFS", mm.group(1) if mm else "?")
# 5) ajustement final linéaire pour viser -14 LUFS intégré sur le mix
g=-14-lufs("cut/mix.wav"); subprocess.run(["ffmpeg","-v","error","-y","-i","cut/mix.wav","-af",f"volume={g}dB,alimiter=limit=-1dB:attack=5:release=50:level=0","cut/mix_final.wav"],check=True)
print("mix_final LUFS",lufs("cut/mix_final.wav"))
