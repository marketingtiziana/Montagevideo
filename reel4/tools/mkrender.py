# Writes the Higgsfield sandbox command for one pass. The sandbox is ephemeral, so every pass re-checks its media cache (.url markers).
# usage: python3 tools/mkrender.py MODE PUT_URL [TIMES|RANGE] > bundle.sh
#   MODE = frames (contact sheet jpg) | draft (540p mp4) | part (60 fps master range "a:b") | prep (media only)
# The bundle embeds edit.jsx and the flag PNGs; it is PUT to a Higgsfield text slot and run with `curl <cdn> -o b.sh && bash b.sh`.
import base64, json, os, sys, zlib
mode, put_url = sys.argv[1], sys.argv[2]
arg = sys.argv[3] if len(sys.argv) > 3 else ""
SP = os.environ.get("R4_SCRATCH", "/tmp/claude-0/-home-user-Montagevideo/fd49d8bc-9a76-5cba-9ccb-d2e7af863828/scratchpad/r4")
J = json.load(open("data/jobs.json")); P = json.load(open("data/picks.json"))
up = J.get("upscaled", {})
L = ["set -e", "mkdir -p /home/user/w4/u /home/user/w4/c /home/user/w4/flags /home/user/w4/book && cd /home/user/w4", "t0=$(date +%s)"]
ok = lambda f: f"ffprobe -v error -show_entries format=duration -of csv=p=0 {f} >/dev/null 2>&1"
# 1) shots: the Higgsfield upscale (bytedance, 1080p, 60 fps) when it exists, else the conformed clip interpolated to 60 fps (minterpolate)
for k, o in P.items():
    if k in up:
        L.append(f"echo '{up[k]}' > u/{k}.url; if ! cmp -s u/{k}.url u/{k}.done 2>/dev/null; then (curl -sSf -o u/{k}.mp4 '{up[k]}' && cp u/{k}.url u/{k}.done) & fi")
    else:
        land = o["w"] > o["h"]
        crop = f"crop=ih*9/16:ih:(iw-ow)*{o['fx']}:0," if land else ""
        L.append(f"if [ ! -s c/{k}.mp4 ]; then ffmpeg -v error -y -threads 2 -ss {o['ss']} -t {o['t']} -user_agent Mozilla/5.0 -i '{o['file']}' -an "
                 f"-vf '{crop}scale=1080:1920:flags=lanczos,setsar=1' -c:v libx264 -crf 15 -preset fast -pix_fmt yuv420p c/{k}.mp4; fi")
        if os.environ.get("FAST"):   # preview passes only: no interpolation yet
            L.append(f"echo 'cp:{k}' > u/{k}.url; if ! cmp -s u/{k}.url u/{k}.done 2>/dev/null; then cp c/{k}.mp4 u/{k}.mp4 && cp u/{k}.url u/{k}.done; fi")
        else:
            L.append(f"echo 'mi:{k}' > u/{k}.url; if ! cmp -s u/{k}.url u/{k}.done 2>/dev/null; then (ffmpeg -v error -y -threads 2 -i c/{k}.mp4 -vf 'minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:vsbmc=1' "
                     f"-c:v libx264 -crf 15 -preset fast -pix_fmt yuv420p u/{k}.mp4 && cp u/{k}.url u/{k}.done) & fi")
S15 = os.environ.get("S15_PUT")   # one-off: re-upload the conformed s15 (its first upload failed with HTTP 520)
if S15: L.append(f"[ -f c/s15.put ] || (curl -sS -o /dev/null -w 's15 PUT %{{http_code}}\n' -X PUT -H 'Content-Type: video/mp4' -H 'If-None-Match: *' --data-binary @c/s15.mp4 '{S15}' && touch c/s15.put)")
L.append("wait")
# 2) CTA background: slow-mo AFTER interpolation (0.5x, re-interpolated back to 60 fps)
L.append("echo \"$(cat u/s21.url)|slow\" > u/s21slow.url; if ! cmp -s u/s21slow.url u/s21slow.done 2>/dev/null; then "
         "ffmpeg -v error -y -threads 4 -i u/s21.mp4 -vf '" + ("setpts=2.0*PTS,fps=60" if os.environ.get("FAST") else "setpts=2.0*PTS,minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:vsbmc=1") + "' -t 6.6 "
         "-c:v libx264 -crf 15 -preset fast -pix_fmt yuv420p u/s21slow.mp4 && cp u/s21slow.url u/s21slow.done; fi")
