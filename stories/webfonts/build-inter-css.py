#!/usr/bin/env python3
"""Génère webfonts/inter.css : Inter (Google Fonts) embarqué en base64 (woff2)."""
import base64, pathlib

HERE = pathlib.Path(__file__).parent
SUBSETS = [
    ("latin-ext", "inter-latin-ext.woff2",
     "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, "
     "U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, "
     "U+2113, U+2C60-2C7F, U+A720-A7FF"),
    ("latin", "inter-latin.woff2",
     "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, "
     "U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, "
     "U+FEFF, U+FFFD"),
]

out = ["/* Inter — Google Fonts (SIL Open Font License 1.1), embarqué en base64.",
       "   Régénérer avec : bash webfonts/fetch-inter.sh */", ""]
for name, filename, ranges in SUBSETS:
    data = base64.b64encode((HERE / filename).read_bytes()).decode()
    out.append(f"/* {name} */\n@font-face {{\n"
               f"  font-family: 'Inter';\n  font-style: normal;\n"
               f"  font-weight: 300 900;\n  font-display: block;\n"
               f"  src: url(data:font/woff2;base64,{data}) format('woff2');\n"
               f"  unicode-range: {ranges};\n}}\n")
(HERE / "inter.css").write_text("\n".join(out), encoding="utf-8")
print("inter.css:", (HERE / "inter.css").stat().st_size, "octets")
