"""Outil : retrouve l'horodatage exact d'une phrase dans work/words.json.
Usage : python3 pipeline/podcast/find_phrase.py "début de phrase" "fin de phrase" [après_s]"""
import json, sys, re, unicodedata
W = json.load(open('work/words.json'))
norm = lambda s: re.sub(r"[^a-z0-9%]", '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
toks = [norm(w['w']) for w in W]
def find(ph, start=0):
    p = [norm(x) for x in ph.split() if norm(x)]
    for i in range(start, len(W)):
        j, k = i, 0; s = ''
        while j < len(W) and len(s) < len(''.join(p)):
            s += toks[j]; j += 1
        if s.startswith(''.join(p)): return i, j - 1
    return None
a = float(sys.argv[3]) if len(sys.argv) > 3 else 0
i0 = next(i for i, w in enumerate(W) if w['t0'] >= a)
s = find(sys.argv[1], i0); e = find(sys.argv[2], s[0])
print(f"{W[s[0]]['t0']:.2f} -> {W[e[1]]['t1']:.2f} ({W[e[1]]['t1']-W[s[0]]['t0']:.1f}s) :",
      ' '.join(w['w'] for w in W[s[0]:e[1] + 1]))