# 3) book mockup (.mov ProRes 4444 with alpha, rendered locally from mockups/codex_book)
if J.get("book_url"):
    L.append(f"echo '{J['book_url']}' > book/b.url; if ! cmp -s book/b.url book/b.done 2>/dev/null; then curl -sSf -o book/codex_book.mov '{J['book_url']}' && cp book/b.url book/b.done; fi")
for k, o in J.get("mattes_used", {}).items():
    L.append(f"echo '{o}' > u/matte_{k}.url; if ! cmp -s u/matte_{k}.url u/matte_{k}.done 2>/dev/null; then curl -sSf -o u/matte_{k}.mp4 '{o}' && cp u/matte_{k}.url u/matte_{k}.done; fi")
# 4) flags (flag-icons, MIT) as embedded PNGs
for c in ("ee", "ae", "us", "sg", "hk"):
    L.append(f"echo '{base64.b64encode(open(f'{SP}/flagpng/{c}.png', 'rb').read()).decode()}' | base64 -d > flags/{c}.png")
L.append("for f in u/*.mp4; do " + ok("$f") + " || { echo BAD $f; exit 3; }; done")
L.append("echo media ready $(( $(date +%s) - t0 ))s")
if mode == "prep":
    L.append("ls -la u book flags | head -40")
else:
    L += ["[ -d reel ] || (higgsedit new reel --size 1080x1920 --fps 60 >/dev/null && higgsedit fonts add reel 'Montserrat:600' 'Montserrat:800' 'Montserrat:900' >/dev/null)",
          "cat > edit.jsx <<'EDIT_JSX_EOF'", open("edit.jsx").read().rstrip("\n"), "EDIT_JSX_EOF"]
    if mode == "frames":
        L += [f"rm -f reel/renders/f_*.png; REEL_MODE=frames {'REEL_TIMES=' + arg + ' ' if arg else ''}higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -6",
              "cd reel/renders && python3 -c \"import glob;from PIL import Image,ImageDraw;fs=sorted(glob.glob('f_*.png'),key=lambda s:float(s[2:-4]));"
              "ims=[Image.open(f).convert('RGB').resize((360,640)) for f in fs];c=5;r=-(-len(ims)//c);sh=Image.new('RGB',(360*c,640*r));"
              "[(sh.paste(im,((i%c)*360,(i//c)*640)),ImageDraw.Draw(sh).text(((i%c)*360+6,(i//c)*640+6),fs[i][2:-4],fill='yellow')) for i,im in enumerate(ims)];sh.save('frames.jpg',quality=85);print(len(fs))\"",
              f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: image/jpeg' -H 'If-None-Match: *' --data-binary @frames.jpg '{put_url}'"]
    elif mode == "draft":
        L += ["REEL_MODE=draft higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -6", "ls -la reel/renders/draft.mp4",
              f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: video/mp4' -H 'If-None-Match: *' --data-binary @reel/renders/draft.mp4 '{put_url}'"]
    elif mode == "parts":   # 60 fps master in ranges (2 workers: 4 workers run the 8 GB sandbox out of memory); arg "a:b,c:d", PUT urls comma-separated
        L.append("REEL_MODE=none higgsedit build edit.jsx 2>&1 | grep -v '^    at ' | tail -3")
        for rng, url in zip(arg.split(","), put_url.split(",")):
            a, b = rng.split(":")
            out = f"renders/part_{a}_{b}.mp4"
            L += [f"[ -s reel/{out}.ok ] || {{ higgsedit render reel --range {a}:{b} --shards 2 --concurrency 2 --bitrate 12M --out {out} 2>&1 | grep -v '^    at ' | tail -4; "
                  f"ffprobe -v error -show_entries stream=nb_frames,r_frame_rate -of csv=p=0 reel/{out} && "
                  f"curl -sS -o /dev/null -w 'PUT {a}:{b} %{{http_code}}\\n' -X PUT -H 'Content-Type: video/mp4' -H 'If-None-Match: *' --data-binary @reel/{out} '{url}' && echo ok > reel/{out}.ok; }}"]
L.append("echo done $(( $(date +%s) - t0 ))s")
print("\n".join(L))
