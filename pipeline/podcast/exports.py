"""ÉTAPE 12 — Exports : chapitres YouTube (titres déduits de la transcription, relus à la main dans
pipeline/podcast/chapitres.json, temps épisode) et punchlines restantes pour des shorts 9:16.
Sorties : CHAPITRES_youtube.txt, SHORTS_punchlines.json (temps source, à passer au pipeline vertical)"""
import json
R = json.load(open('work/preview_720p_reperes.json' if __import__('sys').argv[1:] == ['--preview'] else 'PODCAST_final_reperes.json'))
off = next(p['debut_s'] for p in R['parties'] if p['partie'].startswith('épisode'))
C = json.load(open('pipeline/podcast/chapitres.json'))
fmt = lambda t: f"{int(t // 60)}:{int(t % 60):02d}" if t < 3600 else f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{int(t % 60):02d}"
lines = ['0:00 Teaser'] + [f"{fmt(off + c['t'])} {c['titre']}" for c in C]
open('CHAPITRES_youtube.txt', 'w').write('\n'.join(lines) + '\n'); print('\n'.join(lines))
cfg = json.load(open('pipeline/podcast/config.json'))
P = [p for p in json.load(open('pipeline/podcast/punchlines.json')) if p['id'] not in cfg.get('teaser', [])]
json.dump({'source': 'source.mp4', '_doc': 'temps source (s) — à monter en 9:16 avec le pipeline vertical (pipeline/segments.py)',
           'shorts': P}, open('SHORTS_punchlines.json', 'w'), ensure_ascii=False, indent=1)
print(len(P), 'punchlines pour les shorts :', ', '.join(p['id'] for p in P))
