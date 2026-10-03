# Search Pexels videos for each query; keep HD+, record author/url/licence. Key read from scratchpad (never committed).
import json, os, sys, urllib.request, urllib.parse
KEY = open(os.environ["PEXELS_KEY_FILE"]).read().strip()
QUERIES = ["Hong Kong skyline night", "Victoria Harbour", "Hong Kong tram", "Star Ferry", "Hong Kong container port aerial", "Central Hong Kong street night", "Victoria Peak", "Hong Kong neon street rain", "Hong Kong aerial drone", "Hong Kong bridge aerial",
           "Dubai skyline", "Dubai highway night", "Marina Bay Singapore", "Singapore night skyline", "Tallinn old town", "Estonia drone", "Tallinn aerial",
           "New York skyline", "Manhattan aerial", "city lights from airplane night", "world map globe", "laptop documents desk"]
out = {}
for q in QUERIES:
    for orient in ("portrait", "landscape"):
        url = "https://api.pexels.com/videos/search?" + urllib.parse.urlencode({"query": q, "per_page": 15, "orientation": orient, "size": "medium"})
        req = urllib.request.Request(url, headers={"Authorization": KEY, "User-Agent": "Mozilla/5.0 reel-sourcing"})
        data = json.load(urllib.request.urlopen(req, timeout=30))
        for v in data.get("videos", []):
            files = [f for f in v["video_files"] if f.get("width") and f.get("height")]
            best = max(files, key=lambda f: f["width"] * f["height"])
            if min(best["width"], best["height"]) < 1080: continue
            if not (4 <= v["duration"] <= 60): continue
            out.setdefault(v["id"], {"id": v["id"], "queries": [], "url": v["url"], "author": v["user"]["name"], "author_url": v["user"]["url"],
                                     "duration": v["duration"], "w": best["width"], "h": best["height"], "file": best["link"],
                                     "thumb": v["image"], "licence": "Pexels License"})["queries"].append(f"{q}|{orient}")
    print(q, len(out), file=sys.stderr)
json.dump(list(out.values()), open(sys.argv[1], "w"), indent=1)
print(len(out))
