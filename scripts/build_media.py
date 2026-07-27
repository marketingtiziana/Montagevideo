#!/usr/bin/env python3
# Construit public/base_cut.mp4 (video montee 1080x1920 30fps) et data/voice_cut.wav
# depuis source/reel5.mp4, pilote par data/edit.json.
# RESUMABLE : extrait chaque segment separement (seek en entree = rapide) et saute
# ceux deja valides. Survit aux redemarrages du conteneur.
# Source deja 9:16 -> pas de reframe. Camera moves cote Remotion. 1 cross-dissolve (xfade).
import json, subprocess, os, sys

FPS = 30
DISS = 8 / FPS
edit = json.load(open("data/edit.json"))
segs = edit["segments"]
SRC = "source/reel5.mp4"
SEGDIR = "data/_segs"
os.makedirs(SEGDIR, exist_ok=True)
os.makedirs("public", exist_ok=True)
diss_idx = next((i for i, s in enumerate(segs) if s["transition_in"] == "cross_dissolve_8f"), None)

def valid(path, min_dur):
    if not os.path.exists(path):
        return False
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", path], capture_output=True, text=True)
    try:
        return float(r.stdout.strip()) >= min_dur - 0.15
    except Exception:
        return False

def extract_video():
    for i, s in enumerate(segs):
        out = f"{SEGDIR}/v{i:02d}.mp4"
        dur = s["src_out"] - s["src_in"]
        if valid(out, dur):
            print(f"  v{i:02d} ok (skip)"); continue
        cmd = ["ffmpeg", "-nostdin", "-y", "-ss", f"{s['src_in']:.3f}", "-to", f"{s['src_out']:.3f}",
               "-i", SRC, "-an", "-vf", f"fps={FPS},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
               "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", out]
        print(f"  v{i:02d} extract ({dur:.1f}s) ..."); subprocess.run(cmd, check=True)

def extract_voice():
    for i, s in enumerate(segs):
        out = f"{SEGDIR}/a{i:02d}.wav"
        dur = s["src_out"] - s["src_in"]
        if valid(out, dur):
            print(f"  a{i:02d} ok (skip)"); continue
        cmd = ["ffmpeg", "-nostdin", "-y", "-ss", f"{s['src_in']:.3f}", "-to", f"{s['src_out']:.3f}",
               "-i", SRC, "-vn", "-ar", "48000", "-ac", "2", out]
        print(f"  a{i:02d} extract ..."); subprocess.run(cmd, check=True)

def concat_video():
    # partie A (avant dissolve) et B (a partir) en concat demuxer, puis xfade unique
    def demux(idxs, out):
        lst = f"{SEGDIR}/_list.txt"
        with open(lst, "w") as fh:
            for i in idxs:
                fh.write(f"file '{os.path.abspath(SEGDIR)}/v{i:02d}.mp4'\n")
        subprocess.run(["ffmpeg", "-nostdin", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                        "-c", "copy", out], check=True)
    a = list(range(0, diss_idx)); b = list(range(diss_idx, len(segs)))
    demux(a, f"{SEGDIR}/partA.mp4"); demux(b, f"{SEGDIR}/partB.mp4")
    durA = sum(segs[i]["src_out"] - segs[i]["src_in"] for i in a)
    off = durA - DISS
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-i", f"{SEGDIR}/partA.mp4", "-i", f"{SEGDIR}/partB.mp4",
                    "-filter_complex", f"[0:v][1:v]xfade=transition=fade:duration={DISS:.3f}:offset={off:.3f}[v]",
                    "-map", "[v]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18",
                    "-pix_fmt", "yuv420p", "-r", str(FPS), "public/base_cut.mp4"], check=True)

def concat_voice():
    # concat hard + acrossfade au point de dissolve
    parts = [f"[{i}:a]asetpts=PTS-STARTPTS[a{i}]" for i in range(len(segs))]
    cur = "a0"; steps = []
    for i in range(1, len(segs)):
        out = f"ac{i}"
        if i == diss_idx:
            steps.append(f"[{cur}][a{i}]acrossfade=d={DISS:.3f}:c1=tri:c2=tri[{out}]")
        else:
            steps.append(f"[{cur}][a{i}]concat=n=2:v=0:a=1[{out}]")
        cur = out
    ins = []
    for i in range(len(segs)):
        ins += ["-i", f"{SEGDIR}/a{i:02d}.wav"]
    subprocess.run(["ffmpeg", "-nostdin", "-y", *ins, "-filter_complex", ";".join(parts + steps),
                    "-map", f"[{cur}]", "-ar", "48000", "-ac", "2", "data/voice_cut.wav"], check=True)

if __name__ == "__main__":
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("all", "video"):
        print("== extract video segments =="); extract_video()
        print("== concat video =="); concat_video()
    if what in ("all", "voice"):
        print("== extract voice segments =="); extract_voice()
        print("== concat voice =="); concat_voice()
    for f in ["public/base_cut.mp4", "data/voice_cut.wav"]:
        if os.path.exists(f):
            d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",f],
                               capture_output=True,text=True).stdout.strip()
            print(f"  {f}: {d}s")
