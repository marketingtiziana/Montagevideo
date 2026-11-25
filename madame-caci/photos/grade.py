# Étalonnage commun et léger (aucune retouche du visage) : contraste, saturation, légère chaleur.
import os, json
from PIL import Image, ImageEnhance
D = os.path.dirname(os.path.abspath(__file__)); src = os.path.join(D, 'originales'); dst = os.path.join(D, 'traitees'); os.makedirs(dst, exist_ok=True)
SAT = {'jardin-voyage.jpg': .80}
meta = {}
for f in sorted(os.listdir(src)):
    im = Image.open(os.path.join(src, f)).convert('RGB')
    im = ImageEnhance.Contrast(im).enhance(1.04)
    im = ImageEnhance.Color(im).enhance(SAT.get(f, .90))
    r, g, b = im.split(); r = r.point(lambda v: min(255, int(v * 1.025))); b = b.point(lambda v: int(v * .965))
    im = Image.merge('RGB', (r, g, b)); im.save(os.path.join(dst, f), quality=92)
    meta[f[:-4]] = im.size
json.dump(meta, open(os.path.join(D, 'photos.json'), 'w'), indent=1); print(meta)
