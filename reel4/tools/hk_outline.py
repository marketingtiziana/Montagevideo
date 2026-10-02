# Hong Kong outline from Natural Earth 10m admin-0 (public domain) -> SVG path (M/L/Z only) in a 300x260 box, equirectangular with cos(22.3°).
import json, math, sys
from shapely.geometry import shape
g = next(f for f in json.load(open(sys.argv[1]))["features"] if f["properties"].get("ADM0_A3") == "HKG")
geom = shape(g["geometry"]).simplify(0.002)
k = math.cos(math.radians(22.3))
polys = list(geom.geoms) if geom.geom_type == "MultiPolygon" else [geom]
polys = [p for p in polys if p.area > 2e-5]
xs = [x * k for p in polys for x, y in p.exterior.coords]; ys = [y for p in polys for x, y in p.exterior.coords]
W, H, PAD = 300, 260, 6
s = min((W - 2 * PAD) / (max(xs) - min(xs)), (H - 2 * PAD) / (max(ys) - min(ys)))
X = lambda x: PAD + (x * k - min(xs)) * s
Y = lambda y: PAD + (max(ys) - y) * s
d = " ".join("M" + " L".join(f"{X(x):.1f} {Y(y):.1f}" for x, y in p.exterior.coords) + " Z" for p in polys)
pin = (X(114.1694), Y(22.2793))   # Central, Hong Kong Island
json.dump({"W": W, "H": H, "d": d, "pin": [round(pin[0], 1), round(pin[1], 1)], "source": "Natural Earth 10m admin-0 (public domain)"},
          open("data/hk_outline.json", "w"))
print(len(polys), "polys", len(d), "chars", pin)
