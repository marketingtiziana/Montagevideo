# Writes the sandbox script that assembles the delivery from the rendered 60 fps parts:
#   concat (stream copy) -> + audio/score.wav -> master 60 fps (H.264 ~12 Mb/s, AAC 192k, faststart)
#   -> master 30 fps fallback (10 Mb/s) -> draft 540x960 -> 720p preview -> contact sheet (higgsedit sheet) ; every file is PUT + ffprobed.
# usage: python3 tools/assemble.py PARTS_JSON SCORE_URL OUT_SLOTS_JSON > assemble.sh
import json, sys
parts, score, outs = json.load(open(sys.argv[1])), sys.argv[2], json.load(open(sys.argv[3]))
keys = sorted(parts, key=lambda r: float(r.split(":")[0]))
put = lambda f, url, ct: f"curl -sS -o /dev/null -w 'PUT {f} %{{http_code}}\\n' -X PUT -H 'Content-Type: {ct}' -H 'If-None-Match: *' --data-binary @{f} '{url}'"
probe = lambda f: f"ffprobe -v error -show_entries stream=codec_name,width,height,r_frame_rate,bit_rate,sample_rate,channels -show_entries format=duration,bit_rate -of compact {f}"
L = ["set -e", "mkdir -p /home/user/w4/out && cd /home/user/w4/out", "rm -f concat.txt"]
for i, r in enumerate(keys):
    L.append(f"[ -s p{i}.mp4 ] || curl -sSf -o p{i}.mp4 '{parts[r]['url']}'; echo \"file 'p{i}.mp4'\" >> concat.txt")
L += [f"[ -s score.wav ] || curl -sSf -o score.wav '{score}'",
      "ffmpeg -v error -y -f concat -safe 0 -i concat.txt -c copy video60.mp4",
      "ffmpeg -v error -y -i video60.mp4 -i score.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -ar 48000 -t 57 -movflags +faststart master60.mp4",
      "ffmpeg -v error -y -i master60.mp4 -vf fps=30 -c:v libx264 -preset slow -b:v 10M -maxrate 12M -bufsize 20M -pix_fmt yuv420p -profile:v high "
      "-c:a copy -movflags +faststart master30.mp4",
      "ffmpeg -v error -y -i master60.mp4 -vf scale=540:960,fps=30 -c:v libx264 -crf 26 -preset fast -c:a aac -b:a 128k -movflags +faststart draft.mp4",
      "ffmpeg -v error -y -i master60.mp4 -vf scale=720:1280,fps=30 -c:v libx264 -crf 24 -preset fast -c:a aac -b:a 128k -movflags +faststart preview.mp4",
      probe("master60.mp4"), probe("master30.mp4"),
      "ffmpeg -hide_banner -nostats -i master60.mp4 -filter_complex ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E 'I:|Peak:|LRA:'",
      put("master60.mp4", outs["master60"], "video/mp4"), put("master30.mp4", outs["master30"], "video/mp4"),
      put("draft.mp4", outs["draft"], "video/mp4"), put("preview.mp4", outs["preview"], "video/mp4"),
      # contact sheet: Higgsedit's own sheet of the edited project at one time per screen
      f"cd /home/user/w4 && higgsedit sheet reel --times {outs['times']} --out renders/contact.png --cols 6 2>&1 | tail -2",
      "python3 -c \"from PIL import Image;Image.open('reel/renders/contact.png').convert('RGB').save('out/contact.jpg',quality=88)\"",
      put("out/contact.jpg", outs["contact"], "image/jpeg"), "echo assembled"]
print("\n".join(L))
