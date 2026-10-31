# old (v1 timeline, scene authored) -> new (v2 timeline) anchors
import json
A=[(0,0),(1.06,0.98),(1.34,1.56),(2.10,2.32),(2.28,2.46),(3.24,3.30),(4.12,3.90),(4.62,4.40),(5.20,4.52),(5.82,5.06),(6.34,5.70),(6.84,6.00),(7.38,6.40),(7.70,6.72),(8.06,6.98),(8.34,7.22),(8.58,7.40),(8.633,7.70),(9.10,7.70),(11.067,9.70),(85.633,84.267)]
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
    for t in [0,1.0,4.1,8.08,8.5,9.0,12.8,55.7,61.0,80.8,85.6]: print(t,'->',round(R(t),3))
