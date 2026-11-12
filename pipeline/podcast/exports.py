"""ÉTAPE 12 — Exports : chapitres YouTube (titres déduits de la transcription, relus à la main dans
pipeline/podcast/chapitres.json, temps épisode) 
Sortie : CHAPITRES_youtube.txt"""
import json
R = json.load(open('work/preview_720p_reperes.json' if __import__('sys').argv[1:] == ['--preview'] else 'PODCAST_final_reperes.json'))
off = next(p['debut_s'] for p in R['parties'] if p['partie'].startswith('épisode'))
C = json.load(open('pipeline/podcast/chapitres.json'))
import re, unicodedata
EPW = json.load(open('work/ep_words.json'))
nz = lambda x: re.sub(r"[^a-z0-9]", '', unicodedata.normalize('NFD', x.lower()).encode('ascii', 'ignore').decode())
toks = [nz(w['w']) for w in EPW]
def ancre(ph):            # temps épisode de la 1re occurrence de la phrase d'ancrage
    target = nz(ph)
    for i in range(len(EPW)):
        acc, j = '', i
        while j < len(EPW) and len(acc) < len(target): acc += toks[j]; j += 1
        if acc.startswith(target): return max(0.0, EPW[i]['t0'] - 0.3)
    raise SystemExit(f'ancre introuvable : {ph}')
for c in C:
    if 'ancre' in c: c['t'] = ancre(c['ancre'])
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02d}" if t < 3600 else f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{int(t % 60):02d}"
lines = ['0:00 Teaser'] + [f"{fmt(off + c['t'])} {c['titre']}" for c in C]
open('CHAPITRES_youtube.txt', 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines))
