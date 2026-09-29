# Writes the Higgsfield sandbox command for one render pass (the sandbox is ephemeral: every pass re-downloads and re-normalises its media).
# usage: python3 tools/mkrender.py MODE - PUT_URL [TIMES] > bundle.sh    MODE = frames | draft | master
# The bundle embeds edit.jsx; it is uploaded to a Higgsfield file slot and the sandbox runs `curl -s <cdn url> | bash`.
import json, sys, zlib
mode, edit_url, put_url = sys.argv[1:4]
times = sys.argv[4] if len(sys.argv) > 4 else ""
R = json.load(open("data/results.json"))
for k, v in {"t121": "t120", "c35": "c31"}.items(): R.setdefault(k, R[v])   # placeholders until the late jobs land
shots = json.load(open("shots.json"))
need = {s["file"] for s in shots.values()}
# Pexels (tournés en Andorre): 4K 16:9 -> 9:16 crop at x fraction, trimmed to the used range, 30 fps
PX = {"pxroad.mp4": ("https://videos.pexels.com/video-files/34368610/14559697_3840_2160_30fps.mp4", 3.0, 2.2, 0.25),
      "pxvalley.mp4": ("https://videos.pexels.com/video-files/34368610/14559697_3840_2160_30fps.mp4", 8.0, 3.0, 0.5),
      "pxreveal.mp4": ("https://videos.pexels.com/video-files/35009532/14831195_3840_2160_30fps.mp4", 4.0, 2.2, 0.55),
      "pxbridge.mp4": ("https://videos.pexels.com/video-files/38238599/16236668_3840_2160_25fps.mp4", 2.0, 3.0, 0.72)}
L = ["set -e", "mkdir -p /home/user/w3/src && cd /home/user/w3", "t0=$(date +%s)"]
ok = lambda f: f"ffprobe -v error -show_entries format=duration -of csv=p=0 {f} >/dev/null 2>&1"
for f in sorted(need):
    if f in PX: continue
    key = ("c" + f[1:3]) if f.startswith("i") else f[:4]
    L.append(f"echo '{R[key]}' > src/{f}.url; if ! cmp -s src/{f}.url src/{f}.done 2>/dev/null; then (curl -sSf -o src/{f} '{R[key]}' && cp src/{f}.url src/{f}.done && rm -f {f}) & fi")
for u in sorted({v[0] for v in PX.values()}):
    n = u.split('/')[-2]
    L.append(f"{ok('src/' + n + '.mp4')} || curl -sSf -A 'Mozilla/5.0' -o src/{n}.mp4 '{u}' &")
L.append("wait")
VF = "scale=1080:1920:flags=lanczos,fps=30,setsar=1"
L.append("rm -f jobs.txt")
for f in sorted(need):
    if f in PX:
        u, ss, t, fx = PX[f]
        cmd = f"ffmpeg -v error -y -threads 2 -ss {ss} -t {t} -i src/{u.split('/')[-2]}.mp4 -an -vf 'crop=ih*9/16:ih:(iw-ow)*{fx}:0,{VF}' -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p {f}"
    else:
        pre = "crop=iw*0.86:ih*0.86:iw*0.07:0," if f == "t121.mp4" else ""   # t121: drop a green lens artefact near the bottom edge
        cmd = f"ffmpeg -v error -y -threads 2 -i src/{f} -an -vf '{pre}{VF}' -c:v libx264 -crf 14 -preset fast -pix_fmt yuv420p {f}"
    h = zlib.crc32(cmd.encode())   # re-encode only when the command changed
    L.append(f"(grep -qxF '{h}' {f}.cmd 2>/dev/null && {ok(f)}) || {{ echo \"{cmd}\" >> jobs.txt; echo '{h}' > {f}.cmd; }}")
L.append("if [ -f jobs.txt ]; then tr '\\n' '\\0' < jobs.txt | xargs -0 -P 4 -n 1 sh -c; fi")
L.append("for f in " + " ".join(sorted(need)) + f"; do {ok('$f')} || {{ echo BAD $f; exit 3; }}; done")
L.append("echo media ready $(( $(date +%s) - t0 ))s")
L += ["[ -d reel ] || (higgsedit new reel --size 1080x1920 --fps 30 >/dev/null && higgsedit fonts add reel 'Montserrat:800' 'Montserrat:600' >/dev/null)",
      "cat > edit.jsx <<'EDIT_JSX_EOF'", open("edit.jsx").read().rstrip("\n"), "EDIT_JSX_EOF"]
if mode == "frames":
    L += [f"REEL_MODE=frames {'REEL_TIMES=' + times + ' ' if times else ''}higgsedit build edit.jsx 2>&1 | tail -5",
          "cd reel/renders && python3 -c \"import glob;from PIL import Image;fs=sorted(glob.glob('f_*.png'),key=lambda s:float(s[2:-4]));ims=[Image.open(f).convert('RGB').resize((270,480)) for f in fs];c=6;r=-(-len(ims)//c);sh=Image.new('RGB',(270*c,480*r));[sh.paste(im,((i%c)*270,(i//c)*480)) for i,im in enumerate(ims)];sh.save('frames.jpg',quality=88);print(len(fs))\"",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: image/jpeg' -H 'If-None-Match: *' --data-binary @frames.jpg '{put_url}'"]
elif mode.startswith("master"):   # masterA / masterB: half of the timeline each (a full 1080p pass does not fit one sandbox lease)
    a, b = (0, 27) if mode == "masterA" else (27, 54)
    L += ["REEL_MODE=none higgsedit build edit.jsx 2>&1 | tail -3",
          f"higgsedit render reel --range {a}:{b} --bitrate 12M --out reel/renders/{mode}.mp4 2>&1 | tail -4",
          f"ls -la reel/renders/{mode}.mp4",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: video/mp4' -H 'If-None-Match: *' --data-binary @reel/renders/{mode}.mp4 '{put_url}'"]
else:
    L += [f"REEL_MODE={mode} higgsedit build edit.jsx 2>&1 | tail -5",
          f"ls -la reel/renders/{mode}.mp4",
          f"curl -sS -o /dev/null -w 'PUT %{{http_code}}\\n' -X PUT -H 'Content-Type: video/mp4' -H 'If-None-Match: *' --data-binary @reel/renders/{mode}.mp4 '{put_url}'"]
L.append("echo done $(( $(date +%s) - t0 ))s")
print("\n".join(L))
