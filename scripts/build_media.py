#!/usr/bin/env python3
# Construit public/base_cut.mp4 (video 1080x1920 30fps CFR) et data/voice_cut.wav
# SILENCE-AWARE : detecte les silences > MINSIL dans chaque segment et les RETIRE
# (garde BREATH de respiration), pour resserrer la diction. A+V verrouilles a la frame.
# Ecrit data/keeps.json (ranges conservees par segment, en temps source) pour le compilateur.
import json, subprocess, os, re

FPS = 30
MINSIL = 0.5     # ne coupe que les silences plus longs que ca
BREATH = 0.15    # respiration conservee de chaque cote d'une coupe de silence
NOISE = "-33dB"
edit = json.load(open("data/edit.json"))
segs = edit["segments"]
SRC = "source/reel5.mp4"
SEGDIR = "data/_segs"
os.makedirs(SEGDIR, exist_ok=True)
os.makedirs("public", exist_ok=True)

def detect_silences(a, b):
    r = subprocess.run(["ffmpeg", "-nostdin", "-ss", f"{a:.3f}", "-to", f"{b:.3f}", "-i", SRC,
                        "-af", f"silencedetect=noise={NOISE}:d=0.30", "-f", "null", "-"],
                       capture_output=True, text=True)
    sils = []
    st = None
    for line in r.stderr.splitlines():
        m = re.search(r"silence_start: ([\d.]+)", line)
        if m: st = a + float(m.group(1))
        m = re.search(r"silence_end: ([\d.]+)", line)
        if m and st is not None:
            sils.append((st, a + float(m.group(1))))
            # note: -ss reinitialise le temps a 0 -> on rajoute a
            st = None
    return sils

MERGE_GAP = 1.5   # ne coupe que si le silence retire est >= ca (evite le hachage staccato)
MINKEEP = 0.7     # aucun fragment plus court que ca

def keeps_for(a, b):
    sils = [(s, e) for (s, e) in detect_silences(a, b) if (e - s) > MINSIL]
    keeps = []
    cur = a
    for (s, e) in sils:
        end_keep = min(b, s + BREATH)
        if end_keep > cur + 0.05:
            keeps.append([cur, end_keep])
        cur = max(cur, e - BREATH)
    # traine finale : ne l'ajoute que si c'est du contenu (pas un silence de fin)
    if b - cur > 0.35:
        keeps.append([cur, b])
    if not keeps:
        return [(a, b)]
    # FUSION anti-stutter : fusionne si le silence retire < MERGE_GAP, ou si un fragment est court
    changed = True
    while changed and len(keeps) > 1:
        changed = False
        out = [keeps[0]]
        for k in keeps[1:]:
            prev = out[-1]
            gap = k[0] - prev[1]  # duree du silence retire entre les deux keeps
            if gap < MERGE_GAP or (prev[1] - prev[0]) < MINKEEP or (k[1] - k[0]) < MINKEEP:
                prev[1] = k[1]; changed = True
            else:
                out.append(k)
        keeps = out
    return [tuple(k) for k in keeps]

def valid(path, F):
    if not os.path.exists(path): return False
    r = subprocess.run(["ffprobe","-v","error","-count_frames","-select_streams","v:0",
                        "-show_entries","stream=nb_read_frames","-of","default=nw=1:nk=1",path],
                       capture_output=True,text=True)
    try: return abs(int(r.stdout.strip()) - F) <= 0
    except Exception: return False

ALLKEEPS = {}
def build_segments():
    for i, s in enumerate(segs):
        keeps = keeps_for(s["src_in"], s["src_out"])
        ALLKEEPS[s["id"]] = keeps
        parts = []
        for j, (a, b) in enumerate(keeps):
            F = round((b - a) * FPS)
            if F < 1: continue
            D = F / FPS
            out = f"{SEGDIR}/p{i:02d}_{j}.mp4"
            cmd = ["ffmpeg","-nostdin","-y","-ss",f"{a:.3f}","-i",SRC,"-t",f"{D:.4f}",
                   "-vf",f"fps={FPS},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
                   "-af","aresample=48000,apad","-frames:v",str(F),"-fps_mode","cfr","-r",str(FPS),
                   "-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p",
                   "-c:a","pcm_s16le","-ac","2","-ar","48000","-t",f"{D:.4f}",out]
            subprocess.run(cmd, check=True)
            parts.append(out)
        # concat des sous-parties du segment
        lst = f"{SEGDIR}/_seg{i}.txt"
        open(lst,"w").write("\n".join(f"file '{os.path.abspath(p)}'" for p in parts)+"\n")
        av = f"{SEGDIR}/av{i:02d}.mp4"
        subprocess.run(["ffmpeg","-nostdin","-y","-f","concat","-safe","0","-i",lst,
                        "-fps_mode","cfr","-r",str(FPS),"-c:v","libx264","-preset","veryfast","-crf","18",
                        "-pix_fmt","yuv420p","-c:a","pcm_s16le",av], check=True)
        nf=subprocess.run(["ffprobe","-v","error","-count_frames","-select_streams","v:0","-show_entries",
                          "stream=nb_read_frames","-of","default=nw=1:nk=1",av],capture_output=True,text=True).stdout.strip()
        print(f"  {s['id']}: {len(keeps)} keeps, {nf} frames (src {s['src_out']-s['src_in']:.1f}s -> {int(nf)/FPS:.1f}s)")

def concat_all():
    lst = f"{SEGDIR}/_avlist.txt"
    open(lst,"w").write("\n".join(f"file '{os.path.abspath(SEGDIR)}/av{i:02d}.mp4'" for i in range(len(segs)))+"\n")
    subprocess.run(["ffmpeg","-nostdin","-y","-f","concat","-safe","0","-i",lst,"-fps_mode","cfr","-r",str(FPS),
                    "-c:v","libx264","-preset","veryfast","-crf","18","-pix_fmt","yuv420p","-c:a","pcm_s16le",
                    f"{SEGDIR}/base_cut_av.mp4"], check=True)
    subprocess.run(["ffmpeg","-nostdin","-y","-i",f"{SEGDIR}/base_cut_av.mp4","-an","-c:v","copy","public/base_cut.mp4"], check=True)
    subprocess.run(["ffmpeg","-nostdin","-y","-i",f"{SEGDIR}/base_cut_av.mp4","-vn","-c:a","pcm_s16le","-ar","48000","-ac","2","data/voice_cut.wav"], check=True)

if __name__ == "__main__":
    print("== extract silence-aware =="); build_segments()
    json.dump({k:[list(r) for r in v] for k,v in ALLKEEPS.items()}, open("data/keeps.json","w"))
    print("== concat =="); concat_all()
    for f in ["public/base_cut.mp4","data/voice_cut.wav"]:
        d=subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",f],capture_output=True,text=True).stdout.strip()
        print(f"  {f}: {d}s")
