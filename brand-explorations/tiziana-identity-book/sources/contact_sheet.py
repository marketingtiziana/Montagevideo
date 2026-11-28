"""Contact sheet of rendered visuals for visual QA. Usage: python3 sources/contact_sheet.py <glob> <out.jpg> [cols]"""
import glob, sys
from PIL import Image, ImageDraw
fs = sorted(glob.glob(sys.argv[1], recursive=True))
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 5
W, H = 400, 330
sh = Image.new('RGB', (cols * W, ((len(fs) + cols - 1) // cols) * (H + 18)), 'white')
d = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB'); im.thumbnail((W - 8, H - 8))
    x, y = (i % cols) * W, (i // cols) * (H + 18)
    sh.paste(im, (x + 4, y + 4)); d.text((x + 4, y + H + 2), f.split('/')[-1][:60], fill='black')
sh.save(sys.argv[2], quality=85)
print(len(fs))
