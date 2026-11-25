# Vectorise le logo officiel FYNOVATES (wordmark-3x.png) en SVG fidèle (potrace).
import numpy as np, potrace
from PIL import Image
im=Image.open('brand/wordmark-3x.png'); a=np.array(im)[:,:,3]>127
W,H=im.size
paths=potrace.Bitmap(~a).trace(turdsize=4,alphamax=1.0,opticurve=True,opttolerance=0.2)
d=[]
for c in paths:
    s=c.start_point; d.append(f'M{s.x:.2f},{s.y:.2f}')
    for seg in c.segments:
        if seg.is_corner: d.append(f'L{seg.c.x:.2f},{seg.c.y:.2f}L{seg.end_point.x:.2f},{seg.end_point.y:.2f}')
        else: d.append(f'C{seg.c1.x:.2f},{seg.c1.y:.2f} {seg.c2.x:.2f},{seg.c2.y:.2f} {seg.end_point.x:.2f},{seg.end_point.y:.2f}')
    d.append('Z')
path=''.join(d)
open('brand/wordmark.path','w').write(path)
for name,col in [('navy','#0D082E'),('blanc','#FFFFFF')]:
    open(f'brand/fynovates-logo-{name}.svg','w').write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><title>FYNOVATES</title><path fill="{col}" fill-rule="evenodd" d="{path}"/></svg>')
print(W,H,len(path))
