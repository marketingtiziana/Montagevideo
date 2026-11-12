"""ÉTAPE 12 — Exports : chapitres YouTube (titres déduits de la transcription, relus à la main dans
pipeline/podcast/chapitres.json, temps épisode) 
Sortie : CHAPITRES_youtube.txt"""
import json
R = json.load(open('work/preview_720p_reperes.json' if __import__('sys').argv[1:] == ['--preview'] else 'PODCAST_final_reperes.json'))
off = next(p['debut_s'] for p in R['parties'] if p['partie'].startswith('épisode'))
C = json.load(open('pipeline/podcast/chapitres.json'))
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02d}" if t < 3600 else f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{int(t % 60):02d}"
lines = ['0:00 Teaser'] + [f"{fmt(off + c['t'])} {c['titre']}" for c in C]
open('CHAPITRES_youtube.txt', 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines))
