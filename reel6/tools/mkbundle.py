# Writes the Higgsfield sandbox script for one pass (the sandbox is ephemeral: media are re-fetched when missing).
# usage: python3 tools/mkbundle.py MODE PUT_URL [TIMES] > bundle.sh     MODE = frames | sheet | draft | master | master30
# The script embeds edit.jsx; it is PUT to a Higgsfield text slot and run with `curl <cdn> -o b.sh && bash b.sh`.
import sys, json
mode, put = sys.argv[1], sys.argv[2]
times = sys.argv[3] if len(sys.argv) > 3 else ""
CDN = "https://d2ol7oe51mr4n9.cloudfront.net/user_38f1ll4gSRAstfkHTQ0tBbMqoUI/"
MEDIA = {"cut.mp4": "efa51bd7-d9d4-487b-9983-90d37c16f70f.mp4", "broll_balcon.mp4": "72b7e3a5-a17f-4ef8-9455-4a597ebdcd12.mp4",
         "notification.mov": "571da503-9805-4287-bd3b-b476820f2285.mp4", "impots.png": "e6f4b46d-e7bb-4c07-b06e-610561b2f753.png",
         "urssaf.png": "3454ce2b-0f21-432a-b771-64366ec9502c.png", "urssaf_iphone.png": "f3580db9-b1b6-4214-be38-c063863c9e04.png",
         "onlyfans.png": "89019921-a2a5-485d-baae-d83ff62f2fbc.png", "uk.png": "f210a222-9e07-43fa-a834-0bedfa6add83.png", "fr.png": "09772305-1c11-46b4-9f8c-44c01b8f8921.png"}
L = ["set -e", "mkdir -p /home/user/w6 && cd /home/user/w6", "t0=$(date +%s)"]
for f, u in MEDIA.items():
    L.append(f"[ -s {f} ] && [ {f} != cut.mp4 ] || curl -sSf -o {f} '{CDN}{u}'")
L += ["[ -d reel ] || (higgsedit new reel --size 1080x1920 --fps 60 >/dev/null && higgsedit fonts add reel 'Montserrat:800' 'Inter:400' 'Inter:600' 'Inter:700' >/dev/null)",
      "ls reel/fonts", "cat > edit.jsx <<'EDIT_JSX_EOF'", open("edit.jsx").read().rstrip("\n"), "EDIT_JSX_EOF"]
SHEET = ("cd reel/renders && python3 -c \"import glob,sys;from PIL import Image,ImageDraw;fs=sorted(glob.glob('f_*.png'),key=lambda s:float(s[2:-4]));"
         "ims=[Image.open(f).convert('RGB').resize((360,640)) for f in fs];c=6;r=-(-len(ims)//c);sh=Image.new('RGB',(360*c,640*r),'white');"
         "[(sh.paste(im,((i%c)*360,(i//c)*640)),ImageDraw.Draw(sh).text(((i%c)*360+6,(i//c)*640+6),fs[i][2:-4],fill='red')) for i,im in enumerate(ims)];sh.save('frames.jpg',quality=84);print(len(fs))\"")
if mode == "frames":
    L += [f"rm -f reel/renders/f_*.png; REEL_MODE=frames REEL_TIMES={times} higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -8", SHEET,
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: image/jpeg' -H 'If-None-Match: *' --data-binary @frames.jpg '{put}'"]
elif mode == "sheet":
    L += ["REEL_MODE=none higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -3",
          f"higgsedit sheet reel --times {times} --out renders/contact.png --cols 6 2>&1 | tail -2",
          "python3 -c \"from PIL import Image;Image.open('reel/renders/contact.png').convert('RGB').save('contact.jpg',quality=88)\"",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: image/jpeg' -H 'If-None-Match: *' --data-binary @contact.jpg '{put}'"]
else:
    out = {"draft": "draft", "master": "master"}[mode]
    dur = json.load(open("cuts.json"))["duration"]
    L += [f"REEL_MODE={mode} higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -6",
          f"ffmpeg -v error -y -i reel/renders/{out}.mp4 -i cut.mp4 -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -t {dur:.3f} -movflags +faststart {out}_final.mp4",
          f"ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,bit_rate -show_entries format=duration,bit_rate -of compact {out}_final.mp4",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: video/mp4' -H 'If-None-Match: *' --data-binary @{out}_final.mp4 '{put}'"]
L.append("echo done $(( $(date +%s) - t0 ))s")
print("\n".join(L))
