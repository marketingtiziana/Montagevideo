# Writes the Higgsfield sandbox script for one pass (the sandbox is ephemeral: media are re-fetched when missing).
# usage: python3 tools/mkbundle.py MODE PUT_URL [TIMES] > bundle.sh     MODE = frames | draft | master
# The script embeds edit.jsx; it is PUT to a Higgsfield text slot and run with `curl <cdn> -o b.sh && bash b.sh`.
import sys
mode, put = sys.argv[1], sys.argv[2]
times = sys.argv[3] if len(sys.argv) > 3 else ""
CDN = "https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/"
MEDIA = {"cut.mp4": CDN + "c3c286fd-084e-4b1a-b0e9-47bd20abf375.mp4", "phone_tuto.mov": CDN + "f56742f4-1ea3-4e38-8991-a5cf60ef5842.mp4"}
L = ["set -e", "mkdir -p /home/user/w5 && cd /home/user/w5", "t0=$(date +%s)"]
for f, u in MEDIA.items():
    L.append(f"[ -s {f} ] || curl -sSf -o {f} '{u}'")
L += ["[ -d reel ] || (higgsedit new reel --size 1080x1920 --fps 30 >/dev/null && higgsedit fonts add reel 'Montserrat:600' 'Montserrat:800' >/dev/null)",
      "ls reel/fonts", "cat > edit.jsx <<'EDIT_JSX_EOF'", open("edit.jsx").read().rstrip("\n"), "EDIT_JSX_EOF"]
if mode == "frames":
    L += [f"rm -f reel/renders/f_*.png; REEL_MODE=frames {'REEL_TIMES=' + times + ' ' if times else ''}higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -8",
          "cd reel/renders && python3 -c \"import glob;from PIL import Image,ImageDraw;fs=sorted(glob.glob('f_*.png'),key=lambda s:float(s[2:-4]));"
          "ims=[Image.open(f).convert('RGB').resize((360,640)) for f in fs];c=6;r=-(-len(ims)//c);sh=Image.new('RGB',(360*c,640*r),'white');"
          "[(sh.paste(im,((i%c)*360,(i//c)*640)),ImageDraw.Draw(sh).text(((i%c)*360+6,(i//c)*640+6),fs[i][2:-4],fill='red')) for i,im in enumerate(ims)];sh.save('frames.jpg',quality=85);print(len(fs))\"",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: image/jpeg' -H 'If-None-Match: *' --data-binary @frames.jpg '{put}'"]
elif mode == "sheet":     # contact sheet of the edited project: hook + one frame per scene + end card
    L += ["REEL_MODE=none higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -3",
          f"higgsedit sheet reel --times {times} --out renders/contact.png --cols 6 2>&1 | tail -2",
          "python3 -c \"from PIL import Image;Image.open('reel/renders/contact.png').convert('RGB').save('contact.jpg',quality=88)\"",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: image/jpeg' -H 'If-None-Match: *' --data-binary @contact.jpg '{put}'"]
else:
    out = "draft" if mode == "draft" else "master"
    L += [f"REEL_MODE={mode} higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -6",
          f"ffmpeg -v error -y -i reel/renders/{out}.mp4 -i cut.mp4 -map 0:v -map 1:a -c:v copy -af apad -t {{DUR}} -c:a aac -b:a 192k -ar 48000 -movflags +faststart {out}_final.mp4",
          f"ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,bit_rate -show_entries format=duration,bit_rate -of compact {out}_final.mp4",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: video/mp4' -H 'If-None-Match: *' --data-binary @{out}_final.mp4 '{put}'"]
L.append("echo done $(( $(date +%s) - t0 ))s")
import json
dur = json.load(open("cuts.json"))["duration"] + 2.0
print("\n".join(L).replace("{DUR}", f"{dur:.3f}"))
