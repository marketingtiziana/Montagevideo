"""ÉTAPES 8, 10, 11, 12 — Habillage, mixage, assemblage, contrôles.
Ordre : teaser -> jingle -> [sponsor -> jingle] -> épisode (watermark, CTA, lower third, réseaux, CTA de fin)
        -> end slate.
  * watermark : logo en haut à gauche, 70 px, marge 40 px, opacité 85 % (teaser + épisode ; pas jingle / end slate)
  * CTA : épisode +0:02 -> +0:12, puis rejoué ~20 s avant la fin de la conversation (clic + pop en SFX)
  * lower third invité : 1er rapproché long de l'invité à partir de ~+1:20 (5 s, pop), puis réseaux (4 s)
  * son : épisode = voix traitée (aucune musique, aucun SFX sur les coupes) ; loudnorm 2 passes -16 LUFS / -1 dBTP
Usage : build_final.py --preview  -> 720p ultrafast : 3 premières minutes + 2 min au milieu, 12 images clés
        build_final.py            -> 1080p H.264 High CRF 18 preset slow, AAC 320 kb/s, +faststart"""
import argparse, json, os, subprocess, wave
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('--preview', action='store_true'); ap.add_argument('--jobs', type=int, default=3)
ap.add_argument('--skip-render', action='store_true', help='réutilise work/body*.mp4 déjà rendus')
a = ap.parse_args()
FPS_N, FPS_D = 30000, 1001; FPS = FPS_N / FPS_D; SR = 48000
fr = lambda t: int(round(t * FPS))
cfg = json.load(open('pipeline/podcast/config.json'))
EDL = json.load(open('work/edl.json')); SHOTS = EDL['shots']; EP_N = SHOTS[-1]['f1']
TIM = json.load(open('assets/podcast/timings.json'))['cta']
OW, OH = (1280, 720) if a.preview else (1920, 1080); S = OW / 1920
A = 'assets/podcast'
def run(cmd): subprocess.run(cmd, check=True)
def nframes(p):
    return int(subprocess.check_output(['ffprobe', '-v', 'error', '-count_packets', '-select_streams', 'v', '-show_entries',
                                        'stream=nb_read_packets', '-of', 'csv=p=0', p]).strip())
ENC_I = ['-c:v', 'libx264', '-preset', 'ultrafast' if a.preview else 'veryfast', '-crf', '18' if a.preview else '12', '-pix_fmt', 'yuv420p']

# ---------- habillage de l'épisode (temps épisode, s)
lt_shot = next(s for s in SHOTS if s['cam'] == 'I' and s['kind'] == 'rapproché' and s['t0'] >= 80 and s['dur'] >= 6)
T_LT = lt_shot['t0'] + 0.5; T_SOC = T_LT + 5.0
T_CTA1 = 2.0; T_CTA2 = EP_N / FPS - 20.0
OVER = [('cta', T_CTA1), ('lower_third', T_LT), ('reseaux', T_SOC), ('cta', T_CTA2)]
SFX = [(T_CTA1 + (TIM['pop_entree_1'] or 0), 'pop'), (T_CTA1 + TIM['pop_entree_2'], 'pop'), (T_CTA1 + TIM['clic'], 'clic'),
       (T_CTA1 + TIM['pop_commentaire'], 'pop'), (T_LT, 'pop'), (T_SOC, 'pop'),
       (T_CTA2 + (TIM['pop_entree_1'] or 0), 'pop'), (T_CTA2 + TIM['pop_entree_2'], 'pop'), (T_CTA2 + TIM['clic'], 'clic'),
       (T_CTA2 + TIM['pop_commentaire'], 'pop')]
if TIM['pop_entree_1'] is None: SFX = [x for x in SFX if not (x[1] == 'pop' and any(abs(x[0] - (t + 0)) < 1e-6 for t in (T_CTA1, T_CTA2)))] + \
    [(T_CTA1 + TIM['pop_entree_2'], 'pop'), (T_CTA2 + TIM['pop_entree_2'], 'pop')]
SFX = sorted(set(SFX))

def dress(src, out, t_from, subs=None):
    """watermark (+ sous-titres) (+ overlays épisode décalés de t_from)"""
    WM = cfg.get('watermark', True) and os.path.exists(f'{A}/logo.png')
    ins = ['-i', src] + (['-loop', '1', '-i', f'{A}/logo.png'] if WM else []); fc = []
    S = int(subprocess.check_output(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=width',
                                     '-of', 'csv=p=0', src]).strip()) / 1920
    if WM: fc.append(f'[1:v]scale=-2:{round(70 * S)},format=rgba,colorchannelmixer=aa=0.85[wm]')
    base = '[0:v]'
    if subs: fc.append(f"{base}subtitles={subs}:fontsdir=fonts[s0]"); base = '[s0]'
    if WM: fc.append(f'{base}[wm]overlay={round(40 * S)}:{round(40 * S)}:shortest=1[v0]')
    else: fc.append(f'{base}null[v0]')
    cur = '[v0]'; k = 2 if WM else 1
    if subs is None:
        dur = nframes(src) / FPS
        for i, (name, t) in enumerate(OVER):
            rel = t - t_from
            if rel > dur or rel + 12 < 0: continue
            ins += ['-itsoffset', f'{rel:.4f}', '-i', f'{A}/{name}.mov']
            fc.append(f'[{k}:v]scale=iw*{S}:-1[o{i}]'); fc.append(f'{cur}[o{i}]overlay=0:0:eof_action=pass[v{i + 1}]'); cur = f'[v{i + 1}]'; k += 1
    fc.append(f'{cur}null[out]')
    run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fc), '-map', '[out]', *ENC_I, '-r', f'{FPS_N}/{FPS_D}', out])

