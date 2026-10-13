#!/usr/bin/env python3
"""Mix audio : musique 2 actes + SFX synthétisés (-10 dB sous la musique), ducking -4 dB sous les impacts,
jamais deux SFX superposés, fade-out 1,5 s. Sortie pré-mix 48 kHz stéréo ; la normalisation -14 LUFS / TP -1 dBTP
se fait ensuite avec ffmpeg loudnorm (2 passes) — voir tools/mux.sh.

Usage : python3 -I tools/mix_audio.py build/layout.json audio/music_synth.wav sfx audio/mix_pre.wav build/sfx_events.json
"""
import json, sys, os
import numpy as np, soundfile as sf

layout, music_path, sfx_dir, out_path, events_out = sys.argv[1:6]
SR = 48000
lay = json.load(open(layout))
TOTAL = lay['total']
N = int((TOTAL + 0.05) * SR)
music, sr = sf.read(music_path, dtype='float32')
assert sr == SR
if music.ndim == 1: music = np.stack([music, music], 1)
music = music[:N] if len(music) >= N else np.pad(music, ((0, N - len(music)), (0, 0)))

def load(name):
    y, s = sf.read(os.path.join(sfx_dir, name + '.wav'), dtype='float32'); assert s == SR
    return y if y.ndim == 1 else y.mean(1)

S = {k: load(k) for k in ['tick', 'tick_soft', 'impact_sub', 'whoosh', 'ping_radar', 'ding', 'tictac_loop', 'rise', 'flash_hit']}
MUSIC_GAIN = 0.9
SFX_GAIN = MUSIC_GAIN * 10 ** (-10 / 20)      # -10 dB sous la musique
ACT2 = 28.0

# ---- événements (priorité décroissante : impacts > flash > ding > ping > whoosh > tick) ----
ev = []
scr = lay['screens']
ids = sorted(scr)
for i, sid in enumerate(ids):
    s = scr[sid]; t0 = s['t0']
    if sid in ('s12', 's13', 's14', 's15', 's16'):
        ev.append((t0, 'impact_sub', 1.0, 10)); ev.append((t0 + 0.35, 'ding', 1.0, 8))
    if sid == 's06': ev.append((t0, 'flash_hit', 1.0, 10))
    if sid == 's01': ev.append((0.0, 'impact_sub', 1.0, 10))
    if sid == 's11': ev.append((t0, 'impact_sub', 0.8, 10))
    if sid == 's19': ev.append((t0, 'impact_sub', 0.8, 10))
    if sid == 's02': ev.append((t0 + 0.1, 'ping_radar', 1.0, 7))
    if sid == 's21': ev.append((t0 + 0.6, 'ding', 1.0, 8))
    # zoom-whip (un cut sur trois : index 2, 5, 8 …) → whoosh juste avant la coupe
    if i % 3 == 2 and i < len(ids) - 1: ev.append((s['t1'] - 0.08, 'whoosh', 1.0, 6))
    # tick sur chaque mot qui apparaît (acte 1 : tick, acte 2 : tick_soft)
    for w in s['words']:
        if w.get('sub'): continue
        ev.append((t0 + w['delay'], 'tick' if t0 < ACT2 else 'tick_soft', 0.8, 2))
# rise 9→10 s déjà dans la musique ; on ajoute un rise SFX discret à 9,0 s
ev.append((9.0, 'rise', 0.5, 9))
ev.sort(key=lambda e: (e[0], -e[3]))

# ---- placement sans superposition : un SFX ne démarre pas tant que le précédent (plus prioritaire ou plus long) joue
mix = np.zeros((N, 2), dtype=np.float32)
placed, busy_until = [], -1.0
for t, name, g, prio in ev:
    y = S[name]; dur = len(y) / SR
    if t < busy_until:
        # conflit : un tick cède ; un événement prioritaire remplace (on laisse jouer le précédent déjà écrit, mais on saute)
        if prio <= 2: continue
        if t + 0.02 < busy_until and prio < 10: continue
    k = int(t * SR); m = min(len(y), N - k)
    if m <= 0: continue
    mix[k:k+m, 0] += y[:m] * g * SFX_GAIN; mix[k:k+m, 1] += y[:m] * g * SFX_GAIN
    placed.append(dict(t=round(t, 3), sfx=name, gain=g)); busy_until = t + min(dur, 0.6 if name != 'ding' else 1.0)
# tic-tac discret en boucle sous l'acte 1 (déjà dans la musique à faible niveau ; couche SFX -16 dB)
tt = S['tictac_loop']; k = 0
while k < int(ACT2 * SR):
    m = min(len(tt), int(ACT2 * SR) - k); mix[k:k+m, 0] += tt[:m] * SFX_GAIN * 0.5; mix[k:k+m, 1] += tt[:m] * SFX_GAIN * 0.5; k += len(tt)

# ---- ducking -4 dB sous les impacts (attaque 20 ms, maintien 250 ms, relâche 400 ms)
duck = np.ones(N, dtype=np.float32)
for p in placed:
    if p['sfx'] in ('impact_sub', 'flash_hit'):
        k = int(p['t'] * SR); a, h, r = int(0.02 * SR), int(0.25 * SR), int(0.4 * SR)
        seg = np.concatenate([np.linspace(1, 10 ** (-4 / 20), a), np.full(h, 10 ** (-4 / 20)), np.linspace(10 ** (-4 / 20), 1, r)])
        m = min(len(seg), N - k); duck[k:k+m] = np.minimum(duck[k:k+m], seg[:m])
out = music * MUSIC_GAIN * duck[:, None] + mix
# fade-out 1,5 s
fo = int(1.5 * SR); out[-fo:] *= np.linspace(1, 0, fo)[:, None]
out = np.tanh(out * 1.05) / np.tanh(1.05)
sf.write(out_path, out.astype(np.float32), SR)
json.dump(dict(events=placed, music=music_path, sfx_gain_db=-10, duck_db=-4), open(events_out, 'w'), indent=1)
print('mix écrit', out_path, '| SFX placés :', len(placed), '| ignorés (superposition) :', len(ev) - len(placed))
