"""Contact sheet for visual QA. Usage: python3 sources/contact_sheet.py "<glob>" out.jpg [cols] [cell_w] [cell_h]"""
import glob, sys
from PIL import Image, ImageDraw
fs = sorted(glob.glob(sys.argv[1], recursive=True))
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
W = int(sys.argv[4]) if len(sys.argv) > 4 else 300
H = int(sys.argv[5]) if len(sys.argv) > 5 else 400
sh = Image.new('RGB', (cols * W, ((len(fs) + cols - 1) // cols) * (H + 16)), 'white')
d = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f).convert('RGB'); im.thumbnail((W - 6, H - 6))
    x, y = (i % cols) * W, (i // cols) * (H + 16)
    sh.paste(im, (x + 3, y + 3)); d.text((x + 3, y + H + 1), '/'.join(f.split('/')[-3:])[:48], fill='black')
sh.save(sys.argv[2], quality=82)
print(len(fs))
