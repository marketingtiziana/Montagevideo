"""ÉTAPE 2 — EDL automatique du corps de l'épisode (multicam).
Caméras : L = plan large, H = rapproché hôte, I = rapproché invité.
Règles :
  * par défaut, rapproché de la personne qui parle ; changement d'orateur -> coupe en J-cut (3 images avant la
    première syllabe) ; si la phrase précédente déborde (moins de 3 images de pause) -> L-cut (3 images après)
  * relances courtes (« d'accord », « très clair », < 1,2 s) pendant que l'autre parle : pas de coupe
  * échanges rapides (prises de parole < 2 s qui s'enchaînent) et répliques isolées trop courtes -> plan large
  * plans : min 2,5 s, cible 6-14 s, max 18 s ; monologue > 18 s -> rapproché / large (4-8 s) / rapproché,
    coupes sur une pause ; les raccords de l'étape 1 (sauts d'image) sont cachés en priorité par une coupe
  * plan de réaction (1,5-3 s) toutes les 2-3 min sur la personne qui écoute quand elle hoche la tête / sourit
  * uniquement des coupes franches
Entrées : work/ep_words.json, work/keep.json, work/visual.json, pipeline/podcast/corrections_orateurs.json
Sorties : work/edl.json, work/edl.txt"""
import json, math
import numpy as np

FPS = 30000 / 1001
fr = lambda t: int(round(t * FPS))
sec = lambda f: f / FPS
J_CUT, L_CUT = 3, 3
CLOSE = {'hote': 'H', 'invite': 'I'}
OTHER = {'hote': 'invite', 'invite': 'hote'}

W = json.load(open('work/ep_words.json'))
K = json.load(open('work/keep.json'))
SEG = K['segments']; EP_END = SEG[-1]['ep1']
for a, b, s, *_ in json.load(open('pipeline/podcast/corrections_orateurs.json'))['corrections']:
    for w in W:
        if a <= (w['src0'] + w['src1']) / 2 <= b: w['spk'] = s
W = [w for w in W if w['w'].strip(' ?.,!…')]                 # ponctuation isolée -> ignorée

# sauts d'image (raccords de l'étape 1) sur la timeline épisode ; « éditorial » = gros saut, à cacher absolument
CUTS = json.load(open('work/cuts.json'))['coupes']
jumps = []
for s in SEG[1:]:
    gap = next((c for c in CUTS if abs(c['t1'] - s['src0']) < 0.02), None)
    prev = SEG[SEG.index(s) - 1]
    jumps.append({'f': s['ep0'], 'edito': bool(gap and gap['type'] == 'éditorial'), 'src': s['src0'],
                  'retire': round(s['src0'] - prev['src1'], 3)})
def jump_cost(j, cam):
    if j['edito']: return 1000.0
    r = j['retire']; c = 0.3 if r < 0.35 else (1.5 if r < 1.0 else 5.0)
    return c * (0.6 if cam == 'L' else 1.0)

# ---------- 1. tours de parole
turns = []
for w in W:
    if turns and turns[-1]['spk'] == w['spk'] and w['t0'] - turns[-1]['t1'] < 1.2:
        turns[-1]['t1'] = w['t1']; turns[-1]['w'].append(w)
    else:
        turns.append({'spk': w['spk'], 't0': w['t0'], 't1': w['t1'], 'w': [w]})
# relances : courtes, entourées par l'autre orateur -> absorbées
for i in range(1, len(turns) - 1):
    t, a, b = turns[i], turns[i - 1], turns[i + 1]
    if (t['t1'] - t['t0'] < 1.2 and len(t['w']) <= 4 and a['spk'] == b['spk'] != t['spk']
            and t['t0'] - a['t1'] < 1.5 and b['t0'] - t['t1'] < 1.5):
        t['backchannel'] = True
merged = []
for t in turns:
    if t.get('backchannel'):
        merged[-1].setdefault('relances', []).append(' '.join(x['w'] for x in t['w'])); continue
    if merged and merged[-1]['spk'] == t['spk']:
        merged[-1]['t1'] = t['t1']; merged[-1]['w'] += t['w']
    else:
        merged.append(dict(t))
turns = merged

