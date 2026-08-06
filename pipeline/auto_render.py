# -*- coding: utf-8 -*-
# RENDU RÉEL automatique pour une source quelconque (source.mp4) :
#   base (ken-burns doux) -> sous-titres animés (depuis words.json) -> flashs de
#   transition aux respirations -> mixage bruitages -> REEL_auto_final.mp4
# Ne dépend PAS de la config TVA codée en dur (segments/overlays/manual-cuts).
import subprocess, json, re, os, imageio_ffmpeg

FF = imageio_ffmpeg.get_ffmpeg_exe()
SRC = 'source.mp4'
W, H, FPS = 1080, 1920, 30


def run(cmd, tail=2500):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print('  ERR rc=', r.returncode)
        print(r.stderr[-tail:])
    return r


def probe_duration(path):
    out = subprocess.run([FF, '-i', path], capture_output=True, text=True).stderr
    m = re.search(r'Duration: (\d+):(\d+):([\d.]+)', out)
    return int(m[1]) * 3600 + int(m[2]) * 60 + float(m[3]) if m else None


# 1) BASE : plein cadre 9:16 + léger ken-burns (zoom lent) -------------------
def build_base(dur):
    N = max(1, int(round(FPS * dur)))
    z = f"(1.00+0.06*on/{N})"          # zoom 1.00 -> 1.06 sur toute la durée
    fc = (
        f"[0:v]fps={FPS},scale={W*2}:{H*2}:flags=bicubic,"
        f"zoompan=z='{z}':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s={W}x{H}:fps={FPS},"
        f"format=yuv420p[v]"
    )
    cmd = [FF, '-y', '-i', SRC, '-filter_complex', fc, '-map', '[v]', '-map', '0:a',
           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
           '-c:a', 'aac', '-b:a', '160k', 'base_auto.mp4']
    print('>> base_auto.mp4 (ken-burns doux)')
    run(cmd)


# 2) Points de transition = respirations (silences réels détectés + ponctuation)
def transition_beats(min_sil=0.30):
    beats = []
    # a) silences réels dans l'audio -> flash à la reprise de parole
    if os.path.exists('audio16.wav'):
        sd = subprocess.run(
            [FF, '-i', 'audio16.wav', '-af', f'silencedetect=noise=-32dB:d={min_sil}', '-f', 'null', '-'],
            capture_output=True, text=True).stderr
        for m in re.finditer(r'silence_end: ([\d.]+)', sd):
            beats.append(round(float(m.group(1)), 3))
    # b) repli : fins de phrases (ponctuation) si peu de silences détectés
    if len(beats) < 3 and os.path.exists('words.json'):
        words = json.load(open('words.json'))
        for w in words:
            if w['w'].strip().endswith(('.', '!', '?')):
                beats.append(round(w['t1'], 3))
    # dédoublonne les beats trop proches (< 0.6s)
    beats.sort()
    out = []
    for b in beats:
        if b > 0.4 and (not out or b - out[-1] > 0.6):
            out.append(b)
    return out


# 3) VIDÉO FINALE : sous-titres + flashs colorés aux transitions -------------
def build_final(beats):
    FLASH_PNGS = ['assets/flash.png', 'assets/flash_b.png', 'assets/flash_p.png',
                  'assets/flash_c.png', 'assets/flash_o.png']
    have_flash = all(os.path.exists(p) for p in FLASH_PNGS)

    inputs = ['-i', 'base_auto.mp4']
    idx = 1
    flash_idx = []
    if have_flash:
        for j, b in enumerate(beats):
            png = FLASH_PNGS[j % len(FLASH_PNGS)]
            inputs += ['-loop', '1', '-t', '0.30', '-itsoffset', f'{round(b-0.10,3)}', '-i', png]
            flash_idx.append((idx, b)); idx += 1

    fc = ["[0:v]subtitles=subs.ass:fontsdir=fonts[v0]"]
    cur, n = 'v0', 1
    for (i, b) in flash_idx:
        s = round(b - 0.05, 3)
        fc.append(f"[{i}:v]format=rgba,fade=t=in:st={s}:d=0.08:alpha=1,fade=t=out:st={b}:d=0.14:alpha=1[fl{i}]")
        fc.append(f"[{cur}][fl{i}]overlay=0:0:eof_action=pass[v{n}]"); cur = f'v{n}'; n += 1

    cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
           '-map', f'[{cur}]', '-map', '0:a',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p',
           '-c:a', 'copy', 'finalv_auto.mp4']
    print(f'>> finalv_auto.mp4 (sous-titres + {len(flash_idx)} flashs)')
    run(cmd)
    json.dump({'whoosh': beats}, open('audio_events_auto.json', 'w'))


# 4) MIXAGE BRUITAGES : whoosh doux aux transitions --------------------------
def mix_audio():
    ev = json.load(open('audio_events_auto.json'))
    events = []
    for j, b in enumerate(ev.get('whoosh', [])):
        f = 'sfx/whoosh_soft.wav' if j % 2 == 0 else 'sfx/riser.wav'
        events.append((f, max(0.0, b - 0.06), 0.6))

    inputs = ['-i', 'finalv_auto.mp4']
    fc, labels = [], ['0:a']
    for i, (f, b, v) in enumerate(events, start=1):
        inputs += ['-i', f]
        ms = max(0, int(b * 1000))
        fc.append(f"[{i}:a]aformat=channel_layouts=stereo:sample_rates=44100,adelay={ms}|{ms},volume={v}[e{i}]")
        labels.append(f'e{i}')
    mix = "".join(f"[{l}]" for l in labels) + \
          f"amix=inputs={len(labels)}:normalize=0:dropout_transition=0,alimiter=limit=0.97[aout]"
    fc.append(mix)
    cmd = [FF, '-y'] + inputs + ['-filter_complex', ";".join(fc),
           '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
           'REEL_auto_final.mp4']
    print(f'>> REEL_auto_final.mp4 (mix {len(events)} bruitages)')
    run(cmd, tail=1500)


if __name__ == '__main__':
    dur = probe_duration(SRC)
    print('source duration:', dur, 's')
    build_base(dur)
    beats = transition_beats()
    print('transition beats:', len(beats))
    build_final(beats)
    if os.path.isdir('sfx'):
        mix_audio()
    final = 'REEL_auto_final.mp4' if os.path.exists('REEL_auto_final.mp4') else 'finalv_auto.mp4'
    print('DONE ->', final)
