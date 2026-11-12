"""ÉTAPE 3 — Punch-ins (zooms numériques instantanés 100 % -> 112 %, centrés visage) sur les rapprochés.
Déclencheurs, par priorité :
  1. punchlines validées (pipeline/podcast/punchlines.json) : zoom sur le mot fort
  2. chiffres et mots forts (%, zéro, mois, ans, jamais, toujours, burn-out…)
  3. plan rapproché de plus de 10 s : on le casse — de préférence sur un raccord de l'étape 1 (le zoom le cache)
Règles : 1 à 2 par minute au maximum (fenêtre glissante de 60 s, écart mini 20 s), tenue jusqu'à la coupe
suivante ou 3 à 6 s puis retour sec à 100 % sur une pause. Jamais d'animation : changement de cadre à l'image près.
Sortie : work/punchins.json"""
import json, re, unicodedata
FPS = 30000 / 1001
fr = lambda t: int(round(t * FPS)); sec = lambda f: f / FPS
ZOOM = 1.12
E = json.load(open('work/edl.json')); shots = E['shots']
W = json.load(open('work/ep_words.json')); SEG = json.load(open('work/keep.json'))['segments']
P = json.load(open('pipeline/podcast/punchlines.json'))
jumps = {s['ep0'] for s in SEG[1:]}
norm = lambda s: unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode()
STRONG = re.compile(r"^(\d+|zero|jamais|toujours|burn|evasion|impots?|gouffre|bonheur|regrette|mission|honnete|"
                    r"reve|reves|personne|tout|rien|bali|dubai|huppee|fric|couillonner)")

def src2ep(t):
    for g in SEG:
        if g['src0'] <= t < g['src1']: return sec(g['ep0']) + t - g['src0']
    return None

cands = []
for s in shots:
    if s['kind'] != 'rapproché' or s['dur'] < 3.5: continue
    ws = [w for w in W if s['t0'] + 1.0 <= w['t0'] < s['t1'] - 2.0 and w['spk'] == s.get('spk')]
    for w in ws:
        n = norm(w['w']).strip(" ,.?!'-")
        pl = next((p for p in P if p['t0'] <= w['src0'] <= p['t1']), None)
        score = 0
        if STRONG.match(n): score += 2 if re.match(r'^\d', n) or n == 'zero' else 1
        if pl: score += 1.5
        if score: cands.append({'shot': s, 'f': fr(w['t0']) - 1, 'score': score, 'why': f"mot fort « {w['w']} »" + (f" ({pl['id']})" if pl else '')})
    if s['dur'] > 10:
        inner = [f for f in jumps if s['f0'] + fr(3) <= f <= s['f1'] - fr(3)]
        for f in inner: cands.append({'shot': s, 'f': f, 'score': 1.6, 'why': 'casse un plan > 10 s (cache un raccord)'})
        if not inner:
            gaps = [(b['t0'] - a['t1'], b) for a, b in zip(W, W[1:]) if s['t0'] + 3 <= b['t0'] <= s['t1'] - 3]
            if gaps:
                g, b = max(gaps, key=lambda x: x[0])
                cands.append({'shot': s, 'f': fr(b['t0']) - 1, 'score': 1.2, 'why': 'casse un plan > 10 s'})

cands.sort(key=lambda c: -c['score'])
chosen = []
def ok(f):
    if any(abs(f - c['f0']) < fr(20) for c in chosen): return False
    return sum(1 for c in chosen if abs(f - c['f0']) < fr(60)) < 2
for c in cands:
    s = c['shot']
    if any(x['shot'] == s['i'] for x in chosen) or not ok(c['f']): continue
    # sortie : coupe suivante si elle tombe dans 3-6 s, sinon pause entre +3 et +6 s
    end = s['f1']
    if sec(end - c['f']) > 6:
        gaps = [b for a, b in zip(W, W[1:]) if fr(a['t1']) >= c['f'] + fr(3) and fr(b['t0']) <= c['f'] + fr(6) and b['t0'] - a['t1'] >= 0.12]
        js = [f for f in jumps if c['f'] + fr(3) <= f <= c['f'] + fr(6)]
        if js: end = js[0]
        elif gaps: end = fr(gaps[0]['t0']) - 2
        else: continue
    if sec(end - c['f']) < 2.0 or sec(s['f1'] - end) and sec(s['f1'] - end) < 1.0 and end != s['f1']: continue
    chosen.append({'shot': s['i'], 'cam': s['cam'], 'f0': c['f'], 'f1': end, 'zoom': ZOOM, 'why': c['why'],
                   't0': round(sec(c['f']), 2), 't1': round(sec(end), 2)})
chosen.sort(key=lambda c: c['f0'])
dur_min = sec(shots[-1]['f1']) / 60
json.dump({'zoom': ZOOM, 'punchins': chosen}, open('work/punchins.json', 'w'), indent=1, ensure_ascii=False)
print(f'{len(chosen)} punch-ins sur {dur_min:.1f} min = {len(chosen) / dur_min:.2f}/min')
for c in chosen: print(f"  {int(c['t0']//60):02d}:{c['t0']%60:05.2f} -> {c['t1']-c['t0']:.1f}s  plan #{c['shot']}  {c['why']}")
