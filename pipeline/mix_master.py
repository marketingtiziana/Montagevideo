# -*- coding: utf-8 -*-
"""Music bed + voice mix + mastering, then mux with the graphics video.
voice.wav + music.wav + video_gfx.mp4 -> FINAL mp4 (-14 LUFS integrated, TP -1.5 dBFS)."""
import subprocess, os, json, re, sys
from config import WORK, INTRO_DUR, OUTRO_DUR, FPS
from edl import src_to_final, body_duration

BODY = body_duration(); TOTAL = INTRO_DUR + BODY + OUTRO_DUR
voice = os.path.join(WORK, 'voice.wav'); music = os.path.join(WORK, 'music.wav')
video = os.path.join(WORK, 'video_gfx.mp4'); out = os.path.join(WORK, sys.argv[1] if len(sys.argv) > 1 else 'FINAL_LLC_16x9.mp4')

import importlib
PROJ = importlib.import_module(f"projects.{os.environ.get('MV_PROJECT', 'llc')}")
CTA = INTRO_DUR + src_to_final(PROJ.MUSIC_PEAK_SRC)   # the music swell lands here (CTA)
MUSIC_GAIN_DB = getattr(PROJ, "MUSIC_GAIN_DB", 0.0)   # per-project trim of the whole music bed
BUILD0 = CTA - 9.0                             # music starts to swell ~9 s before the CTA
END_BODY = INTRO_DUR + BODY
# Music gain envelope (before ducking): intro alone / under voice / soft build to CTA / outro / fade
ENV = (f"if(lt(t,{INTRO_DUR}),0.80,"
       f"if(lt(t,{BUILD0}),0.70,"
       f"if(lt(t,{CTA}),0.70+0.50*(t-{BUILD0})/{CTA-BUILD0},"
       f"if(lt(t,{END_BODY}),1.20,0.90))))")

# If the music is shorter than the programme, stretch it slightly (pitch-preserving) to cover the outro.
_md = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', music],
                           capture_output=True, text=True).stdout.strip() or 0)
STRETCH = f"atempo={max(0.5, min(1.0, _md / (TOTAL + 3.0))):.4f}," if 0 < _md < TOTAL + 3.0 else ""   # keep the track's natural decay past the end

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode: print(r.stderr[-1500:]); sys.exit(1)
    return r.stderr

# 1) voice delayed by the intro; 2) music: trim, even-out level, envelope, fade-out;
# 3) sidechain-duck music under the voice; 4) sum; 5) measure for 2-pass loudnorm
pre = (
    f"[0:a]adelay={int(INTRO_DUR*1000)}|{int(INTRO_DUR*1000)},apad=whole_dur={TOTAL},aformat=sample_rates=48000:channel_layouts=stereo[v];"
    f"[1:a]{STRETCH}atrim=0:{TOTAL},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,"
    f"loudnorm=I=-21:LRA=5:TP=-4,acompressor=threshold=-26dB:ratio=3:attack=60:release=700,"
    f"volume='{ENV}':eval=frame,volume={MUSIC_GAIN_DB}dB,afade=t=in:d=1.2,afade=t=out:st={TOTAL-1.6}:d=1.6,apad=whole_dur={TOTAL}[m];"
    f"[v]asplit[v1][v2];"
    f"[m][v2]sidechaincompress=threshold=0.05:ratio=3:attack=15:release=450:makeup=1:level_sc=1.0[md];"
    f"[v1][md]amix=inputs=2:weights='1 1':normalize=0:duration=first[mix]"
)
MASTER = "loudnorm=I=-14:TP=-1.5:LRA=9"
m = run(['ffmpeg', '-hide_banner', '-nostats', '-i', voice, '-i', music, '-filter_complex',
         pre + f";[mix]{MASTER}:print_format=json[o]", '-map', '[o]', '-f', 'null', '-'])
j = json.loads(m[m.rfind('{'):m.rfind('}') + 1])
ln = (f"{MASTER}:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:"
      f"measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true")
master = os.path.join(WORK, 'master.wav')
def measure(path):
    s = run(['ffmpeg', '-hide_banner', '-nostats', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'])
    summ = s[s.rfind('Summary'):]
    return (float(re.search(r'I:\s+(-?[\d.]+) LUFS', summ).group(1)), float(re.search(r'LRA:\s+([\d.]+) LU', summ).group(1)),
            float(re.search(r'Peak:\s+(-?[\d.]+) dBFS', summ).group(1)))
trim = 0.0
for attempt in range(3):                      # render, verify, correct residual offset (limiter/gating)
    run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', voice, '-i', music, '-filter_complex',
         pre + f";[mix]{ln},volume={trim}dB,alimiter=limit=0.84:attack=3:release=80[o]", '-map', '[o]', '-c:a', 'pcm_s24le', master])
    I, lra, tp = measure(master)
    print(f'MASTER pass {attempt+1}: I={I} LUFS  LRA={lra} LU  TP={tp} dBFS  (trim {trim:+.2f} dB)')
    if abs(I + 14.0) <= 0.3: break
    trim += (-14.0 - I)

# 6) mux with the graphics video (H.264 High, AAC 256k, faststart)
if os.environ.get('MV_SKIP_MUX') or not os.path.exists(video):
    print('video_gfx.mp4 not found yet - master.wav written, skipping mux'); sys.exit(0)
run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-i', video, '-i', master, '-map', '0:v', '-map', '1:a',
     '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', '-shortest', out])
print('FINAL ->', out)