# ---------- 2. régions : tours longs (rapproché) et échanges rapides (large)
items = []
for t in turns:
    short = t['t1'] - t['t0'] < 2.0
    if short and items and items[-1]['kind'] == 'exchange':
        items[-1]['turns'].append(t); items[-1]['t1'] = t['t1']
    elif short:
        items.append({'kind': 'exchange', 'turns': [t], 't0': t['t0'], 't1': t['t1']})
    else:
        items.append({'kind': 'turn', 'spk': t['spk'], 'turns': [t], 't0': t['t0'], 't1': t['t1'], 'w': t['w']})
# un tour long trop court pour un rapproché (< 2,5 s) rejoint l'échange voisin
for it in items:
    if it['kind'] == 'turn' and it['t1'] - it['t0'] < 2.5: it['kind'] = 'exchange'
merged = []
for it in items:
    if merged and merged[-1]['kind'] == it['kind'] == 'exchange':
        merged[-1]['turns'] += it['turns']; merged[-1]['t1'] = it['t1']
    else: merged.append(it)
items = merged

def boundary(prev_end, next_start):
    """Point de coupe entre deux orateurs : J-cut si la pause le permet, sinon L-cut."""
    if fr(next_start) - fr(prev_end) >= J_CUT: return fr(next_start) - J_CUT, 'J-cut'
    return fr(prev_end) + L_CUT, 'L-cut'

bounds = [(0, 'début')]
for a, b in zip(items, items[1:]):
    f, why = boundary(a['t1'], b['t0'])
    near = [j for j in jumps if abs(j['f'] - f) <= (20 if j['edito'] else 8)]
    if near:
        j = min(near, key=lambda j: (not j['edito'], abs(j['f'] - f))); f, why = j['f'], why + ' sur raccord'
    bounds.append((f, why))
bounds.append((EP_END, 'fin'))

# ---------- 3. découpage de chaque région (programmation dynamique)
def candidates(it, f0, f1):
    c = {}
    ws = it.get('w', [])
    for a, b in zip(ws, ws[1:]):
        if b['t0'] - a['t1'] >= 0.25 or (a['w'][-1:] in '.?!,' and b['t0'] - a['t1'] >= 0.12):
            f = max(fr(b['t0']) - J_CUT, fr(a['t1']) + 1)
            if f0 < f < f1: c[f] = 'pause'
    for j in jumps:
        if f0 < j['f'] < f1: c[j['f']] = 'raccord éditorial' if j['edito'] else 'raccord'
    return c

def shot_cost(d, cam, is_last, carry=False, hi_close=18.0):
    if cam == 'L':
        if carry:
            return math.inf if d < 2.5 or d > 8 else 0.5 + 0.4 * (d - 2.5)
        if d < 3.5 or d > 9.0: return math.inf
        return 2.5 + (0 if 4 <= d <= 8 else 0.8 * (min(abs(d - 4), abs(d - 8))) ** 2)
    if d < 2.5 or d > hi_close: return math.inf
    if d > 18: return 50 + (d - 18) * 5
    return 0 if 6 <= d <= 14 else 0.15 * (min(abs(d - 6), abs(d - 14))) ** 2

def solve(it, f0, f1, start_wide_from=None, relax=1.0, end_close=False):
    close = CLOSE[it['spk']]
    cand = candidates(it, f0, f1)
    P = [f0] + sorted(cand) + [f1]
    jf = [j for j in jumps if f0 < j['f'] < f1]
    def inside(a, b, cam):
        return sum(jump_cost(j, cam) for j in jf if a < j['f'] < b)
    n = len(P); INF = math.inf
    best = {(0, 'L'): (0.0, None)} if start_wide_from is None else {}   # état « avant » = large -> 1er plan rapproché
    if start_wide_from is not None: best[(0, 'carry')] = (0.0, None)
    for i in range(1, n):
        for j in range(i):
            for pc in ('C', 'L', 'carry'):
                if (j, pc) not in best: continue
                for cam in ('C', 'L'):
                    if pc == 'carry' and cam != 'L': continue        # le large de l'échange se prolonge
                    if pc == cam: continue
                    a = start_wide_from if pc == 'carry' else P[j]
                    c = shot_cost(sec(P[i] - a), 'L' if cam == 'L' else close, i == n - 1, pc == 'carry', 18 * relax)
                    if c == INF: continue
                    c += inside(a, P[i], cam) + (0.3 if i < n - 1 else 0)
                    tot = best[(j, pc)][0] + c
                    if (i, cam) not in best or tot < best[(i, cam)][0]: best[(i, cam)] = (tot, (j, pc))
    end = [k for k in best if k[0] == n - 1 and not (end_close and k[1] == 'L')]
    if not end: return None
    k = min(end, key=lambda k: best[k][0]); out = []
    while best[k][1] is not None:
        j, pc = best[k][1]
        a = start_wide_from if pc == 'carry' else P[j]
        out.append((a, P[k[0]], 'L' if k[1] == 'L' else close, cand.get(a, '')))
        k = (j, pc)
    return out[::-1]

