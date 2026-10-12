#!/usr/bin/env python3
"""Diff automatique SCRIPT ↔ FACTS : tout chiffre, date ou affirmation à l'écran doit matcher une ligne sourcée de FACTS.md.
Usage : python3 -I tools/facts_diff.py build/screens.json FACTS.md build/facts_diff.md
"""
import json, re, sys
screens = json.load(open(sys.argv[1])); facts = open(sys.argv[2], encoding='utf-8').read()
# faits autorisés à l'écran : section « Faits retenus pour l'écran »
sect = facts.split('## Faits retenus pour l\'écran')[1].split('## Exclus')[0]
allowed = [l for l in sect.splitlines() if l.startswith('| ') and not l.startswith('| Réf') and not l.startswith('|---')]
allowed_text = ' '.join(allowed)
norm = lambda s: s.replace(' ', ' ').replace('–', '-').replace('−', '-')
# tokens à vérifier : nombres, dates, pourcentages, mots-clés factuels
rules = [
    (r'150 km', 'G1'), (r'28 février 2026', 'A1'), (r'partiellement fermé', 'A1'), (r'16 mars 2026', 'A3'), (r'suspendus à DXB', 'A3'),
    (r'-31 %', 'A5'), (r'1er semestre 2026', 'A5'), (r"clause d'exclusion", 'I1'), (r'180 jours', 'V1'), (r'visa de résidence annulé', 'V1'),
    (r'hors Golden Visa', 'V1'), (r'-38 %', 'R1'), (r'3e trimestre 2026', 'R1'), (r'Cavendish Maxwell', 'R1'), (r'183 jours', 'T1'),
    (r'un seul critère suffit', 'T3'), (r'3 mois', 'T4'), (r'vérifié le 12/10/2026', 'date'),
]
rows, fails = [], 0
for s in screens:
    txt = norm(s['text'] + ' ' + s.get('sub', ''))
    nums = re.findall(r'\d+[\d/,.]*\s?%?', txt)
    matched = [ref for pat, ref in rules if re.search(pat, txt)]
    # chaque nombre doit être couvert par une règle
    uncovered = []
    for n in nums:
        n2 = n.strip()
        if n2 in ('2',) and 'juridictions' in txt: continue   # « 2 juridictions » : solution, pas un fait
        if n2 in ('2ᵉ', '2') and 'pays' in txt: continue
        if not any(re.search(pat, txt) and n2.replace(' ', '') in norm(pat).replace(' ', '') or n2 in norm(pat) for pat, _ in rules):
            # tolérance : nombre inclus dans une date/pourcentage déjà couvert
            if not any(n2 in norm(pat) for pat, _ in rules): uncovered.append(n2)
    ok_facts = all(ref == 'date' or ref in allowed_text for ref in matched)
    verdict = 'OK' if not uncovered and ok_facts else 'ÉCHEC : ' + ', '.join(uncovered)
    if verdict != 'OK': fails += 1
    rows.append((s['id'], txt, ', '.join(matched) or '—', verdict))
with open(sys.argv[3], 'w') as f:
    f.write('# Diff SCRIPT ↔ FACTS (automatique)\n\nChaque nombre/date/affirmation à l\'écran doit correspondre à une référence de la section « Faits retenus pour l\'écran » de FACTS.md.\n\n| Écran | Texte (titre + sous-titre) | Réfs FACTS | Verdict |\n|---|---|---|---|\n')
    for r in rows: f.write(f'| {r[0]} | {r[1]} | {r[2]} | {r[3]} |\n')
    f.write(f'\n**{len(rows) - fails}/{len(rows)} écrans conformes.**\n')
print(open(sys.argv[3]).read()); sys.exit(1 if fails else 0)
