"""SHORTS TIZIANA — étape 9 : contrôle qualité + livrables
Sorties (output/tiziana_shorts/) : clips_manifest.csv, speaker_detection_report.md, transcription.md,
editing_report.md, contact_sheet.png ; work/shorts/qc.json"""
import csv, json, os, re, subprocess, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont

OUT = 'output/tiziana_shorts'; FPS = 30000 / 1001
CFG = json.load(open('pipeline/shorts/shorts.json'))
PL = json.load(open('work/shorts/plans.json')); RD = json.load(open('work/shorts/render.json'))
PH = json.load(open('work/shorts/phrases.json')); W = json.load(open('work/shorts/words_tiz.json'))
FACE = np.array(json.load(open('work/visual.json'))['faces']['gauche'])
w_ = wave.open('work/audio48.wav'); SR = w_.getframerate()
A = np.frombuffer(w_.readframes(w_.getnframes()), np.int16).reshape(-1, 2)[:, 0].astype(np.float32) / 32768
db = lambda t: 20 * np.log10(np.sqrt((A[int((t - 0.01) * SR):int((t + 0.01) * SR)] ** 2).mean()) + 1e-9)
fmt = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{t % 60:06.3f}"
probe = lambda p, *k: subprocess.check_output(['ffprobe', '-v', 'error', *k, p]).decode().strip()
clean = lambda s: re.sub(r"\s+([,.])", r"\1", re.sub(r" ([' -])", r"\1", s)).replace(" '", "'").replace(' ?', ' ?')