shots = []
carry = None   # (début du large, raison) si un échange trop court doit se prolonger en large
for idx, it in enumerate(items):
    f0, why0 = bounds[idx]; f1 = bounds[idx + 1][0]
    if it['kind'] == 'exchange':
        if sec(f1 - f0) >= 2.5:
            shots.append({'f0': f0, 'f1': f1, 'cam': 'L', 'kind': 'échange', 'why': f'{why0} · échange rapide'})
        else:
            carry = f0
        continue
    if idx == 0:            # ouverture de l'épisode : plan large d'installation
        carry = 0
    ec = idx + 1 < len(items) and items[idx + 1]['kind'] == 'exchange'
    sol = solve(it, f0, f1, start_wide_from=carry, end_close=ec) or solve(it, f0, f1, start_wide_from=carry, relax=1.6, end_close=ec) \
        or solve(it, f0, f1, start_wide_from=carry, relax=1.6)
    if sol is None and carry is not None:
        shots.append({'f0': carry, 'f1': f0, 'cam': 'L', 'kind': 'échange', 'why': 'échange court'}); carry = None
        sol = solve(it, f0, f1) or solve(it, f0, f1, relax=1.6)
    if sol is None:
        sol = [(f0, f1, CLOSE[it['spk']], '')]
    for k, (a, b, cam, w) in enumerate(sol):
        kind = 'large' if cam == 'L' else 'rapproché'
        why = (why0 if k == 0 and a == f0 else w or 'pause')
        if k == 0 and carry is not None and a == carry: why = 'ouverture' if idx == 0 else 'échange court prolongé'
        shots.append({'f0': a, 'f1': b, 'cam': cam, 'kind': kind, 'spk': it['spk'], 'why': why})
    carry = None
if carry is not None:
    shots.append({'f0': carry, 'f1': EP_END, 'cam': 'L', 'kind': 'échange', 'why': 'fin'})
shots.sort(key=lambda s: s['f0'])
# raccord des trous / chevauchements éventuels
for a, b in zip(shots, shots[1:]): a['f1'] = b['f0']
shots[-1]['f1'] = EP_END
# fusion de deux plans consécutifs sur la même caméra
merged = []
for s in shots:
    if merged and merged[-1]['cam'] == s['cam']: merged[-1]['f1'] = s['f1']
    else: merged.append(s)
shots = merged

# ---------- 4. plans de réaction (toutes les 2 à 3 min, sur un hochement / sourire de la personne qui écoute)
V = json.load(open('work/visual.json'))
def src_t(ep_s):
    for s in SEG:
        if s['ep0'] <= fr(ep_s) < s['ep1']: return s['src0'] + ep_s - sec(s['ep0'])
    return None
cfg = json.load(open('pipeline/podcast/config.json'))
side = {'hote': cfg.get('cote_hote', 'droite')}; side['invite'] = 'gauche' if side['hote'] == 'droite' else 'droite'
head = {k: np.array(V['faces'][k]) for k in ('gauche', 'droite')}
mouth = {k: np.array(V['mouth'][k]) for k in ('gauche', 'droite')}
def listener_score(spk_listen, t0, t1):
    """Hochement (mouvement vertical de la tête) + sourire (bouche qui bouge sans parler)."""
    a, b = src_t(t0), src_t(t1)
    if a is None or b is None or b < a: return 0
    F = head[side[spk_listen]]; m = (F[:, 0] >= a) & (F[:, 0] <= b)
    nod = float(np.std(F[m, 2])) * 100 if m.sum() >= 3 else 0
    M = mouth[side[spk_listen]]; mm = M[int(a * 10):int(b * 10)]
    return nod + 0.05 * float(mm.mean() if len(mm) else 0)
