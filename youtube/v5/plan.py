"""Construit la timeline de sortie : clips (source -> sortie), cadrages, et conversion des temps."""
import json, os
from timeline import FPS, COLD_OPEN, TITLE_DUR, END_DUR, CLOSE, G, load_edl, HERE

def fr(t): return int(round(t * FPS))

def build_clips():
    clips = []          # dict(kind, s_f, e_f, o_f, framing)
    o = 0
    a, b = fr(COLD_OPEN[0]), fr(COLD_OPEN[1])
    clips.append(dict(kind='src', s_f=a, e_f=b, o_f=o, framing='C', cold=True)); o += b - a
    clips.append(dict(kind='title', n_f=fr(TITLE_DUR), o_f=o)); o += fr(TITLE_DUR)
    for s, e in load_edl():
        a, b = fr(s), fr(e)
        clips.append(dict(kind='src', s_f=a, e_f=b, o_f=o)); o += b - a
    clips.append(dict(kind='end', n_f=fr(END_DUR), o_f=o)); o += fr(END_DUR)
    assign_framing(clips)
    return clips, o

def _overlaps(a, b, lo, hi): return a < hi and b > lo

def assign_framing(clips):
    need_wide = [g['src'] for g in G if g['kind'] in ('CARD', 'LT')]
    split = [g['src'] for g in G if g['kind'] == 'SPLIT']
    alt = 0
    for c in clips:
        if c['kind'] != 'src' or c.get('framing'): continue
        s, e = c['s_f'] / FPS, c['e_f'] / FPS
        if any(_overlaps(s, e, *r) for r in split):
            c['framing'] = 'MC'[alt % 2]; alt += 1   # vignette réduite : cadres serrés, en alternance
        elif any(_overlaps(s, e, *r) for r in need_wide):
            c['framing'] = 'W'          # zone droite libre pour la carte
        elif any(_overlaps(s, e, *r) and (r[1]-r[0]) >= 0.6*(e-s) or (s <= r[0] and r[1] <= e) for r in CLOSE):
            c['framing'] = 'C'
        else:
            c['framing'] = 'WM'[alt % 2]; alt += 1
    # éviter deux plans identiques consécutifs (saut visible) quand c'est possible
    prev = None
    for c in clips:
        if c['kind'] != 'src': prev = None; continue
        s, e = c['s_f'] / FPS, c['e_f'] / FPS
        in_split = any(_overlaps(s, e, *r) for r in split)
        if prev and prev['framing'] == c['framing'] and in_split:
            c['framing'] = 'C' if c['framing'] == 'M' else 'M'
        elif prev and prev['framing'] == c['framing'] == 'M':
            c['framing'] = 'W'
        elif prev and prev['framing'] == c['framing'] == 'W':
            s, e = c['s_f'] / FPS, c['e_f'] / FPS
            locked = any(_overlaps(s, e, *g['src']) for g in G if g['kind'] in ('CARD', 'LT'))
            c['framing'] = 'W2' if locked else 'M'
        prev = c

def src2out(t, clips):
    """Temps source (s) -> temps de sortie (s). None si coupé. Utilise le corps (pas le cold open)."""
    f = t * FPS
    for c in clips:
        if c['kind'] == 'src' and not c.get('cold') and c['s_f'] <= f < c['e_f']:
            return (c['o_f'] + (f - c['s_f'])) / FPS
    return None

def src2out_near(t, clips, forward=True):
    """Comme src2out, mais si t tombe dans une coupe, prend le bord le plus proche."""
    r = src2out(t, clips)
    if r is not None: return r
    body = [c for c in clips if c['kind'] == 'src' and not c.get('cold')]
    if forward:
        nxt = [c for c in body if c['s_f'] / FPS >= t]
        if nxt: return nxt[0]['o_f'] / FPS
    prv = [c for c in body if c['e_f'] / FPS <= t]
    return (prv[-1]['o_f'] + prv[-1]['e_f'] - prv[-1]['s_f']) / FPS if prv else 0.0

if __name__ == '__main__':
    clips, total = build_clips()
    json.dump(dict(clips=clips, total_f=total), open(os.path.join(HERE, 'build', 'clips.json'), 'w'), indent=0)
    from collections import Counter
    print('durée totale', f"{total/FPS//60:.0f}:{total/FPS%60:05.2f}", Counter(c.get('framing') for c in clips if c['kind']=='src'))