rows, rep, qc = [], [], {}
for s in CFG['shorts']:
    k = str(s['id']); sid = f"short_{s['id']:02d}"; mp4 = f'{OUT}/{sid}/{sid}.mp4'
    P, R = PL[k], RD[k]; ivs = P['ivs']; words = P['words']
    # 1. orateur : toutes les phrases gardées doivent être attribuées à Tiziana
    t0s, t1s = ivs[0]['src0'], ivs[-1]['src1']
    kept_ph = [p for p in PH if any(iv['src0'] <= (p['t0'] + p['t1']) / 2 <= iv['src1'] for iv in ivs)]
    host_in = [p for p in kept_ph if p['spk'] != 'invite']
    verif = [p for p in kept_ph if p['a_verifier']] + [p for p in kept_ph if any(w[4] for w in words if p['t0'] <= w[1] <= p['t1'])]
    conf = float(np.average([w[3] or 0 for w in words], weights=[w[2] - w[1] for w in words]))
    # 2. coupes : niveau aux points de coupe internes
    cut_lv = [db(t) for iv in ivs for t in (iv['src0'], iv['src1'])]
    # 3. silences restants dans le Short (timeline finale)
    offs, acc = [], 0
    for iv in ivs: offs.append(acc); acc += iv['nfr'] / FPS
    def tm(t):
        for iv, of in zip(ivs, offs):
            if iv['src0'] - 0.01 <= t <= iv['src1'] + 0.01: return of + t - iv['src0']
    tl = sorted((tm(w[1]), tm(w[2])) for w in words if tm(w[1]) is not None and tm(w[2]) is not None)
    gaps = [b[0] - a[1] for a, b in zip(tl, tl[1:])]
    # 4. synchro / fichier
    nv = int(probe(mp4, '-count_packets', '-select_streams', 'v', '-show_entries', 'stream=nb_read_packets', '-of', 'csv=p=0'))
    da = float(probe(mp4, '-select_streams', 'a', '-show_entries', 'stream=duration', '-of', 'csv=p=0'))
    wh = probe(mp4, '-select_streams', 'v', '-show_entries', 'stream=width,height', '-of', 'csv=p=0')
    # 5. cadrage : le visage reste dans le cadre (marge 5 %) sur toute la durée
    x, y, wc, hc = R['crop']; m = np.zeros(len(FACE), bool)
    for iv in ivs: m |= (FACE[:, 0] >= iv['src0']) & (FACE[:, 0] <= iv['src1'])
    F = FACE[m]; fx = (F[:, 1] * 3840 - x) / wc; fy = (F[:, 2] * 2160 - y) / hc; fhh = F[:, 4] * 2160 / hc
    face_ok = float(np.mean((fx > 0.12) & (fx < 0.88) & (fy - fhh / 2 > 0.03) & (fy + fhh / 2 < 0.62)))
    # 6. son
    o = subprocess.run(['ffmpeg', '-nostats', '-i', mp4, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float(o.split('I:')[-1].split('LUFS')[0]); TP = float(o.split('Peak:')[-1].split('dBFS')[0])
    # 7. sous-titres
    cs = R['cartes']; lines_ok = all(c['txt'].count('\\N') <= 1 for c in cs)
    checks = {
        'uniquement_tiziana': not host_in, 'phrases_a_verifier': len({p['t0'] for p in verif}),
        'coupes_max_dB': round(float(max(cut_lv)), 1), 'coupes_ok': bool(max(cut_lv) < -30),
        'plus_longue_pause_s': round(max(gaps) if gaps else 0, 2), 'pauses_ok': bool(not gaps or max(gaps) <= 0.85),
        'ecart_av_images': round(abs(nv / FPS - da) * FPS, 2), 'synchro_ok': bool(abs(nv / FPS - da) * FPS < 1.5),
        'format': wh, 'format_ok': wh == '1080,1920', 'visage_dans_cadre': round(face_ok, 3), 'cadrage_ok': face_ok > 0.97,
        'loudness_LUFS': I, 'true_peak_dBTP': TP, 'son_ok': abs(I + 14) <= 1 and TP <= -0.5,
        'sous_titres_2_lignes_max': lines_ok, 'duree_s': round(acc, 2), 'duree_ok': 20 <= acc <= 60}
    ok = all(v for kk, v in checks.items() if kk.endswith('_ok') or kk in ('uniquement_tiziana', 'sous_titres_2_lignes_max'))
    status = 'OK' if ok and not checks['phrases_a_verifier'] else ('OK — à réécouter (attribution douteuse signalée)' if ok else 'À CORRIGER')
    qc[k] = dict(checks, statut=status)
    first = clean(' '.join(w[0] for w in words[:40])); first = re.split(r'(?<=[.?!])\s', first)[0][:160]
    last = clean(' '.join(w[0] for w in words[-40:])); last = re.split(r'(?<=[.?!])\s', last)[-1][-160:]
    rows.append({'short': f'{s["id"]:02d}', 'debut_original': fmt(t0s), 'fin_originale': fmt(t1s), 'duree_finale_s': f'{acc:.1f}',
                 'sujet': s['titre'], 'premiere_phrase': first, 'derniere_phrase': last,
                 'confiance_orateur': f'{conf:.2f}', 'statut_verification': status})
    removed = [r for r in P['removed']]
    rep.append((s, P, R, checks, status, removed, acc, t0s, t1s, conf, verif))

with open(f'{OUT}/clips_manifest.csv', 'w', newline='') as f:
    wr = csv.DictWriter(f, fieldnames=list(rows[0]), delimiter=';'); wr.writeheader(); wr.writerows(rows)
json.dump(qc, open('work/shorts/qc.json', 'w'), ensure_ascii=False, indent=1)

# ---------------- editing_report.md
L = ['# Rapport de montage — Shorts Tiziana', '',
     'Source : `source.mp4` (3840x2160, ~29,97 fps, audio AAC 48 kHz), jamais modifiée. Chaque Short est recadré en 9:16 '
     '(1080x1920, H.264 High CRF 19, AAC 192 kb/s), audio original (gain seul, -14 LUFS), sous-titres blancs centrés.', '',
     '| # | Sujet | Original | Durée | Morceaux | Retiré | Contrôles | Statut |', '|---|---|---|---|---|---|---|---|']
for s, P, R, c, st, rm, acc, a0, a1, conf, verif in rep:
    nh = sum(1 for r in rm if r[0].startswith('hôte')); ne = len(rm) - nh
    L.append(f"| {s['id']:02d} | {s['titre']} | {fmt(a0)[3:]} → {fmt(a1)[3:]} | {acc:.1f} s | {len(P['ivs'])} | "
             f"{nh} mot(s) hôte, {ne} éditorial | pause max {c['plus_longue_pause_s']} s · coupes ≤ {c['coupes_max_dB']} dB · "
             f"{c['loudness_LUFS']} LUFS · visage {c['visage_dans_cadre']:.0%} | {st} |")
L += ['', '## Détail par Short', '']
for s, P, R, c, st, rm, acc, a0, a1, conf, verif in rep:
    L += [f"### Short {s['id']:02d} — {s['titre']}", '',
          f"- Original : {fmt(a0)} → {fmt(a1)} ; durée finale {acc:.2f} s (brut {a1 - a0:.1f} s) ; confiance orateur {conf:.2f}",
          f"- Recadrage (source 4K) : x={R['crop'][0]}, y={R['crop'][1]}, {R['crop'][2]}x{R['crop'][3]} -> 1080x1920",
          f"- Morceaux gardés : " + ', '.join(f"{iv['src0']:.2f}–{iv['src1']:.2f} s" for iv in P['ivs'])]
    if rm: L.append('- Retiré : ' + ', '.join(f"{r[0]} « {r[1]} » ({r[2]:.2f} s)" for r in rm))
    if verif: L.append('- À réécouter : ' + ' ; '.join(sorted({f"{p['t0']:.1f} s « {p['texte']} »" for p in verif})))
    L.append(f"- Contrôles : " + ', '.join(f'{k_}={v}' for k_, v in c.items())); L.append('')
L += ['## Méthode', '',
      '- **Sélection** : 14 idées autonomes choisies dans les réponses de Tiziana (explications complètes, conseils, chiffres, '
      'témoignage), bornées par des phrases d\'ancrage (`pipeline/shorts/shorts.json`). Aucun Short ne commence ni ne finit au milieu d\'une phrase.',
      '- **Uniquement Tiziana** : les relances de l\'hôte au milieu d\'une réponse sont retirées ; les passages exclus du podcast (pôle France) aussi.',
      '- **Silences** : pause > 0,8 s ramenée à ~0,4 s ; coupes placées dans le creux d\'énergie le plus proche, fondus de 8 ms ; pauses courtes conservées ; voix ni accélérée ni modifiée.',
      '- **Cadrage** : recadrage fixe 9:16 centré sur le visage de Tiziana (médiane des détections YuNet sur la durée du Short), plan rapproché poitrine, ~15 % d\'air au-dessus de la tête.',
      '- **Son** : audio original synchronisé, gain seul (loudnorm linéaire -14 LUFS / -1 dBTP). Bruit de fond mesuré à -56 dBFS : aucune réduction de bruit, aucun effet, aucune musique.',
      '- **Sous-titres** : Montserrat ExtraBold, blanc, contour noir 3 px + ombre légère, centrés, 2 lignes max, zone centrale sous le visage (y = 1180/1920), sans animation ni couleur. Corrections de transcription (fautes de reconnaissance évidentes uniquement) : ' +
      ', '.join(f'« {k_} » → « {v} »' for k_, v in CFG['corrections_sous_titres'].items()) + '.']
open(f'{OUT}/editing_report.md', 'w').write('\n'.join(L) + '\n')

# ---------------- speaker_detection_report.md
gt = json.load(open('pipeline/podcast/controle_diarisation.json'))
def acc_key(key):
    ok = n = 0
    for w in W:
        g = next((s_ for a_, b_, s_, *_ in gt if a_ <= (w['t0'] + w['t1']) / 2 <= b_), None)
        if g: n += 1; ok += (w[key] == g)
    return ok / n, n
a1_, n_ = acc_key('spk'); a2_, _ = acc_key('spk2')
FA = np.array(json.load(open('work/visual.json'))['faces']['gauche'])
tiz = [p for p in PH if p['spk'] == 'invite']; host = [p for p in PH if p['spk'] != 'invite']
S = ['# Identification de l\'orateur — Tiziana', '',
     '**Tiziana = la femme aux cheveux longs assise à GAUCHE de l\'image d\'origine.**', '',
     '## Piste visuelle', '',
     f"- Détecteur de visages YuNet (OpenCV), toutes les 0,5 s sur la vidéo entière : visage gauche détecté sur "
     f"{len(FA)} des 2 143 instants analysés ({len(FA) / 2143:.1%}), score médian {np.median(FA[:, 5]):.2f}.",
     f"- Position médiane du visage de Tiziana : x = {np.median(FA[:, 1]):.3f}, y = {np.median(FA[:, 2]):.3f} (fraction de l'image), "
     f"hauteur {np.median(FA[:, 4]) * 2160:.0f} px dans le 4K. Il n'y a qu'une caméra fixe : le suivi est continu.",
     '- Mouvement des lèvres mesuré à 10 i/s dans la zone de la bouche (repères YuNet) pour chaque personne.', '',
     '## Correspondance voix ↔ visage', '',
     '- Empreintes vocales WeSpeaker ResNet34 (ONNX), regroupées en 2 voix (k-means).',
     '- Le cluster dont l\'activité coïncide avec les lèvres de GAUCHE est attribué à Tiziana '
     '(corrélation voix / lèvres 0,645 ; un cluster = l\'autre participante à droite).',
     '- Affinage phrase par phrase : empreinte calculée exactement sur chaque phrase (pauses ≥ 0,15 s ou ponctuation), '
     'point de rupture détecté quand deux voix s\'enchaînent sans pause, croisement avec les lèvres ; '
     'phrase **à vérifier** si audio et lèvres se contredisent ou si l\'audio hésite.', '',
     '## Résultats', '',
     f"- Contrôle sur {n_} mots annotés à la main : diarisation globale {a1_:.1%}, affinage phrase par phrase {a2_:.1%} "
     "(l'affinage corrige surtout les relances courtes « D'accord », « Très bien », « Oui, c'est très clair » que l'annotation large range du mauvais côté).",
     f"- Phrases : {len(PH)} au total, {len(tiz)} attribuées à Tiziana ({sum(p['t1'] - p['t0'] for p in tiz):.0f} s), "
     f"{len(host)} à l'autre participante ({sum(p['t1'] - p['t0'] for p in host):.0f} s), {sum(p['a_verifier'] for p in PH)} signalées à vérifier.",
     '', '## Prises de parole de Tiziana (≥ 4 s)', '', '| Début | Fin | Durée | Confiance | Texte |', '|---|---|---|---|---|']
turns = []
for p in PH:
    if turns and turns[-1]['spk'] == p['spk'] and p['t0'] - turns[-1]['t1'] < 1.5:
        turns[-1]['t1'] = p['t1']; turns[-1]['c'].append(p['conf']); turns[-1]['txt'] += ' ' + p['texte']
    else: turns.append({'spk': p['spk'], 't0': p['t0'], 't1': p['t1'], 'c': [p['conf']], 'txt': p['texte']})
for t in turns:
    if t['spk'] == 'invite' and t['t1'] - t['t0'] >= 4:
        S.append(f"| {fmt(t['t0'])[3:]} | {fmt(t['t1'])[3:]} | {t['t1'] - t['t0']:.1f} s | {np.mean(t['c']):.2f} | {clean(t['txt'])[:90]}… |")
S += ['', '## Segments signalés pour vérification manuelle', '', '| Temps | Attribué à | Audio | Lèvres | Texte |', '|---|---|---|---|---|']
for p in PH:
    if p['a_verifier']: S.append(f"| {fmt(p['t0'])[3:]} | {'Tiziana' if p['spk'] == 'invite' else 'autre participante'} | {p['audio']:+.2f} | {p['levres']:+.1f} | {clean(p['texte'])} |")
open(f'{OUT}/speaker_detection_report.md', 'w').write('\n'.join(S) + '\n')

# ---------------- transcription.md
T = ['# Transcription complète (français, horodatage mot à mot dans work/shorts/words_tiz.json)', '',
     'Whisper large-v3-turbo (faster-whisper, CPU). **TIZIANA** = invitée (à gauche) ; **HÔTE** = l\'autre participante. '
     '« ⏸ » = silence ≥ 1,5 s ; ✂ = passage exclu du montage (faux départs, aparté, pôle France).', '']
ST = json.load(open('pipeline/podcast/structure.json')); ED = [c for c in ST['coupes'] + ST.get('coupes_supplementaires', [])]
prev = None
for t in turns:
    if prev is not None and t['t0'] - prev > 1.5: T.append(f"⏸ *silence {t['t0'] - prev:.1f} s*"); T.append('')
    cut = any(c['t0'] <= (t['t0'] + t['t1']) / 2 <= c['t1'] for c in ED)
    T.append(f"**[{fmt(t['t0'])[3:]} → {fmt(t['t1'])[3:]}] {'TIZIANA' if t['spk'] == 'invite' else 'HÔTE'}**{' ✂' if cut else ''} — {clean(t['txt'])}")
    T.append(''); prev = t['t1']
open(f'{OUT}/transcription.md', 'w').write('\n'.join(T) + '\n')

# ---------------- contact_sheet.png
tiles = []
fnt = ImageFont.truetype('fonts/Montserrat-XB.ttf', 22)
for s, P, R, c, st, rm, acc, a0, a1, conf, verif in rep:
    sid = f"short_{s['id']:02d}"; png = f"work/shorts/{sid}/cs.png"
    cs = R['cartes']; tt = cs[len(cs) // 3]['t0'] + 0.3 if cs else acc / 2
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{tt:.2f}', '-i', f'{OUT}/{sid}/{sid}.mp4', '-frames:v', '1', '-vf', 'scale=324:576', png], check=True)
    im = Image.open(png).convert('RGB'); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 324, 34], fill=(0, 0, 0)); d.text((8, 5), f"{s['id']:02d} · {acc:.0f} s", font=fnt, fill='white')
    tiles.append(im)
cols = 7; rows_n = (len(tiles) + cols - 1) // cols
sheet = Image.new('RGB', (cols * 324, rows_n * 576), (20, 20, 20))
for i, im in enumerate(tiles): sheet.paste(im, ((i % cols) * 324, (i // cols) * 576))
sheet.save(f'{OUT}/contact_sheet.png')
print(json.dumps({k: v['statut'] for k, v in qc.items()}, ensure_ascii=False, indent=1))
