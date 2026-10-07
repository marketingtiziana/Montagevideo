# Writes the Higgsfield sandbox script for one pass (the sandbox is ephemeral: the asset tarball is re-fetched when missing).
# usage: python3 tools/mkbundle.py MODE PUT_URL ASSETS_URL [TIMES] > bundle.sh     MODE = frames | sheet | draft | master
# The script embeds edit.jsx; it is PUT to a Higgsfield text slot and run with `curl <cdn> -o b.sh && bash b.sh`.
import sys, json
mode, put, assets = sys.argv[1], sys.argv[2], sys.argv[3]
times = sys.argv[4] if len(sys.argv) > 4 else ""
DUR = 3449 / 60
L = ["set -e", "mkdir -p /home/user/w7 && cd /home/user/w7", "t0=$(date +%s)",
     f"[ -s base_depth.mp4 ] || (curl -sSf -o assets.tar '{assets}' && tar xf assets.tar && rm assets.tar)", "ls",
     "[ -d reel ] || (higgsedit new reel --size 1080x1920 --fps 60 >/dev/null && higgsedit fonts add reel 'Montserrat:800' 'Montserrat:900' 'Inter:400' 'Inter:600' 'Inter:700' >/dev/null)",
     "ls reel/fonts", "cat > edit.jsx <<'EDIT_JSX_EOF'", open("edit.jsx").read().rstrip("\n"), "EDIT_JSX_EOF"]
SHEET = ("cd reel/renders && python3 -c \"import glob;from PIL import Image,ImageDraw;fs=sorted(glob.glob('f_*.png'),key=lambda s:float(s[2:-4]));"
         "ims=[Image.open(f).convert('RGB').resize((360,640)) for f in fs];c=6;r=-(-len(ims)//c);sh=Image.new('RGB',(360*c,640*r),'white');"
         "[(sh.paste(im,((i%c)*360,(i//c)*640)),ImageDraw.Draw(sh).text(((i%c)*360+6,(i//c)*640+6),fs[i][2:-4],fill='red')) for i,im in enumerate(ims)];sh.save('../../frames.jpg',quality=84);print(len(fs))\" && cd ../..")
if mode == "frames":
    L += [f"rm -f reel/renders/f_*.png; REEL_MODE=frames REEL_TIMES={times} higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -8", SHEET,
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: image/jpeg' -H 'If-None-Match: *' --data-binary @frames.jpg '{put}'"]
elif mode == "sheet":
    L += ["REEL_MODE=none higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -3",
          f"higgsedit sheet reel --times {times} --out renders/contact.png --cols 6 2>&1 | tail -2",
          "python3 -c \"from PIL import Image;Image.open('reel/renders/contact.png').convert('RGB').save('contact.jpg',quality=88)\"",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: image/jpeg' -H 'If-None-Match: *' --data-binary @contact.jpg '{put}'"]
else:
    out = mode
    L += [f"REEL_MODE={mode} higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -6",
          f"ffmpeg -v error -y -i reel/renders/{out}.mp4 -i mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -t {DUR:.4f} -movflags +faststart {out}_final.mp4",
          f"ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,bit_rate -show_entries format=duration,bit_rate -of compact {out}_final.mp4",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: video/mp4' -H 'If-None-Match: *' --data-binary @{out}_final.mp4 '{put}'"]
L.append("echo done $(( $(date +%s) - t0 ))s")
print("\n".join(L))