def silent(spk, t0, t1):
    return not any(w['spk'] == spk and w['t1'] > t0 and w['t0'] < t1 for w in W)
R = fr(2.0); last = -999.0; react = []
for s in list(shots):
    if s['kind'] != 'rapproché': continue
    t0, t1 = sec(s['f0']), sec(s['f1'])
    if t0 - last < 120 or t1 - t0 < 2.5 + 2.0 + 2.5: continue
    lis = OTHER[s['spk']]
    opts = []
    for j in jumps:                        # de préférence sur un raccord (le plan de réaction le cache)
        if s['f0'] + fr(2.5) <= j['f'] <= s['f1'] - fr(2.5) - R and silent(lis, sec(j['f']), sec(j['f'] + R)):
            opts.append((listener_score(lis, sec(j['f']), sec(j['f'] + R)) + 1.0, j['f']))
    for f in range(s['f0'] + fr(2.5), s['f1'] - fr(2.5) - R, fr(0.5)):
        if silent(lis, sec(f), sec(f + R)): opts.append((listener_score(lis, sec(f), sec(f + R)), f))
    if not opts: continue
    sc, f = max(opts)
    react.append({'f0': f, 'f1': f + R, 'cam': CLOSE[lis], 'kind': 'réaction', 'spk': lis, 'why': f'réaction (score {sc:.2f})'})
    last = sec(f)
for r in react:
    s = next(x for x in shots if x['f0'] < r['f0'] < x['f1'])
    tail = dict(s, f0=r['f1'], why='retour après réaction'); s['f1'] = r['f0']
    shots += [r, tail]
shots.sort(key=lambda s: s['f0'])

# ---------- 5. contrôle + export
for i, s in enumerate(shots):
    s.update(i=i, t0=round(sec(s['f0']), 3), t1=round(sec(s['f1']), 3), dur=round(sec(s['f1'] - s['f0']), 2))
cuts_f = {s['f0'] for s in shots}
hidden = [j for j in jumps if j['f'] in cuts_f]
visible = [j for j in jumps if j['f'] not in cuts_f]
body = [s for s in shots if s['kind'] != 'réaction']
stats = {
    'plans': len(shots), 'durée_épisode_s': round(sec(EP_END), 2),
    'par_caméra_s': {c: round(sum(s['dur'] for s in shots if s['cam'] == c), 1) for c in 'HIL'},
    'durée_plan_moyenne_s': round(float(np.mean([s['dur'] for s in body])), 2),
    'plan_le_plus_court_hors_réaction_s': min(s['dur'] for s in body),
    'plan_le_plus_long_s': max(s['dur'] for s in shots),
    'plans_<2.5s_hors_réaction': [s['i'] for s in body if s['dur'] < 2.5],
    'plans_>18s': [s['i'] for s in shots if s['dur'] > 18],
    'réactions': len(react),
    'raccords_cachés_par_une_coupe': len(hidden), 'raccords_restants_dans_un_plan': len(visible),
    'raccords_éditoriaux_visibles': [round(sec(j['f']), 2) for j in visible if j['edito']],
}
json.dump({'fps': '30000/1001', 'stats': stats, 'shots': shots,
           'raccords_restants': [{'f': j['f'], 't': round(sec(j['f']), 2)} for j in visible]},
          open('work/edl.json', 'w'), ensure_ascii=False, indent=1)
fmt = lambda t: f"{int(t // 60):02d}:{t % 60:05.2f}"
NAME = {'H': 'RAPPROCHÉ HÔTE', 'I': 'RAPPROCHÉ INVITÉE', 'L': 'PLAN LARGE'}
with open('work/edl.txt', 'w') as f:
    for s in shots:
        txt = ' '.join(w['w'] for w in W if s['t0'] <= w['t0'] < s['t1'])
        f.write(f"{s['i']:3d} {fmt(s['t0'])} → {fmt(s['t1'])} {s['dur']:5.2f}s  {NAME[s['cam']]:18s} {s['kind']:10s} {s['why'][:26]:26s} | {txt[:90]}\n")
print(json.dumps(stats, ensure_ascii=False, indent=1))
