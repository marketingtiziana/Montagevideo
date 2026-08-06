# -*- coding: utf-8 -*-
# Coupe une "reprise"/répétition dans la source, puis RE-TRANSCRIT pour resynchroniser
# les sous-titres. Ici : à la fin elle dit "si tu vends, si tu vends, à l'international"
# -> on retire la PREMIÈRE "si tu vends" [CUT_S, CUT_E].
#   -> source_cut.mp4  +  words.json regénéré (re-transcription du clip coupé)
# Ajuster CUT_S/CUT_E via une transcription mot-à-mot fine du segment (cf. README).
import subprocess, json, imageio_ffmpeg
from pywhispercpp.model import Model

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC, OUT = 'source.mp4', 'source_cut.mp4'
CUT_S, CUT_E = 38.54, 39.43     # 1re "si tu vends" à retirer


def cut_video():
    fc = (f"[0:v]trim=0:{CUT_S},setpts=PTS-STARTPTS[v0];[0:a]atrim=0:{CUT_S},asetpts=PTS-STARTPTS[a0];"
          f"[0:v]trim={CUT_E},setpts=PTS-STARTPTS[v1];[0:a]atrim={CUT_E},asetpts=PTS-STARTPTS[a1];"
          f"[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]")
    r = subprocess.run([FF, '-y', '-i', SRC, '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
                        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
                        '-c:a', 'aac', '-b:a', '160k', OUT], capture_output=True, text=True)
    print('cut video rc:', r.returncode)
    if r.returncode:
        print(r.stderr[-600:])


def retranscribe():
    subprocess.run([FF, '-y', '-i', OUT, '-vn', '-ac', '1', '-ar', '16000', 'sc16.wav'],
                   capture_output=True, text=True)
    m = Model('models/ggml-base.bin', print_realtime=False, print_progress=False, language='fr', translate=False)
    segs = m.transcribe('sc16.wav', token_timestamps=True, max_len=1, split_on_word=True, no_speech_thold=0.6)
    words = [{'t0': s.t0 / 100.0, 't1': s.t1 / 100.0, 'w': (s.text or '').strip()}
             for s in segs if (s.text or '').strip()]
    json.dump(words, open('words.json', 'w'), ensure_ascii=False, indent=1)
    print('words:', len(words), '| last end:', words[-1]['t1'])


if __name__ == '__main__':
    cut_video()
    retranscribe()
    print(f'DONE -> {OUT} (retiré {round(CUT_E-CUT_S,2)}s) ; relancer gen_ass_lux.py puis lux_render.py')
