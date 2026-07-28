#!/usr/bin/env python3
# Construit public/base_cut.mp4 (video 1080x1920 30fps CFR) et data/voice_cut.wav
# VERROUILLAGE SYNC : chaque segment extrait A+V ENSEMBLE, duree alignee a la frame
# (D = round((out-in)*30)/30). Concat 30fps CFR strict, sans xfade (transitions cote Remotion).
# -> base_cut et voix ont des durees frame-lockees identiques a la timeline. Zero derive.
import json, subprocess, os, sys

FPS = 30
edit = json.load(open("data/edit.json"))
segs = edit["segments"]
SRC = "source/reel5.mp4"
SEGDIR = "data/_segs"
os.makedirs(SEGDIR, exist_ok=True)
os.makedirs("public", exist_ok=True)

def frames(seg):
    return round((seg["src_out"] - seg["src_in"]) * FPS)

def valid(path, F):
    if not os.path.exists(path):
        return False
    r = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
                        "-show_entries", "stream=nb_read_frames", "-of", "default=nw=1:nk=1", path],
                       capture_output=True, text=True)
    try:
        return abs(int(r.stdout.strip()) - F) <= 0
    except Exception:
        return False

def extract_av():
    for i, s in enumerate(segs):
        F = frames(s)
        D = F / FPS  # duree alignee frame
        out = f"{SEGDIR}/av{i:02d}.mp4"
        if valid(out, F):
            print(f"  av{i:02d} ok ({F}f) skip"); continue
        cmd = ["ffmpeg", "-nostdin", "-y", "-ss", f"{s['src_in']:.3f}", "-i", SRC, "-t", f"{D:.4f}",
               "-vf", f"fps={FPS},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1",
               "-af", "aresample=48000,apad",
               "-frames:v", str(F), "-fps_mode", "cfr", "-r", str(FPS),
               "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
               "-c:a", "pcm_s16le", "-ac", "2", "-ar", "48000",
               "-t", f"{D:.4f}", out]
        print(f"  av{i:02d} extract {F}f ({D:.2f}s)"); subprocess.run(cmd, check=True)

def concat_av():
    lst = f"{SEGDIR}/_avlist.txt"
    with open(lst, "w") as fh:
        for i in range(len(segs)):
            fh.write(f"file '{os.path.abspath(SEGDIR)}/av{i:02d}.mp4'\n")
    # concat A+V frame-locke -> base_cut_av (30fps CFR strict)
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-fps_mode", "cfr", "-r", str(FPS),
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-c:a", "pcm_s16le", f"{SEGDIR}/base_cut_av.mp4"], check=True)
    # video seule -> public/base_cut.mp4 (entree Remotion)
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-i", f"{SEGDIR}/base_cut_av.mp4",
                    "-an", "-c:v", "copy", "public/base_cut.mp4"], check=True)
    # audio seul -> data/voice_cut.wav (frame-locke, synchro identique)
    subprocess.run(["ffmpeg", "-nostdin", "-y", "-i", f"{SEGDIR}/base_cut_av.mp4",
                    "-vn", "-c:a", "pcm_s16le", "-ar", "48000", "-ac", "2", "data/voice_cut.wav"], check=True)

if __name__ == "__main__":
    total_F = sum(frames(s) for s in segs)
    print(f"total frames attendu: {total_F} = {total_F/FPS:.3f}s")
    print("== extract A+V frame-locke =="); extract_av()
    print("== concat =="); concat_av()
    for f in ["public/base_cut.mp4", "data/voice_cut.wav", f"{SEGDIR}/base_cut_av.mp4"]:
        r = subprocess.run(["ffprobe","-v","error","-select_streams","v:0" if f.endswith("mp4") else "a:0",
                            "-count_frames" if f.endswith("mp4") else "-show_entries","stream=nb_read_frames" if f.endswith("mp4") else "format=duration"]+
                           (["-show_entries","format=duration"] if False else [])+["-of","default=nw=1:nk=1",f],
                           capture_output=True,text=True)
        d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1",f],capture_output=True,text=True).stdout.strip()
        print(f"  {f}: {d}s")
