# old (v1 timeline, scene authored) -> new (current timeline) anchors, generated from segments_v1.json + segments.json
import json
v1=json.load(open('work/segments_v1.json')); nw=json.load(open('work/segments.json'))
def old_to_src(t):
    for s in v1:
        if s['out_in']-1e-6 <= t <= s['out_in']+s['dur']+1e-6: return s['src_in']+(t-s['out_in'])
    return None
def src_to_new(x):
    for s in nw:
        if s['src_in']-1e-6 <= x <= s['src_out']+1e-6: return s['out_in']+(x-s['src_in'])
    # not kept: snap to the nearest following segment start (or previous end)
    after=[s for s in nw if s['src_in']>x]
    if after: return min(after,key=lambda s:s['src_in'])['out_in']
    last=max(nw,key=lambda s:s['src_out']); return last['out_in']+last['dur']
# hook (different take in v1): manual word anchors
A=[(0,0),(1.06,0.98),(1.34,1.56),(2.10,2.32),(2.28,2.46),(3.24,3.30),(4.12,3.90),(4.62,4.40),(5.20,4.52),(5.82,5.06),(6.34,5.70),(6.84,6.00),(7.38,6.40),(7.70,6.72),(8.06,6.98),(8.34,7.22),(8.58,7.40),(8.633,7.70)]
t=8.7
while t<=85.63+1e-6:
    x=old_to_src(t)
    if x is not None: A.append((round(t,3),round(src_to_new(x),3)))
    t+=0.1
A=[p for i,p in enumerate(A) if i==0 or p[1]>=A[i-1][1]]
json.dump(A,open('work/remap.json','w'))
open('scene/remap.js','w').write('window.REMAP='+json.dumps(A)+';\n')
def R(t):
    if t<=A[0][0]: return A[0][1]
    for i in range(1,len(A)):
        if t<=A[i][0]:
            a0,b0=A[i-1]; a1,b1=A[i]
            return b1 if a1==a0 else b0+(b1-b0)*(t-a0)/(a1-a0)
    return A[-1][1]+(t-A[-1][0])
if __name__=='__main__':
    print(len(A),'anchors')
    for t in [0,8.08,9.0,12.8,18.6,21.1,30.0,30.5,42.06,55.7,61.0,80.8,85.63]: print(t,'->',round(R(t),3))
