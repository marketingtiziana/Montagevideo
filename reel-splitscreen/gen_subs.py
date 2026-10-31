import json, re
d=json.load(open('work/words_final.json'))
W=[dict(w) for w in d['words']]
# --- manual fixes (hallucinated restart zone 57.68-58.06 ; 'avouer' -> 'avoir')
fixed=[]
skip=False
for w in W:
    if 57.6 <= w['s'] <= 58.0 and w['w'] in ('la','situation.','Il','faut','regarder'): continue
    if w['w']=='regarder' and abs(w['s']-57.38)<0.05: w['e']=57.90
    if w['w']=='ta' and abs(w['s']-57.96)<0.05: w['s']=57.90
    if w['w']=='avouer.': w['w']='avoir.'
    fixed.append(w)
W=fixed
# --- merge apostrophe / hyphen continuations
M=[]
for w in W:
    if M and (w['w'].startswith("'") or w['w'].startswith("-")):
        M[-1]['w']+=w['w']; M[-1]['e']=w['e']
    elif w['w'] in ('?',):
        M[-1]['w']+=' ?'; M[-1]['e']=w['e']
    else: M.append(dict(w))
W=M
OFF=0.04  # subtitles 40 ms earlier (Whisper onsets measured slightly late)
for w in W: w['s']=max(0.0,w['s']-OFF); w['e']=max(w['s']+0.05,w['e']-OFF)
def clean(t):
    t=t.replace('0%','0 %')
    t=re.sub(r'[.,]+$','',t)
    return t
for w in W: w['t']=clean(w['w'])
STRONG={'étrangère','fiscalité','avoir','Dubaï','Estonie','automatiquement','impôts','résident','fiscal','dirigée','exercée','concrètement','intéressant','internationale','différente','adaptée','étranger','obligations','fiscales','résidence','0 %','ensemble','entrepreneurs','sens','correctement','vérifier','urgence','DM','personnelle','situation'}
for w in W: w['strong']= w['t'].strip('?').strip() in STRONG
SHORT=lambda t: len(t.replace("'",''))<=3 or t.lower() in ("c'est","n'est","qu'une","qu'on","qu'il","t'a","d'abord",'dans','pour','avec','sous','cette','juste','parce','que','pas')
# --- chunking: 1 or 2 words
chunks=[]; i=0
while i<len(W):
    a=W[i]
    if i+1<len(W):
        b=W[i+1]
        gap=b['s']-a['e']
        pair = gap<0.35 and SHORT(a['t']) and not a['strong'] and len(a['t'])+len(b['t'])<=18 and not (a['strong'] and b['strong']) and not a['t'].endswith('?')
        # never pair across sentence end
        if a['w'].endswith(('.', '?')): pair=False
        if pair:
            chunks.append([a,b]); i+=2; continue
    chunks.append([a]); i+=1
# --- timing: chunk visible from first word start to last word end, held until next chunk start if gap<0.5
for k,c in enumerate(chunks):
    st=c[0]['s']; en=c[-1]['e']
    nxt=chunks[k+1][0]['s'] if k+1<len(chunks) else en+0.6
    hold = nxt if nxt-en<0.5 else en+0.25
    c_end=min(hold, nxt)  # avoid overlap
    for w in c: pass
    chunks[k]=dict(words=c, s=st, e=c_end)
json.dump([dict(s=c['s'],e=c['e'],words=[dict(t=w['t'],s=w['s'],e=w['e'],strong=w['strong']) for w in c['words']]) for c in chunks], open('work/chunks.json','w'), ensure_ascii=False, indent=1)
json.dump([dict(t=w['t'],s=w['s'],e=w['e']) for w in W], open('work/words_clean.json','w'), ensure_ascii=False, indent=1)
# --- ASS
def ts(t):
    h=int(t//3600); m=int(t%3600//60); s=t%60
    return f"{h}:{m:02d}:{s:05.2f}"
Y=1735
hdr=f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter ExtraBold,80,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,1,0,1,7,0,5,40,40,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
lines=[]
for c in chunks:
    parts=[]
    for w in c['words']:
        d0=int(round((w['s']-c['s'])*1000)); d1=d0+70
        tgt=112 if w['strong'] else 100
        txt=w['t'].upper()
        if d0<=0:
            parts.append(f"{{\\fscx94\\fscy94\\t(0,70,\\fscx{tgt}\\fscy{tgt})}}{txt}")
        else:
            parts.append(f"{{\\alpha&HFF&\\fscx94\\fscy94\\t({d0},{d0+1},\\alpha&H00&)\\t({d0},{d1},\\fscx{tgt}\\fscy{tgt})}}{txt}")
    text=f"{{\\an5\\pos(540,{Y})}}"+"{\\fscx100\\fscy100\\alpha&H00&} ".join(parts)
    lines.append(f"Dialogue: 0,{ts(c['s'])},{ts(c['e'])},Sub,,0,0,0,,{text}")
open('work/subs.ass','w').write(hdr+"\n".join(lines)+"\n")
print(len(W),'words ->',len(chunks),'chunks;', sum(1 for c in chunks if len(c['words'])==2),'pairs')
for c in chunks[:14]: print(f"{c['s']:6.2f}-{c['e']:6.2f}", " ".join(w['t'].upper() for w in c['words']))