def rd(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), np.int16).reshape(-1, w.getnchannels()).astype(np.float32) / 32768
    assert w.getframerate() == SR, p
    return x if x.shape[1] == 2 else np.repeat(x, 2, 1)
def fit(x, n): return np.pad(x, ((0, max(0, n - len(x))), (0, 0)))[:n]
def wr(p, x):
    w = wave.open(p, 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(x, -1, 1) * 32767).astype(np.int16).tobytes()); w.close()

# ---------- parties
parts = []          # (vidéo, audio np, label)
VOICE = rd('work/ep_voice.wav'); SFXW = {k: rd(f'sfx/{k}.wav') for k in ('pop', 'clic')}
def body_audio(t0, t1):
    n = int(round((fr(t1) - fr(t0)) / FPS * SR)); i0 = int(round(fr(t0) / FPS * SR))
    x = fit(VOICE[i0:i0 + n].copy(), n)
    for t, kind in SFX:
        j = int((t - fr(t0) / FPS) * SR); s = SFXW[kind] * (0.5 if kind == 'pop' else 0.6)
        if 0 <= j < n: x[j:j + len(s)] += s[:n - j]
    return x
tn = nframes('work/teaser_v.mp4')
dress('work/teaser_v.mp4', 'work/teaser_c.mp4', 0, subs='work/teaser.ass')
parts.append(('work/teaser_c.mp4', fit(rd('work/teaser_audio.wav'), int(round(tn / FPS * SR))), 'teaser'))
jn = nframes(f'{A}/jingle.mov'); JA = fit(rd(f'{A}/jingle.wav'), int(round(jn / FPS * SR)))
if cfg.get('jingle', True): parts.append((f'{A}/jingle.mov', JA, 'jingle'))
else: jn = 0
if cfg.get('sponsor_rush', 'aucun') not in ('', 'aucun'):
    raise SystemExit('sponsor : rush fourni -> étape 6 à brancher (build_sponsor.py)')
ranges = [(0.0, 180.0 - (tn + jn) / FPS), (420.0, 540.0)] if a.preview else [(0.0, EP_N / FPS)]
for k, (t0, t1) in enumerate(ranges):
    raw = f'work/body_{k}{"p" if a.preview else ""}.mp4'
    if not a.skip_render:
        run(['python3', 'pipeline/podcast/render_body.py', '--from', str(t0), '--to', str(t1), '--out', raw, '--jobs', str(a.jobs)]
            + (['--preview'] if a.preview else []))
    dressed = raw.replace('.mp4', '_c.mp4'); dress(raw, dressed, t0)
    bn = nframes(dressed); t0s = fr(t0) / FPS
    parts.append((dressed, body_audio(t0s, t0s + bn / FPS), f'épisode {t0:.0f}-{t1:.0f} s'))
if cfg.get('end_slate', True):
    en = nframes(f'{A}/endslate.mov'); n = int(round(en / FPS * SR))
    m = fit(rd(f'{A}/musique_end.wav'), n) * 0.5
    m *= np.minimum(1, np.arange(n) / (0.5 * SR))[:, None] * np.minimum(1, (n - np.arange(n)) / (2.0 * SR))[:, None]
    parts.append((f'{A}/endslate.mov', m, 'end slate'))

# ---------- audio programme + loudnorm 2 passes
prog = np.concatenate([p[1] for p in parts]); wr('work/_prog.wav', prog)
out = subprocess.run(['ffmpeg', '-nostats', '-i', 'work/_prog.wav', '-af', 'loudnorm=I=-16:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
mes = json.loads(out[out.rfind('{'):out.rfind('}') + 1])
ln = (f"loudnorm=I=-16:TP=-1:LRA=11:measured_I={mes['input_i']}:measured_TP={mes['input_tp']}:measured_LRA={mes['input_lra']}"
      f":measured_thresh={mes['input_thresh']}:offset={mes['target_offset']}:linear=true")
run(['ffmpeg', '-v', 'error', '-y', '-i', 'work/_prog.wav', '-af', ln + ',aresample=48000', '-c:a', 'pcm_s16le', 'work/_prog_ln.wav'])

# ---------- vidéo : concat des parties
ins = []; fc = []
for i, (v, _, _) in enumerate(parts):
    ins += ['-i', v]; fc.append(f'[{i}:v]scale={OW}:{OH}:flags=lanczos,setsar=1,format=yuv420p,fps={FPS_N}/{FPS_D}[p{i}]')
fc.append(''.join(f'[p{i}]' for i in range(len(parts))) + f'concat=n={len(parts)}:v=1:a=0[v]')
final = 'work/preview_720p.mp4' if a.preview else 'PODCAST_final.mp4'
enc = ['-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '24'] if a.preview else \
      ['-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '18']
run(['ffmpeg', '-v', 'error', '-y', *ins, '-i', 'work/_prog_ln.wav', '-filter_complex', ';'.join(fc), '-map', '[v]', '-map', f'{len(parts)}:a',
     *enc, '-pix_fmt', 'yuv420p', '-r', f'{FPS_N}/{FPS_D}', '-c:a', 'aac', '-b:a', '320k', '-ar', '48000', '-movflags', '+faststart', final])

# ---------- repères
marks, t = [], 0.0
for v, x, lab in parts:
    marks.append({'partie': lab, 'debut_s': round(t, 3), 'duree_s': round(len(x) / SR, 3)}); t += len(x) / SR
json.dump({'parties': marks, 'loudness_mesure': mes, 'lower_third_s_episode': T_LT, 'cta_s_episode': [T_CTA1, T_CTA2]},
          open(final.replace('.mp4', '_reperes.json'), 'w'), indent=1, ensure_ascii=False)
print('->', final); print(json.dumps(marks, ensure_ascii=False))
