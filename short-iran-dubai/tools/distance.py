#!/usr/bin/env python3
"""G1 — distance grand cercle Dubaï -> côte continentale iranienne (Natural Earth 10m).

Usage: python3 -I tools/distance.py path/to/ne_10m_admin_0_countries.geojson
Source GeoJSON : https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_admin_0_countries.geojson
"""
import json, sys
from math import radians, sin, cos, asin, sqrt

R = 6371.0088  # km, rayon moyen IUGG


def hav(lat1, lon1, lat2, lon2):
    a, b, c, d = map(radians, (lat1, lon1, lat2, lon2))
    return 2 * R * asin(sqrt(sin((c - a) / 2) ** 2 + cos(a) * cos(c) * sin((d - b) / 2) ** 2))


POINTS = [
    (25.07725, 55.30927, "Dubai (GeoNames 292223)"),
    (25.2532, 55.3657, "DXB airport"),
    (25.1972, 55.2744, "Burj Khalifa"),
]


def main(path):
    d = json.load(open(path))
    iran = next(f for f in d["features"] if f["properties"].get("ADMIN") == "Iran")
    g = iran["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    rings = [p[0] for p in polys]
    mainland = max(rings, key=len)
    for lat, lon, name in POINTS:
        any_km = min(hav(lat, lon, y, x) for r in rings for x, y in r)
        main_km = min(hav(lat, lon, y, x) for x, y in mainland)
        print(f"{name:28s} continent: {main_km:6.1f} km | polygone le plus proche (îles incl.): {any_km:6.1f} km")


if __name__ == "__main__":
    main(sys.argv[1])
