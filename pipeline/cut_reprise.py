# -*- coding: utf-8 -*-
# Coupe une "reprise"/fausse-amorce dans la source : retire [CUT_S, CUT_E] de la
# vidéo (-> source_cut.mp4) ET décale words.json en conséquence, pour que les
# sous-titres restent synchro sur la timeline raccourcie.
#
# Ici : la fin "si tu vends à l'inti-... à l'international" -> on retire la fausse
# amorce + le blanc. Ajuster CUT_S/CUT_E via silencedetect + une transcription du
# segment (cf. README) si la source change.
import subprocess, json, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = 'source.mp4'
OUT = 'source_cut.mp4'
CUT_S, CUT_E = 39.06, 39.83     # bornes de la reprise à retirer


def cut_video():
    fc = (f"[0:v]trim=0:{CUT_S},setpts=PTS-STARTPTS[v0];"
          f"[0:a]atrim=0:{CUT_S},asetpts=PTS-STARTPTS[a0];"
          f"[0:v]trim={CUT_E},setpts=PTS-STARTPTS[v1];"
          f"[0:a]atrim={CUT_E},asetpts=PTS-STARTPTS[a1];"
          f"[v0][a0][v1][a1]concat=n=2:v=1:a=1[v][a]")
    cmd = [FF, '-y', '-i', SRC, '-filter_complex', fc, '-map', '[v]', '-map', '[a]',
           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '160k', OUT]
    r = subprocess.run(cmd, capture_output=True, text=True)
    print('cut video rc:', r.returncode)
    if r.returncode:
        print(r.stderr[-800:])


def shift_words():
    D = round(CUT_E - CUT_S, 3)
    w = json.load(open('words.json'))
    out = []
    for x in w:
        t0, t1 = x['t0'], x['t1']
        if t1 <= CUT_S:
            out.append(x)
        elif t0 >= CUT_E:
            out.append({'t0': round(t0 - D, 3), 't1': round(t1 - D, 3), 'w': x['w']})
        else:  # mot à cheval sur la coupe -> tronqué
            nt0 = t0 if t0 < CUT_S else CUT_S
            nt1 = round(t1 - D, 3) if t1 > CUT_E else CUT_S
            if nt1 - nt0 > 0.02:
                out.append({'t0': round(nt0, 3), 't1': round(nt1, 3), 'w': x['w']})
    json.dump(out, open('words.json', 'w'), ensure_ascii=False, indent=1)
    print('words:', len(out), '| last end:', out[-1]['t1'])


if __name__ == '__main__':
    cut_video()
    shift_words()
    print(f'DONE -> {OUT} (retiré {round(CUT_E-CUT_S,2)}s) ; relancer gen_ass_lux.py puis lux_render.py')
